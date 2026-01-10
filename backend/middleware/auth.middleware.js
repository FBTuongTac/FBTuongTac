const jwt = require("../utils/jwt");

module.exports = (req, res, next) => {
    try {
        const token =
            req.cookies.token ||
            req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ msg: "Chưa đăng nhập" });
        }

        const decoded = jwt.verify(token);
        req.user = decoded;

        next();
    } catch (e) {
        return res.status(401).json({ msg: "Token không hợp lệ" });
    }
};
