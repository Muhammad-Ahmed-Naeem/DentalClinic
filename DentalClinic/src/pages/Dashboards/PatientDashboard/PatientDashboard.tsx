import React from 'react';
import { Calendar, Clock, FileText, CreditCard, Activity, ChevronRight, Video, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useToast } from '../../../components/Toast';

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
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 className="h3">Welcome back, John!</h1>
        <p className="text-muted">Here is a summary of your dental health and upcoming visits.</p>
      </div>

      <div className="grid grid-cols-3 gap-6" style={{ marginBottom: 'var(--space-8)' }}>
        <Card style={{ gridColumn: 'span 2' }}>
          <CardHeader>
            <CardTitle>Next Appointment</CardTitle>
          </CardHeader>
          <CardBody style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                backgroundColor: 'var(--color-primary-light)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary-dark)'
              }}>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)' }}>OCT</span>
                <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)' }}>15</span>
              </div>
              <div>
                <h3 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--font-size-lg)' }}>Teeth Cleaning & Checkup</h3>
                <div style={{ display: 'flex', gap: 'var(--space-3)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}><Clock size={14} /> 10:00 AM</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}><Activity size={14} /> Dr. Sarah Jenkins</span>
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
          <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <Button variant="ghost" style={{ justifyContent: 'flex-start' }} leftIcon={<Calendar size={18} />} onClick={() => navigate('/dashboard/patient/appointments')}>Book Appointment</Button>
            <Button variant="ghost" style={{ justifyContent: 'flex-start' }} leftIcon={<MessageSquare size={18} />} onClick={handleMessage}>Message Dentist</Button>
            <Button variant="ghost" style={{ justifyContent: 'flex-start' }} leftIcon={<CreditCard size={18} />} onClick={() => navigate('/dashboard/patient/billing')}>Pay Bill</Button>
            <Button variant="ghost" style={{ justifyContent: 'flex-start' }} leftIcon={<FileText size={18} />} onClick={() => navigate('/dashboard/patient/records')}>View Records</Button>
          </CardBody>
        </Card>
      </div>

      <h2 className="h4" style={{ marginBottom: 'var(--space-4)' }}>Recent Activity</h2>
      <Card>
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <div style={{ padding: 'var(--space-2)', backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', borderRadius: 'var(--radius-full)' }}>
              <CreditCard size={16} />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 'var(--font-weight-medium)' }}>Payment Received</p>
              <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>$150.00 applied to Invoice #INV-2026-001</p>
            </div>
          </div>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Yesterday</span>
        </div>
        <div style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <div style={{ padding: 'var(--space-2)', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: 'var(--radius-full)' }}>
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
