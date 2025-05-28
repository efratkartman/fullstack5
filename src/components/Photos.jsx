// src/components/Photos.jsx
// רכיב ניהול תמונות עם Smart Caching + Lazy Loading

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Photo from './Photo';
import '../css/Photos.css';

/**
 * Photos - רכיב ניהול תמונות עם caching חכם
 * מביא תמונות בשלבים מהשרת ושומר ב-cache
 * בפעמים הבאות מנסה קודם מה-cache
 */
const Photos = ({ albumId, userId, albumTitle, onError }) => {
  // State ראשי
  const [photos, setPhotos] = useState([]); // תמונות מוצגות כרגע
  const [cachedPhotos, setCachedPhotos] = useState([]); // תמונות שמורות ב-cache
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // State להצגה בשלבים
  const [currentPage, setCurrentPage] = useState(1);
  const [photosPerPage] = useState(9); // 3x3 = 9 תמונות בכל פעם
  const [hasMore, setHasMore] = useState(true);
  const [totalPhotosFromServer, setTotalPhotosFromServer] = useState(null);
  
  // State להוספת תמונה
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPhoto, setNewPhoto] = useState({ title: '', url: '', thumbnailUrl: '' });
  const [saving, setSaving] = useState(false);
  
  // State להגדלת תמונה
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showEnlarged, setShowEnlarged] = useState(false);

  // מפתחות LocalStorage
  const PHOTOS_STORAGE_KEY = `photos_album_${albumId}`;
  const PHOTOS_META_KEY = `photos_meta_${albumId}`;

  /**
   * טעינת cache מ-LocalStorage
   */
  const loadFromCache = () => {
    try {
      const cachedData = localStorage.getItem(PHOTOS_STORAGE_KEY);
      const cachedMeta = localStorage.getItem(PHOTOS_META_KEY);
      
      if (cachedData) {
        const parsedPhotos = JSON.parse(cachedData);
        setCachedPhotos(parsedPhotos);
        
        // הצג את העמוד הראשון מה-cache
        const firstPagePhotos = parsedPhotos.slice(0, photosPerPage);
        setPhotos(firstPagePhotos);
        
        // עדכן hasMore לפי מה שיש ב-cache
        if (cachedMeta) {
          const meta = JSON.parse(cachedMeta);
          setTotalPhotosFromServer(meta.totalFromServer || null);
          setHasMore(firstPagePhotos.length < parsedPhotos.length || (meta.totalFromServer && parsedPhotos.length < meta.totalFromServer));
        } else {
          setHasMore(firstPagePhotos.length < parsedPhotos.length);
        }
        
        console.log(`Photos loaded from cache: showing ${firstPagePhotos.length} out of ${parsedPhotos.length} cached photos`);
        return true;
      }
    } catch (err) {
      console.error('Error loading from cache:', err);
    }
    return false;
  };

  /**
   * שמירת תמונות ב-cache
   */
  const saveToCache = (photosToSave, totalFromServer = null) => {
    try {
      localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(photosToSave));
      
      const meta = {
        totalCached: photosToSave.length,
        totalFromServer: totalFromServer,
        lastUpdated: Date.now()
      };
      localStorage.setItem(PHOTOS_META_KEY, JSON.stringify(meta));
      
      console.log(`Saved ${photosToSave.length} photos to cache`);
    } catch (err) {
      console.error('Error saving to cache:', err);
    }
  };

  /**
   * טעינת תמונות מהשרת עם pagination + Duplicate Detection
   */
  const loadPhotosFromServer = async (page, isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true);
      else setLoadingMore(true);

      const startIndex = (page - 1) * photosPerPage;
      const response = await axios.get(
        `http://localhost:3000/photos?albumId=${albumId}&_start=${startIndex}&_limit=${photosPerPage}`
      );
      
      const newPhotos = response.data;
      console.log(`Loaded ${newPhotos.length} photos from server (page ${page})`);
      
      if (newPhotos.length === 0) {
        setHasMore(false);
        return [];
      }

      // אם זה העמוד הראשון וצריך לבדוק כמה תמונות יש בסך הכל
      if (page === 1 && totalPhotosFromServer === null) {
        try {
          const countResponse = await axios.get(`http://localhost:3000/photos?albumId=${albumId}`);
          setTotalPhotosFromServer(countResponse.data.length);
        } catch (err) {
          console.error('Error getting total count:', err);
        }
      }

      // הסרת duplicates - תמונות שכבר קיימות ב-cache
      const existingIds = new Set(cachedPhotos.map(photo => photo.id));
      const uniqueNewPhotos = newPhotos.filter(photo => !existingIds.has(photo.id));
      
      console.log(`Found ${uniqueNewPhotos.length} unique photos out of ${newPhotos.length} from server`);

      // עדכון ה-cache עם התמונות החדשות (רק הייחודיות)
      const updatedCache = isLoadMore ? [...cachedPhotos, ...uniqueNewPhotos] : uniqueNewPhotos;
      setCachedPhotos(updatedCache);
      saveToCache(updatedCache, totalPhotosFromServer);

      // בדיקה אם יש עוד תמונות (לפי התמונות המקוריות מהשרת)
      setHasMore(newPhotos.length === photosPerPage);

      return uniqueNewPhotos;

    } catch (err) {
      console.error('Error loading photos from server:', err);
      onError('שגיאה בטעינת התמונות');
      return [];
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  /**
   * טעינה ראשונית
   */
  const loadInitialPhotos = async () => {
    // נסה קודם מה-cache
    if (loadFromCache()) {
      setLoading(false);
      return;
    }

    // אם אין ב-cache, טען מהשרת
    const serverPhotos = await loadPhotosFromServer(1, false);
    if (serverPhotos.length > 0) {
      setPhotos(serverPhotos);
    }
  };

  /**
   * טעינת תמונות נוספות
   */
  const loadMorePhotos = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    const photosNeeded = (currentPage + 1) * photosPerPage;
    
    // בדוק אם יש מספיק תמונות ב-cache
    if (cachedPhotos.length >= photosNeeded) {
      // יש מספיק ב-cache - הצג מה-cache
      setLoadingMore(true);
      
      setTimeout(() => {
        const nextPhotos = cachedPhotos.slice(photos.length, photosNeeded);
        setPhotos(prev => [...prev, ...nextPhotos]);
        setCurrentPage(prev => prev + 1);
        
        // בדוק אם יש עוד תמונות (ב-cache או בשרת)
        const stillHasMore = cachedPhotos.length > photosNeeded || 
          (totalPhotosFromServer && cachedPhotos.length < totalPhotosFromServer);
        setHasMore(stillHasMore);
        
        setLoadingMore(false);
        console.log(`Showed ${nextPhotos.length} more photos from cache`);
      }, 300);
      
    } else {
      // אין מספיק ב-cache - טען מהשרת
      const nextPage = Math.floor(cachedPhotos.length / photosPerPage) + 1;
      const serverPhotos = await loadPhotosFromServer(nextPage, true);
      
      if (serverPhotos.length > 0) {
        // הצג את התמונות החדשות (רק הייחודיות שהתקבלו)
        setPhotos(prev => [...prev, ...serverPhotos]);
        setCurrentPage(prev => prev + 1);
      } else {
        // אם לא קיבלנו תמונות חדשות, אולי בגלל duplicates
        // נסה להציג מה שיש ב-cache עכשיו
        const availableFromCache = cachedPhotos.slice(photos.length, photosNeeded);
        if (availableFromCache.length > 0) {
          setPhotos(prev => [...prev, ...availableFromCache]);
          setCurrentPage(prev => prev + 1);
          console.log(`Showed ${availableFromCache.length} photos from cache after server returned duplicates`);
          
          // עדכן hasMore
          const stillHasMore = photos.length + availableFromCache.length < cachedPhotos.length ||
            (totalPhotosFromServer && cachedPhotos.length < totalPhotosFromServer);
          setHasMore(stillHasMore);
        } else {
          // באמת אין יותר תמונות
          setHasMore(false);
        }
      }
    }
  }, [cachedPhotos, photos.length, currentPage, photosPerPage, loadingMore, hasMore, totalPhotosFromServer]);

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

      // אפשרות 1: הוספה לתחילה + עדכון לוגיקה
      const updatedPhotos = [addedPhoto, ...photos];
      const updatedCache = [addedPhoto, ...cachedPhotos];
      
      setPhotos(updatedPhotos);
      setCachedPhotos(updatedCache);
      
      // עדכון הcache ב-LocalStorage
      saveToCache(updatedCache, totalPhotosFromServer ? totalPhotosFromServer + 1 : null);
      
      if (totalPhotosFromServer !== null) {
        setTotalPhotosFromServer(prev => prev + 1);
      }

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

      // עדכון ה-state והcache
      const updatedPhotos = photos.filter(photo => photo.id !== photoId);
      const updatedCache = cachedPhotos.filter(photo => photo.id !== photoId);
      
      setPhotos(updatedPhotos);
      setCachedPhotos(updatedCache);
      saveToCache(updatedCache, totalPhotosFromServer ? totalPhotosFromServer - 1 : null);
      
      if (totalPhotosFromServer !== null) {
        setTotalPhotosFromServer(prev => prev - 1);
      }

      console.log('Photo deleted successfully');

    } catch (err) {
      console.error('Error deleting photo:', err);
      onError('שגיאה במחיקת התמונה');
    }
  };

  /**
   * עדכון כותרת תמונה
   */
  const handleUpdatePhoto = async (photoId, newTitle) => {
    try {
      const photo = cachedPhotos.find(p => p.id === photoId);
      const updatedPhotoData = { ...photo, title: newTitle.trim() };

      const response = await axios.put(`http://localhost:3000/photos/${photoId}`, updatedPhotoData);
      const updatedPhoto = response.data;

      // עדכון ה-state והcache
      const updatedPhotos = photos.map(p => 
        p.id === photoId ? updatedPhoto : p
      );
      const updatedCache = cachedPhotos.map(p => 
        p.id === photoId ? updatedPhoto : p
      );
      
      setPhotos(updatedPhotos);
      setCachedPhotos(updatedCache);
      saveToCache(updatedCache, totalPhotosFromServer);

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
      setCachedPhotos([]);
      setHasMore(true);
      setTotalPhotosFromServer(null);
      loadInitialPhotos();
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

  const totalPhotosCount = totalPhotosFromServer || cachedPhotos.length;

  return (
    <div className="photos-section">
      {/* כותרת תמונות */}
      <div className="photos-header">
        <h3>🖼️ תמונות האלבום ({totalPhotosCount})</h3>
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
                  מוצגות {photos.length} מתוך {totalPhotosCount} תמונות
                  {cachedPhotos.length > photos.length && (
                    <small> (עוד {cachedPhotos.length - photos.length} שמורות ב-cache)</small>
                  )}
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