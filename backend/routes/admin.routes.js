const router = require("express").Router();

const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");
const controller = require("../controllers/admin.controller");

// ===== DASHBOARD =====
router.get("/dashboard", auth, admin, controller.dashboard);

// ===== USERS =====
router.get("/users", auth, admin, controller.getUsers);

// ===== TOGGLE USER =====
router.post("/users/:id/toggle", auth, admin, controller.toggleUser);

// ===== ADJUST BALANCE =====
router.post("/users/balance", auth, admin, controller.adjustBalance);

module.exports = router;
