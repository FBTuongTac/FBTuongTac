import axios from "axios";

const API = axios.create({
    baseURL: "/api/admin",
    withCredentials: true
});

export const getAdminDashboard = () => API.get("/dashboard");
export const getAdminUsers = () => API.get("/users");
export const toggleUser = (id) => API.post(`/users/${id}/toggle`);
export const adjustBalance = (data) => API.post("/users/balance", data);
