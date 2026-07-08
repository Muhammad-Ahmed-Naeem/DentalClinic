import React, { useState } from 'react';
import { Search, DollarSign, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Table } from '../../../components/Table';
import { Input } from '../../../components/Input';
import { Badge } from '../../../components/Badge';

export const ReceptionistBilling = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const invoices = [
    { id: 'INV-001', patient: 'John Doe', amount: '$150.00', date: 'Oct 15, 2026', status: 'Unpaid' },
    { id: 'INV-002', patient: 'Emily Chen', amount: '$85.00', date: 'Oct 15, 2026', status: 'Paid' },
    { id: 'INV-003', patient: 'Michael Smith', amount: '$210.00', date: 'Oct 14, 2026', status: 'Paid' },
  ];

  const columns = [
    { header: 'Invoice ID', accessor: 'id' as const },
    { header: 'Patient', accessor: 'patient' as const },
    { header: 'Amount', accessor: 'amount' as const },
    { header: 'Date', accessor: 'date' as const },
    { 
      header: 'Status', 
      accessor: (row: any) => (
        <Badge variant={row.status === 'Paid' ? 'success' : 'danger'}>
          {row.status}
        </Badge>
      )
    },
    { 
      header: 'Actions', 
      accessor: (row: any) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {row.status === 'Unpaid' ? (
            <Button variant="primary" size="sm" leftIcon={<DollarSign size={14} />}>Collect</Button>
          ) : (
            <Button variant="ghost" size="sm">Receipt</Button>
          )}
        </div>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 className="h3">Billing & Invoices</h1>
          <p className="text-muted">Manage patient payments and generate invoices.</p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={18} />}>Create Invoice</Button>
      </div>

      <Card>
        <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flex: 1, maxWidth: '600px' }}>
            <Input 
              placeholder="Search by invoice ID or patient name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              iconLeft={<Search size={18} />}
            />
          </div>
        </CardHeader>
        <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>
          <Table data={invoices} columns={columns} keyExtractor={(row) => row.id} />
        </div>
      </Card>
    </div>
  );
};
