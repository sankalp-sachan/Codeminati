import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import client from '../api/client';
import { toast } from 'react-hot-toast';
import { Lock, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    const [step, setStep] = useState(1); // 1: OTP, 2: New Password
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

    if (!email) {
        navigate('/forgot-password');
        return null;
    }

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);
        if (value && index < 5) inputRefs[index + 1].current.focus();
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d+$/.test(data)) {
            const newOtp = [...otp];
            data.split('').forEach((char, i) => { if (i < 6) newOtp[i] = char; });
            setOtp(newOtp);
            if (data.length === 6) inputRefs[5].current.focus();
            else inputRefs[data.length].current.focus();
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            await client.post('/auth/verify-reset-otp', { email, otp: otpString });
            toast.success('OTP Verified!');
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const otpString = otp.join('');
            await client.post('/auth/reset-password', { email, otp: otpString, password });
            toast.success('Password reset successfully! Please login.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center relative overflow-hidden bg-[#0f0f15]">
            <div className={`absolute top-1/4 -right-20 w-72 h-72 rounded-full blur-3xl animate-pulse transition-colors ${step === 1 ? 'bg-purple-500/10' : 'bg-green-500/10'}`} />
            <div className={`absolute bottom-1/4 -left-20 w-72 h-72 rounded-full blur-3xl animate-pulse transition-colors ${step === 1 ? 'bg-blue-500/10' : 'bg-purple-500/10'}`} />

            <div className="w-full max-w-md p-8 rounded-2xl glass relative z-10 border border-gray-800">
                {step === 1 ? (
                    <>
                        <h2 className="text-3xl font-bold mb-2 text-center text-white">Verification Code</h2>
                        <p className="text-gray-400 text-center mb-8">
                            Enter the code sent to <span className="text-blue-400">{email}</span>
                        </p>

                        <form onSubmit={handleVerifyOtp} className="space-y-8">
                            <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={inputRefs[index]}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        className="w-10 h-12 sm:w-12 sm:h-14 bg-white/5 border border-gray-700 rounded-lg text-center text-xl font-bold text-blue-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    />
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>Verify Code</span>
                                        <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                        <h2 className="text-3xl font-bold mb-2 text-center text-white">Reset Password</h2>
                        <p className="text-gray-400 text-center mb-8">
                            Create a strong new password for your account.
                        </p>

                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`w-full bg-white/5 border rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-1 transition-colors ${confirmPassword && password !== confirmPassword
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500'
                                            }`}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                {confirmPassword && password !== confirmPassword && (
                                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || (confirmPassword && password !== confirmPassword)}
                                className="w-full bg-green-600 hover:bg-green-500 text-white font-medium py-3 rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/20"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>Reset Password</span>
                                        <CheckCircle className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
