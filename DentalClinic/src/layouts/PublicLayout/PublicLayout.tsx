import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Stethoscope, Send } from 'lucide-react';
import { Button } from '../../components/Button';
import { useToast } from '../../components/Toast';
import styles from './PublicLayout.module.css';

export const PublicLayout = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  
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
            <Stethoscope size={28} color="var(--color-primary)" />
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
              <Link to="/gallery" className={styles.footerLink}>Gallery</Link>
              <Link to="/faq" className={styles.footerLink}>FAQ</Link>
              <Link to="/contact" className={styles.footerLink}>Contact Us</Link>
            </div>
          </div>
          <div>
            <h4 className={styles.footerHeading}>Newsletter</h4>
            <p className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)' }}>
              Subscribe for dental health tips and clinic updates.
            </p>
            <form onSubmit={handleNewsletter} style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input 
                type="email" 
                placeholder="Email address" 
                required 
                style={{ flex: 1, padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'transparent', color: '#fff' }}
              />
              <Button type="submit" variant="primary" style={{ padding: 'var(--space-2)' }}>
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
