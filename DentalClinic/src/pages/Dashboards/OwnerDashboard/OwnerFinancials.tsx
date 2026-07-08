import React from 'react';
import { DollarSign, Download, Calendar, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { RevenueChart } from '../../../components/Charts';
import { Table } from '../../../components/Table';
import { Badge } from '../../../components/Badge';
import { useToast } from '../../../components/Toast';

export const OwnerFinancials = () => {
  const { showToast } = useToast();

  const chartData = [
    { name: 'Jan', revenue: 32000 },
    { name: 'Feb', revenue: 35000 },
    { name: 'Mar', revenue: 41000 },
    { name: 'Apr', revenue: 38000 },
    { name: 'May', revenue: 45000 },
    { name: 'Jun', revenue: 42000 },
    { name: 'Jul', revenue: 48000 },
  ];

  const transactions = [
    { id: 'TXN-8091', date: 'Oct 15, 2026', type: 'Insurance Claim', provider: 'BlueCross', amount: '+$1,250.00', status: 'Cleared', period: 'October 2026' },
    { id: 'TXN-8092', date: 'Oct 15, 2026', type: 'Patient Payment', provider: 'Credit Card (Visa)', amount: '+$150.00', status: 'Cleared', period: 'October 2026' },
    { id: 'TXN-8093', date: 'Oct 14, 2026', type: 'Vendor Payment', provider: 'DentalSupplies Inc', amount: '-$840.00', status: 'Pending', period: 'October 2026' },
    { id: 'TXN-8094', date: 'Oct 12, 2026', type: 'Payroll', provider: 'Staff Accounts', amount: '-$12,450.00', status: 'Cleared', period: 'October 2026' },
  ];

  const columns = [
    { header: 'Transaction ID', accessor: 'id' as const },
    { header: 'Date', accessor: 'date' as const },
    { header: 'Type', accessor: 'type' as const },
    { header: 'Source/Destination', accessor: 'provider' as const },
    { 
      header: 'Amount', 
      accessor: (row: any) => (
        <span style={{ color: row.amount.startsWith('+') ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 'var(--font-weight-medium)' }}>
          {row.amount}
        </span>
      )
    },
    { 
      header: 'Status', 
      accessor: (row: any) => (
        <Badge variant={row.status === 'Cleared' ? 'success' : 'warning'}>
          {row.status}
        </Badge>
      )
    },
    { 
      header: 'Actions', 
      accessor: (row: any) => (
        <Button variant="ghost" size="sm" leftIcon={<Download size={14} />} onClick={() => showToast(`Downloading report for ${row.period}...`, 'success')}>Download PDF</Button>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 className="h3">Financial Reports</h1>
          <p className="text-muted">Detailed breakdown of clinic revenue, expenses, and profitability.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <Button variant="outline" leftIcon={<Filter size={18} />} onClick={() => showToast('Financial filters applied.', 'info')}>Filter by Date</Button>
          <Button variant="primary" leftIcon={<Download size={18} />} onClick={() => showToast('Exporting complete ledger...', 'info')}>Export Complete Ledger</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6" style={{ marginBottom: 'var(--space-8)' }}>
        <Card>
          <CardBody style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Total Revenue (MTD)</div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>$45,240</div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Total Expenses (MTD)</div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>$18,450</div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Net Profit (MTD)</div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>$26,790</div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card style={{ marginBottom: 'var(--space-8)' }}>
        <CardHeader>
          <CardTitle>Revenue Trend (Last 7 Months)</CardTitle>
        </CardHeader>
        <CardBody style={{ paddingTop: 'var(--space-4)' }}>
          <RevenueChart data={chartData} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>
          <Table data={transactions} columns={columns} keyExtractor={(row) => row.id} />
        </div>
      </Card>
    </div>
  );
};
