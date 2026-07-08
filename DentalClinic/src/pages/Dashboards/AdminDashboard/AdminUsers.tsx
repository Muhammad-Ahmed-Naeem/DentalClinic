import React, { useState } from 'react';
import { Search, UserPlus, Filter } from 'lucide-react';
import { Card, CardHeader } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Table } from '../../../components/Table';
import { Input } from '../../../components/Input';
import { Badge } from '../../../components/Badge';
import { Modal } from '../../../components/Modal';
import { useToast } from '../../../components/Toast';

export const AdminUsers = () => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Patient' });

  const [users, setUsers] = useState([
    { id: 'USR-001', name: 'Alice Johnson', email: 'alice@example.com', role: 'Patient', status: 'Active' },
    { id: 'USR-002', name: 'Dr. Robert Smith', email: 'robert@example.com', role: 'Dentist', status: 'Active' },
    { id: 'USR-003', name: 'Jane Williams', email: 'jane@example.com', role: 'Receptionist', status: 'Pending' },
    { id: 'USR-004', name: 'Mark Taylor', email: 'mark@example.com', role: 'Patient', status: 'Inactive' },
  ]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (isEditMode) {
      setUsers(users.map(u => 
        u.id === editId ? { ...u, ...formData } : u
      ));
      showToast('User updated successfully.', 'success');
    } else {
      const newUser = {
        id: `USR-00${users.length + 1}`,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: 'Active'
      };
      setUsers([newUser, ...users]);
      showToast('User created successfully.', 'success');
    }

    setIsAddUserModalOpen(false);
    setIsEditMode(false);
    setEditId('');
    setFormData({ name: '', email: '', role: 'Patient' });
  };

  const handleEditUser = (user: any) => {
    setFormData({ name: user.name, email: user.email, role: user.role });
    setIsEditMode(true);
    setEditId(user.id);
    setIsAddUserModalOpen(true);
  };

  const handleToggleSuspend = (id: string) => {
    setUsers(users.map(user => {
      if (user.id === id) {
        return { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return user;
    }));
  };

  const filteredUsers = users.filter(usr => 
    usr.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    usr.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usr.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { header: 'User ID', accessor: 'id' as const },
    { header: 'Name', accessor: 'name' as const },
    { header: 'Email', accessor: 'email' as const },
    { 
      header: 'Role', 
      accessor: (row: any) => (
        <Badge variant={row.role === 'Dentist' ? 'primary' : row.role === 'Receptionist' ? 'warning' : 'default'}>
          {row.role}
        </Badge>
      )
    },
    { 
      header: 'Status', 
      accessor: (row: any) => (
        <Badge variant={row.status === 'Active' ? 'success' : row.status === 'Pending' ? 'warning' : 'danger'}>
          {row.status}
        </Badge>
      )
    },
    { 
      header: 'Actions', 
      accessor: (row: any) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button variant="ghost" size="sm" onClick={() => handleEditUser(row)}>Edit</Button>
          <Button 
            variant="outline" 
            size="sm" 
            style={{ 
              color: row.status === 'Active' ? 'var(--color-danger)' : 'var(--color-success)', 
              borderColor: row.status === 'Active' ? 'var(--color-danger)' : 'var(--color-success)' 
            }}
            onClick={() => handleToggleSuspend(row.id)}
          >
            {row.status === 'Active' ? 'Suspend' : 'Activate'}
          </Button>
        </div>
      )
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 className="h3">User Management</h1>
          <p className="text-muted">Manage system access, roles, and user accounts.</p>
        </div>
        <Button variant="primary" leftIcon={<UserPlus size={18} />} onClick={() => {
          setIsEditMode(false);
          setFormData({ name: '', email: '', role: 'Patient' });
          setIsAddUserModalOpen(true);
        }}>
          Add New User
        </Button>
      </div>

      <Card>
        <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flex: 1, maxWidth: '600px' }}>
            <Input 
              placeholder="Search by name, email, or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              iconLeft={<Search size={18} />}
            />
            <Button variant="outline" leftIcon={<Filter size={18} />} onClick={() => showToast('Role filter applied.', 'info')}>Filter Roles</Button>
          </div>
        </CardHeader>
        <div style={{ padding: '0 var(--space-4) var(--space-4)' }}>
          <Table data={filteredUsers} columns={columns} keyExtractor={(row) => row.id} />
        </div>
      </Card>

      <Modal 
        isOpen={isAddUserModalOpen} 
        onClose={() => setIsAddUserModalOpen(false)} 
        title={isEditMode ? "Edit User" : "Create System User"}
      >
        <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input 
            label="Full Name" 
            placeholder="Jane Doe" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required 
          />
          <Input 
            label="Email Address" 
            type="email"
            placeholder="jane@example.com" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required 
          />
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 'var(--font-weight-medium)' }}>Assign Role</label>
            <select 
              style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option>Patient</option>
              <option>Dentist</option>
              <option>Receptionist</option>
              <option>Admin</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
            <Button variant="outline" type="button" onClick={() => setIsAddUserModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Create User</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
