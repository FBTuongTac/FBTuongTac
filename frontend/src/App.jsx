import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";

import { AuthProvider, AuthContext } from "./context/AuthContext";

/* ===== PAGES ===== */
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import BuyLike from "./pages/BuyLike";
import BuyFollow from "./pages/BuyFollow";
import BuyComment from "./pages/BuyComment";
import BuyShare from "./pages/BuyShare";

/* ===== ACCOUNT (GỘP 1 FILE) ===== */
import AccountLayout from "./pages/account/AccountLayout";

/* ===== COMPONENTS ===== */
import Navbar from "./components/Navbar";

/* =====================
   Private Route
===================== */
const PrivateRoute = ({ children }) => {
    const { auth, loading } = useContext(AuthContext);

    if (loading) {
        return <div style={{ padding: 40 }}>Loading...</div>;
    }

    return auth ? children : <Navigate to="/login" replace />;
};

/* =====================
   Admin Route
===================== */
const AdminRoute = ({ children }) => {
    const { auth, loading } = useContext(AuthContext);

    if (loading) {
        return <div style={{ padding: 40 }}>Loading...</div>;
    }

    if (!auth) return <Navigate to="/login" replace />;

    if (auth.user.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return children;
};

/* =====================
   Layout
===================== */
const Layout = ({ children }) => {
    const { auth } = useContext(AuthContext);

    return (
        <>
            {auth && <Navbar />}
            {children}
        </>
    );
};

/* =====================
   APP
===================== */
export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Layout>
                    <Routes>
                        {/* ===== PUBLIC ===== */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* ===== USER ===== */}
                        <Route
                            path="/"
                            element={
                                <PrivateRoute>
                                    <Home />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/buy/like"
                            element={
                                <PrivateRoute>
                                    <BuyLike />
                                </PrivateRoute>
                            }
                        />
                        {/* ===== BUY SERVICES ===== */}
                        <Route
                            path="/buy/follow"
                            element={
                                <PrivateRoute>
                                    <BuyFollow />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/buy/comment"
                            element={
                                <PrivateRoute>
                                    <BuyComment />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/buy/share"
                            element={
                                <PrivateRoute>
                                    <BuyShare />
                                </PrivateRoute>
                            }
                        />

                        {/* ===== ACCOUNT (ONE FILE) ===== */}
                        <Route
                            path="/account"
                            element={
                                <PrivateRoute>
                                    <AccountLayout />
                                </PrivateRoute>
                            }
                        />

                        {/* ===== ADMIN ===== */}
                        <Route
                            path="/admin"
                            element={
                                <AdminRoute>
                                    <AdminDashboard />
                                </AdminRoute>
                            }
                        />

                        {/* ===== FALLBACK ===== */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Layout>
            </BrowserRouter>
        </AuthProvider>
    );
}
