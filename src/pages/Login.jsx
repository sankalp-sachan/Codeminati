import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, googleLogin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(email, password);
        if (success) {
            const origin = location.state?.from || '/';
            navigate(origin);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        const success = await googleLogin(credentialResponse.credential);
        if (success) {
            const origin = location.state?.from || '/';
            navigate(origin);
        }
    };

    const handleGoogleFailure = () => {
        console.error("Google Login Failed");
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-1/4 -left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl" />

            <div className="w-full max-w-md p-8 rounded-2xl glass relative z-10">
                <h2 className="text-3xl font-bold mb-2 text-center">Welcome Back</h2>
                <p className="text-gray-400 text-center mb-8">Sign in to continue your coding journey</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-300">Password</label>
                            <Link to="/forgot-password" className="text-xs text-primary hover:text-blue-400">
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                    >
                        <span>Sign In</span>
                        <ArrowRight className="h-5 w-5" />
                    </button>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-[#1e293b] text-gray-400 bg-opacity-100 backdrop-blur-xl">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleFailure}
                            theme="filled_black"
                            shape="pill"
                        />
                    </div>
                </div>

                <p className="mt-6 text-center text-sm text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-primary hover:text-blue-400 font-medium">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
