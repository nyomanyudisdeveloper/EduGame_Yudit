import axios from "axios";
import { useAuthStore } from "../features/auth/authStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";  


const api =  axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // important for cookie
    headers: { "Content-Type": "application/json" }
})

let accessToken: string | null = null;

export const setAccessToken = (token: string) => {
    accessToken = token;
}

api.interceptors.request.use(config => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
    } 
    return config;
})

api.interceptors.response.use(response => response, 
async error => {
    const originalRequest = error.config;
    

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // ❌ Hindari infinite loop
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;

        if (!isAuthenticated) {
            // User never logged in: don't force navigation here.
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            const res = await api.post("/auth/refresh");
            const data = res.data;
            setAccessToken(data.accessToken);

            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
            return api(originalRequest);
        } catch (err: any) {
            // Refresh token invalid or expired: log out and reject.
            if (err.response?.status === 401) {
                useAuthStore.getState().logout();
            }
            return Promise.reject(err);
        }
    }

    return Promise.reject(error);
});

export default api;