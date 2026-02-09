import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { User, Calendar, Edit2, Save, X, Code, Coins, Phone, Medal, Trophy, Award, Download, Share2, ShieldCheck, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Loader from '../components/Loader';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [selectedBadge, setSelectedBadge] = useState(null);

    // Fetch Profile Data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await client.get('/auth/profile');
                setProfileData(data);
                setFormData({
                    name: data.name,
                    bio: data.bio || '',
                    preferredLanguage: data.preferredLanguage || 'python',
                    whatsappNumber: data.whatsappNumber || ''
                });
                updateUser(data); // Sync global context
            } catch (error) {
                console.error(error);
                toast.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            const { data } = await client.put('/auth/profile', formData);
            setProfileData(prev => ({ ...prev, ...data })); // Merge updates
            updateUser(data); // Update global user context
            setIsEditing(false);
            toast.success("Profile updated!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        }
    };

    // Helper to generate heatmap data (Last 365 days)
    const renderHeatmap = () => {
        if (!profileData?.problemsSolved) return null;

        const today = new Date();
        const endDate = new Date(today);
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 364); // Last 365 days

        while (startDate.getDay() !== 0) {
            startDate.setDate(startDate.getDate() - 1);
        }

        const submissionMap = {};
        profileData.problemsSolved.forEach(p => {
            const dateStr = new Date(p.solvedAt).toISOString().split('T')[0];
            submissionMap[dateStr] = (submissionMap[dateStr] || 0) + 1;
        });

        const weeks = [];
        let currentWeek = [];
        const currentDate = new Date(startDate);

        while (currentDate <= endDate || currentWeek.length > 0) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const count = submissionMap[dateStr] || 0;

            let colorClass = 'bg-[#1a1b26] border border-white/5';
            if (count >= 1) colorClass = 'bg-emerald-900/80 border border-emerald-500/30';
            if (count >= 3) colorClass = 'bg-emerald-600/80 border border-emerald-400/40 shadow-[0_0_6px_rgba(16,185,129,0.3)]';
            if (count >= 5) colorClass = 'bg-emerald-500 border border-emerald-300/50 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
            if (count >= 8) colorClass = 'bg-emerald-400 border border-white/60 shadow-[0_0_14px_rgba(52,211,153,0.7)]';

            currentWeek.push({
                date: dateStr,
                originalDate: new Date(currentDate),
                count,
                colorClass,
                dayOfWeek: currentDate.getDay()
            });

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }

            if (currentDate > endDate && currentWeek.length === 0) break;
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return (
            <div className="overflow-x-auto pb-6 pt-2 hide-scrollbar">
                <div className="inline-flex flex-col gap-2 min-w-full">
                    <div className="flex text-xs text-gray-500 mb-2 pl-8 font-mono justify-between w-[95%]">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                            <span key={m}>{m}</span>
                        ))}
                    </div>

                    <div className="flex" style={{ height: '110px' }}>
                        <div className="flex flex-col justify-between text-[10px] font-medium text-gray-500 pr-2 pb-2 h-full leading-none pt-[12px]">
                            <span>Mon</span>
                            <span>Wed</span>
                            <span>Fri</span>
                        </div>

                        <div className="flex h-full">
                            {weeks.map((week, wIndex) => {
                                const isNewMonth = week.some(d => d.originalDate.getDate() === 1) && wIndex > 0;
                                return (
                                    <div
                                        key={wIndex}
                                        className={`flex flex-col gap-[3px] mx-[2px] ${isNewMonth ? 'ml-6' : ''}`}
                                    >
                                        {week.map((day, dIndex) => (
                                            <div
                                                key={dIndex}
                                                className={`
                                                    w-[11px] h-[11px] rounded-[3px] 
                                                    ${day.originalDate > endDate ? 'opacity-0' : day.colorClass} 
                                                    transition-all duration-300 ease-in-out
                                                    hover:scale-150 hover:z-20 hover:shadow-lg hover:border-emerald-300
                                                    cursor-help group relative
                                                `}
                                                title={`${day.date}: ${day.count} submissions`}
                                            />
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    };


    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader size="xl" />
            </div>
        );
    }
    if (!profileData) return <div className="text-center py-20 text-white">Profile not found</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: User Info */}
                <div className="glass rounded-xl p-8 h-fit border border-gray-800 bg-[#1e1e1e]">
                    <div className="flex flex-col items-center">
                        <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-xl">
                            <span className="text-4xl font-bold text-white uppercase">{profileData.name.charAt(0)}</span>
                        </div>

                        {isEditing ? (
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1 mb-1 w-full text-center"
                                placeholder="Your Name"
                            />
                        ) : (
                            <h2 className="text-2xl font-bold mb-1 text-white">{profileData.name}</h2>
                        )}

                        <p className="text-gray-400 mb-2">@{profileData.username}</p>
                        <div className="mb-6"></div>

                        <div className="w-full space-y-4">
                            {isEditing ? (
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full text-sm"
                                    placeholder="Tell us about yourself..."
                                    rows="3"
                                />
                            ) : (
                                <p className="text-gray-300 text-center text-sm italic mb-4">
                                    {profileData.bio || "No bio yet."}
                                </p>
                            )}

                            <div className="flex items-center text-gray-300">
                                <Code className="h-4 w-4 mr-3 text-gray-500" />
                                {isEditing ? (
                                    <select
                                        name="preferredLanguage"
                                        value={formData.preferredLanguage}
                                        onChange={handleInputChange}
                                        className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1 w-full text-sm"
                                    >
                                        <option value="python">Python</option>
                                        <option value="cpp">C++</option>
                                        <option value="c">C</option>
                                    </select>
                                ) : (
                                    <span className="capitalize">{profileData.preferredLanguage || "Python"}</span>
                                )}
                            </div>

                            <div className="flex items-center text-gray-300">
                                <Phone className="h-4 w-4 mr-3 text-gray-500" />
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="whatsappNumber"
                                        value={formData.whatsappNumber}
                                        onChange={handleInputChange}
                                        className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1 w-full text-sm"
                                        placeholder="WhatsApp Number"
                                    />
                                ) : (
                                    <span className="text-sm">{profileData.whatsappNumber || "Not provided"}</span>
                                )}
                            </div>

                            <div className="flex items-center text-gray-300">
                                <Calendar className="h-4 w-4 mr-3 text-gray-500" />
                                <span className="text-sm">Joined {new Date(profileData.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="mt-8 w-full flex space-x-2">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleSave}
                                        className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors text-white text-sm font-medium flex items-center justify-center"
                                    >
                                        <Save className="h-4 w-4 mr-2" /> Save
                                    </button>
                                    <button
                                        onClick={() => { setIsEditing(false); setFormData(profileData); }}
                                        className="flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-white text-sm font-medium flex items-center justify-center"
                                    >
                                        <X className="h-4 w-4 mr-2" /> Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium text-white flex items-center justify-center"
                                >
                                    <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Stats & Activity */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Badges Section */}
                    {profileData.badges && profileData.badges.length > 0 && (
                        <div className="glass p-6 rounded-xl border border-gray-800 bg-[#1e1e1e]">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Medal className="h-5 w-5 text-yellow-500" />
                                Achievements
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {profileData.badges.map((badge, index) => {
                                    const isImage = badge.endsWith('.png');
                                    const displayName = isImage ?
                                        ({
                                            '1st.png': 'Winner (1st)',
                                            '2nd.png': 'Runner Up (2nd)',
                                            '3rd.png': '3rd Place',
                                            'participant.png': 'Participant'
                                        }[badge] || badge.replace('.png', '')) : badge;

                                    return (
                                        <div
                                            key={index}
                                            onClick={() => isImage && setSelectedBadge({ badge, displayName })}
                                            className={`flex flex-col items-center p-4 bg-gray-800/50 rounded-lg border border-gray-800 hover:border-blue-500/50 transition-all group hover:bg-gray-800/80 ${isImage ? 'cursor-pointer active:scale-95' : ''}`}
                                        >
                                            <div className="h-16 w-16 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                                                {isImage ? (
                                                    <img
                                                        src={`/badges/${badge}`}
                                                        alt={displayName}
                                                        className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                                                    />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                                                        {badge === 'First Prize' ? <Trophy className="h-6 w-6 text-yellow-400" /> :
                                                            badge === 'Second Position' ? <Medal className="h-6 w-6 text-gray-300" /> :
                                                                badge === 'Third Position' ? <Medal className="h-6 w-6 text-orange-400" /> :
                                                                    <Award className="h-6 w-6 text-blue-400" />}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs font-bold text-center text-gray-200 uppercase tracking-tight">{displayName}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="glass p-6 rounded-xl border border-gray-800 bg-[#1e1e1e]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-400 font-medium">Problems Solved</span>
                                <Code className="h-5 w-5 text-purple-500" />
                            </div>
                            <div className="text-3xl font-bold text-white">{profileData.problemsSolved?.length || 0}</div>
                        </div>

                        <div className="glass p-6 rounded-xl border border-gray-800 bg-[#1e1e1e]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-400 font-medium">Total Points</span>
                                <Coins className="h-5 w-5 text-yellow-500" />
                            </div>
                            <div className="text-3xl font-bold text-white">{profileData.points || 0}</div>
                        </div>
                    </div>

                    {/* Real Heatmap */}
                    <div className="glass p-8 rounded-xl border border-gray-800 bg-[#1e1e1e]">
                        <h3 className="text-xl font-bold mb-6 text-white">Activity (Last 365 Days)</h3>
                        {renderHeatmap()}
                        <div className="mt-4 flex items-center space-x-2 text-xs text-gray-500 justify-end">
                            <span>Less</span>
                            <div className="w-[11px] h-[11px] bg-[#1a1b26] rounded-[3px] border border-white/5"></div>
                            <div className="w-[11px] h-[11px] bg-emerald-900/60 rounded-[3px] border border-emerald-500/20"></div>
                            <div className="w-[11px] h-[11px] bg-emerald-600/80 rounded-[3px] border border-emerald-400/30"></div>
                            <div className="w-[11px] h-[11px] bg-emerald-500 rounded-[3px] border border-emerald-300/40"></div>
                            <div className="w-[11px] h-[11px] bg-emerald-400 rounded-[3px] border border-white/50"></div>
                            <span>More</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Portal - Placed Outside for safety */}
            <AnimatePresence>
                {selectedBadge && (
                    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        <div className="min-h-full w-full flex items-center justify-center p-4 py-8 md:p-8">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative w-full max-w-4xl" // max-w-lg for portrait
                            >
                                <div className="bg-[#0b0d13] border-[3px] border-white/5 rounded-3xl p-1 shadow-[0_0_50px_rgba(59,130,246,0.15)] relative overflow-hidden group">
                                    {/* Animated Colorful Border - Outer */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-cyan-500/20 opacity-50" />

                                    {/* Close Button Inside Card */}
                                    <button
                                        onClick={() => setSelectedBadge(null)}
                                        className="absolute top-5 right-5 text-white/30 hover:text-white transition-colors z-50 p-1.5 hover:bg-white/10 rounded-full backdrop-blur-md border border-white/5"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>

                                    {/* Background Light Refractions */}
                                    <div className="absolute top-0 -left-10 w-40 h-40 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
                                    <div className="absolute bottom-0 -right-10 w-40 h-40 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

                                    <div className="relative z-10 flex flex-col md:flex-row items-center w-full">
                                        {/* Left Side: Badge Logo */}
                                        <div className="w-full md:w-[45%] p-8 md:p-12 flex flex-col items-center justify-center relative">
                                            <div className="absolute -inset-10 bg-blue-500/5 blur-[60px] rounded-full opacity-60" />
                                            <motion.div
                                                animate={{
                                                    y: [0, -10, 0],
                                                    filter: [
                                                        'drop-shadow(0 0 15px rgba(59, 130, 246, 0.3))',
                                                        'drop-shadow(0 0 30px rgba(139, 92, 246, 0.5))',
                                                        'drop-shadow(0 0 15px rgba(59, 130, 246, 0.3))'
                                                    ]
                                                }}
                                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                            >
                                                <img
                                                    src={`/badges/${selectedBadge.badge}`}
                                                    alt=""
                                                    className="w-64 h-64 md:w-80 md:h-80 object-contain relative z-10"
                                                    style={{ imageRendering: 'crisp-edges' }}
                                                />
                                            </motion.div>
                                        </div>

                                        {/* Right Side: Details */}
                                        <div className="w-full md:w-[55%] p-8 md:p-12 md:pl-0 flex flex-col items-center md:items-start text-center md:text-left">
                                            <div className="mb-6">
                                                <div className="flex items-center gap-1.5 mb-1.5 font-black text-xl tracking-tighter italic">
                                                    <span className="bg-gradient-to-r from-blue-600 to-blue-400 px-2 py-0.5 rounded text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]">HACK</span>
                                                    <span className="text-white">OVER</span>
                                                </div>
                                                <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
                                            </div>

                                            <h4 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 text-[10px] uppercase tracking-[0.4em] font-black font-mono mb-4">
                                                Achievement Unlocked
                                            </h4>

                                            <h2 className="text-4xl font-black mb-4 uppercase tracking-tight italic text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-500">
                                                {selectedBadge.displayName}
                                            </h2>

                                            <div className="space-y-4 w-full">
                                                <p className="text-blue-400/60 text-[11px] font-bold uppercase tracking-widest">This is to certify that</p>
                                                <div className="relative inline-block">
                                                    <div className="absolute top-0 left-0 w-8 h-px bg-gradient-to-r from-transparent to-blue-500/30" />
                                                    <h3 className="text-3xl font-serif italic text-white drop-shadow-sm border-b border-gray-800 pb-2 md:pr-12">
                                                        {profileData.name}
                                                    </h3>
                                                </div>

                                                <div className="pt-2">
                                                    <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                                                        for outstanding performance in
                                                        <br />
                                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-bold text-lg">
                                                            Codeminati Hackathon 2026
                                                        </span>
                                                        <br />
                                                        <span className="text-gray-500 text-[11px] uppercase tracking-tighter mt-1 block">
                                                            In Collaboration With Chhatrapati ShahuJi Maharaj University
                                                        </span>
                                                    </p>
                                                </div>

                                                <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-3">
                                                    <ShieldCheck className="h-5 w-5 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                                                    <span className="text-green-500/80 font-mono text-[10px] uppercase tracking-[0.2em] font-black whitespace-nowrap">Verified Blockchain Achievement</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;
