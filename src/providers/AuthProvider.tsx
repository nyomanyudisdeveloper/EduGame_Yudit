// providers/AuthProvider.tsx
import React, { useEffect } from "react"
import { useLocation } from "react-router-dom"

import api, { setAccessToken } from "../lib/apiClient"
import { useAuthStore } from "../features/auth/authStore"

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser)
  const setLoading = useAuthStore((state) => state.setLoading)
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === '/login') {
      setLoading(false)
      return
    }

    const init = async () => {
      try {
        const res = await api.post("/auth/refresh")
        setAccessToken(res.data.accessToken)

        const res_user = await api.get("/auth/profile")
        setUser(res_user.data)
      } catch {
        setLoading(false)
      }
    }

    init()
  }, [location.pathname])

  return children
}