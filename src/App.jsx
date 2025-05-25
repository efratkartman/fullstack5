// src/App.jsx
// הקובץ הראשי של האפליקציה - מעודכן עם רכיב Todos

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// ייבוא רכיבים
import NavBar from './components/NavBar';
import Login from './components/Login';
import Register from './components/Register';
import CompleteProfile from './components/CompleteProfile';
import Home from './components/Home';
import Info from './components/Info';
import Todos from './components/Todos';  // רכיב חדש
import PrivateRoute from './components/PrivateRoute';

// ייבוא עיצוב כללי
import './index.css';

/**
 * App - הרכיב הראשי של האפליקציה
 * מכיל את כל הניתוב, האימות והרכיבים הראשיים
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          {/* תפריט ניווט - יוצג רק כשמשתמש מחובר */}
          <NavBar />
          
          {/* תוכן ראשי */}
          <main className="main-content">
            <Routes>
              {/* דפים ציבוריים */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/completeProfile" element={<CompleteProfile />} />
              
              {/* דפים מוגנים - דורשים התחברות */}
              <Route 
                path="/users/:userId/home" 
                element={
                  <PrivateRoute>
                    <Home />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/users/:userId/info" 
                element={
                  <PrivateRoute>
                    <Info />
                  </PrivateRoute>
                } 
              />
              
              {/* רכיב המשימות - מוכן ופועל */}
              <Route 
                path="/users/:userId/todos" 
                element={
                  <PrivateRoute>
                    <Todos />
                  </PrivateRoute>
                } 
              />
              
              {/* דפים עתידיים - כרגע מפנים לבית */}
              <Route 
                path="/users/:userId/posts" 
                element={
                  <PrivateRoute>
                    <div className="coming-soon">
                      <h2>📝 דף הפוסטים</h2>
                      <p>בקרוב...</p>
                    </div>
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/users/:userId/albums" 
                element={
                  <PrivateRoute>
                    <div className="coming-soon">
                      <h2>📸 דף האלבומים</h2>
                      <p>בקרוב...</p>
                    </div>
                  </PrivateRoute>
                } 
              />
              
              {/* ברירת מחדל - הפניה לדף התחברות */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* דף 404 */}
              <Route 
                path="*" 
                element={
                  <div className="not-found">
                    <h2>🔍 הדף לא נמצא</h2>
                    <p>הדף שחיפשת אינו קיים</p>
                    <a href="/login">חזור לדף ההתחברות</a>
                  </div>
                } 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;