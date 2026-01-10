const db = require("../config/db");

/* =====================
   WORKER GET JOB
   - 1 job / 1 worker
   - Auto release assignment treo
   - Trả đủ type: comment / follow / like / share
===================== */
exports.getJobs = async (req, res) => {
    const worker = req.worker;
    const apiKey = req.headers["x-api-key"];
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        /* =====================
           1️⃣ GIẢI PHÓNG ASSIGNMENT TREO
           - chỉ release khi chưa chạy gì
           - timeout 5 phút
        ===================== */
        await conn.execute(`
            UPDATE job_assignments
            SET status = 'rejected'
            WHERE status = 'assigned'
              AND completed = 0
              AND assigned_at < (NOW() - INTERVAL 5 MINUTE)
        `);

        await conn.execute(`
            UPDATE jobs
            SET status = 'pending'
            WHERE status = 'running'
              AND id IN (
                  SELECT job_id
                  FROM job_assignments
                  WHERE status = 'rejected'
              )
        `);

        /* =====================
           2️⃣ LẤY JOB HỢP LỆ
        ===================== */
        const [[job]] = await conn.execute(
            `
            SELECT j.*,
                   s.type AS service_type
            FROM jobs j
            JOIN services s ON s.id = j.service_id
            WHERE j.status IN ('pending','running')
              AND j.completed < j.quantity
              AND NOT EXISTS (
                  SELECT 1
                  FROM job_assignments ja
                  WHERE ja.job_id = j.id
                    AND ja.status = 'assigned'
              )
            ORDER BY j.id ASC
            LIMIT 1
            FOR UPDATE
            `
        );

        if (!job) {
            await conn.rollback();
            return res.json([]);
        }

        const assignQty = job.quantity - job.completed;

        /* =====================
           3️⃣ ASSIGN JOB
        ===================== */
        const [assignRes] = await conn.execute(
            `
            INSERT INTO job_assignments
            (job_id, worker_id, api_key_used, quantity, status)
            VALUES (?,?,?,?, 'assigned')
            `,
            [job.id, worker.id, apiKey, assignQty]
        );

        await conn.execute(
            `UPDATE jobs SET status='running' WHERE id=?`,
            [job.id]
        );

        await conn.commit();

        /* =====================
           4️⃣ TRẢ JOB CHO WORKER
        ===================== */
        return res.json([{
            assignment_id: assignRes.insertId,
            job_id: job.id,
            service_type: job.service_type,   // like / follow / share / comment
            target: job.target,
            quantity: assignQty,
            comment_text: job.comment_text,

            // 🔥 FIX QUAN TRỌNG NHẤT
            reaction_types: job.reaction_types
                ? JSON.parse(job.reaction_types)
                : []
        }]);


    } catch (e) {
        await conn.rollback();
        console.error(e);
        return res.status(500).json({ msg: "Lỗi lấy job worker" });
    } finally {
        conn.release();
    }
};

/* =====================
   WORKER SUBMIT JOB
   - Chống submit trùng
   - Không sửa DB
===================== */
exports.submitJob = async (req, res) => {
    const worker = req.worker;
    const { assignment_id, proof, success_count } = req.body;
    const success = Number(success_count || 0);
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        /* =====================
           1️⃣ CHECK ASSIGNMENT
        ===================== */
        const [[assign]] = await conn.execute(
            `
            SELECT *
            FROM job_assignments
            WHERE id=? AND worker_id=? AND status='assigned'
            FOR UPDATE
            `,
            [assignment_id, worker.id]
        );

        if (!assign) {
            throw new Error("Assignment không hợp lệ hoặc đã submit");
        }

        if (success > assign.quantity) {
            throw new Error("Số lượng submit vượt quá assignment");
        }

        /* =====================
           2️⃣ CHỐNG SUBMIT TRÙNG
        ===================== */
        const [[exist]] = await conn.execute(
            `SELECT id FROM job_results WHERE assignment_id=?`,
            [assignment_id]
        );

        if (exist) {
            throw new Error("Assignment đã submit trước đó");
        }

        /* =====================
           3️⃣ LƯU PROOF
        ===================== */
        await conn.execute(
            `
            INSERT INTO job_results (assignment_id, proof)
            VALUES (?,?)
            `,
            [assignment_id, proof || ""]
        );

        /* =====================
           4️⃣ KHÔNG CHẠY ĐƯỢC JOB
        ===================== */
        if (success <= 0) {
            await conn.execute(
                `UPDATE job_assignments SET status='failed' WHERE id=?`,
                [assignment_id]
            );

            await conn.commit();
            return res.json({ msg: "Không chạy được job nào, sẽ retry" });
        }

        /* =====================
           5️⃣ CẬP NHẬT KẾT QUẢ
        ===================== */
        await conn.execute(
            `
            UPDATE job_assignments
            SET completed=?,
                status='submitted'
            WHERE id=?
            `,
            [success, assignment_id]
        );

        await conn.execute(
            `
            UPDATE jobs
            SET completed = completed + ?
            WHERE id=?
            `,
            [success, assign.job_id]
        );

        await conn.execute(
            `
            UPDATE jobs
            SET status='completed'
            WHERE id=? AND completed >= quantity
            `,
            [assign.job_id]
        );

        /* =====================
           6️⃣ GHI TIỀN WORKER (CHỜ 24H)
        ===================== */
        const [[job]] = await conn.execute(
            `SELECT quantity, total_cost FROM jobs WHERE id=?`,
            [assign.job_id]
        );

        const unitPrice = job.total_cost / job.quantity;
        const WORKER_PERCENT = 0.6;
        const workerMoney = Math.round(success * unitPrice * WORKER_PERCENT);

        if (workerMoney > 0) {
            await conn.execute(
                `
                INSERT INTO worker_earnings
                (worker_id, job_id, assignment_id, amount, available_at)
                VALUES (?,?,?,?, DATE_ADD(NOW(), INTERVAL 24 HOUR))
                `,
                [worker.id, assign.job_id, assignment_id, workerMoney]
            );
        }

        await conn.commit();
        return res.json({ msg: `Đã cộng ${success} job thành công` });

    } catch (e) {
        await conn.rollback();
        return res.status(400).json({ msg: e.message });
    } finally {
        conn.release();
    }
};
