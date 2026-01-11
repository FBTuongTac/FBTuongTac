import { createContext, useEffect, useState } from "react";
import { meApi, logoutApi } from "../api/auth";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(null);
    const [loading, setLoading] = useState(true);

    /**
     * Khi app load:
     * - Check session bằng cookie
     * - 401 = chưa đăng nhập (HỢP LÝ, không phải lỗi)
     */
    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await meApi();
                setAuth({ user: res.data });
            } catch (err) {
                // ❗ 401 = chưa login → bỏ qua, KHÔNG coi là lỗi
                setAuth(null);
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, []);

    /**
     * Sau khi login thành công
     */
    const login = (user) => {
        setAuth({ user });
    };

    /**
     * Logout
     */
    const logout = async () => {
        try {
            await logoutApi();
        } finally {
            setAuth(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                auth,        // { user } | null
                login,
                logout,
                loading      // true khi đang check session
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
