
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    interests: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      await api.post("register/", formData);

      alert("Registration successful! Please log in.");
      navigate("/login");
    } catch (err) {
      const data = err.response?.data;

      setError(
        typeof data === "object"
          ? Object.entries(data)
              .map(([field, messages]) =>
                `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`
              )
              .join(" | ")
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl shadow-xl">

        <h1 className="text-3xl font-bold text-white mb-2">
          Create Account
        </h1>

        <p className="text-slate-400 mb-6">
          Join your personalized learning platform.
        </p>

        {error && (
          <p className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700"
          />

          <input
            type="password"
            name="password"
            placeholder="Password (minimum 8 characters)"
            value={formData.password}
            onChange={handleChange}
            minLength={8}
            required
            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700"
          />

          <textarea
            name="interests"
            placeholder="Your learning interests (e.g. Python, AI, Web Development)"
            value={formData.interests}
            onChange={handleChange}
            rows={3}
            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold p-3 rounded-lg"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>

        </form>

        <p className="text-slate-400 text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-400 hover:underline">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;
