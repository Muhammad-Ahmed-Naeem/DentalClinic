import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import styles from './Contact.module.css';

export const Contact = () => {
  return (
    <div className={`container animate-fade-in ${styles.contactPage}`}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Get in Touch</h1>
        <p className={styles.pageSubtitle}>
          Have questions or ready to book an appointment? We're here to help you achieve your best smile.
        </p>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <MapPin size={24} className={styles.infoIcon} />
            <div>
              <h3 className={styles.infoTitle}>Our Location</h3>
              <p className={styles.infoText}>
                123 Smile Boulevard, Suite 100<br />
                New York, NY 10001
              </p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <Phone size={24} className={styles.infoIcon} />
            <div>
              <h3 className={styles.infoTitle}>Phone Number</h3>
              <p className={styles.infoText}>
                (555) 123-4567<br />
                Emergency: (555) 987-6543
              </p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <Mail size={24} className={styles.infoIcon} />
            <div>
              <h3 className={styles.infoTitle}>Email Address</h3>
              <p className={styles.infoText}>
                hello@dentalcare.com
              </p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <Clock size={24} className={styles.infoIcon} />
            <div>
              <h3 className={styles.infoTitle}>Working Hours</h3>
              <p className={styles.infoText}>
                Monday - Friday: 8:00 AM - 6:00 PM<br />
                Saturday: 9:00 AM - 2:00 PM<br />
                Sunday: Closed
              </p>
            </div>
          </div>
        </div>

        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Send us a Message</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className={styles.formGroup}>
              <Input label="Full Name" placeholder="John Doe" required />
            </div>
            <div className={styles.formGroup}>
              <Input label="Email Address" type="email" placeholder="john@example.com" required />
            </div>
            <div className={styles.formGroup}>
              <Input label="Phone Number" type="tel" placeholder="(555) 123-4567" />
            </div>
            <div className={styles.formGroup}>
              <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-secondary)' }}>Message</label>
              <textarea 
                rows={4} 
                style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit', fontSize: 'var(--font-size-base)' }}
                placeholder="How can we help you?"
                required
              ></textarea>
            </div>
            <Button type="submit" variant="primary" className={styles.submitBtn}>
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
