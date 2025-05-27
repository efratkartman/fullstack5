// src/components/Post.jsx
// רכיב להצגת פוסט יחיד עם תגובות

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../contexts/AuthContext';
import Comments from './Comments';
import '../css/Post.css';

/**
 * Post - רכיב להצגת פוסט יחיד
 * מציג פוסט עם תוכן מלא, אפשרות עריכה ומחיקה
 * כולל רכיב תגובות מובנה
 */
const Post = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { userId, postId } = useParams();
  const navigate = useNavigate();
  
  // State ראשי
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State לעריכה
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', body: '' });
  const [saving, setSaving] = useState(false);
  
  // State לתגובות
  const [showComments, setShowComments] = useState(false);

  // מפתח LocalStorage
  const POSTS_STORAGE_KEY = `posts_user_${userId}`;

  /**
   * טעינת פוסט ספציפי
   */
  const loadPost = async () => {
    try {
      // ניסיון טעינה מהcache תחילה
      const cachedPosts = localStorage.getItem(POSTS_STORAGE_KEY);
      if (cachedPosts) {
        const parsedPosts = JSON.parse(cachedPosts);
        const foundPost = parsedPosts.find(p => p.id.toString() === postId);
        
        if (foundPost) {
          setPost(foundPost);
          setEditData({ title: foundPost.title, body: foundPost.body });
          setLoading(false);
          console.log('Post loaded from cache');
          return;
        }
      }

      // טעינה מהשרת אם לא נמצא ב-cache
      const response = await axios.get(`http://localhost:3000/posts/${postId}`);
      const loadedPost = response.data;
      
      // בדיקה שהפוסט שייך למשתמש
      if (loadedPost.userId.toString() !== userId) {
        setError('אין לך הרשאה לצפות בפוסט זה');
        return;
      }
      
      setPost(loadedPost);
      setEditData({ title: loadedPost.title, body: loadedPost.body });
      console.log('Post loaded from server');

    } catch (err) {
      console.error('Error loading post:', err);
      if (err.response?.status === 404) {
        setError('הפוסט לא נמצא');
      } else {
        setError('שגיאה בטעינת הפוסט');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * עדכון פוסט
   */
  const handleUpdatePost = async (e) => {
    e.preventDefault();
    if (!editData.title.trim() || !editData.body.trim()) return;

    setSaving(true);
    try {
      const updatedPostData = {
        ...post,
        title: editData.title.trim(),
        body: editData.body.trim()
      };

      const response = await axios.put(`http://localhost:3000/posts/${postId}`, updatedPostData);
      const updatedPost = response.data;

      setPost(updatedPost);
      setEditing(false);

      // עדכון ה-cache
      const cachedPosts = localStorage.getItem(POSTS_STORAGE_KEY);
      if (cachedPosts) {
        const parsedPosts = JSON.parse(cachedPosts);
        const updatedPosts = parsedPosts.map(p => 
          p.id.toString() === postId ? updatedPost : p
        );
        localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updatedPosts));
      }

      console.log('Post updated successfully');

    } catch (err) {
      console.error('Error updating post:', err);
      setError('שגיאה בעדכון הפוסט');
    } finally {
      setSaving(false);
    }
  };

  /**
   * מחיקת פוסט
   */
  const handleDeletePost = async () => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את הפוסט? פעולה זו לא ניתנת לביטול.')) return;

    try {
      await axios.delete(`http://localhost:3000/posts/${postId}`);

      // עדכון ה-cache
      const cachedPosts = localStorage.getItem(POSTS_STORAGE_KEY);
      if (cachedPosts) {
        const parsedPosts = JSON.parse(cachedPosts);
        const updatedPosts = parsedPosts.filter(p => p.id.toString() !== postId);
        localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updatedPosts));
      }

      // חזרה לרשימת הפוסטים
      navigate(`/users/${userId}/posts`);
      console.log('Post deleted successfully');

    } catch (err) {
      console.error('Error deleting post:', err);
      setError('שגיאה במחיקת הפוסט');
    }
  };

  /**
   * חזרה לרשימת פוסטים
   */
  const handleBackToPosts = () => {
    navigate(`/users/${userId}/posts`);
  };

  // טעינה ראשונית
  useEffect(() => {
    if (!authLoading && user && user.id.toString() === userId) {
      loadPost();
    }
  }, [user, userId, postId, authLoading]);

  // מסך טעינה
  if (authLoading || loading) {
    return (
      <div className="post-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>טוען פוסט...</p>
        </div>
      </div>
    );
  }

  // שגיאת הרשאות
  if (!user || user.id.toString() !== userId) {
    return (
      <div className="post-page">
        <div className="error-container">
          <h2>שגיאת הרשאה</h2>
          <p>אין לך הרשאה לצפות בפוסט זה</p>
          <button onClick={handleBackToPosts} className="back-btn">
            חזור לפוסטים
          </button>
        </div>
      </div>
    );
  }

  // שגיאה או פוסט לא נמצא
  if (error || !post) {
    return (
      <div className="post-page">
        <div className="error-container">
          <h2>שגיאה</h2>
          <p>{error || 'הפוסט לא נמצא'}</p>
          <button onClick={handleBackToPosts} className="back-btn">
            חזור לפוסטים
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="post-page">
      <div className="post-container">
        {/* כותרת עם breadcrumb */}
        <div className="post-header">
          <div className="breadcrumb">
            <button onClick={handleBackToPosts} className="breadcrumb-link">
              📝 הפוסטים שלי
            </button>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">פוסט #{postId}</span>
          </div>
          
          <div className="post-actions-header">
            <button 
              onClick={() => setEditing(!editing)}
              className="edit-btn"
              disabled={saving}
            >
              {editing ? '❌ ביטול עריכה' : '✏️ ערוך פוסט'}
            </button>
            <button 
              onClick={handleDeletePost}
              className="delete-btn"
              disabled={saving}
            >
              🗑️ מחק פוסט
            </button>
          </div>
        </div>

        {/* הודעות שגיאה */}
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError('')} className="close-error">✕</button>
          </div>
        )}

        {/* תוכן הפוסט */}
        <div className="post-content">
          {editing ? (
            // מצב עריכה
            <div className="edit-post-form">
              <h2>✏️ עריכת פוסט</h2>
              <form onSubmit={handleUpdatePost}>
                <div className="form-group">
                  <label>כותרת הפוסט:</label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({...editData, title: e.target.value})}
                    placeholder="כותרת הפוסט"
                    required
                    disabled={saving}
                  />
                </div>
                <div className="form-group">
                  <label>תוכן הפוסט:</label>
                  <textarea
                    value={editData.body}
                    onChange={(e) => setEditData({...editData, body: e.target.value})}
                    placeholder="תוכן הפוסט"
                    required
                    disabled={saving}
                    rows="8"
                  />
                </div>
                <div className="form-actions">
                  <button 
                    type="submit" 
                    disabled={saving || !editData.title.trim() || !editData.body.trim()}
                    className="save-btn"
                  >
                    {saving ? 'שומר...' : '💾 שמור שינויים'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditing(false);
                      setEditData({ title: post.title, body: post.body });
                    }}
                    disabled={saving}
                    className="cancel-btn"
                  >
                    ❌ ביטול
                  </button>
                </div>
              </form>
            </div>
          ) : (
            // מצב צפייה
            <div className="post-display">
              <div className="post-meta">
                <span className="post-id">פוסט #{post.id}</span>
                <span className="post-date">
                  {new Date().toLocaleDateString('he-IL')}
                </span>
              </div>
              
              <h1 className="post-title">{post.title}</h1>
              
              <div className="post-body">
                {post.body.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              
              {/* כפתור תגובות */}
              <div className="post-comments-toggle">
                <button 
                  onClick={() => setShowComments(!showComments)}
                  className="comments-toggle-btn"
                >
                  {showComments ? '🔼 הסתר תגובות' : '💬 הצג תגובות'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* רכיב תגובות */}
        {showComments && !editing && (
          <Comments 
            postId={postId} 
            userId={userId}
            onError={setError}
          />
        )}
      </div>
    </div>
  );
};

export default Post;