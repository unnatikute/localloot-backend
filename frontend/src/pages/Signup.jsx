import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { UserPlus, User, Mail, Lock, MapPin, Store } from "lucide-react";
import AuthImagePanel from "../components/AuthImagePanel.jsx";

const SIGNUP_IMAGE =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=900&auto=format&fit=crop";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [area, setArea] = useState("");
  const [shopName, setShopName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("https://localloot-backend.onrender.com/api/auth/signup",  {
        name,
        email,
        password,
        role,
        area,
        shopName: role === "SHOPKEEPER" ? shopName : null,
      });

      if (response.status === 200 || response.status === 201) {
        alert("Account created successfully! Please log in.");
        navigate("/login");
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setError("Email already registered");
      } else {
        setError(err.response?.data || "Sign up failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

 return (
    <div className="auth-page">
      <div className="auth-blob auth-blob-1" aria-hidden="true" />
      <div className="auth-blob auth-blob-2" aria-hidden="true" />
      <div className="auth-blob auth-blob-3" aria-hidden="true" />

      <div className="auth-layout animate-auth-fade-in">
        <AuthImagePanel
          image={SIGNUP_IMAGE}
          alt="Local shop interior with products on display"
          title="Join the LocalLoot community"
          description="Create your account as a shopper or shopkeeper and connect with your neighbourhood marketplace."
          highlights={[
            "Free account for customers",
            "List your shop as a merchant",
            "Reach nearby customers easily",
          ]}
        />

        <div className="auth-card max-w-md lg:max-w-none mx-auto w-full self-center">
        <div className="auth-card-header">
          <div className="auth-icon-wrap">
            <UserPlus className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join LocalLoot and start exploring neighbourhood deals</p>
        </div>

        <form className="space-y-4 sm:space-y-5" onSubmit={onSubmit}>
          <div>
            <label htmlFor="signup-name" className="auth-label">Name</label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                id="signup-name"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="auth-input pl-11"
              />
            </div>
          </div>

          <div>
            <label htmlFor="signup-email" className="auth-label">Email</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                id="signup-email"
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input pl-11"
              />
            </div>
          </div>

          <div>
            <label htmlFor="signup-password" className="auth-label">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                id="signup-password"
                placeholder="Create a password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input pl-11"
              />
            </div>
          </div>

          <div>
            <label htmlFor="signup-role" className="auth-label">Account Type</label>
            <select
              id="signup-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="auth-select"
            >
              <option value="USER">Customer</option>
              <option value="SHOPKEEPER">Shopkeeper</option>
            </select>
          </div>

          {role === "SHOPKEEPER" && (
            <div className="animate-auth-fade-in">
              <label htmlFor="signup-shop" className="auth-label">Shop Name</label>
              <div className="relative group">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  id="signup-shop"
                  placeholder="Your shop name"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  required
                  className="auth-input pl-11"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="signup-area" className="auth-label">Area</label>
            <div className="relative group">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                id="signup-area"
                placeholder="Your neighbourhood or city"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                required
                className="auth-input pl-11"
              />
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Login
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}