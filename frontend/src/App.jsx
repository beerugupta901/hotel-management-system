import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Signup from "./components/Signup";
import RoomsCustomer from "./components/RoomsCustomer";
import RoomsStaff from "./components/RoomsStaff";
import Bookings from "./components/Bookings";
import AddRoom from "./components/AddRoom";
import AllBookings from "./components/AllBookings";
import React, { useEffect, useState } from "react";

function App() {
  const [role, setRole] = useState(localStorage.getItem("role"));

  // 👂 Listen to changes in localStorage (login, logout, switch)
  useEffect(() => {
    const updateRole = () => setRole(localStorage.getItem("role"));
    window.addEventListener("storage", updateRole);
    return () => window.removeEventListener("storage", updateRole);
  }, []);

  return (
    <Router>
      <Navbar />
      <Routes>
        {role === "staff" ? (
          <Route path="/" element={<RoomsStaff />} />
        ) : (
          <Route path="/" element={<RoomsCustomer />} />
        )}

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/add-room" element={<AddRoom />} />
        <Route path="/all-bookings" element={<AllBookings />} />
      </Routes>
    </Router>
  );
}

export default App;
