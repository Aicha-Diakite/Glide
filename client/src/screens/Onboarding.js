import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Onboarding.css';
import travelerImage from '../assets/images/traveler.jpg';

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
    navigate('/signin');
  };

  return (
    <div className="onboarding-container">
      {step === 1 && (
        <div className="onboarding-content">
          <h1 className="app-title">
            Glide <span className="plane-icon">✈</span>
          </h1>
          <p className="app-subtitle">Your personalized travel assistant.</p>

          <div className="image-container">
            <img
              src={travelerImage}
              alt="Traveler with suitcase"
              className="traveler-image"
            />
          </div>

          <div className="content-bottom">
            <h2 className="content-title">Navigate the Airport</h2>

            <p className="content-text">
              Seamlessly navigate any airport with our intuitive smart navigation
              maps that create personalized route plans for you.
            </p>

            <button className="next-button" onClick={nextStep}>
              Next
            </button>

            <div className="indicators">
              <div className="indicator active"></div>
              <div className="indicator"></div>
              <div className="indicator"></div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="onboarding-content">
          <h1 className="app-title">
            Glide <span className="plane-icon">✈</span>
          </h1>
          <p className="app-subtitle">Your personalized travel assistant.</p>

          <div className="image-container">
            <img
              src={travelerImage}
              alt="Traveler with suitcase"
              className="traveler-image"
            />
          </div>

          <div className="content-bottom">
            <h2 className="content-title">Save Time and<br />Plan Ahead</h2>

            <p className="content-text">
              Discover the fastest security lines and best routes to your gate
              based on live data and your preferences.
            </p>

            <button className="next-button" onClick={nextStep}>
              Next
            </button>

            <div className="indicators">
              <div className="indicator"></div>
              <div className="indicator active"></div>
              <div className="indicator"></div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="onboarding-content">
          <h1 className="app-title">
            Glide <span className="plane-icon">✈</span>
          </h1>
          <p className="app-subtitle">Your personalized travel assistant.</p>

          <div className="image-container">
            <img
              src={travelerImage}
              alt="Traveler with suitcase"
              className="traveler-image"
            />
          </div>

          <div className="content-bottom">
            <h2 className="content-title">
              Personalized travel<br />experience
            </h2>

            <p className="content-text">
              Recommended lounges, restaurants, and more based on user
              preferences and past history.
            </p>

            <button className="next-button" onClick={completeOnboarding}>
              Finish
            </button>

            <div className="indicators">
              <div className="indicator"></div>
              <div className="indicator"></div>
              <div className="indicator active"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
