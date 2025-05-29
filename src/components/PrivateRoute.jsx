
// רכיב להגנה על דפים שדורשים התחברות

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  // אם עדיין טוען, מציג הודעת טעינה
  if (loading) {
    return (
      <div className="loading">
        <div>Loading...</div>
      </div>
    );
  }

  // אם המשתמש מחובר, מציג את התוכן המוגן
  // אחרת, מפנה לדף התחברות
  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;