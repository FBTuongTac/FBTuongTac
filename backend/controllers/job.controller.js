const db = require("../config/db");

/* =====================
   CREATE JOB (BUYER)
   - Giá lấy từ frontend (unit_price)
   - KHÔNG sửa DB
   - VẪN trừ tiền + wallet
   - VALIDATE theo service: comment / follow / like / share
===================== */
exports.createJob = async (req, res) => {
    const user = req.user;
    const {
        service_id,
        package_id,
        target,
        quantity,
        comment_text,
        reaction_types,
        unit_price
    } = req.body;

    // =====================
    // BASIC VALIDATE
    // =====================
    if (!service_id || !target || !quantity || !unit_price) {
        return res.status(400).json({ msg: "Thiếu dữ liệu tạo job" });
    }

    const qty = Number(quantity);
    const price = Number(unit_price);

    if (!Number.isFinite(qty) || qty <= 0 ||
        !Number.isFinite(price) || price <= 0) {
        return res.status(400).json({ msg: "Giá hoặc số lượng không hợp lệ" });
    }

    const totalCost = qty * price;
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        /* =====================
           CHECK SERVICE
        ===================== */
        const [[service]] = await conn.execute(
            `
            SELECT id, type, allow_link
            FROM services
            WHERE id=? AND status=1
            `,
            [service_id]
        );

        if (!service) {
            throw new Error("Dịch vụ không tồn tại");
        }

        /* =====================
           VALIDATE THEO SERVICE TYPE
        ===================== */
        let finalComment = null;
        let finalReactions = null;

        switch (service.type) {
            case "comment":
                if (!comment_text || !comment_text.trim()) {
                    throw new Error("Dịch vụ comment bắt buộc có nội dung");
                }

                if (service.allow_link === 0) {
                    const hasLink = /(https?:\/\/|www\.)/i.test(comment_text);
                    if (hasLink) {
                        throw new Error("Nội dung comment không được chứa link");
                    }
                }

                finalComment = comment_text.trim();
                break;

            case "like":
                finalReactions = reaction_types
                    ? JSON.stringify(reaction_types)
                    : null;
                break;

            case "share":
            case "follow":
                // không cần comment / reaction
                break;

            default:
                throw new Error("Loại dịch vụ không hợp lệ");
        }

        /* =====================
           LOCK USER + CHECK BALANCE
        ===================== */
        const [[buyer]] = await conn.execute(
            `SELECT balance FROM users WHERE id=? FOR UPDATE`,
            [user.id]
        );

        if (!buyer || buyer.balance < totalCost) {
            throw new Error("Số dư không đủ");
        }

        /* =====================
           TRỪ TIỀN
        ===================== */
        await conn.execute(
            `UPDATE users SET balance = balance - ? WHERE id=?`,
            [totalCost, user.id]
        );

        /* =====================
           CREATE JOB
        ===================== */
        const [jobRes] = await conn.execute(
            `
            INSERT INTO jobs
            (
                buyer_id,
                service_id,
                package_id,
                target,
                quantity,
                comment_text,
                reaction_types,
                total_cost,
                status
            )
            VALUES (?,?,?,?,?,?,?, ?, 'pending')
            `,
            [
                user.id,
                service_id,
                package_id || null,
                target,
                qty,
                finalComment,
                finalReactions,
                totalCost
            ]
        );

        /* =====================
           WALLET LOG
        ===================== */
        await conn.execute(
            `
            INSERT INTO wallet_logs (user_id, amount, type, ref_id, note)
            VALUES (?, ?, 'job_buy', ?, 'Mua job')
            `,
            [user.id, totalCost, jobRes.insertId]
        );

        await conn.commit();

        res.json({
            msg: "Tạo job thành công",
            job_id: jobRes.insertId,
            total_cost: totalCost
        });

    } catch (e) {
        await conn.rollback();
        res.status(400).json({ msg: e.message });
    } finally {
        conn.release();
    }
};

/* =====================
   JOB CỦA USER (MY JOBS)
===================== */
exports.getMyJobs = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `
            SELECT j.id,
                   s.name AS service_name,
                   j.quantity,
                   j.completed,
                   j.status,
                   j.created_at,
                   j.total_cost
            FROM jobs j
            JOIN services s ON s.id = j.service_id
            WHERE j.buyer_id=?
            ORDER BY j.id DESC
            `,
            [req.user.id]
        );

        res.json(rows);
    } catch (e) {
        res.status(500).json({ msg: "Lỗi lấy job user" });
    }
};

/* =====================
   RECENT JOBS (HOME)
===================== */
exports.getRecentJobs = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `
            SELECT j.id,
                   s.name AS service_name,
                   j.quantity,
                   j.status,
                   j.total_cost
            FROM jobs j
            JOIN services s ON s.id = j.service_id
            WHERE j.buyer_id=?
            ORDER BY j.id DESC
            LIMIT 5
            `,
            [req.user.id]
        );

        res.json(rows);
    } catch (e) {
        res.status(500).json({ msg: "Lỗi recent jobs" });
    }
};

/* =====================
   JOB STATS (HOME – 24H)
===================== */
exports.getJobStats = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT quantity, completed
            FROM jobs
            WHERE status NOT IN ('failed','refund')
              AND created_at >= NOW() - INTERVAL 24 HOUR
        `);

        let total_quantity = 0;
        let completed_quantity = 0;
        let unfinished_quantity = 0;

        for (const job of rows) {
            const qty = Number(job.quantity) || 0;
            const done = Number(job.completed) || 0;

            total_quantity += qty;
            completed_quantity += done;
            unfinished_quantity += Math.max(qty - done, 0);
        }

        res.json({
            total_quantity,
            completed_quantity,
            unfinished_quantity
        });
    } catch (e) {
        res.status(500).json({ msg: "Lỗi thống kê job toàn hệ thống" });
    }
};
