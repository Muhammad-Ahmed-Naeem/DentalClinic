import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Stethoscope, ArrowLeft } from 'lucide-react';
import styles from './AuthLayout.module.css';

export const AuthLayout = () => {
  return (
    <div className={styles.layout}>
      <div className={styles.contentSection}>
        <div className={styles.formContainer}>
          <Link to="/" className={styles.backLink}>
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <Link to="/" className={styles.logo}>
            <Stethoscope size={32} color="var(--color-primary)" />
            DentalCare
          </Link>
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </div>
      </div>
      <div className={styles.imageSection}>
        <h2>Your Smile, Our Priority</h2>
        <p>Join thousands of satisfied patients and experience world-class dental care.</p>
      </div>
    </div>
  );
};
