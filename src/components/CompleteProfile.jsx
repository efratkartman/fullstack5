// src/components/CompleteProfile.jsx
// רכיב להשלמת פרטי המשתמש אחרי הרשמה בסיסית

import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../contexts/AuthContext';
import '../css/CompleteProfile.css';


const CompleteProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  
  // קבלת נתונים מדף ההרשמה
  const { username, password } = location.state || {};
  
  // אם אין נתונים מהדף הקודם, חזרה לרשמה
  React.useEffect(() => {
    if (!username || !password) {
      navigate('/register');
    }
  }, [username, password, navigate]);

  // State לניהול נתוני הפרופיל
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    address: {
      street: '',
      suite: '',
      city: '',
      zipcode: '',
      geo: {
        lat: '',
        lng: ''
      }
    },
    phone: '',
    website: password, 
    company: {
      name: '',
      catchPhrase: '',
      bs: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});


  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
    
      const keys = name.split('.');
      setProfileData(prev => {
        const newData = { ...prev };
        let current = newData;
        
      
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        

        current[keys[keys.length - 1]] = value;
        return newData;
      });
    } else {
      
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * בדיקת תקינות הטופס
   */
  const validateForm = () => {
    const newErrors = {};

    if (!profileData.name.trim()) {
      newErrors.name = 'שם מלא הוא שדה חובה';
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'כתובת מייל היא שדה חובה';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'כתובת מייל לא תקינה';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
   
      const completeUserData = {
        username,
        website: password, 
        ...profileData
      };

      // שמירת המשתמש בשרת
      const response = await axios.post('http://localhost:3000/users', completeUserData);
      const newUser = response.data;

      // התחברות אוטומטית
      login(newUser);
      
      // מעבר לדף הבית
      navigate(`/users/${newUser.id}/home`);

    } catch (error) {
      console.error('Error completing profile:', error);
      setErrors({ general: 'שגיאה בשמירת הפרטים. אנא נסה שוב.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="complete-profile-page">
      <div className="complete-profile-container">
        <h1>השלמת פרטי פרופיל</h1>
        <p>אנא מלא את הפרטים הנוספים להשלמת ההרשמה</p>
        
        {errors.general && (
          <div className="error-message">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          {/* פרטים אישיים */}
          <div className="form-section">
            <h3>פרטים אישיים</h3>
            
            <div className="form-group">
              <label htmlFor="name">שם מלא: *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleChange}
                placeholder="הכנס שם מלא"
                required
                disabled={loading}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">כתובת מייל: *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                required
                disabled={loading}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">טלפון:</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profileData.phone}
                onChange={handleChange}
                placeholder="050-1234567"
                disabled={loading}
              />
            </div>
          </div>

          {/* כתובת */}
          <div className="form-section">
            <h3>כתובת</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="street">רחוב:</label>
                <input
                  type="text"
                  id="street"
                  name="address.street"
                  value={profileData.address.street}
                  onChange={handleChange}
                  placeholder="רחוב 123"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="suite">דירה/יחידה:</label>
                <input
                  type="text"
                  id="suite"
                  name="address.suite"
                  value={profileData.address.suite}
                  onChange={handleChange}
                  placeholder="דירה 4"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">עיר:</label>
                <input
                  type="text"
                  id="city"
                  name="address.city"
                  value={profileData.address.city}
                  onChange={handleChange}
                  placeholder="תל אביב"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="zipcode">מיקוד:</label>
                <input
                  type="text"
                  id="zipcode"
                  name="address.zipcode"
                  value={profileData.address.zipcode}
                  onChange={handleChange}
                  placeholder="12345"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* פרטי חברה */}
          <div className="form-section">
            <h3>פרטי חברה (אופציונלי)</h3>
            
            <div className="form-group">
              <label htmlFor="companyName">שם החברה:</label>
              <input
                type="text"
                id="companyName"
                name="company.name"
                value={profileData.company.name}
                onChange={handleChange}
                placeholder="שם החברה"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="catchPhrase">סלוגן:</label>
              <input
                type="text"
                id="catchPhrase"
                name="company.catchPhrase"
                value={profileData.company.catchPhrase}
                onChange={handleChange}
                placeholder="סלוגן החברה"
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'שומר...' : 'השלם הרשמה'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;