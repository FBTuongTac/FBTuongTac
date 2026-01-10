import { useEffect, useState } from "react";
import {
    getAdminDashboard,
    getAdminUsers,
    toggleUser,
    adjustBalance
} from "../api/admin";
import "./AdminDashboard.css";

export default function AdminDashboard() {
    const [tab, setTab] = useState("stats");
    const [dashboard, setDashboard] = useState(null);
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    /* =====================
       LOAD DATA
    ===================== */
    useEffect(() => {
        loadDashboard();
        loadUsers();
    }, []);

    const loadDashboard = async () => {
        const res = await getAdminDashboard();
        setDashboard(res.data);
    };

    const loadUsers = async () => {
        setLoadingUsers(true);
        const res = await getAdminUsers();
        setUsers(res.data);
        setLoadingUsers(false);
    };

    /* =====================
       ACTIONS
    ===================== */
    const changeBalance = async (user) => {
        const amount = prompt("Nhập số tiền (+/-)");
        if (!amount || isNaN(amount)) return;

        await adjustBalance({
            user_id: user.id,
            amount: Number(amount),
            note: "Admin chỉnh tay"
        });

        loadUsers();
        loadDashboard();
    };

    const toggleStatus = async (user) => {
        await toggleUser(user.id);
        loadUsers();
    };

    if (!dashboard) {
        return <div style={{ padding: 40 }}>Loading admin...</div>;
    }

    return (
        <div className="admin-container">
            <h2>🛠️ Quản trị hệ thống FBTuongTac</h2>

            {/* =====================
                TABS
            ===================== */}
            <div className="admin-tabs">
                <button
                    className={tab === "stats" ? "active" : ""}
                    onClick={() => setTab("stats")}
                >
                    📊 Thống kê & Job
                </button>
                <button
                    className={tab === "users" ? "active" : ""}
                    onClick={() => setTab("users")}
                >
                    👥 Quản lý khách hàng
                </button>
            </div>

            {/* =====================
                TAB 1: STATS
            ===================== */}
            {tab === "stats" && (
                <>
                    <div className="admin-stats">
                        <div className="stat-card blue">
                            <span>Tổng số dư</span>
                            <b>{dashboard.money.totalBalance.toLocaleString()} đ</b>
                        </div>
                        <div className="stat-card green">
                            <span>Doanh thu job</span>
                            <b>{dashboard.money.totalSpent.toLocaleString()} đ</b>
                        </div>
                        <div className="stat-card red">
                            <span>Đã rút</span>
                            <b>{dashboard.money.totalWithdraw.toLocaleString()} đ</b>
                        </div>
                        <div className="stat-card purple">
                            <span>Tổng user</span>
                            <b>{dashboard.users.total}</b>
                        </div>
                    </div>

                    <h3>📦 Job gần nhất</h3>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Dịch vụ</th>
                                <th>SL</th>
                                <th>Trạng thái</th>
                                <th>Thời gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dashboard.recentJobs.map(job => (
                                <tr key={job.id}>
                                    <td>{job.id}</td>
                                    <td>{job.service}</td>
                                    <td>{job.quantity}</td>
                                    <td>{job.status}</td>
                                    <td>
                                        {new Date(job.created_at).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}

            {/* =====================
                TAB 2: USERS
            ===================== */}
            {tab === "users" && (
                <>
                    <h3>👥 Danh sách khách hàng</h3>

                    {loadingUsers ? (
                        <div>Đang tải danh sách user...</div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Quyền</th>
                                    <th>Số dư</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.username}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <b>{user.role}</b>
                                        </td>
                                        <td>
                                            {Number(user.balance).toLocaleString()} đ
                                        </td>
                                        <td>
                                            {user.status === 1
                                                ? "Hoạt động"
                                                : "Khóa"}
                                        </td>
                                        <td>
                                            <button
                                                onClick={() =>
                                                    changeBalance(user)
                                                }
                                            >
                                                💰 Xu
                                            </button>

                                            <button
                                                onClick={() =>
                                                    toggleStatus(user)
                                                }
                                                style={{ marginLeft: 6 }}
                                            >
                                                {user.status === 1
                                                    ? "🔒 Khóa"
                                                    : "🔓 Mở"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            )}
        </div>
    );
}
