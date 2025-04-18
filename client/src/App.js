import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Onboarding from './screens/Onboarding';
import SignIn from './screens/SignIn';
import SignUp from './screens/SignUp';
import ForgotPassword from './screens/ForgotPassword';
import OTPVerification from './screens/OTPVerification';
import MainApp from './screens/MainApp';
import Profile from './components/ProfileIcon';
import './styles.css';
import './styles/Onboarding.css';
import './styles/Auth.css';

function App() {
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user has seen onboarding screens and is authenticated
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    const authStatus = localStorage.getItem('isAuthenticated');
    
    if (onboardingCompleted === 'true') {
      setIsFirstVisit(false);
    }
    
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Mark onboarding as completed
  const completeOnboarding = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    setIsFirstVisit(false);
    // We don't automatically set authentication status here anymore
    // User will need to sign in
  };
  
  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/signin" />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Redirect based on onboarding and authentication status */}
        <Route 
          path="/" 
          element={
            isFirstVisit ? 
              <Navigate to="/onboarding" /> : 
              isAuthenticated ? 
                <Navigate to="/app" /> : 
                <Navigate to="/signin" />
          } 
        />
        
        {/* Onboarding screen */}
        <Route 
          path="/onboarding" 
          element={<Onboarding onComplete={completeOnboarding} />} 
        />
        
        {/* Auth screens */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp-verification" element={<OTPVerification />} />
        
        {/* Protected routes */}
        <Route 
          path="/app/*" 
          element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;

