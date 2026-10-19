import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

const API_URL = "http://localhost:5000";

function Auth({ mode, onLogin }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/${isRegister ? "register" : "login"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isRegister ? { name, email, password } : { email, password }
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      if (isRegister) {
        setError("Registration successful! You can now log in.");
        setPassword("");
      } else {
        onLogin(data);
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <Link className="auth-logo" to="/">i<span>MOVIES</span></Link>

        <p className="auth-eyebrow">
          {isRegister ? "JOIN THE EXPERIENCE" : "WELCOME BACK"}
        </p>
        <h1>{isRegister ? "Create account" : "Sign in"}</h1>
        <p className="auth-subtitle">
          {isRegister
            ? "Create your account to book your next movie."
            : "Sign in to continue your movie experience."}
        </p>

        {isRegister && (
          <label>
            Full name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              placeholder="Your name"
            />
          </label>
        )}

        <label>
          Email address
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete={isRegister ? "new-password" : "current-password"}
            placeholder="At least 8 characters"
          />
        </label>

        {error && <p className="auth-message" role="status">{error}</p>}

        <button className="auth-submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : isRegister
              ? "Create account"
              : "Sign in"}
        </button>

        <p className="auth-switch">
          {isRegister ? "Already have an account?" : "New to IMovies?"}{" "}
          <Link to={isRegister ? "/login" : "/register"}>
            {isRegister ? "Sign in" : "Create account"}
          </Link>
        </p>

        <Link className="auth-home" to="/">← Back to movies</Link>
      </form>
    </main>
  );
}

export default Auth;
