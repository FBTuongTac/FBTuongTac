import axios from "axios";

const client = axios.create({
    baseURL: "/api/auth",
    withCredentials: true
});

export const loginApi = (data) => client.post("/login", data);
export const registerApi = (data) => client.post("/register", data);
export const meApi = () => client.get("/me");
export const logoutApi = () => client.post("/logout");
