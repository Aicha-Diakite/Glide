import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignIn = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    // For demo purposes, just navigate to app
    // In a real app, you would authenticate with a backend
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/app');
  };

  const handleGoogleSignIn = () => {
    // Google authentication would be implemented here
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/app');
  };

  const handleTwitterSignIn = () => {
    // Twitter authentication would be implemented here
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/app');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header-image"></div>
        
        <div className="auth-content">
          <h2 className="auth-title">Sign In</h2>
          <p className="auth-subtitle">Please enter a valid account</p>
          
          {error && <p className="auth-error">{error}</p>}
          
          <form onSubmit={handleSignIn}>
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
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="form-link-container">
              <Link to="/forgot-password" className="form-link">Forgot Password</Link>
            </div>
            
            <button type="submit" className="auth-button">Sign In</button>
            
            <div className="separator">
              <span className="separator-text">OR</span>
            </div>
            
            <div className="social-buttons">
              <button 
                type="button" 
                className="social-button google"
                onClick={handleGoogleSignIn}
              >
                <img src="/assets/icons/google.svg" alt="Google" className="social-icon" />
              </button>
              
              <button 
                type="button" 
                className="social-button twitter"
                onClick={handleTwitterSignIn}
              >
                <img src="/assets/icons/twitter.svg" alt="Twitter" className="social-icon" />
              </button>
            </div>
            
            <div className="auth-redirect">
              <span>Don't have account?</span>
              <Link to="/signup" className="auth-redirect-link">Sign Up</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;