const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('../utils/jwt');

/* =====================
   REGISTER
===================== */
exports.register = async (req, res) => {
    try {
        const { username, password, email } = req.body;

        if (!username || !password) {
            return res.status(400).json({ msg: 'Thiếu dữ liệu' });
        }

        const [exist] = await db.execute(
            'SELECT id FROM users WHERE username=?',
            [username]
        );

        if (exist.length) {
            return res.status(400).json({ msg: 'Tài khoản đã tồn tại' });
        }

        const hash = await bcrypt.hash(password, 10);

        await db.execute(
            'INSERT INTO users (username,password,email,role,status,balance) VALUES (?,?,?,?,?,?)',
            [username, hash, email || null, 'buyer', 1, 0]
        );

        res.json({ msg: 'Đăng ký thành công' });
    } catch (err) {
        console.error('REGISTER ERROR:', err);
        res.status(500).json({
            msg: 'Lỗi server',
            error: err.message
        });
    }
};

/* =====================
   LOGIN (SET COOKIE)
===================== */
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ msg: 'Thiếu dữ liệu' });
        }

        // ✅ QUERY AN TOÀN – KHÔNG GÂY CRASH
        const [[user]] = await db.execute(
            'SELECT * FROM users WHERE username=?',
            [username]
        );

        if (!user) {
            return res.status(400).json({ msg: 'Sai tài khoản' });
        }

        if (user.status !== 1) {
            return res.status(403).json({ msg: 'Tài khoản bị khóa' });
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            return res.status(400).json({ msg: 'Sai mật khẩu' });
        }

        const token = jwt.sign({
            id: user.id,
            role: user.role
        });

        // 🍪 SET COOKIE (CHUẨN CHO HTTP + IP)
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
        });

        res.json({
            msg: 'Login success',
            user: {
                id: user.id,
                username: user.username,
                balance: user.balance,
                role: user.role
            }
        });
    } catch (err) {
        console.error('LOGIN ERROR:', err);
        res.status(500).json({
            msg: 'Lỗi server',
            error: err.message
        });
    }
};

/* =====================
   ME (CHECK SESSION)
===================== */
exports.me = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        const [[user]] = await db.execute(
            'SELECT id,username,balance,role FROM users WHERE id=?',
            [req.user.id]
        );

        if (!user) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        res.json(user);
    } catch (err) {
        console.error('ME ERROR:', err);
        res.status(500).json({
            msg: 'Lỗi server',
            error: err.message
        });
    }
};

/* =====================
   LOGOUT
===================== */
exports.logout = (req, res) => {
    res.clearCookie('token');
    res.json({ msg: 'Đã đăng xuất' });
};
