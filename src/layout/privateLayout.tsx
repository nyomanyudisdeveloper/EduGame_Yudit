import { Outlet } from "react-router-dom";
import AuthProvider from "../providers/AuthProvider";
import Header from "../components/header";

export default function PrivateLayout() {
  return (
    <AuthProvider>
      <Header />
      <div className="py-20 px-5">
        <Outlet />
      </div>
    </AuthProvider>
  );
}