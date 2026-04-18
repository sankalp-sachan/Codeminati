import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { Plus, Users, BookOpen, Activity, Search, Copy, Check, LogIn, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Loader from '../components/Loader';

const TeacherDashboard = () => {
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newClass, setNewClass] = useState({ name: '', description: '' });
    const [creating, setCreating] = useState(false);
    const [copiedCode, setCopiedCode] = useState(null);

    useEffect(() => {
        fetchClassrooms();
    }, []);

    const fetchClassrooms = async () => {
        try {
            const { data } = await client.get('/classrooms');
            setClassrooms(data);
        } catch (error) {
            toast.error('Failed to load classrooms');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await client.post('/classrooms', newClass);
            toast.success('Classroom created successfully!');
            setShowCreateModal(false);
            setNewClass({ name: '', description: '' });
            fetchClassrooms();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create classroom');
        } finally {
            setCreating(false);
        }
    };

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success('Class code copied!');
        setTimeout(() => setCopiedCode(null), 2000);
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader size="xl" /></div>;

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 italic uppercase tracking-tight">
                        Faculty <span className="bg-gradient-to-r from-blue-400 to-emerald-500 bg-clip-text text-transparent">Dashboard</span>
                    </h1>
                    <p className="text-gray-400">Manage your labs and monitor student progress in real-time.</p>
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                >
                    <Plus size={20} /> New Laboratory
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <div className="bg-blue-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                        <BookOpen size={24} className="text-blue-400" />
                    </div>
                    <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">Active Labs</p>
                    <h3 className="text-3xl font-black text-white">{classrooms.length}</h3>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <div className="bg-emerald-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                        <Users size={24} className="text-emerald-400" />
                    </div>
                    <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">Total Students</p>
                    <h3 className="text-3xl font-black text-white">
                        {classrooms.reduce((acc, curr) => acc + (curr.students?.length || 0), 0)}
                    </h3>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-3xl p-6 relative overflow-hidden">
                    <div className="relative z-10">
                        <Activity size={24} className="text-purple-400 mb-4" />
                        <p className="text-purple-300 text-xs font-black uppercase tracking-widest mb-1">Status</p>
                        <h3 className="text-3xl font-black text-white">System Ready</h3>
                    </div>
                    <Activity size={100} className="absolute -bottom-4 -right-4 text-purple-500/5 rotate-12" />
                </div>
            </div>

            {/* Classrooms Grid */}
            {classrooms.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {classrooms.map((cls) => (
                        <div key={cls._id} className="group relative bg-[#0b0b13] border border-white/10 rounded-[2.5rem] p-8 hover:border-blue-500/30 transition-all duration-500">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-black text-white mb-2 group-hover:text-blue-400 transition-colors uppercase italic">{cls.name}</h3>
                                    <p className="text-gray-500 text-sm line-clamp-1">{cls.description || 'No description provided'}</p>
                                </div>
                                <div 
                                    onClick={() => copyToClipboard(cls.code)}
                                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2 cursor-pointer hover:bg-white/10 transition-all"
                                    title="Click to copy class code"
                                >
                                    <span className="text-xs font-black text-blue-400">{cls.code}</span>
                                    {copiedCode === cls.code ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-gray-500" />}
                                </div>
                            </div>

                            <div className="flex items-center gap-6 mb-8">
                                <div className="flex items-center gap-2">
                                    <Users size={16} className="text-gray-500" />
                                    <span className="text-sm font-bold text-gray-300">{cls.students?.length || 0} Students</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Activity size={16} className="text-emerald-500" />
                                    <span className="text-sm font-bold text-emerald-500 uppercase tracking-widest text-[10px]">Active</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Link 
                                    to={`/teacher/class/${cls._id}`}
                                    className="flex-1 bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-center hover:bg-gray-200 transition-all"
                                >
                                    Monitor Live
                                </Link>
                                <button className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-gray-400">
                                    <Settings size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-[3rem] p-20 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <BookOpen size={40} className="text-gray-600" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2 italic uppercase">No Laboratories Found</h3>
                    <p className="text-gray-400 mb-10 max-w-md">You haven't created any labs yet. Start by creating a laboratory to monitor your students.</p>
                    <button 
                         onClick={() => setShowCreateModal(true)}
                        className="bg-white text-black px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all"
                    >
                        Create Your First Lab
                    </button>
                </div>
            )}

            {/* Create Class Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                    <div className="bg-[#0b0b13] border border-white/10 rounded-[3rem] p-10 max-w-lg w-full relative">
                        <h2 className="text-3xl font-black text-white mb-2 italic uppercase">New Laboratory</h2>
                        <p className="text-gray-500 text-sm mb-8">Set up a workspace for your class session.</p>

                        <form onSubmit={handleCreateClass} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Class Name</label>
                                <input 
                                    required
                                    type="text" 
                                    placeholder="e.g. Data Structures Section A"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-blue-500 outline-none transition-all font-medium"
                                    value={newClass.name}
                                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Description</label>
                                <textarea 
                                    rows="3"
                                    placeholder="Brief details about the lab session..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-blue-500 outline-none transition-all font-medium resize-none"
                                    value={newClass.description}
                                    onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-4 text-gray-400 font-black uppercase tracking-widest text-xs hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={creating}
                                    className="flex-[2] bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-400 transition-all disabled:opacity-50"
                                >
                                    {creating ? 'Creating...' : 'Launch Laboratory'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;
