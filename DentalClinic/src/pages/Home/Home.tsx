import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Clock, Award, Star, Sparkles } from 'lucide-react';
import { Button } from '../../components/Button';
import { Card, CardBody, CardTitle } from '../../components/Card';
import heroImage from '../../assets/hero-clinic.jpg';
import styles from './Home.module.css';

export const Home = () => {
  return (
    <div className="animate-fade-in">
      <section className={styles.heroSection}>
        <div className={styles.heroMesh} />
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroText}>
            <div className={styles.heroBadge}>
              <Sparkles size={14} />
              Award-Winning Dental Care
            </div>
            <h1 className={styles.heroTitle}>
              Premium Dental Care for a <span className={styles.heroAccent}>Brighter Smile</span>
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
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <strong>10k+</strong>
                <span>Happy Patients</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <strong>4.9</strong>
                <span>Average Rating</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <strong>15+</strong>
                <span>Years Experience</span>
              </div>
            </div>
          </div>
          <div className={styles.heroImageContainer}>
            <div className={styles.heroImageGlow} />
            <img src={heroImage} alt="Modern dental clinic lobby" className={styles.heroImage} />
            <div className={styles.heroFloatingCard}>
              <div className={styles.floatingCardIcon}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <strong>100% Safe</strong>
                <span>Sterilized & Certified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.servicesSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>What We Offer</span>
            <h2 className={styles.sectionTitle}>Our Featured Services</h2>
            <p className={styles.sectionSubtitle}>
              We offer a comprehensive range of dental services using the latest technology to ensure the best possible outcomes.
            </p>
          </div>

          <div className={styles.servicesGrid}>
            <Card hoverable>
              <CardBody>
                <div className={`${styles.serviceIcon} ${styles.iconBlue}`}>
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
                <div className={`${styles.serviceIcon} ${styles.iconTeal}`}>
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
                <div className={`${styles.serviceIcon} ${styles.iconCyan}`}>
                  <Clock size={24} />
                </div>
                <CardTitle style={{ marginBottom: 'var(--space-2)' }}>Emergency Care</CardTitle>
                <p className="text-muted">
                  Fast, effective relief for dental emergencies. We're here when you need us the most.
                </p>
              </CardBody>
            </Card>
          </div>

          <div className={styles.ctaCenter}>
            <Link to="/services">
              <Button variant="secondary" rightIcon={<ArrowRight size={16} />}>View All Services</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.testimonialsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Testimonials</span>
            <h2 className={styles.sectionTitle}>What Our Patients Say</h2>
            <p className={styles.sectionSubtitle}>
              Don't just take our word for it. Read about the experiences of our happy patients.
            </p>
          </div>

          <div className={styles.servicesGrid}>
            {[
              { quote: "The best dental experience I've ever had! Dr. Jenkins and the entire staff are so welcoming and professional. They completely cured my dental anxiety.", author: 'Sarah M.' },
              { quote: "I came in for Invisalign consultation and was blown away by the state-of-the-art facility. Dr. Chen explained everything perfectly. Highly recommend!", author: 'James T.' },
              { quote: "Emily is the most gentle hygienist ever. My teeth cleaning was fast, painless, and my smile has never looked better. Thank you DentalCare!", author: 'Elena R.' },
            ].map((t) => (
              <Card key={t.author} hoverable className={styles.testimonialCard}>
                <CardBody>
                  <div className={styles.stars}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <p className={styles.testimonialQuote}>"{t.quote}"</p>
                  <div className={styles.testimonialAuthor}>{t.author}</div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.statsSection}>
        <div className={`container ${styles.statsGrid}`}>
          {[
            { value: '15+', label: 'Years Experience' },
            { value: '10k+', label: 'Happy Patients' },
            { value: '5', label: 'Expert Dentists' },
            { value: '4.9', label: 'Average Rating' },
          ].map((stat) => (
            <div key={stat.label} className={styles.statItem}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
