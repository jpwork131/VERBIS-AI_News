import { useState } from "react";
import { useAuthModal } from "../../context/AuthModalContext";
import { loginUser } from "../../api/auth";
import { Link } from "react-router-dom";

export default function LoginModal() {
  const { isOpen, closeModal, afterLoginAction } = useAuthModal();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(  {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      closeModal();

      if (typeof afterLoginAction === "function") afterLoginAction();
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Login Required</h2>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            className="w-full border p-2 rounded"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full border p-2 rounded"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full bg-black text-white py-2 rounded">
            Login
          </button>
        </form>

        <button
          onClick={closeModal}
          className="mt-4 text-sm text-gray-500"
        >
          Cancel
        </button>
        <div className="mt-4 text-sm text-center">
        <span>Don't have an account? </span>
        <Link
            to="/register"
            className="text-blue-500 hover:underline"
            onClick={closeModal} 
        >
            Register
        </Link>
        </div>
      </div>
    </div>
  );
}
