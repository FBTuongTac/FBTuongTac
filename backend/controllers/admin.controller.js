const db = require('../config/db');

/* =====================
   DASHBOARD STATS
===================== */
exports.dashboard = async (req, res) => {
    try {
        // 💰 TIỀN
        const [[balance]] = await db.execute(
            'SELECT SUM(balance) AS totalBalance FROM users'
        );

        const [[spent]] = await db.execute(
            "SELECT SUM(amount) AS totalSpent FROM wallet_logs WHERE type='job_buy'"
        );

        const [[withdraw]] = await db.execute(
            "SELECT SUM(amount) AS totalWithdraw FROM wallet_logs WHERE type='withdraw'"
        );

        // 👥 USER
        const [[users]] = await db.execute(
            'SELECT COUNT(*) AS totalUsers FROM users'
        );

        const [[buyers]] = await db.execute(
            "SELECT COUNT(*) AS totalBuyers FROM users WHERE role='buyer'"
        );

        const [[workers]] = await db.execute(
            "SELECT COUNT(*) AS totalWorkers FROM users WHERE role='worker'"
        );

        // 📦 JOB
        const [[jobs]] = await db.execute(
            'SELECT COUNT(*) AS totalJobs FROM jobs'
        );

        const [[running]] = await db.execute(
            "SELECT COUNT(*) AS runningJobs FROM jobs WHERE status='running'"
        );

        const [[completed]] = await db.execute(
            "SELECT COUNT(*) AS completedJobs FROM jobs WHERE status='completed'"
        );

        const [[failed]] = await db.execute(
            "SELECT COUNT(*) AS failedJobs FROM jobs WHERE status IN ('failed','refund')"
        );

        // 📋 JOB GẦN NHẤT
        const [recentJobs] = await db.execute(`
            SELECT j.id, s.name AS service, j.quantity, j.status, j.created_at
            FROM jobs j
            JOIN services s ON s.id = j.service_id
            ORDER BY j.id DESC
            LIMIT 10
        `);

        res.json({
            money: {
                totalBalance: balance.totalBalance || 0,
                totalSpent: spent.totalSpent || 0,
                totalWithdraw: withdraw.totalWithdraw || 0
            },
            users: {
                total: users.totalUsers,
                buyers: buyers.totalBuyers,
                workers: workers.totalWorkers
            },
            jobs: {
                total: jobs.totalJobs,
                running: running.runningJobs,
                completed: completed.completedJobs,
                failed: failed.failedJobs
            },
            recentJobs
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: 'Lỗi admin dashboard' });
    }
};
exports.getUsers = async (req, res) => {
    try {
        const [users] = await db.execute(`
            SELECT id, username, email, balance, role, status, created_at
            FROM users
            ORDER BY id DESC
        `);
        res.json(users);
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: "Lỗi lấy danh sách user" });
    }
};

exports.toggleUser = async (req, res) => {
    const { id } = req.params;

    await db.execute(
        `UPDATE users SET status = IF(status=1,0,1) WHERE id=?`,
        [id]
    );

    res.json({ msg: "OK" });
};
exports.adjustBalance = async (req, res) => {
    const { user_id, amount, note } = req.body;

    await db.execute(
        `UPDATE users SET balance = balance + ? WHERE id=?`,
        [amount, user_id]
    );

    await db.execute(
        `INSERT INTO wallet_logs (user_id,amount,type,note)
         VALUES (?,?, 'refund', ?)`,
        [user_id, amount, note || 'Admin điều chỉnh']
    );

    res.json({ msg: "OK" });
};
