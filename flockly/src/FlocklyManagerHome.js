import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import CreateEvent from "./components/CreateEvent";

export default function FlocklyManagerHome() {
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, []);

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

  const handleEventCreated = (newEvent) => {
    setEvents([newEvent, ...events]);
  };

  // ✅ Prevent divide by 0
  const calculatePercentage = (event) => {
    if (!event.capacity || event.capacity === 0) return 0;
    return Math.round(((event.registeredCount || 0) / event.capacity) * 100);
  };

  const isFull = (event) => {
    return event.registeredCount >= event.capacity;
  };

  return (
    <div className="bg-white min-h-screen text-black flex flex-col items-center justify-start">
      {showCreateEvent ? (
        // ✅ Create Event Section
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
          {/* ✅ Manager Dashboard */}
          <div className="w-full flex justify-between items-center p-6 border-b border-gray-300">
            <div className="text-left">
              <h2 className="text-2xl font-bold leading-tight">
                PLAN SMART. <br /> MANAGE BETTER.
              </h2>
            </div>

            {/* Navbar */}
            <nav className="flex space-x-8 text-lg uppercase tracking-wide">
              <a href="#" className="hover:text-blue-600 transition">
                Event History
              </a>
              <a href="#" className="hover:text-blue-600 transition">
                Queries
              </a>
              <button
                onClick={() => setShowCreateEvent(true)}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
              >
                <Plus size={18} /> Create Event
              </button>
            </nav>
          </div>

          {/* Sub heading */}
          <div className="text-center mt-4">
            <p className="text-gray-600 text-sm tracking-wide uppercase">
              Event Management Platform
            </p>
          </div>

          {/* Logo */}
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

          {/* Divider Line */}
          <div className="w-full border-t border-b border-gray-300 mt-8 py-4 text-center">
            <p className="uppercase text-gray-500 tracking-widest text-sm">
              Manage Your Hosted Events Below
            </p>
          </div>

          {/* ✅ Events List */}
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
                    {/* Progress Fill */}
                    <div
                      className={`absolute top-0 left-0 h-full transition-all duration-700 ${
                        full ? "bg-red-600" : "bg-black"
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>

                    {/* Text Overlay */}
                    <div className="absolute inset-0 flex justify-between items-center px-6 z-10">
                      <span className="text-black text-lg font-bold z-10">
                        {event.eventName}
                      </span>
                      <div className="flex items-center gap-4 z-10">
                        <span className="text-black text-sm font-semibold">
                          {event.registeredCount}/{event.capacity}
                        </span>
                        {!full && (
                          <button className="bg-black text-white px-3 py-1 rounded-md font-semibold hover:bg-gray-900 transition">
                            Manage Event
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
