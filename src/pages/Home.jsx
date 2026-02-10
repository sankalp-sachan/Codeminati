import { Link } from 'react-router-dom';
import { ArrowRight, Code, Briefcase, Trophy } from 'lucide-react';
import Footer from '../components/Footer';

const Home = () => {
    return (
        <div className="relative overflow-hidden">
            {/* Hero Section */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
                <div className="text-center">
                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-8">
                        <span className="block text-white">The Ultimate DSA</span>
                        <span className="block gradient-text">Hackathon Platform</span>
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400 mb-10">
                        Join the fiercest coding battles. Test your algorithmic skills, crush the test cases,
                        and dominate the live leaderboard.
                    </p>
                    <div className="flex justify-center space-x-4">

                        <Link
                            to="/compiler"
                            className="px-8 py-4 rounded-full bg-primary hover:bg-blue-600 text-white font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/25 flex items-center"
                        >
                            Start Coding
                            <Trophy className="ml-2 h-5 w-5" />
                        </Link>
                        <Link
                            to="/problems"
                            className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-lg transition-all backdrop-blur-sm border border-white/10"
                        >
                            Training Ground
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Link to="/problems" className="block p-8 rounded-2xl glass hover:bg-white/10 transition-all hover:scale-105 duration-300 cursor-pointer">
                        <div className="bg-blue-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                            <Code className="h-6 w-6 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Training Ground</h3>
                        <p className="text-gray-400">
                            Sharpen your logic with our extensive library of DSA problems before the main event.
                        </p>
                    </Link>

                    <Link to="/contests" className="block p-8 rounded-2xl glass hover:bg-white/10 transition-all hover:scale-105 duration-300 cursor-pointer">
                        <div className="bg-pink-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                            <Trophy className="h-6 w-6 text-pink-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Live Battles</h3>
                        <p className="text-gray-400">
                            PARTICIPATE in real-time coding hackathons, battle against time, and claim your victory.
                        </p>
                    </Link>
                </div>
            </div>

        </div>
    );
};

export default Home;
