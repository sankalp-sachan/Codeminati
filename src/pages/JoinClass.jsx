import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { ArrowLeft, LogIn, CheckCircle, ShieldAlert, Sparkles, X, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

const JoinClass = () => {
    const { user, setActiveClassroom } = useAuth();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [myClasses, setMyClasses] = useState([]);
    const [loadingClasses, setLoadingClasses] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyClasses();
    }, []);

    const fetchMyClasses = async () => {
        try {
            const { data } = await client.get('/classrooms');
            setMyClasses(data);
        } catch (error) {
            console.error('Failed to fetch classes');
        } finally {
            setLoadingClasses(false);
        }
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await client.post('/classrooms/join', { code });
            toast.success('Joined successfully!');
            setActiveClassroom(data.classroom);
            fetchMyClasses();
            setCode('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid class code');
        } finally {
            setLoading(false);
        }
    };

    if (loadingClasses) return <div className="flex h-screen items-center justify-center"><Loader size="xl" /></div>;

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <button 
                onClick={() => navigate(-1)}
                className="mb-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest"
            >
                <ArrowLeft size={14} /> Go Back
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Left Side: Join Form */}
                <div className="bg-[#0b0b13] border border-white/10 rounded-[3rem] p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                        <Sparkles size={120} />
                    </div>
                    
                    <h1 className="text-4xl font-black text-white mb-2 italic uppercase tracking-tight">Access <span className="text-blue-500">Laboratory</span></h1>
                    <p className="text-gray-500 mb-10 font-medium">Enter the 6-character code provided by your faculty to join the live session.</p>

                    <form onSubmit={handleJoin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 border-l-2 border-blue-500 pl-2 uppercase tracking-widest mb-2">Internal Class Code</label>
                            <input 
                                required
                                type="text" 
                                placeholder="e.g. 5A9F21"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-2xl font-black text-white tracking-[0.3em] uppercase placeholder:text-gray-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-400 active:scale-95 transition-all shadow-xl shadow-white/5 disabled:opacity-50"
                        >
                            {loading ? 'Validating...' : 'Join Class Session'}
                        </button>
                    </form>

                    <div className="mt-10 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-start gap-3">
                        <ShieldAlert size={18} className="text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-gray-500 leading-relaxed">By joining a laboratory, your active code buffer and problem-solving status will be monitored by the assigned lab faculty for educational purposes.</p>
                    </div>
                </div>

                {/* Right Side: My Classes */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black text-white italic uppercase tracking-widest flex items-center gap-3">
                        <div className="w-2 h-8 bg-purple-500"></div>
                        Enrolled Labs
                    </h2>

                    <div className="space-y-4">
                        {myClasses.length > 0 ? myClasses.map((cls) => (
                            <div key={cls._id} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-white/[0.07] transition-all">
                                <div>
                                    <h3 className="font-bold text-white mb-1 uppercase tracking-tight italic group-hover:text-blue-400 transition-colors">{cls.name}</h3>
                                    <p className="text-xs text-gray-500 font-medium italic">Faculty: {cls.teacher?.name || 'Assigned Faculty'}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                        {cls.code}
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setActiveClassroom(cls);
                                            toast.success(`Active Lab: ${cls.name}`);
                                            navigate('/problems');
                                        }}
                                        className="p-3 bg-white text-black rounded-xl hover:bg-blue-400 transition-all shadow-lg shadow-white/5"
                                        title="Enter Lab"
                                    >
                                        <LogIn size={16} />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (user?.role === 'teacher' || user?.role === 'admin') {
                                                navigate(`/classrooms/${cls._id}/assignments/create`);
                                            } else {
                                                navigate(`/classrooms/${cls._id}/assignments`);
                                            }
                                        }}
                                        className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
                                        title={user?.role === 'teacher' ? "Manage Assignments" : "View Assignments"}
                                    >
                                        <BookOpen size={16} />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="p-12 border-2 border-dashed border-white/5 rounded-[3rem] text-center">
                                <ShieldAlert size={40} className="text-gray-700 mx-auto mb-4" />
                                <p className="text-gray-500 font-bold uppercase text-xs tracking-widest italic">No Active Access Found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoinClass;
