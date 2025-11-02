import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const isLoggedIn = !!localStorage.getItem("token");
  const name = localStorage.getItem("name") || "User";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const avatarColor = useMemo(() => {
    const colors = ["#FFB6C1", "#FFD700", "#87CEFA", "#90EE90", "#FFA07A", "#9370DB"];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }, [name]);

  return (
    <nav className="navbar">
      <div className="nav-left">
        <img src={logo} alt="Logo" className="nav-logo" />
        <Link to="/">Rooms</Link>
        {isLoggedIn && role === "customer" && <Link to="/bookings">My Bookings</Link>}
        {isLoggedIn && role === "staff" && (
          <>
            <Link to="/add-room">Add Room</Link>
            <Link to="/all-bookings">All Bookings</Link>
          </>
        )}
      </div>

      <div className="nav-right">
        {!isLoggedIn ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup" className="signup-btn">Signup</Link>
          </>
        ) : (
          <>
            <div
              className="avatar"
              style={{ backgroundColor: avatarColor }}
              title={name}
            >
              {name[0]}
            </div>
            <span>{name}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
