const express = require("express");
const router = express.Router();

const workerAuth = require("../middleware/worker.middleware");
const ctrl = require("../controllers/worker.controller");

router.get("/jobs", workerAuth, ctrl.getJobs);
router.post("/job/submit", workerAuth, ctrl.submitJob);

module.exports = router;
