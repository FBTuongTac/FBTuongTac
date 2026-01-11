const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const ctrl = require("../controllers/job.controller");

router.post("/create", authMiddleware, ctrl.createJob);
router.get("/my-jobs", authMiddleware, ctrl.getMyJobs);
router.get("/recent", authMiddleware, ctrl.getRecentJobs);
router.get("/stats", authMiddleware, ctrl.getJobStats);

module.exports = router;
