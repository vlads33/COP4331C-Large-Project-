import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [msg, setMsg] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (password !== confirm) {
            setMsg("Passwords do not match.");
            return;
        }

        try {
            const res = await fetch("/api/password_reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMsg(data.error || "Error sending reset email.");
                return;
            }

            setMsg("Password reset email sent! Check your inbox.");
        } catch (err) {
            setMsg("Network error.");
        }
    }

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white">
            <div className="bg-gray-800 p-6 rounded-xl w-96 shadow-xl">
                <h1 className="text-2xl font-bold text-yellow-400 mb-4 text-center">
                    Reset Password
                </h1>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2 bg-gray-700 rounded"
                        required
                    />

                    <input
                        type="password"
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 bg-gray-700 rounded"
                        required
                    />

                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className="w-full p-2 bg-gray-700 rounded"
                        required
                    />

                    <button
                        type="submit"
                        className="w-full bg-yellow-500 text-gray-900 font-bold py-2 rounded hover:bg-yellow-600"
                    >
                        Send Reset Email
                    </button>
                </form>

                {msg && (
                    <p className="mt-4 text-center text-yellow-400 font-semibold">{msg}</p>
                )}

                <button
                    className="w-full mt-4 text-gray-300 hover:text-white"
                    onClick={() => navigate("/")}
                >
                    Back to Login
                </button>
            </div>
        </div>
    );
}

