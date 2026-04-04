import api from "../../lib/apiClient"


export const loginApi = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password })
    return response.data
}

export const logoutApi = async () => {
    await api.post("/auth/logout")
}