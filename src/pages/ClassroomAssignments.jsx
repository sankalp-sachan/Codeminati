import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { toast } from 'react-hot-toast';
import { BookOpen, Clock, ChevronRight, FileCode, CheckCircle2, AlertCircle, Calendar, Users, Star } from 'lucide-react';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

const ClassroomAssignments = () => {
    const { id: classroomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState([]);
    const [classroom, setClassroom] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [classRes, assignRes] = await Promise.all([
                    client.get(`/classrooms/${classroomId}`),
                    client.get(`/classrooms/${classroomId}/assignments`)
                ]);
                setClassroom(classRes.data.classroom);
                setAssignments(assignRes.data);
            } catch (err) {
                toast.error("Failed to load assignments");
                navigate('/classrooms');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [classroomId]);

    if (loading) return <div className="h-screen flex items-center justify-center bg-[#0f0f15]"><Loader size="xl" /></div>;

    return (
        <div className="min-h-screen bg-[#0f0f15] text-white">
            {/* Header Section */}
            <div className="bg-[#1a1a24] border-b border-white/5 py-12 px-6 md:px-12">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                                <Users size={14} />
                                <span>{classroom?.name}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white">Coding Assignments</h1>
                            <p className="text-gray-400 mt-4 max-w-2xl text-sm leading-relaxed">
                                Complete your coding tasks before the deadline to earn points and improve your skills. 
                                Each problem is solved in our dedicated compiler environment.
                            </p>
                        </div>
                        <div className="bg-black/40 p-6 rounded-3xl border border-white/5 flex items-center gap-6">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Tasks</p>
                                <p className="text-2xl font-black italic">{assignments.reduce((acc, a) => acc + a.problems.length, 0)}</p>
                            </div>
                            <div className="w-px h-10 bg-white/10"></div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Assignments</p>
                                <p className="text-2xl font-black italic">{assignments.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assignments List */}
            <div className="max-w-6xl mx-auto p-6 md:p-12">
                {assignments.length === 0 ? (
                    <div className="bg-[#1a1a24] rounded-[3rem] p-24 text-center border border-white/5">
                        <div className="bg-blue-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                            <FileCode size={40} className="text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-black italic mb-2">No active assignments</h2>
                        <p className="text-gray-600 max-w-sm mx-auto">Your teacher hasn't posted any coding assignments yet. Check back later!</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {assignments.map((asm) => (
                            <div key={asm._id} className="relative">
                                {/* Assignment Meta */}
                                <div className="flex items-center gap-4 mb-6">
                                    <h2 className="text-2xl font-black italic tracking-tight">{asm.title}</h2>
                                    {asm.dueDate && (
                                        <div className="flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-[10px] font-black uppercase tracking-widest">
                                            <Calendar size={12} />
                                            <span>Due: {new Date(asm.dueDate).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {asm.problems.map((p, idx) => (
                                        <div 
                                            key={p._id}
                                            onClick={() => navigate(`/problems/${p.slug}?assignmentId=${asm._id}`)}
                                            className="group bg-[#1a1a24] rounded-[2rem] p-8 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer relative overflow-hidden"
                                        >
                                            {/* Accent Background */}
                                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                                <FileCode size={120} className="text-white" />
                                            </div>

                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-6">
                                                    <span className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-[10px] font-black italic text-gray-500 border border-white/5 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                        #{idx + 1}
                                                    </span>
                                                    <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${
                                                        p.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/10' :
                                                        p.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/10' :
                                                        'bg-red-500/20 text-red-400 border border-red-500/10'
                                                    }`}>
                                                        {p.difficulty}
                                                    </span>
                                                </div>

                                                <h3 className="text-xl font-black italic mb-2 group-hover:text-blue-400 transition-colors uppercase tracking-tighter truncate">{p.title}</h3>
                                                <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-6">
                                                    Solve this interactive coding challenge to complete Part {idx + 1} of your assignment.
                                                </p>

                                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                    <div className="flex items-center gap-1.5 text-blue-500 font-black italic text-xs uppercase tracking-widest">
                                                        <span>Solve Now</span>
                                                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassroomAssignments;
