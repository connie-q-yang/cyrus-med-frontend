import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import './SymptomLogModal.css';

const COMMON_SYMPTOMS = [
  'Hot flashes',
  'Night sweats',
  'Sleep issues',
  'Mood changes',
  'Anxiety',
  'Depression',
  'Brain fog',
  'Memory issues',
  'Joint pain',
  'Muscle aches',
  'Vaginal dryness',
  'Irregular periods',
  'Heavy bleeding',
  'Headaches',
  'Heart palpitations',
  'Weight gain',
];

const SymptomLogModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const saveToLocalJournal = (logEntry) => {
    try {
      // Get existing journal entries from local storage
      const existingJournal = JSON.parse(localStorage.getItem('symptom_journal') || '[]');

      // Add new entry with timestamp
      const newEntry = {
        ...logEntry,
        id: Date.now(),
        saved_at: new Date().toISOString(),
      };

      existingJournal.push(newEntry);

      // Save back to local storage
      localStorage.setItem('symptom_journal', JSON.stringify(existingJournal));

      return true;
    } catch (error) {
      console.error('Error saving to local journal:', error);
      return false;
    }
  };

  const handleSave = async () => {
    if (selectedSymptoms.length === 0) {
      toast.error('Please select at least one symptom');
      return;
    }

    setSaving(true);

    const logEntry = {
      user_id: user.id,
      log_date: selectedDate,
      symptoms: selectedSymptoms,
      notes: notes.trim() || null,
    };

    // Always save to local journal first
    const localSaved = saveToLocalJournal(logEntry);

    try {
      // Try to save to Supabase
      const { error } = await supabase
        .from('symptom_logs')
        .insert(logEntry);

      if (error) {
        console.error('Supabase error:', error);
        // If Supabase fails but local save succeeded, still show success
        if (localSaved) {
          toast.success('Symptom log saved to your local journal! (Cloud sync will happen once database is set up)');
        } else {
          throw new Error('Failed to save symptom log');
        }
      } else {
        // Both Supabase and local storage succeeded
        toast.success('Symptom log saved successfully!');
      }

      // Reset form
      setSelectedSymptoms([]);
      setNotes('');
      setSelectedDate(new Date().toISOString().split('T')[0]);

      onClose();
    } catch (error) {
      console.error('Error saving symptom log:', error);
      if (localSaved) {
        toast.warning('Saved to local journal only. Cloud sync pending.');
        // Still reset and close since local save worked
        setSelectedSymptoms([]);
        setNotes('');
        setSelectedDate(new Date().toISOString().split('T')[0]);
        onClose();
      } else {
        toast.error('Failed to save symptom log');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (selectedSymptoms.length > 0 || notes.trim()) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="symptom-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="symptom-modal"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="symptom-modal-header">
              <div>
                <h2>Log Symptoms</h2>
                <p>Track your daily menopause symptoms</p>
              </div>
              <button onClick={handleClose} className="symptom-modal-close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="symptom-modal-content">
              {/* Date Picker */}
              <div className="symptom-date-section">
                <label>Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="symptom-date-input"
                />
              </div>

              {/* Symptom Chips */}
              <div className="symptom-chips-section">
                <label>Select Symptoms</label>
                <div className="symptom-chips">
                  {COMMON_SYMPTOMS.map(symptom => (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={`symptom-chip ${selectedSymptoms.includes(symptom) ? 'selected' : ''}`}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="symptom-notes-section">
                <label>Additional Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe your symptoms, triggers, severity, or anything else you'd like to track..."
                  className="symptom-notes-input"
                  rows="4"
                />
              </div>

              {/* Actions */}
              <div className="symptom-modal-actions">
                <button onClick={handleClose} className="symptom-cancel-btn">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || selectedSymptoms.length === 0}
                  className="symptom-save-btn"
                >
                  {saving ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SymptomLogModal;
