import React from 'react';
import { ShieldCheck, Award, Clock, Heart, Sparkles, Stethoscope } from 'lucide-react';
import { Card, CardBody, CardTitle, CardFooter } from '../../components/Card';
import { Button } from '../../components/Button';
import { useNavigate } from 'react-router-dom';
import styles from './Services.module.css';

export const Services = () => {
  const navigate = useNavigate();
  return (
    <div className={`container animate-fade-in ${styles.servicesPage}`}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Our Dental Services</h1>
        <p className={styles.pageSubtitle}>
          Comprehensive, high-quality dental care tailored to your unique needs. We use state-of-the-art technology to ensure your comfort and the best possible results.
        </p>
      </div>

      <section className={styles.categorySection}>
        <h2 className={styles.categoryTitle}>Preventive Dentistry</h2>
        <div className={styles.servicesGrid}>
          <Card hoverable>
            <CardBody>
              <div className={styles.serviceIcon}><ShieldCheck size={24} /></div>
              <CardTitle style={{ marginBottom: 'var(--space-2)' }}>Comprehensive Exams</CardTitle>
              <p className="text-muted">Detailed evaluation of your teeth, gums, and overall oral health using digital X-rays.</p>
              <div className={styles.priceTag}>From $99</div>
            </CardBody>
            <CardFooter>
              <Button variant="outline" fullWidth onClick={() => navigate('/register')}>Book Now</Button>
            </CardFooter>
          </Card>

          <Card hoverable>
            <CardBody>
              <div className={styles.serviceIcon}><Stethoscope size={24} /></div>
              <CardTitle style={{ marginBottom: 'var(--space-2)' }}>Professional Cleaning</CardTitle>
              <p className="text-muted">Removal of plaque and tartar to prevent cavities and gum disease.</p>
              <div className={styles.priceTag}>From $120</div>
            </CardBody>
            <CardFooter>
              <Button variant="outline" fullWidth onClick={() => navigate('/register')}>Book Now</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className={styles.categorySection}>
        <h2 className={styles.categoryTitle}>Cosmetic Dentistry</h2>
        <div className={styles.servicesGrid}>
          <Card hoverable>
            <CardBody>
              <div className={styles.serviceIcon}><Sparkles size={24} /></div>
              <CardTitle style={{ marginBottom: 'var(--space-2)' }}>Teeth Whitening</CardTitle>
              <p className="text-muted">Professional in-office or take-home whitening treatments for a brighter smile.</p>
              <div className={styles.priceTag}>From $250</div>
            </CardBody>
            <CardFooter>
              <Button variant="outline" fullWidth onClick={() => navigate('/register')}>Book Now</Button>
            </CardFooter>
          </Card>

          <Card hoverable>
            <CardBody>
              <div className={styles.serviceIcon}><Award size={24} /></div>
              <CardTitle style={{ marginBottom: 'var(--space-2)' }}>Porcelain Veneers</CardTitle>
              <p className="text-muted">Custom-made shells to cover the front surface of teeth, improving their appearance.</p>
              <div className={styles.priceTag}>From $800 / tooth</div>
            </CardBody>
            <CardFooter>
              <Button variant="outline" fullWidth onClick={() => navigate('/register')}>Book Now</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className={styles.categorySection}>
        <h2 className={styles.categoryTitle}>Restorative Dentistry</h2>
        <div className={styles.servicesGrid}>
          <Card hoverable>
            <CardBody>
              <div className={styles.serviceIcon}><Heart size={24} /></div>
              <CardTitle style={{ marginBottom: 'var(--space-2)' }}>Dental Implants</CardTitle>
              <p className="text-muted">Permanent replacement for missing teeth that look and function like natural teeth.</p>
              <div className={styles.priceTag}>Consultation Required</div>
            </CardBody>
            <CardFooter>
              <Button variant="outline" fullWidth onClick={() => navigate('/register')}>Consultation</Button>
            </CardFooter>
          </Card>

          <Card hoverable>
            <CardBody>
              <div className={styles.serviceIcon}><Clock size={24} /></div>
              <CardTitle style={{ marginBottom: 'var(--space-2)' }}>Crowns & Bridges</CardTitle>
              <p className="text-muted">Restore damaged or missing teeth with high-quality ceramic restorations.</p>
              <div className={styles.priceTag}>From $900</div>
            </CardBody>
            <CardFooter>
              <Button variant="outline" fullWidth onClick={() => navigate('/register')}>Book Now</Button>
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  );
};
