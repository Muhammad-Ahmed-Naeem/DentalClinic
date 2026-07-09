import React from 'react';
import { ShieldCheck, Award, Clock, Heart, Sparkles, Stethoscope, Smile, Zap } from 'lucide-react';
import { Card, CardBody, CardTitle, CardFooter } from '../../components/Card';
import { Button } from '../../components/Button';
import { useNavigate } from 'react-router-dom';
import styles from './Services.module.css';

const categories = [
  {
    title: 'Preventive Dentistry',
    badge: 'Essential Care',
    badgeClass: 'badgeBlue',
    services: [
      {
        icon: <ShieldCheck size={24} />,
        iconClass: 'iconBlue',
        title: 'Comprehensive Exams',
        desc: 'Detailed evaluation of your teeth, gums, and overall oral health using digital X-rays.',
        price: 'From $99',
      },
      {
        icon: <Stethoscope size={24} />,
        iconClass: 'iconTeal',
        title: 'Professional Cleaning',
        desc: 'Removal of plaque and tartar to prevent cavities and gum disease.',
        price: 'From $120',
      },
    ],
  },
  {
    title: 'Cosmetic Dentistry',
    badge: 'Smile Design',
    badgeClass: 'badgePurple',
    services: [
      {
        icon: <Sparkles size={24} />,
        iconClass: 'iconCyan',
        title: 'Teeth Whitening',
        desc: 'Professional in-office or take-home whitening treatments for a brighter smile.',
        price: 'From $250',
      },
      {
        icon: <Smile size={24} />,
        iconClass: 'iconPink',
        title: 'Porcelain Veneers',
        desc: 'Custom-made shells to cover the front surface of teeth, improving their appearance.',
        price: 'From $800 / tooth',
      },
    ],
  },
  {
    title: 'Restorative Dentistry',
    badge: 'Advanced Care',
    badgeClass: 'badgeGreen',
    services: [
      {
        icon: <Heart size={24} />,
        iconClass: 'iconRose',
        title: 'Dental Implants',
        desc: 'Permanent replacement for missing teeth that look and function like natural teeth.',
        price: 'Consultation Required',
        cta: 'Consultation',
      },
      {
        icon: <Zap size={24} />,
        iconClass: 'iconAmber',
        title: 'Crowns & Bridges',
        desc: 'Restore damaged or missing teeth with high-quality ceramic restorations.',
        price: 'From $900',
      },
    ],
  },
];

export const Services = () => {
  const navigate = useNavigate();

  return (
    <div className={`container animate-fade-in ${styles.servicesPage}`}>
      <div className={styles.pageHeader}>
        <span className={styles.pageLabel}>Our Services</span>
        <h1 className={styles.pageTitle}>Comprehensive Dental Care</h1>
        <p className={styles.pageSubtitle}>
          High-quality dental care tailored to your unique needs. We use state-of-the-art technology to ensure your comfort and the best possible results.
        </p>
      </div>

      {categories.map((category) => (
        <section key={category.title} className={styles.categorySection}>
          <div className={styles.categoryHeader}>
            <h2 className={styles.categoryTitle}>{category.title}</h2>
            <span className={`${styles.categoryBadge} ${styles[category.badgeClass]}`}>
              {category.badge}
            </span>
          </div>
          <div className={styles.servicesGrid}>
            {category.services.map((service) => (
              <Card key={service.title} hoverable className={styles.serviceCard}>
                <CardBody>
                  <div className={`${styles.serviceIcon} ${styles[service.iconClass]}`}>
                    {service.icon}
                  </div>
                  <CardTitle style={{ marginBottom: 'var(--space-2)' }}>{service.title}</CardTitle>
                  <p className="text-muted">{service.desc}</p>
                  <div className={styles.priceTag}>{service.price}</div>
                </CardBody>
                <CardFooter>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => navigate('/register')}
                  >
                    {service.cta || 'Book Now'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};
