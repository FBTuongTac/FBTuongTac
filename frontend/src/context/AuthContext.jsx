import { createContext, useEffect, useState } from "react";
import { meApi, logoutApi } from "../api/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(null);
    const [loading, setLoading] = useState(true);

    // 👉 Khi load app: check session bằng cookie
    useEffect(() => {
        meApi()
            .then(res => setAuth({ user: res.data }))
            .catch(() => setAuth(null))
            .finally(() => setLoading(false));
    }, []);

    const login = (user) => {
        setAuth({ user });
    };

    const logout = async () => {
        await logoutApi();
        setAuth(null);
    };

    return (
        <AuthContext.Provider value={{ auth, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
