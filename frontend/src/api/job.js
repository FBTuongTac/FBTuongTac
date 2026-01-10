import axios from "axios";

const API = axios.create({
    baseURL: "/api/job",
    withCredentials: true
});

export const createJob = (data) => API.post("/create", data);
export const getRecentJobs = () => API.get("/recent");
export const getJobStats = () => API.get("/stats");
export const getMyJobs = () => API.get("/my-jobs");
