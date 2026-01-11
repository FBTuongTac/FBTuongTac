const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const ctrl = require("../controllers/job.controller");

router.post("/create", auth, ctrl.createJob);
router.get("/my-jobs", auth, ctrl.getMyJobs);
router.get("/recent", auth, ctrl.getRecentJobs);
router.get("/stats", auth, ctrl.getJobStats);

module.exports = router;
