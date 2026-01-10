import axios from "axios";

const API = "http://localhost:3001/api/auth";

// ⚠️ QUAN TRỌNG: withCredentials = true
const client = axios.create({
    baseURL: API,
    withCredentials: true
});

export const loginApi = (data) =>
    client.post("/login", data);

export const registerApi = (data) =>
    client.post("/register", data);

export const meApi = () =>
    client.get("/me");

export const logoutApi = () =>
    client.post("/logout");
