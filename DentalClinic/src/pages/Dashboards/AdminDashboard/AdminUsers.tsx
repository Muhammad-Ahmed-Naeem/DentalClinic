import React, { useState } from 'react';
import { Search, UserPlus, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Table } from '../../../components/Table';
import { Input } from '../../../components/Input';
import { Badge } from '../../../components/Badge';

export const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const users = [
    { id: 'USR-001', name: 'Alice Johnson', email: 'alice@example.com', role: 'Patient', status: 'Active' },
    { id: 'USR-002', name: 'Dr. Robert Smith', email: 'robert@example.com', role: 'Dentist', status: 'Active' },
    { id: 'USR-003', name: 'Jane Williams', email: 'jane@example.com', role: 'Receptionist', status: 'Pending' },
    { id: 'USR-004', name: 'Mark Taylor', email: 'mark@example.com', role: 'Patient', status: 'Inactive' },
  ];

  const columns = [
    { header: 'User ID', accessor: 'id' as const },
    { header: 'Name', accessor: 'name' as const },
    { header: 'Email', accessor: 'email' as const },
    { 
      header: 'Role', 
      accessor: (row: any) => (
        <Badge variant={row.role === 'Dentist' ? 'primary' : row.role === 'Receptionist' ? 'warning' : 'default'}>
          {row.role}
        </Badge>
      )
    },
    { 
      header: 'Status', 
      accessor: (row: any) => (
        <Badge variant={row.status === 'Active' ? 'success' : row.status === 'Pending' ? 'warning' : 'danger'}>
          {row.status}
        </Badge>
      )
    },
    { 
      header: 'Actions', 
      accessor: (row: any) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button variant="ghost" size="sm">Edit</Button>
          <Button variant="outline" size="sm" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>Suspend</Button>
        </div>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 className="h3">User Management</h1>
          <p className="text-muted">Manage system access, roles, and user accounts.</p>
        </div>
        <Button variant="primary" leftIcon={<UserPlus size={18} />}>Add New User</Button>
      </div>

      <Card>
        <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flex: 1, maxWidth: '600px' }}>
            <Input 
              placeholder="Search by name, email, or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              iconLeft={<Search size={18} />}
            />
            <Button variant="outline" leftIcon={<Filter size={18} />}>Filter Roles</Button>
          </div>
        </CardHeader>
        <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>
          <Table data={users} columns={columns} keyExtractor={(row) => row.id} />
        </div>
      </Card>
    </div>
  );
};
