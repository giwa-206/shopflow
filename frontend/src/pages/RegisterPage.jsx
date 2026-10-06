import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create account</h1>
        <p className="muted">Join ShopFlow in seconds</p>

        {error && <div className="alert alert-error">{error}</div>}

        <label>
          Full name (optional)
          <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Jane Doe" />
        </label>

        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" />
        </label>

        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Min 6 characters" minLength={6} />
        </label>

        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Creating account..." : "Register"}
        </button>

        <p className="muted center">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
}