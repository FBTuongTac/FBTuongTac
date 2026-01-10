import axios from "axios";

const API = axios.create({
    baseURL: "/api/job",
    withCredentials: true
});

// BUYER
export const createJob = (data) =>
    API.post("/create", data);

// HOME – GLOBAL
export const getRecentJobs = () =>
    API.get("/recent");

export const getJobStats = () =>
    API.get("/stats");

// BUYER – MY JOBS
export const getMyJobs = () =>
    API.get("/my-jobs");
