import type { JSX } from "react";
import { useAuthStore } from "../features/auth/authStore";
import { Navigate } from "react-router-dom";


export default function ProtectedRoute({ children }: { children: JSX.Element }) {
    const {isAuthenticated, user, isLoading} = useAuthStore();
   
    if (isLoading) {
        return <div>Loading...</div>; // Or a proper loading component
    }

    if (!isAuthenticated) {
        return <Navigate to="/login"  />; // Redirect to login if not authenticated   
    }

    return children; // If token exists, render the protected component
}