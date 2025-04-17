import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/Auth.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Enter email & password');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const ct = res.headers.get('content-type');
      const data =
        ct && ct.includes('application/json')
          ? await res.json()
          : { message: await res.text() };

      if (!res.ok) throw new Error(data.message);
      login(data.user, data.token);
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Unable to sign in');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header-image" />
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="auth-button">Sign In</button>
          </form>

          <p className="auth-link">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
