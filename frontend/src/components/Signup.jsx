import { useState } from "react";
import axios from "axios";

function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/signup", form);
      alert("Signup successful!");
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      alert("Signup failed!");
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
      <h2>Create Account</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>Join our platform</p>

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
        <button type="submit" style={{ width: "100%", marginTop: "10px" }}>Signup</button>
      </form>

      <p style={{ marginTop: "15px" }}>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  </div>
);

}

export default Signup;
