import React, { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { jwtDecode } from "jwt-decode";
import "react-calendar/dist/Calendar.css"; // default calendar styles
import "../App.css"; // your custom overrides


const RoomsCustomer = () => {
  const [rooms, setRooms] = useState([]);
  const [bookedDates, setBookedDates] = useState({});
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const userRole = token ? jwtDecode(token)?.role : "customer";

  // 🧭 Fetch all rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/rooms");
        setRooms(res.data);
        res.data.forEach((r) => fetchBookedDates(r._id));
      } catch (err) {
        console.error("fetchRooms err:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // 📅 Fetch booked dates for room
  const fetchBookedDates = async (roomId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/bookings/room/${roomId}`
      );
      const dates = [];
      res.data.forEach((booking) => {
        const start = new Date(booking.checkIn);
        const end = new Date(booking.checkOut);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          dates.push(new Date(d).toDateString());
        }
      });
      setBookedDates((prev) => ({
        ...prev,
        [roomId]: Array.from(new Set(dates)),
      }));
    } catch (err) {
      console.error("fetchBookedDates error:", err.response?.data || err.message);
      setBookedDates((prev) => ({ ...prev, [roomId]: [] }));
    }
  };

  // ✅ Customer booking logic
  const handleBookRoom = async () => {
    if (!selectedRoom) return alert("Select a room");
    const [checkIn, checkOut] = dateRange;
    try {
      await axios.post(
        "http://localhost:5000/api/bookings",
        { roomId: selectedRoom._id, checkIn, checkOut },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Booked!");
      await fetchBookedDates(selectedRoom._id);
      setShowCalendar(false);
    } catch (err) {
      console.error("booking err:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Booking failed");
    }
  };

  // ✅ Staff actions
  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Room deleted!");
      setRooms((prev) => prev.filter((r) => r._id !== roomId));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete room");
    }
  };

  const handleEditRoom = async (roomId) => {
    try {
      await axios.put(`http://localhost:5000/api/rooms/${roomId}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Room updated!");
      setEditMode(false);
      const res = await axios.get("http://localhost:5000/api/rooms");
      setRooms(res.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update room");
    }
  };

  const handleMarkStatus = async (roomId, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/rooms/${roomId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Room marked as ${status}!`);
      const res = await axios.get("http://localhost:5000/api/rooms");
      setRooms(res.data);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const tileDisabled = ({ date }) => {
    if (!selectedRoom) return false;
    const isBooked = bookedDates[selectedRoom._id]?.includes(date.toDateString());
    const today = new Date();
    const max = new Date();
    max.setMonth(max.getMonth() + 1);
    return isBooked || date < today || date > max;
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>{userRole === "staff" ? "Manage Rooms" : "Available Rooms"}</h2>

    <div
  style={{
    display: "flex",
    flexDirection: "column", // 👈 stack rooms vertically
    gap: 20,                 // space between each room
    alignItems: "center",    // center horizontally
    marginTop: 20,
  }}
>

        {rooms.map((room) => (
          <div
            key={room._id}
            style={{
              border: "1px solid #ccc",
              padding: 12,
              width: "100%",
              maxWidth: "100%",
              borderRadius: 8,
            }}
          >
            <h3>
              {room.name}{" "}
              <span
                style={{
                  fontSize: 12,
                  color:
                    room.status === "under service"
                      ? "orange"
                      : room.status === "occupied"
                      ? "red"
                      : "green",
                }}
              >
                ({room.status || "available"})
              </span>
            </h3>
            <p>{room.description}</p>
            <p>
              <b>₹{room.price}</b>
            </p>

            {/* ✅ 7-day color status */}
            <div style={{ display: "flex", gap: 6 }}>
              {next7Days.map((d) => {
                const isBooked = (bookedDates[room._id] || []).includes(
                  new Date(d).toDateString()
                );
                return (
                  <div
                    key={d}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isBooked ? "red" : "green",
                      color: "white",
                      fontSize: 12,
                      flexDirection: "column",
                    }}
                  >
                    {d.getDate()}
                    <br />
                    {d.toLocaleString("default", { month: "short" })}
                  </div>
                );
              })}
            </div>

            {userRole === "staff" ? (
              <>
                <button
                  onClick={() => {
                    setEditMode(true);
                    setEditData({
                      name: room.name,
                      price: room.price,
                      description: room.description,
                    });
                    setSelectedRoom(room);
                  }}
                  style={{ marginTop: 10 }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteRoom(room._id)}
                  style={{
                    marginLeft: 10,
                    background: "red",
                    color: "white",
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: "5px",
                  }}
                >
                  Delete
                </button>
                <div style={{ marginTop: 10 }}>
                  <button
                    onClick={() => handleMarkStatus(room._id, "under service")}
                  >
                    Mark Under Service
                  </button>
                  <button
                    onClick={() => handleMarkStatus(room._id, "available")}
                    style={{ marginLeft: 8 }}
                  >
                    Mark Available
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setSelectedRoom(room);
                    fetchBookedDates(room._id);
                    setShowCalendar(
                      (s) =>
                        s && selectedRoom?._id === room._id ? false : true
                    );
                  }}
                  style={{ marginTop: 10 }}
                >
                  {showCalendar && selectedRoom?._id === room._id
                    ? "Hide Calendar"
                    : "See more dates"}
                </button>

                {showCalendar && selectedRoom?._id === room._id && (
                  <div style={{ marginTop: 10 }}>
                    <Calendar
                      selectRange
                      onChange={setDateRange}
                      value={dateRange}
                      tileDisabled={tileDisabled}
                      minDate={new Date()}
                      maxDate={new Date(
                        new Date().setMonth(new Date().getMonth() + 1)
                      )}
                    />
                    <button
                      onClick={handleBookRoom}
                      style={{
                        marginTop: 8,
                        background: "blue",
                        color: "white",
                        padding: "8px 12px",
                        border: "none",
                        borderRadius: "5px",
                      }}
                    >
                      Book Room
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* ✏️ Edit Popup */}
      {editMode && selectedRoom && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: 20,
              borderRadius: 8,
              width: 300,
            }}
          >
            <h3>Edit Room</h3>
            <input
              type="text"
              placeholder="Name"
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Price"
              value={editData.price}
              onChange={(e) =>
                setEditData({ ...editData, price: e.target.value })
              }
            />
            <textarea
              placeholder="Description"
              value={editData.description}
              onChange={(e) =>
                setEditData({ ...editData, description: e.target.value })
              }
            />
            <div style={{ marginTop: 10 }}>
              <button
                onClick={() => handleEditRoom(selectedRoom._id)}
                style={{ marginRight: 10 }}
              >
                Save
              </button>
              <button onClick={() => setEditMode(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsCustomer;
