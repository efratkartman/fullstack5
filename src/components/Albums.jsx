// // src/components/Albums.jsx
// // רכיב ניהול אלבומים - חלק ו

// import React, { useState, useEffect, useContext } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import AuthContext from '../contexts/AuthContext';
// import '../css/Albums.css';

// /**
//  * Albums - רכיב רשימת אלבומים
//  * מציג רשימת אלבומים במצב סקירה עם אפשרויות חיפוש ועריכה
//  * כאשר בוחרים אלבום, מנווט לעמוד נפרד
//  */
// const Albums = () => {
//   const { user, loading: authLoading } = useContext(AuthContext);
//   const { userId } = useParams();
//   const navigate = useNavigate();
  
//   // State ראשי
//   const [albums, setAlbums] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
  
//   // State לחיפוש
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchCriteria, setSearchCriteria] = useState('title');
  
//   // State להוספת/עריכת album
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [editingAlbum, setEditingAlbum] = useState(null);
//   const [newAlbum, setNewAlbum] = useState({ title: '' });
//   const [saving, setSaving] = useState(false);

//   // מפתח LocalStorage
//   const ALBUMS_STORAGE_KEY = `albums_user_${userId}`;

//   /**
//    * טעינת albums - תחילה מ-LocalStorage, אחר כך מהשרת
//    */
//   const loadAlbums = async () => {
//     try {
//       // ניסיון טעינה מ-LocalStorage
//       const cachedAlbums = localStorage.getItem(ALBUMS_STORAGE_KEY);
//       if (cachedAlbums) {
//         const parsedAlbums = JSON.parse(cachedAlbums);
//         setAlbums(parsedAlbums);
//         setLoading(false);
//         console.log('Albums loaded from cache');
//         return;
//       }

//       // טעינה מהשרת
//       const response = await axios.get(`http://localhost:3000/albums?userId=${userId}`);
//       const userAlbums = response.data;
      
//       setAlbums(userAlbums);
//       localStorage.setItem(ALBUMS_STORAGE_KEY, JSON.stringify(userAlbums));
//       console.log('Albums loaded from server and cached');

//     } catch (err) {
//       console.error('Error loading albums:', err);
//       setError('שגיאה בטעינת האלבומים');
//     } finally {
//       setLoading(false);
//     }
//   };

//   /**
//    * עדכון LocalStorage
//    */
//   const updateAlbumsStorage = (updatedAlbums) => {
//     localStorage.setItem(ALBUMS_STORAGE_KEY, JSON.stringify(updatedAlbums));
//   };

//   /**
//    * הוספת album חדש
//    */
//   const handleAddAlbum = async (e) => {
//     e.preventDefault();
//     if (!newAlbum.title.trim()) return;

//     setSaving(true);
//     try {
//       const albumData = {
//         userId: parseInt(userId),
//         title: newAlbum.title.trim()
//       };

//       const response = await axios.post('http://localhost:3000/albums', albumData);
//       const addedAlbum = response.data;

//       const updatedAlbums = [...albums, addedAlbum];
//       setAlbums(updatedAlbums);
//       updateAlbumsStorage(updatedAlbums);

//       setNewAlbum({ title: '' });
//       setShowAddForm(false);
//       console.log('Album added successfully');

//     } catch (err) {
//       console.error('Error adding album:', err);
//       setError('שגיאה בהוספת האלבום');
//     } finally {
//       setSaving(false);
//     }
//   };

//   /**
//    * מחיקת album
//    */
//   const handleDeleteAlbum = async (albumId) => {
//     if (!window.confirm('האם אתה בטוח שברצונך למחוק את האלבום? כל התמונות באלבום יימחקו גם כן!')) return;

//     try {
//       // מחיקת האלבום
//       await axios.delete(`http://localhost:3000/albums/${albumId}`);
      
//       // מחיקת כל התמונות השייכות לאלבום
//       const photosResponse = await axios.get(`http://localhost:3000/photos?albumId=${albumId}`);
//       const albumPhotos = photosResponse.data;
      
//       // מחיקת כל תמונה
//       for (const photo of albumPhotos) {
//         await axios.delete(`http://localhost:3000/photos/${photo.id}`);
//       }

//       const updatedAlbums = albums.filter(album => album.id !== albumId);
//       setAlbums(updatedAlbums);
//       updateAlbumsStorage(updatedAlbums);

//       // ניקוי cache של תמונות האלבום
//       localStorage.removeItem(`photos_album_${albumId}`);

//       console.log('Album and photos deleted successfully');

//     } catch (err) {
//       console.error('Error deleting album:', err);
//       setError('שגיאה במחיקת האלבום');
//     }
//   };

//   /**
//    * עדכון album
//    */
//   const handleUpdateAlbum = async (albumId, updates) => {
//     try {
//       const album = albums.find(a => a.id === albumId);
//       const updatedAlbumData = { ...album, ...updates };

//       const response = await axios.put(`http://localhost:3000/albums/${albumId}`, updatedAlbumData);
//       const updatedAlbum = response.data;

//       const updatedAlbums = albums.map(a => 
//         a.id === albumId ? updatedAlbum : a
//       );
//       setAlbums(updatedAlbums);
//       updateAlbumsStorage(updatedAlbums);

//       setEditingAlbum(null);
//       console.log('Album updated successfully');

//     } catch (err) {
//       console.error('Error updating album:', err);
//       setError('שגיאה בעדכון האלבום');
//     }
//   };

//   /**
//    * ניווט לאלבום ספציפי (עמוד חדש)
//    */
//   const handleViewAlbum = (albumId) => {
//     navigate(`/users/${userId}/albums/${albumId}`);
//   };

//   /**
//    * סינון albums לפי חיפוש
//    */
//   const getFilteredAlbums = (albumsArray) => {
//     if (!searchQuery) return albumsArray;

//     return albumsArray.filter(album => {
//       switch (searchCriteria) {
//         case 'id':
//           return album.id.toString().includes(searchQuery);
//         case 'title':
//           return album.title.toLowerCase().includes(searchQuery.toLowerCase());
//         default:
//           return true;
//       }
//     });
//   };

//   // טעינה ראשונית
//   useEffect(() => {
//     if (!authLoading && user && user.id.toString() === userId) {
//       loadAlbums();
//     }
//   }, [user, userId, authLoading]);

//   // albums מסוננים
//   const filteredAlbums = getFilteredAlbums(albums);

//   // מסך טעינה
//   if (authLoading || loading) {
//     return (
//       <div className="albums-page">
//         <div className="loading-container">
//           <div className="loading-spinner"></div>
//           <p>טוען אלבומים...</p>
//         </div>
//       </div>
//     );
//   }

//   // שגיאת הרשאות
//   if (!user || user.id.toString() !== userId) {
//     return (
//       <div className="albums-page">
//         <div className="error-container">
//           <h2>שגיאת הרשאה</h2>
//           <p>אין לך הרשאה לצפות באלבומים אלה</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="albums-page">
//       <div className="albums-container">
//         {/* כותרת ראשית */}
//         <div className="albums-header">
//           <div className="header-content">
//             <h1>📸 האלבומים שלי</h1>
//             <p>ניהול האלבומים והתמונות שלך</p>
//           </div>
//           <button 
//             onClick={() => setShowAddForm(true)}
//             className="add-album-btn"
//             disabled={showAddForm}
//           >
//             ➕ צור אלבום חדש
//           </button>
//         </div>

//         {/* הודעות שגיאה */}
//         {error && (
//           <div className="error-message">
//             {error}
//             <button onClick={() => setError('')} className="close-error">✕</button>
//           </div>
//         )}

//         {/* טופס הוספת אלבום */}
//         {showAddForm && (
//           <div className="add-album-form">
//             <h3>➕ יצירת אלבום חדש</h3>
//             <form onSubmit={handleAddAlbum}>
//               <div className="form-group">
//                 <label>שם האלבום:</label>
//                 <input
//                   type="text"
//                   value={newAlbum.title}
//                   onChange={(e) => setNewAlbum({...newAlbum, title: e.target.value})}
//                   placeholder="הכנס שם לאלבום החדש..."
//                   required
//                   disabled={saving}
//                   autoFocus
//                 />
//               </div>
//               <div className="form-actions">
//                 <button type="submit" disabled={saving || !newAlbum.title.trim()}>
//                   {saving ? 'יוצר...' : '📸 צור אלבום'}
//                 </button>
//                 <button 
//                   type="button" 
//                   onClick={() => {
//                     setShowAddForm(false);
//                     setNewAlbum({ title: '' });
//                   }}
//                   disabled={saving}
//                   className="cancel-btn"
//                 >
//                   ❌ ביטול
//                 </button>
//               </div>
//             </form>
//           </div>
//         )}

//         {/* כלי חיפוש */}
//         <div className="search-controls">
//           <label>🔍 חיפוש לפי:</label>
//           <select 
//             value={searchCriteria} 
//             onChange={(e) => setSearchCriteria(e.target.value)}
//           >
//             <option value="id">מזהה</option>
//             <option value="title">שם האלבום</option>
//           </select>
//           <input
//             type="text"
//             placeholder={`חפש לפי ${searchCriteria === 'id' ? 'מזהה' : 'שם האלבום'}`}
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//           {searchQuery && (
//             <button 
//               onClick={() => setSearchQuery('')}
//               className="clear-search"
//             >
//               ✕
//             </button>
//           )}
//         </div>

//         {/* סטטיסטיקות */}
//         <div className="albums-stats">
//           <div className="stat-item">
//             <span className="stat-number">{albums.length}</span>
//             <span className="stat-label">סה"כ אלבומים</span>
//           </div>
//           <div className="stat-item">
//             <span className="stat-number">{filteredAlbums.length}</span>
//             <span className="stat-label">מוצגים</span>
//           </div>
//         </div>

//         {/* רשימת אלבומים */}
//         <div className="albums-grid">
//           {filteredAlbums.length === 0 ? (
//             <div className="empty-state">
//               {searchQuery ? (
//                 <>
//                   <p>🔍 לא נמצאו אלבומים התואמים לחיפוש</p>
//                   <button onClick={() => setSearchQuery('')} className="clear-search-btn">
//                     נקה חיפוש
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <p>📸 אין לך אלבומים עדיין</p>
//                   <button onClick={() => setShowAddForm(true)} className="add-first-album">
//                     צור אלבום ראשון
//                   </button>
//                 </>
//               )}
//             </div>
//           ) : (
//             filteredAlbums.map(album => (
//               <div key={album.id} className="album-card">
//                 <div className="album-preview" onClick={() => handleViewAlbum(album.id)}>
//                   <div className="album-thumbnail">
//                     <div className="album-icon">📸</div>
//                     <div className="album-id">#{album.id}</div>
//                   </div>
//                   <div className="album-info">
//                     <h3 className="album-title">{album.title}</h3>
//                     <p className="album-subtitle">לחץ לצפייה בתמונות</p>
//                   </div>
//                 </div>
                
//                 <div className="album-actions">
//                   <button
//                     onClick={() => handleViewAlbum(album.id)}
//                     className="view-btn"
//                     title="צפה באלבום"
//                   >
//                     👁️ צפה
//                   </button>
//                   <button
//                     onClick={() => setEditingAlbum(editingAlbum === album.id ? null : album.id)}
//                     className="edit-btn"
//                     title="ערוך שם"
//                   >
//                     ✏️ ערוך
//                   </button>
//                   <button
//                     onClick={() => handleDeleteAlbum(album.id)}
//                     className="delete-btn"
//                     title="מחק אלבום"
//                   >
//                     🗑️ מחק
//                   </button>
//                 </div>

//                 {/* טופס עריכה מהירה */}
//                 {editingAlbum === album.id && (
//                   <div className="edit-form">
//                     <h4>✏️ עריכת שם האלבום</h4>
//                     <div className="form-group">
//                       <input
//                         type="text"
//                         value={album.title}
//                         onChange={(e) => {
//                           const updatedAlbums = albums.map(a => 
//                             a.id === album.id ? {...a, title: e.target.value} : a
//                           );
//                           setAlbums(updatedAlbums);
//                         }}
//                         placeholder="שם האלבום"
//                       />
//                     </div>
//                     <div className="form-actions">
//                       <button onClick={() => handleUpdateAlbum(album.id, { 
//                         title: album.title
//                       })}>
//                         💾 שמור שינויים
//                       </button>
//                       <button onClick={() => setEditingAlbum(null)} className="cancel-btn">
//                         ❌ ביטול
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Albums;

// src/components/Albums.jsx
// רכיב ניהול אלבומים - חלק ו

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../contexts/AuthContext';
import AlbumThumbnail from './AlbumThumbnail';
import '../css/Albums.css';

/**
 * Albums - רכיב רשימת אלבומים
 * מציג רשימת אלבומים במצב סקירה עם אפשרויות חיפוש ועריכה
 * כאשר בוחרים אלבום, מנווט לעמוד נפרד
 */
const Albums = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { userId } = useParams();
  const navigate = useNavigate();
  
  // State ראשי
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State לחיפוש
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('title');
  
  // State להוספת/עריכת album
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [newAlbum, setNewAlbum] = useState({ title: '' });
  const [saving, setSaving] = useState(false);

  // מפתח LocalStorage
  const ALBUMS_STORAGE_KEY = `albums_user_${userId}`;

  /**
   * טעינת albums - תחילה מ-LocalStorage, אחר כך מהשרת
   */
  const loadAlbums = async () => {
    try {
      // ניסיון טעינה מ-LocalStorage
      const cachedAlbums = localStorage.getItem(ALBUMS_STORAGE_KEY);
      if (cachedAlbums) {
        const parsedAlbums = JSON.parse(cachedAlbums);
        setAlbums(parsedAlbums);
        setLoading(false);
        console.log('Albums loaded from cache');
        return;
      }

      // טעינה מהשרת
      const response = await axios.get(`http://localhost:3000/albums?userId=${userId}`);
      const userAlbums = response.data;
      
      setAlbums(userAlbums);
      localStorage.setItem(ALBUMS_STORAGE_KEY, JSON.stringify(userAlbums));
      console.log('Albums loaded from server and cached');

    } catch (err) {
      console.error('Error loading albums:', err);
      setError('שגיאה בטעינת האלבומים');
    } finally {
      setLoading(false);
    }
  };

  /**
   * עדכון LocalStorage
   */
  const updateAlbumsStorage = (updatedAlbums) => {
    localStorage.setItem(ALBUMS_STORAGE_KEY, JSON.stringify(updatedAlbums));
  };

  /**
   * הוספת album חדש
   */
  const handleAddAlbum = async (e) => {
    e.preventDefault();
    if (!newAlbum.title.trim()) return;

    setSaving(true);
    try {
      const albumData = {
        userId: parseInt(userId),
        title: newAlbum.title.trim()
      };

      const response = await axios.post('http://localhost:3000/albums', albumData);
      const addedAlbum = response.data;

      const updatedAlbums = [...albums, addedAlbum];
      setAlbums(updatedAlbums);
      updateAlbumsStorage(updatedAlbums);

      setNewAlbum({ title: '' });
      setShowAddForm(false);
      console.log('Album added successfully');

    } catch (err) {
      console.error('Error adding album:', err);
      setError('שגיאה בהוספת האלבום');
    } finally {
      setSaving(false);
    }
  };

  /**
   * מחיקת album
   */
  const handleDeleteAlbum = async (albumId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את האלבום? כל התמונות באלבום יימחקו גם כן!')) return;

    try {
      // מחיקת האלבום
      await axios.delete(`http://localhost:3000/albums/${albumId}`);
      
      // מחיקת כל התמונות השייכות לאלבום
      const photosResponse = await axios.get(`http://localhost:3000/photos?albumId=${albumId}`);
      const albumPhotos = photosResponse.data;
      
      // מחיקת כל תמונה
      for (const photo of albumPhotos) {
        await axios.delete(`http://localhost:3000/photos/${photo.id}`);
      }

      const updatedAlbums = albums.filter(album => album.id !== albumId);
      setAlbums(updatedAlbums);
      updateAlbumsStorage(updatedAlbums);

      // ניקוי cache של תמונות האלבום
      localStorage.removeItem(`photos_album_${albumId}`);

      console.log('Album and photos deleted successfully');

    } catch (err) {
      console.error('Error deleting album:', err);
      setError('שגיאה במחיקת האלבום');
    }
  };

  /**
   * עדכון album
   */
  const handleUpdateAlbum = async (albumId, updates) => {
    try {
      const album = albums.find(a => a.id === albumId);
      const updatedAlbumData = { ...album, ...updates };

      const response = await axios.put(`http://localhost:3000/albums/${albumId}`, updatedAlbumData);
      const updatedAlbum = response.data;

      const updatedAlbums = albums.map(a => 
        a.id === albumId ? updatedAlbum : a
      );
      setAlbums(updatedAlbums);
      updateAlbumsStorage(updatedAlbums);

      setEditingAlbum(null);
      console.log('Album updated successfully');

    } catch (err) {
      console.error('Error updating album:', err);
      setError('שגיאה בעדכון האלבום');
    }
  };

  /**
   * ניווט לאלבום ספציפי (עמוד חדש)
   */
  const handleViewAlbum = (albumId) => {
    navigate(`/users/${userId}/albums/${albumId}`);
  };

  /**
   * סינון albums לפי חיפוש
   */
  const getFilteredAlbums = (albumsArray) => {
    if (!searchQuery) return albumsArray;

    return albumsArray.filter(album => {
      switch (searchCriteria) {
        case 'id':
          return album.id.toString().includes(searchQuery);
        case 'title':
          return album.title.toLowerCase().includes(searchQuery.toLowerCase());
        default:
          return true;
      }
    });
  };

  // טעינה ראשונית
  useEffect(() => {
    if (!authLoading && user && user.id.toString() === userId) {
      loadAlbums();
    }
  }, [user, userId, authLoading]);

  // albums מסוננים
  const filteredAlbums = getFilteredAlbums(albums);

  // מסך טעינה
  if (authLoading || loading) {
    return (
      <div className="albums-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>טוען אלבומים...</p>
        </div>
      </div>
    );
  }

  // שגיאת הרשאות
  if (!user || user.id.toString() !== userId) {
    return (
      <div className="albums-page">
        <div className="error-container">
          <h2>שגיאת הרשאה</h2>
          <p>אין לך הרשאה לצפות באלבומים אלה</p>
        </div>
      </div>
    );
  }

  return (
    <div className="albums-page">
      <div className="albums-container">
        {/* כותרת ראשית */}
        <div className="albums-header">
          <div className="header-content">
            <h1>📸 האלבומים שלי</h1>
            <p>ניהול האלבומים והתמונות שלך</p>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="add-album-btn"
            disabled={showAddForm}
          >
            ➕ צור אלבום חדש
          </button>
        </div>

        {/* הודעות שגיאה */}
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError('')} className="close-error">✕</button>
          </div>
        )}

        {/* טופס הוספת אלבום */}
        {showAddForm && (
          <div className="add-album-form">
            <h3>➕ יצירת אלבום חדש</h3>
            <form onSubmit={handleAddAlbum}>
              <div className="form-group">
                <label>שם האלבום:</label>
                <input
                  type="text"
                  value={newAlbum.title}
                  onChange={(e) => setNewAlbum({...newAlbum, title: e.target.value})}
                  placeholder="הכנס שם לאלבום החדש..."
                  required
                  disabled={saving}
                  autoFocus
                />
              </div>
              <div className="form-actions">
                <button type="submit" disabled={saving || !newAlbum.title.trim()}>
                  {saving ? 'יוצר...' : '📸 צור אלבום'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddForm(false);
                    setNewAlbum({ title: '' });
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
            <option value="title">שם האלבום</option>
          </select>
          <input
            type="text"
            placeholder={`חפש לפי ${searchCriteria === 'id' ? 'מזהה' : 'שם האלבום'}`}
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
        <div className="albums-stats">
          <div className="stat-item">
            <span className="stat-number">{albums.length}</span>
            <span className="stat-label">סה"כ אלבומים</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{filteredAlbums.length}</span>
            <span className="stat-label">מוצגים</span>
          </div>
        </div>

        {/* רשימת אלבומים */}
        <div className="albums-grid">
          {filteredAlbums.length === 0 ? (
            <div className="empty-state">
              {searchQuery ? (
                <>
                  <p>🔍 לא נמצאו אלבומים התואמים לחיפוש</p>
                  <button onClick={() => setSearchQuery('')} className="clear-search-btn">
                    נקה חיפוש
                  </button>
                </>
              ) : (
                <>
                  <p>📸 אין לך אלבומים עדיין</p>
                  <button onClick={() => setShowAddForm(true)} className="add-first-album">
                    צור אלבום ראשון
                  </button>
                </>
              )}
            </div>
          ) : (
            filteredAlbums.map(album => (
              <div key={album.id} className="album-card">
                <div className="album-preview" onClick={() => handleViewAlbum(album.id)}>
                  <AlbumThumbnail albumId={album.id} />
                  <div className="album-info">
                    <h3 className="album-title">{album.title}</h3>
                    <p className="album-subtitle">לחץ לצפייה בתמונות</p>
                  </div>
                </div>
                
                <div className="album-actions">
                  <button
                    onClick={() => handleViewAlbum(album.id)}
                    className="view-btn"
                    title="צפה באלבום"
                  >
                    👁️ צפה
                  </button>
                  <button
                    onClick={() => setEditingAlbum(editingAlbum === album.id ? null : album.id)}
                    className="edit-btn"
                    title="ערוך שם"
                  >
                    ✏️ ערוך
                  </button>
                  <button
                    onClick={() => handleDeleteAlbum(album.id)}
                    className="delete-btn"
                    title="מחק אלבום"
                  >
                    🗑️ מחק
                  </button>
                </div>

                {/* טופס עריכה מהירה */}
                {editingAlbum === album.id && (
                  <div className="edit-form">
                    <h4>✏️ עריכת שם האלבום</h4>
                    <div className="form-group">
                      <input
                        type="text"
                        value={album.title}
                        onChange={(e) => {
                          const updatedAlbums = albums.map(a => 
                            a.id === album.id ? {...a, title: e.target.value} : a
                          );
                          setAlbums(updatedAlbums);
                        }}
                        placeholder="שם האלבום"
                      />
                    </div>
                    <div className="form-actions">
                      <button onClick={() => handleUpdateAlbum(album.id, { 
                        title: album.title
                      })}>
                        💾 שמור שינויים
                      </button>
                      <button onClick={() => setEditingAlbum(null)} className="cancel-btn">
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

export default Albums;