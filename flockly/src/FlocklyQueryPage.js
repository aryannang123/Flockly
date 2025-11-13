// src/FlocklyQueryPage.js
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { User, Edit2 } from "lucide-react";
import { authService } from "./services/api";
import ChatModal from "./components/ChatModal";

export default function FlocklyQueryPage({ onViewEvent }) {
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Query page always in ask-mode
  const [openChatEvent, setOpenChatEvent] = useState(null);

  useEffect(() => {
    fetchUser();
    fetchEvents();
  }, []);

  const fetchUser = async () => {
    const response = await authService.getCurrentUser();
    console.log("User data:", response);
    if (response.success && response.user) {
      setUser(response.user);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/events", {
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setEvents(data.events);
      } else {
        console.error("Failed to fetch events:", data.message);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = "/";
  };

  const handleViewEvent = (eventId) => {
    onViewEvent(eventId);
  };

  // open chat modal for an event
  const handleAskQuery = (event) => {
    setOpenChatEvent(event);
  };

  const handleCloseChat = () => {
    setOpenChatEvent(null);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const calculatePercentage = (event) => {
    if (!event.capacity || event.capacity === 0) return 0;
    return Math.round(((event.registeredCount || 0) / event.capacity) * 100);
  };

  const isFull = (event) => {
    return event.registeredCount >= event.capacity;
  };

  return (
    <div className="bg-black min-h-screen text-white flex flex-col items-center justify-start">
      {/* Top navbar */}
      <div className="w-full flex justify-between items-center p-6 border-b border-gray-800">
        <div className="text-left">
          <h2 className="text-2xl font-bold leading-tight">
            EVENT MANAGEMENT PLATFORM
          </h2>
        </div>

        <nav className="flex items-center space-x-8 text-lg uppercase tracking-wide">
          <a
            href="/"
            onClick={(e) => {
              // allow back to home from query page
            }}
            className="hover:text-gray-400 transition"
          >
            Home
          </a>

          <a
            href="/query"
            className="hover:text-gray-400 transition"
          >
            Query
          </a>

          <a href="#" className="hover:text-gray-400 transition">
            Contact
          </a>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="rounded-full hover:opacity-80 transition"
            >
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white"
                />
              ) : (
                <div className="p-2 rounded-full bg-white text-black">
                  <User size={24} />
                </div>
              )}
            </button>

            {/* Profile Dropdown */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-64 z-50">
                <div className="rounded-xl border bg-white text-black shadow-lg">
                  <div className="p-6">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        {user && user.profilePicture && user.profilePicture.length > 0 ? (
                          <img
                            src={user.profilePicture}
                            alt={user.name || "Profile"}
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                            {getInitials(user?.name)}
                          </div>
                        )}
                        <button className="absolute bottom-0 right-0 bg-black text-white p-1.5 rounded-full hover:bg-gray-800 transition">
                          <Edit2 size={14} />
                        </button>
                      </div>
                      <div className="text-center flex items-center gap-2">
                        <h3 className="font-bold text-lg">
                          {user?.name || "User Name"}
                        </h3>
                        <button className="text-gray-600 hover:text-black transition">
                          <Edit2 size={16} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">
                        {user?.email || "user@example.com"}
                      </p>

                      <button
                        onClick={handleLogout}
                        className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Main heading */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="flex justify-center items-center w-full mt-8 overflow-hidden"
      >
        <h1
          className="font-extrabold leading-none tracking-tight w-full text-center"
          style={{
            fontSize: "14vw",
            letterSpacing: "-0.03em",
            lineHeight: "0.8",
          }}
        >
          FLOCKLY
        </h1>
      </motion.div>

      {/* Subheading */}
      <div className="w-full border-t border-b border-gray-800 mt-8 py-4 text-center">
        <p className="uppercase text-gray-400 tracking-widest text-sm">
          Explore the latest events happening now
        </p>
      </div>

      {/* Events section */}
      <div className="flex flex-col gap-6 mt-12 w-full max-w-4xl px-6 mb-12">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">
              No events available at the moment.
            </p>
          </div>
        ) : (
          events.map((event) => {
            const percentage = calculatePercentage(event);
            const full = isFull(event);

            return (
              <div
                key={event._id}
                className="relative w-full h-20 bg-black border-4 border-white rounded-lg overflow-hidden shadow-lg"
              >
                {/* Progress bar */}
                <div
                  className={`absolute top-0 left-0 h-full transition-all duration-700 ${full ? "bg-red-600" : "bg-white"}`}
                  style={{ width: `${percentage}%` }}
                ></div>

                {/* Overlay text & buttons */}
                <div className="absolute inset-0 flex justify-between items-center px-6">
                  {/* Event Name */}
                  <span className="text-white font-extrabold text-lg tracking-wide z-10 drop-shadow-lg">
                    {event.eventName}
                  </span>

                  <div className="flex items-center gap-4 z-10">
                    {/* Price / Status */}
                    <span className={`font-semibold text-lg ${full ? "text-white" : "text-black"}`}>
                      {full ? "Full" : `₹${event.price}`}
                    </span>

                    {/* Ask Query Button (query page) */}
                    <button
                      onClick={() => handleAskQuery(event)}
                      className="bg-white text-black px-4 py-2 rounded-md font-semibold hover:bg-gray-200 transition"
                    >
                      Ask Query
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Chat modal (asked queries) */}
      {openChatEvent && <ChatModal event={openChatEvent} onClose={handleCloseChat} />}
    </div>
  );
}
