import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Plus } from 'lucide-react';
import { Card, CardBody, CardTitle, CardHeader } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Badge } from '../../../components/Badge';
import { Table } from '../../../components/Table';
import { Tabs } from '../../../components/Tabs';
import { Modal } from '../../../components/Modal';
import { Input } from '../../../components/Input';

export const PatientAppointments = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [formData, setFormData] = useState({ date: '', time: '', service: 'Teeth Cleaning' });

  // State for upcoming appointments
  const [upcomingAppointments, setUpcomingAppointments] = useState([
    { id: '1', date: 'Oct 15, 2026', time: '10:00 AM', dentist: 'Dr. Sarah Jenkins', service: 'Teeth Cleaning', status: 'Confirmed' },
    { id: '2', date: 'Nov 20, 2026', time: '02:30 PM', dentist: 'Dr. Michael Chen', service: 'Follow-up Consult', status: 'Pending' },
  ]);

  const pastAppointments = [
    { id: '3', date: 'Apr 10, 2026', time: '09:00 AM', dentist: 'Dr. Sarah Jenkins', service: 'Teeth Cleaning', status: 'Completed' },
    { id: '4', date: 'Dec 15, 2025', time: '11:00 AM', dentist: 'Dr. Michael Chen', service: 'Orthodontic Consult', status: 'Completed' },
  ];

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.time) return;

    const newAppointment = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date(formData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: formData.time,
      dentist: 'Dr. Sarah Jenkins', // Assigned automatically for mock
      service: formData.service,
      status: 'Pending'
    };

    setUpcomingAppointments([newAppointment, ...upcomingAppointments]);
    setIsBookingModalOpen(false);
    setFormData({ date: '', time: '', service: 'Teeth Cleaning' });
  };

  const handleCancelAppointment = (id: string) => {
    setUpcomingAppointments(upcomingAppointments.filter(app => app.id !== id));
  };

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
            <Button 
              variant="outline" 
              size="sm" 
              style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
              onClick={() => handleCancelAppointment(row.id)}
            >
              Cancel
            </Button>
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
        <Button variant="primary" leftIcon={<Plus size={18} />} onClick={() => setIsBookingModalOpen(true)}>Book New Appointment</Button>
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
            {upcomingAppointments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                  <CalendarIcon size={20} style={{ color: 'var(--color-primary)' }} />
                  <div>
                    <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>{upcomingAppointments[0].date}</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{upcomingAppointments[0].time}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                  <MapPin size={20} style={{ color: 'var(--color-primary)' }} />
                  <div>
                    <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>DentalCare Main Clinic</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>123 Smile Boulevard, Suite 100</div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted">No upcoming appointments.</p>
            )}
          </CardBody>
        </Card>
      </div>

      <Modal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        title="Book New Appointment"
      >
        <form onSubmit={handleBookAppointment} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 'var(--font-weight-medium)' }}>Service Needed</label>
            <select 
              style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
            >
              <option>Teeth Cleaning</option>
              <option>Dental Consultation</option>
              <option>Cavity Filling</option>
              <option>Tooth Extraction</option>
            </select>
          </div>
          <Input 
            label="Preferred Date" 
            type="date" 
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
          <Input 
            label="Preferred Time" 
            type="time" 
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
            <Button variant="outline" type="button" onClick={() => setIsBookingModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Confirm Booking</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
