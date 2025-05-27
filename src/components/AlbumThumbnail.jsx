// src/components/AlbumThumbnail.jsx
// רכיב קולאז' של 3 תמונות ראשונות באלבום

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/AlbumThumbnail.css';

/**
 * AlbumThumbnail - רכיב קולאז' תמונות
 * מציג קולאז' ממוזער של 3 התמונות הראשונות באלבום
 * אם יש פחות מ-3 תמונות, מוסיף תמונות placeholder
 */
const AlbumThumbnail = ({ albumId }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  // מפתח cache
  const THUMBNAIL_CACHE_KEY = `album_thumbnail_${albumId}`;

  /**
   * טעינת 3 תמונות ראשונות מהאלבום
   */
  const loadThumbnails = async () => {
    try {
      // בדיקה ב-cache תחילה
      const cachedThumbs = localStorage.getItem(THUMBNAIL_CACHE_KEY);
      if (cachedThumbs) {
        const parsedThumbs = JSON.parse(cachedThumbs);
        setPhotos(parsedThumbs);
        setLoading(false);
        return;
      }

      // טעינה מהשרת - רק 3 תמונות ראשונות
      const response = await axios.get(`http://localhost:3000/photos?albumId=${albumId}&_limit=3`);
      const albumPhotos = response.data;
      
      setPhotos(albumPhotos);
      
      // שמירה ב-cache
      localStorage.setItem(THUMBNAIL_CACHE_KEY, JSON.stringify(albumPhotos));

    } catch (err) {
      console.error('Error loading album thumbnails:', err);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  // טעינה ראשונית
  useEffect(() => {
    if (albumId) {
      loadThumbnails();
    }
  }, [albumId]);

  /**
   * יצירת מערך של 3 תמונות (עם placeholders אם צריך)
   */
  const getThumbnailImages = () => {
    const images = [...photos];
    
    // הוספת placeholders עד 3 תמונות
    while (images.length < 3) {
      images.push({
        id: `placeholder-${images.length}`,
        thumbnailUrl: null,
        title: 'ללא תמונה',
        isPlaceholder: true
      });
    }
    
    return images.slice(0, 3);
  };

  const thumbnailImages = getThumbnailImages();

  if (loading) {
    return (
      <div className="album-thumbnail">
        <div className="thumbnail-loading">
          <div className="loading-spinner-small"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="album-thumbnail">
      <div className="thumbnail-collage">
        {thumbnailImages.map((photo, index) => (
          <div key={photo.id} className={`thumbnail-slot slot-${index + 1}`}>
            {photo.isPlaceholder ? (
              <div className="placeholder-image">
                <span className="placeholder-icon">📷</span>
              </div>
            ) : (
              <img
                src={photo.thumbnailUrl || photo.url}
                alt={photo.title}
                className="thumbnail-image"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="placeholder-image"><span class="placeholder-icon">📷</span></div>';
                }}
              />
            )}
          </div>
        ))}
      </div>
      <div className="album-overlay">
        <div className="album-id">#{albumId}</div>
        <div className="photos-count">{photos.length} תמונות</div>
      </div>
    </div>
  );
};

export default AlbumThumbnail;