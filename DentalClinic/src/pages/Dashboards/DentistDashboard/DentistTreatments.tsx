import React, { useState } from 'react';
import { Plus, Edit3 } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Table } from '../../../components/Table';
import { Badge } from '../../../components/Badge';
import { Modal } from '../../../components/Modal';
import { Input } from '../../../components/Input';

export const DentistTreatments = () => {
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState('');
  const [formData, setFormData] = useState({ patient: '', procedure: '', status: 'Completed', notes: '' });

  const [treatments, setTreatments] = useState([
    { id: 'TR-101', patient: 'John Doe', procedure: 'Teeth Cleaning', date: 'Oct 15, 2026', status: 'In Progress' },
    { id: 'TR-102', patient: 'Sarah Williams', procedure: 'Cavity Filling', date: 'Oct 15, 2026', status: 'Pending' },
    { id: 'TR-103', patient: 'Emily Chen', procedure: 'Routine Checkup', date: 'Oct 14, 2026', status: 'Completed' },
  ]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient || !formData.procedure) return;

    if (isEditMode) {
      setTreatments(treatments.map(t => 
        t.id === editId ? { ...t, ...formData, date: t.date } : t
      ));
    } else {
      const newTreatment = {
        id: `TR-${Math.floor(Math.random() * 900) + 100}`,
        patient: formData.patient,
        procedure: formData.procedure,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: formData.status
      };
      setTreatments([newTreatment, ...treatments]);
    }

    setIsNoteModalOpen(false);
    setIsEditMode(false);
    setEditId('');
    setFormData({ patient: '', procedure: '', status: 'Completed', notes: '' });
  };

  const handleEditNote = (treatment: any) => {
    setFormData({
      patient: treatment.patient,
      procedure: treatment.procedure,
      status: treatment.status,
      notes: 'Initial clinical notes retrieved.'
    });
    setIsEditMode(true);
    setEditId(treatment.id);
    setIsNoteModalOpen(true);
  };

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
        <Button variant="ghost" size="sm" leftIcon={<Edit3 size={14} />} onClick={() => handleEditNote(row)}>Edit Note</Button>
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
        <Button variant="primary" leftIcon={<Plus size={18} />} onClick={() => {
          setIsEditMode(false);
          setFormData({ patient: '', procedure: '', status: 'Completed', notes: '' });
          setIsNoteModalOpen(true);
        }}>
          New Clinical Note
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Treatments</CardTitle>
        </CardHeader>
        <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>
          <Table data={treatments} columns={columns} keyExtractor={(row) => row.id} />
        </div>
      </Card>

      <Modal 
        isOpen={isNoteModalOpen} 
        onClose={() => setIsNoteModalOpen(false)} 
        title={isEditMode ? "Edit Clinical Note" : "Add Clinical Note"}
        size="lg"
      >
        <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Patient Name" 
              placeholder="e.g. John Doe"
              value={formData.patient}
              onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
              required 
            />
            <Input 
              label="Procedure" 
              placeholder="e.g. Cavity Filling"
              value={formData.procedure}
              onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 'var(--font-weight-medium)' }}>Status</label>
            <select 
              style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option>Completed</option>
              <option>In Progress</option>
              <option>Pending</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 'var(--font-weight-medium)' }}>Clinical Notes</label>
            <textarea 
              style={{ width: '100%', minHeight: '150px', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', resize: 'vertical' }}
              placeholder="Enter detailed clinical findings, materials used, etc..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            ></textarea>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
            <Button variant="outline" type="button" onClick={() => setIsNoteModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Note</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
