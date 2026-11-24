
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import adminApi from "../services/adminApi";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

function AdminLogin() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await adminApi.post(
                "admin-login/",
                formData
            );

            localStorage.setItem("admin_token", response.data.token);
            localStorage.setItem("admin_id", response.data.admin_id);
            localStorage.setItem("admin_name", response.data.name);
            localStorage.setItem("admin_email", response.data.email);

            console.log("Admin login successful");
            console.log("Admin token:", !!localStorage.getItem("admin_token"));

            navigate("/admin/dashboard");

        } catch (err) {
            setError(
                err.response?.data?.error ||
                "Invalid admin credentials."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">

            <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl shadow-xl">

                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-indigo-600 p-3 rounded-xl">
                        <ShieldCheck size={28} className="text-white" />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            Admin Login
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Learning Platform Administration
                        </p>
                    </div>
                </div>

                {error && (
                    <p className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-4">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    <input
                        type="email"
                        name="email"
                        placeholder="Admin Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700"
                    />

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full p-3 pr-12 rounded-lg bg-slate-800 text-white border border-slate-700"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            {showPassword
                                ? <EyeOff size={20} />
                                : <Eye size={20} />
                            }
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold p-3 rounded-lg"
                    >
                        {loading ? "Logging in..." : "Login as Admin"}
                    </button>

                </form>

                <p className="text-slate-400 text-center mt-6">
                    <Link
                        to="/login"
                        className="text-indigo-400 hover:underline"
                    >
                        Back to Student Login
                    </Link>
                </p>

            </div>
        </div>
    );
}

export default AdminLogin;
