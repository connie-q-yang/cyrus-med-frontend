import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import FutureHealthcare from './components/FutureHealthcare/FutureHealthcare';
import ChatPreview from './components/ChatPreview/ChatPreview';
import Waitlist from './components/Waitlist/Waitlist';
import BackgroundOrbs from './components/BackgroundEffects/BackgroundOrbs';
import './App.css';

function App() {
  return (
    <div className="App">
      <BackgroundOrbs />
      <Header />
      <Hero />
      <FutureHealthcare />
      <ChatPreview />
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