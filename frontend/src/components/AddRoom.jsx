import React, { useState } from "react";
import axios from "axios";

const AddRoom = () => {
  const [room, setRoom] = useState({ name: "", description: "", price: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setRoom({ ...room, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/rooms", room, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("✅ Room added successfully!");
      setRoom({ name: "", description: "", price: "" });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add room";
      setMessage(`❌ ${msg}`);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Add Room</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Room Name (e.g. Deluxe Room)"
          onChange={handleChange}
          value={room.name}
          required
        />
        <input
          type="text"
          name="description"
          placeholder="Description (e.g. King bed, AC, Wi-Fi)"
          onChange={handleChange}
          value={room.description}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          onChange={handleChange}
          value={room.price}
          required
        />
        <button type="submit">Add Room</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AddRoom;
