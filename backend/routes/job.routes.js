const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const ctrl = require("../controllers/job.controller");

/* =====================
   CREATE JOB – ALL LOGGED USERS
   buyer / worker / admin
===================== */
router.post(
    "/create",
    authMiddleware,     // ✅ chỉ cần đăng nhập
    ctrl.createJob
);

/* =====================
   VIEW MY JOBS
===================== */
router.get(
    "/my-jobs",
    authMiddleware,
    ctrl.getMyJobs
);

/* =====================
   RECENT JOBS
===================== */
router.get(
    "/recent",
    authMiddleware,
    ctrl.getRecentJobs
);

/* =====================
   JOB STATS
===================== */
router.get(
    "/stats",
    authMiddleware,
    ctrl.getJobStats
);

module.exports = router;
