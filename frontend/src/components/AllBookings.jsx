import React, { useEffect, useState } from "react";
import axios from "axios";

const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch only active bookings (booked/checkedin)
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:5000/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter only booked or checked-in rooms
      const active = data.filter((b) =>
        ["booked", "checkedin"].includes(b.status)
      );
      setBookings(active);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      alert("Failed to fetch bookings (Staff only).");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // ✅ Make room free
  const handleMakeFree = async (bookingId, roomId) => {
  try {
    setLoading(true);
    const token = localStorage.getItem("token");

    // ✅ delete booking
    await axios.delete(`http://localhost:5000/api/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // ✅ make room available
    await axios.put(
      `http://localhost:5000/api/rooms/${roomId}/make-free`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("✅ Room made available!");
    fetchBookings();
  } catch (err) {
    alert("Failed to make room free.");
    console.error(err);
  } finally {
    setLoading(false);
  }
};

const handleUnderService = async (roomId) => {
  try {
    setLoading(true);
    const token = localStorage.getItem("token");
    await axios.put(
      `http://localhost:5000/api/rooms/${roomId}/under-service`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert("🛠 Room marked under service!");
    fetchBookings();
  } catch (err) {
    alert("Failed to mark room under service.");
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  return (
    <div style={{ padding: "20px" }}>
      <h2>All Active Bookings (Staff)</h2>

      {bookings.length === 0 ? (
        <p>No active bookings right now.</p>
      ) : (
        bookings.map((b) => (
          <div
            key={b._id}
            style={{
              border: "1px solid #ccc",
              margin: "10px",
              padding: "10px",
              borderRadius: "8px",
              background: "#f9f9f9",
            }}
          >
            <h3>Room: {b.room?.name || "N/A"}</h3>
            <p>
              Booked by: {b.customer?.name || "N/A"} (
              {b.customer?.email || "N/A"})
            </p>
            <p>
              Check-in:{" "}
              {b.checkIn ? new Date(b.checkIn).toLocaleDateString() : "N/A"}
            </p>
            <p>
              Check-out:{" "}
              {b.checkOut ? new Date(b.checkOut).toLocaleDateString() : "N/A"}
            </p>

            <button
              onClick={() => handleMakeFree(b._id, b.room?._id)}
              disabled={loading}
              style={{
                marginRight: "10px",
                background: "#4caf50",
                color: "white",
                border: "none",
                padding: "5px 10px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              {loading ? "Processing..." : "Make Room Free"}
            </button>

            <button
              onClick={() => handleUnderService(b.room?._id)}
              disabled={loading}
              style={{
                background: "#ff9800",
                color: "white",
                border: "none",
                padding: "5px 10px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              {loading ? "Processing..." : "Mark Under Service"}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default AllBookings;
