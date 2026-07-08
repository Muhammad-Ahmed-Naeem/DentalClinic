import React, { useState } from 'react';
import { CreditCard, Download, DollarSign, FileText } from 'lucide-react';
import { Card, CardBody, CardTitle, CardHeader } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Table } from '../../../components/Table';
import { Badge } from '../../../components/Badge';
import { Modal } from '../../../components/Modal';
import { Input } from '../../../components/Input';

export const PatientBilling = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<string>('');
  
  const [invoices, setInvoices] = useState([
    { id: 'INV-2026-004', date: 'Oct 20, 2026', description: 'Follow-up Consult', amount: 50.00, status: 'Unpaid' },
    { id: 'INV-2026-001', date: 'Apr 10, 2026', description: 'Teeth Cleaning & Polish', amount: 150.00, status: 'Paid' },
    { id: 'INV-2025-089', date: 'Dec 15, 2025', description: 'Full Mouth Panoramic X-Ray', amount: 85.00, status: 'Paid' },
  ]);

  const outstandingBalance = invoices
    .filter(inv => inv.status === 'Unpaid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    setInvoices(invoices.map(inv => 
      inv.id === selectedInvoice ? { ...inv, status: 'Paid' } : inv
    ));
    setIsPaymentModalOpen(false);
    setSelectedInvoice('');
  };

  const columns = [
    { header: 'Invoice #', accessor: 'id' as const },
    { header: 'Date', accessor: 'date' as const },
    { header: 'Description', accessor: 'description' as const },
    { 
      header: 'Amount', 
      accessor: (row: any) => `$${row.amount.toFixed(2)}`
    },
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
        <Button 
          variant="primary" 
          leftIcon={<CreditCard size={18} />} 
          onClick={() => setIsPaymentModalOpen(true)}
          disabled={outstandingBalance === 0}
        >
          Make a Payment
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6" style={{ marginBottom: 'var(--space-8)' }}>
        <Card>
          <CardBody style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Outstanding Balance</div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>${outstandingBalance.toFixed(2)}</div>
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

      <Modal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        title="Secure Payment"
      >
        <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 'var(--font-weight-medium)' }}>Select Invoice</label>
            <select 
              style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
              value={selectedInvoice}
              onChange={(e) => setSelectedInvoice(e.target.value)}
              required
            >
              <option value="">Select an unpaid invoice...</option>
              {invoices.filter(inv => inv.status === 'Unpaid').map(inv => (
                <option key={inv.id} value={inv.id}>{inv.id} - ${inv.amount.toFixed(2)}</option>
              ))}
            </select>
          </div>
          <Input label="Card Number" placeholder="**** **** **** 4242" required />
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <Input label="Expiry Date" placeholder="MM/YY" required />
            <Input label="CVC" placeholder="123" required type="password" />
          </div>
          <Input label="Name on Card" placeholder="John Doe" required />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
            <Button variant="outline" type="button" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Pay Now</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
