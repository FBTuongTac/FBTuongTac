const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const ctrl = require("../controllers/user.controller");

/* =====================
   ACCOUNT OVERVIEW
===================== */
router.get(
    "/account/overview",
    authMiddleware,
    ctrl.accountOverview
);

/* =====================
   GET API KEY
===================== */
router.get(
    "/account/api-key",
    authMiddleware,
    ctrl.getApiKey
);

/* =====================
   RESET API KEY
   - MẶC ĐỊNH: user nào cũng được
===================== */
router.post(
    "/account/api-key/reset",
    authMiddleware,
    ctrl.resetApiKey
);

module.exports = router;
