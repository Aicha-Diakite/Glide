import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const OTPVerification = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Focus on the input field when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP code');
      return;
    }
    
    // For demo purposes, just navigate to the app
    // In a real app, you would verify the OTP with your backend
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/app');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header-image otp-image"></div>
        
        <div className="auth-content">
          <h2 className="auth-title">OTP Verification</h2>
          <p className="auth-subtitle">Please enter a code from email</p>
          
          {error && <p className="auth-error">{error}</p>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="otp-code">Your code</label>
              <input
                type="text"
                id="otp-code"
                ref={inputRef}
                placeholder="••••"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  if (value.length <= 6) {
                    setOtp(value);
                  }
                }}
                maxLength={6}
              />
            </div>
            
            <button type="submit" className="auth-button">Verification</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;