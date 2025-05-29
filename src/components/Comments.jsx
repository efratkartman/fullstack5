

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Comment from './Comment';
import '../css/Comments.css';


const Comments = ({ postId, userId, onError }) => {
  // State ראשי
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State להוספת תגובה
  const [showAddForm, setShowAddForm] = useState(false);
  const [newComment, setNewComment] = useState({ name: '', email: '', body: '' });
  const [saving, setSaving] = useState(false);

 
  const COMMENTS_STORAGE_KEY = `comments_post_${postId}`;

  /**
   * טעינת תגובות - תחילה מ-cache, אחר כך מהשרת
   */
  const loadComments = async () => {
    try {
      // ניסיון טעינה מ-cache
      const cachedComments = localStorage.getItem(COMMENTS_STORAGE_KEY);
      if (cachedComments) {
        const parsedComments = JSON.parse(cachedComments);
        setComments(parsedComments);
        setLoading(false);
        console.log('Comments loaded from cache');
        return;
      }

      // טעינה מהשרת
      const response = await axios.get(`http://localhost:3000/comments?postId=${postId}`);
      const postComments = response.data;
      
      setComments(postComments);
      localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(postComments));
      console.log('Comments loaded from server and cached');

    } catch (err) {
      console.error('Error loading comments:', err);
      onError('שגיאה בטעינת התגובות');
    } finally {
      setLoading(false);
    }
  };

  /**
   * עדכון cache
   */
  const updateCommentsCache = (updatedComments) => {
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(updatedComments));
  };

  /**
   * הוספת תגובה חדשה
   */
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.name.trim() || !newComment.email.trim() || !newComment.body.trim()) return;

    setSaving(true);
    try {
      const commentData = {
        postId: parseInt(postId),
        name: newComment.name.trim(),
        email: newComment.email.trim(),
        body: newComment.body.trim(),
        userId: parseInt(userId) // זיהוי היוצר
      };

      const response = await axios.post('http://localhost:3000/comments', commentData);
      const addedComment = response.data;

      const updatedComments = [...comments, addedComment];
      setComments(updatedComments);
      updateCommentsCache(updatedComments);

      // איפוס הטופס
      setNewComment({ name: '', email: '', body: '' });
      setShowAddForm(false);
      console.log('Comment added successfully');

    } catch (err) {
      console.error('Error adding comment:', err);
      onError('שגיאה בהוספת התגובה');
    } finally {
      setSaving(false);
    }
  };

  /**
   * מחיקת תגובה (רק אם שייכת למשתמש)
   */
  const handleDeleteComment = async (commentId) => {
    const comment = comments.find(c => c.id.toString() === commentId.toString());
    
    if (comment.userId !== parseInt(userId)) {
      onError('אין לך הרשאה למחוק תגובה זו');
      return;
    }

    if (!window.confirm('האם אתה בטוח שברצונך למחוק את התגובה?')) return;

    try {
      await axios.delete(`http://localhost:3000/comments/${commentId}`);

      const updatedComments = comments.filter(c => c.id.toString() !== commentId.toString());
      setComments(updatedComments);
      updateCommentsCache(updatedComments);

      console.log('Comment deleted successfully');

    } catch (err) {
      console.error('Error deleting comment:', err);
      onError('שגיאה במחיקת התגובה');
    }
  };

  /**
   * עדכון תגובה (רק אם שייכת למשתמש)
   */
  const handleUpdateComment = async (commentId, updates) => {
    const comment = comments.find(c => c.id.toString() === commentId.toString());
    
    if (comment.userId !== parseInt(userId)) {
      onError('אין לך הרשאה לערוך תגובה זו');
      return;
    }

    try {
      const updatedCommentData = { ...comment, ...updates };
      const response = await axios.put(`http://localhost:3000/comments/${commentId}`, updatedCommentData);
      const updatedComment = response.data;

      const updatedComments = comments.map(c => 
        c.id.toString() === commentId.toString() ? updatedComment : c
      );
      setComments(updatedComments);
      updateCommentsCache(updatedComments);

      console.log('Comment updated successfully');

    } catch (err) {
      console.error('Error updating comment:', err);
      onError('שגיאה בעдכון התגובה');
    }
  };

  // טעינה ראשונית
  useEffect(() => {
    if (postId) {
      loadComments();
    }
  }, [postId]);

  // מסך טעינה
  if (loading) {
    return (
      <div className="comments-section">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>טוען תגובות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="comments-section">
      {/* כותרת תגובות */}
      <div className="comments-header">
        <h3>💬 תגובות ({comments.length})</h3>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="add-comment-btn"
          disabled={saving}
        >
          {showAddForm ? '❌ ביטול' : '➕ הוסף תגובה'}
        </button>
      </div>

      {/* טופס הוספת תגובה */}
      {showAddForm && (
        <div className="add-comment-form">
          <h4>➕ הוספת תגובה חדשה</h4>
          <form onSubmit={handleAddComment}>
            <div className="form-row">
              <div className="form-group">
                <label>השם שלך:</label>
                <input
                  type="text"
                  value={newComment.name}
                  onChange={(e) => setNewComment({...newComment, name: e.target.value})}
                  placeholder="הכנס את השם שלך"
                  required
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label>כתובת מייל:</label>
                <input
                  type="email"
                  value={newComment.email}
                  onChange={(e) => setNewComment({...newComment, email: e.target.value})}
                  placeholder="example@email.com"
                  required
                  disabled={saving}
                />
              </div>
            </div>
            <div className="form-group">
              <label>תוכן התגובה:</label>
              <textarea
                value={newComment.body}
                onChange={(e) => setNewComment({...newComment, body: e.target.value})}
                placeholder="כתוב את התגובה שלך..."
                required
                disabled={saving}
                rows="4"
              />
            </div>
            <div className="form-actions">
              <button 
                type="submit" 
                disabled={saving || !newComment.name.trim() || !newComment.email.trim() || !newComment.body.trim()}
                className="submit-btn"
              >
                {saving ? 'שומר...' : '💾 הוסף תגובה'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowAddForm(false);
                  setNewComment({ name: '', email: '', body: '' });
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

      {/* רשימת תגובות */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="empty-comments">
            <p>🤐 אין תגובות עדיין לפוסט זה</p>
            <button 
              onClick={() => setShowAddForm(true)} 
              className="add-first-comment-btn"
            >
              הוסף תגובה ראשונה
            </button>
          </div>
        ) : (
          comments.map(comment => (
            <Comment
              key={comment.id}
              comment={comment}
              currentUserId={parseInt(userId)}
              onUpdate={handleUpdateComment}
              onDelete={handleDeleteComment}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;