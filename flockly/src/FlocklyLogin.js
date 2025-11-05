import { useState } from 'react';
import { motion } from 'framer-motion';
import { authService } from './services/api';

export default function FlocklyLogin({ onLogin }) {
    const [isManager, setIsManager] = useState(false);

    const handleGoogleLogin = () => {
        const userType = isManager ? 'manager' : 'user';
        authService.loginWithGoogle(userType);
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

                <motion.button
                    onClick={handleGoogleLogin}
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg ${isManager
                        ? 'bg-white text-black border-2 border-black hover:bg-gray-100'
                        : 'bg-black text-white border-2 border-white hover:bg-gray-900'
                        }`}
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Sign in with Google
                </motion.button>

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