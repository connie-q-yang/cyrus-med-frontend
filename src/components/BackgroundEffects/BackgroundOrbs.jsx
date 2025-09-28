import React, { useEffect, useRef } from 'react';
import './BackgroundOrbs.css';

const BackgroundOrbs = () => {
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const orb3Ref = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      if (orb1Ref.current) {
        orb1Ref.current.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
      }
      if (orb2Ref.current) {
        orb2Ref.current.style.transform = `translate(${-x * 15}px, ${-y * 15}px)`;
      }
      if (orb3Ref.current) {
        orb3Ref.current.style.transform = `translate(${x * 10}px, ${-y * 10}px)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <div ref={orb1Ref} className="bg-orb orb1"></div>
      <div ref={orb2Ref} className="bg-orb orb2"></div>
      <div ref={orb3Ref} className="bg-orb orb3"></div>
    </>
  );
};

export default BackgroundOrbs;