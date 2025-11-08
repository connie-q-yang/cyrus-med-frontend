import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import HowItWorks from './components/HowItWorks/HowItWorks';
import TrustSection from './components/TrustSection/TrustSection';
import ChatPreview from './components/ChatPreview/ChatPreview';
import Waitlist from './components/Waitlist/Waitlist';
import FAQ from './components/FAQ/FAQ';
import BackgroundOrbs from './components/BackgroundEffects/BackgroundOrbs';
import FloatingParticles from './components/VisualEffects/FloatingParticles';
import MouseSpotlight from './components/VisualEffects/MouseSpotlight';
import AboutUs from './components/AboutUs/AboutUs';
import ContactUs from './components/ContactUs/ContactUs';
import ComingSoon from './components/ComingSoon/ComingSoon';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import ConfirmEmail from './components/Auth/ConfirmEmail';
import AuthCallback from './components/Auth/AuthCallback';
import ResetPassword from './components/Auth/ResetPassword';
import Onboarding from './components/Onboarding/Onboarding';
import Dashboard from './components/Dashboard/Dashboard';
import Profile from './components/Profile/Profile';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import FullScreenChat from './components/FullScreenChat/FullScreenChat';
import './App.css';

function HomePage() {
  return (
    <>
      <FloatingParticles />
      <MouseSpotlight />
      <BackgroundOrbs />
      <Header />
      <Hero />
      <ChatPreview />
      <HowItWorks />
      <TrustSection />
      <Waitlist />
      <FAQ />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/xx" replace />} />
            <Route path="/xx" element={<HomePage />} />
            <Route path="/xy" element={<ComingSoon />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />

            {/* Authentication routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/auth/confirm-email" element={<ConfirmEmail />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />

            {/* Onboarding route - protected but doesn't require onboarding to be complete */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute requiresOnboarding={false}>
                  <Onboarding />
                </ProtectedRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <FullScreenChat />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
        <ToastContainer
          position="bottom-right"
          theme="dark"
          autoClose={3000}
        />
      </div>
    </AuthProvider>
  );
}

export default App;