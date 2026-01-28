import { useState } from "react";
import { loginUser } from "../api/auth";
import { Link, useNavigate } from "react-router-dom";
import { useHomeState } from "../context/HomeStateContext";
import { ChevronLeft, Lock } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { setUser } = useHomeState();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await loginUser(form);
      const { token, user } = res.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("userId", user._id);
      localStorage.setItem("user", JSON.stringify(user)); // Store full user for persistence

      setUser(user);

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError("Invalid credentials. Please try again.");
      console.error("Login failed", err);
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center bg-white px-6">
      {/* Back Button */}
      <Link to="/" className="mb-12 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors">
        <ChevronLeft size={14} /> Back to Home
      </Link>

      <div className="w-full max-w-sm">
        {/* Branding Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-900 text-white mb-6">
            <Lock size={20} />
          </div>
          <h2 className="font-serif text-4xl font-black tracking-tighter text-slate-900 lowercase italic">
            Member <span className="text-blue-600">Access</span>
          </h2>
          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Verbis AI Intelligence Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border-l-2 border-red-500 text-red-600 text-[11px] font-bold uppercase tracking-wider">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 ml-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="name@example.com"
              className="w-full p-4 border border-slate-200 focus:border-blue-600 outline-none transition-colors font-sans text-sm"
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 ml-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className="w-full p-4 border border-slate-200 focus:border-blue-600 outline-none transition-colors font-sans text-sm"
              onChange={handleChange}
              required
            />
          </div>

          <button className="w-full bg-slate-900 text-white py-4 text-xs font-black uppercase tracking-[0.3em] hover:bg-blue-600 transition-all duration-300 mt-2 shadow-lg shadow-slate-200">
            Sign In
          </button>
        </form>

        <div className="mt-10 pt-10 border-t border-slate-100 text-center">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline underline-offset-4 ml-1">
              Join the network
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}