import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MessageSquare, AlertCircle, HelpCircle, Mail, User as UserIcon, Code2, Sparkles } from 'lucide-react';
import client from '../api/client';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Support = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const types = [
        {
            id: 'contact',
            label: 'Contact',
            icon: Mail,
            color: 'text-blue-400',
            title: 'Business & General Inquiries',
            description: 'Reach out for collaborations, business inquiries, or general questions about Codeminati.',
            placeholderSubject: 'e.g. Partnership Proposal / Corporate Training',
            placeholderMessage: 'How can we help you today?'
        },
        {
            id: 'query',
            label: 'Query',
            icon: HelpCircle,
            color: 'text-purple-400',
            title: 'Platform Questions',
            description: 'Stuck with something on the platform? Ask us about features, accounts, or payments.',
            placeholderSubject: 'e.g. How to redeem points? / Premium status not active',
            placeholderMessage: 'Describe your query in detail...'
        },
        {
            id: 'debate',
            label: 'Doubt',
            icon: MessageSquare,
            color: 'text-yellow-400',
            title: 'Coding Doubts',
            description: 'Confused about a logic or a specific problem? Our experts are here to help.',
            placeholderSubject: 'e.g. Time Complexity doubt in Two Sum problem',
            placeholderMessage: 'Provide the problem link and explain where you are stuck...'
        },
        {
            id: 'bug',
            label: 'Bug Report',
            icon: AlertCircle,
            color: 'text-red-400',
            title: 'Report a Bug',
            description: 'Help us improve! Tell us if something is broken or not working as expected.',
            placeholderSubject: 'e.g. Compiler crashing on Python 3 / Mobile UI overlap',
            placeholderMessage: 'Provide steps to reproduce and your browser details if possible...'
        },
        {
            id: 'feedback',
            label: 'Feedback',
            icon: Send,
            color: 'text-green-400',
            title: 'Your Feedback',
            description: 'Share your thoughts on how we can make Codeminati even better for everyone.',
            placeholderSubject: 'e.g. Feature request: Darker theme / Suggestion for contests',
            placeholderMessage: 'What would you like to see next on Codeminati?'
        },
    ];

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        type: 'contact',
        subject: '',
        message: ''
    });

    const activeType = types.find(t => t.id === formData.type) || types[0];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await client.post('/admin/feedback', formData);
            toast.success('Your message has been sent to the admin!');
            setFormData({
                ...formData,
                subject: '',
                message: ''
            });
            // Don't immediately navigate away, let them stay if they want to send another or see success
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f15] py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors group"
                >
                    <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to previous page
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left: Sidebar & Header */}
                    <div className="lg:col-span-4 space-y-8">
                        <div>
                            <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">
                                Reach <span className="text-primary">Out</span>
                            </h1>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                Choose a category and fill out the form. We usually respond within 24-48 hours.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {types.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setFormData({ ...formData, type: t.id })}
                                    className={`w-full p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group ${formData.type === t.id
                                        ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-primary/50'
                                        : 'bg-[#13131a] border-gray-800 text-gray-400 hover:border-gray-700 hover:bg-[#1a1a24]'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2.5 rounded-xl ${formData.type === t.id ? 'bg-primary text-white' : 'bg-[#1e1e24] text-gray-500 group-hover:text-gray-300'}`}>
                                            <t.icon size={20} />
                                        </div>
                                        <div className="text-left">
                                            <span className={`block font-bold ${formData.type === t.id ? 'text-white' : 'text-gray-400'}`}>
                                                {t.label}
                                            </span>
                                        </div>
                                    </div>
                                    {formData.type === t.id && <Sparkles size={16} className="text-primary animate-pulse" />}
                                </button>
                            ))}
                        </div>

                        <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/5">
                            <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                                <Code2 size={18} className="text-primary" /> Did you know?
                            </h4>
                            <p className="text-sm text-gray-400">
                                You can also join our Discord community for instant help from fellow developers!
                            </p>
                            <button className="mt-4 text-sm font-bold text-primary hover:text-blue-400 transition-colors">
                                Join Discord Server →
                            </button>
                        </div>
                    </div>

                    {/* Right: Dynamic Form Card */}
                    <div className="lg:col-span-8">
                        <div className="bg-[#13131a]/80 backdrop-blur-xl rounded-[2.5rem] border border-gray-800/50 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
                            {/* Decorative background glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10 rounded-full"></div>

                            <div className="mb-10 text-left">
                                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 bg-white/5 border border-white/10 ${activeType.color}`}>
                                    <activeType.icon size={12} /> {activeType.label}
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-2">{activeType.title}</h2>
                                <p className="text-gray-400">{activeType.description}</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
                                                <UserIcon size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full bg-[#0f0f15]/50 border border-gray-800 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
                                                <Mail size={18} />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full bg-[#0f0f15]/50 border border-gray-800 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        required
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full bg-[#0f0f15]/50 border border-gray-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                        placeholder={activeType.placeholderSubject}
                                    />

                                    {/* Suggested Subjects */}
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {(formData.type === 'bug' ? ['Compiler Error', 'UI Overlap', 'Wrong Output', 'Login Issue'] :
                                            formData.type === 'debate' ? ['DP Logic', 'Time Complexity', 'Dry Run help', 'Edge Cases'] :
                                                formData.type === 'query' ? ['Premium Plan', 'Point System', 'Certificate', 'Account Delete'] :
                                                    formData.type === 'contact' ? ['Collaboration', 'Hiring Inquiry', 'Sponsorship', 'Bulk Licenses'] :
                                                        ['Feature Request', 'UI Suggestion', 'Content Quality', 'Overall App'])
                                            .map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, subject: s })}
                                                    className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400 hover:bg-primary/20 hover:text-white hover:border-primary/50 transition-all uppercase tracking-tighter"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Your Message</label>
                                    <textarea
                                        name="message"
                                        required
                                        rows="6"
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full bg-[#0f0f15]/50 border border-gray-800 rounded-[2rem] px-6 py-5 text-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none leading-relaxed"
                                        placeholder={activeType.placeholderMessage}
                                    />
                                </div>

                                {/* Dynamic Instruction Box */}
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                                    <div className={`p-2 rounded-lg bg-[#1e1e24] ${activeType.color}`}>
                                        <activeType.icon size={16} />
                                    </div>
                                    <div className="text-xs text-gray-400 leading-relaxed">
                                        {formData.type === 'bug' && "Pro tip: Including your screen resolution and browser version helps us fix bugs much faster!"}
                                        {formData.type === 'debate' && "Pro tip: Don't forget to mention the specific test case or line of code that's confusing you."}
                                        {formData.type === 'query' && "Pro tip: Check our FAQ section first; your question might already be answered there."}
                                        {formData.type === 'contact' && "Pro tip: For quick business responses, please provide your LinkedIn profile or company website."}
                                        {formData.type === 'feedback' && "Pro tip: We love specific suggestions! Tell us exactly which button or feature you'd change."}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 bg-primary hover:bg-blue-500 text-white rounded-2xl font-black text-lg tracking-widest uppercase shadow-2xl shadow-primary/20 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="h-6 w-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Send size={20} />
                                            Send Feedback
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-xs text-gray-500 font-medium">
                                    By submitting, you agree to our Terms of Service & Privacy Policy.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Support;
