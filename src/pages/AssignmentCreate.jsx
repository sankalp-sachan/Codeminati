import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Save, FileCode, Check, AlertTriangle, ChevronLeft, Layout, BookOpen, Clock } from 'lucide-react';
import Loader from '../components/Loader';
import Editor from '@monaco-editor/react';

const AssignmentCreate = () => {
    const { id: classroomId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [classroom, setClassroom] = useState(null);

    const [assignment, setAssignment] = useState({
        title: '',
        description: '',
        dueDate: ''
    });

    const [showProblemForm, setShowProblemForm] = useState(false);
    const [newProblem, setNewProblem] = useState({
        title: '',
        description: '',
        difficulty: 'Easy',
        starterCode: {
            python: '# Write your code here\n',
            cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}\n',
            c: '#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}\n'
        },
        testCases: [
            { input: '', expectedOutput: '', isHidden: false }
        ]
    });

    const [activeAssignmentId, setActiveAssignmentId] = useState(null);
    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        fetchClassroom();
        fetchAssignments();
    }, [classroomId]);

    const fetchClassroom = async () => {
        try {
            const { data } = await client.get(`/classrooms/${classroomId}`);
            setClassroom(data.classroom);
        } catch (err) {
            toast.error("Failed to load classroom");
        }
    };

    const fetchAssignments = async () => {
        try {
            const { data } = await client.get(`/classrooms/${classroomId}/assignments`);
            setAssignments(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await client.post(`/classrooms/${classroomId}/assignments`, assignment);
            toast.success("Assignment created! Now add problems.");
            setActiveAssignmentId(data._id);
            setAssignments([data, ...assignments]);
            setAssignment({ title: '', description: '', dueDate: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create assignment");
        } finally {
            setLoading(false);
        }
    };

    const handleAddProblem = async (e) => {
        e.preventDefault();
        if (!activeAssignmentId) return;
        setLoading(true);
        try {
            await client.post(`/classrooms/${classroomId}/assignments/${activeAssignmentId}/problems`, newProblem);
            toast.success("Problem added to assignment!");
            fetchAssignments();
            setShowProblemForm(false);
            setNewProblem({
                title: '',
                description: '',
                difficulty: 'Easy',
                starterCode: {
                    python: '# Write your code here\n',
                    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}\n',
                    c: '#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}\n'
                },
                testCases: [{ input: '', expectedOutput: '', isHidden: false }]
            });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add problem");
        } finally {
            setLoading(false);
        }
    };

    const handleTestCaseChange = (index, field, value) => {
        const updated = [...newProblem.testCases];
        updated[index][field] = value;
        setNewProblem({ ...newProblem, testCases: updated });
    };

    const addTestCase = () => {
        setNewProblem({
            ...newProblem,
            testCases: [...newProblem.testCases, { input: '', expectedOutput: '', isHidden: false }]
        });
    };

    const removeTestCase = (index) => {
        if (newProblem.testCases.length === 1) return;
        const updated = newProblem.testCases.filter((_, i) => i !== index);
        setNewProblem({ ...newProblem, testCases: updated });
    };

    if (!classroom) return <div className="h-screen flex items-center justify-center bg-[#0f0f15]"><Loader size="xl" /></div>;

    return (
        <div className="min-h-screen bg-[#0f0f15] text-white p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
                >
                    <ChevronLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                    {/* Left: Create New Assignment */}
                    <div className="w-full md:w-1/3 space-y-6">
                        <div className="bg-[#1a1a24] rounded-3xl p-8 border border-white/5">
                            <h2 className="text-2xl font-black italic mb-6 text-blue-400 uppercase tracking-tighter">New Assignment</h2>
                            <form onSubmit={handleCreateAssignment} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Title</label>
                                    <input 
                                        type="text"
                                        required
                                        value={assignment.title}
                                        onChange={(e) => setAssignment({...assignment, title: e.target.value})}
                                        placeholder="Week 1: Basics"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Description</label>
                                    <textarea 
                                        rows="3"
                                        value={assignment.description}
                                        onChange={(e) => setAssignment({...assignment, description: e.target.value})}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-all resize-none"
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Due Date</label>
                                    <input 
                                        type="datetime-local"
                                        value={assignment.dueDate}
                                        onChange={(e) => setAssignment({...assignment, dueDate: e.target.value})}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-all"
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20"
                                >
                                    {loading ? 'Creating...' : 'Create Assignment'}
                                </button>
                            </form>
                        </div>

                        {/* Recent Assignments List */}
                        <div className="bg-[#1a1a24] rounded-3xl p-8 border border-white/5">
                            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-6">Existing Assignments</h3>
                            <div className="space-y-3">
                                {assignments.length === 0 ? (
                                    <p className="text-gray-600 italic text-sm text-center py-4">No assignments yet.</p>
                                ) : (
                                    assignments.map(asm => (
                                        <div 
                                            key={asm._id} 
                                            onClick={() => setActiveAssignmentId(asm._id)}
                                            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                                                activeAssignmentId === asm._id 
                                                ? 'bg-blue-500/10 border-blue-500/30' 
                                                : 'bg-black/20 border-white/5 hover:border-white/20'
                                            }`}
                                        >
                                            <p className="font-bold text-sm truncate">{asm.title}</p>
                                            <p className="text-[10px] text-gray-500 mt-1">{asm.problems?.length || 0} Problems</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Add Problems to Active Assignment */}
                    <div className="flex-1 w-full space-y-6">
                        {activeAssignmentId ? (
                            <div className="bg-[#1a1a24] rounded-3xl p-8 border border-white/5">
                                <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                                    <div>
                                        <h2 className="text-3xl font-black italic text-white flex items-center gap-3">
                                            <BookOpen className="text-blue-500" />
                                            {assignments.find(a => a._id === activeAssignmentId)?.title}
                                        </h2>
                                        <p className="text-gray-500 text-sm mt-1">Configure coding questions for this assignment.</p>
                                    </div>
                                    <button 
                                        onClick={() => setShowProblemForm(!showProblemForm)}
                                        className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl text-sm font-bold transition-all"
                                    >
                                        {showProblemForm ? 'Collapse Form' : 'Add New Problem'}
                                    </button>
                                </div>

                                {showProblemForm ? (
                                    <form onSubmit={handleAddProblem} className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="col-span-2 md:col-span-1">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Problem Title</label>
                                                <input 
                                                    type="text"
                                                    required
                                                    value={newProblem.title}
                                                    onChange={(e) => setNewProblem({...newProblem, title: e.target.value})}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm"
                                                />
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Difficulty</label>
                                                <select 
                                                    value={newProblem.difficulty}
                                                    onChange={(e) => setNewProblem({...newProblem, difficulty: e.target.value})}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none"
                                                >
                                                    <option>Easy</option>
                                                    <option>Medium</option>
                                                    <option>Hard</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Problem Description (Markdown)</label>
                                            <textarea 
                                                required
                                                rows="6"
                                                value={newProblem.description}
                                                onChange={(e) => setNewProblem({...newProblem, description: e.target.value})}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-all resize-y font-mono"
                                                placeholder="Describe the problem, input/output format, and constraints..."
                                            ></textarea>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Test Cases</label>
                                            <div className="space-y-4">
                                                {newProblem.testCases.map((tc, index) => (
                                                    <div key={index} className="bg-black/20 p-4 rounded-2xl border border-white/5 relative group">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-[9px] text-gray-600 block mb-1">Input</label>
                                                                <textarea 
                                                                    value={tc.input}
                                                                    onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                                                                    className="w-full bg-black/30 border border-white/5 rounded-lg p-2 text-[11px] font-mono"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[9px] text-gray-600 block mb-1">Expected Output</label>
                                                                <textarea 
                                                                    value={tc.expectedOutput}
                                                                    onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                                                                    className="w-full bg-black/30 border border-white/5 rounded-lg p-2 text-[11px] font-mono"
                                                                />
                                                            </div>
                                                        </div>
                                                        <button 
                                                            type="button"
                                                            onClick={() => removeTestCase(index)}
                                                            className="absolute -top-2 -right-2 bg-red-500/20 text-red-400 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button 
                                                    type="button" 
                                                    onClick={addTestCase}
                                                    className="w-full border-2 border-dashed border-white/5 hover:border-white/20 transition-all rounded-2xl py-3 text-xs text-gray-500 flex items-center justify-center gap-2"
                                                >
                                                    <Plus size={14} /> Add Test Case
                                                </button>
                                            </div>
                                        </div>

                                        <button 
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl font-black italic uppercase tracking-widest transition-all"
                                        >
                                            {loading ? 'Processing...' : 'Save Problem & Add to Assignment'}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Questions in this Assignment</h3>
                                        {assignments.find(a => a._id === activeAssignmentId)?.problems?.length === 0 ? (
                                            <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                                <FileCode className="mx-auto text-gray-700 mb-4" size={48} />
                                                <p className="text-gray-500 text-sm">No problems added to this assignment yet.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {assignments.find(a => a._id === activeAssignmentId)?.problems?.map((p, idx) => (
                                                    <div key={p._id} className="p-6 bg-black/40 border border-white/5 rounded-3xl flex items-center justify-between group">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 font-black italic">
                                                                {idx + 1}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-white group-hover:text-blue-400 transition-colors">{p.title}</p>
                                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                                                    p.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400' :
                                                                    p.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                                                                }`}>
                                                                    {p.difficulty}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {/* Preview Action? */}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-[#1a1a24] rounded-3xl border border-white/5 p-12 text-center">
                                <Layout className="text-gray-700 mb-4" size={64} />
                                <h3 className="text-xl font-bold text-gray-500">Select an assignment to manage problems</h3>
                                <p className="text-sm text-gray-600 mt-2 max-w-md">Or create a new one on the left to start adding coding challenges for your students.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignmentCreate;
