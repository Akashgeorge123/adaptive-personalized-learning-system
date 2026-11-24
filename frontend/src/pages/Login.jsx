
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { Eye, EyeOff } from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("login/", formData);

      // Save authentication details
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("student_id", response.data.student_id);
      localStorage.setItem("student_name", response.data.name);
      localStorage.setItem("student_email", response.data.email);

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">

      <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl shadow-xl">

        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome Back
        </h1>

        <p className="text-slate-400 mb-6">
          Login to continue your learning journey.
        </p>

        {error && (
          <p className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="email"
            name="email"
            placeholder="Email Address"
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
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

          <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-indigo-400 hover:text-indigo-300 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold p-3 rounded-lg"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="text-slate-400 text-center mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-400 hover:underline">
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;
