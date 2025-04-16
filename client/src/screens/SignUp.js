import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!name || !email || !password) {
      setError('Please fill out all fields');
      return;
    }
    
    // For demo purposes, just navigate to app
    // In a real app, you would register with a backend
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/app');
  };

  const handleGoogleSignUp = () => {
    // Google authentication would be implemented here
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/app');
  };

  const handleTwitterSignUp = () => {
    // Twitter authentication would be implemented here
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/app');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header-image signup-image"></div>
        
        <div className="auth-content">
          <h2 className="auth-title">Sign Up</h2>
          <p className="auth-subtitle">Create an account, it's free</p>
          
          {error && <p className="auth-error">{error}</p>}
          
          <form onSubmit={handleSignUp}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
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
            
            <button type="submit" className="auth-button">Sign Up</button>
            
            <div className="separator">
              <span className="separator-text">OR</span>
            </div>
            
            <div className="social-buttons">
              <button 
                type="button" 
                className="social-button google"
                onClick={handleGoogleSignUp}
              >
                <img src="/assets/icons/google.svg" alt="Google" className="social-icon" />
              </button>
              
              <button 
                type="button" 
                className="social-button twitter"
                onClick={handleTwitterSignUp}
              >
                <img src="/assets/icons/twitter.svg" alt="Twitter" className="social-icon" />
              </button>
            </div>
            
            <div className="auth-redirect">
              <span>Have account?</span>
              <Link to="/signin" className="auth-redirect-link">Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;