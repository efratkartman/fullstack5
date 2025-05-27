// src/components/Album.jsx
// רכיב להצגת אלבום יחיד עם תמונות

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../contexts/AuthContext';
import Photos from './Photos';
import '../css/Album.css';

/**
 * Album - רכיב להצגת אלבום יחיד
 * מציג אלבום עם רשימת התמונות שלו
 * כולל אפשרויות ניהול האלבום והתמונות
 */
const Album = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { userId, albumId } = useParams();
  const navigate = useNavigate();
  
  // State ראשי
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State לעריכה
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [saving, setSaving] = useState(false);

  // מפתחות LocalStorage
  const ALBUMS_STORAGE_KEY = `albums_user_${userId}`;

  /**
   * טעינת אלבום ספציפי
   */
  const loadAlbum = async () => {
    try {
      // ניסיון טעינה מהcache תחילה
      const cachedAlbums = localStorage.getItem(ALBUMS_STORAGE_KEY);
      if (cachedAlbums) {
        const parsedAlbums = JSON.parse(cachedAlbums);
        const foundAlbum = parsedAlbums.find(a => a.id.toString() === albumId);
        
        if (foundAlbum) {
          setAlbum(foundAlbum);
          setEditTitle(foundAlbum.title);
          setLoading(false);
          console.log('Album loaded from cache');
          return;
        }
      }

      // טעינה מהשרת אם לא נמצא ב-cache
      const response = await axios.get(`http://localhost:3000/albums/${albumId}`);
      const loadedAlbum = response.data;
      
      // בדיקה שהאלבום שייך למשתמש
      if (loadedAlbum.userId.toString() !== userId) {
        setError('אין לך הרשאה לצפות באלבום זה');
        return;
      }
      
      setAlbum(loadedAlbum);
      setEditTitle(loadedAlbum.title);
      console.log('Album loaded from server');

    } catch (err) {
      console.error('Error loading album:', err);
      if (err.response?.status === 404) {
        setError('האלבום לא נמצא');
      } else {
        setError('שגיאה בטעינת האלבום');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * עדכון אלבום
   */
  const handleUpdateAlbum = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    setSaving(true);
    try {
      const updatedAlbumData = {
        ...album,
        title: editTitle.trim()
      };

      const response = await axios.put(`http://localhost:3000/albums/${albumId}`, updatedAlbumData);
      const updatedAlbum = response.data;

      setAlbum(updatedAlbum);
      setEditing(false);

      // עדכון ה-cache
      const cachedAlbums = localStorage.getItem(ALBUMS_STORAGE_KEY);
      if (cachedAlbums) {
        const parsedAlbums = JSON.parse(cachedAlbums);
        const updatedAlbums = parsedAlbums.map(a => 
          a.id.toString() === albumId ? updatedAlbum : a
        );
        localStorage.setItem(ALBUMS_STORAGE_KEY, JSON.stringify(updatedAlbums));
      }

      console.log('Album updated successfully');

    } catch (err) {
      console.error('Error updating album:', err);
      setError('שגיאה בעדכון האלבום');
    } finally {
      setSaving(false);
    }
  };

  /**
   * מחיקת אלבום
   */
  const handleDeleteAlbum = async () => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את האלבום? כל התמונות באלבום יימחקו גם כן! פעולה זו לא ניתנת לביטול.')) return;

    try {
      // מחיקת כל התמונות באלבום תחילה
      const photosResponse = await axios.get(`http://localhost:3000/photos?albumId=${albumId}`);
      const albumPhotos = photosResponse.data;
      
      for (const photo of albumPhotos) {
        await axios.delete(`http://localhost:3000/photos/${photo.id}`);
      }

      // מחיקת האלבום
      await axios.delete(`http://localhost:3000/albums/${albumId}`);

      // עדכון ה-cache
      const cachedAlbums = localStorage.getItem(ALBUMS_STORAGE_KEY);
      if (cachedAlbums) {
        const parsedAlbums = JSON.parse(cachedAlbums);
        const updatedAlbums = parsedAlbums.filter(a => a.id.toString() !== albumId);
        localStorage.setItem(ALBUMS_STORAGE_KEY, JSON.stringify(updatedAlbums));
      }

      // ניקוי cache של תמונות האלבום
      localStorage.removeItem(`photos_album_${albumId}`);

      // חזרה לרשימת האלבומים
      navigate(`/users/${userId}/albums`);
      console.log('Album and photos deleted successfully');

    } catch (err) {
      console.error('Error deleting album:', err);
      setError('שגיאה במחיקת האלבום');
    }
  };

  /**
   * חזרה לרשימת אלבומים
   */
  const handleBackToAlbums = () => {
    navigate(`/users/${userId}/albums`);
  };

  // טעינה ראשונית
  useEffect(() => {
    if (!authLoading && user && user.id.toString() === userId) {
      loadAlbum();
    }
  }, [user, userId, albumId, authLoading]);

  // מסך טעינה
  if (authLoading || loading) {
    return (
      <div className="album-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>טוען אלבום...</p>
        </div>
      </div>
    );
  }

  // שגיאת הרשאות
  if (!user || user.id.toString() !== userId) {
    return (
      <div className="album-page">
        <div className="error-container">
          <h2>שגיאת הרשאה</h2>
          <p>אין לך הרשאה לצפות באלבום זה</p>
          <button onClick={handleBackToAlbums} className="back-btn">
            חזור לאלבומים
          </button>
        </div>
      </div>
    );
  }

  // שגיאה או אלבום לא נמצא
  if (error || !album) {
    return (
      <div className="album-page">
        <div className="error-container">
          <h2>שגיאה</h2>
          <p>{error || 'האלבום לא נמצא'}</p>
          <button onClick={handleBackToAlbums} className="back-btn">
            חזור לאלבומים
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="album-page">
      <div className="album-container">
        {/* כותרת עם breadcrumb */}
        <div className="album-header">
          <div className="breadcrumb">
            <button onClick={handleBackToAlbums} className="breadcrumb-link">
              📸 האלבומים שלי
            </button>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">אלבום #{albumId}</span>
          </div>
          
          <div className="album-actions-header">
            <button 
              onClick={() => setEditing(!editing)}
              className="edit-btn"
              disabled={saving}
            >
              {editing ? '❌ ביטול עריכה' : '✏️ ערוך אלבום'}
            </button>
            <button 
              onClick={handleDeleteAlbum}
              className="delete-btn"
              disabled={saving}
            >
              🗑️ מחק אלבום
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

        {/* תוכן האלבום */}
        <div className="album-content">
          {editing ? (
            // מצב עריכה
            <div className="edit-album-form">
              <h2>✏️ עריכת אלבום</h2>
              <form onSubmit={handleUpdateAlbum}>
                <div className="form-group">
                  <label>שם האלבום:</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="שם האלבום"
                    required
                    disabled={saving}
                    autoFocus
                  />
                </div>
                <div className="form-actions">
                  <button 
                    type="submit" 
                    disabled={saving || !editTitle.trim()}
                    className="save-btn"
                  >
                    {saving ? 'שומר...' : '💾 שמור שינויים'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditing(false);
                      setEditTitle(album.title);
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
            <div className="album-display">
              <div className="album-info">
                <div className="album-meta">
                  <span className="album-id">אלבום #{album.id}</span>
                  <span className="album-date">
                    {new Date().toLocaleDateString('he-IL')}
                  </span>
                </div>
                
                <h1 className="album-title">{album.title}</h1>
                <p className="album-description">
                  אלבום התמונות שלך - צפה בתמונות, הוסף תמונות חדשות ונהל את האוסף שלך
                </p>
              </div>
            </div>
          )}
        </div>

        {/* רכיב תמונות */}
        {!editing && (
          <Photos 
            albumId={albumId} 
            userId={userId}
            albumTitle={album.title}
            onError={setError}
          />
        )}
      </div>
    </div>
  );
};

export default Album;