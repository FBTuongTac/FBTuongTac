const db = require("../config/db");

/* =====================
   ACCOUNT OVERVIEW
===================== */
exports.accountOverview = async (req, res) => {
    try {
        const userId = req.user.id;

        // LẤY VÍ TỪ USERS
        const [[user]] = await db.execute(
            `
            SELECT balance, earn_pending, total_withdraw
            FROM users
            WHERE id=?
            `,
            [userId]
        );

        // THỐNG KÊ JOB
        const [[jobs]] = await db.execute(
            `
            SELECT
                COUNT(*) AS total_jobs,
                SUM(status='completed') AS total_done
            FROM jobs
            WHERE buyer_id=?
            `,
            [userId]
        );

        res.json({
            wallet: user || {
                balance: 0,
                earn_pending: 0,
                total_withdraw: 0
            },
            jobs: jobs || {
                total_jobs: 0,
                total_done: 0
            }
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: "Lỗi account overview" });
    }
};

/* =====================
   GET API KEY
===================== */
exports.getApiKey = async (req, res) => {
    try {
        const [[row]] = await db.execute(
            "SELECT api_key FROM users WHERE id=?",
            [req.user.id]
        );

        res.json({
            api_key: row?.api_key || null
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: "Lỗi lấy API key" });
    }
};

/* =====================
   RESET API KEY
===================== */
exports.resetApiKey = async (req, res) => {
    try {
        const crypto = require("crypto");
        const newKey = crypto.randomBytes(24).toString("hex");

        await db.execute(
            `
            UPDATE users
            SET api_key=?, api_key_status=1
            WHERE id=?
            `,
            [newKey, req.user.id]
        );

        res.json({ api_key: newKey });
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: "Lỗi reset API key" });
    }
};
