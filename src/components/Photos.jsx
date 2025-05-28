// src/components/Photos.jsx
// רכיב ניהול תמונות עם lazy loading אמיתי

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Photo from './Photo';
import '../css/Photos.css';

/**
 * Photos - רכיב ניהול תמונות
 * מציג תמונות עם lazy loading אמיתי (קריאות נפרדות לשרת)
 * כולל הוספה, מחיקה ועדכון תמונות
 */
const Photos = ({ albumId, userId, albumTitle, onError }) => {
  // State ראשי
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // State להצגה בשלבים
  const [currentPage, setCurrentPage] = useState(1);
  const [photosPerPage] = useState(9); // 3x3 = 9 תמונות בכל עמוד
  const [hasMore, setHasMore] = useState(true);
  const [totalPhotos, setTotalPhotos] = useState(0);
  
  // State להוספת תמונה
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPhoto, setNewPhoto] = useState({ title: '', url: '', thumbnailUrl: '' });
  const [saving, setSaving] = useState(false);
  
  // State להגדלת תמונה
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showEnlarged, setShowEnlarged] = useState(false);

  /**
   * טעינת תמונות מהשרת עם pagination אמיתי
   */
  const loadPhotos = async (page = 1, isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true);
      else setLoadingMore(true);

      // קריאה לשרת עם pagination - _start ו-_limit במקום _page
      const startIndex = (page - 1) * photosPerPage;
      const response = await axios.get(
        `http://localhost:3000/photos?albumId=${albumId}&_start=${startIndex}&_limit=${photosPerPage}`
      );
      
      const newPhotos = response.data;
      
      // קבלת המספר הכולל של תמונות (רק בטעינה ראשונית)
      let total = totalPhotos;
      if (page === 1) {
        const countResponse = await axios.get(`http://localhost:3000/photos?albumId=${albumId}`);
        total = countResponse.data.length;
        setTotalPhotos(total);
      }

      if (isLoadMore) {
        // הוספה לתמונות הקיימות
        const updatedPhotos = [...photos, ...newPhotos];
        setPhotos(updatedPhotos);
        
        // בדיקה אם יש עוד תמונות
        const stillHasMore = updatedPhotos.length < total && newPhotos.length === photosPerPage;
        setHasMore(stillHasMore);
        
        console.log(`Loaded ${newPhotos.length} photos from server (page ${page})`);
        console.log(`Current total: ${updatedPhotos.length}/${total}, hasMore: ${stillHasMore}`);
      } else {
        // החלפת התמונות (טעינה ראשונית)
        setPhotos(newPhotos);
        
        // בדיקה אם יש עוד תמונות
        const stillHasMore = newPhotos.length < total && newPhotos.length === photosPerPage;
        setHasMore(stillHasMore);
        
        console.log(`Initial load: ${newPhotos.length} photos from server`);
        console.log(`Current total: ${newPhotos.length}/${total}, hasMore: ${stillHasMore}`);
      }

    } catch (err) {
      console.error('Error loading photos:', err);
      onError('שגיאה בטעינת התמונות');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  /**
   * טעינת תמונות נוספות
   */
  const loadMorePhotos = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await loadPhotos(nextPage, true);
  }, [currentPage, loadingMore, hasMore, albumId, photosPerPage, photos.length]); // הוספתי photos.length כתלות

  /**
   * הוספת תמונה חדשה
   */
  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!newPhoto.title.trim() || !newPhoto.url.trim()) return;

    setSaving(true);
    try {
      const photoData = {
        albumId: parseInt(albumId),
        title: newPhoto.title.trim(),
        url: newPhoto.url.trim(),
        thumbnailUrl: newPhoto.thumbnailUrl.trim() || newPhoto.url.trim()
      };

      const response = await axios.post('http://localhost:3000/photos', photoData);
      const addedPhoto = response.data;

      // הוספה לתחילת הרשימה
      setPhotos(prev => [addedPhoto, ...prev]);
      setTotalPhotos(prev => prev + 1);

      setNewPhoto({ title: '', url: '', thumbnailUrl: '' });
      setShowAddForm(false);
      console.log('Photo added successfully');

    } catch (err) {
      console.error('Error adding photo:', err);
      onError('שגיאה בהוספת התמונה');
    } finally {
      setSaving(false);
    }
  };

  /**
   * מחיקת תמונה
   */
  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את התמונה?')) return;

    try {
      await axios.delete(`http://localhost:3000/photos/${photoId}`);

      setPhotos(prev => prev.filter(photo => photo.id !== photoId));
      setTotalPhotos(prev => prev - 1);

      console.log('Photo deleted successfully');

    } catch (err) {
      console.error('Error deleting photo:', err);
      onError('שגיאה במחיקת התמונה');
    }
  };

  /**
   * עדכון כותרת תמונה (רק כותרת!)
   */
  const handleUpdatePhoto = async (photoId, newTitle) => {
    try {
      const photo = photos.find(p => p.id === photoId);
      const updatedPhotoData = { ...photo, title: newTitle.trim() };

      const response = await axios.put(`http://localhost:3000/photos/${photoId}`, updatedPhotoData);
      const updatedPhoto = response.data;

      setPhotos(prev => prev.map(p => 
        p.id === photoId ? updatedPhoto : p
      ));

      console.log('Photo title updated successfully');

    } catch (err) {
      console.error('Error updating photo:', err);
      onError('שגיאה בעדכון התמונה');
    }
  };

  /**
   * פתיחת תמונה מוגדלת
   */
  const handleEnlargePhoto = (photo) => {
    setSelectedPhoto(photo);
    setShowEnlarged(true);
  };

  /**
   * סגירת תמונה מוגדלת
   */
  const handleCloseEnlarged = () => {
    setShowEnlarged(false);
    setSelectedPhoto(null);
  };

  // טעינה ראשונית
  useEffect(() => {
    if (albumId) {
      setCurrentPage(1);
      setPhotos([]);
      setHasMore(true);
      loadPhotos(1, false);
    }
  }, [albumId]);

  // מסך טעינה
  if (loading) {
    return (
      <div className="photos-section">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>טוען תמונות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="photos-section">
      {/* כותרת תמונות */}
      <div className="photos-header">
        <h3>🖼️ תמונות האלבום ({totalPhotos})</h3>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="add-photo-btn"
          disabled={saving}
        >
          {showAddForm ? '❌ ביטול' : '➕ הוסף תמונה'}
        </button>
      </div>

      {/* טופס הוספת תמונה */}
      {showAddForm && (
        <div className="add-photo-form">
          <h4>➕ הוספת תמונה חדשה</h4>
          <form onSubmit={handleAddPhoto}>
            <div className="form-group">
              <label>כותרת התמונה:</label>
              <input
                type="text"
                value={newPhoto.title}
                onChange={(e) => setNewPhoto({...newPhoto, title: e.target.value})}
                placeholder="הכנס כותרת לתמונה"
                required
                disabled={saving}
              />
            </div>
            <div className="form-group">
              <label>קישור לתמונה:</label>
              <input
                type="url"
                value={newPhoto.url}
                onChange={(e) => setNewPhoto({...newPhoto, url: e.target.value})}
                placeholder="https://example.com/image.jpg"
                required
                disabled={saving}
              />
            </div>
            <div className="form-group">
              <label>קישור לתמונה מוקטנת (אופציונלי):</label>
              <input
                type="url"
                value={newPhoto.thumbnailUrl}
                onChange={(e) => setNewPhoto({...newPhoto, thumbnailUrl: e.target.value})}
                placeholder="https://example.com/thumbnail.jpg"
                disabled={saving}
              />
            </div>
            <div className="form-actions">
              <button 
                type="submit" 
                disabled={saving || !newPhoto.title.trim() || !newPhoto.url.trim()}
                className="submit-btn"
              >
                {saving ? 'מוסיף...' : '🖼️ הוסף תמונה'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowAddForm(false);
                  setNewPhoto({ title: '', url: '', thumbnailUrl: '' });
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

      {/* גלריית תמונות */}
      <div className="photos-gallery">
        {photos.length === 0 ? (
          <div className="empty-photos">
            <p>🖼️ אין תמונות באלבום זה עדיין</p>
            <button 
              onClick={() => setShowAddForm(true)} 
              className="add-first-photo-btn"
            >
              הוסף תמונה ראשונה
            </button>
          </div>
        ) : (
          <>
            <div className="photos-grid-3x3">
              {photos.map((photo, index) => (
                <Photo
                  key={photo.id}
                  photo={photo}
                  onUpdate={handleUpdatePhoto}
                  onDelete={handleDeletePhoto}
                  onEnlarge={handleEnlargePhoto}
                />
              ))}
            </div>

            {/* כפתור טעינת עוד */}
            {hasMore && (
              <div className="load-more-section">
                <button 
                  onClick={loadMorePhotos}
                  className="load-more-btn"
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <div className="small-spinner"></div>
                      טוען עוד תמונות...
                    </>
                  ) : (
                    '📸 הצג עוד תמונות'
                  )}
                </button>
                <p className="photos-info">
                  מוצגות {photos.length} מתוך {totalPhotos} תמונות
                </p>
              </div>
            )}

            {/* הודעה שנגמרו התמונות */}
            {!hasMore && photos.length > 0 && (
              <div className="end-of-photos">
                <p>🎉 זהו זה! הצגת את כל התמונות באלבום</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* תמונה מוגדלת */}
      {showEnlarged && selectedPhoto && (
        <div className="photo-enlarged-overlay">
          <div className="photo-enlarged-container">
            <button onClick={handleCloseEnlarged} className="close-enlarged-btn">
              ✕
            </button>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title}
              className="enlarged-image"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Photos;