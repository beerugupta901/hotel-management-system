// src/components/Login.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);

      console.log("login response:", res.data);

      const token = res.data.token;
      const role = res.data.role || res.data.user?.role;
      const name = res.data.name || res.data.user?.name;

      if (!token) throw new Error("No token returned from server");

      localStorage.setItem("token", token);
      if (role) localStorage.setItem("role", role);
      if (name) localStorage.setItem("name", name);

      // 🔥 Trigger re-render across the app immediately
      window.dispatchEvent(new Event("storage"));

      // Redirect based on role
      if (role === "staff") navigate("/all-bookings");
      else navigate("/bookings");

      alert("Login successful!");
    } catch (err) {
      console.error("Login failed:", err, err.response?.data);
      setError(err.response?.data?.message || err.message || "Login failed");
    }
  };

return (
  <div style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f7f8fa"
  }}>
    <div style={{
      background: "white",
      padding: "40px 50px",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      width: "350px",
      textAlign: "center"
    }}>
      <img src="/logo.png" alt="Logo" style={{ height: "60px", marginBottom: "15px" }} />
      <h2>Welcome Back</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>Login to continue</p>

      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit" style={{ width: "100%", marginTop: "10px" }}>Login</button>
      </form>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

      <p style={{ marginTop: "15px" }}>
        Don’t have an account? <a href="/signup">Signup</a>
      </p>
    </div>
  </div>
);

};

export default Login;
