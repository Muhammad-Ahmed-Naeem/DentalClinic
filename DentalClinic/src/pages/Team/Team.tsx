import React from 'react';
import { Card, CardBody } from '../../components/Card';
import { UserCircle } from 'lucide-react';
import styles from './Team.module.css';

export const Team = () => {
  return (
    <div className={`container animate-fade-in ${styles.teamPage}`}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Meet Our Expert Team</h1>
        <p className={styles.pageSubtitle}>
          Our team of highly qualified dental professionals is dedicated to providing you with the best possible care in a warm, welcoming environment.
        </p>
      </div>

      <div className={styles.teamGrid}>
        <Card hoverable style={{ border: 'none' }}>
          <div className={styles.memberImage}>
             <UserCircle size={64} />
          </div>
          <CardBody className={styles.memberInfo}>
            <h3 className={styles.memberName}>Dr. Sarah Jenkins</h3>
            <p className={styles.memberRole}>Lead Dentist (DDS)</p>
            <p className={styles.memberBio}>
              With over 15 years of experience, Dr. Jenkins specializes in cosmetic and restorative dentistry, helping patients achieve their dream smiles.
            </p>
          </CardBody>
        </Card>

        <Card hoverable style={{ border: 'none' }}>
          <div className={styles.memberImage}>
             <UserCircle size={64} />
          </div>
          <CardBody className={styles.memberInfo}>
            <h3 className={styles.memberName}>Dr. Michael Chen</h3>
            <p className={styles.memberRole}>Orthodontist</p>
            <p className={styles.memberBio}>
              Dr. Chen is passionate about correcting smiles and improving function. He is a certified Invisalign provider with a gentle approach.
            </p>
          </CardBody>
        </Card>

        <Card hoverable style={{ border: 'none' }}>
          <div className={styles.memberImage}>
             <UserCircle size={64} />
          </div>
          <CardBody className={styles.memberInfo}>
            <h3 className={styles.memberName}>Emily Rodriguez</h3>
            <p className={styles.memberRole}>Lead Dental Hygienist</p>
            <p className={styles.memberBio}>
              Emily is dedicated to patient education and preventive care. Her gentle touch makes dental cleanings a comfortable experience.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
