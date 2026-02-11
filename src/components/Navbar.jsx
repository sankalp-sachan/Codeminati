import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, LogOut, User, Download } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { isInstallable, install } = usePWA();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="border-b border-gray-800 bg-[#0f0f15]/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link to="/" className="flex items-center space-x-2">
                        <Code2 className="h-8 w-8 text-primary" />
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Codeminati
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/problems" className="text-gray-300 hover:text-white transition-colors">Problems</Link>
                        <Link to="/contests" className="text-gray-300 hover:text-white transition-colors">Contests</Link>
                        {(user?.role === 'admin' || user?.role === 'assistant') && (
                            <Link to="/admin" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
                                {user.role === 'admin' ? 'Admin' : 'Assistant Panel'}
                            </Link>
                        )}
                        {(user?.role === 'judge' || user?.role === 'admin') && (
                            <Link to="/judge/leaderboard" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Judge Panel</Link>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        {isInstallable && (
                            <button
                                onClick={install}
                                className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all cursor-pointer border border-green-500/20"
                                title="Install App"
                            >
                                <Download className="h-4 w-4" />
                                <span className="text-sm font-medium">Install App</span>
                            </button>
                        )}

                        {user ? (
                            <div className="flex items-center space-x-4">
                                <Link to="/profile" className="flex items-center space-x-2 text-gray-300 hover:text-white">
                                    <User className="h-5 w-5" />
                                    <span>{user.name}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-red-400 transition-colors"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-gray-300 hover:text-white font-medium">
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white font-medium transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
