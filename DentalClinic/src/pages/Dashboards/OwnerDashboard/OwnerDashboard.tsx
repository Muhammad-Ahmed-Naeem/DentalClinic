import React from 'react';
import { DollarSign, Users, Activity } from 'lucide-react';
import { Card, CardBody, CardTitle, CardHeader } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { StatWidget } from '../../../components/StatWidget';
import { RevenueChart } from '../../../components/Charts';
import { Table } from '../../../components/Table';
import { useToast } from '../../../components/Toast';
import styles from '../Dashboard.module.css';

const revenueData = [
  { name: 'Jan', revenue: 32000 },
  { name: 'Feb', revenue: 35000 },
  { name: 'Mar', revenue: 38000 },
  { name: 'Apr', revenue: 36000 },
  { name: 'May', revenue: 42000 },
  { name: 'Jun', revenue: 45200 },
];

const staffData = [
  { id: '1', dentist: 'Dr. Sarah Jenkins', appointments: 145, rating: '4.9/5' },
  { id: '2', dentist: 'Dr. Michael Chen', appointments: 120, rating: '4.8/5' },
];

export const OwnerDashboard = () => {
  const { showToast } = useToast();

  return (
    <div>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.dashboardTitle}>Business Overview</h1>
          <p className={styles.dashboardSubtitle}>High-level insights into clinic performance and financials.</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outline" onClick={() => showToast('Exporting data...', 'info')}>Export Data</Button>
          <Button variant="primary" onClick={() => showToast('Compiling executive summary. Download will begin shortly.', 'info')}>Generate Financial Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: 'var(--space-8)' }}>
        <StatWidget label="Monthly Revenue" value="$45.2k" icon={<DollarSign size={22} />} iconVariant="success" trend={{ value: '+12.4% this month', direction: 'up' }} sparkline={[32, 35, 38, 36, 42, 44, 45]} />
        <StatWidget label="New Patients" value="128" icon={<Users size={22} />} iconVariant="primary" trend={{ value: '+5% from last month', direction: 'up' }} sparkline={[90, 95, 100, 110, 115, 120, 128]} />
        <StatWidget label="Appointments" value="342" icon={<Activity size={22} />} iconVariant="warning" trend={{ value: '-2% from last month', direction: 'down' }} sparkline={[350, 340, 345, 338, 342, 340, 342]} />
        <StatWidget label="Avg. Revenue/Patient" value="$352" icon={<DollarSign size={22} />} iconVariant="success" trend={{ value: '+8.1% this quarter', direction: 'up' }} />
      </div>

      <div className="grid grid-cols-2 gap-8">
        <Card>
          <CardHeader><CardTitle>Revenue Trends</CardTitle></CardHeader>
          <CardBody>
            <RevenueChart data={revenueData} height={280} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Staff Performance</CardTitle></CardHeader>
          <CardBody style={{ padding: 0 }}>
            <Table
              columns={[
                { header: 'Dentist', accessor: 'dentist' },
                { header: 'Appointments', accessor: 'appointments' },
                { header: 'Rating', accessor: 'rating' },
              ]}
              data={staffData}
              keyExtractor={(row) => row.id}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
