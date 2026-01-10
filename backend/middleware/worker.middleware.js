const db = require("../config/db");

module.exports = async (req, res, next) => {
    try {
        const apiKey = (req.headers["x-api-key"] || "").trim();

        if (!apiKey) {
            return res.status(401).json({ msg: "Thiếu API key" });
        }

        const [[user]] = await db.execute(
            `
            SELECT id, username, role
            FROM users
            WHERE api_key = ?
              AND api_key_status = 1
              AND status = 1
              AND role = 'worker'
            `,
            [apiKey]
        );

        if (!user) {
            return res.status(403).json({
                msg: "API key không hợp lệ hoặc không có quyền worker"
            });
        }

        /* =====================
           GÁN WORKER CHO CONTROLLER
        ===================== */
        req.worker = {
            id: user.id,
            username: user.username
        };

        // giữ nếu bạn còn dùng ở chỗ khác
        req.apiUser = user;

        /* =====================
           LOG API (KHÔNG ẢNH HƯỞNG FLOW)
        ===================== */
        db.execute(
            `INSERT INTO api_logs (api_key, endpoint, ip)
             VALUES (?,?,?)`,
            [apiKey, req.originalUrl, req.ip]
        ).catch(() => {});

        next();

    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: "Lỗi xác thực API key" });
    }
};
