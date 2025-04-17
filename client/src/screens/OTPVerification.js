import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const OTPVerification = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Enter 6‑digit code');
      return;
    }

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp })
      });
      if (!res.ok) throw new Error('Invalid code');
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/app');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header-image otp-image" />
        <div className="auth-content">
          <h2 className="auth-title">Enter code</h2>
          {error && <p className="auth-error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group otp-group">
              <input
                id="otp-code"
                ref={inputRef}
                placeholder="••••••"
                value={otp}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, '');
                  if (v.length <= 6) setOtp(v);
                }}
                maxLength={6}
              />
            </div>
            <button type="submit" className="auth-button">
              Verify
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;