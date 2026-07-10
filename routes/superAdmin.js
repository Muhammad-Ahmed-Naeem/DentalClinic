import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { allowRoles } from '../middleware/roleCheck.js';
import { upload } from '../middleware/upload.js';
import * as sa from '../controllers/superAdminController.js';

const router = Router();

router.use(authenticateToken, allowRoles('admin', 'super_admin'));

// Dashboard & Analytics
router.get('/dashboard/stats', sa.getDashboardStats);
router.get('/analytics/revenue', sa.getRevenueAnalytics);
router.get('/analytics/appointments', sa.getAppointmentAnalytics);

// Users & Roles
router.get('/users', sa.getUsers);
router.post('/users', sa.createUser);
router.put('/users/:id', sa.updateUser);
router.delete('/users/:id', sa.deleteUser);
router.put('/users/:id/role', sa.assignRole);
router.post('/users/bulk', sa.bulkAction);

// Appointments
router.get('/appointments', sa.getAppointments);
router.put('/appointments/:id', sa.updateAppointment);
router.delete('/appointments/:id', sa.deleteAppointment);

// Patients
router.get('/patients', sa.getPatients);
router.get('/patients/:id', sa.getPatientDetail);
router.put('/patients/:id', sa.updatePatient);
router.delete('/patients/:id', sa.deletePatient);

// Dentists
router.get('/dentists', sa.getDentists);
router.get('/dentists/:id', sa.getDentistDetail);
router.put('/dentists/:id', sa.updateDentist);
router.get('/dentists/:id/schedules', sa.getDentistSchedules);

// Services & Pricing
router.get('/services', sa.getServices);
router.post('/services', sa.createService);
router.put('/services/:id', sa.updateService);
router.delete('/services/:id', sa.deleteService);
router.get('/pricing', sa.getPricing);
router.post('/pricing', sa.createPricing);
router.put('/pricing/:id', sa.updatePricing);
router.delete('/pricing/:id', sa.deletePricing);

// CMS - Blog
router.get('/blog-posts', sa.getBlogPosts);
router.post('/blog-posts', sa.createBlogPost);
router.put('/blog-posts/:id', sa.updateBlogPost);
router.delete('/blog-posts/:id', sa.deleteBlogPost);

// CMS - Gallery
router.get('/gallery', sa.getGalleryImages);
router.post('/gallery', sa.createGalleryImage);
router.delete('/gallery/:id', sa.deleteGalleryImage);

// CMS - Testimonials
router.get('/testimonials', sa.getTestimonials);
router.post('/testimonials', sa.createTestimonial);
router.put('/testimonials/:id', sa.updateTestimonial);
router.delete('/testimonials/:id', sa.deleteTestimonial);

// CMS - FAQs
router.get('/faqs', sa.getFAQs);
router.post('/faqs', sa.createFAQ);
router.put('/faqs/:id', sa.updateFAQ);
router.delete('/faqs/:id', sa.deleteFAQ);

// Billing
router.get('/invoices', sa.getInvoices);
router.post('/invoices', sa.createInvoice);
router.post('/invoices/:id/pay', sa.recordPayment);

// Reports
router.get('/reports/appointments', sa.getAppointmentReports);
router.get('/reports/patients', sa.getPatientReports);
router.get('/reports/revenue', sa.getRevenueReports);
router.get('/reports/export', sa.exportReport);

// Settings
router.get('/settings', sa.getSettings);
router.put('/settings', sa.updateSettings);

// System - Developer Tools
router.get('/system/database/status', sa.getDatabaseStatus);
router.post('/system/database/backup', sa.createBackup);
router.get('/system/database/backups', sa.getBackups);
router.post('/system/database/restore/:id', sa.restoreBackup);
router.get('/system/server/status', sa.getServerStatus);
router.get('/system/server/metrics', sa.getServerMetrics);
router.get('/system/server/processes', sa.getProcessList);
router.get('/system/logs', sa.getActivityLogs);
router.get('/system/cache/status', sa.getCacheStatus);
router.post('/system/cache/clear', sa.clearCache);
router.get('/system/files', sa.getFiles);
router.delete('/system/files', sa.deleteFile);
router.get('/system/maintenance', sa.getMaintenanceStatus);
router.put('/system/maintenance', sa.toggleMaintenance);
router.get('/system/security', sa.getSecuritySettings);
router.put('/system/security', sa.updateSecuritySettings);
router.get('/system/security/sessions', sa.getActiveSessions);
router.delete('/system/security/sessions/:id', sa.revokeSession);
router.get('/system/config', sa.getSystemConfig);
router.put('/system/config', sa.updateSystemConfig);
router.get('/system/info', sa.getSystemInfo);

export default router;
