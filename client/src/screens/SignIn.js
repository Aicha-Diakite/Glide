import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';
import '../styles/Auth.css';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const handleSignIn = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    // Check if this account already exists
    // In a real app, this would be an API call to your backend
    // For demo purposes, we'll check localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userExists = registeredUsers.some(user => user.email === email);
    
    if (!userExists) {
      setError('No account found with this email. Please sign up first.');
      return;
    }
    
    // For demo purposes, we'll skip password validation
    // In a real app, you would verify the password here
    
    // Store user info in localStorage
    localStorage.setItem('userName', email.split('@')[0]); // Use email username as name
    localStorage.setItem('userEmail', email);
    localStorage.setItem('isAuthenticated', 'true');
    
    // Show success notification
    setNotification({
      type: 'success',
      message: 'Signed in successfully! Redirecting to app...'
    });
    
    // Redirect to app after delay
    setTimeout(() => {
      navigate('/app');
    }, 2000);
  };

  const handleGoogleSignIn = () => {
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
      message: 'Signed in with Google successfully!'
    });
    
    setTimeout(() => {
      navigate('/app');
    }, 2000);
  };

  const handleTwitterSignIn = () => {
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
      message: 'Signed in with Twitter successfully!'
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
                G
              </button>
              
              <button 
                type="button" 
                className="social-button twitter"
                onClick={handleTwitterSignIn}
              >
                X
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