import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getRecentJobs, getJobStats } from "../api/job";
import "./Home.css";

export default function Home() {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    /* =====================
       STATE
    ===================== */
    const [recentJobs, setRecentJobs] = useState([]);

    const [stats, setStats] = useState({
        total_quantity: 0,
        completed_quantity: 0,
        unfinished_quantity: 0
    });

    /* =====================
       LOAD JOB STATS (TOÀN SITE – 24H)
       👉 NGUỒN SỐ DUY NHẤT
    ===================== */
    useEffect(() => {
        getJobStats()
            .then(res => {
                setStats({
                    total_quantity: Number(res.data.total_quantity || 0),
                    completed_quantity: Number(res.data.completed_quantity || 0),
                    unfinished_quantity: Number(res.data.unfinished_quantity || 0)
                });
            })
            .catch(() => {
                setStats({
                    total_quantity: 0,
                    completed_quantity: 0,
                    unfinished_quantity: 0
                });
            });
    }, []);

    /* =====================
       LOAD RECENT JOBS (CHỈ ĐỂ HIỂN THỊ BẢNG)
    ===================== */
    useEffect(() => {
        getRecentJobs()
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : [];
                setRecentJobs(data);
            })
            .catch(() => setRecentJobs([]));
    }, []);

    /* =====================
       SERVICES
    ===================== */
    const services = [
        { key: "like", name: "Like bài viết", icon: "👍", color: "#4caf50", path: "/buy/like" },
        { key: "follow", name: "Follow Facebook", icon: "➕", color: "#2196f3", path: "/buy/follow" },
        { key: "comment", name: "Comment Facebook", icon: "💬", color: "#ff9800", path: "/buy/comment" },
        { key: "share", name: "Share Facebook", icon: "🔁", color: "#9c27b0", path: "/buy/share" }
    ];

    return (
        <div className="home-dashboard">

            {/* ================= SYSTEM NOTE ================= */}
            <div className="system-note">
                📌 Thống kê bên dưới là <b>job toàn hệ thống (24h)</b>.  
                Bảng job chỉ để hiển thị các job gần đây của bạn.
            </div>

            {/* ================= USER STATS ================= */}
            <div className="home-stats">
                <div className="stat-card blue">
                    <span>Số dư ví</span>
                    <b>{Number(auth.user.balance).toLocaleString()} đ</b>
                </div>

                <div className="stat-card green">
                    <span>Số lượng đã hoàn thành</span>
                    <b>{stats.completed_quantity.toLocaleString()}</b>
                </div>

                <div className="stat-card orange">
                    <span>⏳ Chưa hoàn thành</span>
                    <b>{stats.unfinished_quantity.toLocaleString()}</b>
                </div>

                <div className="stat-card purple">
                    <span>Tài khoản</span>
                    <b>{auth.user.username}</b>
                </div>
            </div>

            {/* ================= WELCOME ================= */}
            <div className="home-welcome">
                <div>
                    <h2>Welcome back 👋</h2>
                    <p>Chọn dịch vụ bên dưới để bắt đầu tạo job mới</p>
                </div>
                <button onClick={() => navigate("/wallet")}>
                    💰 Nạp tiền
                </button>
            </div>

            {/* ================= SERVICES ================= */}
            <h3 className="section-title">🚀 Dịch vụ Facebook</h3>
            <div className="service-grid">
                {services.map(s => (
                    <div
                        key={s.key}
                        className="service-box"
                        style={{ borderTop: `4px solid ${s.color}` }}
                        onClick={() => navigate(s.path)}
                    >
                        <div
                            className="service-icon"
                            style={{ background: s.color }}
                        >
                            {s.icon}
                        </div>
                        <h4>{s.name}</h4>
                        <p>Đặt job nhanh – tự động – ổn định</p>
                        <span className="service-action">Đặt job →</span>
                    </div>
                ))}
            </div>

            {/* ================= JOB OVERVIEW ================= */}
            <h3 className="section-title">📦 Job toàn hệ thống (24h)</h3>

            <div className="job-overview">
                <div className="job-overview-card red big">
                    <span>⏳ Chưa hoàn thành</span>
                    <b>{stats.unfinished_quantity.toLocaleString()}</b>
                </div>

                <div className="job-overview-card blue big">
                    <span>📌 Tổng số lượng đã đặt</span>
                    <b>{stats.total_quantity.toLocaleString()}</b>
                </div>
            </div>

            {/* ================= RECENT TABLE ================= */}
            <h3 className="section-title">📋 Job gần đây của bạn</h3>

            <div className="home-table scroll-table">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Dịch vụ</th>
                            <th>Số lượng</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentJobs.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: "center" }}>
                                    Chưa có job nào
                                </td>
                            </tr>
                        ) : (
                            recentJobs.map((job, index) => (
                                <tr key={job.id || index}>
                                    <td>{index + 1}</td>
                                    <td>{job.service_name}</td>
                                    <td>{Number(job.quantity).toLocaleString()}</td>
                                    <td>
                                        <span className={`job-status ${job.status}`}>
                                            {job.status === "pending" && "⏳ Chờ xử lý"}
                                            {job.status === "running" && "⚙️ Đang chạy"}
                                            {job.status === "completed" && "✅ Hoàn thành"}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
