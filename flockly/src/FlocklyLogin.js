import { useState } from 'react';
import { motion } from 'framer-motion';

export default function FlocklyLogin({ onLogin }) {
    const [isManager, setIsManager] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(isManager);
    };

    return (
        <div
            className={`flex items-center justify-center h-screen transition-colors duration-700 overflow-hidden relative ${isManager ? 'bg-black' : 'bg-white'
                }`}
        >
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                className={`absolute inset-0 -z-10 bg-gradient-to-br ${isManager
                    ? 'from-gray-900 via-black to-gray-700'
                    : 'from-gray-100 via-white to-gray-300'
                    } animate-pulse`}
            />

            <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 1, type: 'spring' }}
                whileHover={{ y: -8, transition: { duration: 0.4 } }}
                className={`p-10 rounded-3xl shadow-2xl w-full max-w-md text-center transition-all duration-700 backdrop-blur-lg ${isManager ? 'bg-white/90 text-black' : 'bg-black/90 text-white'
                    }`}
            >
                <motion.h1
                    key={isManager ? 'manager' : 'user'}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-6xl font-extrabold mb-10 tracking-widest"
                >
                    <span
                        className={`inline-block relative after:absolute after:left-0 after:-bottom-2 after:w-full after:h-1 after:rounded-full ${isManager
                            ? 'bg-gradient-to-r from-black to-gray-800 text-transparent bg-clip-text after:bg-black'
                            : 'bg-gradient-to-r from-white to-gray-300 text-transparent bg-clip-text after:bg-white'
                            }`}
                    >
                        FLOCKLY
                    </span>
                </motion.h1>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-semibold mb-6 tracking-wide"
                >
                    {isManager ? 'Event Manager' : 'User'}
                </motion.h2>

                <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className={`p-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-300 ${isManager
                            ? 'border-gray-400 focus:ring-black text-black'
                            : 'border-gray-600 bg-black text-white focus:ring-white'
                            }`}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className={`p-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-300 ${isManager
                            ? 'border-gray-400 focus:ring-black text-black'
                            : 'border-gray-600 bg-black text-white focus:ring-white'
                            }`}
                    />
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.08, y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        className={`font-semibold py-2 rounded-xl transition-all duration-300 shadow-md ${isManager
                            ? 'bg-black text-white hover:bg-gray-800'
                            : 'bg-white text-black hover:bg-gray-200'
                            }`}
                    >
                        Login
                    </motion.button>
                </form>

                <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsManager(!isManager)}
                    className={`mt-10 font-medium px-6 py-2 rounded-xl border transition-all duration-500 shadow-md ${isManager
                        ? 'border-black text-black hover:bg-black hover:text-white'
                        : 'border-white text-white hover:bg-white hover:text-black'
                        }`}
                >
                    {isManager ? 'Login as User' : 'Login as Event Manager'}
                </motion.button>
            </motion.div>
        </div>
    );
}