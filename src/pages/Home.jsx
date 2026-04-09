import { Link } from 'react-router-dom';
import { ArrowRight, Code, Trophy, Terminal, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

const Home = () => {
    return (
        <div className="relative min-h-screen overflow-hidden flex flex-col justify-between">
            {/* Animated Background Blobs */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-32 sm:pb-24 flex-grow flex flex-col justify-center">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center"
                >
                    <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 backdrop-blur-md">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-gray-300">Welcome to the Ultimate Coding Arena</span>
                    </div>
                    
                    <h1 className="text-6xl sm:text-8xl font-black tracking-tight mb-8 leading-[1.1]">
                        <span className="block text-white mb-2 drop-shadow-xl">Master Algorithms.</span>
                        <span className="block bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent drop-shadow-lg">
                            Conquer Rankings.
                        </span>
                    </h1>
                    
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-10 leading-relaxed font-light"
                    >
                        Step into the premier competitive programming platform. Solve complex challenges, battle against elite engineers worldwide, and forge your legacy.
                    </motion.p>
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6"
                    >
                        <Link
                            to="/compiler"
                            className="group relative px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all shadow-[0_0_40px_-10px_rgba(59,130,246,0.6)] hover:shadow-[0_0_60px_-15px_rgba(59,130,246,0.8)] flex items-center w-full sm:w-auto justify-center"
                        >
                            <span>Start Coding</span>
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/problems"
                            className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-lg transition-all backdrop-blur-sm border border-white/10 flex items-center w-full sm:w-auto justify-center"
                        >
                            <Terminal className="mr-2 h-5 w-5 text-gray-400" />
                            Training Ground
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Features Grid */}
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                    className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                    <Link to="/problems" className="group rounded-3xl p-8 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all backdrop-blur-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
                        <div className="bg-blue-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/10">
                            <Code className="h-7 w-7 text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Training Ground</h3>
                        <p className="text-gray-400 font-light text-lg">
                            Sharpen your logic with our extensive library of DSA problems before the main event.
                        </p>
                    </Link>

                    <Link to="/contests" className="group rounded-3xl p-8 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all backdrop-blur-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
                        <div className="bg-purple-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/10">
                            <Trophy className="h-7 w-7 text-purple-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Live Battles</h3>
                        <p className="text-gray-400 font-light text-lg">
                            Participate in real-time coding hackathons, battle against time, and claim your victory.
                        </p>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default Home;
