import React, { useState } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Table } from '../../../components/Table';
import { Input } from '../../../components/Input';
import { Badge } from '../../../components/Badge';

export const AdminAppointments = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const appointments = [
    { id: 'APT-1001', date: 'Oct 15, 2026', time: '09:00 AM', patient: 'Emily Chen', provider: 'Dr. Sarah Jenkins', status: 'Completed' },
    { id: 'APT-1002', date: 'Oct 15, 2026', time: '10:00 AM', patient: 'John Doe', provider: 'Dr. Sarah Jenkins', status: 'In Progress' },
    { id: 'APT-1003', date: 'Oct 15, 2026', time: '11:00 AM', patient: 'Alice Johnson', provider: 'Dr. Michael Chen', status: 'Scheduled' },
    { id: 'APT-1004', date: 'Oct 16, 2026', time: '09:30 AM', patient: 'Mark Taylor', provider: 'Dr. Robert Smith', status: 'Cancelled' },
  ];

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
        <Button variant="ghost" size="sm">Details</Button>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 className="h3">System Appointments</h1>
          <p className="text-muted">Global view of all clinic appointments and schedules.</p>
        </div>
        <Button variant="outline" leftIcon={<Download size={18} />}>Export Schedule</Button>
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
            <Button variant="outline" leftIcon={<Filter size={18} />}>Filter by Date</Button>
          </div>
        </CardHeader>
        <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>
          <Table data={appointments} columns={columns} keyExtractor={(row) => row.id} />
        </div>
      </Card>
    </div>
  );
};
