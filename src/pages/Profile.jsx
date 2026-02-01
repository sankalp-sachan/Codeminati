import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { User, Calendar, Edit2, Save, X, Code, Coins } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Loader from '../components/Loader';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    // Fetch Profile Data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await client.get('/auth/profile');
                setProfileData(data);
                setFormData({
                    name: data.name,
                    bio: data.bio || '',
                    preferredLanguage: data.preferredLanguage || 'python'
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

        // Adjust start date to the previous Sunday (or start of week) to align grid
        // 0 = Sun, 1 = Mon... we want to start on Sunday for standard view
        while (startDate.getDay() !== 0) {
            startDate.setDate(startDate.getDate() - 1);
        }

        // Map submissions
        const submissionMap = {};
        profileData.problemsSolved.forEach(p => {
            const dateStr = new Date(p.solvedAt).toISOString().split('T')[0];
            submissionMap[dateStr] = (submissionMap[dateStr] || 0) + 1;
        });

        // Generate Weeks structure
        const weeks = [];
        let currentWeek = [];
        const currentDate = new Date(startDate);

        // Loop until we reach or pass today (plus buffer)
        while (currentDate <= endDate || currentWeek.length > 0) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const count = submissionMap[dateStr] || 0;

            // Determine neon color
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

            // If week is full (7 days), push to weeks array
            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }

            // Break if we've gone past today and finished the week
            if (currentDate > endDate && currentWeek.length === 0) break;

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return (
            <div className="overflow-x-auto pb-6 pt-2 hide-scrollbar">
                <div className="inline-flex flex-col gap-2 min-w-full">
                    {/* Month Labels - Simplified approximation */}
                    <div className="flex text-xs text-gray-500 mb-2 pl-8 font-mono justify-between w-[95%]">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                            <span key={m}>{m}</span>
                        ))}
                    </div>

                    <div className="flex" style={{ height: '110px' }}>
                        {/* Day Labels (Mon/Wed/Fri) */}
                        <div className="flex flex-col justify-between text-[10px] font-medium text-gray-500 pr-2 pb-2 h-full leading-none pt-[12px]">
                            <span>Mon</span>
                            <span>Wed</span>
                            <span>Fri</span>
                        </div>

                        {/* Weeks Flex Container */}
                        <div className="flex h-full">
                            {weeks.map((week, wIndex) => {
                                // check if week contains 1st of month to add gap
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
                            {/* Bio */}
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

                            {/* Preferred Language */}
                            <div className="flex items-center text-gray-300">
                                <Code className="h-4 w-4 mr-3 text-gray-500" />
                                {isEditing ? (
                                    <select
                                        name="preferredLanguage"
                                        value={formData.preferredLanguage}
                                        onChange={handleInputChange}
                                        className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1 w-full text-sm"
                                    >
                                        {/* <option value="javascript">JavaScript</option> */}
                                        <option value="python">Python</option>
                                        {/* <option value="java">Java</option> */}
                                        <option value="cpp">C++</option>
                                        <option value="c">C</option>
                                    </select>
                                ) : (
                                    <span className="capitalize">{profileData.preferredLanguage || "Python"}</span>
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
                                        onClick={() => { setIsEditing(false); setFormData(profileData); }} // Reset on cancel
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
        </div>
    );
};

export default Profile;
