// src/components/Posts.jsx
// רכיב ניהול פוסטים - גרסה מעודכנת עם ניווט לעמוד נפרד

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../contexts/AuthContext';
import '../css/Posts.css';

/**
 * Posts - רכיב רשימת פוסטים
 * מציג רשימת פוסטים במצב סקירה עם אפשרויות חיפוש ועריכה
 * כאשר בוחרים פוסט, מנווט לעמוד נפרד
 */
const Posts = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { userId } = useParams();
  const navigate = useNavigate();
  
  // State ראשי
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State לחיפוש
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('title');
  
  // State להוספת/עריכת post
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [newPost, setNewPost] = useState({ title: '', body: '' });
  const [saving, setSaving] = useState(false);

  // מפתח LocalStorage
  const POSTS_STORAGE_KEY = `posts_user_${userId}`;

  /**
   * טעינת posts - תחילה מ-LocalStorage, אחר כך מהשרת
   */
  const loadPosts = async () => {
    try {
      // ניסיון טעינה מ-LocalStorage
      const cachedPosts = localStorage.getItem(POSTS_STORAGE_KEY);
      if (cachedPosts) {
        const parsedPosts = JSON.parse(cachedPosts);
        setPosts(parsedPosts);
        setLoading(false);
        console.log('Posts loaded from cache');
        return;
      }

      // טעינה מהשרת
      const response = await axios.get(`http://localhost:3000/posts?userId=${userId}`);
      const userPosts = response.data;
      
      setPosts(userPosts);
      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(userPosts));
      console.log('Posts loaded from server and cached');

    } catch (err) {
      console.error('Error loading posts:', err);
      setError('שגיאה בטעינת הפוסטים');
    } finally {
      setLoading(false);
    }
  };

  /**
   * עדכון LocalStorage
   */
  const updatePostsStorage = (updatedPosts) => {
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updatedPosts));
  };

  /**
   * הוספת post חדש
   */
  const handleAddPost = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.body.trim()) return;

    setSaving(true);
    try {
      const postData = {
        userId: parseInt(userId),
        title: newPost.title.trim(),
        body: newPost.body.trim()
      };

      const response = await axios.post('http://localhost:3000/posts', postData);
      const addedPost = response.data;

      const updatedPosts = [...posts, addedPost];
      setPosts(updatedPosts);
      updatePostsStorage(updatedPosts);

      setNewPost({ title: '', body: '' });
      setShowAddForm(false);
      console.log('Post added successfully');

    } catch (err) {
      console.error('Error adding post:', err);
      setError('שגיאה בהוספת הפוסט');
    } finally {
      setSaving(false);
    }
  };

  /**
   * מחיקת post
   */
  const handleDeletePost = async (postId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את הפוסט?')) return;

    try {
      await axios.delete(`http://localhost:3000/posts/${postId}`);

      const updatedPosts = posts.filter(post => post.id !== postId);
      setPosts(updatedPosts);
      updatePostsStorage(updatedPosts);

      console.log('Post deleted successfully');

    } catch (err) {
      console.error('Error deleting post:', err);
      setError('שגיאה במחיקת הפוסט');
    }
  };

  /**
   * עדכון post
   */
  const handleUpdatePost = async (postId, updates) => {
    try {
      const post = posts.find(p => p.id === postId);
      const updatedPostData = { ...post, ...updates };

      const response = await axios.put(`http://localhost:3000/posts/${postId}`, updatedPostData);
      const updatedPost = response.data;

      const updatedPosts = posts.map(p => 
        p.id === postId ? updatedPost : p
      );
      setPosts(updatedPosts);
      updatePostsStorage(updatedPosts);

      setEditingPost(null);
      console.log('Post updated successfully');

    } catch (err) {
      console.error('Error updating post:', err);
      setError('שגיאה בעדכון הפוסט');
    }
  };

  /**
   * ניווט לפוסט ספציפי (עמוד חדש)
   */
  const handleViewPost = (postId) => {
    navigate(`/users/${userId}/posts/${postId}`);
  };

  /**
   * סינון posts לפי חיפוש
   */
  const getFilteredPosts = (postsArray) => {
    if (!searchQuery) return postsArray;

    return postsArray.filter(post => {
      switch (searchCriteria) {
        case 'id':
          return post.id.toString().includes(searchQuery);
        case 'title':
          return post.title.toLowerCase().includes(searchQuery.toLowerCase());
        default:
          return true;
      }
    });
  };

  // טעינה ראשונית
  useEffect(() => {
    if (!authLoading && user && user.id.toString() === userId) {
      loadPosts();
    }
  }, [user, userId, authLoading]);

  // posts מסוננים
  const filteredPosts = getFilteredPosts(posts);

  // מסך טעינה
  if (authLoading || loading) {
    return (
      <div className="posts-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>טוען פוסטים...</p>
        </div>
      </div>
    );
  }

  // שגיאת הרשאות
  if (!user || user.id.toString() !== userId) {
    return (
      <div className="posts-page">
        <div className="error-container">
          <h2>שגיאת הרשאה</h2>
          <p>אין לך הרשאה לצפות בפוסטים אלה</p>
        </div>
      </div>
    );
  }

  return (
    <div className="posts-page">
      <div className="posts-container">
        {/* כותרת ראשית */}
        <div className="posts-header">
          <div className="header-content">
            <h1>📝 הפוסטים שלי</h1>
            <p>ניהול הפוסטים והתגובות שלך</p>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="add-post-btn"
            disabled={showAddForm}
          >
            ➕ הוסף פוסט
          </button>
        </div>

        {/* הודעות שגיאה */}
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError('')} className="close-error">✕</button>
          </div>
        )}

        {/* טופס הוספת פוסט */}
        {showAddForm && (
          <div className="add-post-form">
            <h3>➕ הוספת פוסט חדש</h3>
            <form onSubmit={handleAddPost}>
              <div className="form-group">
                <label>כותרת הפוסט:</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  placeholder="הכנס כותרת לפוסט..."
                  required
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label>תוכן הפוסט:</label>
                <textarea
                  value={newPost.body}
                  onChange={(e) => setNewPost({...newPost, body: e.target.value})}
                  placeholder="כתוב את תוכן הפוסט..."
                  required
                  disabled={saving}
                  rows="5"
                />
              </div>
              <div className="form-actions">
                <button type="submit" disabled={saving || !newPost.title.trim() || !newPost.body.trim()}>
                  {saving ? 'שומר...' : '💾 שמור פוסט'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddForm(false);
                    setNewPost({ title: '', body: '' });
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

        {/* כלי חיפוש */}
        <div className="search-controls">
          <label>🔍 חיפוש לפי:</label>
          <select 
            value={searchCriteria} 
            onChange={(e) => setSearchCriteria(e.target.value)}
          >
            <option value="id">מזהה</option>
            <option value="title">כותרת</option>
          </select>
          <input
            type="text"
            placeholder={`חפש לפי ${searchCriteria === 'id' ? 'מזהה' : 'כותרת'}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="clear-search"
            >
              ✕
            </button>
          )}
        </div>

        {/* סטטיסטיקות */}
        <div className="posts-stats">
          <div className="stat-item">
            <span className="stat-number">{posts.length}</span>
            <span className="stat-label">סה"כ פוסטים</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{filteredPosts.length}</span>
            <span className="stat-label">מוצגים</span>
          </div>
        </div>

        {/* רשימת פוסטים */}
        <div className="posts-list">
          {filteredPosts.length === 0 ? (
            <div className="empty-state">
              {searchQuery ? (
                <>
                  <p>🔍 לא נמצאו פוסטים התואמים לחיפוש</p>
                  <button onClick={() => setSearchQuery('')} className="clear-search-btn">
                    נקה חיפוש
                  </button>
                </>
              ) : (
                <>
                  <p>📝 אין לך פוסטים עדיין</p>
                  <button onClick={() => setShowAddForm(true)} className="add-first-post">
                    הוסף פוסט ראשון
                  </button>
                </>
              )}
            </div>
          ) : (
            filteredPosts.map(post => (
              <div key={post.id} className="post-item">
                <div className="post-preview" onClick={() => handleViewPost(post.id)}>
                  <div className="post-id">#{post.id}</div>
                  <div className="post-title">{post.title}</div>
                </div>
                <div className="post-actions">
                  <button
                    onClick={() => handleViewPost(post.id)}
                    className="view-btn"
                    title="צפה בפוסט המלא"
                  >
                    👁️ צפה
                  </button>
                  <button
                    onClick={() => setEditingPost(editingPost === post.id ? null : post.id)}
                    className="edit-btn"
                    title="עריכה מהירה"
                  >
                    ✏️ ערוך
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="delete-btn"
                    title="מחיקה"
                  >
                    🗑️ מחק
                  </button>
                </div>

                {/* טופס עריכה מהירה */}
                {editingPost === post.id && (
                  <div className="edit-form">
                    <h4>✏️ עריכה מהירה</h4>
                    <div className="form-group">
                      <label>כותרת:</label>
                      <input
                        type="text"
                        value={post.title}
                        onChange={(e) => {
                          const updatedPosts = posts.map(p => 
                            p.id === post.id ? {...p, title: e.target.value} : p
                          );
                          setPosts(updatedPosts);
                        }}
                        placeholder="כותרת הפוסט"
                      />
                    </div>
                    <div className="form-group">
                      <label>תוכן:</label>
                      <textarea
                        value={post.body}
                        onChange={(e) => {
                          const updatedPosts = posts.map(p => 
                            p.id === post.id ? {...p, body: e.target.value} : p
                          );
                          setPosts(updatedPosts);
                        }}
                        placeholder="תוכן הפוסט"
                        rows="3"
                      />
                    </div>
                    <div className="form-actions">
                      <button onClick={() => handleUpdatePost(post.id, { 
                        title: post.title, 
                        body: post.body 
                      })}>
                        💾 שמור שינויים
                      </button>
                      <button onClick={() => setEditingPost(null)} className="cancel-btn">
                        ❌ ביטול
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Posts;