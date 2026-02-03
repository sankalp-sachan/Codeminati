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
import ContestProblem from './pages/ContestProblem';
import Support from './pages/Support';
import JudgeLeaderboard from './pages/JudgeLeaderboard';
import Submissions from './pages/Submissions';
import Analytics from './pages/Analytics';

import { useEffect, useState } from 'react';

// Layout Component Wrapper to handle conditional Footer
const AppLayout = () => {
  const location = useLocation();
  const showFooter = location.pathname === '/';

  return (
    <>
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      {showFooter && <Footer />}
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
  // Anti-Cheat & Security Logic REMOVED by user request


  return (
    <div className={`min-h-screen bg-[#0f0f15] text-white flex flex-col`}>


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
            <Route path="/contests/:id/solve/:slug" element={<ContestProblem />} />
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
