
// Context לניהול מצב האימות בכל האפליקציה

import React, { createContext, useState, useEffect } from 'react';

// יצירת Context לאימות
const AuthContext = createContext();

/**
 * AuthProvider - רכיב שמספק את מצב האימות לכל האפליקציה
 * @param {Object} children - רכיבי הילדים שיקבלו גישה למצב האימות
 */
export const AuthProvider = ({ children }) => {
  // מצב המשתמש הנוכחי - מתחיל עם מה שנשמר ב-LocalStorage
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // בעת טעינת הרכיב, בודק אם יש משתמש שמור ב-LocalStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
      // אם יש שגיאה, מנקה את LocalStorage
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * פונקציה להתחברות משתמש
   * @param {Object} userData - נתוני המשתמש
   */
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  /**
   * פונקציה להתנתקות משתמש
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  /**
   * פונקציה לבדיקה אם המשתמש מחובר
   * @returns {boolean} האם המשתמש מחובר
   */
  const isAuthenticated = () => {
    return user !== null;
  };

  // הערכים שיהיו זמינים לכל רכיבי הילדים
  const value = {
    user,
    setUser,
    login,
    logout,
    isAuthenticated,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;