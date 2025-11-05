import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

export default function FlocklyManagerHome() {
  const events = [
    { name: 'Hackathon 2025', percent: 75, hasButton: true },
    { name: 'Startup Pitch Fiesta', percent: 100, full: true, hasButton: false },
    { name: 'Concert Vibes', percent: 40, hasButton: true }
  ];

  return (
    <div className="bg-white min-h-screen text-black flex flex-col items-center justify-start">
      {/* Top tagline section */}
      <div className="w-full flex justify-between items-center p-6 border-b border-gray-300">
        <div className="text-left">
          <h2 className="text-2xl font-bold leading-tight">
            PLAN SMART. <br /> MANAGE BETTER.
          </h2>
        </div>

        {/* Navbar */}
        <nav className="flex space-x-8 text-lg uppercase tracking-wide">
          <a href="#" className="hover:text-blue-600 transition">Event History</a>
          <a href="#" className="hover:text-blue-600 transition">Queries</a>
          <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition flex items-center gap-2">
            <Plus size={18} /> Create Event
          </button>
        </nav>
      </div>

      {/* Sub tagline */}
      <div className="text-center mt-4">
        <p className="text-gray-600 text-sm tracking-wide uppercase">
          Event Management Platform
        </p>
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
            fontSize: '14vw',
            letterSpacing: '-0.03em',
            lineHeight: '0.8',
          }}
        >
          FLOCKLY
        </h1>
      </motion.div>

      {/* Decorative lines */}
      <div className="w-full border-t border-b border-gray-300 mt-8 py-4 text-center">
        <p className="uppercase text-gray-500 tracking-widest text-sm">
          Manage Your Hosted Events Below
        </p>
      </div>

      {/* Event status horizontal bars */}
      <div className="flex flex-col gap-6 mt-12 w-full max-w-4xl px-6">
        {events.map((event, idx) => (
          <div key={idx} className="relative w-full h-20 bg-white border-4 border-black rounded-lg overflow-hidden shadow-lg">
            {/* Black progress fill based on percentage */}
            <div
              className={`absolute top-0 left-0 h-full transition-all duration-700 ${event.full ? 'bg-red-600' : 'bg-black'}`}
              style={{ width: `${event.percent}%` }}
            ></div>

            {/* Event name and edit event button */}
            <div className="absolute inset-0 flex justify-between items-center px-6">
              <span className="text-white text-lg font-bold z-10">
                {event.name}
              </span>
              {event.hasButton && (
                <button className="bg-black text-white px-3 py-1 rounded-md font-semibold hover:bg-gray-900 transition z-10">
                  Edit Event
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}