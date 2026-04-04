import { useState } from "react";
import { useAuthStore } from "./authStore";
import { loginApi, logoutApi } from "./authApi";
import { setAccessToken } from "../../lib/apiClient";

export const useAuth = () => {
    const setUser = useAuthStore((state) => state.setUser);
    const logoutUser = useAuthStore((state) => state.logout);

    const [loading,setLoading] = useState(false)
    const [error,setError] = useState<string | null>(null)

    const login = async (email: string, password: string) => {
        setLoading(true)
        setError(null)
        try {
            const res = await loginApi(email, password);
            setAccessToken(res.accessToken)
            setUser(res.user)

            return true
        } catch (err: any) {
            setError(err.message)
            return false
        } finally {
            setLoading(false)
        }
    }

    const logout = async () => {
        await logoutApi();
        logoutUser()
    }


    return { login, loading, error, logout }
}
