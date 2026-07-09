import React from 'react';
import { Card, CardBody } from '../../components/Card';
import { Linkedin, Mail } from 'lucide-react';
import styles from './Team.module.css';

const teamMembers = [
  {
    name: 'Dr. Sarah Jenkins',
    role: 'Lead Dentist (DDS)',
    specialty: 'Cosmetic & Restorative',
    bio: 'With over 15 years of experience, Dr. Jenkins specializes in cosmetic and restorative dentistry, helping patients achieve their dream smiles.',
    gradient: 'gradient1',
    initials: 'SJ',
  },
  {
    name: 'Dr. Michael Chen',
    role: 'Orthodontist',
    specialty: 'Invisalign Certified',
    bio: 'Dr. Chen is passionate about correcting smiles and improving function. He is a certified Invisalign provider with a gentle approach.',
    gradient: 'gradient2',
    initials: 'MC',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Lead Dental Hygienist',
    specialty: 'Preventive Care',
    bio: 'Emily is dedicated to patient education and preventive care. Her gentle touch makes dental cleanings a comfortable experience.',
    gradient: 'gradient3',
    initials: 'ER',
  },
];

export const Team = () => {
  return (
    <div className={`container animate-fade-in ${styles.teamPage}`}>
      <div className={styles.pageHeader}>
        <span className={styles.pageLabel}>Our Team</span>
        <h1 className={styles.pageTitle}>Meet Our Expert Team</h1>
        <p className={styles.pageSubtitle}>
          Our team of highly qualified dental professionals is dedicated to providing you with the best possible care in a warm, welcoming environment.
        </p>
      </div>

      <div className={styles.teamGrid}>
        {teamMembers.map((member) => (
          <Card key={member.name} hoverable className={styles.memberCard}>
            <div className={`${styles.memberImage} ${styles[member.gradient]}`}>
              <span className={styles.initials}>{member.initials}</span>
              <div className={styles.memberOverlay}>
                <button className={styles.socialBtn} aria-label="LinkedIn">
                  <Linkedin size={18} />
                </button>
                <button className={styles.socialBtn} aria-label="Email">
                  <Mail size={18} />
                </button>
              </div>
            </div>
            <CardBody className={styles.memberInfo}>
              <span className={styles.specialtyBadge}>{member.specialty}</span>
              <h3 className={styles.memberName}>{member.name}</h3>
              <p className={styles.memberRole}>{member.role}</p>
              <p className={styles.memberBio}>{member.bio}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};
