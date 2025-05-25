// src/components/Login.jsx
// רכיב דף ההתחברות

import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../contexts/AuthContext';
import '../css/Login.css';

/**
 * Login - רכיב דף ההתחברות
 * כולל טופס עם שדות username ו-password
 * מאמת מול השרת לפי username ו-website (כסיסמה)
 */
const Login = () => {
  // State לניהול נתוני הטופס
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Hooks לניווט ואימות
  const navigate = useNavigate();
  const { login, user } = useContext(AuthContext);

  // אם המשתמש כבר מחובר, מפנה לדף הבית
  useEffect(() => {
    if (user) {
      navigate(`/users/${user.id}/home`);
    }
  }, [user, navigate]);

  /**
   * מטפל בשינויים בשדות הטופס
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // מנקה הודעות שגיאה כשהמשתמש מתחיל להקליד
    if (error) setError('');
  };

  /**
   * מטפל בשליחת טופס ההתחברות
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // חיפוש משתמש לפי username
      const response = await axios.get(
        `http://localhost:3000/users?username=${formData.username}`
      );
      
      const users = response.data;
      
      // בדיקה אם המשתמש קיים
      if (users.length === 0) {
        setError('שם משתמש לא קיים במערכת');
        return;
      }

      const user = users[0];
      
      // בדיקת סיסמה (לפי שדה website כמו שמוגדר בדרישות)
      if (user.website !== formData.password) {
        setError('סיסמה שגויה');
        return;
      }

      // התחברות מוצלחת
      login(user);
      navigate(`/users/${user.id}/home`);
      
    } catch (err) {
      console.error('Login error:', err);
      setError('שגיאה בהתחברות. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>התחברות למערכת</h1>
        <p>אנא הכנס את פרטיך להתחברות</p>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">שם משתמש:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="הכנס שם משתמש"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">סיסמה:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="הכנס סיסמה"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'מתחבר...' : 'התחבר'}
          </button>
        </form>

        <p className="register-link">
          אין לך חשבון? 
          <Link to="/register"> צור חשבון חדש</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;