import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Onboarding from './screens/Onboarding';
import MainApp from './screens/MainApp';
import Profile from './screens/Profile';
import './styles.css';

function App() {
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  // Check if user has seen onboarding screens
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    if (onboardingCompleted === 'true') {
      setIsFirstVisit(false);
    }
  }, []);

  // Mark onboarding as completed
  const completeOnboarding = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    setIsFirstVisit(false);
  };

  return (
    <Router>
      <Routes>
        {/* Redirect to onboarding if first visit */}
        <Route 
          path="/" 
          element={isFirstVisit ? <Navigate to="/onboarding" /> : <Navigate to="/app" />} 
        />
        
        {/* Onboarding screens */}
        <Route 
          path="/onboarding" 
          element={<Onboarding onComplete={completeOnboarding} />} 
        />
        
        {/* Main app screens */}
        <Route path="/app/*" element={<MainApp />} />
        
        {/* Profile screen */}
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;