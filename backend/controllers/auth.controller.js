const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('../utils/jwt');

/* =====================
   REGISTER
===================== */
exports.register = async (req, res) => {
    try {
        const { username, password, email } = req.body;

        if (!username || !password)
            return res.status(400).json({ msg: 'Thiếu dữ liệu' });

        const [exist] = await db.execute(
            'SELECT id FROM users WHERE username=? OR email=?',
            [username, email]
        );

        if (exist.length)
            return res.status(400).json({ msg: 'Tài khoản đã tồn tại' });

        const hash = await bcrypt.hash(password, 10);

        await db.execute(
            'INSERT INTO users (username,password,email,role) VALUES (?,?,?,?)',
            [username, hash, email, 'buyer']
        );

        res.json({ msg: 'Đăng ký thành công' });
    } catch (e) {
        res.status(500).json({ msg: 'Lỗi server' });
    }
};

/* =====================
   LOGIN (LƯU COOKIE)
===================== */
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const [[user]] = await db.execute(
            'SELECT * FROM users WHERE username=? OR email=?',
            [username, username]
        );

        if (!user)
            return res.status(400).json({ msg: 'Sai tài khoản' });

        if (user.status !== 1)
            return res.status(403).json({ msg: 'Tài khoản bị khóa' });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok)
            return res.status(400).json({ msg: 'Sai mật khẩu' });

        const token = jwt.sign({
            id: user.id,
            role: user.role
        });

        // 🍪 LƯU COOKIE
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
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
    } catch {
        res.status(500).json({ msg: 'Lỗi server' });
    }
};

/* =====================
   ME (CHECK SESSION)
===================== */
exports.me = async (req, res) => {
    const [[user]] = await db.execute(
        'SELECT id,username,balance,role FROM users WHERE id=?',
        [req.user.id]
    );
    res.json(user);
};

/* =====================
   LOGOUT
===================== */
exports.logout = (req, res) => {
    res.clearCookie('token');
    res.json({ msg: 'Đã đăng xuất' });
};
