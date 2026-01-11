const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const ctrl = require("../controllers/user.controller");

router.get("/account/overview", authMiddleware, ctrl.accountOverview);
router.get("/account/api-key", authMiddleware, ctrl.getApiKey);
router.post("/account/api-key/reset", authMiddleware, ctrl.resetApiKey);

module.exports = router;
