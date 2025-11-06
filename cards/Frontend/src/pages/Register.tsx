import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            setLoading(false);

            if (res.ok) {
                setMessage("✅ Account created! Redirecting to login...");
                setTimeout(() => navigate("/"), 2000);
            } else {
                setMessage("❌ " + (data.error || "Registration failed"));
            }
        } catch  {
            setLoading(false);
            setMessage("❌ Network error, please try again.");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <form
                onSubmit={handleSubmit}
                className="bg-gray-800 p-8 rounded-lg shadow-lg w-96 space-y-4"
            >
                <h2 className="text-2xl font-bold text-center">Create Account</h2>

                <input
                    type="text"
                    placeholder="First Name"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
                    required
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
                    required
                />
                <input
                    type="text"
                    placeholder="Username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-2 rounded"
                >
                    {loading ? "Registering..." : "Register"}
                </button>

                {message && (
                    <p className="text-center text-sm mt-2 text-yellow-400">{message}</p>
                )}

                <p className="text-center text-sm mt-4">
                    Already have an account?{" "}
                    <span
                        onClick={() => navigate("/")}
                        className="text-yellow-400 hover:underline cursor-pointer"
                    >
            Login
          </span>
                </p>
            </form>
        </div>
    );
}
