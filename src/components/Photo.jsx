// // // src/components/Photo.jsx
// // // רכיב לתמונה בודדת

// // import React, { useState } from 'react';
// // import '../css/Photo.css';

// // /**
// //  * Photo - רכיב תמונה בודדת
// //  * מציג תמונה עם אפשרויות עריכה ומחיקה
// //  * כולל lazy loading ואפשרות פתיחה ב-slider
// //  */
// // const Photo = ({ photo, index, onUpdate, onDelete, onOpenSlider }) => {
// //   // State לעריכה
// //   const [editing, setEditing] = useState(false);
// //   const [editData, setEditData] = useState({
// //     title: photo.title,
// //     url: photo.url,
// //     thumbnailUrl: photo.thumbnailUrl
// //   });
// //   const [imageLoaded, setImageLoaded] = useState(false);
// //   const [imageError, setImageError] = useState(false);

// //   /**
// //    * שמירת עריכה
// //    */
// //   const handleSaveEdit = () => {
// //     if (!editData.title.trim() || !editData.url.trim()) {
// //       return;
// //     }

// //     onUpdate(photo.id, {
// //       title: editData.title.trim(),
// //       url: editData.url.trim(),
// //       thumbnailUrl: editData.thumbnailUrl.trim() || editData.url.trim()
// //     });
    
// //     setEditing(false);
// //   };

// //   /**
// //    * ביטול עריכה
// //    */
// //   const handleCancelEdit = () => {
// //     setEditData({
// //       title: photo.title,
// //       url: photo.url,
// //       thumbnailUrl: photo.thumbnailUrl
// //     });
// //     setEditing(false);
// //   };

// //   /**
// //    * מחיקת תמונה
// //    */
// //   const handleDelete = () => {
// //     onDelete(photo.id);
// //   };

// //   /**
// //    * פתיחה ב-slider
// //    */
// //   const handleOpenSlider = () => {
// //     if (!editing) {
// //       onOpenSlider(index);
// //     }
// //   };

// //   /**
// //    * טיפול בשגיאת טעינת תמונה
// //    */
// //   const handleImageError = () => {
// //     setImageError(true);
// //     setImageLoaded(true);
// //   };

// //   /**
// //    * טיפול בהצלחת טעינת תמונה
// //    */
// //   const handleImageLoad = () => {
// //     setImageLoaded(true);
// //     setImageError(false);
// //   };

// //   return (
// //     <div className="photo-item">
// //       {editing ? (
// //         // מצב עריכה
// //         <div className="photo-edit-form">
// //           <div className="edit-header">
// //             <h5>✏️ עריכת תמונה</h5>
// //           </div>
          
// //           <div className="form-group">
// //             <label>כותרת התמונה:</label>
// //             <input
// //               type="text"
// //               value={editData.title}
// //               onChange={(e) => setEditData({...editData, title: e.target.value})}
// //               placeholder="כותרת התמונה"
// //               required
// //             />
// //           </div>
          
// //           <div className="form-group">
// //             <label>קישור לתמונה:</label>
// //             <input
// //               type="url"
// //               value={editData.url}
// //               onChange={(e) => setEditData({...editData, url: e.target.value})}
// //               placeholder="https://example.com/image.jpg"
// //               required
// //             />
// //           </div>
          
// //           <div className="form-group">
// //             <label>קישור לתמונה מוקטנת:</label>
// //             <input
// //               type="url"
// //               value={editData.thumbnailUrl}
// //               onChange={(e) => setEditData({...editData, thumbnailUrl: e.target.value})}
// //               placeholder="https://example.com/thumbnail.jpg"
// //             />
// //           </div>
          
// //           <div className="photo-actions">
// //             <button 
// //               onClick={handleSaveEdit}
// //               className="save-btn"
// //               disabled={!editData.title.trim() || !editData.url.trim()}
// //             >
// //               💾 שמור
// //             </button>
// //             <button 
// //               onClick={handleCancelEdit}
// //               className="cancel-btn"
// //             >
// //               ❌ ביטול
// //             </button>
// //           </div>
// //         </div>
// //       ) : (
// //         // מצב צפייה
// //         <div className="photo-display">
// //           <div className="photo-container" onClick={handleOpenSlider}>
// //             {!imageLoaded && (
// //               <div className="photo-placeholder">
// //                 <div className="placeholder-spinner"></div>
// //                 <p>טוען תמונה...</p>
// //               </div>
// //             )}
            
// //             {imageError ? (
// //               <div className="photo-error">
// //                 <div className="error-icon">🖼️</div>
// //                 <p>שגיאה בטעינת התמונה</p>
// //               </div>
// //             ) : (
// //               <img
// //                 src={photo.thumbnailUrl || photo.url}
// //                 alt={photo.title}
// //                 className={`photo-image ${imageLoaded ? 'loaded' : ''}`}
// //                 onLoad={handleImageLoad}
// //                 onError={handleImageError}
// //                 loading="lazy"
// //               />
// //             )}
            
// //             <div className="photo-overlay">
// //               <div className="photo-id">#{photo.id}</div>
// //               <div className="photo-zoom-hint">🔍 לחץ להגדלה</div>
// //             </div>
// //           </div>
          
// //           <div className="photo-info">
// //             <h4 className="photo-title" title={photo.title}>
// //               {photo.title}
// //             </h4>
            
// //             <div className="photo-actions">
// //               <button 
// //                 onClick={(e) => {
// //                   e.stopPropagation();
// //                   setEditing(true);
// //                 }}
// //                 className="edit-btn"
// //                 title="ערוך תמונה"
// //               >
// //                 ✏️ ערוך
// //               </button>
// //               <button 
// //                 onClick={(e) => {
// //                   e.stopPropagation();
// //                   handleDelete();
// //                 }}
// //                 className="delete-btn"
// //                 title="מחק תמונה"
// //               >
// //                 🗑️ מחק
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default Photo;

// // src/components/Photo.jsx
// // רכיב לתמונה בודדת - גרסה פשוטה ללא slider

// import React, { useState } from 'react';
// import '../css/Photo.css';

// /**
//  * Photo - רכיב תמונה בודדת
//  * מציג תמונה עם אפשרויות עריכת כותרת ומחיקה
//  * ללא slider - הכל באותו עמוד
//  */
// const Photo = ({ photo, onUpdate, onDelete }) => {
//   // State לעריכה
//   const [editing, setEditing] = useState(false);
//   const [editTitle, setEditTitle] = useState(photo.title);
//   const [imageLoaded, setImageLoaded] = useState(false);
//   const [imageError, setImageError] = useState(false);

//   /**
//    * שמירת עריכת כותרת
//    */
//   const handleSaveEdit = () => {
//     if (!editTitle.trim()) {
//       return;
//     }

//     onUpdate(photo.id, editTitle);
//     setEditing(false);
//   };

//   /**
//    * ביטול עריכה
//    */
//   const handleCancelEdit = () => {
//     setEditTitle(photo.title);
//     setEditing(false);
//   };

//   /**
//    * מחיקת תמונה
//    */
//   const handleDelete = () => {
//     onDelete(photo.id);
//   };

//   /**
//    * טיפול בשגיאת טעינת תמונה
//    */
//   const handleImageError = () => {
//     setImageError(true);
//     setImageLoaded(true);
//   };

//   /**
//    * טיפול בהצלחת טעינת תמונה
//    */
//   const handleImageLoad = () => {
//     setImageLoaded(true);
//     setImageError(false);
//   };

//   return (
//     <div className="photo-item">
//       {/* תמונה */}
//       <div className="photo-container">
//         {!imageLoaded && (
//           <div className="photo-placeholder">
//             <div className="placeholder-spinner"></div>
//             <p>טוען תמונה...</p>
//           </div>
//         )}
        
//         {imageError ? (
//           <div className="photo-error">
//             <div className="error-icon">🖼️</div>
//             <p>שגיאה בטעינת התמונה</p>
//           </div>
//         ) : (
//           <img
//             src={photo.thumbnailUrl || photo.url}
//             alt={photo.title}
//             className={`photo-image ${imageLoaded ? 'loaded' : ''}`}
//             onLoad={handleImageLoad}
//             onError={handleImageError}
//             loading="lazy"
//           />
//         )}
        
//         <div className="photo-overlay">
//           <div className="photo-id">#{photo.id}</div>
//         </div>
//       </div>
      
//       {/* מידע ופעולות */}
//       <div className="photo-info">
//         {editing ? (
//           // מצב עריכה
//           <div className="photo-edit-section">
//             <input
//               type="text"
//               value={editTitle}
//               onChange={(e) => setEditTitle(e.target.value)}
//               placeholder="כותרת התמונה"
//               className="edit-title-input"
//               autoFocus
//               onKeyPress={(e) => {
//                 if (e.key === 'Enter') {
//                   handleSaveEdit();
//                 }
//               }}
//             />
//             <div className="edit-actions">
//               <button 
//                 onClick={handleSaveEdit}
//                 className="save-btn"
//                 disabled={!editTitle.trim()}
//               >
//                 💾
//               </button>
//               <button 
//                 onClick={handleCancelEdit}
//                 className="cancel-btn"
//               >
//                 ❌
//               </button>
//             </div>
//           </div>
//         ) : (
//           // מצב צפייה
//           <>
//             <h4 className="photo-title" title={photo.title}>
//               {photo.title}
//             </h4>
            
//             <div className="photo-actions">
//               <button 
//                 onClick={() => setEditing(true)}
//                 className="edit-btn"
//                 title="ערוך כותרת"
//               >
//                 ✏️ ערוך
//               </button>
//               <button 
//                 onClick={handleDelete}
//                 className="delete-btn"
//                 title="מחק תמונה"
//               >
//                 🗑️ מחק
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Photo;

// src/components/Photo.jsx
// רכיב לתמונה בודדת - גרסה פשוטה ללא slider

import React, { useState } from 'react';
import '../css/Photo.css';

/**
 * Photo - רכיב תמונה בודדת
 * מציג תמונה עם אפשרויות עריכת כותרת ומחיקה
 * ללא slider - הכל באותו עמוד
 */
const Photo = ({ photo, onUpdate, onDelete, onEnlarge }) => {
  // State לעריכה
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(photo.title);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  /**
   * שמירת עריכת כותרת
   */
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