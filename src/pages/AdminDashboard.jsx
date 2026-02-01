import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { toast } from 'react-hot-toast';
import { Plus, Save, Download, Users, MessageSquare, Check, X, ExternalLink, Trash2, ShieldAlert, Monitor, User as UserIcon, Clock } from 'lucide-react';
import Loader from '../components/Loader';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('create-problem');

    // Form State
    const [title, setTitle] = useState('');
    const [difficulty, setDifficulty] = useState('Medium');
    const [category, setCategory] = useState('Algorithms');
    const [description, setDescription] = useState('');
    const [starterCode, setStarterCode] = useState({
        python: "class Solution:\n    def solve(self, args: any) -> any:\n        pass",
        cpp: "class Solution {\npublic:\n    void solve(vector<int>& args) {\n        \n    }\n};",
        c: "void solve(int* args, int argsSize) {\n    \n}"
    });

    // Test Case Management
    const [testCasesList, setTestCasesList] = useState([]);
    const [currentInput, setCurrentInput] = useState('');
    const [currentOutput, setCurrentOutput] = useState('');
    const [currentIsHidden, setCurrentIsHidden] = useState(false);

    // Example Management
    const [examplesList, setExamplesList] = useState([]);
    const [currentExampleInput, setCurrentExampleInput] = useState('');
    const [currentExampleOutput, setCurrentExampleOutput] = useState('');
    const [currentExampleExplanation, setCurrentExampleExplanation] = useState('');

    const addExample = () => {
        if (!currentExampleInput.trim()) return toast.error('Example Input is required');
        setExamplesList([...examplesList, {
            input: currentExampleInput,
            output: currentExampleOutput,
            explanation: currentExampleExplanation
        }]);
        setCurrentExampleInput('');
        setCurrentExampleOutput('');
        setCurrentExampleExplanation('');
    };

    const removeExample = (index) => {
        setExamplesList(examplesList.filter((_, i) => i !== index));
    };

    // Constraint Management
    const [constraintsList, setConstraintsList] = useState([]);
    const [currentConstraint, setCurrentConstraint] = useState('');

    const addConstraint = () => {
        if (!currentConstraint.trim()) return toast.error('Constraint is required');
        setConstraintsList([...constraintsList, currentConstraint]);
        setCurrentConstraint('');
    };

    const removeConstraint = (index) => {
        setConstraintsList(constraintsList.filter((_, i) => i !== index));
    };

    const addTestCase = () => {
        if (!currentInput.trim()) return toast.error('Input is required');
        setTestCasesList([...testCasesList, { input: currentInput, output: currentOutput, isHidden: currentIsHidden }]);
        setCurrentInput('');
        setCurrentOutput('');
        setCurrentIsHidden(false);
    };

    const removeTestCase = (index) => {
        setTestCasesList(testCasesList.filter((_, i) => i !== index));
    };

    const [importUrl, setImportUrl] = useState('');
    const [importing, setImporting] = useState(false);

    const handleImportProblem = async (e) => {
        e.preventDefault();
        setImporting(true);
        try {
            const { data } = await client.post('/problems/import', { url: importUrl });
            toast.success(`Imported: ${data.title}`);
            setImportUrl('');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Import failed');
        } finally {
            setImporting(false);
        }
    };

    const handleCreateProblem = async (e) => {
        e.preventDefault();
        try {
            const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
            const payload = {
                title,
                slug,
                difficulty,
                category,
                description,
                starterCode,
                examples: examplesList,
                constraints: constraintsList,
                testCases: testCasesList,
                source: 'manual'
            };

            await client.post('/problems', payload); // Assuming POST /problems exists and is protected
            toast.success('Problem created successfully!');
            // Reset
            setTitle('');
            setDescription('');
            setStarterCode({
                python: "class Solution:\n    def solve(self, args: any) -> any:\n        pass",
                cpp: "class Solution {\npublic:\n    void solve(vector<int>& args) {\n        \n    }\n};",
                c: "void solve(int* args, int argsSize) {\n    \n}"
            });
            setExamplesList([]);
            setConstraintsList([]);
            setTestCasesList([]);
        } catch (error) {
            console.error(error);
            toast.error('Failed to create problem');
        }
    };

    const [users, setUsers] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [loadingUsers, setLoadingUsers] = useState(false);

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const { data } = await client.get(`/admin/users?search=${searchKeyword}`);
            setUsers(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch users');
        } finally {
            setLoadingUsers(false);
        }
    };



    const [feedbacks, setFeedbacks] = useState([]);
    const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

    const fetchFeedbacks = async () => {
        setLoadingFeedbacks(true);
        try {
            const { data } = await client.get('/admin/feedback');
            setFeedbacks(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch feedback');
        } finally {
            setLoadingFeedbacks(false);
        }
    };

    const handleFeedbackStatus = async (id, status) => {
        try {
            await client.put(`/admin/feedback/${id}`, { status });
            toast.success(`Feedback marked as ${status}`);
            fetchFeedbacks();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update feedback');
        }
    }


    const handleRoleUpdate = async (userId, newRole) => {
        try {
            await client.put(`/admin/users/${userId}/role`, { role: newRole });
            toast.success(`User role updated to ${newRole}`);
            fetchUsers();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update role');
        }
    };

    // Contest Approvals
    const [approvals, setApprovals] = useState([]);
    const [loadingApprovals, setLoadingApprovals] = useState(false);

    const fetchApprovals = async () => {
        setLoadingApprovals(true);
        try {
            const { data } = await client.get('/contests/approvals');
            setApprovals(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch approvals');
        } finally {
            setLoadingApprovals(false);
        }
    };

    const handleApproval = async (id, status) => {
        try {
            await client.put(`/contests/approvals/${id}`, { status });
            toast.success(`Request ${status}`);
            fetchApprovals();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update request');
        }
    };

    const [newUserState, setNewUserState] = useState({ name: '', email: '', password: '', role: 'user' });

    // Anti-Cheat Logs
    const [activities, setActivities] = useState([]);
    const [activityStats, setActivityStats] = useState([]);
    const [loadingActivities, setLoadingActivities] = useState(false);

    const fetchActivities = async () => {
        setLoadingActivities(true);
        try {
            const { data } = await client.get('/contests/activities');
            setActivities(data.activities);
            setActivityStats(data.stats);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch security logs');
        } finally {
            setLoadingActivities(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await client.post('/admin/users', newUserState);
            toast.success('User created successfully');
            setNewUserState({ name: '', email: '', password: '', role: 'user' });
            fetchUsers();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to create user');
        }
    };


    if (!user || (user.role !== 'admin' && user.role !== 'assistant')) {
        return <div className="p-10 text-center text-red-500">Access Denied. Admins and Assistants Only.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                {user.role === 'admin' ? 'Admin Dashboard' : 'Assistant Panel'}
            </h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full md:w-64 space-y-2">
                    {user.role === 'admin' && (
                        <>
                            <button
                                onClick={() => setActiveTab('create-problem')}
                                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-2 transition-colors ${activeTab === 'create-problem' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                            >
                                <Plus size={18} />
                                <span>Add Problem</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('import-problem')}
                                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-2 transition-colors ${activeTab === 'import-problem' ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                            >
                                <Download size={18} />
                                <span>Import from LeetCode</span>
                            </button>

                            <button
                                onClick={() => { setActiveTab('users'); fetchUsers(); }}
                                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-2 transition-colors ${activeTab === 'users' ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                            >
                                <Users size={18} />
                                <span>User Management</span>
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => { setActiveTab('approvals'); fetchApprovals(); }}
                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-2 transition-colors ${activeTab === 'approvals' ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        <Check size={18} />
                        <span>Contest Approvals</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('feedback'); fetchFeedbacks(); }}
                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-2 transition-colors ${activeTab === 'feedback' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        <MessageSquare size={18} />
                        <span>User Feedback</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('security'); fetchActivities(); }}
                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-2 transition-colors ${activeTab === 'security' ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        <ShieldAlert size={18} />
                        <span>Security Logs</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 bg-[#1e1e1e] rounded-xl p-6 border border-gray-800 shadow-2xl">
                    {activeTab === 'users' && (
                        <div>
                            <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                                <Users className="text-green-400" />
                                <span>User Management</span>
                            </h2>

                            <div className="flex space-x-4 mb-6">
                                <input
                                    type="text"
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    placeholder="Search by Email or UTR..."
                                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500"
                                />
                                <button
                                    onClick={fetchUsers}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500"
                                >
                                    Search
                                </button>
                            </div>

                            {/* Create User Form - Simple Toggle or Inline */}
                            <div className="mb-8 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                                <h3 className="text-sm font-bold text-gray-300 mb-4">Create New User</h3>
                                <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={newUserState.name}
                                            onChange={e => setNewUserState({ ...newUserState, name: e.target.value })}
                                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={newUserState.email}
                                            onChange={e => setNewUserState({ ...newUserState, email: e.target.value })}
                                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Password</label>
                                        <input
                                            type="password"
                                            value={newUserState.password}
                                            onChange={e => setNewUserState({ ...newUserState, password: e.target.value })}
                                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Role</label>
                                        <select
                                            value={newUserState.role}
                                            onChange={e => setNewUserState({ ...newUserState, role: e.target.value })}
                                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white"
                                        >
                                            <option value="user">User</option>
                                            <option value="assistant">Assistant</option>
                                            <option value="judge">Judge</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium">Create</button>
                                </form>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-sm text-gray-400 border-b border-gray-700">
                                            <th className="py-3 px-2">Name</th>
                                            <th className="py-3 px-2">Email</th>
                                            <th className="py-3 px-2">Role</th>
                                            <th className="py-3 px-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {loadingUsers ? (
                                            <tr>
                                                <td colSpan="5" className="py-8">
                                                    <div className="flex justify-center">
                                                        <Loader size="lg" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : users.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="py-8 text-center text-gray-500">No users found</td>
                                            </tr>
                                        ) : (
                                            users.map(u => (
                                                <tr key={u._id} className="border-b border-gray-800 hover:bg-white/5">
                                                    <td className="py-3 px-2 text-white">{u.name}</td>
                                                    <td className="py-3 px-2 text-gray-300">{u.email}</td>
                                                    <td className="py-3 px-2">
                                                        <select
                                                            value={u.role}
                                                            onChange={(e) => handleRoleUpdate(u._id, e.target.value)}
                                                            className={`bg-transparent border-b border-gray-700 text-sm focus:outline-none focus:border-blue-500 cursor-pointer ${u.role === 'admin' ? 'text-red-400 font-bold' : u.role === 'assistant' ? 'text-orange-400 font-bold' : u.role === 'judge' ? 'text-purple-400 font-bold' : 'text-gray-300'}`}
                                                        >
                                                            <option value="user" className="bg-gray-800 text-gray-300">User</option>
                                                            <option value="assistant" className="bg-gray-800 text-orange-300">Assistant</option>
                                                            <option value="judge" className="bg-gray-800 text-purple-300">Judge</option>
                                                            <option value="admin" className="bg-gray-800 text-red-300">Admin</option>
                                                        </select>
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${u.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                                                            {u.status || 'Active'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}



                    {activeTab === 'import-problem' && (
                        <div>
                            <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                                <Download className="text-purple-400" />
                                <span>Import from LeetCode</span>
                            </h2>

                            <form onSubmit={handleImportProblem} className="space-y-6 max-w-2xl">
                                <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg mb-6">
                                    <p className="text-sm text-blue-300">
                                        Paste a LeetCode problem URL (e.g., <code>https://leetcode.com/problems/two-sum/</code>) or just the slug (<code>two-sum</code>).
                                        The system will automatically fetch the description, examples, and starter code.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">LeetCode URL or Slug</label>
                                    <input
                                        type="text"
                                        value={importUrl}
                                        onChange={(e) => setImportUrl(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="https://leetcode.com/problems/..."
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={importing}
                                    className={`px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-lg shadow-lg flex items-center space-x-2 transition-all transform hover:scale-[1.02] ${importing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {importing ? (
                                        <><span>Importing...</span></>
                                    ) : (
                                        <><Download size={18} /><span>Import Problem</span></>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'approvals' && (
                        <div>
                            <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                                <Check className="text-orange-400" />
                                <span>Contest Access Requests</span>
                            </h2>
                            <div className="flex space-x-4 mb-6">
                                <button
                                    onClick={fetchApprovals}
                                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 flex items-center space-x-2"
                                >
                                    <span>Refresh List</span>
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-sm text-gray-400 border-b border-gray-700">
                                            <th className="py-3 px-2">User</th>
                                            <th className="py-3 px-2">Contest</th>
                                            <th className="py-3 px-2">Requested At</th>
                                            <th className="py-3 px-2 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {loadingApprovals ? (
                                            <tr>
                                                <td colSpan="4" className="py-8">
                                                    <div className="flex justify-center">
                                                        <Loader size="lg" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : approvals.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="py-8 text-center text-gray-500">No pending approvals</td>
                                            </tr>
                                        ) : (
                                            approvals.map(req => (
                                                <tr key={req._id} className="border-b border-gray-800 hover:bg-white/5">
                                                    <td className="py-3 px-2">
                                                        <div className="text-white">{req.user?.name}</div>
                                                        <div className="text-xs text-gray-500">{req.user?.email}</div>
                                                    </td>
                                                    <td className="py-3 px-2 text-gray-300">{req.contest?.title}</td>
                                                    <td className="py-3 px-2 text-gray-400 text-xs">
                                                        {new Date(req.createdAt).toLocaleString()}
                                                    </td>
                                                    <td className="py-3 px-2 text-right space-x-2">
                                                        <button
                                                            onClick={() => handleApproval(req._id, 'approved')}
                                                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-500 text-xs"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleApproval(req._id, 'rejected')}
                                                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500 text-xs"
                                                        >
                                                            Reject
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {activeTab === 'create-problem' && (
                        <div>
                            <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                                <Plus className="text-green-400" />
                                <span>Create New Problem</span>
                            </h2>

                            <form onSubmit={handleCreateProblem} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Problem Title</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="e.g. Invert Binary Tree"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                                        <input
                                            type="text"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="e.g. Trees"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>
                                    <div className="flex space-x-4">
                                        {['Easy', 'Medium', 'Hard'].map(diff => (
                                            <button
                                                type="button"
                                                key={diff}
                                                onClick={() => setDifficulty(diff)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${difficulty === diff
                                                    ? (diff === 'Easy' ? 'bg-green-500/20 text-green-400 border border-green-500' : diff === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500' : 'bg-red-500/20 text-red-400 border border-red-500')
                                                    : 'bg-gray-800 text-gray-500 border border-gray-700 hover:bg-gray-700'
                                                    }`}
                                            >
                                                {diff}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Description (Markdown Supported)</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={6}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm leading-relaxed"
                                        placeholder="Enter problem description..."
                                        required
                                    />
                                </div>

                                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                    <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center space-x-2">
                                        <ExternalLink size={16} className="text-blue-400" />
                                        <span>Starter Code (Optional)</span>
                                    </h3>
                                    <div className="space-y-4">
                                        {['python', 'cpp', 'c'].map(lang => (
                                            <div key={lang}>
                                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-mono">{lang}</label>
                                                <textarea
                                                    value={starterCode[lang]}
                                                    onChange={(e) => setStarterCode({ ...starterCode, [lang]: e.target.value })}
                                                    rows={4}
                                                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white font-mono"
                                                    placeholder={`Enter starter code for ${lang}...`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                    <h3 className="text-sm font-medium text-gray-300 mb-4 flex justify-between items-center">
                                        <span>Examples ({examplesList.length})</span>
                                    </h3>

                                    {/* Examples List */}
                                    <div className="space-y-2 mb-4">
                                        {examplesList.map((ex, index) => (
                                            <div key={index} className="flex flex-col space-y-1 bg-gray-900 p-2 rounded border border-gray-700 relative group">
                                                <div className="text-xs font-mono text-gray-400">
                                                    <span className="text-blue-400">In:</span> {ex.input}
                                                </div>
                                                <div className="text-xs font-mono text-gray-400">
                                                    <span className="text-green-400">Out:</span> {ex.output}
                                                </div>
                                                {ex.explanation && (
                                                    <div className="text-xs text-gray-500 italic">
                                                        Note: {ex.explanation}
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeExample(index)}
                                                    className="absolute top-2 right-2 text-gray-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add New Example */}
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Input</label>
                                                <input
                                                    type="text"
                                                    value={currentExampleInput}
                                                    onChange={(e) => setCurrentExampleInput(e.target.value)}
                                                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white font-mono"
                                                    placeholder="e.g. [2,7,11,15], 9"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Output</label>
                                                <input
                                                    type="text"
                                                    value={currentExampleOutput}
                                                    onChange={(e) => setCurrentExampleOutput(e.target.value)}
                                                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white font-mono"
                                                    placeholder="e.g. [0,1]"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Explanation (Optional)</label>
                                            <input
                                                type="text"
                                                value={currentExampleExplanation}
                                                onChange={(e) => setCurrentExampleExplanation(e.target.value)}
                                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white"
                                                placeholder="e.g. Because nums[0] + nums[1] == 9, we return [0, 1]."
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addExample}
                                            className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-bold uppercase rounded flex items-center justify-center space-x-1 transition-colors"
                                        >
                                            <Plus size={14} />
                                            <span>Add Example</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                    <h3 className="text-sm font-medium text-gray-300 mb-4 flex justify-between items-center">
                                        <span>Constraints ({constraintsList.length})</span>
                                    </h3>

                                    {/* Constraints List */}
                                    <div className="space-y-2 mb-4">
                                        {constraintsList.map((c, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-900 p-2 rounded border border-gray-700">
                                                <code className="text-xs text-yellow-500 font-mono">{c}</code>
                                                <button
                                                    type="button"
                                                    onClick={() => removeConstraint(index)}
                                                    className="text-gray-500 hover:text-red-400 p-1"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add New Constraint */}
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={currentConstraint}
                                            onChange={(e) => setCurrentConstraint(e.target.value)}
                                            className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white font-mono"
                                            placeholder="e.g. 1 <= nums.length <= 10^4"
                                        />
                                        <button
                                            type="button"
                                            onClick={addConstraint}
                                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-bold uppercase rounded transition-colors"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                    <h3 className="text-sm font-medium text-gray-300 mb-4 flex justify-between items-center">
                                        <span>Test Cases ({testCasesList.length})</span>
                                    </h3>

                                    {/* Test Case List */}
                                    <div className="space-y-2 mb-4">
                                        {testCasesList.map((tc, index) => (
                                            <div key={index} className="flex items-center space-x-2 bg-gray-900 p-2 rounded border border-gray-700">
                                                <div className="flex-1 text-xs font-mono text-gray-400">
                                                    <span className="text-blue-400">In:</span> {tc.input.substring(0, 30)}{tc.input.length > 30 ? '...' : ''} | <span className="text-green-400">Out:</span> {tc.output.substring(0, 30)}{tc.output.length > 30 ? '...' : ''}
                                                    {tc.isHidden && <span className="ml-2 bg-red-500/20 text-red-400 text-[10px] px-1 py-0.5 rounded border border-red-500/30">HIDDEN</span>}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeTestCase(index)}
                                                    className="text-gray-500 hover:text-red-400 p-1"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add New Case */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Input</label>
                                            <input
                                                type="text"
                                                value={currentInput}
                                                onChange={(e) => setCurrentInput(e.target.value)}
                                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white font-mono"
                                                placeholder="e.g. [2,7,11,15], 9"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Output (Optional)</label>
                                            <input
                                                type="text"
                                                value={currentOutput}
                                                onChange={(e) => setCurrentOutput(e.target.value)}
                                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white font-mono"
                                                placeholder="e.g. [0,1]"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center">
                                        <input
                                            type="checkbox"
                                            id="isHiddenParams"
                                            checked={currentIsHidden}
                                            onChange={(e) => setCurrentIsHidden(e.target.checked)}
                                            className="mr-2 h-4 w-4 bg-gray-900 border-gray-700 rounded focus:ring-blue-500 text-blue-600"
                                        />
                                        <label htmlFor="isHiddenParams" className="text-xs text-gray-400">Mark as Hidden Test Case (Private)</label>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addTestCase}
                                        className="mt-3 w-full py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-bold uppercase rounded flex items-center justify-center space-x-1 transition-colors"
                                    >
                                        <Plus size={14} />
                                        <span>Add Test Case</span>
                                    </button>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-lg shadow-lg shadow-blue-900/30 flex items-center space-x-2 transition-all transform hover:scale-[1.02]"
                                    >
                                        <Save size={18} />
                                        <span>Create Problem</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    {activeTab === 'security' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="flex justify-between items-center text-center md:text-left">
                                <h1 className="text-3xl font-black flex items-center gap-3">
                                    <ShieldAlert className="text-red-500 h-10 w-10 animate-pulse" />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500">
                                        SECURITY LOCKDOWN LOGS
                                    </span>
                                </h1>
                                <button
                                    onClick={fetchActivities}
                                    className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl shadow-xl shadow-red-900/40 transition-all flex items-center gap-2 text-xs uppercase tracking-tighter"
                                >
                                    <Activity className="h-4 w-4" />
                                    REFRESH SYSTEM LOGS
                                </button>
                            </div>

                            {/* Rapid Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gray-950/80 p-8 rounded-3xl border border-gray-800 ring-1 ring-white/5 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Monitor className="h-20 w-20 text-red-500" />
                                    </div>
                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Live Violations</div>
                                    <div className="text-5xl font-black text-white">{activities.length}</div>
                                    <div className="mt-4 flex items-center gap-2 text-red-500 text-xs font-bold">
                                        <Activity className="h-3 w-3" />
                                        <span>SYSTEM ONLINE</span>
                                    </div>
                                </div>

                                <div className="bg-gray-950/80 p-8 rounded-3xl border border-gray-800 ring-1 ring-white/5 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Users className="h-20 w-20 text-orange-500" />
                                    </div>
                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Flagged Users</div>
                                    <div className="text-5xl font-black text-white">{activityStats.length}</div>
                                    <div className="mt-4 flex items-center gap-2 text-orange-500 text-xs font-bold">
                                        <ShieldAlert className="h-3 w-3" />
                                        <span>RISK DETECTED</span>
                                    </div>
                                </div>

                                <div className="bg-gray-950/80 p-8 rounded-3xl border border-gray-800 ring-1 ring-white/5 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Clock className="h-20 w-20 text-blue-500" />
                                    </div>
                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Avg Swaps/User</div>
                                    <div className="text-5xl font-black text-white">
                                        {activityStats.length > 0
                                            ? (activityStats.reduce((a, b) => a + b.tabSwitches, 0) / activityStats.length).toFixed(1)
                                            : 0
                                        }
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-blue-500 text-xs font-bold">
                                        <Clock className="h-3 w-3" />
                                        <span>LAST 24 HOURS</span>
                                    </div>
                                </div>
                            </div>

                            {/* User Violation Breakdown */}
                            <div className="glass rounded-[32px] border border-white/5 shadow-3xl overflow-hidden">
                                <div className="p-8 bg-white/[0.02] border-b border-white/5 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-black text-white tracking-tight">Participant Violation Stats</h3>
                                        <p className="text-gray-500 text-xs mt-1">Real-time aggregate of security events per user</p>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-black/40">
                                            <tr>
                                                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 tracking-[0.1em]">Participant Details</th>
                                                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 tracking-[0.1em]">Tab Swaps</th>
                                                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 tracking-[0.1em]">Focus Loss</th>
                                                <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-500 tracking-[0.1em]">Risk Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {loadingActivities ? (
                                                <tr><td colSpan="4" className="py-20 text-center"><Loader size="xl" /></td></tr>
                                            ) : activityStats.length === 0 ? (
                                                <tr><td colSpan="4" className="py-20 text-center text-gray-500">No security incidents recorded. System is secure.</td></tr>
                                            ) : (
                                                activityStats.map(stat => (
                                                    <tr key={stat._id} className="hover:bg-white/[0.02] transition-colors group">
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="h-10 w-10 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center border border-white/10 font-black text-red-500">
                                                                    {stat.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <div className="font-black text-white group-hover:text-red-400 transition-colors uppercase text-sm tracking-tight">{stat.name}</div>
                                                                    <div className="text-[10px] text-gray-500 font-mono tracking-tighter">{stat.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <span className={`px-4 py-2 rounded-xl font-black text-xs ${stat.tabSwitches > 5 ? 'bg-red-500 text-white shadow-lg shadow-red-900/50' :
                                                                stat.tabSwitches > 0 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                                                    'bg-green-500/10 text-green-500'
                                                                }`}>
                                                                {stat.tabSwitches} SHIFTS
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="text-xl font-black text-gray-300">{stat.windowBlurs}</div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg w-fit border ${stat.tabSwitches > 10 ? 'bg-red-500/10 text-red-500 border-red-500/40' :
                                                                stat.tabSwitches > 3 ? 'bg-orange-500/10 text-orange-400 border-orange-500/40' :
                                                                    'bg-green-500/10 text-green-500 border-green-500/40'
                                                                }`}>
                                                                {stat.tabSwitches > 10 ? 'Terminated' : stat.tabSwitches > 3 ? 'Flagged' : 'Normal'}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Detailed Incident Log */}
                            <div className="glass rounded-[32px] border border-white/5 shadow-3xl overflow-hidden">
                                <div className="p-8 bg-white/[0.02] border-b border-white/5">
                                    <h3 className="text-xl font-black text-white tracking-tight">Recent Incidents Log</h3>
                                </div>
                                <div className="max-h-[600px] overflow-y-auto divide-y divide-white/5">
                                    {activities.map((activity, idx) => (
                                        <div key={idx} className="p-6 hover:bg-white/5 transition-colors flex items-center gap-6 group">
                                            <div className="h-12 w-12 rounded-2xl bg-gray-950 flex items-center justify-center border border-white/5 shrink-0 transition-transform group-hover:scale-110">
                                                {activity.action === 'tab_switch' ? (
                                                    <Monitor className="h-5 w-5 text-red-500" />
                                                ) : (
                                                    <Monitor className="h-5 w-5 text-orange-500" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-black text-white uppercase text-xs tracking-widest">{activity.user?.name}</span>
                                                    <span className="h-1 w-1 bg-gray-700 rounded-full"></span>
                                                    <span className="text-[10px] font-black text-gray-600 font-mono italic">
                                                        {new Date(activity.timestamp).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-400 font-medium line-clamp-1">
                                                    {activity.details}
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className={`text-[10px] font-black uppercase px-2 py-1 rounded bg-black/40 border ${activity.action === 'tab_switch' ? 'text-red-500 border-red-500/30' : 'text-orange-500 border-orange-500/30'
                                                    }`}>
                                                    {activity.action.replace('_', ' ')}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'feedback' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold flex items-center space-x-2">
                                    <MessageSquare className="text-indigo-400" />
                                    <span>Support & Feedback Management</span>
                                </h2>
                                <button
                                    onClick={fetchFeedbacks}
                                    className="px-4 py-2 bg-indigo-600/20 text-indigo-400 rounded-lg hover:bg-indigo-600/30 transition-colors text-sm font-medium border border-indigo-600/30"
                                >
                                    Refresh Feed
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-sm text-gray-400 border-b border-gray-700">
                                            <th className="py-3 px-2">Type / Date</th>
                                            <th className="py-3 px-2">User / Contact</th>
                                            <th className="py-3 px-2">Subject / Message</th>
                                            <th className="py-3 px-2">Status</th>
                                            <th className="py-3 px-2 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {loadingFeedbacks ? (
                                            <tr>
                                                <td colSpan="5" className="py-8 text-center"><Loader size="md" /></td>
                                            </tr>
                                        ) : feedbacks.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="py-8 text-center text-gray-500">No feedback submissions found</td>
                                            </tr>
                                        ) : (
                                            feedbacks.map(f => (
                                                <tr key={f._id} className="border-b border-gray-800 hover:bg-white/5 align-top">
                                                    <td className="py-3 px-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black ${f.type === 'bug' ? 'bg-red-500/10 text-red-500' :
                                                            f.type === 'debate' ? 'bg-yellow-500/10 text-yellow-500' :
                                                                f.type === 'query' ? 'bg-purple-500/10 text-purple-500' :
                                                                    'bg-blue-500/10 text-blue-500'
                                                            }`}>
                                                            {f.type}
                                                        </span>
                                                        <div className="text-[10px] text-gray-500 mt-1">{new Date(f.createdAt).toLocaleDateString()}</div>
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <div className="font-bold text-white">{f.name}</div>
                                                        <div className="text-xs text-gray-500">{f.email}</div>
                                                        {f.user && <div className="text-[10px] text-primary">@ {f.user.username}</div>}
                                                    </td>
                                                    <td className="py-3 px-2 max-w-xs">
                                                        <div className="font-semibold text-gray-200 truncate">{f.subject}</div>
                                                        <div className="text-xs text-gray-400 mt-1 line-clamp-2 italic">"{f.message}"</div>
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${f.status === 'resolved' ? 'bg-green-500/10 text-green-500' :
                                                            f.status === 'reviewed' ? 'bg-blue-500/10 text-blue-500' :
                                                                'bg-gray-800 text-gray-400'
                                                            }`}>
                                                            {f.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-2 text-right space-x-1">
                                                        {f.status === 'pending' && (
                                                            <button
                                                                onClick={() => handleFeedbackStatus(f._id, 'reviewed')}
                                                                className="p-1.5 hover:bg-blue-500/20 text-blue-400 rounded transition-colors"
                                                                title="Mark as Reviewed"
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                        )}
                                                        {f.status !== 'resolved' && (
                                                            <button
                                                                onClick={() => handleFeedbackStatus(f._id, 'resolved')}
                                                                className="p-1.5 hover:bg-green-500/20 text-green-400 rounded transition-colors"
                                                                title="Mark as Resolved"
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Activity = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24" height="24"
        viewBox="0 0 24 24" fill="none"
        stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        {...props}
    >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
);

export default AdminDashboard;
