import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { User, Edit2 } from 'lucide-react';
import { authService } from './services/api';

export default function FlocklyHome() {
    const [showProfile, setShowProfile] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        const response = await authService.getCurrentUser();
        console.log('User data:', response); // Debug log
        if (response.success && response.user) {
            setUser(response.user);
        }
    };

    const handleLogout = async () => {
        await authService.logout();
        window.location.href = '/';
    };

    const events = [
        { name: 'Hackathon 2025', price: '₹299', percent: 80 },
        { name: 'Concert Vibes', price: '₹499', percent: 60 },
        { name: 'Capture The Flag', price: '₹199', percent: 40 },
        { name: 'Startup Pitch Fiesta', price: '₹0', percent: 100, full: true },
    ];

    return (
        <div className="bg-black min-h-screen text-white flex flex-col items-center justify-start">
            {/* Top tagline section */}
            <div className="w-full flex justify-between items-center p-6 border-b border-gray-800">
                <div className="text-left">
                    <h2 className="text-2xl font-bold leading-tight">
                        EVENT MANAGEMENT PLATFORM
                    </h2>
                </div>

                {/* Navbar */}
                <nav className="flex items-center space-x-8 text-lg uppercase tracking-wide">
                    <a href="#" className="hover:text-gray-400 transition">Home</a>
                    <a href="#" className="hover:text-gray-400 transition">Events</a>
                    <a href="#" className="hover:text-gray-400 transition">Contact</a>

                    {/* Profile Icon */}
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

                        {/* Profile Card Dropdown */}
                        {showProfile && (
                            <div className="absolute right-0 mt-2 w-64 z-50">
                                <div className="rounded-xl border bg-white text-black shadow-lg">
                                    <div className="p-6">
                                        <div className="flex flex-col items-center space-y-4">
                                            <div className="relative">
                                                {user?.profilePicture ? (
                                                    <img 
                                                        src={user.profilePicture} 
                                                        alt="Profile" 
                                                        className="w-16 h-16 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <User size={32} className="text-gray-600" />
                                                    </div>
                                                )}
                                                <button className="absolute bottom-0 right-0 bg-black text-white p-1.5 rounded-full hover:bg-gray-800 transition">
                                                    <Edit2 size={14} />
                                                </button>
                                            </div>
                                            <div className="text-center flex items-center gap-2">
                                                <h3 className="font-bold text-lg">{user?.name || 'User Name'}</h3>
                                                <button className="text-gray-600 hover:text-black transition">
                                                    <Edit2 size={16} />
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-600">{user?.email || 'user@example.com'}</p>

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
                        fontSize: '14vw',
                        letterSpacing: '-0.03em',
                        lineHeight: '0.8',
                    }}
                >
                    FLOCKLY
                </h1>
            </motion.div>

            {/* Decorative lines */}
            <div className="w-full border-t border-b border-gray-800 mt-8 py-4 text-center">
                <p className="uppercase text-gray-400 tracking-widest text-sm">
                    Explore the latest events happening now
                </p>
            </div>

            {/* Event bars */}
            <div className="flex flex-col gap-6 mt-12 w-full max-w-4xl px-6">
                {events.map((event, idx) => (
                    <div
                        key={idx}
                        className="relative w-full h-20 bg-black border-4 border-white rounded-lg overflow-hidden shadow-lg"
                    >
                        {/* White progress bar */}
                        <div
                            className={`absolute top-0 left-0 h-full transition-all duration-700 ${event.full ? 'bg-red-600' : 'bg-white'
                                }`}
                            style={{ width: `${event.percent}%` }}
                        ></div>

                        {/* Text */}
                        <div className="absolute inset-0 flex justify-between items-center px-6">
                            <span className="text-black font-bold text-lg z-10">
                                {event.name}
                            </span>
                            <span
                                className={`font-semibold text-lg z-10 ${event.full ? 'text-white' : 'text-black'
                                    }`}
                            >
                                {event.full ? 'Registrations Full' : event.price}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}