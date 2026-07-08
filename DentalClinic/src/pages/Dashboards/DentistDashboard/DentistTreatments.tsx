import React from 'react';
import { Plus, Edit3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Table } from '../../../components/Table';
import { Badge } from '../../../components/Badge';

export const DentistTreatments = () => {
  const treatments = [
    { id: 'TR-101', patient: 'John Doe', procedure: 'Teeth Cleaning', date: 'Oct 15, 2026', status: 'In Progress' },
    { id: 'TR-102', patient: 'Sarah Williams', procedure: 'Cavity Filling', date: 'Oct 15, 2026', status: 'Pending' },
    { id: 'TR-103', patient: 'Emily Chen', procedure: 'Routine Checkup', date: 'Oct 14, 2026', status: 'Completed' },
  ];

  const columns = [
    { header: 'Treatment ID', accessor: 'id' as const },
    { header: 'Patient', accessor: 'patient' as const },
    { header: 'Procedure', accessor: 'procedure' as const },
    { header: 'Date', accessor: 'date' as const },
    { 
      header: 'Status', 
      accessor: (row: any) => (
        <Badge variant={row.status === 'Completed' ? 'success' : row.status === 'Pending' ? 'warning' : 'primary'}>
          {row.status}
        </Badge>
      )
    },
    { 
      header: 'Actions', 
      accessor: (row: any) => (
        <Button variant="ghost" size="sm" leftIcon={<Edit3 size={14} />}>Edit Note</Button>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 className="h3">Treatment Notes</h1>
          <p className="text-muted">Document patient procedures and clinical findings.</p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={18} />}>New Clinical Note</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Treatments</CardTitle>
        </CardHeader>
        <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>
          <Table data={treatments} columns={columns} keyExtractor={(row) => row.id} />
        </div>
      </Card>
    </div>
  );
};
