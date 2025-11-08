import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    age: '',
    symptomsStartDate: '',
    menopauseStage: '',
    symptoms: [],
    symptomSeverity: '',
    onHRT: '',
    hrtType: [],
    otherHRT: '',
    otherTreatments: [],
    otherSupplements: '',
    mainGoal: '',
  });

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Error loading profile');
        return;
      }

      if (data) {
        setFormData({
          age: data.age || '',
          symptomsStartDate: data.symptoms_start_date || '',
          menopauseStage: data.menopause_stage || '',
          symptoms: data.primary_symptoms || [],
          symptomSeverity: data.symptom_severity || '',
          onHRT: data.on_hrt ? 'yes' : 'no',
          hrtType: data.hrt_type || [],
          otherHRT: data.other_hrt || '',
          otherTreatments: data.other_treatments || [],
          otherSupplements: data.other_supplements || '',
          mainGoal: data.main_goal || '',
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    setSaving(true);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          age: parseInt(formData.age) || null,
          symptoms_start_date: formData.symptomsStartDate || null,
          menopause_stage: formData.menopauseStage || null,
          primary_symptoms: formData.symptoms || [],
          symptom_severity: formData.symptomSeverity || null,
          on_hrt: formData.onHRT === 'yes',
          hrt_type: formData.hrtType || [],
          other_hrt: formData.otherHRT || null,
          other_treatments: formData.otherTreatments || [],
          other_supplements: formData.otherSupplements || null,
          main_goal: formData.mainGoal || null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const formatMenopauseStage = (stage) => {
    const stages = {
      'not-sure': "Not sure",
      'perimenopause': 'Perimenopause',
      'menopause': 'Menopause',
      'postmenopause': 'Postmenopause',
    };
    return stages[stage] || stage;
  };

  const formatSymptomsStartDate = (date) => {
    const dates = {
      'less-than-6-months': 'Less than 6 months ago',
      '6-12-months': '6-12 months ago',
      '1-2-years': '1-2 years ago',
      '2-5-years': '2-5 years ago',
      '5-plus-years': 'More than 5 years ago',
    };
    return dates[date] || date;
  };

  const formatSeverity = (severity) => {
    const severities = {
      'mild': 'Mild',
      'moderate': 'Moderate',
      'severe': 'Severe',
    };
    return severities[severity] || severity;
  };

  const formatGoal = (goal) => {
    const goals = {
      'understand': "Understand what's happening to my body",
      'find-treatment': 'Find the right treatment',
      'track-treatment': 'Track if my current treatment is working',
      'connect-specialist': 'Connect with a specialist',
      'all': 'All of the above',
    };
    return goals[goal] || goal;
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-brand">
          <h1>OpenMedicine</h1>
          <p>Your Profile</p>
        </div>
        <div className="profile-actions">
          <button className="nav-button" onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
          <button className="sign-out-button" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="card-header">
            <div>
              <h2>Personal Information</h2>
              <p className="user-email">{user?.email}</p>
            </div>
            {!isEditing ? (
              <button className="edit-button" onClick={() => setIsEditing(true)}>
                ✏️ Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button className="cancel-button" onClick={() => {
                  setIsEditing(false);
                  fetchProfile();
                }}>
                  Cancel
                </button>
                <button
                  className="save-button"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          <div className="profile-sections">
            {/* Basic Information */}
            <div className="profile-section">
              <h3>Basic Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Age</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="profile-input"
                      min="18"
                      max="100"
                    />
                  ) : (
                    <p>{formData.age || 'Not provided'}</p>
                  )}
                </div>
                <div className="info-item">
                  <label>Symptoms Started</label>
                  {isEditing ? (
                    <select
                      value={formData.symptomsStartDate}
                      onChange={(e) => setFormData({ ...formData, symptomsStartDate: e.target.value })}
                      className="profile-select"
                    >
                      <option value="">Select timeline</option>
                      <option value="less-than-6-months">Less than 6 months ago</option>
                      <option value="6-12-months">6-12 months ago</option>
                      <option value="1-2-years">1-2 years ago</option>
                      <option value="2-5-years">2-5 years ago</option>
                      <option value="5-plus-years">More than 5 years ago</option>
                    </select>
                  ) : (
                    <p>{formatSymptomsStartDate(formData.symptomsStartDate) || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Menopause Stage */}
            <div className="profile-section">
              <h3>Menopause Stage</h3>
              <div className="info-item">
                <label>Current Stage</label>
                {isEditing ? (
                  <select
                    value={formData.menopauseStage}
                    onChange={(e) => setFormData({ ...formData, menopauseStage: e.target.value })}
                    className="profile-select"
                  >
                    <option value="">Select stage</option>
                    <option value="not-sure">I'm not sure</option>
                    <option value="perimenopause">Perimenopause</option>
                    <option value="menopause">Menopause</option>
                    <option value="postmenopause">Postmenopause</option>
                  </select>
                ) : (
                  <p>{formatMenopauseStage(formData.menopauseStage) || 'Not provided'}</p>
                )}
              </div>
            </div>

            {/* Symptoms */}
            <div className="profile-section">
              <h3>Symptoms</h3>
              <div className="info-item">
                <label>Primary Symptoms</label>
                {isEditing ? (
                  <p className="edit-note">To edit symptoms, please contact support</p>
                ) : (
                  <div className="symptoms-list">
                    {formData.symptoms.length > 0 ? (
                      formData.symptoms.map((symptom, index) => (
                        <span key={index} className="symptom-tag">{symptom}</span>
                      ))
                    ) : (
                      <p>No symptoms recorded</p>
                    )}
                  </div>
                )}
              </div>
              <div className="info-item">
                <label>Severity Level</label>
                {isEditing ? (
                  <select
                    value={formData.symptomSeverity}
                    onChange={(e) => setFormData({ ...formData, symptomSeverity: e.target.value })}
                    className="profile-select"
                  >
                    <option value="">Select severity</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                ) : (
                  <p>{formatSeverity(formData.symptomSeverity) || 'Not provided'}</p>
                )}
              </div>
            </div>

            {/* Treatment Information */}
            <div className="profile-section">
              <h3>Current Treatments</h3>
              <div className="info-item">
                <label>On HRT</label>
                <p>{formData.onHRT === 'yes' ? 'Yes' : 'No'}</p>
              </div>
              {formData.onHRT === 'yes' && formData.hrtType.length > 0 && (
                <div className="info-item">
                  <label>HRT Type</label>
                  <div className="treatment-list">
                    {formData.hrtType.map((type, index) => (
                      <span key={index} className="treatment-tag">{type}</span>
                    ))}
                  </div>
                </div>
              )}
              {formData.otherTreatments.length > 0 && (
                <div className="info-item">
                  <label>Other Treatments</label>
                  <div className="treatment-list">
                    {formData.otherTreatments.map((treatment, index) => (
                      <span key={index} className="treatment-tag">{treatment}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Goals */}
            <div className="profile-section">
              <h3>Your Goals</h3>
              <div className="info-item">
                <label>Main Goal with OpenMedicine</label>
                {isEditing ? (
                  <select
                    value={formData.mainGoal}
                    onChange={(e) => setFormData({ ...formData, mainGoal: e.target.value })}
                    className="profile-select"
                  >
                    <option value="">Select goal</option>
                    <option value="understand">Understand what's happening to my body</option>
                    <option value="find-treatment">Find the right treatment</option>
                    <option value="track-treatment">Track if my current treatment is working</option>
                    <option value="connect-specialist">Connect with a specialist</option>
                    <option value="all">All of the above</option>
                  </select>
                ) : (
                  <p>{formatGoal(formData.mainGoal) || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
