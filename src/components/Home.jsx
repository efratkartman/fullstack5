// src/components/Home.jsx
// רכיב דף הבית של המשתמש

import React, { useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import '../css/Home.css';

/**
 * Home - רכיב דף הבית
 * מציג ברכה למשתמש ומידע כללי על המערכת
 */
const Home = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const { userId } = useParams();

  // בדיקה שהמשתמש מחובר ושה-ID תואם
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (user.id.toString() !== userId) {
        // אם ה-ID לא תואם, מפנה לדף הנכון
        navigate(`/users/${user.id}/home`);
      }
    }
  }, [user, userId, navigate, loading]);

  // מסך טעינה
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>טוען...</p>
      </div>
    );
  }

  // אם אין משתמש, לא מציג כלום (יפנה לדף התחברות)
  if (!user) {
    return null;
  }

  return (
    <div className="home-page">
      <div className="home-container">
        {/* ברכה למשתמש */}
        <div className="welcome-section">
          <h1 className="welcome-title" dir="rtl">
            👋 ברוך הבא, {user.name || user.username}
          </h1>
          <p className="welcome-subtitle">
            ברוך הבא למערכת ניהול המשתמשים האישית שלך
          </p>
        </div>

        {/* תפריט ראשי */}
        <div className="stats-section">
          <h2>בחר את הפעולה שברצונך לבצע</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>משימות</h3>
                <p>נהל את המשימות היומיות שלך</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <h3>פוסטים</h3>
                <p>כתוב ושתף את המחשבות שלך</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📸</div>
              <div className="stat-content">
                <h3>אלבומים</h3>
                <p>אחסן וארגן את התמונות שלך</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">ℹ️</div>
              <div className="stat-content">
                <h3>מידע אישי</h3>
                <p>צפה ועדכן את הפרטים שלך</p>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default Home;