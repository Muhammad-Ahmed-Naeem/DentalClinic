import React from 'react';
import { Users, Calendar, Settings, Shield, Activity, Database, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { StatWidget } from '../../../components/StatWidget';
import { useToast } from '../../../components/Toast';
import styles from '../Dashboard.module.css';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  return (
    <div>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>System Administration</h1>
        <p className={styles.dashboardSubtitle}>Manage system health, users, and global configurations.</p>
      </div>

      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: 'var(--space-8)' }}>
        <StatWidget label="Total Users" value="1,248" icon={<Users size={22} />} iconVariant="primary" trend={{ value: '+24 this month', direction: 'up' }} sparkline={[1100, 1150, 1180, 1200, 1220, 1240, 1248]} />
        <StatWidget label="System Uptime" value="99.9%" icon={<Activity size={22} />} iconVariant="success" trend={{ value: 'All systems operational', direction: 'up' }} />
        <StatWidget label="Storage Used" value="45%" icon={<Database size={22} />} iconVariant="warning" trend={{ value: '2.1 TB of 4.7 TB', direction: 'down' }} />
        <Card hoverable>
          <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <Button variant="outline" size="sm" leftIcon={<Server size={14} />} onClick={() => showToast('Connecting to log server...', 'info')}>System Logs</Button>
            <Button variant="outline" size="sm" leftIcon={<Shield size={14} />} onClick={() => navigate('/dashboard/admin/settings')}>Security</Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Quick Navigation</CardTitle></CardHeader>
          <CardBody className={styles.quickActions}>
            <Button variant="ghost" style={{ justifyContent: 'flex-start' }} leftIcon={<Users size={18} />} onClick={() => navigate('/dashboard/admin/users')}>Manage Users & Roles</Button>
            <Button variant="ghost" style={{ justifyContent: 'flex-start' }} leftIcon={<Calendar size={18} />} onClick={() => navigate('/dashboard/admin/appointments')}>Global Appointments</Button>
            <Button variant="ghost" style={{ justifyContent: 'flex-start' }} leftIcon={<Settings size={18} />} onClick={() => navigate('/dashboard/admin/settings')}>System Settings</Button>
            <Button variant="ghost" style={{ justifyContent: 'flex-start' }} leftIcon={<Activity size={18} />} onClick={() => navigate('/dashboard/admin/cms')}>Manage Content</Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Admin Activity</CardTitle></CardHeader>
          <CardBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <div style={{ paddingTop: 'var(--space-1)' }}><Shield size={16} style={{ color: 'var(--color-warning)' }} /></div>
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-medium)' }}>User Account Suspended</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Admin suspended PT-104.</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>2 hours ago</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <div style={{ paddingTop: 'var(--space-1)' }}><Database size={16} style={{ color: 'var(--color-success)' }} /></div>
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-medium)' }}>Automated Backup Completed</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>System backup stored in AWS S3.</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>12 hours ago</div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
