import React from 'react';
import { Users, Calendar, Clock, FileText } from 'lucide-react';
import { Card, CardBody, CardTitle, CardHeader } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Badge } from '../../../components/Badge';

export const DentistDashboard = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 className="h3">Good Morning, Dr. Jenkins!</h1>
          <p className="text-muted">You have 5 appointments scheduled for today.</p>
        </div>
        <Button variant="primary">Block Schedule</Button>
      </div>

      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: 'var(--space-8)' }}>
        <Card>
          <CardBody>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={24} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>5</div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Today's Appointments</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={24} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>2</div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>New Patients</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div style={{ gridColumn: 'span 2' }}>
          <Card>
            <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <CardTitle>Today's Schedule</CardTitle>
              <Badge variant="primary">Oct 15, 2026</Badge>
            </CardHeader>
            <div style={{ padding: '0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                    <td style={{ padding: 'var(--space-4) var(--space-6)', width: '100px', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>09:00 AM</td>
                    <td style={{ padding: 'var(--space-4) var(--space-6)' }}>
                      <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>Emily Chen</div>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Routine Checkup</div>
                    </td>
                    <td style={{ padding: 'var(--space-4) var(--space-6)' }}><Badge variant="success">Completed</Badge></td>
                    <td style={{ padding: 'var(--space-4) var(--space-6)', textAlign: 'right' }}><Button variant="outline" size="sm">View Record</Button></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--color-border-light)', backgroundColor: 'var(--color-primary-light)' }}>
                    <td style={{ padding: 'var(--space-4) var(--space-6)', width: '100px', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>10:00 AM</td>
                    <td style={{ padding: 'var(--space-4) var(--space-6)' }}>
                      <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>John Doe</div>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Teeth Cleaning</div>
                    </td>
                    <td style={{ padding: 'var(--space-4) var(--space-6)' }}><Badge variant="primary">In Progress</Badge></td>
                    <td style={{ padding: 'var(--space-4) var(--space-6)', textAlign: 'right' }}><Button variant="primary" size="sm">Add Notes</Button></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                    <td style={{ padding: 'var(--space-4) var(--space-6)', width: '100px', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>11:30 AM</td>
                    <td style={{ padding: 'var(--space-4) var(--space-6)' }}>
                      <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>Sarah Williams</div>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Cavity Filling</div>
                    </td>
                    <td style={{ padding: 'var(--space-4) var(--space-6)' }}><Badge variant="warning">Waiting</Badge></td>
                    <td style={{ padding: 'var(--space-4) var(--space-6)', textAlign: 'right' }}><Button variant="outline" size="sm">View Record</Button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Patient Notes</CardTitle>
            </CardHeader>
            <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                  <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Emily Chen</span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>1h ago</span>
                </div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>No cavities found. Recommended softer bristle brush.</p>
              </div>
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                  <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Mark Taylor</span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Yesterday</span>
                </div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Needs follow-up for lower right molar sensitivity.</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
