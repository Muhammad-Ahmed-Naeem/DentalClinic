import React, { useState } from 'react';
import { Save, Image as ImageIcon, FileText, Settings, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { Tabs } from '../../../components/Tabs';
import { useToast } from '../../../components/Toast';

export const AdminCMS = () => {
  const { showToast } = useToast();
  
  const handleSave = (section: string) => {
    showToast(`${section} content saved successfully. Changes are now live.`, 'success');
  };

  const tabItems = [
    {
      id: 'pages',
      label: 'Website Pages',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Card>
            <CardHeader>
              <CardTitle>Homepage Banners</CardTitle>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <Input label="Main Hero Headline" defaultValue="Premium Dental Care for a Brighter Smile" />
                <Input label="Main Hero Subheadline" defaultValue="Experience world-class dentistry in a modern, comfortable environment." />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                  <Button variant="primary" leftIcon={<Save size={18} />} onClick={() => handleSave('Homepage')}>Save Changes</Button>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Services Overview</CardTitle>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <Input label="Services Section Title" defaultValue="Our Featured Services" />
                <Input label="Services Section Description" defaultValue="We offer a comprehensive range of dental services using the latest technology to ensure the best possible outcomes." />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                  <Button variant="primary" leftIcon={<Save size={18} />} onClick={() => handleSave('Services')}>Save Changes</Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )
    },
    {
      id: 'pricing',
      label: 'Pricing & Services',
      content: (
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <CardTitle>Manage Pricing</CardTitle>
              <Button variant="outline" size="sm" leftIcon={<Plus size={16} />}>Add Service</Button>
            </div>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-end' }}>
                <div style={{ flex: 2 }}><Input label="Service Name" defaultValue="Comprehensive Exams" /></div>
                <div style={{ flex: 1 }}><Input label="Price (From)" defaultValue="$99" /></div>
                <Button variant="outline" style={{ marginBottom: '2px' }}>Update</Button>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-end' }}>
                <div style={{ flex: 2 }}><Input label="Service Name" defaultValue="Professional Cleaning" /></div>
                <div style={{ flex: 1 }}><Input label="Price (From)" defaultValue="$120" /></div>
                <Button variant="outline" style={{ marginBottom: '2px' }}>Update</Button>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-end' }}>
                <div style={{ flex: 2 }}><Input label="Service Name" defaultValue="Teeth Whitening" /></div>
                <div style={{ flex: 1 }}><Input label="Price (From)" defaultValue="$250" /></div>
                <Button variant="outline" style={{ marginBottom: '2px' }}>Update</Button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                <Button variant="primary" leftIcon={<Save size={18} />} onClick={() => handleSave('Pricing catalog')}>Save All</Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )
    },
    {
      id: 'media',
      label: 'Gallery & Media',
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Clinic Gallery Images</CardTitle>
          </CardHeader>
          <CardBody>
            <div style={{ 
              border: '2px dashed var(--color-border)', 
              borderRadius: 'var(--radius-lg)', 
              padding: 'var(--space-8)', 
              textAlign: 'center',
              backgroundColor: 'var(--color-background-alt)',
              marginBottom: 'var(--space-6)'
            }}>
              <ImageIcon size={48} color="var(--color-text-secondary)" style={{ margin: '0 auto var(--space-4)' }} />
              <h3 style={{ marginBottom: 'var(--space-2)' }}>Upload New Image</h3>
              <p className="text-muted" style={{ marginBottom: 'var(--space-4)' }}>Drag and drop images here, or click to browse.</p>
              <Button variant="outline" onClick={() => showToast('File browser opened.', 'info')}>Select Files</Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
              {/* Mock images in gallery */}
              <div style={{ height: '150px', backgroundColor: '#e2e8f0', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Image 1</div>
              <div style={{ height: '150px', backgroundColor: '#e2e8f0', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Image 2</div>
              <div style={{ height: '150px', backgroundColor: '#e2e8f0', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Image 3</div>
            </div>
          </CardBody>
        </Card>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 className="h3">Content Management System</h1>
          <p className="text-muted">Update website text, manage pricing, and upload media.</p>
        </div>
      </div>

      <Tabs items={tabItems} defaultActiveId="pages" />
    </div>
  );
};
