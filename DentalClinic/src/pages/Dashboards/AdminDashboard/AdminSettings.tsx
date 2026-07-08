import React from 'react';
import { Save, Globe, Shield, Bell, Database } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { Tabs } from '../../../components/Tabs';

export const AdminSettings = () => {
  const tabItems = [
    {
      id: 'general',
      label: 'General',
      content: (
        <div style={{ paddingTop: 'var(--space-6)', maxWidth: '600px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <Input label="Clinic Name" defaultValue="DentalCare" />
            <Input label="Support Email" type="email" defaultValue="support@dentalcare.com" />
            <Input label="Contact Phone" type="tel" defaultValue="(555) 123-4567" />
            <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
              <Button variant="primary" leftIcon={<Save size={18} />}>Save Changes</Button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      label: 'Security',
      content: (
        <div style={{ paddingTop: 'var(--space-6)', maxWidth: '600px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontWeight: 'var(--font-weight-medium)' }}>Two-Factor Authentication</div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Require 2FA for all admin accounts.</div>
              </div>
              <Button variant="outline">Enable</Button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontWeight: 'var(--font-weight-medium)' }}>Session Timeout</div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Automatically log out inactive users.</div>
              </div>
              <select style={{ padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <option>15 Minutes</option>
                <option>30 Minutes</option>
                <option>1 Hour</option>
              </select>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'system',
      label: 'System Maintenance',
      content: (
        <div style={{ paddingTop: 'var(--space-6)', maxWidth: '600px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <Database size={24} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-medium)' }}>Database Backup</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Last backup: Today at 02:00 AM</div>
                </div>
              </div>
              <Button variant="primary">Run Backup</Button>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 className="h3">System Settings</h1>
        <p className="text-muted">Configure global application settings and preferences.</p>
      </div>

      <Card>
        <CardBody>
          <Tabs tabs={tabItems} />
        </CardBody>
      </Card>
    </div>
  );
};
