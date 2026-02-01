import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import client from './api/client';
import { AuthProvider, useAuth } from './context/AuthContext';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import InfoPage from './pages/InfoPage';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import Problems from './pages/Problems';
import ProblemDetail from './pages/ProblemDetail';

import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Compiler from './pages/Compiler';
import Contests from './pages/Contests';
import ContestDetail from './pages/ContestDetail';
import Support from './pages/Support';
import JudgeLeaderboard from './pages/JudgeLeaderboard';
import Submissions from './pages/Submissions';
import Analytics from './pages/Analytics';

import { useEffect, useState } from 'react';

// Layout Component Wrapper to handle conditional Footer
const AppLayout = () => {
  const location = useLocation();
  const isSensitivePath = () =>
    location.pathname.startsWith('/problems/') ||
    location.pathname === '/compiler' ||
    location.pathname.includes('/contests/');

  const hideFooter = isSensitivePath();

  return (
    <>
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </>
  );
};

function App() {
  return (
    <Router>
      <GlobalErrorBoundary>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </GlobalErrorBoundary>
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const { user } = useAuth();
  const [isBlocked, setIsBlocked] = useState(false);

  // Anti-Cheat & Security Logic
  // Applied only to regular users when they are solving a problem in a contest
  const isSensitivePath = () => {
    return user?.role === 'user' &&
      (location.pathname.startsWith('/problems/') || location.pathname === '/compiler') &&
      location.state?.contestId;
  };

  const isSensitivePage = isSensitivePath();

  useEffect(() => {
    // 1. CSS Selection Control
    if (isSensitivePage) {
      document.body.classList.add('no-select');
    } else {
      document.body.classList.remove('no-select');
    }

    if (!isSensitivePage) return;

    // 2. Anti-Cheat Handlers
    const block = (e, msg) => {
      e.preventDefault();
      e.stopPropagation();
      if (msg) toast.error(msg, { id: 'anti-cheat-toast' });
      return false;
    };

    const handleCopyCut = (e) => block(e, 'Copy/Cut is strictly disabled! 🚫');
    const handlePaste = (e) => block(e, 'Pasting is strictly disabled! 🚫');
    const handleContext = (e) => block(e, 'Right-click is disabled! 🚫');
    const handleDrop = (e) => block(e, 'Drag & Drop is disabled! 🚫');

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      if (key === 'printscreen' || key === 'prtsc' || key === 'snapshot' || key === 'f6') {
        return block(e, 'Screenshots and capture shortcuts are disabled! 🚫');
      }

      if (ctrl && ['c', 'v', 'x', 'a', 'p', 's', 'u'].includes(key)) {
        return block(e, 'Keyboard shortcuts are disabled! 🚫');
      }

      if ((ctrl || e.metaKey) && shift && ['3', '4', '5'].includes(key)) {
        return block(e, 'Screenshots are disabled! 🚫');
      }

      if ((e.metaKey && shift && (key === 's' || key === 'r')) || (e.metaKey && key === 'printscreen') || (e.altKey && key === 'printscreen')) {
        return block(e, 'Screenshots and recording are disabled! 🚫');
      }

      if (key === 'f1') return block(e);

      if (key === 'f12' || (ctrl && shift && ['i', 'j', 'c'].includes(key))) {
        return block(e, 'Developer tools are disabled! 🚫');
      }

      if ((shift && key === 'insert') || (ctrl && key === 'insert')) {
        return block(e, 'Alternative shortcuts are disabled! 🚫');
      }
    };

    const handleBeforeInput = (e) => {
      if (e.inputType === 'insertFromPaste' || e.inputType === 'insertFromDrop') {
        return block(e, 'Pasting is disabled! 🚫');
      }
    };

    const secureWriteText = navigator.clipboard && navigator.clipboard.writeText
      ? navigator.clipboard.writeText.bind(navigator.clipboard)
      : null;

    const handleFocusActivity = () => {
      if (!isSensitivePage) return;
      try {
        window.getSelection().removeAllRanges();
        if (secureWriteText) {
          secureWriteText('Security Lockdown Active 🚫').catch(() => { });
        }
      } catch (e) { }
    };

    const reportActivity = async (action, details) => {
      try {
        await client.post('/contests/report', {
          action,
          details: `${details} on ${location.pathname}`
        });
      } catch (e) { }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        setIsBlocked(true);
        toast.error('Tab switching detected! ⚠️', { id: 'anti-cheat-tab', duration: 3000 });
        reportActivity('tab_switch', 'User switched tab or minimized browser');
      } else {
        setIsBlocked(false);
      }
    };

    const handleBlur = () => {
      if (isSensitivePage) {
        setIsBlocked(true);
        toast.error('Security Lockdown: Content Hidden! 🚫', { id: 'anti-cheat-focus', duration: 3000 });
        reportActivity('window_blur', 'User lost focus of the window (clicked outside or alt-tab)');
        if (secureWriteText) {
          secureWriteText('Security Lockdown Active 🚫').catch(() => { });
        }
      }
    };

    const handleFocus = () => {
      setIsBlocked(false);
    };

    const handleSelection = () => {
      if (window.getSelection().toString().length > 0) {
        window.getSelection().removeAllRanges();
      }
    };

    const originalClipboard = { ...navigator.clipboard };
    try {
      Object.assign(navigator.clipboard, {
        read: () => Promise.reject('Access Denied 🚫'),
        readText: () => Promise.reject('Access Denied 🚫'),
        write: () => Promise.reject('Access Denied 🚫'),
        writeText: () => Promise.rejecct('Access Denied 🚫')
      });
    } catch (e) { }

    window.addEventListener('copy', handleCopyCut, true);
    window.addEventListener('cut', handleCopyCut, true);
    window.addEventListener('paste', handlePaste, true);
    window.addEventListener('contextmenu', handleContext, true);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('drop', handleDrop, true);
    window.addEventListener('dragstart', handleDrop, true);
    window.addEventListener('beforeinput', handleBeforeInput, true);
    window.addEventListener('mousedown', handleFocusActivity, true);
    window.addEventListener('visibilitychange', handleVisibility, true);
    window.addEventListener('blur', handleBlur, true);
    window.addEventListener('focus', handleFocus, true);
    document.addEventListener('selectionchange', handleSelection, true);

    const wipeInterval = setInterval(handleFocusActivity, 2000);

    return () => {
      window.removeEventListener('copy', handleCopyCut, true);
      window.removeEventListener('cut', handleCopyCut, true);
      window.removeEventListener('paste', handlePaste, true);
      window.removeEventListener('contextmenu', handleContext, true);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('drop', handleDrop, true);
      window.removeEventListener('dragstart', handleDrop, true);
      window.removeEventListener('beforeinput', handleBeforeInput, true);
      window.removeEventListener('mousedown', handleFocusActivity, true);
      window.removeEventListener('visibilitychange', handleVisibility, true);
      window.removeEventListener('blur', handleBlur, true);
      window.removeEventListener('focus', handleFocus, true);
      document.removeEventListener('selectionchange', handleSelection, true);
      clearInterval(wipeInterval);
      setIsBlocked(false);
      try {
        Object.assign(navigator.clipboard, originalClipboard);
      } catch (e) { }
    };
  }, [location.pathname, isSensitivePage]);

  return (
    <div className={`min-h-screen bg-[#0f0f15] text-white flex flex-col ${isBlocked && isSensitivePage ? 'filter blur-3xl overflow-hidden' : ''}`}>
      {isBlocked && isSensitivePage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-3xl overflow-hidden"
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="text-center p-12 glass rounded-3xl border border-white/10 shadow-2xl max-w-lg mx-4 lockdown-animate">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-11a4 4 0 11-8 0 4 4 0 018 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2v2a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2h6z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Security Lockdown active</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Window focus lost or screenshot attempt detected. <br />
              The content has been hidden to prevent unauthorized capture.
            </p>
            <div className="mt-8 text-sm text-red-500 font-medium animate-pulse">
              Please click back inside this window to continue.
            </div>
          </div>
        </div>
      )}

      <Routes>
        {/* Helper Layout to render Navbar/Footer */}
        <Route element={<AppLayout />}>

          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/compiler" element={<Compiler />} />
          <Route path="/contests" element={<Contests />} />
          <Route path="/judge/leaderboard" element={<JudgeLeaderboard />} />
          <Route path="/support" element={<Support />} />

          {/* Footer Info Pages */}
          <Route path="/blog" element={<InfoPage title="Blog & Updates" type="blog" />} />
          <Route path="/docs" element={<InfoPage title="Documentation" type="docs" />} />
          <Route path="/community" element={<InfoPage title="Community" type="community" />} />
          <Route path="/faq" element={<InfoPage title="Frequently Asked Questions" type="faq" />} />
          <Route path="/privacy" element={<InfoPage title="Privacy Policy" type="privacy" />} />
          <Route path="/terms" element={<InfoPage title="Terms of Service" type="terms" />} />
          <Route path="/cookie-policy" element={<InfoPage title="Cookie Policy" type="cookie" />} />

          {/* Protected Routes (Logged In Users) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/problems/:slug" element={<ProblemDetail />} />
            <Route path="/contests/:id" element={<ContestDetail />} />
            <Route path="/submissions" element={<Submissions />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'assistant']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/analytics" element={<Analytics />} />
          </Route>

          {/* Judge Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'judge']} />}>
            <Route path="/judge/analytics" element={<Analytics />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
              <h1 className="text-4xl font-bold text-gray-500 mb-4">404</h1>
              <p className="text-xl text-gray-400">Page not found</p>
              <a href="/" className="mt-4 text-blue-500 hover:text-blue-400">Go Home</a>
            </div>
          } />

        </Route>
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          className: 'glass text-white',
          style: {
            background: '#1F2937',
            color: '#fff',
            border: '1px solid #374151'
          },
        }}
      />
    </div>
  );
}

export default App;
