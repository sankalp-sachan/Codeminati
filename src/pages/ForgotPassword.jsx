import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { toast } from 'react-hot-toast';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await client.post('/auth/forgot-password', { email });
            toast.success('OTP sent to your email');
            navigate('/reset-password', { state: { email } });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center relative overflow-hidden bg-[#0f0f15]">
            <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />

            <div className="w-full max-w-md p-8 rounded-2xl glass relative z-10 border border-gray-800">
                <h2 className="text-3xl font-bold mb-2 text-center text-white">Forgot Password?</h2>
                <p className="text-gray-400 text-center mb-8">
                    Enter your email to receive a password reset code.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <span>Send OTP</span>
                                <ArrowRight className="h-5 w-5" />
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-400">
                    Remember your password?{' '}
                    <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
