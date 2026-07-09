import React from 'react';
import styles from './Gallery.module.css';

const images = [
  {
    url: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    alt: "Modern dental operatory room",
    title: "State-of-the-art Treatment Rooms"
  },
  {
    url: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    alt: "Smiling patient",
    title: "Comfortable Patient Experience"
  },
  {
    url: "https://images.unsplash.com/photo-1598256989800-fea5ce5146f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    alt: "Dental tools on tray",
    title: "Advanced Sterilization"
  },
  {
    url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    alt: "Dentist consulting patient",
    title: "Expert Consultations"
  },
  {
    url: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    alt: "Reception area",
    title: "Welcoming Reception"
  },
  {
    url: "https://images.unsplash.com/photo-1574482620826-40685ca5ebe2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    alt: "Dental X-Ray",
    title: "Digital Imaging"
  }
];

export const Gallery = () => {
  return (
    <div className={`container animate-fade-in ${styles.galleryPage}`}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Clinic Gallery</h1>
        <p className={styles.pageSubtitle}>
          Take a virtual tour of our modern, relaxing, and fully equipped dental facility designed with your comfort in mind.
        </p>
      </div>

      <div className={styles.galleryGrid}>
        {images.map((img, index) => (
          <div key={index} className={styles.galleryItem}>
            <img src={img.url} alt={img.alt} className={styles.galleryImage} loading="lazy" />
            <div className={styles.imageOverlay}>
              <h3 className={styles.imageTitle}>{img.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
