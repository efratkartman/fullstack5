
// Context לניהול מצב האימות בכל האפליקציה

import React, { createContext, useState, useEffect } from 'react';

// יצירת Context לאימות
const AuthContext = createContext();


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

 
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  /**
   * פונקציה להתנתקות משתמש
   */
  const logout = () => {
    if (!window.confirm('האם אתה בטוח שברצונך להתנתק?')) return;

    setUser(null);
    localStorage.removeItem('user');

    // מחיקת מידע איש י
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('todos_user_') ||
        key.startsWith('posts_user_') ||
        key.startsWith('albums_user_') ||
        key.startsWith('photos_album_') ||
        key.startsWith('photos_meta_') ||
        key.startsWith('comments_post_')) {
        localStorage.removeItem(key);
      }
    });


  };



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