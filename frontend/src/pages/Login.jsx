import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../store/auth.jsx";
import { createApi } from "../api/client.js";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const roleParam = params.get("role");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ✅ HARDCODED ADMIN LOGIN
      if (email === "admin@gmail.com" && password === "admin123") {
        const adminUser = {
          name: "Admin",
          email: "admin@gmail.com",
          role: "ADMIN",
          token: "hardcoded-admin-token",
        };

        login(adminUser);
        navigate("/");
        return;
      }
      const api = createApi();
      // ✅ NORMAL BACKEND LOGIN
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      if (response.status === 200) {
        let role = response.data.role || "USER";

        role = role.toUpperCase().includes("ADMIN")
          ? "ADMIN"
          : role.toUpperCase().includes("SHOP")
            ? "SHOPKEEPER"
            : "USER";

        const userData = {
          ...response.data,
          role,
        };

        login(userData);
        navigate("/");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid password");
      } else if (err.response?.status === 404) {
        setError("User not found");
      } else {
        setError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow mt-10">
      <h2 className="text-2xl font-bold mb-4">Login to your account</h2>

      <form className="space-y-4" onSubmit={onSubmit}>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border p-2"
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border p-2"
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded disabled:bg-gray-400"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="text-sm mt-3 text-center">
        Don't have an account?{" "}
        <Link to="/signup" className="text-blue-600">
          Sign up
        </Link>
      </p>
    </div>
  );
}
