import React, { useState, useEffect } from 'react';
import { Calendar, Rocket, Clock, ArrowRight, Trophy, Flame, CheckCircle, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import Loader from '../components/Loader';
import { toast } from 'react-hot-toast';

const DailyChallenge = () => {
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [solvedToday, setSolvedToday] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDailyChallenge = async () => {
            try {
                const { data } = await client.get('/problems/daily-challenge');
                setChallenge(data);
                
                // Also check if solved today (only if potential user is logged in)
                if (data.problem) {
                    try {
                        const { data: submissions } = await client.get(`/problems/${data.problem.slug}/submissions`);
                        const today = new Date().toDateString();
                        const hasSolvedToday = submissions.some(sub => 
                            sub.verdict === 'Accepted' && new Date(sub.createdAt).toDateString() === today
                        );
                        setSolvedToday(hasSolvedToday);
                    } catch (subError) {
                        console.warn("Submissions check skipped (probably not logged in)");
                    }
                }
            } catch (error) {
                console.error("Daily challenge error:", error);
                toast.error('Could not load Daily Challenge');
            } finally {
                setLoading(false);
            }
        };
        fetchDailyChallenge();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#020617]">
                <Loader size="xl" />
            </div>
        );
    }

    if (!challenge || !challenge.problem) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
                <AlertCircle size={64} className="text-gray-600 mb-6" />
                <h1 className="text-3xl font-bold text-white mb-2">No Challenge for Today</h1>
                <p className="text-gray-400">Check back later for a new challenge.</p>
                <Link to="/problems" className="mt-8 text-blue-400 hover:text-blue-300 font-bold">Browse Problems Instead</Link>
            </div>
        );
    }

    const { problem, date, rewardPoints } = challenge;

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-400 border border-orange-500/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                    <Rocket size={14} className="animate-bounce" /> Challenge for {date}
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tighter">
                    Today's <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Elite Challenge</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    A special selection for your coding journey. Solve it today to earn <span className="text-yellow-400 font-bold">+{rewardPoints}</span> bonus points!
                </p>
            </div>

            {/* Main Card */}
            <div className="relative group">
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
                
                <div className="relative bg-[#0b0b13] border border-white/10 p-10 md:p-14 rounded-[2.5rem] overflow-hidden">
                    {/* Floating Icons Background */}
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <Flame size={200} className="text-white" />
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    Problem #{problem.problemNumber}
                                </span>
                                <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest border ${
                                    problem.difficulty === 'Easy' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                                    problem.difficulty === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                                    'bg-red-500/10 border-red-500/30 text-red-400'
                                }`}>
                                    {problem.difficulty}
                                </span>
                            </div>

                            <h2 className="text-4xl font-black text-white mb-6 leading-tight">
                                {problem.title}
                                {solvedToday && <CheckCircle size={28} className="inline-block ml-4 text-green-500" />}
                            </h2>

                            <div className="flex flex-wrap gap-4 mb-10">
                                <div className="flex items-center gap-2 bg-[#1e1e2e] border border-gray-800 px-4 py-2 rounded-xl text-sm font-medium text-gray-300">
                                    <Clock size={16} className="text-blue-400" /> {solvedToday ? 'Challenge Completed' : '24 Hours Left'}
                                </div>
                                <div className="flex items-center gap-2 bg-[#1e1e2e] border border-gray-800 px-4 py-2 rounded-xl text-sm font-medium text-gray-300">
                                    <Trophy size={16} className="text-yellow-400" /> {rewardPoints} Points {solvedToday ? 'Earned' : 'Reward'}
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/problems/${problem.slug}`)}
                                className={`inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 group/btn ${
                                    solvedToday 
                                    ? 'bg-green-600/20 border border-green-500/50 text-green-400 hover:bg-green-600/30' 
                                    : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-[0_0_30px_rgba(234,88,12,0.4)]'
                                }`}
                            >
                                {solvedToday ? 'VIEW SOLUTION' : 'START CHALLENGE'}
                                <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <div className="w-full md:w-auto flex flex-col items-center gap-4 bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm self-stretch justify-center">
                            <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mb-2">
                                <Flame size={40} className="text-orange-500" />
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-black text-white">5-Day</div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Target Streak</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Features */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-[#1e1e2e]/30 border border-gray-800 p-6 rounded-2xl">
                     <div className="bg-blue-500/20 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                         <Trophy size={20} className="text-blue-400" />
                     </div>
                     <h3 className="text-white font-bold mb-2">Earn Extra</h3>
                     <p className="text-gray-500 text-sm">Every daily challenge gives you significantly more points than regular practice.</p>
                 </div>
                 <div className="bg-[#1e1e2e]/30 border border-gray-800 p-6 rounded-2xl">
                     <div className="bg-orange-500/20 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                         <Flame size={20} className="text-orange-400" />
                     </div>
                     <h3 className="text-white font-bold mb-2">Build Habits</h3>
                     <p className="text-gray-500 text-sm">Maintaining a streak unlocks exclusive badges and premium features on the platform.</p>
                 </div>
                 <div className="bg-[#1e1e2e]/30 border border-gray-800 p-6 rounded-2xl">
                     <div className="bg-purple-500/20 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                         <CheckCircle size={20} className="text-purple-400" />
                     </div>
                     <h3 className="text-white font-bold mb-2">Random Skills</h3>
                     <p className="text-gray-500 text-sm">Encounter different categories every day to broaden your technical knowledge.</p>
                 </div>
            </div>
        </div>
    );
};

export default DailyChallenge;
