import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email) {
      setError('Please enter your email');
      return;
    }
    
    // For demo purposes, just show success message
    // In a real app, you would send a request to your backend
    setSent(true);
    setTimeout(() => {
      navigate('/otp-verification');
    }, 2000);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header-image forgot-image"></div>
        
        <div className="auth-content">
          <h2 className="auth-title">Forgot Password</h2>
          <p className="auth-subtitle">Please enter your email for sending OTP</p>
          
          {error && <p className="auth-error">{error}</p>}
          {sent && <p className="auth-success">OTP has been sent to your email</p>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="yourname@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <button type="submit" className="auth-button">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;