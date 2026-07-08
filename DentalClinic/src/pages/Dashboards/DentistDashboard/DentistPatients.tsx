import React, { useState } from 'react';
import { Search, UserPlus, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Table } from '../../../components/Table';
import { Input } from '../../../components/Input';
import { Badge } from '../../../components/Badge';
import { Modal } from '../../../components/Modal';
import { useToast } from '../../../components/Toast';

export const DentistPatients = () => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const patients = [
    { id: 'PT-101', name: 'John Doe', age: 34, lastVisit: 'Oct 15, 2026', status: 'Active' },
    { id: 'PT-102', name: 'Emily Chen', age: 28, lastVisit: 'Sep 02, 2026', status: 'Active' },
    { id: 'PT-103', name: 'Michael Smith', age: 45, lastVisit: 'Jan 14, 2026', status: 'Inactive' },
    { id: 'PT-104', name: 'Sarah Williams', age: 52, lastVisit: 'Oct 14, 2026', status: 'Active' },
  ];

  const filteredPatients = patients.filter(pt => 
    pt.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    pt.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewChart = (patient: any) => {
    setSelectedPatient(patient);
    setIsChartModalOpen(true);
  };

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
        <Button variant="ghost" size="sm" onClick={() => handleViewChart(row)}>View Chart</Button>
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
            <Button variant="outline" leftIcon={<Filter size={18} />} onClick={() => showToast('Advanced filtering options opened.', 'info')}>Filter</Button>
          </div>
        </CardHeader>
        <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>
          <Table data={filteredPatients} columns={columns} keyExtractor={(row) => row.id} />
        </div>
      </Card>

      <Modal 
        isOpen={isChartModalOpen} 
        onClose={() => setIsChartModalOpen(false)} 
        title="Patient Chart"
        size="lg"
      >
        {selectedPatient && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted" style={{ margin: '0 0 var(--space-1)' }}>Name</p>
                <h4 style={{ margin: 0 }}>{selectedPatient.name}</h4>
              </div>
              <div>
                <p className="text-muted" style={{ margin: '0 0 var(--space-1)' }}>Status</p>
                <Badge variant="success">Active</Badge>
              </div>
              <div>
                <p className="text-muted" style={{ margin: '0 0 var(--space-1)' }}>Last Visit</p>
                <p style={{ margin: 0, fontWeight: 'var(--font-weight-medium)' }}>{selectedPatient.lastVisit}</p>
              </div>
              <div>
                <p className="text-muted" style={{ margin: '0 0 var(--space-1)' }}>Next Appt</p>
                <p style={{ margin: 0, fontWeight: 'var(--font-weight-medium)' }}>{selectedPatient.nextAppt}</p>
              </div>
            </div>
            
            <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
              <h5 style={{ margin: '0 0 var(--space-3)' }}>Clinical Summary</h5>
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                Patient has a history of mild gingivitis. Last routine cleaning completed with no major issues. Monitor tooth #14 for potential early cavity development. X-rays are up to date.
              </p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
              <Button variant="primary" onClick={() => setIsChartModalOpen(false)}>Close Chart</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
