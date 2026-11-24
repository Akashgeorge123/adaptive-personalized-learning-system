
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        try {
            const response = await api.post("forgot-password/", {
                email
            });

            setMessage(response.data.message);

        } catch (err) {
            setError(
                err.response?.data?.error ||
                "Unable to send reset link. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">

            <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl shadow-xl">

                <h1 className="text-3xl font-bold text-white mb-2">
                    Forgot Password?
                </h1>

                <p className="text-slate-400 mb-6">
                    Enter your registered email address and we'll send you a password reset link.
                </p>

                {message && (
                    <p className="bg-emerald-500/10 text-emerald-400 p-3 rounded-lg mb-4">
                        {message}
                    </p>
                )}

                {error && (
                    <p className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-4">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold p-3 rounded-lg"
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>

                </form>

                <p className="text-center text-slate-400 mt-6">
                    Remember your password?{" "}
                    <Link to="/login" className="text-indigo-400 hover:underline">
                        Back to Login
                    </Link>
                </p>

            </div>
        </div>
    );
}

export default ForgotPassword;
