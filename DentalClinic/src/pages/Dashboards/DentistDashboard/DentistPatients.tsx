import React, { useState } from 'react';
import { Search, UserPlus, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Table } from '../../../components/Table';
import { Input } from '../../../components/Input';
import { Badge } from '../../../components/Badge';

export const DentistPatients = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const patients = [
    { id: 'PT-101', name: 'John Doe', age: 34, lastVisit: 'Oct 15, 2026', status: 'Active' },
    { id: 'PT-102', name: 'Emily Chen', age: 28, lastVisit: 'Sep 02, 2026', status: 'Active' },
    { id: 'PT-103', name: 'Michael Smith', age: 45, lastVisit: 'Jan 14, 2026', status: 'Inactive' },
    { id: 'PT-104', name: 'Sarah Williams', age: 52, lastVisit: 'Oct 14, 2026', status: 'Active' },
  ];

  const columns = [
    { header: 'Patient ID', accessor: 'id' as const },
    { header: 'Name', accessor: 'name' as const },
    { header: 'Age', accessor: 'age' as const },
    { header: 'Last Visit', accessor: 'lastVisit' as const },
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
        <Button variant="ghost" size="sm">View Chart</Button>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 className="h3">My Patients</h1>
          <p className="text-muted">Manage patient records and medical histories.</p>
        </div>
      </div>

      <Card>
        <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flex: 1, maxWidth: '500px' }}>
            <Input 
              placeholder="Search by name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              iconLeft={<Search size={18} />}
            />
            <Button variant="outline" leftIcon={<Filter size={18} />}>Filter</Button>
          </div>
        </CardHeader>
        <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>
          <Table data={patients} columns={columns} keyExtractor={(row) => row.id} />
        </div>
      </Card>
    </div>
  );
};
