import React from 'react';
import { Users, Calendar, Settings, Shield, Activity, Database, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useToast } from '../../../components/Toast';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 className="h3">System Administration</h1>
        <p className="text-muted">Manage system health, users, and global configurations.</p>
      </div>

      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: 'var(--space-8)' }}>
        <Card>
          <CardBody style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Total Users</div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>1,248</div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>System Uptime</div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>99.9%</div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-warning-light)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Storage Used</div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>45%</div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <Button variant="outline" size="sm" leftIcon={<Server size={14} />} onClick={() => showToast('Connecting to log server...', 'info')}>System Logs</Button>
            <Button variant="outline" size="sm" leftIcon={<Shield size={14} />} onClick={() => navigate('/dashboard/admin/settings')}>Security</Button>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Navigation</CardTitle>
          </CardHeader>
          <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <Button variant="ghost" style={{ justifyContent: 'flex-start' }} leftIcon={<Users size={18} />} onClick={() => navigate('/dashboard/admin/users')}>Manage Users & Roles</Button>
            <Button variant="ghost" style={{ justifyContent: 'flex-start' }} leftIcon={<Calendar size={18} />} onClick={() => navigate('/dashboard/admin/appointments')}>Global Appointments</Button>
            <Button variant="ghost" style={{ justifyContent: 'flex-start' }} leftIcon={<Settings size={18} />} onClick={() => navigate('/dashboard/admin/settings')}>System Settings</Button>
            <Button variant="ghost" style={{ justifyContent: 'flex-start' }} leftIcon={<Activity size={18} />} onClick={() => navigate('/dashboard/admin/cms')}>Manage Content</Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Admin Activity</CardTitle>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
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
