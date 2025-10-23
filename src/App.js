import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import HowItWorks from './components/HowItWorks/HowItWorks';
import TrustSection from './components/TrustSection/TrustSection';
import ChatPreview from './components/ChatPreview/ChatPreview';
import Waitlist from './components/Waitlist/Waitlist';
import FAQ from './components/FAQ/FAQ';
import BackgroundOrbs from './components/BackgroundEffects/BackgroundOrbs';
import AboutUs from './components/AboutUs/AboutUs';
import ComingSoon from './components/ComingSoon/ComingSoon';
import './App.css';

function HomePage() {
  return (
    <>
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
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/xx" replace />} />
          <Route path="/xx" element={<HomePage />} />
          <Route path="/xy" element={<ComingSoon />} />
          <Route path="/about" element={<AboutUs />} />
        </Routes>
      </Router>
      <ToastContainer
        position="bottom-right"
        theme="dark"
        autoClose={3000}
      />
    </div>
  );
}

export default App;