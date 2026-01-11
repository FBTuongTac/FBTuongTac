const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const ctrl = require("../controllers/user.controller");

router.get("/account/overview", auth, ctrl.accountOverview);
router.get("/account/api-key", auth, ctrl.getApiKey);
router.post("/account/api-key/reset", auth, ctrl.resetApiKey);

module.exports = router;
