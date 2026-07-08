import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, X } from 'lucide-react';
import { Card, CardBody, CardTitle, CardHeader } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Badge } from '../../../components/Badge';
import { Table } from '../../../components/Table';
import { Tabs } from '../../../components/Tabs';

export const PatientAppointments = () => {
  const [activeTab, setActiveTab] = useState('upcoming');

  const upcomingAppointments = [
    { id: '1', date: 'Oct 15, 2026', time: '10:00 AM', dentist: 'Dr. Sarah Jenkins', service: 'Teeth Cleaning', status: 'Confirmed' },
    { id: '2', date: 'Nov 20, 2026', time: '02:30 PM', dentist: 'Dr. Michael Chen', service: 'Follow-up Consult', status: 'Pending' },
  ];

  const pastAppointments = [
    { id: '3', date: 'Apr 10, 2026', time: '09:00 AM', dentist: 'Dr. Sarah Jenkins', service: 'Teeth Cleaning', status: 'Completed' },
    { id: '4', date: 'Dec 15, 2025', time: '11:00 AM', dentist: 'Dr. Michael Chen', service: 'Orthodontic Consult', status: 'Completed' },
    { id: '5', date: 'Aug 05, 2025', time: '03:15 PM', dentist: 'Dr. Sarah Jenkins', service: 'Cavity Filling', status: 'Completed' },
  ];

  const columns = [
    { header: 'Date', accessor: 'date' as const },
    { header: 'Time', accessor: 'time' as const },
    { header: 'Dentist', accessor: 'dentist' as const },
    { header: 'Service', accessor: 'service' as const },
    { 
      header: 'Status', 
      accessor: (row: any) => (
        <Badge variant={row.status === 'Completed' || row.status === 'Confirmed' ? 'success' : row.status === 'Pending' ? 'warning' : 'default'}>
          {row.status}
        </Badge>
      )
    },
    { 
      header: 'Actions', 
      accessor: (row: any) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {row.status !== 'Completed' && (
            <Button variant="outline" size="sm" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>Cancel</Button>
          )}
          {row.status === 'Completed' && (
            <Button variant="ghost" size="sm">View Notes</Button>
          )}
        </div>
      )
    },
  ];

  const tabItems = [
    {
      id: 'upcoming',
      label: 'Upcoming Appointments',
      content: (
        <div style={{ paddingTop: 'var(--space-4)' }}>
          <Table data={upcomingAppointments} columns={columns} keyExtractor={(row) => row.id} />
        </div>
      )
    },
    {
      id: 'past',
      label: 'Past Appointments',
      content: (
        <div style={{ paddingTop: 'var(--space-4)' }}>
          <Table data={pastAppointments} columns={columns} keyExtractor={(row) => row.id} />
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 className="h3">My Appointments</h1>
          <p className="text-muted">Manage your upcoming and past dental visits.</p>
        </div>
        <Button variant="primary" leftIcon={<CalendarIcon size={18} />}>Book New Appointment</Button>
      </div>

      <Card style={{ marginBottom: 'var(--space-8)' }}>
        <CardBody>
          <Tabs tabs={tabItems} />
        </CardBody>
      </Card>
      
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Next Appointment Details</CardTitle>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                <CalendarIcon size={20} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>Thursday, October 15, 2026</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>10:00 AM - 11:00 AM</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                <MapPin size={20} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>DentalCare Main Clinic</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>123 Smile Boulevard, Suite 100, New York, NY 10001</div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)' }}>
              <Button variant="outline" fullWidth>Reschedule</Button>
              <Button variant="primary" fullWidth>Add to Calendar</Button>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Preparation Guidelines</CardTitle>
          </CardHeader>
          <CardBody>
            <ul style={{ paddingLeft: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
              <li>Please arrive 10 minutes before your scheduled time.</li>
              <li>Bring your updated insurance card and ID.</li>
              <li>Brush and floss your teeth thoroughly before coming in.</li>
              <li>If you need to cancel, please do so at least 24 hours in advance to avoid a cancellation fee.</li>
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
