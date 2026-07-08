import React from 'react';
import { Calendar, Clock, FileText, CreditCard } from 'lucide-react';
import { Card, CardBody, CardTitle } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Badge } from '../../../components/Badge';

export const PatientDashboard = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 className="h3">Welcome back, John!</h1>
          <p className="text-muted">Here is your dental health overview.</p>
        </div>
        <Button variant="primary" leftIcon={<Calendar size={18} />}>Book Appointment</Button>
      </div>

      <div className="grid grid-cols-3 gap-6" style={{ marginBottom: 'var(--space-8)' }}>
        <Card>
          <CardBody>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={20} />
              </div>
              <div>
                <CardTitle>Upcoming</CardTitle>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Next Appointment</div>
              </div>
            </div>
            <div style={{ marginTop: 'var(--space-4)' }}>
              <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>Oct 15, 2026 at 10:00 AM</div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Teeth Cleaning with Dr. Sarah Jenkins</div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={20} />
              </div>
              <div>
                <CardTitle>Latest Report</CardTitle>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Treatment Plan</div>
              </div>
            </div>
            <div style={{ marginTop: 'var(--space-4)' }}>
              <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>Routine Checkup</div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>No issues found. Keep up the good work!</div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={20} />
              </div>
              <div>
                <CardTitle>Outstanding</CardTitle>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Current Balance</div>
              </div>
            </div>
            <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>$0.00</div>
              <Badge variant="success">Paid in Full</Badge>
            </div>
          </CardBody>
        </Card>
      </div>

      <h2 className="h4" style={{ marginBottom: 'var(--space-4)' }}>Recent Appointments</h2>
      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border-light)', backgroundColor: 'var(--color-background)' }}>
                <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>Date</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>Dentist</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>Service</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>Status</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}>Apr 10, 2026</td>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}>Dr. Sarah Jenkins</td>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}>Teeth Cleaning</td>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}><Badge variant="success">Completed</Badge></td>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}><Button variant="ghost" size="sm">View Notes</Button></td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}>Dec 15, 2025</td>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}>Dr. Michael Chen</td>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}>Orthodontic Consult</td>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}><Badge variant="success">Completed</Badge></td>
                <td style={{ padding: 'var(--space-3) var(--space-4)' }}><Button variant="ghost" size="sm">View Notes</Button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
