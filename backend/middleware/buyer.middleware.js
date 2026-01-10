module.exports = (req, res, next) => {
    const allowRoles = ["buyer", "worker", "admin"];

    if (!req.user || !allowRoles.includes(req.user.role)) {
        return res.status(403).json({
            msg: "Không có quyền tạo job"
        });
    }

    next();
};
