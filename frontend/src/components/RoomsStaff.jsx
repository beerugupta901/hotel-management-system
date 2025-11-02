import React, { useEffect, useState } from "react";
import axios from "axios";

const RoomsStaff = () => {
  const [rooms, setRooms] = useState([]);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:5000/api/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(data);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      alert("Failed to fetch rooms.");
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleStatusChange = async (roomId, action) => {
    try {
      const token = localStorage.getItem("token");
      let url = "";
      if (action === "available") url = `/api/rooms/${roomId}/make-free`;
      if (action === "under-service") url = `/api/rooms/${roomId}/under-service`;

      await axios.put(`http://localhost:5000${url}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(`Room marked as ${action}`);
      fetchRooms();
    } catch (err) {
      console.error(err);
      alert("Failed to update room status");
    }
  };

  const handleDelete = async (roomId) => {
    try {
      if (!window.confirm("Are you sure you want to delete this room?")) return;
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Room deleted successfully.");
      fetchRooms();
    } catch (err) {
      alert("Failed to delete room.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Manage Rooms (Staff)</h2>
      {rooms.length === 0 ? (
        <p>No rooms found.</p>
      ) : (
        rooms.map((room) => (
          <div
            key={room._id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "15px",
              margin: "10px 0",
            }}
          >
            <h3>{room.name}</h3>
            <p>Price: ₹{room.price}</p>
            <p>Status: <b>{room.status}</b></p>

            <button onClick={() => handleStatusChange(room._id, "available")} style={{ marginRight: "10px" }}>
              Mark Available
            </button>
            <button onClick={() => handleStatusChange(room._id, "under-service")} style={{ marginRight: "10px" }}>
              Mark Under Service
            </button>
            <button onClick={() => handleDelete(room._id)} style={{ background: "red", color: "white" }}>
              Delete Room
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default RoomsStaff;
