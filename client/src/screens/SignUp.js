import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/Auth.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirm) {
      setError('Please fill out all fields');
      return;
    }
    if (!validateEmail(email)) {
      setError('Invalid email');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
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
      setError(err.message || 'Unable to sign up');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header-image signup-image" />
        <div className="auth-content">
          <h2 className="auth-title">Create account</h2>
          {error && <p className="auth-error">{error}</p>}
          <form onSubmit={handleSignUp}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {showPassword ? (
                  <EyeOff className="toggle-icon" onClick={() => setShowPassword(false)} />
                ) : (
                  <Eye className="toggle-icon" onClick={() => setShowPassword(true)} />
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirm">Confirm Password</label>
              <input
                id="confirm"
                type="password"
                placeholder="Re‑enter password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            <button type="submit" className="auth-button">Sign Up</button>
          </form>

          <p className="auth-link">
            Already have an account? <Link to="/signin">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
