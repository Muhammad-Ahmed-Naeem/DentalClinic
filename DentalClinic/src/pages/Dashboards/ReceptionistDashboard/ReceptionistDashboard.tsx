import React from 'react';
import { Search, Calendar, UserPlus, CreditCard } from 'lucide-react';
import { Card, CardBody, CardTitle, CardHeader } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Badge } from '../../../components/Badge';
import { Input } from '../../../components/Input';

export const ReceptionistDashboard = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 className="h3">Front Desk Dashboard</h1>
          <p className="text-muted">Manage appointments and patient registration.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <Button variant="outline" leftIcon={<UserPlus size={18} />}>New Patient</Button>
          <Button variant="primary" leftIcon={<Calendar size={18} />}>Book Walk-in</Button>
        </div>
      </div>

      <Card style={{ marginBottom: 'var(--space-8)' }}>
        <CardBody style={{ padding: 'var(--space-4)' }}>
          <div style={{ maxWidth: '600px' }}>
            <Input 
              placeholder="Search patients by name, phone, or ID..." 
              iconLeft={<Search size={20} />}
            />
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: 'var(--space-8)' }}>
        <Card>
          <CardBody>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>12</div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Today's Appointments</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>3</div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Checked In</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>4</div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Completed</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>$1,240</div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Payments Collected</div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <CardTitle>Appointments - Oct 15, 2026</CardTitle>
        </CardHeader>
        <div style={{ padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border-light)', backgroundColor: 'var(--color-background)' }}>
                <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>Time</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>Patient Name</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>Dentist</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>Status</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}>09:00 AM</td>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}>Emily Chen</td>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}>Dr. Sarah Jenkins</td>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}><Badge variant="success">Completed</Badge></td>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}><Button variant="ghost" size="sm">Invoice</Button></td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}>10:00 AM</td>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}>John Doe</td>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}>Dr. Sarah Jenkins</td>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}><Badge variant="primary">In Treatment</Badge></td>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}><Button variant="ghost" size="sm">Details</Button></td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}>10:30 AM</td>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}>Robert Smith</td>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}>Dr. Michael Chen</td>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}><Badge variant="warning">Checked In</Badge></td>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}><Button variant="ghost" size="sm">Details</Button></td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}>11:00 AM</td>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}>Alice Johnson</td>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}>Dr. Michael Chen</td>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}><Badge variant="default">Scheduled</Badge></td>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Check In</Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
