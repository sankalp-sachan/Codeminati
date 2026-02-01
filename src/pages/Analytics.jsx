import { useState, useEffect } from 'react';
import client from '../api/client';
import Loader from '../components/Loader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Activity, Trophy, Users, FileText, Calendar, CheckCircle } from 'lucide-react';

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = async () => {
        try {
            const { data: res } = await client.get('/submissions/analytics');
            setData(res);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0f0f15]"><Loader size="xl" /></div>;

    if (!data) return <div className="text-center text-red-500 mt-10">Failed to load analytics</div>;

    return (
        <div className="min-h-screen bg-[#0f0f15] text-white p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-end border-b border-gray-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-indigo-500 bg-clip-text text-transparent flex items-center gap-3">
                            <Activity className="h-8 w-8 text-pink-500" />
                            Platform Analytics
                        </h1>
                        <p className="text-gray-400 mt-2">Deep insights into user performance and problem engagement.</p>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-800 shadow-lg hover:border-indigo-500/30 transition-colors">
                        <div className="flex items-center justify-between pb-2">
                            <h3 className="text-gray-400 text-sm font-medium">Total Submissions</h3>
                            <FileText className="text-blue-500 h-5 w-5" />
                        </div>
                        <div className="text-3xl font-bold text-white">{data.totalSubmissions}</div>
                    </div>
                    <div className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-800 shadow-lg hover:border-indigo-500/30 transition-colors">
                        <div className="flex items-center justify-between pb-2">
                            <h3 className="text-gray-400 text-sm font-medium">Accepted Solutions</h3>
                            <CheckCircle className="text-green-500 h-5 w-5" />
                        </div>
                        <div className="text-3xl font-bold text-white">{data.acceptedSubmissions}</div>
                    </div>
                    <div className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-800 shadow-lg hover:border-indigo-500/30 transition-colors">
                        <div className="flex items-center justify-between pb-2">
                            <h3 className="text-gray-400 text-sm font-medium">Success Rate</h3>
                            <Trophy className="text-yellow-500 h-5 w-5" />
                        </div>
                        <div className="text-3xl font-bold text-white">{data.successRate}%</div>
                    </div>
                    <div className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-800 shadow-lg hover:border-indigo-500/30 transition-colors">
                        <div className="flex items-center justify-between pb-2">
                            <h3 className="text-gray-400 text-sm font-medium">Active Days</h3>
                            <Calendar className="text-purple-500 h-5 w-5" />
                        </div>
                        <div className="text-3xl font-bold text-white">{data.heatmapData?.length || 0}</div>
                    </div>
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Submission Activity Heatmap (Line Chart) */}
                    <div className="lg:col-span-2 bg-[#1e1e1e] p-6 rounded-xl border border-gray-800 shadow-xl">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <Activity className="text-indigo-400 h-5 w-5" />
                            Submission Activity Trend
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.heatmapData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="_id" stroke="#666" fontSize={12} tickLine={false} />
                                    <YAxis stroke="#666" fontSize={12} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f0f15', border: '1px solid #333' }}
                                        labelStyle={{ color: '#aaa' }}
                                    />
                                    <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} name="Total" />
                                    <Line type="monotone" dataKey="accepted" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} name="Accepted" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Problems */}
                    <div className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-800 shadow-xl">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <Trophy className="text-yellow-400 h-5 w-5" />
                            Top Problems
                        </h3>
                        <div className="space-y-4">
                            {data.topProblems.map((problem, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${index < 3 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-700 text-gray-400'}`}>
                                            {index + 1}
                                        </span>
                                        <span className="text-sm font-medium text-gray-200 truncate">{problem.title}</span>
                                    </div>
                                    <div className="text-xs font-mono text-gray-400 bg-black/30 px-2 py-1 rounded">
                                        {problem.count} tries
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
