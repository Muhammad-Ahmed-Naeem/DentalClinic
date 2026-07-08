import React, { useState } from 'react';
import { Search, UserPlus, Filter, Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Table } from '../../../components/Table';
import { Input } from '../../../components/Input';
import { Badge } from '../../../components/Badge';

export const OwnerStaff = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const staff = [
    { id: 'EMP-001', name: 'Dr. Sarah Jenkins', role: 'Lead Dentist', joined: 'Mar 2021', patients: 1450, rating: 4.9, status: 'Active' },
    { id: 'EMP-002', name: 'Dr. Michael Chen', role: 'Orthodontist', joined: 'Jan 2023', patients: 820, rating: 4.8, status: 'Active' },
    { id: 'EMP-003', name: 'Jane Williams', role: 'Head Receptionist', joined: 'Jun 2022', patients: '-', rating: 4.7, status: 'Active' },
    { id: 'EMP-004', name: 'Mark Taylor', role: 'Dental Hygienist', joined: 'Nov 2025', patients: 340, rating: 4.5, status: 'Active' },
  ];

  const columns = [
    { header: 'Employee ID', accessor: 'id' as const },
    { header: 'Name', accessor: 'name' as const },
    { header: 'Role', accessor: 'role' as const },
    { header: 'Joined', accessor: 'joined' as const },
    { header: 'Patients Seen', accessor: 'patients' as const },
    { 
      header: 'Rating', 
      accessor: (row: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Star size={14} fill="var(--color-warning)" color="var(--color-warning)" />
          <span>{row.rating}</span>
        </div>
      )
    },
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
        <Button variant="ghost" size="sm">Review</Button>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 className="h3">Staff Performance</h1>
          <p className="text-muted">Monitor employee KPIs, patient feedback, and HR metrics.</p>
        </div>
        <Button variant="primary" leftIcon={<UserPlus size={18} />}>Hire New Staff</Button>
      </div>

      <Card>
        <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flex: 1, maxWidth: '600px' }}>
            <Input 
              placeholder="Search by name, role, or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              iconLeft={<Search size={18} />}
            />
            <Button variant="outline" leftIcon={<Filter size={18} />}>Filter by Role</Button>
          </div>
        </CardHeader>
        <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>
          <Table data={staff} columns={columns} keyExtractor={(row) => row.id} />
        </div>
      </Card>
    </div>
  );
};
