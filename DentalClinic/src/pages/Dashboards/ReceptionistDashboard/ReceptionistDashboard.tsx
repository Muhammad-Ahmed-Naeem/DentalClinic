import React, { useState } from 'react';
import { Users, Calendar, Clock, UserPlus, CreditCard, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useToast } from '../../../components/Toast';

export const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [schedule, setSchedule] = useState([
    { id: 1, time: '09:00 AM', patient: 'Emily Chen', status: 'Checked In', type: 'Teeth Cleaning' },
    { id: 2, time: '09:30 AM', patient: 'Michael Smith', status: 'Waiting', type: 'Root Canal' },
    { id: 3, time: '10:30 AM', patient: 'Sarah Williams', status: 'Scheduled', type: 'Cavity Filling' }
  ]);

  const handleCheckIn = (id: number) => {
    setSchedule(schedule.map(appt => 
      appt.id === id ? { ...appt, status: 'Checked In' } : appt
    ));
    showToast('Patient checked in successfully.', 'success');
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 className="h3">Front Desk Overview</h1>
        <p className="text-muted">Manage today's appointments and walk-in patients.</p>
      </div>

      <div className="grid grid-cols-3 gap-6" style={{ marginBottom: 'var(--space-8)' }}>
        <Card>
          <CardBody style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Today's Patients</div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>24</div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-warning-light)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Waiting Room</div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>3</div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <Button variant="primary" leftIcon={<UserPlus size={18} />} onClick={() => navigate('/dashboard/receptionist/patients')}>New Walk-in</Button>
            <Button variant="outline" leftIcon={<CreditCard size={18} />} onClick={() => navigate('/dashboard/receptionist/billing')}>Collect Payment</Button>
          </CardBody>
        </Card>
      </div>

      <h2 className="h4" style={{ marginBottom: 'var(--space-4)' }}>Today's Schedule</h2>
      <Card>
        {schedule.map((appt, index) => (
          <div key={appt.id} style={{ 
            padding: 'var(--space-4)', 
            borderBottom: index < schedule.length - 1 ? '1px solid var(--color-border-light)' : 'none', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            backgroundColor: appt.status === 'Waiting' ? 'var(--color-warning-light)' : 'transparent'
          }}>
            <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
              <span style={{ fontWeight: 'var(--font-weight-bold)', width: '80px', color: appt.status === 'Scheduled' ? 'var(--color-text-muted)' : 'inherit' }}>{appt.time}</span>
              <div style={{ paddingLeft: 'var(--space-4)', borderLeft: `3px solid ${appt.status === 'Checked In' ? 'var(--color-success)' : appt.status === 'Waiting' ? 'var(--color-warning)' : 'var(--color-border)'}` }}>
                <p style={{ margin: 0, fontWeight: 'var(--font-weight-medium)' }}>{appt.patient}</p>
                <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{appt.status} • {appt.type}</p>
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
