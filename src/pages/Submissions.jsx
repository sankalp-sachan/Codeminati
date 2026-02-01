import { useState, useEffect } from 'react';
import client from '../api/client';
import Loader from '../components/Loader';
import { CheckCircle, XCircle, Clock, AlertTriangle, FileCode, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Submissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    const [verdictFilter, setVerdictFilter] = useState('');

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const { data } = await client.get(`/submissions?page=${page}&verdict=${verdictFilter}`);
            setSubmissions(data.submissions);
            setTotalPages(data.pages);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, [page, verdictFilter]);

    const getVerdictColor = (verdict) => {
        switch (verdict) {
            case 'Accepted': return 'text-green-500';
            case 'Wrong Answer': return 'text-red-500';
            case 'Time Limit Exceeded': return 'text-orange-500';
            default: return 'text-yellow-500';
        }
    };

    const getVerdictIcon = (verdict) => {
        switch (verdict) {
            case 'Accepted': return <CheckCircle className="w-4 h-4" />;
            case 'Wrong Answer': return <XCircle className="w-4 h-4" />;
            case 'Time Limit Exceeded': return <Clock className="w-4 h-4" />;
            default: return <AlertTriangle className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f15] text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
                        <FileCode className="h-8 w-8 text-blue-500" />
                        My Submissions
                    </h1>

                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <select
                                value={verdictFilter}
                                onChange={(e) => setVerdictFilter(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-[#1e1e1e] border border-gray-700 rounded-lg text-sm text-gray-300 focus:ring-1 focus:ring-blue-500 outline-none appearance-none"
                            >
                                <option value="">All Verdicts</option>
                                <option value="Accepted">Accepted</option>
                                <option value="Wrong Answer">Wrong Answer</option>
                                <option value="Time Limit Exceeded">TLE</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader size="xl" /></div>
                ) : (
                    <div className="bg-[#1e1e1e]/50 backdrop-blur rounded-xl border border-gray-800 overflow-hidden shadow-xl">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/5 border-b border-gray-700">
                                    <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase">Problem</th>
                                    <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase">Verdict</th>
                                    <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase">Runtime</th>
                                    <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase">Language</th>
                                    <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase text-right">Submitted At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {submissions.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                            No submissions found. Start coding!
                                        </td>
                                    </tr>
                                ) : (
                                    submissions.map((sub) => (
                                        <tr key={sub._id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <Link to={`/problems/${sub.problem?.slug}`} className="text-blue-400 hover:text-blue-300 font-medium hover:underline">
                                                    {sub.problem?.title || 'Unknown Problem'}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${sub.verdict === 'Accepted' ? 'bg-green-500/10 text-green-500' :
                                                        sub.verdict === 'Wrong Answer' ? 'bg-red-500/10 text-red-500' :
                                                            'bg-yellow-500/10 text-yellow-500'
                                                    }`}>
                                                    {getVerdictIcon(sub.verdict)}
                                                    {sub.verdict}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400 font-mono">
                                                {sub.metrics?.runtime ? `${sub.metrics.runtime} ms` : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-mono px-2 py-1 bg-gray-800 rounded text-gray-300 capitalize">
                                                    {sub.language}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm text-gray-500">
                                                {new Date(sub.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center p-6 border-t border-gray-800">
                                <div className="flex space-x-2">
                                    <button
                                        disabled={page === 1}
                                        onClick={() => setPage(p => p - 1)}
                                        className="px-4 py-2 bg-gray-800 rounded disabled:opacity-50 hover:bg-gray-700 transition"
                                    >
                                        Prev
                                    </button>
                                    <span className="px-4 py-2 text-gray-400">Page {page} of {totalPages}</span>
                                    <button
                                        disabled={page === totalPages}
                                        onClick={() => setPage(p => p + 1)}
                                        className="px-4 py-2 bg-gray-800 rounded disabled:opacity-50 hover:bg-gray-700 transition"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Submissions;
