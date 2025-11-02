import React, { useEffect, useState } from "react";
import axios from "axios";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/bookings/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(res.data);
      } catch (err) {
        setError("Failed to fetch your bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCheckout = async (bookingId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/bookings/${bookingId}/checkout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 🧹 Remove the booking from UI instantly
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));

      alert("Checked out successfully!");
    } catch (error) {
      alert("Checkout failed.");
    }
  };

  if (loading) return <p>Loading your bookings...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (bookings.length === 0) return <p>No active bookings found.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Bookings</h2>
      <ul>
        {bookings.map((booking) => (
          <li key={booking._id}>
            <strong>Room:</strong> {booking.room?.name || "N/A"} <br />
            <strong>Check-in:</strong>{" "}
            {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : "N/A"} <br />
            <strong>Check-out:</strong>{" "}
            {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : "N/A"} <br />
            <button onClick={() => handleCheckout(booking._id)}>Check Out</button>
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Bookings;
