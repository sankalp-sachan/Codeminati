import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import client from '../api/client';
import { toast } from 'react-hot-toast';
import { Mail, ArrowRight, Loader2, RefreshCw } from 'lucide-react';

const VerifyEmail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [timer, setTimer] = useState(60);
    const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

    useEffect(() => {
        if (!email) {
            toast.error('Email not found. Please sign up again.');
            navigate('/signup');
        }
    }, [email, navigate]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Move to next input
        if (value && index < 5) {
            inputRefs[index + 1].current.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d+$/.test(data)) {
            const newOtp = [...otp];
            data.split('').forEach((char, i) => {
                if (i < 6) newOtp[i] = char;
            });
            setOtp(newOtp);
            if (data.length === 6) {
                inputRefs[5].current.focus();
            } else {
                inputRefs[data.length].current.focus();
            }
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            toast.error('Please enter a 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            await client.post('/auth/verify-otp', { email, otp: otpString });
            toast.success('Email verified successfully!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;

        setResending(true);
        try {
            await client.post('/auth/resend-otp', { email });
            toast.success('New OTP sent to your email');
            setTimer(60);
            setOtp(['', '', '', '', '', '']);
            inputRefs[0].current.focus();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setResending(false);
        }
    };

    if (!email) return null;

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-1/4 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 -left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />

            <div className="max-w-md w-full glass p-8 rounded-2xl border border-gray-800 shadow-2xl relative z-10">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="h-8 w-8 text-blue-400" />
                </div>

                <h2 className="text-3xl font-bold text-white text-center mb-2">Check your email</h2>
                <p className="text-gray-400 text-center mb-8">
                    We just sent a verification code to <br />
                    <span className="text-blue-400 font-medium">{email}</span>
                </p>

                <form onSubmit={handleVerify} className="space-y-8">
                    <div className="flex justify-between gap-2" onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={inputRefs[index]}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-14 bg-white/5 border border-gray-700 rounded-xl text-center text-2xl font-bold text-blue-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <span>Verify Account</span>
                                <ArrowRight className="h-5 w-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm mb-2">Didn't receive the code?</p>
                    <button
                        onClick={handleResend}
                        disabled={timer > 0 || resending}
                        className={`flex items-center justify-center space-x-2 mx-auto text-sm font-medium transition-colors ${timer > 0 ? 'text-gray-600 cursor-not-allowed' : 'text-blue-400 hover:text-blue-300'
                            }`}
                    >
                        {resending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                        <span>
                            {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
