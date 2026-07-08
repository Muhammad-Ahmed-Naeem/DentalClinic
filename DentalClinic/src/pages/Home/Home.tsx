import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Clock, Award, Star } from 'lucide-react';
import { Button } from '../../components/Button';
import { Card, CardBody, CardTitle } from '../../components/Card';
import styles from './Home.module.css';

export const Home = () => {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Premium Dental Care for a <span>Brighter Smile</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Experience world-class dentistry in a modern, comfortable environment. Our expert team is dedicated to your oral health and well-being.
            </p>
            <div className={styles.heroActions}>
              <Link to="/dashboard/patient">
                <Button size="lg" variant="primary" rightIcon={<ArrowRight size={18} />}>
                  Book Appointment
                </Button>
              </Link>
              <Link to="/services">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className={styles.heroImageContainer}>
            <div className={styles.heroImage}></div>
          </div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className={styles.servicesSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Our Featured Services</h2>
            <p className={styles.sectionSubtitle}>
              We offer a comprehensive range of dental services using the latest technology to ensure the best possible outcomes.
            </p>
          </div>
          
          <div className={styles.servicesGrid}>
            <Card hoverable>
              <CardBody>
                <div className={styles.serviceIcon}>
                  <ShieldCheck size={24} />
                </div>
                <CardTitle style={{ marginBottom: 'var(--space-2)' }}>Preventive Care</CardTitle>
                <p className="text-muted">
                  Regular check-ups, professional cleaning, and comprehensive exams to keep your teeth healthy.
                </p>
              </CardBody>
            </Card>

            <Card hoverable>
              <CardBody>
                <div className={styles.serviceIcon}>
                  <Award size={24} />
                </div>
                <CardTitle style={{ marginBottom: 'var(--space-2)' }}>Cosmetic Dentistry</CardTitle>
                <p className="text-muted">
                  Transform your smile with professional whitening, veneers, and complete smile makeovers.
                </p>
              </CardBody>
            </Card>

            <Card hoverable>
              <CardBody>
                <div className={styles.serviceIcon}>
                  <Clock size={24} />
                </div>
                <CardTitle style={{ marginBottom: 'var(--space-2)' }}>Emergency Care</CardTitle>
                <p className="text-muted">
                  Fast, effective relief for dental emergencies. We're here when you need us the most.
                </p>
              </CardBody>
            </Card>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: 'var(--space-12)' }}>
            <Link to="/services">
              <Button variant="secondary">View All Services</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.servicesSection} style={{ backgroundColor: 'var(--color-background-alt)' }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>What Our Patients Say</h2>
            <p className={styles.sectionSubtitle}>
              Don't just take our word for it. Read about the experiences of our happy patients.
            </p>
          </div>
          
          <div className={styles.servicesGrid}>
            <Card>
              <CardBody>
                <div style={{ display: 'flex', gap: 'var(--space-1)', color: 'var(--color-warning)', marginBottom: 'var(--space-3)' }}>
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                </div>
                <p style={{ fontStyle: 'italic', marginBottom: 'var(--space-4)' }}>
                  "The best dental experience I've ever had! Dr. Jenkins and the entire staff are so welcoming and professional. They completely cured my dental anxiety."
                </p>
                <div style={{ fontWeight: 'var(--font-weight-bold)' }}>- Sarah M.</div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div style={{ display: 'flex', gap: 'var(--space-1)', color: 'var(--color-warning)', marginBottom: 'var(--space-3)' }}>
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                </div>
                <p style={{ fontStyle: 'italic', marginBottom: 'var(--space-4)' }}>
                  "I came in for Invisalign consultation and was blown away by the state-of-the-art facility. Dr. Chen explained everything perfectly. Highly recommend!"
                </p>
                <div style={{ fontWeight: 'var(--font-weight-bold)' }}>- James T.</div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div style={{ display: 'flex', gap: 'var(--space-1)', color: 'var(--color-warning)', marginBottom: 'var(--space-3)' }}>
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                </div>
                <p style={{ fontStyle: 'italic', marginBottom: 'var(--space-4)' }}>
                  "Emily is the most gentle hygienist ever. My teeth cleaning was fast, painless, and my smile has never looked better. Thank you DentalCare!"
                </p>
                <div style={{ fontWeight: 'var(--font-weight-bold)' }}>- Elena R.</div>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className={styles.statsSection}>
        <div className={`container ${styles.statsGrid}`}>
          <div>
            <div className={styles.statValue}>15+</div>
            <div className={styles.statLabel}>Years Experience</div>
          </div>
          <div>
            <div className={styles.statValue}>10k+</div>
            <div className={styles.statLabel}>Happy Patients</div>
          </div>
          <div>
            <div className={styles.statValue}>5</div>
            <div className={styles.statLabel}>Expert Dentists</div>
          </div>
          <div>
            <div className={styles.statValue}>4.9</div>
            <div className={styles.statLabel}>Average Rating</div>
          </div>
        </div>
      </section>
    </div>
  );
};
