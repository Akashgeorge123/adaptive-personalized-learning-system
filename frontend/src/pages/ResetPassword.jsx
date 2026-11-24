
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { Eye, EyeOff } from "lucide-react";

function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        setError("");
        setMessage("");

        if (!token) {
            setError("Invalid or missing reset link.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("reset-password/", {
                token,
                password
            });

            setMessage(response.data.message);

            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (err) {
            setError(
                err.response?.data?.error ||
                "Unable to reset password. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">

            <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl shadow-xl">

                <h1 className="text-3xl font-bold text-white mb-2">
                    Reset Password
                </h1>

                <p className="text-slate-400 mb-6">
                    Create a new password for your account.
                </p>

                {error && (
                    <p className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-4">
                        {error}
                    </p>
                )}

                {message && (
                    <p className="bg-emerald-500/10 text-emerald-400 p-3 rounded-lg mb-4">
                        {message}
                    </p>
                )}

                {!token ? (
                    <div>
                        <p className="text-red-400 mb-5">
                            Your reset link is invalid or missing its token.
                        </p>

                        <Link
                            to="/forgot-password"
                            className="text-indigo-400 hover:underline"
                        >
                            Request a new reset link
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">

            <div className="relative">
            <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 pr-12 rounded-lg bg-slate-800 border border-slate-700"
                minLength={8}
                required
            />

            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            </div>

            <div className="relative">
            <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 pr-12 rounded-lg bg-slate-800 border border-slate-700"
                minLength={8}
                required
            />

            <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            </div>

                        <button
                            type="submit"
                            disabled={loading || !!message}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold p-3 rounded-lg"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>

                    </form>
                )}

                <p className="text-center text-slate-400 mt-6">
                    <Link to="/login" className="text-indigo-400 hover:underline">
                        Back to Login
                    </Link>
                </p>

            </div>
        </div>
    );
}

export default ResetPassword;
