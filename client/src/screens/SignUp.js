import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';
import '../styles/Auth.css';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const handleSignUp = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!name || !email || !password) {
      setError('Please fill out all fields');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Check if this email is already registered
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    if (registeredUsers.some(user => user.email === email)) {
      setError('An account with this email already exists');
      return;
    }

    // Add new user to registered users
    const newUser = { name, email, password };
    localStorage.setItem('registeredUsers', JSON.stringify([...registeredUsers, newUser]));

    // Store user info in localStorage
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('isAuthenticated', 'true');
    
    // Show success notification
    setNotification({
      type: 'success',
      message: 'Account created successfully! Redirecting to app...'
    });
    
    // Redirect to app after delay
    setTimeout(() => {
      navigate('/app');
    }, 2000);
  };

  const handleGoogleSignUp = () => {
    // Google authentication would be implemented here
    
    // Simulate user registration for demo
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const googleUser = { name: 'Google User', email: 'google@example.com' };
    
    // Add user if they don't exist
    if (!registeredUsers.some(user => user.email === googleUser.email)) {
      localStorage.setItem('registeredUsers', JSON.stringify([...registeredUsers, googleUser]));
    }
    
    localStorage.setItem('userName', 'Google User');
    localStorage.setItem('userEmail', 'google@example.com');
    localStorage.setItem('isAuthenticated', 'true');
    
    setNotification({
      type: 'success',
      message: 'Signed up with Google successfully!'
    });
    
    setTimeout(() => {
      navigate('/app');
    }, 2000);
  };

  const handleTwitterSignUp = () => {
    // Twitter authentication would be implemented here
    
    // Simulate user registration for demo
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const twitterUser = { name: 'Twitter User', email: 'twitter@example.com' };
    
    // Add user if they don't exist
    if (!registeredUsers.some(user => user.email === twitterUser.email)) {
      localStorage.setItem('registeredUsers', JSON.stringify([...registeredUsers, twitterUser]));
    }
    
    localStorage.setItem('userName', 'Twitter User');
    localStorage.setItem('userEmail', 'twitter@example.com');
    localStorage.setItem('isAuthenticated', 'true');
    
    setNotification({
      type: 'success',
      message: 'Signed up with Twitter successfully!'
    });
    
    setTimeout(() => {
      navigate('/app');
    }, 2000);
  };

  return (
    <div className="auth-container">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          duration={3000}
          onClose={() => setNotification(null)}
        />
      )}
      
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
                G
              </button>
              
              <button 
                type="button" 
                className="social-button twitter"
                onClick={handleTwitterSignUp}
              >
                X
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