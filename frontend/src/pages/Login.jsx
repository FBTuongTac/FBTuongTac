import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi, meApi } from "../api/auth";
import { AuthContext } from "../context/AuthContext";
import "./Auth.css";

export default function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        password: ""
    });
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        try {
            setLoading(true);
            setMsg("");

            // 1️⃣ login → backend set cookie
            await loginApi(form);

            // 2️⃣ gọi /me để lấy user
            const res = await meApi();
            login(res.data);

            // 3️⃣ redirect
            navigate("/");
        } catch (e) {
            setMsg(e.response?.data?.msg || "Đăng nhập thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-box">
                <h2>Đăng nhập</h2>

                <input
                    placeholder="Username hoặc Email"
                    value={form.username}
                    onChange={e =>
                        setForm({ ...form, username: e.target.value })
                    }
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={e =>
                        setForm({ ...form, password: e.target.value })
                    }
                />

                <button onClick={submit} disabled={loading}>
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>

                {msg && <p style={{ color: "red" }}>{msg}</p>}

                <p>
                    Chưa có tài khoản? <a href="/register">Đăng ký</a>
                </p>
            </div>
        </div>
    );
}
