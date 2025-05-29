

import React, { useState } from 'react';
import '../css/Photo.css';

/**
 * Photo - רכיב תמונה בודדת
 * מציג תמונה עם אפשרויות עריכת כותרת ומחיקה
 *  הכל באותו עמוד
 */

const Photo = ({ photo, onUpdate, onDelete, onEnlarge }) => {
  // State לעריכה
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(photo.title);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleSaveEdit = () => {
    if (!editTitle.trim()) {
      return;
    }

    onUpdate(photo.id, editTitle);
    setEditing(false);
  };

  /**
   * ביטול עריכה
   */
  const handleCancelEdit = () => {
    setEditTitle(photo.title);
    setEditing(false);
  };

  /**
   * מחיקת תמונה
   */
  const handleDelete = () => {
    onDelete(photo.id);
  };

  /**
   * טיפול בשגיאת טעינת תמונה
   */
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  /**
   * טיפול בהצלחת טעינת תמונה
   */
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  return (
    <div className="photo-item">
      {/* תמונה */}
      <div className="photo-container" onClick={() => onEnlarge(photo)}>
        {!imageLoaded && (
          <div className="photo-placeholder">
            <div className="placeholder-spinner"></div>
            <p>טוען תמונה...</p>
          </div>
        )}
        
        {imageError ? (
          <div className="photo-error">
            <div className="error-icon">🖼️</div>
            <p>שגיאה בטעינת התמונה</p>
          </div>
        ) : (
          <img
            src={photo.thumbnailUrl || photo.url}
            alt={photo.title}
            className={`photo-image ${imageLoaded ? 'loaded' : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        )}
        
        <div className="photo-overlay">
          <div className="photo-id">#{photo.id}</div>
          <div className="photo-enlarge-hint">🔍 לחץ להגדלה</div>
        </div>
      </div>
      
      {/* מידע ופעולות */}
      <div className="photo-info">
        {editing ? (
          // מצב עריכה
          <div className="photo-edit-section">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="כותרת התמונה"
              className="edit-title-input"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSaveEdit();
                }
              }}
            />
            <div className="edit-actions">
              <button 
                onClick={handleSaveEdit}
                className="save-btn"
                disabled={!editTitle.trim()}
              >
                💾
              </button>
              <button 
                onClick={handleCancelEdit}
                className="cancel-btn"
              >
                ❌
              </button>
            </div>
          </div>
        ) : (
          // מצב צפייה
          <>
            <h4 className="photo-title" title={photo.title}>
              {photo.title}
            </h4>
            
            <div className="photo-actions">
              <button 
                onClick={() => setEditing(true)}
                className="edit-btn"
                title="ערוך כותרת"
              >
                ✏️ ערוך
              </button>
              <button 
                onClick={handleDelete}
                className="delete-btn"
                title="מחק תמונה"
              >
                🗑️ מחק
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Photo;