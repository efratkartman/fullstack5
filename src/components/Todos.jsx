// src/components/Todos.jsx
// רכיב ניהול משימות - חלק ד

import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../contexts/AuthContext';
import '../css/Todos.css';

/**
 * Todos - רכיב ניהול משימות
 * מטפל בכל הפעולות על משימות לפי הדרישות:
 * - הצגת רשימת todos של המשתמש
 * - מיון לפי קריטריונים שונים
 * - חיפוש
 * - הוספה, מחיקה, עדכון תוכן ומצב
 * - שמירה חכמה ב-LocalStorage
 */
const Todos = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { userId } = useParams();
  
  // State ראשי
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State למיון וחיפוש
  const [sortBy, setSortBy] = useState('id');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('title');
  
  // State להוספת משימה
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTodo, setNewTodo] = useState({ title: '', completed: false });
  const [editingTodo, setEditingTodo] = useState(null);
  const [saving, setSaving] = useState(false);

  // מפתח LocalStorage למשימות
  const TODOS_STORAGE_KEY = `todos_user_${userId}`;

  /**
   * טעינת משימות - תחילה מ-LocalStorage, אחר כך מהשרת
   */
  const loadTodos = async () => {
    try {
      // ניסיון טעינה מ-LocalStorage תחילה
      const cachedTodos = localStorage.getItem(TODOS_STORAGE_KEY);
      if (cachedTodos) {
        const parsedTodos = JSON.parse(cachedTodos);
        setTodos(parsedTodos);
        setLoading(false);
        console.log('Todos loaded from cache');
        return;
      }

      // אם אין במטמון, טוען מהשרת רק את המשימות של המשתמש הספציפי
      const response = await axios.get(`http://localhost:3000/todos?userId=${userId}`);
      const userTodos = response.data;
      
      setTodos(userTodos);
      
      // שמירה ב-LocalStorage
      localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(userTodos));
      console.log('Todos loaded from server and cached');

    } catch (err) {
      console.error('Error loading todos:', err);
      setError('שגיאה בטעינת המשימות');
    } finally {
      setLoading(false);
    }
  };

  /**
   * עדכון LocalStorage
   */
  const updateLocalStorage = (updatedTodos) => {
    localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(updatedTodos));
  };

  /**
   * הוספת משימה חדשה
   */
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return;

    setSaving(true);
    try {
      const todoData = {
        userId: parseInt(userId),
        title: newTodo.title.trim(),
        completed: newTodo.completed
      };

      // שליחה לשרת
      const response = await axios.post('http://localhost:3000/todos', todoData);
      const addedTodo = response.data;

      // עדכון מקומי מיידי ללא הבאה מחדש מהשרת
      const updatedTodos = [...todos, addedTodo];
      setTodos(updatedTodos);
      updateLocalStorage(updatedTodos);

      // איפוס הטופס
      setNewTodo({ title: '', completed: false });
      setShowAddForm(false);

      console.log('Todo added successfully');

    } catch (err) {
      console.error('Error adding todo:', err);
      setError('שגיאה בהוספת המשימה');
    } finally {
      setSaving(false);
    }
  };

  /**
   * מחיקת משימה
   */
  const handleDeleteTodo = async (todoId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את המשימה?')) return;

    try {
      // מחיקה מהשרת
      await axios.delete(`http://localhost:3000/todos/${todoId}`);

      // עדכון מקומי מיידי
      const updatedTodos = todos.filter(todo => todo.id !== todoId);
      setTodos(updatedTodos);
      updateLocalStorage(updatedTodos);

      console.log('Todo deleted successfully');

    } catch (err) {
      console.error('Error deleting todo:', err);
      setError('שגיאה במחיקת המשימה');
    }
  };

  /**
   * עדכון משימה (תוכן או מצב)
   */
  const handleUpdateTodo = async (todoId, updates) => {
    try {
      const todo = todos.find(t => t.id === todoId);
      const updatedTodoData = { ...todo, ...updates };

      // עדכון בשרת
      const response = await axios.put(`http://localhost:3000/todos/${todoId}`, updatedTodoData);
      const updatedTodo = response.data;

      // עדכון מקומי מיידי
      const updatedTodos = todos.map(t => 
        t.id === todoId ? updatedTodo : t
      );
      setTodos(updatedTodos);
      updateLocalStorage(updatedTodos);

      setEditingTodo(null);
      console.log('Todo updated successfully');

    } catch (err) {
      console.error('Error updating todo:', err);
      setError('שגיאה בעדכון המשימה');
    }
  };

  /**
   * עדכון מצב השלמת משימה
   */
  const handleToggleComplete = (todoId) => {
    const todo = todos.find(t => t.id === todoId);
    handleUpdateTodo(todoId, { completed: !todo.completed });
  };

  /**
   * מיון משימות
   */
  const getSortedTodos = (todosArray) => {
    return [...todosArray].sort((a, b) => {
      switch (sortBy) {
        case 'id':
          return a.id - b.id;
        case 'title':
          return a.title.localeCompare(b.title, 'he');
        case 'completed':
          return a.completed - b.completed;
        default:
          return 0;
      }
    });
  };

  /**
   * סינון משימות לפי חיפוש
   */
  const getFilteredTodos = (todosArray) => {
    if (!searchQuery) return todosArray;

    return todosArray.filter(todo => {
      switch (searchCriteria) {
        case 'id':
          return todo.id.toString().includes(searchQuery);
        case 'title':
          return todo.title.toLowerCase().includes(searchQuery.toLowerCase());
        case 'completed':
          const isCompleted = searchQuery.toLowerCase() === 'הושלם' || 
                            searchQuery.toLowerCase() === 'completed' ||
                            searchQuery.toLowerCase() === 'true';
          const isNotCompleted = searchQuery.toLowerCase() === 'לא הושלם' || 
                                searchQuery.toLowerCase() === 'not completed' ||
                                searchQuery.toLowerCase() === 'false';
          if (isCompleted) return todo.completed;
          if (isNotCompleted) return !todo.completed;
          return false;
        default:
          return true;
      }
    });
  };

  // טעינה ראשונית
  useEffect(() => {
    if (!authLoading && user && user.id.toString() === userId) {
      loadTodos();
    }
  }, [user, userId, authLoading]);

  // משימות מעובדות (מיון + סינון)
  const processedTodos = getSortedTodos(getFilteredTodos(todos));

  // מסך טעינה
  if (authLoading || loading) {
    return (
      <div className="todos-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>טוען משימות...</p>
        </div>
      </div>
    );
  }

  // שגיאת הרשאות
  if (!user || user.id.toString() !== userId) {
    return (
      <div className="todos-page">
        <div className="error-container">
          <h2>שגיאת הרשאה</h2>
          <p>אין לך הרשאה לצפות במשימות אלה</p>
        </div>
      </div>
    );
  }

  return (
    <div className="todos-page">
      <div className="todos-container">
        {/* כותרת וכפתור הוספה */}
        <div className="todos-header">
          <div className="header-content">
            <h1>📋 המשימות שלי</h1>
            <p>ניהול המשימות היומיות שלך</p>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="add-todo-btn"
            disabled={showAddForm}
          >
            ➕ הוסף משימה
          </button>
        </div>

        {/* הודעות שגיאה */}
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError('')} className="close-error">✕</button>
          </div>
        )}

        {/* טופס הוספת משימה */}
        {showAddForm && (
          <div className="add-todo-form">
            <h3>➕ הוספת משימה חדשה</h3>
            <form onSubmit={handleAddTodo}>
              <div className="form-group">
                <input
                  type="text"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
                  placeholder="כתוב את המשימה החדשה..."
                  required
                  disabled={saving}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newTodo.completed}
                    onChange={(e) => setNewTodo({...newTodo, completed: e.target.checked})}
                    disabled={saving}
                  />
                  <span>משימה הושלמה</span>
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" disabled={saving || !newTodo.title.trim()}>
                  {saving ? 'שומר...' : '💾 שמור'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddForm(false);
                    setNewTodo({ title: '', completed: false });
                  }}
                  disabled={saving}
                  className="cancel-btn"
                >
                  ❌ ביטול
                </button>
              </div>
            </form>
          </div>
        )}

        {/* כלי בקרה - מיון וחיפוש */}
        <div className="todos-controls">
          <div className="sort-controls">
            <label>📊 מיון לפי:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="id">מזהה</option>
              <option value="title">כותרת</option>
              <option value="completed">מצב ביצוע</option>
            </select>
          </div>

          <div className="search-controls">
            <label>🔍 חיפוש לפי:</label>
            <select 
              value={searchCriteria} 
              onChange={(e) => setSearchCriteria(e.target.value)}
            >
              <option value="id">מזהה</option>
              <option value="title">כותרת</option>
              <option value="completed">מצב ביצוע</option>
            </select>
            <input
              type="text"
              placeholder={`חפש לפי ${searchCriteria === 'id' ? 'מזהה' : 
                          searchCriteria === 'title' ? 'כותרת' : 'מצב (הושלם/לא הושלם)'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="clear-search"
                title="נקה חיפוש"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* סטטיסטיקות */}
        <div className="todos-stats">
          <div className="stat-item">
            <span className="stat-number">{todos.length}</span>
            <span className="stat-label">סה"כ משימות</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{todos.filter(t => t.completed).length}</span>
            <span className="stat-label">הושלמו</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{todos.filter(t => !t.completed).length}</span>
            <span className="stat-label">לא הושלמו</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{processedTodos.length}</span>
            <span className="stat-label">מוצגות</span>
          </div>
        </div>

        {/* רשימת משימות */}
        <div className="todos-list">
          {processedTodos.length === 0 ? (
            <div className="empty-state">
              {searchQuery ? (
                <>
                  <p>🔍 לא נמצאו משימות התואמות לחיפוש</p>
                  <button onClick={() => setSearchQuery('')} className="clear-search-btn">
                    נקה חיפוש
                  </button>
                </>
              ) : (
                <>
                  <p>📝 אין לך משימות עדיין</p>
                  <button onClick={() => setShowAddForm(true)} className="add-first-todo">
                    הוסף משימה ראשונה
                  </button>
                </>
              )}
            </div>
          ) : (
            processedTodos.map(todo => (
              <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                <div className="todo-main">
                  <div className="todo-checkbox">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleComplete(todo.id)}
                      id={`todo-${todo.id}`}
                    />
                    <label htmlFor={`todo-${todo.id}`} className="custom-checkbox"></label>
                  </div>

                  <div className="todo-content">
                    <div className="todo-id">#{todo.id}</div>
                    {editingTodo === todo.id ? (
                      <input
                        type="text"
                        value={todo.title}
                        onChange={(e) => {
                          const updatedTodos = todos.map(t => 
                            t.id === todo.id ? {...t, title: e.target.value} : t
                          );
                          setTodos(updatedTodos);
                        }}
                        onBlur={() => handleUpdateTodo(todo.id, { title: todo.title })}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateTodo(todo.id, { title: todo.title });
                          }
                        }}
                        className="edit-input"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="todo-title"
                        onDoubleClick={() => setEditingTodo(todo.id)}
                        title="לחץ פעמיים לעריכה"
                      >
                        {todo.title}
                      </div>
                    )}
                  </div>
                </div>

                <div className="todo-actions">
                  <button
                    onClick={() => setEditingTodo(editingTodo === todo.id ? null : todo.id)}
                    className="edit-btn"
                    title="עריכת טקסט"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="delete-btn"
                    title="מחיקת משימה"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Todos;