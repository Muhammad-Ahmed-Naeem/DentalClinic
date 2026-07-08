import React from 'react';
import { FileText, Download, Activity, HeartPulse } from 'lucide-react';
import { Card, CardBody, CardTitle, CardHeader } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Table } from '../../../components/Table';
import { useToast } from '../../../components/Toast';

export const PatientRecords = () => {
  const { showToast } = useToast();

  const records = [
    { id: 'r1', date: 'Apr 10, 2026', type: 'Treatment Plan', description: 'Teeth Cleaning & Polish', dentist: 'Dr. Sarah Jenkins' },
    { id: 'r2', date: 'Dec 15, 2025', type: 'X-Ray', description: 'Full Mouth Panoramic X-Ray', dentist: 'Dr. Michael Chen' },
    { id: 'r3', date: 'Aug 05, 2025', type: 'Clinical Note', description: 'Composite Filling on tooth #14', dentist: 'Dr. Sarah Jenkins' },
  ];

  const columns = [
    { header: 'Date', accessor: 'date' as const },
    { header: 'Type', accessor: 'type' as const },
    { header: 'Description', accessor: 'description' as const },
    { header: 'Dentist', accessor: 'dentist' as const },
    { 
      header: 'Actions', 
      accessor: (row: any) => (
        <Button 
          variant="ghost" 
          size="sm" 
          leftIcon={<Download size={14} />}
          onClick={() => showToast(`Downloading ${row.type}...`, 'success')}
        >
          Download PDF
        </Button>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 className="h3">Medical Records</h1>
          <p className="text-muted">Access your clinical history, x-rays, and treatment plans.</p>
        </div>
        <Button 
          variant="outline" 
          leftIcon={<FileText size={18} />}
          onClick={() => showToast('Compiling complete medical history. Download will begin shortly.', 'info')}
        >
          Export Complete History
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6" style={{ marginBottom: 'var(--space-8)' }}>
        <Card>
          <CardBody style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HeartPulse size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Blood Type</div>
              <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>O+</div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Allergies</div>
              <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>Penicillin</div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-warning-light)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Active Conditions</div>
              <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>None</div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clinical History</CardTitle>
        </CardHeader>
        <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>
          <Table data={records} columns={columns} keyExtractor={(row) => row.id} />
        </div>
      </Card>
    </div>
  );
};
