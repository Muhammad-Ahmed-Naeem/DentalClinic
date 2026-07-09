import React, { useState } from 'react';
import { Users, Clock, UserPlus, CreditCard, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Badge } from '../../../components/Badge';
import { StatWidget } from '../../../components/StatWidget';
import { useToast } from '../../../components/Toast';
import styles from '../Dashboard.module.css';

export const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [schedule, setSchedule] = useState([
    { id: 1, time: '09:00 AM', patient: 'Emily Chen', status: 'Checked In' as const, type: 'Teeth Cleaning' },
    { id: 2, time: '09:30 AM', patient: 'Michael Smith', status: 'Waiting' as const, type: 'Root Canal' },
    { id: 3, time: '10:30 AM', patient: 'Sarah Williams', status: 'Scheduled' as const, type: 'Cavity Filling' },
  ]);

  const statusVariant = (status: string) => {
    if (status === 'Checked In') return 'completed';
    if (status === 'Waiting') return 'warning';
    return 'scheduled';
  };

  const handleCheckIn = (id: number) => {
    setSchedule(schedule.map((appt) =>
      appt.id === id ? { ...appt, status: 'Checked In' as const } : appt
    ));
    showToast('Patient checked in successfully.', 'success');
  };

  return (
    <div>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Front Desk Overview</h1>
        <p className={styles.dashboardSubtitle}>Manage today's appointments and walk-in patients.</p>
      </div>

      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: 'var(--space-8)' }}>
        <StatWidget label="Today's Patients" value="24" icon={<Users size={22} />} iconVariant="primary" trend={{ value: '+8.2% vs yesterday', direction: 'up' }} sparkline={[18, 20, 22, 19, 24, 21, 24]} />
        <StatWidget label="Waiting Room" value="3" icon={<Clock size={22} />} iconVariant="warning" trend={{ value: 'Avg. wait: 12 min', direction: 'down' }} />
        <StatWidget label="Check-ins Today" value="18" icon={<CheckCircle size={22} />} iconVariant="success" trend={{ value: '+5 this hour', direction: 'up' }} />
        <Card hoverable>
          <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <Button variant="primary" leftIcon={<UserPlus size={18} />} onClick={() => navigate('/dashboard/receptionist/patients')}>New Walk-in</Button>
            <Button variant="outline" leftIcon={<CreditCard size={18} />} onClick={() => navigate('/dashboard/receptionist/billing')}>Collect Payment</Button>
          </div>
        </Card>
      </div>

      <h2 className={styles.sectionTitle}>Today's Schedule</h2>
      <Card>
        {schedule.map((appt, index) => (
          <div
            key={appt.id}
            className={`${styles.scheduleItem} ${appt.status === 'Waiting' ? styles.scheduleItemWarning : ''}`}
            style={{ borderBottom: index < schedule.length - 1 ? undefined : 'none' }}
          >
            <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', flex: 1 }}>
              <span className={`${styles.scheduleTime} ${appt.status === 'Scheduled' ? styles.scheduleTimeMuted : ''}`}>{appt.time}</span>
              <div className={`${styles.scheduleContent} ${appt.status === 'Checked In' ? styles.scheduleContentSuccess : appt.status === 'Waiting' ? styles.scheduleContentWarning : ''}`}>
                <p className={styles.schedulePatient}>{appt.patient}</p>
                <p className={styles.scheduleMeta}>
                  <Badge variant={statusVariant(appt.status)}>{appt.status}</Badge>
                  {' • '}{appt.type}
                </p>
              </div>
            </div>
            {appt.status !== 'Checked In' && (
              <Button variant="outline" size="sm" leftIcon={<CheckCircle size={14} />} onClick={() => handleCheckIn(appt.id)}>Check In</Button>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
};
