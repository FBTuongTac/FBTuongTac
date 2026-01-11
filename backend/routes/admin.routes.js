const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");
const c = require("../controllers/admin.controller");

router.get("/dashboard", auth, admin, c.dashboard);
router.get("/users", auth, admin, c.getUsers);
router.post("/users/:id/toggle", auth, admin, c.toggleUser);
router.post("/users/balance", auth, admin, c.adjustBalance);

module.exports = router;
