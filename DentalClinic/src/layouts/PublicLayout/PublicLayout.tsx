import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';
import { Button } from '../../components/Button';
import styles from './PublicLayout.module.css';

export const PublicLayout = () => {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={`container ${styles.navContainer}`}>
          <Link to="/" className={styles.logo}>
            <Stethoscope size={28} color="var(--color-primary)" />
            DentalCare
          </Link>
          
          <nav className={styles.navLinks}>
            <Link to="/" className={styles.navLink}>Home</Link>
            <Link to="/services" className={styles.navLink}>Services</Link>
            <Link to="/team" className={styles.navLink}>Our Team</Link>
            <Link to="/contact" className={styles.navLink}>Contact</Link>
          </nav>
          
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/dashboard/patient">
              <Button variant="primary">Book Appointment</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={`container ${styles.footerGrid}`}>
          <div>
            <div className={styles.logo} style={{ color: '#fff', marginBottom: 'var(--space-4)' }}>
              <Stethoscope size={28} color="var(--color-primary-light)" />
              DentalCare
            </div>
            <p className="text-muted">
              Providing premium dental care for your entire family with modern technology and a gentle touch.
            </p>
          </div>
          <div>
            <h4 className={styles.footerHeading}>Quick Links</h4>
            <div className={styles.footerLinks}>
              <Link to="/services" className={styles.footerLink}>Our Services</Link>
              <Link to="/team" className={styles.footerLink}>Meet the Team</Link>
              <Link to="/gallery" className={styles.footerLink}>Clinic Gallery</Link>
              <Link to="/testimonials" className={styles.footerLink}>Testimonials</Link>
            </div>
          </div>
          <div>
            <h4 className={styles.footerHeading}>Services</h4>
            <div className={styles.footerLinks}>
              <Link to="/services/cleaning" className={styles.footerLink}>Teeth Cleaning</Link>
              <Link to="/services/whitening" className={styles.footerLink}>Teeth Whitening</Link>
              <Link to="/services/implants" className={styles.footerLink}>Dental Implants</Link>
              <Link to="/services/orthodontics" className={styles.footerLink}>Orthodontics</Link>
            </div>
          </div>
          <div>
            <h4 className={styles.footerHeading}>Contact Us</h4>
            <div className={styles.footerLinks}>
              <span className={styles.footerLink}>123 Smile Boulevard, Suite 100</span>
              <span className={styles.footerLink}>New York, NY 10001</span>
              <span className={styles.footerLink}>(555) 123-4567</span>
              <span className={styles.footerLink}>hello@dentalcare.com</span>
            </div>
          </div>
        </div>
        <div className={`container ${styles.footerBottom}`}>
          <p>&copy; {new Date().getFullYear()} DentalCare Clinic. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
