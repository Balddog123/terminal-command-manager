import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5050/login";

function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch(`${API_URL}/${encodeURIComponent(password)}`, {
        method: "GET",
      });
      console.log(res.status);
      if (res.status === 202) {
        console.log("Login successful...");
        navigate("/commands"); // route to CommandTable
      } else {
        const text = await res.text();
        console.log(text);
        setError("Invalid password");
      }
    } catch (err) {
      setError("Server error: " + err.message);
    }
  }

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />
        <button type="submit" className="login-button">Login</button>
      </form>
      {error && <p className="login-error">{error}</p>}
    </div>
  );
}


export default LoginPage;
