import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navigation from './components/Navigation/Navigation';
import Hero from './components/Hero/Hero';
import ChatPreview from './components/ChatPreview/ChatPreview';
import SocialProof from './components/SocialProof/SocialProof';
import Waitlist from './components/Waitlist/Waitlist';
import BackgroundOrbs from './components/BackgroundEffects/BackgroundOrbs';
import './App.css';

function App() {
  return (
    <div className="App">
      <BackgroundOrbs />
      <Navigation />
      <Hero />
      <ChatPreview />
      <SocialProof />
      <Waitlist />
      <ToastContainer 
        position="bottom-right"
        theme="dark"
        autoClose={3000}
      />
    </div>
  );
}

export default App;