import React from 'react';
import { CreditCard, Download, DollarSign, FileText } from 'lucide-react';
import { Card, CardBody, CardTitle, CardHeader } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Table } from '../../../components/Table';
import { Badge } from '../../../components/Badge';

export const PatientBilling = () => {
  const invoices = [
    { id: 'INV-2026-001', date: 'Apr 10, 2026', description: 'Teeth Cleaning & Polish', amount: '$150.00', status: 'Paid' },
    { id: 'INV-2025-089', date: 'Dec 15, 2025', description: 'Full Mouth Panoramic X-Ray', amount: '$85.00', status: 'Paid' },
    { id: 'INV-2025-042', date: 'Aug 05, 2025', description: 'Composite Filling', amount: '$210.00', status: 'Paid' },
  ];

  const columns = [
    { header: 'Invoice #', accessor: 'id' as const },
    { header: 'Date', accessor: 'date' as const },
    { header: 'Description', accessor: 'description' as const },
    { header: 'Amount', accessor: 'amount' as const },
    { 
      header: 'Status', 
      accessor: (row: any) => (
        <Badge variant={row.status === 'Paid' ? 'success' : 'danger'}>
          {row.status}
        </Badge>
      )
    },
    { 
      header: 'Action', 
      accessor: (row: any) => (
        <Button variant="ghost" size="sm" leftIcon={<Download size={14} />}>
          Receipt
        </Button>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 className="h3">Billing & Payments</h1>
          <p className="text-muted">Manage your invoices and payment methods.</p>
        </div>
        <Button variant="primary" leftIcon={<CreditCard size={18} />}>Make a Payment</Button>
      </div>

      <div className="grid grid-cols-2 gap-6" style={{ marginBottom: 'var(--space-8)' }}>
        <Card>
          <CardBody style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Outstanding Balance</div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>$0.00</div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Insurance on File</div>
              <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>BlueCross BlueShield</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)' }}>Update Insurance</div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>
          <Table data={invoices} columns={columns} keyExtractor={(row) => row.id} />
        </div>
      </Card>
    </div>
  );
};
