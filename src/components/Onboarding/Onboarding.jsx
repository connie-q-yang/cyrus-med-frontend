import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import './Onboarding.css';

const Onboarding = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data state
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

  const totalSteps = 8;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => {
      const currentValues = prev[field] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return {
        ...prev,
        [field]: newValues
      };
    });
  };

  const handleComplete = async () => {
    if (!user || !user.id) {
      toast.error('User not found. Please log in again.');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Starting onboarding save for user:', user.id);
      console.log('Form data:', formData);

      // First, check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('Existing profile:', existingProfile);

      // Prepare the data
      const profileData = {
        user_id: user.id,
        first_name: user.user_metadata?.first_name || null,
        last_name: user.user_metadata?.last_name || null,
        preferred_name: user.user_metadata?.preferred_name || null,
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
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString()
      };

      console.log('Profile data to save:', profileData);

      // Use upsert to insert or update
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(profileData, {
          onConflict: 'user_id',
          returning: 'representation'
        })
        .select();

      if (error) {
        console.error('Supabase error details:', error);
        toast.error(`Database error: ${error.message}. Please check console for details.`);
        return;
      }

      console.log('Onboarding data saved successfully:', data);

      // Verify the save
      const { data: verifyData, error: verifyError } = await supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single();

      console.log('Verification check:', verifyData, verifyError);

      if (verifyData?.onboarding_completed) {
        toast.success('Profile saved! Redirecting to dashboard...');

        // Use a longer delay and hard redirect
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        toast.error('Save verification failed. Please try again.');
      }

    } catch (error) {
      console.error('Error saving onboarding:', error);
      toast.error('Unexpected error. Please check console and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeScreen onNext={handleNext} />;
      case 2:
        return <BasicInfoScreen formData={formData} onChange={handleInputChange} onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <MenopauseStageScreen formData={formData} onChange={handleInputChange} onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <SymptomsScreen formData={formData} onChange={handleCheckboxChange} onNext={handleNext} onBack={handleBack} />;
      case 5:
        return <SeverityScreen formData={formData} onChange={handleInputChange} onNext={handleNext} onBack={handleBack} />;
      case 6:
        return <TreatmentsScreen formData={formData} onChange={handleInputChange} onCheckboxChange={handleCheckboxChange} onNext={handleNext} onBack={handleBack} />;
      case 7:
        return <GoalsScreen formData={formData} onChange={handleInputChange} onNext={handleNext} onBack={handleBack} />;
      case 8:
        return <CompleteScreen onComplete={handleComplete} isSubmitting={isSubmitting} />;
      default:
        return null;
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
        <p className="progress-text">Step {currentStep} of {totalSteps}</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Screen 1: Welcome
const WelcomeScreen = ({ onNext }) => {
  const { user } = useAuth();
  // Use preferred name if available, otherwise use first name, fallback to email username
  const userName = user?.user_metadata?.preferred_name ||
                   user?.user_metadata?.first_name ||
                   user?.email?.split('@')[0] ||
                   'there';

  return (
    <div className="onboarding-card">
      <div className="onboarding-icon">👋</div>
      <h1 className="onboarding-title">Welcome to OpenMedicine, {userName}!</h1>
      <p className="onboarding-subtitle">
        Let's personalize your experience. This takes about 5 minutes.
      </p>
      <div className="onboarding-benefits">
        <div className="benefit-item">
          <span className="benefit-icon">✓</span>
          <span>Track your symptoms effectively</span>
        </div>
        <div className="benefit-item">
          <span className="benefit-icon">✓</span>
          <span>Get AI-powered insights</span>
        </div>
        <div className="benefit-item">
          <span className="benefit-icon">✓</span>
          <span>Connect with specialists</span>
        </div>
      </div>
      <button className="onboarding-button primary large" onClick={onNext}>
        Get Started
      </button>
    </div>
  );
};

// Screen 2: Basic Info
const BasicInfoScreen = ({ formData, onChange, onNext, onBack }) => {
  const canProceed = formData.age && formData.symptomsStartDate;

  return (
    <div className="onboarding-card">
      <h2 className="onboarding-heading">Tell us about yourself</h2>
      <p className="onboarding-description">
        This helps us personalize your experience
      </p>

      <div className="form-group">
        <label>How old are you?</label>
        <input
          type="number"
          value={formData.age}
          onChange={(e) => onChange('age', e.target.value)}
          placeholder="e.g., 45"
          min="18"
          max="100"
          className="onboarding-input"
        />
      </div>

      <div className="form-group">
        <label>When did your symptoms start?</label>
        <select
          value={formData.symptomsStartDate}
          onChange={(e) => onChange('symptomsStartDate', e.target.value)}
          className="onboarding-select"
        >
          <option value="">Select timeline</option>
          <option value="less-than-6-months">Less than 6 months ago</option>
          <option value="6-12-months">6-12 months ago</option>
          <option value="1-2-years">1-2 years ago</option>
          <option value="2-5-years">2-5 years ago</option>
          <option value="5-plus-years">More than 5 years ago</option>
        </select>
      </div>

      <div className="onboarding-actions">
        <button className="onboarding-button secondary" onClick={onBack}>
          Back
        </button>
        <button
          className="onboarding-button primary"
          onClick={onNext}
          disabled={!canProceed}
        >
          Next
        </button>
      </div>
    </div>
  );
};

// Screen 3: Menopause Stage
const MenopauseStageScreen = ({ formData, onChange, onNext, onBack }) => {
  const stages = [
    { value: 'not-sure', label: "I'm not sure", description: "Let's figure it out together" },
    { value: 'perimenopause', label: 'Perimenopause', description: 'Irregular periods, symptoms starting' },
    { value: 'menopause', label: 'Menopause', description: 'No period for 12+ months' },
    { value: 'postmenopause', label: 'Postmenopause', description: 'Several years past menopause' },
  ];

  return (
    <div className="onboarding-card">
      <h2 className="onboarding-heading">What stage of menopause are you in?</h2>
      <p className="onboarding-description">
        Don't worry if you're not sure - we'll help you understand
      </p>

      <div className="radio-group">
        {stages.map((stage) => (
          <label
            key={stage.value}
            className={`radio-card ${formData.menopauseStage === stage.value ? 'selected' : ''}`}
          >
            <input
              type="radio"
              name="menopauseStage"
              value={stage.value}
              checked={formData.menopauseStage === stage.value}
              onChange={(e) => onChange('menopauseStage', e.target.value)}
            />
            <div className="radio-content">
              <div className="radio-dot"></div>
              <div style={{ flex: 1 }}>
                <div className="radio-label">{stage.label}</div>
                <div className="radio-description">{stage.description}</div>
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="onboarding-actions">
        <button className="onboarding-button secondary" onClick={onBack}>
          Back
        </button>
        <button
          className="onboarding-button primary"
          onClick={onNext}
          disabled={!formData.menopauseStage}
        >
          Next
        </button>
      </div>
    </div>
  );
};

// Screen 4: Primary Symptoms
const SymptomsScreen = ({ formData, onChange, onNext, onBack }) => {
  const symptoms = [
    'Hot flashes',
    'Night sweats',
    'Sleep problems',
    'Mood changes (anxiety, irritability)',
    'Brain fog / memory issues',
    'Low energy / fatigue',
    'Joint pain',
    'Vaginal dryness',
    'Weight gain',
    'Loss of libido',
  ];

  return (
    <div className="onboarding-card">
      <h2 className="onboarding-heading">What symptoms are affecting you most?</h2>
      <p className="onboarding-description">
        Select all that apply
      </p>

      <div className="checkbox-grid">
        {symptoms.map((symptom) => (
          <label
            key={symptom}
            className={`checkbox-card ${formData.symptoms.includes(symptom) ? 'selected' : ''}`}
          >
            <input
              type="checkbox"
              checked={formData.symptoms.includes(symptom)}
              onChange={() => onChange('symptoms', symptom)}
              style={{ display: 'none' }}
            />
            <div className="checkbox-label">
              <div className="checkbox-box"></div>
              <span>{symptom}</span>
            </div>
          </label>
        ))}
      </div>

      <div className="onboarding-actions">
        <button className="onboarding-button secondary" onClick={onBack}>
          Back
        </button>
        <button
          className="onboarding-button primary"
          onClick={onNext}
          disabled={formData.symptoms.length === 0}
        >
          Next
        </button>
      </div>
    </div>
  );
};

// Screen 5: Symptom Severity
const SeverityScreen = ({ formData, onChange, onNext, onBack }) => {
  const severityLevels = [
    { value: 'mild', label: 'Mild', description: 'Noticeable but manageable' },
    { value: 'moderate', label: 'Moderate', description: 'Affecting daily life' },
    { value: 'severe', label: 'Severe', description: 'Significantly impacting quality of life' },
  ];

  return (
    <div className="onboarding-card">
      <h2 className="onboarding-heading">How severe are your symptoms overall?</h2>

      <div className="radio-group">
        {severityLevels.map((level) => (
          <label
            key={level.value}
            className={`radio-card ${formData.symptomSeverity === level.value ? 'selected' : ''}`}
          >
            <input
              type="radio"
              name="symptomSeverity"
              value={level.value}
              checked={formData.symptomSeverity === level.value}
              onChange={(e) => onChange('symptomSeverity', e.target.value)}
            />
            <div className="radio-content">
              <div className="radio-dot"></div>
              <div style={{ flex: 1 }}>
                <div className="radio-label">{level.label}</div>
                <div className="radio-description">{level.description}</div>
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="onboarding-actions">
        <button className="onboarding-button secondary" onClick={onBack}>
          Back
        </button>
        <button
          className="onboarding-button primary"
          onClick={onNext}
          disabled={!formData.symptomSeverity}
        >
          Next
        </button>
      </div>
    </div>
  );
};

// Screen 6: Current Treatments
const TreatmentsScreen = ({ formData, onChange, onCheckboxChange, onNext, onBack }) => {
  const hrtTypes = [
    'Estrogen patch',
    'Estrogen pill',
    'Combined estrogen + progesterone',
    'Progesterone only',
  ];

  const otherTreatments = [
    'Supplements',
    'Lifestyle changes',
    'Nothing yet',
  ];

  return (
    <div className="onboarding-card">
      <h2 className="onboarding-heading">Are you currently on any treatments?</h2>
      <p className="onboarding-description">
        Help us understand your current treatment plan
      </p>

      <div className="treatment-section">
        <label className="treatment-label">Are you taking HRT (hormone replacement therapy)?</label>
        <div className="radio-group">
          {[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'not-sure', label: "Not sure what HRT is" },
          ].map((option) => (
            <label
              key={option.value}
              className={`radio-card ${formData.onHRT === option.value ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="onHRT"
                value={option.value}
                checked={formData.onHRT === option.value}
                onChange={(e) => onChange('onHRT', e.target.value)}
              />
              <div className="radio-content">
                <div className="radio-dot"></div>
                <div className="radio-label">{option.label}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {formData.onHRT === 'yes' && (
        <div className="treatment-section">
          <label className="treatment-label">What type of HRT?</label>
          <div className="checkbox-grid">
            {hrtTypes.map((type) => (
              <label
                key={type}
                className={`checkbox-card ${formData.hrtType.includes(type) ? 'selected' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={formData.hrtType.includes(type)}
                  onChange={() => onCheckboxChange('hrtType', type)}
                  style={{ display: 'none' }}
                />
                <div className="checkbox-label">
                  <div className="checkbox-box"></div>
                  <span>{type}</span>
                </div>
              </label>
            ))}
          </div>
          <input
            type="text"
            placeholder="Other (please specify)"
            value={formData.otherHRT}
            onChange={(e) => onChange('otherHRT', e.target.value)}
            className="onboarding-input"
            style={{ marginTop: '16px' }}
          />
        </div>
      )}

      <div className="treatment-section">
        <label className="treatment-label">What else are you trying?</label>
        <div className="checkbox-grid">
          {otherTreatments.map((treatment) => (
            <label
              key={treatment}
              className={`checkbox-card ${formData.otherTreatments.includes(treatment) ? 'selected' : ''}`}
            >
              <input
                type="checkbox"
                checked={formData.otherTreatments.includes(treatment)}
                onChange={() => onCheckboxChange('otherTreatments', treatment)}
                style={{ display: 'none' }}
              />
              <div className="checkbox-label">
                <div className="checkbox-box"></div>
                <span>{treatment}</span>
              </div>
            </label>
          ))}
        </div>
        {formData.otherTreatments.includes('Supplements') && (
          <input
            type="text"
            placeholder="Which supplements?"
            value={formData.otherSupplements}
            onChange={(e) => onChange('otherSupplements', e.target.value)}
            className="onboarding-input"
            style={{ marginTop: '16px' }}
          />
        )}
      </div>

      <div className="onboarding-actions">
        <button className="onboarding-button secondary" onClick={onBack}>
          Back
        </button>
        <button
          className="onboarding-button primary"
          onClick={onNext}
          disabled={!formData.onHRT}
        >
          Next
        </button>
      </div>
    </div>
  );
};

// Screen 7: Goals
const GoalsScreen = ({ formData, onChange, onNext, onBack }) => {
  const goals = [
    { value: 'understand', label: "Understand what's happening to my body" },
    { value: 'find-treatment', label: 'Find the right treatment' },
    { value: 'track-treatment', label: 'Track if my current treatment is working' },
    { value: 'connect-specialist', label: 'Connect with a specialist' },
    { value: 'all', label: 'All of the above' },
  ];

  return (
    <div className="onboarding-card">
      <h2 className="onboarding-heading">What's your main goal with OpenMedicine?</h2>

      <div className="radio-group">
        {goals.map((goal) => (
          <label
            key={goal.value}
            className={`radio-card ${formData.mainGoal === goal.value ? 'selected' : ''}`}
          >
            <input
              type="radio"
              name="mainGoal"
              value={goal.value}
              checked={formData.mainGoal === goal.value}
              onChange={(e) => onChange('mainGoal', e.target.value)}
            />
            <div className="radio-content">
              <div className="radio-dot"></div>
              <div className="radio-label">{goal.label}</div>
            </div>
          </label>
        ))}
      </div>

      <div className="onboarding-actions">
        <button className="onboarding-button secondary" onClick={onBack}>
          Back
        </button>
        <button
          className="onboarding-button primary"
          onClick={onNext}
          disabled={!formData.mainGoal}
        >
          Complete Setup
        </button>
      </div>
    </div>
  );
};

// Screen 8: Complete
const CompleteScreen = ({ onComplete, isSubmitting }) => {
  return (
    <div className="onboarding-card">
      <div className="onboarding-icon">🎉</div>
      <h1 className="onboarding-title">You're all set!</h1>
      <p className="onboarding-subtitle">
        Here's what happens next:
      </p>

      <div className="completion-steps">
        <div className="completion-step">
          <span className="completion-icon">✓</span>
          <span>Start tracking symptoms today</span>
        </div>
        <div className="completion-step">
          <span className="completion-icon">✓</span>
          <span>Get AI insights after 7 days of tracking</span>
        </div>
        <div className="completion-step">
          <span className="completion-icon">✓</span>
          <span>Book a specialist consultation anytime</span>
        </div>
      </div>

      <button
        className="onboarding-button primary large"
        onClick={onComplete}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 'Go to Dashboard'}
      </button>
    </div>
  );
};

export default Onboarding;
