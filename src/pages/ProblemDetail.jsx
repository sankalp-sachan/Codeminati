import { useState, useEffect } from 'react';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import useAntiCheat from '../hooks/useAntiCheat';
import Editor from '@monaco-editor/react';
import { Play, Check, AlertTriangle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Lightbulb, Clock, Plus, Trash2, Save, Cloud, Maximize2, Minimize2, Maximize, GripVertical, GripHorizontal, Coins, Ticket, Gem, Award, RotateCcw, Info, X, FileText, BookOpen, FlaskConical, History } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import client from '../api/client';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const HintAccordion = ({ hint, index }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-gray-700/50 rounded-lg overflow-hidden bg-gray-800/10">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <span>Hint {index + 1}</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 pt-0 text-sm text-gray-400 border-t border-gray-700/30 mt-2 bg-black/20">
                    <div className="pt-2">
                        <ReactMarkdown>{hint}</ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    );
};

const ProblemDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const contestId = location.state?.contestId;
    const { user, updateUser } = useAuth();

    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('python');

    const [codeMap, setCodeMap] = useState({});

    // Contest State
    const [contestEndTime, setContestEndTime] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [isContestEnded, setIsContestEnded] = useState(false);


    // UI State
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const [activeBottomTab, setActiveBottomTab] = useState('testcase');

    // Test Case State
    const [userTestCases, setUserTestCases] = useState([]);
    const [activeTestCaseId, setActiveTestCaseId] = useState(0);
    const [testResults, setTestResults] = useState(null);
    const [overallStatus, setOverallStatus] = useState(null);


    const [lastSavedCode, setLastSavedCode] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Discussion State


    // Success Modal State
    // Success Modal State
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [modalData, setModalData] = useState(null);

    // Reset Confirmation Modal State
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    // Console Visibility State
    const [isConsoleOpen, setIsConsoleOpen] = useState(true);

    // Layout State
    const [leftPanelWidth, setLeftPanelWidth] = useState(50); // Percentage
    const [editorHeight, setEditorHeight] = useState(60); // Percentage for Editor Height (Console Height = 100 - editorHeight)
    const [isDragging, setIsDragging] = useState(false);
    const [isDraggingVertical, setIsDraggingVertical] = useState(false);
    const [fullScreenMode, setFullScreenMode] = useState(null); // 'description', 'compiler', or null

    const [error, setError] = useState(null);

    // Fetch Problem & Progress
    useEffect(() => {
        const fetchProblemAndProgress = async () => {
            try {
                // 1. Fetch Problem
                const { data: problemData } = await client.get(`/problems/${slug}`);
                setProblem(problemData);

                // Default initialization
                let initialLang = 'python';
                let initialCode = problemData.starterCode?.[initialLang] ||
                    problemData.starterCode?.python ||
                    problemData.starterCode?.python3 ||
                    problemData.starterCode?.cpp ||
                    problemData.starterCode?.['c++'] ||
                    problemData.starterCode?.c ||
                    '// Write your code here';
                let initialMap = {};

                // 2. Fetch Progress (if logged in)
                if (user) {
                    try {
                        const { data: progressData } = await client.get(`/problems/${slug}/progress?context=practice`);
                        if (progressData) {
                            console.log('Restoring progress...');
                            initialMap = progressData.codes || {};

                            // If we have saved progress, that takes precedence over preferred language
                            initialLang = progressData.language || initialLang;
                            initialCode = initialMap[initialLang] || problemData.starterCode?.[initialLang] || initialCode;
                        }
                    } catch (err) {
                        console.error('Failed to fetch progress', err);
                    }
                }

                setLanguage(initialLang);
                setCode(initialCode);
                setCodeMap(initialMap);
                setLastSavedCode(initialCode);

                // Initialize user test cases
                if (problemData.examples && problemData.examples.length > 0) {
                    setUserTestCases(problemData.examples.map((ex, i) => ({
                        id: i,
                        input: ex.input,
                        expectedOutput: ex.output
                    })));
                } else {
                    setUserTestCases([{ id: 0, input: 'Input here...', expectedOutput: '' }]);
                }

            } catch (error) {
                console.error(error);
                const msg = error.response?.data?.message || error.message || 'Problem not found or could not be loaded.';
                setError(msg);
                toast.error(msg);
            }
        };
        fetchProblemAndProgress();
    }, [slug, user]);



    // Fetch Contest Details for Timer & Navigation
    const [contestProblems, setContestProblems] = useState([]);

    useEffect(() => {
        if (contestId) {
            const fetchContest = async () => {
                try {
                    const { data } = await client.get(`/contests/${contestId}`);
                    setContestEndTime(new Date(data.endTime));
                    if (data.problems) setContestProblems(data.problems);
                } catch (err) {
                    console.error('Failed to fetch contest details', err);
                }
            };
            fetchContest();
        }
    }, [contestId]);

    // Navigation Logic
    const currentProblemIndex = contestProblems.findIndex(p => p.slug === slug);
    const prevProblem = currentProblemIndex > 0 ? contestProblems[currentProblemIndex - 1] : null;
    const nextProblem = currentProblemIndex !== -1 && currentProblemIndex < contestProblems.length - 1 ? contestProblems[currentProblemIndex + 1] : null;

    const handleNavigateProblem = (targetSlug) => {
        navigate(`/problems/${targetSlug}`, { state: { contestId } });
    };

    // Timer Logic
    useEffect(() => {
        if (!contestEndTime) return;

        const interval = setInterval(() => {
            const now = new Date();
            const diff = contestEndTime - now;

            if (diff <= 0) {
                setTimeLeft('00:00:00');
                setIsContestEnded(true);
                clearInterval(interval);
                toast.error('Contest Ended! Submissions disabled.');
            } else {
                const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const m = Math.floor((diff / (1000 * 60)) % 60);
                const s = Math.floor((diff / 1000) % 60);
                setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [contestEndTime]);
    useEffect(() => {
        if (!user || !code || code === lastSavedCode) return;

        const timeoutId = setTimeout(async () => {
            setIsSaving(true);
            try {
                await client.post(`/problems/${slug}/progress`, { code, language, context: 'practice' });
                setLastSavedCode(code);
                setCodeMap(prev => ({ ...prev, [language]: code }));
            } catch (error) {
                console.error('Auto-save failed', error);
            } finally {
                setIsSaving(false);
            }
        }, 2000);

        return () => clearTimeout(timeoutId);
    }, [code, language, slug, user, lastSavedCode]);





    const handleLanguageChange = (newLang) => {
        const updatedMap = { ...codeMap, [language]: code };
        setCodeMap(updatedMap);

        const savedCode = updatedMap[newLang];
        const starter = problem?.starterCode?.[newLang] || '// Write your code here';

        setLanguage(newLang);
        setCode(savedCode || starter);
        setLastSavedCode(savedCode || starter);
    };

    const handleReset = () => {
        setShowResetConfirm(true);
    };

    const confirmReset = () => {
        const starter = problem?.starterCode?.[language] || '// Write your code here';
        setCode(starter);
        setShowResetConfirm(false);
    };

    const handleRun = async () => {
        if (!user) {
            toast.error('Please login to run code');
            navigate('/login', { state: { from: `/problems/${slug}` } });
            return;
        }
        setLoading(true);
        setIsConsoleOpen(true);
        setActiveBottomTab('result');
        setTestResults(null);
        setOverallStatus('Running...');

        try {
            const { data } = await client.post(`/problems/${slug}/submit`, {
                code,
                language,
                mode: 'run',
                testCases: userTestCases,
                context: 'practice'
            });

            setOverallStatus(data.status);
            setTestResults(data.results);

        } catch (error) {
            toast.error('Run failed');
            setOverallStatus('Error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!user) {
            toast.error('Please login to submit code');
            navigate('/login', { state: { from: `/problems/${slug}` } });
            return;
        }
        setLoading(true);
        try {
            const { data } = await client.post(`/problems/${slug}/submit`, {
                code,
                language,
                mode: 'submit',
                context: 'practice'
            });

            if (data.status === 'Accepted') {
                toast.success('Accepted!');
                if (data.userStats && !contestId) {
                    updateUser(data.userStats);
                }

                // Reset code to default
                const starter = problem?.starterCode?.[language] || '// Write your code here';
                setCode(starter);
                setLastSavedCode(starter);
                setCodeMap(prev => ({ ...prev, [language]: starter }));

                // Show Success Modal with Metrics
                if (data.metrics) {
                    setModalData({
                        code: code, // Keep the submitted code for the modal
                        language,
                        metrics: data.metrics,
                        passedCases: data.passedCases || problem.testCases?.length || 0,
                        totalCases: data.totalCases || problem.testCases?.length || 0
                    });
                    setShowSuccessModal(true);
                }
            } else {
                toast.error(data.status);
            }
            setActiveTab('description');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    // Keyboard Shortcuts (Moved here to access handleRun/handleSubmit)
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Run Code: Ctrl + '
            if ((e.ctrlKey || e.metaKey) && e.key === "'") {
                e.preventDefault();
                handleRun();
            }
            // Submit Code: Ctrl + Enter
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleRun, handleSubmit]);

    const handleAddTestCase = () => {
        const newId = userTestCases.length;
        setUserTestCases([...userTestCases, { id: newId, input: 'New Input', expectedOutput: '' }]);
        setActiveTestCaseId(newId);
    };

    const handleRemoveTestCase = (deleteId) => {
        if (userTestCases.length <= 1) return;
        const newCases = userTestCases.filter(c => c.id !== deleteId);
        setUserTestCases(newCases);
        setActiveTestCaseId(0);
    };

    const handleTestCaseChange = (val) => {
        const updatedCases = [...userTestCases];
        updatedCases[activeTestCaseId].input = val;
        setUserTestCases(updatedCases);
    };



    const handleDragStart = (e) => {
        setIsDragging(true);
        e.preventDefault();
    };

    const handleDragMove = (e) => {
        if (!isDragging) return;
        const newWidth = (e.clientX / window.innerWidth) * 100;
        if (newWidth > 20 && newWidth < 80) {
            setLeftPanelWidth(newWidth);
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none'; // Prevent text selection while dragging
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleDragEnd);
        } else {
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
        }
        return () => {
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto'; // Cleanup
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
        };
    }, [isDragging]);

    const handleVerticalDragStart = (e) => {
        setIsDraggingVertical(true);
        e.preventDefault();
    };

    const handleVerticalDragMove = (e) => {
        if (!isDraggingVertical) return;
        // Calculate relative to the container height
        const containerHeight = window.innerHeight - 64 - 48; // Header + Toolbar approx
        // We need the Y position relative to the top of the content area.
        const newHeight = ((e.clientY - 64 - 48) / containerHeight) * 100;

        if (newHeight > 20 && newHeight < 80) {
            setEditorHeight(newHeight);
        }
    };

    const handleVerticalDragEnd = () => {
        setIsDraggingVertical(false);
    };

    useEffect(() => {
        if (isDraggingVertical) {
            document.body.style.cursor = 'row-resize';
            document.body.style.userSelect = 'none';
            window.addEventListener('mousemove', handleVerticalDragMove);
            window.addEventListener('mouseup', handleVerticalDragEnd);
        } else {
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
            window.removeEventListener('mousemove', handleVerticalDragMove);
            window.removeEventListener('mouseup', handleVerticalDragEnd);
        }
        return () => {
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
            window.removeEventListener('mousemove', handleVerticalDragMove);
            window.removeEventListener('mouseup', handleVerticalDragEnd);
        };
    }, [isDraggingVertical]);

    const toggleFullScreen = (mode) => {
        if (fullScreenMode === mode) {
            setFullScreenMode(null);
            setLeftPanelWidth(50);
        } else {
            setFullScreenMode(mode);
            if (mode === 'description') setLeftPanelWidth(100);
            if (mode === 'compiler') setLeftPanelWidth(0);
        }
    };

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0f0f15] flex-col space-y-4">
                <AlertTriangle className="h-16 w-16 text-red-500" />
                <h2 className="text-2xl font-bold text-white">{error}</h2>
                <button
                    onClick={() => navigate('/problems')}
                    className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors text-white"
                >
                    Back to Problems
                </button>
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0f0f15]">
                <Loader size="xl" />
            </div>
        );
    }



    const showLeftPanel = fullScreenMode !== 'compiler';
    const showRightPanel = fullScreenMode !== 'description';

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col bg-[#0f0f15] relative">

            {/* Reset Confirmation Modal */}
            {showResetConfirm && (
                <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#262626] rounded-xl border border-gray-700 w-full max-w-md shadow-2xl p-6 transform scale-100 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 bg-green-500 rounded-full p-2">
                                <Info className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-white mb-2">Are you sure?</h3>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    Your current code will be discarded and reset to the default code!
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmReset}
                                className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal Overlay */}
            {showSuccessModal && modalData && (
                <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#1e1e1e] rounded-xl border border-gray-700 w-full max-w-5xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300 h-[85vh] flex flex-col">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 bg-black/20 p-1 rounded-full"
                        >
                            <Trash2 className="rotate-45" size={20} />
                        </button>

                        <div className="flex flex-col md:flex-row h-full overflow-hidden">
                            {/* Left Panel: Stats */}
                            <div className="w-full md:w-5/12 p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-700 flex flex-col overflow-y-auto">
                                <div className="flex items-center space-x-3 mb-6">
                                    <h2 className="text-3xl font-bold text-green-500">Accepted</h2>
                                    <span className="text-gray-400 text-sm font-mono">{modalData.passedCases || 'All'}/{modalData.totalCases || 'All'} testcases passed</span>
                                </div>

                                <div className="flex items-center space-x-3 mb-8">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                                            {user.username?.[0]?.toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-white font-bold">{user.username}</span>
                                    <span className="text-gray-500 text-sm">submitted just now</span>
                                </div>

                                <div className="space-y-6">
                                    {/* Runtime Card */}
                                    <div className="bg-[#2d2d2d] rounded-xl p-4 border border-gray-700 relative overflow-hidden group">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <Clock className="w-5 h-5 text-gray-400" />
                                                <span className="font-bold text-lg text-white">Runtime</span>
                                            </div>
                                            <div className="text-xs text-green-400 font-bold bg-green-900/30 px-2 py-1 rounded">
                                                Accepted
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <span className="text-4xl font-extrabold text-white">{modalData.metrics.runtime}</span>
                                            <span className="text-xl text-gray-400 ml-1">ms</span>
                                        </div>

                                        <div className="text-sm text-gray-300">
                                            Beats <span className="font-bold text-white">{modalData.metrics.runtimePercentile}%</span> of users with {modalData.language}
                                        </div>

                                        {/* Simple Bar Graph Visualization */}
                                        <div className="mt-4 h-16 flex items-end space-x-1 pb-2 border-b border-gray-600">
                                            {[...Array(15)].map((_, i) => {
                                                const height = Math.random() * 80 + 20;
                                                // Highlight one bar roughly based on percentile
                                                const isUser = Math.abs(i - Math.floor((100 - modalData.metrics.runtimePercentile) / 100 * 15)) <= 0;

                                                return (
                                                    <div
                                                        key={i}
                                                        className={`flex-1 rounded-t-sm transition-all duration-500 ${isUser ? 'bg-blue-500' : 'bg-gray-600'}`}
                                                        style={{ height: `${height}%` }}
                                                    ></div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Memory Card */}
                                    <div className="bg-[#2d2d2d] rounded-xl p-4 border border-gray-700 relative overflow-hidden group">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <Cloud className="w-5 h-5 text-gray-400" />
                                                <span className="font-bold text-lg text-white">Memory</span>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <span className="text-4xl font-extrabold text-white">{modalData.metrics.memory}</span>
                                            <span className="text-xl text-gray-400 ml-1">MB</span>
                                        </div>

                                        <div className="text-sm text-gray-300">
                                            Beats <span className="font-bold text-white">{modalData.metrics.memoryPercentile}%</span> of users with {modalData.language}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 md:mt-auto flex space-x-4 pt-6">
                                    <button
                                        onClick={() => setShowSuccessModal(false)}
                                        className="flex-1 py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold transition-colors shadow-lg shadow-green-900/20 flex items-center justify-center space-x-2"
                                    >
                                        <span>Close</span>
                                    </button>
                                </div>
                            </div>

                            {/* Right Panel: Code Preview */}
                            <div className="w-full md:w-7/12 bg-[#1e1e1e] flex flex-col h-full overflow-hidden min-h-[300px]">
                                <div className="p-4 border-b border-gray-700 font-medium text-gray-300 flex justify-between items-center bg-[#252526]">
                                    <span>Submitted Code</span>
                                    <span className="text-xs text-blue-400 font-mono border border-blue-500/30 px-2 py-0.5 rounded bg-blue-500/10 uppercase">{modalData.language}</span>
                                </div>
                                <div className="flex-1 overflow-hidden relative">
                                    <Editor
                                        key={modalData.code?.length} // Force re-render if code changes
                                        height="100%"
                                        language={modalData.language}
                                        theme="vs-dark"
                                        value={modalData.code}
                                        loading={<div className="text-gray-500 p-4">Loading code...</div>}
                                        options={{
                                            readOnly: true,
                                            minimap: { enabled: false },
                                            fontSize: 13,
                                            scrollBeyondLastLine: false,
                                            fontFamily: "'Fira Code', 'Monaco', monospace",
                                            renderValidationDecorations: "off",
                                            lineNumbers: "on"
                                        }}
                                    />
                                    {/* Glass Overlay for effect (optional) */}
                                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-black/10"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Toolbar - Redesigned for Full Width Spreading */}
            <div className="h-14 border-b border-gray-800 bg-[#1e1e1e] flex items-center justify-between px-6 select-none shrink-0">
                {/* Left: Navigation & Context */}
                <div className="flex items-center space-x-6 flex-1">
                    <button
                        onClick={() => navigate('/problems')}
                        className="text-gray-400 hover:text-white flex items-center gap-1.5 text-sm font-medium bg-gray-800/30 hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-all border border-gray-700/50"
                    >
                        <ChevronLeft className="h-4 w-4" /> <span>Back</span>
                    </button>

                    <div className="flex items-center bg-gray-900/50 rounded-lg p-1 border border-gray-800 shrink-0">
                        <button
                            onClick={() => (contestId ? prevProblem?.slug : problem.prevSlug) && handleNavigateProblem(contestId ? prevProblem?.slug : problem.prevSlug)}
                            disabled={!(contestId ? prevProblem : problem.prevSlug)}
                            className="p-1.5 rounded-md hover:bg-gray-700 text-gray-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-[11px] text-gray-400 font-mono px-3 font-bold">
                            {contestId ? `${currentProblemIndex + 1} / ${contestProblems.length}` : `${problem.problemNumber} / ${problem.totalProblems || problem.problemNumber}`}
                        </span>
                        <button
                            onClick={() => (contestId ? nextProblem?.slug : problem.nextSlug) && handleNavigateProblem(contestId ? nextProblem?.slug : problem.nextSlug)}
                            disabled={!(contestId ? nextProblem : problem.nextSlug)}
                            className="p-1.5 rounded-md hover:bg-gray-700 text-gray-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Center: Problem Info & Status */}
                <div className="flex items-center space-x-6 justify-center flex-[2]">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center space-x-3">
                            <h1 className="text-base font-bold text-white tracking-tight">{problem.title}</h1>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                Practice Mode
                            </span>
                        </div>
                        <div className="flex items-center space-x-3 mt-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${problem.difficulty === 'Easy' ? 'border-green-500/50 text-green-400 bg-green-500/5' :
                                problem.difficulty === 'Medium' ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/5' :
                                    'border-red-500/50 text-red-400 bg-red-500/5'
                                }`}>
                                {problem.difficulty}
                            </span>
                            <div className="w-1 h-1 rounded-full bg-gray-700" />
                            <div className="flex items-center text-[10px] text-gray-500 font-medium">
                                <Check size={10} className="mr-1 text-green-500" /> Solved by 1.2k users
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Actions & Settings */}
                <div className="flex items-center space-x-4 flex-1 justify-end">
                    <div className="flex items-center space-x-3 mr-4 border-r border-gray-800 pr-4">
                        {isSaving ? (
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                                <span className="text-[11px] text-gray-400 font-medium">Saving...</span>
                            </div>
                        ) : lastSavedCode && (
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                <span className="text-[11px] text-green-500/80 font-medium">Cloud Saved</span>
                            </div>
                        )}
                        <button
                            onClick={handleReset}
                            className="text-gray-500 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                            title="Reset Code"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <select
                            className="bg-[#2d2d2d] text-gray-300 rounded-lg px-3 py-1.5 text-xs font-bold border border-gray-700 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer hover:bg-gray-800 transition-colors"
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                        >
                            <option value="python">Python</option>
                            <option value="cpp">C++</option>
                            <option value="c">C</option>
                        </select>

                        <button
                            onClick={handleRun}
                            disabled={loading}
                            className={`px-4 py-1.5 rounded-lg flex items-center space-x-2 text-xs font-bold transition-all border ${loading ? 'bg-gray-600 text-gray-400 border-gray-700 cursor-not-allowed' : 'bg-gray-800/50 hover:bg-gray-800 text-gray-200 border-gray-700 active:scale-95'}`}
                        >
                            <Play className="h-3.5 w-3.5" /> <span>Run</span>
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={loading || isContestEnded}
                            className={`px-5 py-1.5 rounded-lg flex items-center space-x-2 text-xs font-bold transition-all shadow-lg ${loading || isContestEnded ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/20 active:scale-95'}`}
                        >
                            {loading ? <span>Processing...</span> : <span>Submit</span>}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Description Panel (Left) */}
                <div
                    className={`flex flex-col border-r border-gray-800 transition-all duration-300 relative ${!showLeftPanel ? 'w-12 overflow-hidden' : 'flex-1'}`}
                    style={{ width: !showLeftPanel ? '48px' : (fullScreenMode === 'description' ? 'calc(100% - 48px)' : `${leftPanelWidth}%`) }}
                >
                    <div
                        className={`flex items-center justify-between px-4 pt-2 border-b border-gray-800 bg-[#1e1e1e]/50 cursor-pointer h-[48px] flex-shrink-0 ${!showLeftPanel ? 'flex-col py-4 px-0 justify-start space-y-4 border-b-0' : ''}`}
                        onClick={() => setFullScreenMode(!showLeftPanel ? null : 'compiler')}
                    >
                        {showLeftPanel ? (
                            <>
                                <div className="flex items-center space-x-1">
                                    {['Description'].map((tab) => (
                                        <div
                                            key={tab}
                                            className="px-4 py-2 text-sm font-medium transition-colors relative flex items-center space-x-2 text-white border-b-2 border-white"
                                        >
                                            <span>{tab}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleFullScreen('description'); }}
                                        className="text-gray-400 hover:text-white p-1"
                                        title={fullScreenMode === 'description' ? "Exit Full Screen" : "Full Screen"}
                                    >
                                        <Maximize size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setFullScreenMode('compiler'); }}
                                        className="text-gray-400 hover:text-white p-1"
                                        title="Fold Description"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center space-y-6">
                                <FileText size={18} className="text-blue-400" />
                                <div className="flex flex-col items-center gap-4 mt-auto">
                                    <Maximize size={16} className="text-gray-500 hover:text-white cursor-pointer" onClick={(e) => { e.stopPropagation(); setFullScreenMode('description'); }} />
                                    <ChevronRight size={20} className="text-gray-500 hover:text-white cursor-pointer" onClick={(e) => { e.stopPropagation(); setFullScreenMode(null); }} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={`flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-700 ${!showLeftPanel ? 'hidden' : ''}`}>
                        {activeTab === 'description' && (
                            <>
                                <div className="mb-6">
                                    <div className="prose prose-invert max-w-none text-gray-300">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeRaw]}
                                            components={{
                                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-600 pl-4 py-1 my-4 bg-gray-800/50 rounded-r" {...props} />,
                                                pre: ({ node, ...props }) => <pre className="bg-gray-800/60 border border-gray-700 p-4 rounded-lg overflow-x-auto my-4" {...props} />,
                                                code: ({ node, inline, className, children, ...props }) => {
                                                    return !inline ? (
                                                        <code className="text-gray-200" {...props}>{children}</code>
                                                    ) : (
                                                        <code className="bg-white/10 px-1 py-0.5 rounded text-sm text-blue-300 font-mono" {...props}>{children}</code>
                                                    )
                                                }
                                            }}
                                        >
                                            {problem.description
                                                .replace(/\*Source:.*?\*/g, '')
                                                .replace(/Input:/g, '\n\nInput:')
                                                .replace(/Output:/g, '\n\nOutput:')
                                                .replace(/Explanation:/g, '\n\nExplanation:')}
                                        </ReactMarkdown>
                                    </div>
                                </div>

                                {problem.hints && problem.hints.length > 0 && (
                                    <div className="mt-8 space-y-2">
                                        {problem.hints.map((hint, index) => (
                                            <HintAccordion key={index} hint={hint} index={index} />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {problem.constraints && problem.constraints.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                                    Constraints
                                </h3>
                                <ul className="space-y-2 bg-gray-800/30 p-4 rounded-lg border border-gray-700/50">
                                    {problem.constraints.map((constraint, index) => (
                                        <li key={index} className="text-gray-300 font-mono text-sm flex items-start">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-500 mt-1.5 mr-3 flex-shrink-0"></span>
                                            {constraint}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Resizer Handle */}
                {/* Resizer Handle */}
                {!fullScreenMode && (
                    <div
                        className="w-1 hover:bg-blue-500 cursor-col-resize z-10 flex items-center justify-center group bg-[#0f0f15]"
                        onMouseDown={handleDragStart}
                    >
                        <GripVertical className="h-4 w-4 text-gray-600 group-hover:text-white" />
                    </div>
                )}

                {/* Editor & Test Panel (Right) */}
                <div
                    className={`flex flex-col bg-[#1e1e1e] transition-all duration-300 ${!showRightPanel ? 'w-12 max-w-[48px] overflow-hidden' : 'flex-1'}`}
                    style={{ width: fullScreenMode === 'compiler' ? 'calc(100% - 48px)' : (fullScreenMode === 'description' ? '48px' : `${100 - leftPanelWidth}%`) }}
                >
                    {!showRightPanel ? (
                        <div
                            className="flex flex-col items-center h-full py-4 space-y-6 bg-[#1e1e1e] border-l border-gray-800 cursor-pointer"
                            onClick={() => setFullScreenMode(null)}
                        >
                            <FlaskConical size={18} className="text-purple-400" />
                            <div className="mt-auto flex flex-col items-center gap-4">
                                <Maximize size={16} className="text-gray-500 hover:text-white" onClick={(e) => { e.stopPropagation(); setFullScreenMode('compiler'); }} />
                                <ChevronLeft size={20} className="text-gray-500 hover:text-white" onClick={(e) => { e.stopPropagation(); setFullScreenMode(null); }} />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="p-4 border-b border-gray-700 font-medium text-gray-300 flex justify-between items-center bg-[#252526] h-[48px] flex-shrink-0">
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                        Code Editor
                                    </span>
                                    <span className="text-xs text-blue-400 font-mono border border-blue-500/30 px-2 py-0.5 rounded bg-blue-500/10 uppercase">{language}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => toggleFullScreen('compiler')}
                                        className="text-gray-400 hover:text-white p-1"
                                        title={fullScreenMode === 'compiler' ? "Exit Full Screen" : "Full Screen"}
                                    >
                                        <Maximize size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setFullScreenMode('description'); }}
                                        className="text-gray-400 hover:text-white p-1"
                                        title="Fold Code Editor"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>

                            <div
                                className={`relative border-b border-gray-800 transition-none overflow-hidden`}
                                style={{ height: isConsoleOpen ? `${editorHeight}%` : 'calc(100% - 40px)' }}
                            >
                                <Editor
                                    height="100%"
                                    language={language}
                                    theme="vs-dark"
                                    value={code}
                                    onChange={setCode}
                                    onMount={(editor, monaco) => {
                                        // Disable Copy/Paste within editor
                                        const container = editor.getContainerDomNode();
                                        container.addEventListener('copy', (e) => e.preventDefault(), true);
                                        container.addEventListener('paste', (e) => e.preventDefault(), true);
                                        container.addEventListener('cut', (e) => e.preventDefault(), true);
                                        container.addEventListener('contextmenu', (e) => e.preventDefault(), true);
                                    }}
                                    options={{
                                        contextmenu: false,
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        scrollBeyondLastLine: false,
                                        padding: { top: 16 },
                                        fontFamily: "'Fira Code', 'Monaco', monospace",
                                        renderValidationDecorations: "off"
                                    }}
                                />
                            </div>

                            {/* Vertical Resizer Handle */}
                            {isConsoleOpen && (
                                <div
                                    className="h-1 bg-[#1e1e1e] hover:bg-blue-500 cursor-row-resize z-10 flex items-center justify-center group flex-shrink-0"
                                    onMouseDown={handleVerticalDragStart}
                                >
                                    <GripHorizontal className="w-4 h-4 text-gray-600 group-hover:text-white" />
                                </div>
                            )}

                            <div
                                className={`flex flex-col bg-[#1e1e1e] transition-none`}
                                style={{ height: isConsoleOpen ? `${100 - editorHeight}%` : '40px' }}
                            >
                                <div
                                    className="flex items-center justify-between bg-[#252526] border-b border-gray-700 cursor-pointer h-[40px] flex-shrink-0 overflow-hidden"
                                    onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                                >
                                    <div className="flex items-center h-full">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setIsConsoleOpen(true); setActiveBottomTab('testcase'); }}
                                            className={`h-full px-4 text-xs font-bold flex items-center space-x-2 transition-all ${activeBottomTab === 'testcase' && isConsoleOpen ? 'text-white border-t-2 border-blue-500 bg-[#1e1e1e]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                        >
                                            <Check size={14} className="text-green-500" />
                                            <span>Testcase</span>
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setIsConsoleOpen(true); setActiveBottomTab('result'); }}
                                            className={`h-full px-4 text-xs font-bold flex items-center space-x-2 transition-all ${activeBottomTab === 'result' && isConsoleOpen ? 'text-white border-t-2 border-blue-500 bg-[#1e1e1e]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                        >
                                            <Play size={14} className="text-blue-500" />
                                            <span>Test Result</span>
                                        </button>
                                    </div>
                                    <div className="pr-4 flex items-center space-x-4">
                                        <div className="flex items-center space-x-2 border-l border-gray-700 pl-4">
                                            <Maximize size={14} className="text-gray-500 hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); setEditorHeight(30); setIsConsoleOpen(true); }} />
                                            <ChevronUp className={`h-4 w-4 text-gray-400 transition-transform ${isConsoleOpen ? 'rotate-180' : ''}`} />
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setIsConsoleOpen(false); }}
                                            className="text-gray-400 hover:text-white p-1 transition-colors"
                                            title="Close Console"
                                        >
                                            <ChevronDown size={18} />
                                        </button>
                                    </div>
                                </div>

                                {isConsoleOpen && (
                                    <div className="flex-1 p-4 overflow-y-auto bg-[#1e1e1e]">
                                        {activeBottomTab === 'testcase' && (
                                            <div className="flex flex-col h-full">
                                                <div className="flex items-center space-x-2 mb-4 overflow-x-auto pb-2">
                                                    {userTestCases.map((tc, index) => (
                                                        <button
                                                            key={tc.id}
                                                            onClick={() => setActiveTestCaseId(index)}
                                                            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap flex items-center space-x-2 transition-colors ${activeTestCaseId === index
                                                                ? 'bg-gray-700 text-white'
                                                                : 'bg-transparent text-gray-500 hover:bg-gray-800'
                                                                }`}
                                                        >
                                                            <span>Case {index + 1}</span>
                                                            {userTestCases.length > 1 && (
                                                                <span
                                                                    onClick={(e) => { e.stopPropagation(); handleRemoveTestCase(tc.id); }}
                                                                    className="hover:text-red-400"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </span>
                                                            )}
                                                        </button>
                                                    ))}
                                                    <button
                                                        onClick={handleAddTestCase}
                                                        className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 flex items-center space-x-1"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>

                                                <div className="flex-1">
                                                    <label className="text-xs text-gray-500 font-mono mb-2 block">Input:</label>
                                                    <div className="relative h-full">
                                                        <textarea
                                                            value={userTestCases[activeTestCaseId]?.input || ''}
                                                            onChange={(e) => handleTestCaseChange(e.target.value)}
                                                            className="w-full h-32 bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-sm font-mono text-gray-300 focus:outline-none focus:border-blue-500 resize-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeBottomTab === 'result' && (
                                            <div className="h-full">
                                                {!testResults && !loading && (
                                                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                                        <p>Run your code to see results.</p>
                                                    </div>
                                                )}

                                                {loading && (
                                                    <div className="h-full flex items-center justify-center text-gray-400 animate-pulse">
                                                        Running Code...
                                                    </div>
                                                )}

                                                {testResults && (
                                                    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                        <div className={`mb-4 text-xl font-bold tracking-tight ${overallStatus === 'Accepted' ? 'text-green-500' :
                                                            (overallStatus === 'Wrong Answer' || overallStatus === 'Compile Error') ? 'text-red-500' :
                                                                (overallStatus === 'Time Limit Exceeded' || overallStatus === 'TLE') ? 'text-orange-500' :
                                                                    overallStatus === 'Runtime Error' ? 'text-orange-500' : 'text-yellow-500'
                                                            }`}>
                                                            {overallStatus}
                                                        </div>

                                                        {/* Case Tabs - Only show if not a system error */}
                                                        {overallStatus !== 'Compile Error' && overallStatus !== 'Runtime Error' && (
                                                            <div className="flex items-center space-x-2 mb-6 border-b border-gray-800 pb-2">
                                                                {testResults.map((res, index) => (
                                                                    <button
                                                                        key={index}
                                                                        onClick={() => setActiveTestCaseId(index)}
                                                                        className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-2 transition-all ${activeTestCaseId === index
                                                                            ? 'bg-gray-700 text-white'
                                                                            : 'bg-transparent text-gray-500 hover:bg-gray-800'
                                                                            }`}
                                                                    >
                                                                        <div className={`w-1.5 h-1.5 rounded-full ${res.status === 'Passed' || res.status === 'Accepted' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                                        <span>Case {index + 1}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <div className="flex-1 space-y-6 font-mono pb-4">
                                                            <div>
                                                                <span className="text-gray-500 block mb-2 text-xs font-bold uppercase tracking-wider">Input</span>
                                                                <div className="bg-[#2d2d2d] p-4 rounded-xl border border-gray-700/50 text-gray-200 text-sm whitespace-pre-wrap leading-relaxed shadow-inner">
                                                                    {testResults[activeTestCaseId]?.input}
                                                                </div>
                                                            </div>

                                                            {/* Output / Error Section */}
                                                            <div>
                                                                <span className={`block mb-2 text-xs font-bold uppercase tracking-wider ${testResults[activeTestCaseId]?.status === 'Passed' ? 'text-gray-500' : 'text-red-400'}`}>
                                                                    {overallStatus === 'Runtime Error' ? 'Error Message' : 'Output'}
                                                                </span>
                                                                <div className={`p-4 rounded-xl border text-sm whitespace-pre-wrap leading-relaxed ${overallStatus === 'Runtime Error'
                                                                    ? 'bg-red-500/5 border-red-500/20 text-red-200 font-medium'
                                                                    : 'bg-[#2d2d2d] border-gray-700/50 text-gray-200'
                                                                    }`}>
                                                                    {testResults[activeTestCaseId]?.output || 'No output'}
                                                                </div>
                                                            </div>

                                                            {overallStatus !== 'Runtime Error' && overallStatus !== 'Compile Error' && (
                                                                <div>
                                                                    <span className="text-gray-500 block mb-2 text-xs font-bold uppercase tracking-wider">Expected</span>
                                                                    <div className="bg-[#2d2d2d] p-4 rounded-xl border border-gray-700/50 text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">
                                                                        {testResults[activeTestCaseId]?.expected || 'No expected output'}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProblemDetail;
