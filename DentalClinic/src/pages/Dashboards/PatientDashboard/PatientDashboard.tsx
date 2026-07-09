import React from 'react';
import { Calendar, Clock, FileText, CreditCard, Activity, Video, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { StatWidget } from '../../../components/StatWidget';
import { useToast } from '../../../components/Toast';
import styles from '../Dashboard.module.css';

export const PatientDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleTelehealth = () => {
    showToast('Starting secure telehealth connection...', 'info');
    setTimeout(() => showToast('Waiting for Dr. Sarah Jenkins to join...', 'info'), 1500);
  };

  const handleMessage = () => {
    showToast('Messaging portal opened.', 'success');
  };

  return (
    <div>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Welcome back, John!</h1>
        <p className={styles.dashboardSubtitle}>Here is a summary of your dental health and upcoming visits.</p>
      </div>

      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: 'var(--space-8)' }}>
        <StatWidget
          label="Upcoming Visits"
          value="2"
          icon={<Calendar size={22} />}
          iconVariant="primary"
          trend={{ value: 'Next: Oct 15', direction: 'up' }}
          sparkline={[3, 5, 4, 6, 5, 7, 6]}
        />
        <StatWidget
          label="Outstanding Balance"
          value="$0"
          icon={<CreditCard size={22} />}
          iconVariant="success"
          trend={{ value: 'All paid up', direction: 'up' }}
        />
        <StatWidget
          label="Records on File"
          value="12"
          icon={<FileText size={22} />}
          iconVariant="warning"
          sparkline={[2, 4, 3, 5, 4, 6, 5]}
        />
        <StatWidget
          label="Health Score"
          value="94%"
          icon={<Activity size={22} />}
          iconVariant="success"
          trend={{ value: '+2% this month', direction: 'up' }}
        />
      </div>

      <div className="grid grid-cols-3 gap-6" style={{ marginBottom: 'var(--space-8)' }}>
        <Card style={{ gridColumn: 'span 2' }}>
          <CardHeader>
            <CardTitle>Next Appointment</CardTitle>
          </CardHeader>
          <CardBody style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
              <div className={styles.dateBadge}>
                <span className={styles.dateBadgeMonth}>OCT</span>
                <span className={styles.dateBadgeDay}>15</span>
              </div>
              <div>
                <h3 className={styles.appointmentTitle}>Teeth Cleaning & Checkup</h3>
                <div className={styles.appointmentMeta}>
                  <span className={styles.metaItem}><Clock size={14} /> 10:00 AM</span>
                  <span className={styles.metaItem}><Activity size={14} /> Dr. Sarah Jenkins</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <Button variant="outline" onClick={() => navigate('/dashboard/patient/appointments')}>Reschedule</Button>
              <Button variant="primary" leftIcon={<Video size={16} />} onClick={handleTelehealth}>Join Telehealth</Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardBody className={styles.quickActions}>
            <Button variant="ghost" style={{ justifyContent: 'flex-start' }} leftIcon={<Calendar size={18} />} onClick={() => navigate('/dashboard/patient/appointments')}>Book Appointment</Button>
            <Button variant="ghost" style={{ justifyContent: 'flex-start' }} leftIcon={<MessageSquare size={18} />} onClick={handleMessage}>Message Dentist</Button>
            <Button variant="ghost" style={{ justifyContent: 'flex-start' }} leftIcon={<CreditCard size={18} />} onClick={() => navigate('/dashboard/patient/billing')}>Pay Bill</Button>
            <Button variant="ghost" style={{ justifyContent: 'flex-start' }} leftIcon={<FileText size={18} />} onClick={() => navigate('/dashboard/patient/records')}>View Records</Button>
          </CardBody>
        </Card>
      </div>

      <h2 className={styles.sectionTitle}>Recent Activity</h2>
      <Card>
        <div className={styles.activityItem}>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <div className={`${styles.activityIcon} ${styles.activityIconSuccess}`}>
              <CreditCard size={16} />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 'var(--font-weight-medium)' }}>Payment Received</p>
              <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>$150.00 applied to Invoice #INV-2026-001</p>
            </div>
          </div>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Yesterday</span>
        </div>
        <div className={styles.activityItem}>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <div className={`${styles.activityIcon} ${styles.activityIconPrimary}`}>
              <FileText size={16} />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 'var(--font-weight-medium)' }}>New X-Ray Results Available</p>
              <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Dr. Jenkins uploaded new records.</p>
            </div>
          </div>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Oct 10, 2026</span>
        </div>
      </Card>
    </div>
  );
};
