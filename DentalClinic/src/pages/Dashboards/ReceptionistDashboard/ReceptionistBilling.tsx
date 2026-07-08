import React, { useState } from 'react';
import { Search, DollarSign, Plus } from 'lucide-react';
import { Card, CardHeader } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Table } from '../../../components/Table';
import { Input } from '../../../components/Input';
import { Badge } from '../../../components/Badge';
import { Modal } from '../../../components/Modal';
import { useToast } from '../../../components/Toast';

export const ReceptionistBilling = () => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [formData, setFormData] = useState({ patient: '', amount: '' });

  const [invoices, setInvoices] = useState([
    { id: 'INV-001', patient: 'John Doe', amount: 150.00, date: 'Oct 15, 2026', status: 'Unpaid' },
    { id: 'INV-002', patient: 'Emily Chen', amount: 85.00, date: 'Oct 15, 2026', status: 'Paid' },
    { id: 'INV-003', patient: 'Michael Smith', amount: 210.00, date: 'Oct 14, 2026', status: 'Paid' },
  ]);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient || !formData.amount) return;

    const newInvoice = {
      id: `INV-${Math.floor(Math.random() * 900) + 100}`,
      patient: formData.patient,
      amount: parseFloat(formData.amount),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Unpaid'
    };

    setInvoices([newInvoice, ...invoices]);
    setIsInvoiceModalOpen(false);
    setFormData({ patient: '', amount: '' });
  };

  const handleCollectPayment = (id: string) => {
    setInvoices(invoices.map(inv => 
      inv.id === id ? { ...inv, status: 'Paid' } : inv
    ));
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inv.patient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { header: 'Invoice ID', accessor: 'id' as const },
    { header: 'Patient', accessor: 'patient' as const },
    { 
      header: 'Amount', 
      accessor: (row: any) => `$${row.amount.toFixed(2)}`
    },
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
            <Button variant="primary" size="sm" leftIcon={<DollarSign size={14} />} onClick={() => handleCollectPayment(row.id)}>
              Collect
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => showToast(`Receipt generated for ${row.id}.`, 'success')}>Receipt</Button>
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
        <Button variant="primary" leftIcon={<Plus size={18} />} onClick={() => setIsInvoiceModalOpen(true)}>Create Invoice</Button>
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
          <Table data={filteredInvoices} columns={columns} keyExtractor={(row) => row.id} />
        </div>
      </Card>

      <Modal 
        isOpen={isInvoiceModalOpen} 
        onClose={() => setIsInvoiceModalOpen(false)} 
        title="Create New Invoice"
      >
        <form onSubmit={handleCreateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input 
            label="Patient Name" 
            placeholder="John Doe" 
            value={formData.patient}
            onChange={(e) => setFormData({...formData, patient: e.target.value})}
            required 
          />
          <Input 
            label="Invoice Amount ($)" 
            type="number"
            min="0"
            step="0.01"
            placeholder="150.00" 
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            required 
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
            <Button variant="outline" type="button" onClick={() => setIsInvoiceModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Generate Invoice</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
