import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { toast } from 'react-toastify';
import './Waitlist.css';

const Waitlist = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call - replace with actual backend integration
    setTimeout(() => {
      toast.success('🎉 Welcome to the future of healthcare! Check your email for next steps.');
      setEmail('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section className="waitlist" id="waitlist" ref={ref}>
      <motion.div 
        className="waitlist-card"
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <h3>Reserve Your Spot</h3>
        <p>
          Be among the first to experience the revolution in personal healthcare. 
          Limited spots available for our exclusive beta.
        </p>
        
        <form className="waitlist-form" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={isSubmitting}
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Joining...' : 'Join Waitlist'}
          </button>
        </form>
        
        <div className="exclusive-tag">
          🎯 Exclusive Beta Access
        </div>
      </motion.div>
    </section>
  );
};

export default Waitlist;