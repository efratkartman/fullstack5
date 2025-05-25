// src/components/NavBar.jsx
// רכיב תפריט הניווט העליון

import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import '../css/NavBar.css';

/**
 * NavBar - רכיב תפריט הניווט
 * מציג קישורים לדפים שונים רק כשהמשתמש מחובר
 * כולל כפתור התנתקות
 */
const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * מטפל בהתנתקות
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /**
   * בודק אם הקישור הנוכחי פעיל
   */
  const isActive = (path) => {
    return location.pathname === path;
  };

  // אם אין משתמש מחובר, לא מציג תפריט
  if (!user) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* לוגו/קישור בית */}
        <div className="navbar-logo">
          <Link 
            to={`/users/${user.id}/home`}
            className="logo-link"
          >
            📱 המערכת שלי
          </Link>
        </div>

        {/* קישורי ניווט */}
        <div className="navbar-links">
          <Link 
            to={`/users/${user.id}/info`}
            className={`nav-link ${isActive(`/users/${user.id}/info`) ? 'active' : ''}`}
          >
            ℹ️ מידע אישי
          </Link>
          
          <Link 
            to={`/users/${user.id}/todos`}
            className={`nav-link ${isActive(`/users/${user.id}/todos`) ? 'active' : ''}`}
          >
            ✅ משימות
          </Link>
          
          <Link 
            to={`/users/${user.id}/posts`}
            className={`nav-link ${isActive(`/users/${user.id}/posts`) ? 'active' : ''}`}
          >
            📝 פוסטים
          </Link>
          
          <Link 
            to={`/users/${user.id}/albums`}
            className={`nav-link ${isActive(`/users/${user.id}/albums`) ? 'active' : ''}`}
          >
            📸 אלבומים
          </Link>
        </div>

        {/* פרטי משתמש והתנתקות */}
        <div className="navbar-user">
          <span className="user-name">
            👋 שלום, {user.name || user.username}
          </span>
          <button 
            onClick={handleLogout}
            className="logout-button"
            title="התנתק מהמערכת"
          >
            🚪 התנתק
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;