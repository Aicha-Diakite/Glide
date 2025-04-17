import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import Onboarding from './screens/Onboarding';
import SignIn from './screens/SignIn';
import SignUp from './screens/SignUp';
import ForgotPassword from './screens/ForgotPassword';
import OTPVerification from './screens/OTPVerification';
import MainApp from './screens/MainApp';
import Profile from './screens/Profile';
import './styles.css';
import './styles/Onboarding.css';
import './styles/Auth.css';

function RoutesWithAuth() {
  const { isAuthenticated } = useContext(AuthContext);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    if (onboardingCompleted === 'true') {
      setIsFirstVisit(false);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    setIsFirstVisit(false);
  };

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to='/signin' />;
    }
    return children;
  };

  return (
    <Routes>
      <Route
        path='/'
        element={
          isFirstVisit
            ? <Navigate to='/onboarding' />
            : isAuthenticated
              ? <Navigate to='/app' />
              : <Navigate to='/signin' />
        }
      />
      <Route path='/onboarding' element={<Onboarding onComplete={completeOnboarding} />} />
      <Route path='/signin' element={<SignIn />} />
      <Route path='/signup' element={<SignUp />} />
      <Route path='/forgot-password' element={<ForgotPassword />} />
      <Route path='/otp-verification' element={<OTPVerification />} />
      <Route
        path='/app/*'
        element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        }
      />
      <Route
        path='/profile'
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <RoutesWithAuth />
      </Router>
    </AuthProvider>
  );
}
