import React from 'react';
import { Users, Calendar, Clock, Activity, MessageSquare, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Badge } from '../../../components/Badge';
import { StatWidget } from '../../../components/StatWidget';
import { useToast } from '../../../components/Toast';
import styles from '../Dashboard.module.css';

export const DentistDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleMessages = () => {
    showToast('You have 3 unread messages from patients.', 'info');
  };

  const schedule = [
    { time: '09:00 AM', patient: 'Emily Chen', status: 'Completed', type: 'Teeth Cleaning', variant: 'completed' as const, borderClass: styles.scheduleContentSuccess },
    { time: '09:30 AM', patient: 'Michael Smith', status: 'Waiting', type: 'Root Canal Prep', variant: 'warning' as const, borderClass: styles.scheduleContentPrimary, active: true },
    { time: '10:30 AM', patient: 'Sarah Williams', status: 'Scheduled', type: 'Cavity Filling', variant: 'scheduled' as const, borderClass: styles.scheduleContentWarning, muted: true },
  ];

  return (
    <div>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Good Morning, Dr. Jenkins</h1>
        <p className={styles.dashboardSubtitle}>You have 8 appointments scheduled for today.</p>
      </div>

      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: 'var(--space-8)' }}>
        <StatWidget label="Today's Appointments" value="8" icon={<Calendar size={22} />} iconVariant="primary" trend={{ value: '+12.4% this week', direction: 'up' }} sparkline={[4, 6, 5, 8, 7, 9, 8]} />
        <StatWidget label="Patients Seen" value="5" icon={<Users size={22} />} iconVariant="success" trend={{ value: 'On track', direction: 'up' }} />
        <StatWidget label="Pending Messages" value="3" icon={<MessageSquare size={22} />} iconVariant="warning" />
        <StatWidget label="Avg. Wait Time" value="8 min" icon={<Clock size={22} />} iconVariant="primary" trend={{ value: '-15% vs last week', direction: 'up' }} />
      </div>

      <div className="grid grid-cols-3 gap-6" style={{ marginBottom: 'var(--space-8)' }}>
        <Card style={{ gridColumn: 'span 2' }}>
          <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <CardTitle>Up Next</CardTitle>
            <Badge variant="warning">In 15 mins</Badge>
          </CardHeader>
          <CardBody style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
              <div style={{ width: 60, height: 60, background: 'var(--gradient-primary-soft)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', border: '1px solid rgba(14, 165, 233, 0.15)' }}>
                <Users size={24} />
              </div>
              <div>
                <h3 className={styles.appointmentTitle}>Michael Smith</h3>
                <div className={styles.appointmentMeta}>
                  <span className={styles.metaItem}><Clock size={14} /> 09:30 AM</span>
                  <span className={styles.metaItem}><Activity size={14} /> Root Canal Prep</span>
                </div>
              </div>
            </div>
            <Button variant="primary" onClick={() => navigate('/dashboard/dentist/patients')}>View Patient Chart</Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <CardBody className={styles.quickActions}>
            <Button variant="ghost" style={{ justifyContent: 'flex-start' }} leftIcon={<Calendar size={18} />} onClick={() => navigate('/dashboard/dentist/treatments')}>View Schedule</Button>
            <Button variant="ghost" style={{ justifyContent: 'flex-start' }} leftIcon={<Search size={18} />} onClick={() => navigate('/dashboard/dentist/patients')}>Patient Search</Button>
            <Button variant="ghost" style={{ justifyContent: 'flex-start' }} leftIcon={<MessageSquare size={18} />} onClick={handleMessages}>Messages (3)</Button>
          </CardBody>
        </Card>
      </div>

      <h2 className={styles.sectionTitle}>Today's Schedule</h2>
      <Card>
        {schedule.map((item, index) => (
          <div
            key={item.time}
            className={`${styles.scheduleItem} ${item.active ? styles.scheduleItemActive : ''}`}
            style={{ borderBottom: index < schedule.length - 1 ? undefined : 'none' }}
          >
            <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', flex: 1 }}>
              <span className={`${styles.scheduleTime} ${item.muted ? styles.scheduleTimeMuted : ''}`}>{item.time}</span>
              <div className={`${styles.scheduleContent} ${item.borderClass}`}>
                <p className={styles.schedulePatient}>{item.patient}</p>
                <p className={styles.scheduleMeta}>
                  <Badge variant={item.variant}>{item.status}</Badge>
                  {' • '}{item.type}
                </p>
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};
