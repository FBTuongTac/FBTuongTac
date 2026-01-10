import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
    const { auth, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const isAdmin = auth?.user?.role === "admin";

    const onLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <header className="navbar">
            {/* LEFT */}
            <div className="nav-left">
                <span className="nav-title">FBtuongtac</span>

                <nav className="nav-menu">
                    {/* HOME */}
                    <Link to="/" className="nav-item">
                        📊 Dashboard
                    </Link>

                    {/* SERVICES */}
                    <div className="dropdown">
                        <span className="nav-item">
                            👍 Dịch vụ Facebook
                        </span>
                        <div className="dropdown-menu">
                            <Link to="/buy/like">👍 Like bài viết</Link>
                            <Link to="/buy/follow">➕ Follow cá nhân</Link>
                            <Link to="/buy/comment">💬 Comment</Link>
                            <Link to="/buy/share">🔁 Share</Link>
                        </div>
                    </div>

                    {/* ACCOUNT */}
                    <Link to="/account" className="nav-item">
                        👤 Tài khoản
                    </Link>
                </nav>
            </div>

            {/* RIGHT */}
            <div className="nav-right">
                {/* BALANCE */}
                <div className="stat-box">
                    <span className="stat-label">Số dư</span>
                    <span className="stat-value">
                        {Number(auth?.user?.balance || 0).toLocaleString()} đ
                    </span>
                </div>

                {/* USER MENU */}
                <div className="dropdown">
                    <span className="user-box">
                        👤 {auth?.user?.username}
                        {isAdmin && " (Admin)"}
                    </span>

                    <div className="dropdown-menu right">
                        <Link to="/account">⚙️ Tài khoản</Link>

                        {isAdmin && (
                            <>
                                <hr />
                                <Link to="/admin">🛠️ Trang Admin</Link>
                            </>
                        )}

                        <hr />
                        <span className="logout" onClick={onLogout}>
                            🚪 Đăng xuất
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
