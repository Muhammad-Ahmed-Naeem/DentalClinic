import React, { useState } from 'react';
import { Search, Filter, Download, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardHeader } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Table } from '../../../components/Table';
import { Input } from '../../../components/Input';
import { Badge } from '../../../components/Badge';
import { Modal } from '../../../components/Modal';
import { useToast } from '../../../components/Toast';

export const AdminAppointments = () => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const appointments = [
    { id: 'APT-1001', date: 'Oct 15, 2026', time: '09:00 AM', patient: 'Emily Chen', provider: 'Dr. Sarah Jenkins', status: 'Completed', dentist: 'Dr. Sarah Jenkins', service: 'Checkup' },
    { id: 'APT-1002', date: 'Oct 15, 2026', time: '10:00 AM', patient: 'John Doe', provider: 'Dr. Sarah Jenkins', status: 'In Progress', dentist: 'Dr. Sarah Jenkins', service: 'Cleaning' },
    { id: 'APT-1003', date: 'Oct 15, 2026', time: '11:00 AM', patient: 'Alice Johnson', provider: 'Dr. Michael Chen', status: 'Scheduled', dentist: 'Dr. Michael Chen', service: 'Consultation' },
    { id: 'APT-1004', date: 'Oct 16, 2026', time: '09:30 AM', patient: 'Mark Taylor', provider: 'Dr. Robert Smith', status: 'Cancelled', dentist: 'Dr. Robert Smith', service: 'Surgery' },
  ];

  const handleViewDetails = (appt: any) => {
    setSelectedAppt(appt);
    setIsDetailsModalOpen(true);
  };

  const columns = [
    { header: 'ID', accessor: 'id' as const },
    { header: 'Date', accessor: 'date' as const },
    { header: 'Time', accessor: 'time' as const },
    { header: 'Patient', accessor: 'patient' as const },
    { header: 'Provider', accessor: 'provider' as const },
    { 
      header: 'Status', 
      accessor: (row: any) => (
        <Badge variant={row.status === 'Completed' ? 'success' : row.status === 'In Progress' ? 'primary' : row.status === 'Scheduled' ? 'default' : 'danger'}>
          {row.status}
        </Badge>
      )
    },
    { 
      header: 'Actions', 
      accessor: (row: any) => (
        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(row)}>Details</Button>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 className="h3">Global Schedule</h1>
          <p className="text-muted">View all appointments across the entire clinic.</p>
        </div>
        <Button variant="outline" leftIcon={<Download size={18} />} onClick={() => showToast('Exporting global schedule to PDF...', 'info')}>Export Schedule</Button>
      </div>

      <Card>
        <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flex: 1, maxWidth: '700px' }}>
            <Input 
              placeholder="Search by ID, patient, or provider..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              iconLeft={<Search size={18} />}
            />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <Button variant="outline" leftIcon={<CalendarIcon size={18} />} onClick={() => showToast('Date picker opened.', 'info')}>Filter by Date</Button>
          </div>
        </CardHeader>
        <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>
          <Table data={appointments} columns={columns} keyExtractor={(row) => row.id} />
        </div>
      </Card>

      <Modal 
        isOpen={isDetailsModalOpen} 
        onClose={() => setIsDetailsModalOpen(false)} 
        title="Appointment Details"
      >
        {selectedAppt && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted" style={{ margin: '0 0 var(--space-1)' }}>Patient</p>
                <h4 style={{ margin: 0 }}>{selectedAppt.patient}</h4>
              </div>
              <div>
                <p className="text-muted" style={{ margin: '0 0 var(--space-1)' }}>Dentist</p>
                <h4 style={{ margin: 0 }}>{selectedAppt.dentist}</h4>
              </div>
              <div>
                <p className="text-muted" style={{ margin: '0 0 var(--space-1)' }}>Time</p>
                <p style={{ margin: 0, fontWeight: 'var(--font-weight-medium)' }}>{selectedAppt.time}</p>
              </div>
              <div>
                <p className="text-muted" style={{ margin: '0 0 var(--space-1)' }}>Status</p>
                <Badge variant={selectedAppt.status === 'Completed' ? 'success' : selectedAppt.status === 'Pending' ? 'warning' : 'primary'}>{selectedAppt.status}</Badge>
              </div>
            </div>
            
            <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
              <h5 style={{ margin: '0 0 var(--space-3)' }}>Service Details</h5>
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                Service booked: {selectedAppt.service}. Notes: Patient requires special consideration due to mild anxiety.
              </p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
              <Button variant="primary" onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
