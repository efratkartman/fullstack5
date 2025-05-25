// src/components/Register.jsx
// רכיב דף ההרשמה

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../css/Register.css';

/**
 * Register - רכיב דף ההרשמה
 * כולל טופס עם שדות username, password ו-password verification
 * בודק שהמשתמש לא קיים ומעביר להשלמת פרופיל
 */
const Register = () => {
  // State לניהול נתוני הטופס
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    passwordVerify: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /**
   * מטפל בשינויים בשדות הטופס
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // מנקה שגיאות של השדה הנוכחי
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * בודק תקינות הטופס
   */
  const validateForm = () => {
    const newErrors = {};

    // בדיקת שם משתמש
    if (!formData.username.trim()) {
      newErrors.username = 'שם משתמש הוא שדה חובה';
    } else if (formData.username.length < 3) {
      newErrors.username = 'שם משתמש חייב להכיל לפחות 3 תווים';
    }

    // בדיקת סיסמה
    if (!formData.password) {
      newErrors.password = 'סיסמה היא שדה חובה';
    } else if (formData.password.length < 4) {
      newErrors.password = 'סיסמה חייבת להכיל לפחות 4 תווים';
    }

    // בדיקת אימות סיסמה
    if (!formData.passwordVerify) {
      newErrors.passwordVerify = 'אימות סיסמה הוא שדה חובה';
    } else if (formData.password !== formData.passwordVerify) {
      newErrors.passwordVerify = 'הסיסמאות אינן תואמות';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * מטפל בשליחת טופס ההרשמה
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // בדיקה אם שם המשתמש כבר קיים
      const checkResponse = await axios.get(
        `http://localhost:3000/users?username=${formData.username}`
      );
      
      if (checkResponse.data.length > 0) {
        setErrors({ username: 'שם משתמש כבר קיים במערכת' });
        return;
      }

      // מעבר לדף השלמת פרופיל
      navigate('/completeProfile', { 
        state: { 
          username: formData.username, 
          password: formData.password 
        } 
      });

    } catch (err) {
      console.error('Registration error:', err);
      setErrors({ general: 'שגיאה בהרשמה. אנא נסה שוב.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>הרשמה למערכת</h1>
        <p>צור חשבון חדש כדי להתחיל</p>
        
        {errors.general && (
          <div className="error-message">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="username">שם משתמש:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="הכנס שם משתמש"
              disabled={loading}
              className={errors.username ? 'error' : ''}
            />
            {errors.username && (
              <span className="field-error">{errors.username}</span>
            )}
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
              disabled={loading}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="passwordVerify">אימות סיסמה:</label>
            <input
              type="password"
              id="passwordVerify"
              name="passwordVerify"
              value={formData.passwordVerify}
              onChange={handleChange}
              placeholder="הכנס סיסמה שוב"
              disabled={loading}
              className={errors.passwordVerify ? 'error' : ''}
            />
            {errors.passwordVerify && (
              <span className="field-error">{errors.passwordVerify}</span>
            )}
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'בודק...' : 'המשך להרשמה'}
          </button>
        </form>

        <p className="login-link">
          כבר יש לך חשבון? 
          <Link to="/login"> התחבר כאן</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;