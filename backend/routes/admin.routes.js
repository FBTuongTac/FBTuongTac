const router = require("express").Router();

const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");
const controller = require("../controllers/admin.controller");

router.get("/dashboard", auth, admin, controller.dashboard);
router.get("/users", auth, admin, controller.getUsers);
router.post("/users/:id/toggle", auth, admin, controller.toggleUser);
router.post("/users/balance", auth, admin, controller.adjustBalance);

module.exports = router;
