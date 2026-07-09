import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Stethoscope, Send } from 'lucide-react';
import { Button } from '../../components/Button';
import { useToast } from '../../components/Toast';
import styles from './PublicLayout.module.css';

export const PublicLayout = () => {
  const { showToast } = useToast();

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Subscribed to newsletter successfully!', 'success');
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={`container ${styles.navContainer}`}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <Stethoscope size={22} />
            </div>
            DentalCare
          </Link>

          <nav className={styles.navLinks}>
            <Link to="/" className={styles.navLink}>Home</Link>
            <Link to="/services" className={styles.navLink}>Services</Link>
            <Link to="/team" className={styles.navLink}>Our Team</Link>
            <Link to="/gallery" className={styles.navLink}>Gallery</Link>
            <Link to="/faq" className={styles.navLink}>FAQ</Link>
            <Link to="/contact" className={styles.navLink}>Contact</Link>
          </nav>

          <div className={styles.navActions}>
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
              <div className={styles.logoIcon}>
                <Stethoscope size={22} />
              </div>
              DentalCare
            </div>
            <p className={styles.footerDesc}>
              Providing premium dental care for your entire family with modern technology and a gentle touch.
            </p>
          </div>
          <div>
            <h4 className={styles.footerHeading}>Quick Links</h4>
            <div className={styles.footerLinks}>
              <Link to="/services" className={styles.footerLink}>Our Services</Link>
              <Link to="/team" className={styles.footerLink}>Meet the Team</Link>
              <Link to="/gallery" className={styles.footerLink}>Gallery</Link>
              <Link to="/faq" className={styles.footerLink}>FAQ</Link>
              <Link to="/contact" className={styles.footerLink}>Contact Us</Link>
            </div>
          </div>
          <div>
            <h4 className={styles.footerHeading}>Newsletter</h4>
            <p className={styles.footerDesc} style={{ marginBottom: 'var(--space-3)' }}>
              Subscribe for dental health tips and clinic updates.
            </p>
            <form onSubmit={handleNewsletter} className={styles.newsletterForm}>
              <input
                type="email"
                placeholder="Email address"
                required
                className={styles.newsletterInput}
              />
              <Button type="submit" variant="primary" style={{ padding: 'var(--space-2) var(--space-3)' }}>
                <Send size={16} />
              </Button>
            </form>
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
