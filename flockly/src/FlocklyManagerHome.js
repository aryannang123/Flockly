// src/FlocklyManagerHome.js
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, User, Edit2 } from "lucide-react";
import CreateEvent from "./components/CreateEvent";
import ChatModal from "./components/ChatModal";
import { authService } from "./services/api";

export default function FlocklyManagerHome() {
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // queries modal state (already present)
  const [queriesModalOpen, setQueriesModalOpen] = useState(false);
  const [queriesForEvent, setQueriesForEvent] = useState([]);
  const [queriesLoading, setQueriesLoading] = useState(false);
  const [selectedEventForQueries, setSelectedEventForQueries] = useState(null);
  const [selectedQueryId, setSelectedQueryId] = useState(null);
  const [openDirectChat, setOpenDirectChat] = useState(false);

  // registrations modal state (NEW)
  const [regsModalOpen, setRegsModalOpen] = useState(false);
  const [registrationsForEvent, setRegistrationsForEvent] = useState([]);
  const [regsLoading, setRegsLoading] = useState(false);
  const [selectedEventForRegs, setSelectedEventForRegs] = useState(null);

  useEffect(() => {
    fetchUser();
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.user) {
        setUser(response.user);
      }
    } catch (err) {
      console.error("fetchUser failed", err);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/events/manager", {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setEvents(data.events);
      } else {
        console.error("Failed to fetch events:", data.message);
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = "/";
  };

  const handleEventCreated = (newEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
  };

  const calculatePercentage = (event) => {
    if (!event.capacity || event.capacity === 0) return 0;
    return Math.round(((event.registeredCount || 0) / event.capacity) * 100);
  };

  const isFull = (event) => {
    return event.registeredCount >= event.capacity;
  };

  const getInitials = (name) => {
    if (!name) return "M";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // --- Queries handling (unchanged) ---
  const openQueriesForEvent = async (event) => {
    setSelectedEventForQueries(event);
    setQueriesModalOpen(true);
    setQueriesLoading(true);
    setQueriesForEvent([]);
    setSelectedQueryId(null);
    setOpenDirectChat(false);

    try {
      const res = await fetch(`http://localhost:5000/api/queries?eventId=${event._id}`, {
        credentials: "include",
      });
      const text = await res.text();
      let data = null;
      try { data = JSON.parse(text); } catch (e) { data = null; }

      if (!res.ok) {
        console.warn("Failed to fetch queries:", res.status, text);
        setQueriesForEvent([]);
      } else if (data && data.success && Array.isArray(data.queries)) {
        const filtered = data.queries.filter((q) => {
          if (!q.eventId) return false;
          const qEventId = typeof q.eventId === "string" ? q.eventId : (q.eventId._id || q.eventId.toString());
          return qEventId.toString() === event._id.toString();
        });
        setQueriesForEvent(filtered);
      } else if (Array.isArray(data)) {
        const filtered = data.filter(q => (q.eventId && q.eventId.toString() === event._id.toString()));
        setQueriesForEvent(filtered);
      } else {
        // fallback to fetch all and filter
        const res2 = await fetch(`http://localhost:5000/api/queries`, { credentials: "include" });
        const d2 = await res2.json();
        if (d2 && d2.success && Array.isArray(d2.queries)) {
          const filtered = d2.queries.filter(q => (q.eventId && (q.eventId._id || q.eventId).toString() === event._id.toString()));
          setQueriesForEvent(filtered);
        } else {
          setQueriesForEvent([]);
        }
      }
    } catch (err) {
      console.error("Error fetching queries:", err);
      setQueriesForEvent([]);
    } finally {
      setQueriesLoading(false);
    }
  };

  const openChatForQuery = (queryId) => {
    setSelectedQueryId(queryId);
    setOpenDirectChat(true);
  };

  const openNewChatForEvent = () => {
    setSelectedQueryId(null);
    setOpenDirectChat(true);
  };

  const closeQueriesModal = () => {
    setQueriesModalOpen(false);
    setQueriesForEvent([]);
    setSelectedEventForQueries(null);
    setSelectedQueryId(null);
    setOpenDirectChat(false);
  };

  // --- REGISTRATIONS handling (NEW) ---
  const openRegistrationsForEvent = async (event) => {
    setSelectedEventForRegs(event);
    setRegsModalOpen(true);
    setRegsLoading(true);
    setRegistrationsForEvent([]);

    try {
      const res = await fetch(`http://localhost:5000/api/registrations/event/${event._id}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        console.warn("Failed to fetch registrations:", res.status, data);
        setRegistrationsForEvent([]);
      } else if (data && data.success && Array.isArray(data.registrations)) {
        setRegistrationsForEvent(data.registrations);
      } else {
        setRegistrationsForEvent([]);
      }
    } catch (err) {
      console.error("Error fetching registrations:", err);
      setRegistrationsForEvent([]);
    } finally {
      setRegsLoading(false);
    }
  };

  const closeRegsModal = () => {
    setRegsModalOpen(false);
    setRegistrationsForEvent([]);
    setSelectedEventForRegs(null);
  };

  return (
    <div className="bg-white min-h-screen text-black flex flex-col items-center justify-start">
      {showCreateEvent ? (
        <div className="w-full">
          <div className="flex justify-between items-center p-6 border-b border-gray-300">
            <h2 className="text-2xl font-bold">Create Event</h2>
            <button
              onClick={() => setShowCreateEvent(false)}
              className="bg-red-500 text-black px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Back
            </button>
          </div>

          <div className="p-6">
            <CreateEvent
              onCancel={() => setShowCreateEvent(false)}
              onEventCreated={handleEventCreated}
            />
          </div>
        </div>
      ) : (
        <>
          {/* Top header */}
          <div className="w-full flex justify-between items-center p-6 border-b border-gray-300">
            <div className="text-left">
              <h2 className="text-2xl font-bold leading-tight">
                PLAN SMART. <br /> MANAGE BETTER.
              </h2>
            </div>

            {/* Navbar with Profile */}
            <nav className="flex items-center space-x-8 text-lg uppercase tracking-wide relative">
              {/* Removed top Event History & Queries links as requested */}

              <button
                onClick={() => setShowCreateEvent(true)}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
              >
                <Plus size={18} /> Create Event
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="rounded-full hover:opacity-80 transition"
                >
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-black"
                    />
                  ) : (
                    <div className="p-2 rounded-full bg-black text-white">
                      <User size={24} />
                    </div>
                  )}
                </button>

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
                              {user?.name || "Manager"}
                            </h3>
                            <button className="text-gray-600 hover:text-black transition">
                              <Edit2 size={16} />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600">
                            {user?.email || "manager@flockly.com"}
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

          {/* Sub heading & Logo */}
          <div className="text-center mt-4">
            <p className="text-gray-600 text-sm tracking-wide uppercase">
              Event Management Platform
            </p>
          </div>

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

          <div className="w-full border-t border-b border-gray-300 mt-8 py-4 text-center">
            <p className="uppercase text-gray-500 tracking-widest text-sm">
              Manage Your Hosted Events Below
            </p>
          </div>

          {/* Events List */}
          <div className="flex flex-col gap-6 mt-12 w-full max-w-4xl px-6 mb-12">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading events...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  No events created yet. Create your first event!
                </p>
              </div>
            ) : (
              events.map((event) => {
                const percentage = calculatePercentage(event);
                const full = isFull(event);

                return (
                  <div
                    key={event._id}
                    className="relative w-full h-20 bg-white border-4 border-black rounded-lg overflow-hidden shadow-lg"
                  >
                    {/* Progress Fill (behind overlay) */}
                    <div
                      className={`absolute top-0 left-0 h-full transition-all duration-700 z-0 ${
                        full ? "bg-red-600" : "bg-black"
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>

                    {/* Text Overlay */}
                    <div className="absolute inset-0 flex justify-between items-center px-6 z-20">
                      <span
                        className={`text-lg font-bold z-10 ${
                          percentage > 50 ? "text-white" : "text-black"
                        }`}
                      >
                        {event.eventName}
                      </span>
                      <div className="flex items-center gap-4 z-10">
                        <span
                          className={`text-sm font-semibold ${
                            percentage > 50 ? "text-white" : "text-black"
                          }`}
                        >
                          {event.registeredCount}/{event.capacity}
                        </span>

                        {/* View Registrations - now functional */}
                        <button
                          onClick={() => openRegistrationsForEvent(event)}
                          className="bg-black text-white px-3 py-1 rounded-md font-semibold hover:bg-gray-900 transition"
                        >
                          View Registrations
                        </button>

                        {/* Queries button: opens manager queries modal */}
                        <button
                          onClick={() => openQueriesForEvent(event)}
                          className={`px-3 py-1 rounded-md font-semibold transition ${
                            percentage > 50 ? "bg-white text-black" : "bg-black text-white"
                          }`}
                        >
                          Queries
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* --- Queries Modal (unchanged) --- */}
      {queriesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
          <div className="absolute inset-0 bg-black opacity-60" onClick={closeQueriesModal}></div>

          <div className="relative w-11/12 md:w-3/4 bg-white rounded-lg shadow-lg z-60 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                Queries for: {selectedEventForQueries?.eventName || "(event)"}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setOpenDirectChat(true); setSelectedQueryId(null); }}
                  className="px-3 py-1 rounded bg-black text-white"
                >
                  Start New Chat
                </button>
                <button
                  onClick={closeQueriesModal}
                  className="px-3 py-1 rounded bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>

            {queriesLoading ? (
              <div className="text-center py-6">Loading queries...</div>
            ) : queriesForEvent.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                No queries yet for this event.
                <div className="mt-4">
                  <button
                    onClick={() => { setOpenDirectChat(true); setSelectedQueryId(null); }}
                    className="px-4 py-2 rounded bg-black text-white"
                  >
                    Start a chat
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {queriesForEvent.map((q) => (
                  <div key={q._id} className="border rounded p-3 flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{q.userName || "Anonymous"}</div>
                      <div className="text-sm text-gray-600">{ (q.messages && q.messages.length>0) ? q.messages[q.messages.length-1].text : "No messages yet" }</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openChatForQuery(q._id)}
                        className="px-3 py-1 rounded bg-black text-white"
                      >
                        Open Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Registrations Modal (NEW) --- */}
      {regsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
          <div className="absolute inset-0 bg-black opacity-60" onClick={closeRegsModal}></div>

          <div className="relative w-11/12 md:w-3/4 bg-white rounded-lg shadow-lg z-60 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                Registrations for: {selectedEventForRegs?.eventName || "(event)"}
              </h3>
              <div>
                <button onClick={closeRegsModal} className="px-3 py-1 rounded bg-gray-200">Close</button>
              </div>
            </div>

            {regsLoading ? (
              <div className="text-center py-6">Loading registrations...</div>
            ) : registrationsForEvent.length === 0 ? (
              <div className="text-center py-8 text-gray-600">No registrations yet for this event.</div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-3">
                {registrationsForEvent.map((r) => (
                  <div key={r._id} className="border rounded p-3 flex flex-col md:flex-row md:justify-between md:items-center">
                    <div>
                      <div className="font-semibold">{r.name}</div>
                      <div className="text-sm text-gray-600">{r.email}</div>
                      {r.phoneNumber && <div className="text-sm text-gray-600">Phone: {r.phoneNumber}</div>}
                    </div>
                    <div className="text-sm text-gray-500 mt-3 md:mt-0">
                      {new Date(r.createdAt || r.registeredAt || Date.now()).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Chat modal (unchanged) --- */}
      {openDirectChat && selectedEventForQueries && (
        <ChatModal
          event={selectedEventForQueries}
          onClose={() => {
            setOpenDirectChat(false);
            openQueriesForEvent(selectedEventForQueries);
          }}
          initialQueryId={selectedQueryId}
          isManager={true}
        />
      )}
    </div>
  );
}
