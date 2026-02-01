import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ArrowRight, Briefcase, Code2 } from 'lucide-react';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        role: 'user'
    });
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await register(formData);
        if (success) {
            navigate('/verify-email', { state: { email: formData.email } });
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center relative overflow-hidden py-12">
            <div className="absolute top-1/4 -right-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 -left-20 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl" />

            <div className="w-full max-w-md p-8 rounded-2xl glass relative z-10">
                <h2 className="text-3xl font-bold mb-2 text-center">Create Account</h2>
                <p className="text-gray-400 text-center mb-8">Join the community of developers</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-white/5 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full bg-white/5 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                    placeholder="johndoe"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-white/5 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-white/5 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">I am a</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'user' })}
                                className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${formData.role === 'user'
                                    ? 'bg-primary/20 border-primary text-primary'
                                    : 'bg-white/5 border-gray-700 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                <Code2 className="h-6 w-6" />
                                <span className="text-sm">Coder</span>
                            </button>
                            {/* <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'recruiter' })}
                                className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${formData.role === 'recruiter'
                                    ? 'bg-primary/20 border-primary text-primary'
                                    : 'bg-white/5 border-gray-700 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                <Briefcase className="h-6 w-6" />
                                <span className="text-sm">Recruiter</span>
                            </button> */}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2 mt-6"
                    >
                        <span>Create Account</span>
                        <ArrowRight className="h-5 w-5" />
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary hover:text-blue-400 font-medium">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};


export default Signup;
