import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("http://161.35.134.187/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Login failed");
                return;
            }

            // Save token in localStorage
            localStorage.setItem("token", data.accessToken);
            console.log("JWT saved:", data.accessToken);

            // Redirect to home
            navigate("/home");
        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-6">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-yellow-400 mb-6">
                    Knights Marketplace 🔥
                </h1>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-gray-300 mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-yellow-400 outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-yellow-400 outline-none"
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm font-medium text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-yellow-400 text-gray-900 font-semibold py-2 rounded-lg hover:bg-yellow-500 transition duration-300"
                    >
                        Log In
                    </button>
                </form>

                <p className="text-gray-400 text-sm text-center mt-6">
                    Don’t have an account?{" "}
                    <span className="text-yellow-400 hover:underline cursor-pointer">
            Register
          </span>
                </p>
            </div>
        </div>
    );
};

export default Login;
