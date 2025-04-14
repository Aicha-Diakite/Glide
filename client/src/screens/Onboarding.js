import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = () => {
    onComplete();
    navigate('/app');
  };

  return (
    <div className="onboarding-container">
      {step === 1 && (
        <div className="onboarding-slide">
          <div className="onboarding-header">
            <h1 className="app-title">Glide <span className="plane-icon">✈</span></h1>
            <p className="app-subtitle">Your personalized travel assistant.</p>
          </div>
          
          <div className="onboarding-image">
            {/* Replace with actual image */}
            <img 
              src="/assets/images/onboarding-1.png" 
              alt="Navigate the Airport" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300x240?text=Navigate+Airport';
              }}
            />
          </div>
          
          <div className="onboarding-content">
            <h2>Navigate the Airport</h2>
            <p>
              Seamlessly navigate any airport with our intuitive smart navigation maps that 
              create personalized route plans for you.
            </p>
          </div>
          
          <div className="onboarding-actions">
            <button className="primary-button" onClick={nextStep}>Next</button>
            
            <div className="step-indicators">
              <div className="step-indicator active"></div>
              <div className="step-indicator"></div>
              <div className="step-indicator"></div>
            </div>
          </div>
        </div>
      )}
      
      {step === 2 && (
        <div className="onboarding-slide">
          <div className="onboarding-header">
            <h1 className="app-title">Glide <span className="plane-icon">✈</span></h1>
            <p className="app-subtitle">Your personalized travel assistant.</p>
          </div>
          
          <div className="onboarding-image">
            {/* Replace with actual image */}
            <img 
              src="/assets/images/onboarding-2.png" 
              alt="Save Time and Plan Ahead" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300x240?text=Save+Time';
              }}
            />
          </div>
          
          <div className="onboarding-content">
            <h2>Save Time and<br />Plan Ahead</h2>
            <p>
              Save time and plan ahead with our real-time security line updates, 
              restaurant wait times, and airport traffic.
            </p>
          </div>
          
          <div className="onboarding-actions">
            <button className="primary-button" onClick={nextStep}>Next</button>
            
            <div className="step-indicators">
              <div className="step-indicator"></div>
              <div className="step-indicator active"></div>
              <div className="step-indicator"></div>
            </div>
          </div>
        </div>
      )}
      
      {step === 3 && (
        <div className="onboarding-slide">
          <div className="onboarding-header">
            <h1 className="app-title">Glide <span className="plane-icon">✈</span></h1>
            <p className="app-subtitle">Your personalized travel assistant.</p>
          </div>
          
          <div className="onboarding-image">
            {/* Replace with actual image */}
            <img 
              src="/assets/images/onboarding-3.png" 
              alt="Personalized travel experience" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300x240?text=Personalized+Experience';
              }}
            />
          </div>
          
          <div className="onboarding-content">
            <h2>Personalized travel experience</h2>
            <p>
              Recommended lounges, restaurants, and more based on user preferences 
              and past history.
            </p>
          </div>
          
          <div className="onboarding-actions">
            <button className="primary-button" onClick={completeOnboarding}>Finish</button>
            
            <div className="step-indicators">
              <div className="step-indicator"></div>
              <div className="step-indicator"></div>
              <div className="step-indicator active"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;