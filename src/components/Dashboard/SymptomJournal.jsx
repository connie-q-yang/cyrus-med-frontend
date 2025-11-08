import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import './SymptomJournal.css';

const SymptomJournal = ({ onOpenLogModal }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSymptom, setFilterSymptom] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // desc = newest first

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      // Load from local storage
      const localEntries = JSON.parse(localStorage.getItem('symptom_journal') || '[]');

      // Try to load from Supabase
      let supabaseEntries = [];
      if (user) {
        const { data, error } = await supabase
          .from('symptom_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('log_date', { ascending: false });

        if (!error && data) {
          supabaseEntries = data.map(entry => ({
            ...entry,
            source: 'supabase'
          }));
        }
      }

      // Merge and deduplicate (prefer Supabase entries)
      const localEntriesWithSource = localEntries.map(e => ({ ...e, source: 'local' }));
      const allEntries = [...supabaseEntries, ...localEntriesWithSource];

      // Remove duplicates based on date and symptoms
      const uniqueEntries = allEntries.filter((entry, index, self) =>
        index === self.findIndex((e) => (
          e.log_date === entry.log_date &&
          JSON.stringify(e.symptoms?.sort()) === JSON.stringify(entry.symptoms?.sort())
        ))
      );

      setEntries(uniqueEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const applyFilters = useCallback(() => {
    let filtered = [...entries];

    // Filter by symptom
    if (filterSymptom !== 'all') {
      filtered = filtered.filter(entry =>
        entry.symptoms?.includes(filterSymptom)
      );
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.log_date);
      const dateB = new Date(b.log_date);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    setFilteredEntries(filtered);
  }, [entries, filterSymptom, sortOrder]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const getUniqueSymptoms = () => {
    const symptoms = new Set();
    entries.forEach(entry => {
      entry.symptoms?.forEach(symptom => symptoms.add(symptom));
    });
    return Array.from(symptoms).sort();
  };

  const getMostCommonSymptoms = () => {
    const symptomCounts = {};
    entries.forEach(entry => {
      entry.symptoms?.forEach(symptom => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });
    });

    return Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const deleteEntry = async (entry) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      // Delete from Supabase if it's a Supabase entry
      if (entry.source === 'supabase' && entry.id) {
        await supabase
          .from('symptom_logs')
          .delete()
          .eq('id', entry.id);
      }

      // Delete from local storage
      const localEntries = JSON.parse(localStorage.getItem('symptom_journal') || '[]');
      const updatedLocal = localEntries.filter(e =>
        !(e.log_date === entry.log_date &&
          JSON.stringify(e.symptoms?.sort()) === JSON.stringify(entry.symptoms?.sort()))
      );
      localStorage.setItem('symptom_journal', JSON.stringify(updatedLocal));

      // Reload entries
      loadEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const mostCommonSymptoms = getMostCommonSymptoms();

  if (loading) {
    return (
      <div className="journal-loading">
        <div className="loading-spinner"></div>
        <p>Loading your journal...</p>
      </div>
    );
  }

  return (
    <div className="symptom-journal">
      {/* Header Stats */}
      <div className="journal-header">
        <div className="journal-title">
          <h2>Your Symptom Journal</h2>
          <p>{entries.length} {entries.length === 1 ? 'entry' : 'entries'} logged</p>
        </div>
        <button onClick={onOpenLogModal} className="journal-add-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Log Symptoms
        </button>
      </div>

      {entries.length > 0 && (
        <>
          {/* Summary Stats */}
          <div className="journal-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{entries.length}</div>
                <div className="stat-label">Total Entries</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{new Set(entries.map(e => e.log_date)).size}</div>
                <div className="stat-label">Days Tracked</div>
              </div>
            </div>
            {mostCommonSymptoms.length > 0 && (
              <div className="stat-card stat-card-wide">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-label">Most Common</div>
                  <div className="common-symptoms">
                    {mostCommonSymptoms.map(([symptom, count]) => (
                      <span key={symptom} className="common-symptom-chip">
                        {symptom} ({count})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="journal-filters">
            <div className="filter-group">
              <label>Filter by symptom:</label>
              <select
                value={filterSymptom}
                onChange={(e) => setFilterSymptom(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Symptoms</option>
                {getUniqueSymptoms().map(symptom => (
                  <option key={symptom} value={symptom}>{symptom}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Sort:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="filter-select"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </>
      )}

      {/* Entries Timeline */}
      <div className="journal-timeline">
        {filteredEntries.length === 0 ? (
          <div className="journal-empty">
            {entries.length === 0 ? (
              <>
                <div className="empty-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
                <h3>Start Your Journal</h3>
                <p>Track your menopause symptoms to identify patterns and share with your healthcare provider.</p>
                <button onClick={onOpenLogModal} className="empty-cta-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Log Your First Entry
                </button>
              </>
            ) : (
              <>
                <div className="empty-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </div>
                <h3>No entries found</h3>
                <p>Try adjusting your filters</p>
              </>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {filteredEntries.map((entry, index) => (
              <motion.div
                key={entry.id || `${entry.log_date}-${index}`}
                className="journal-entry"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="entry-date">
                  <div className="date-marker"></div>
                  <span>{formatDate(entry.log_date)}</span>
                  {entry.source === 'local' && (
                    <span className="source-badge" title="Saved locally">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                    </span>
                  )}
                </div>
                <div className="entry-card">
                  {entry.mood && (
                    <div className={`entry-mood mood-${entry.mood}`}>
                      {entry.mood === 'happy' && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                          <line x1="9" y1="9" x2="9.01" y2="9" />
                          <line x1="15" y1="9" x2="15.01" y2="9" />
                        </svg>
                      )}
                      {entry.mood === 'neutral' && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="8" y1="15" x2="16" y2="15" />
                          <line x1="9" y1="9" x2="9.01" y2="9" />
                          <line x1="15" y1="9" x2="15.01" y2="9" />
                        </svg>
                      )}
                      {entry.mood === 'sad' && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                          <line x1="9" y1="9" x2="9.01" y2="9" />
                          <line x1="15" y1="9" x2="15.01" y2="9" />
                        </svg>
                      )}
                      <span>
                        {entry.mood === 'happy' && 'Good Day'}
                        {entry.mood === 'neutral' && 'Neutral Day'}
                        {entry.mood === 'sad' && 'Difficult Day'}
                      </span>
                    </div>
                  )}
                  <div className="entry-symptoms">
                    {entry.symptoms?.map(symptom => (
                      <span key={symptom} className="symptom-tag">
                        {symptom}
                      </span>
                    ))}
                  </div>
                  {entry.notes && (
                    <div className="entry-notes">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                        <path d="M14 3v5h5M16 13H8M16 17H8M10 9H8" />
                      </svg>
                      <p>{entry.notes}</p>
                    </div>
                  )}
                  <div className="entry-actions">
                    <button
                      onClick={() => deleteEntry(entry)}
                      className="delete-btn"
                      title="Delete entry"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default SymptomJournal;
