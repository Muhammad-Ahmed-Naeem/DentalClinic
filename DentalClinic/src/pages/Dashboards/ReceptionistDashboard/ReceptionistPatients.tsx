import React, { useState } from 'react';
import { Search, UserPlus, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Table } from '../../../components/Table';
import { Input } from '../../../components/Input';
import { Badge } from '../../../components/Badge';

export const ReceptionistPatients = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const patients = [
    { id: 'PT-101', name: 'John Doe', phone: '(555) 123-4567', email: 'john.doe@example.com', lastVisit: 'Oct 15, 2026', status: 'Active' },
    { id: 'PT-102', name: 'Emily Chen', phone: '(555) 987-6543', email: 'emily.c@example.com', lastVisit: 'Sep 02, 2026', status: 'Active' },
    { id: 'PT-103', name: 'Michael Smith', phone: '(555) 456-7890', email: 'mike.smith@example.com', lastVisit: 'Jan 14, 2026', status: 'Inactive' },
  ];

  const columns = [
    { header: 'Patient ID', accessor: 'id' as const },
    { header: 'Name', accessor: 'name' as const },
    { header: 'Phone', accessor: 'phone' as const },
    { header: 'Email', accessor: 'email' as const },
    { 
      header: 'Status', 
      accessor: (row: any) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'default'}>
          {row.status}
        </Badge>
      )
    },
    { 
      header: 'Actions', 
      accessor: (row: any) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button variant="ghost" size="sm">Edit</Button>
          <Button variant="outline" size="sm">Book</Button>
        </div>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 className="h3">Patient Directory</h1>
          <p className="text-muted">Manage patient information and registration.</p>
        </div>
        <Button variant="primary" leftIcon={<UserPlus size={18} />}>Register Patient</Button>
      </div>

      <Card>
        <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flex: 1, maxWidth: '600px' }}>
            <Input 
              placeholder="Search by name, phone, or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              iconLeft={<Search size={18} />}
            />
          </div>
        </CardHeader>
        <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>
          <Table data={patients} columns={columns} keyExtractor={(row) => row.id} />
        </div>
      </Card>
    </div>
  );
};
