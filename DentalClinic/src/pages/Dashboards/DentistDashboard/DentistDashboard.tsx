import React from 'react';
import { Users, Calendar, Clock, Activity, ChevronRight, MessageSquare, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useToast } from '../../../components/Toast';

export const DentistDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleMessages = () => {
    showToast('You have 3 unread messages from patients.', 'info');
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 className="h3">Good Morning, Dr. Jenkins</h1>
        <p className="text-muted">You have 8 appointments scheduled for today.</p>
      </div>

      <div className="grid grid-cols-3 gap-6" style={{ marginBottom: 'var(--space-8)' }}>
        <Card style={{ gridColumn: 'span 2' }}>
          <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <CardTitle>Up Next</CardTitle>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', fontWeight: 'var(--font-weight-medium)' }}>In 15 mins</span>
          </CardHeader>
          <CardBody style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                backgroundColor: 'var(--color-background)',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-secondary)'
              }}>
                <Users size={24} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--font-size-lg)' }}>Michael Smith</h3>
                <div style={{ display: 'flex', gap: 'var(--space-3)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}><Clock size={14} /> 09:30 AM</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}><Activity size={14} /> Root Canal Prep</span>
                </div>
              </div>
            </div>
            <Button variant="primary" onClick={() => navigate('/dashboard/dentist/patients')}>View Patient Chart</Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <Button variant="ghost" style={{ justifyContent: 'flex-start' }} leftIcon={<Calendar size={18} />} onClick={() => navigate('/dashboard/dentist/treatments')}>View Schedule</Button>
            <Button variant="ghost" style={{ justifyContent: 'flex-start' }} leftIcon={<Search size={18} />} onClick={() => navigate('/dashboard/dentist/patients')}>Patient Search</Button>
            <Button variant="ghost" style={{ justifyContent: 'flex-start' }} leftIcon={<MessageSquare size={18} />} onClick={handleMessages}>Messages (3)</Button>
          </CardBody>
        </Card>
      </div>

      <h2 className="h4" style={{ marginBottom: 'var(--space-4)' }}>Today's Schedule</h2>
      <Card>
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <span style={{ fontWeight: 'var(--font-weight-bold)', width: '80px' }}>09:00 AM</span>
            <div style={{ paddingLeft: 'var(--space-4)', borderLeft: '3px solid var(--color-success)' }}>
              <p style={{ margin: 0, fontWeight: 'var(--font-weight-medium)' }}>Emily Chen</p>
              <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Completed • Teeth Cleaning</p>
            </div>
          </div>
        </div>
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-primary-light)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <span style={{ fontWeight: 'var(--font-weight-bold)', width: '80px' }}>09:30 AM</span>
            <div style={{ paddingLeft: 'var(--space-4)', borderLeft: '3px solid var(--color-primary)' }}>
              <p style={{ margin: 0, fontWeight: 'var(--font-weight-medium)' }}>Michael Smith</p>
              <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Waiting • Root Canal Prep</p>
            </div>
          </div>
        </div>
        <div style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <span style={{ fontWeight: 'var(--font-weight-bold)', width: '80px', color: 'var(--color-text-muted)' }}>10:30 AM</span>
            <div style={{ paddingLeft: 'var(--space-4)', borderLeft: '3px solid var(--color-border)' }}>
              <p style={{ margin: 0, fontWeight: 'var(--font-weight-medium)' }}>Sarah Williams</p>
              <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Scheduled • Cavity Filling</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
