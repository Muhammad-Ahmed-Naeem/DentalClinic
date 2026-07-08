import React, { useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { Card, CardHeader } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Table } from '../../../components/Table';
import { Input } from '../../../components/Input';
import { Badge } from '../../../components/Badge';
import { Modal } from '../../../components/Modal';
import { useToast } from '../../../components/Toast';

export const ReceptionistPatients = () => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState('');
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

  const [patients, setPatients] = useState([
    { id: 'PT-101', name: 'John Doe', phone: '(555) 123-4567', email: 'john.doe@example.com', lastVisit: 'Oct 15, 2026', status: 'Active' },
    { id: 'PT-102', name: 'Emily Chen', phone: '(555) 987-6543', email: 'emily.c@example.com', lastVisit: 'Sep 02, 2026', status: 'Active' },
    { id: 'PT-103', name: 'Michael Smith', phone: '(555) 456-7890', email: 'mike.smith@example.com', lastVisit: 'Jan 14, 2026', status: 'Inactive' },
  ]);

  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    if (isEditMode) {
      setPatients(patients.map(p => 
        p.id === editId ? { ...p, ...formData } : p
      ));
      showToast('Patient updated successfully.', 'success');
    } else {
      const newPatient = {
        id: `PT-${Math.floor(Math.random() * 900) + 200}`,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        lastVisit: 'New Patient',
        status: 'Active'
      };
      setPatients([newPatient, ...patients]);
      showToast('New patient registered successfully.', 'success');
    }

    setIsRegisterModalOpen(false);
    setIsEditMode(false);
    setEditId('');
    setFormData({ name: '', phone: '', email: '' });
  };

  const handleEditPatient = (patient: any) => {
    setFormData({ name: patient.name, phone: patient.phone, email: patient.email });
    setIsEditMode(true);
    setEditId(patient.id);
    setIsRegisterModalOpen(true);
  };

  const filteredPatients = patients.filter(pt => 
    pt.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    pt.phone.includes(searchTerm) || 
    pt.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { header: 'Patient ID', accessor: 'id' as const },
    { header: 'Name', accessor: 'name' as const },
    { header: 'Phone', accessor: 'phone' as const },
    { header: 'Email', accessor: 'email' as const },
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
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button variant="ghost" size="sm" onClick={() => handleEditPatient(row)}>Edit</Button>
          <Button variant="outline" size="sm" onClick={() => showToast(`Booking portal opened for ${row.name}.`, 'info')}>Book</Button>
        </div>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 className="h3">Patient Directory</h1>
          <p className="text-muted">Manage patient information and registration.</p>
        </div>
        <Button variant="primary" leftIcon={<UserPlus size={18} />} onClick={() => {
          setIsEditMode(false);
          setFormData({ name: '', phone: '', email: '' });
          setIsRegisterModalOpen(true);
        }}>
          Register Patient
        </Button>
      </div>

      <Card>
        <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flex: 1, maxWidth: '600px' }}>
            <Input 
              placeholder="Search by name, phone, or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              iconLeft={<Search size={18} />}
            />
          </div>
        </CardHeader>
        <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>
          <Table data={filteredPatients} columns={columns} keyExtractor={(row) => row.id} />
        </div>
      </Card>

      <Modal 
        isOpen={isRegisterModalOpen} 
        onClose={() => setIsRegisterModalOpen(false)} 
        title={isEditMode ? "Edit Patient Details" : "Register New Patient"}
      >
        <form onSubmit={handleRegisterPatient} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input 
            label="Full Name" 
            placeholder="John Doe" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required 
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Phone Number" 
              type="tel"
              placeholder="(555) 000-0000" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required 
            />
            <Input 
              label="Email Address" 
              type="email"
              placeholder="john@example.com" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
            <Button variant="outline" type="button" onClick={() => setIsRegisterModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Create Patient File</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
