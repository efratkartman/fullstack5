// src/components/Info.jsx
// רכיב להצגת מידע אישי של המשתמש

import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import '../css/Info.css';

/**
 * Info - רכיב להצגת מידע אישי של המשתמש
 * מציג את כל הפרטים האישיים שנשמרו במערכת
 */
const Info = () => {
  const { user, loading } = useContext(AuthContext);
  const { userId } = useParams();

  // מסך טעינה
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>טוען מידע...</p>
      </div>
    );
  }

  // אם אין משתמש או ID לא תואם
  if (!user || user.id.toString() !== userId) {
    return (
      <div className="error-container">
        <h2>שגיאה</h2>
        <p>לא ניתן לטעון את המידע האישי</p>
      </div>
    );
  }

  return (
    <div className="info-page">
      <div className="info-container">
        {/* כותרת */}
        <div className="info-header">
          <h1>המידע האישי שלי</h1>
        </div>

        {/* כרטיסי מידע */}
        <div className="info-cards">
          {/* פרטים בסיסיים */}
          <div className="info-card">
            <div className="card-header">
              <h2>👤 פרטים אישיים</h2>
            </div>
            <div className="card-content">
              <div className="info-item">
                <span className="label">שם מלא:</span>
                <span className="value">{user.name || 'לא צוין'}</span>
              </div>
              <div className="info-item">
                <span className="label">שם משתמש:</span>
                <span className="value">{user.username}</span>
              </div>
              <div className="info-item">
                <span className="label">כתובת מייל:</span>
                <span className="value">{user.email || 'לא צוין'}</span>
              </div>
              <div className="info-item">
                <span className="label">טלפון:</span>
                <span className="value">{user.phone || 'לא צוין'}</span>
              </div>
              <div className="info-item">
                <span className="label">אתר אישי:</span>
                <span className="value">
                  {user.website ? (
                    <a href={`http://${user.website}`} target="_blank" rel="noopener noreferrer">
                      {user.website}
                    </a>
                  ) : (
                    'לא צוין'
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* כתובת */}
          <div className="info-card">
            <div className="card-header">
              <h2>🏠 כתובת</h2>
            </div>
            <div className="card-content">
              {user.address ? (
                <>
                  <div className="info-item">
                    <span className="label">רחוב:</span>
                    <span className="value">
                      {user.address.street} {user.address.suite}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">עיר:</span>
                    <span className="value">{user.address.city || 'לא צוין'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">מיקוד:</span>
                    <span className="value">{user.address.zipcode || 'לא צוין'}</span>
                  </div>
                  {user.address.geo && (user.address.geo.lat || user.address.geo.lng) && (
                    <div className="info-item">
                      <span className="label">קואורדינטות:</span>
                      <span className="value">
                        {user.address.geo.lat}, {user.address.geo.lng}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <p className="no-data">לא צוינה כתובת</p>
              )}
            </div>
          </div>

          {/* פרטי חברה */}
          <div className="info-card">
            <div className="card-header">
              <h2>🏢 פרטי חברה</h2>
            </div>
            <div className="card-content">
              {user.company && (user.company.name || user.company.catchPhrase || user.company.bs) ? (
                <>
                  <div className="info-item">
                    <span className="label">שם החברה:</span>
                    <span className="value">{user.company.name || 'לא צוין'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">סלוגן:</span>
                    <span className="value">{user.company.catchPhrase || 'לא צוין'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">תחום עסקי:</span>
                    <span className="value">{user.company.bs || 'לא צוין'}</span>
                  </div>
                </>
              ) : (
                <p className="no-data">לא צוינו פרטי חברה</p>
              )}
            </div>
          </div>

          
          </div>
        </div>
      </div>
  );
};

export default Info;