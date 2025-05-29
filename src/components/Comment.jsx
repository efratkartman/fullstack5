
// רכיב לתגובה בודדת

import React, { useState } from 'react';
import '../css/Comment.css';


const Comment = ({ comment, currentUserId, onUpdate, onDelete }) => {
  // State לעריכה
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: comment.name,
    email: comment.email,
    body: comment.body
  });


  const isOwner = comment.userId === currentUserId;

  
  const handleSaveEdit = () => {
    if (!editData.name.trim() || !editData.email.trim() || !editData.body.trim()) {
      return;
    }

    onUpdate(comment.id, {
      name: editData.name.trim(),
      email: editData.email.trim(),
      body: editData.body.trim()
    });
    
    setEditing(false);
  };

  /**
   * ביטול עריכה
   */
  const handleCancelEdit = () => {
    setEditData({
      name: comment.name,
      email: comment.email,
      body: comment.body
    });
    setEditing(false);
  };

  /**
   * מחיקת תגובה
   */
  const handleDelete = () => {
    onDelete(comment.id);
  };

  return (
    <div className={`comment-item ${isOwner ? 'owner-comment' : ''}`}>
      {editing ? (
        // מצב עריכה
        <div className="comment-edit-form">
          <div className="comment-header-edit">
            <h5>✏️ עריכת תגובה</h5>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>שם:</label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({...editData, name: e.target.value})}
                placeholder="השם שלך"
                required
              />
            </div>
            <div className="form-group">
              <label>מייל:</label>
              <input
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({...editData, email: e.target.value})}
                placeholder="כתובת מייל"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>תוכן התגובה:</label>
            <textarea
              value={editData.body}
              onChange={(e) => setEditData({...editData, body: e.target.value})}
              placeholder="תוכן התגובה"
              required
              rows="3"
            />
          </div>
          
          <div className="comment-actions">
            <button 
              onClick={handleSaveEdit}
              className="save-btn"
              disabled={!editData.name.trim() || !editData.email.trim() || !editData.body.trim()}
            >
              💾 שמור
            </button>
            <button 
              onClick={handleCancelEdit}
              className="cancel-btn"
            >
              ❌ ביטול
            </button>
          </div>
        </div>
      ) : (
        // מצב צפייה
        <div className="comment-display">
          <div className="comment-header">
            <div className="comment-author">
              <strong className="author-name">{comment.name}</strong>
              <span className="author-email">({comment.email})</span>
              {isOwner && (
                <span className="owner-badge">👤 שלך</span>
              )}
            </div>
            <div className="comment-meta">
              <span className="comment-id">#{comment.id}</span>
            </div>
          </div>
          
          <div className="comment-body">
            {comment.body}
          </div>
          
          {isOwner && (
            <div className="comment-actions">
              <button 
                onClick={() => setEditing(true)}
                className="edit-btn"
                title="ערוך תגובה"
              >
                ✏️ ערוך
              </button>
              <button 
                onClick={handleDelete}
                className="delete-btn"
                title="מחק תגובה"
              >
                🗑️ מחק
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Comment;