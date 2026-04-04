import { useState } from "react";
import { FaEye } from "react-icons/fa";
import { useAuth } from "../features/auth/useAuth";
import { useNavigate } from "react-router-dom";


const LoginScreen = () => {
    const {login} = useAuth()
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // Handle login logic here
const username = ((e.target as HTMLFormElement).elements[0] as HTMLInputElement).value;
        const password = ((e.target as HTMLFormElement).elements[1] as HTMLInputElement).value;

        const success = await login(username, password)
        if (success) {
            navigate("/")
        }
        
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-3xl font-bold ">Login</h1>
            <form className="mt-4 w-1/4" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Email"
                    className="border border-gray-300 rounded px-3 py-2 mb-4 w-full"
                />
                <div className=" mb-4 relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="border border-gray-300 rounded px-3 py-2  w-full"
                    />
                    {showPassword ? (
                        <FaEye onClick={() => setShowPassword(prev => !prev)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer" />
                    ) : (
                        <FaEye onClick={() => setShowPassword(prev => !prev)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer" />
                    )}
                </div>
                
                <button
                    type="submit"
                    className="bg-blue-500 text-white rounded px-4 py-2 w-full cursor-pointer hover:bg-blue-600"
                >
                    Login
                </button>
            </form>
        </div>
    )
}

export default LoginScreen