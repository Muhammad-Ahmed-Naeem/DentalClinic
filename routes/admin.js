import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { allowRoles } from '../middleware/roleCheck.js';
import {
  getDashboardStats, getRevenueStats,
  getAllUsers, createUser, updateUser, deleteUser, assignRole,
  getAllAppointments, approveAppointment, completeAppointment, cancelAppointment,
  getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost,
  getFAQs, createFAQ, updateFAQ, deleteFAQ,
  getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
  getGalleryImages, createGalleryImage, deleteGalleryImage,
  getPricing, createPricing, updatePricing, deletePricing, getAdminServices,
  getClinicSettings, updateClinicSettings,
  getAppointmentReports, getPatientStats, exportReports,
  createBackup, getAuditLogs,
  getPublicFAQs, getPublicTestimonials, getPublicGallery, getPublicPricing, getPublicBlogPosts,
  createTables, logAudit
} from '../controllers/adminController.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateToken, allowRoles('admin'));

// Initialize tables on first admin request
router.use(async (req, res, next) => {
  await createTables();
  next();
});

// ── Dashboard ──────────────────────────────────────────────────────────────────
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/revenue', getRevenueStats);

// ── User Management ────────────────────────────────────────────────────────────
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', assignRole);

// ── Appointment Management ─────────────────────────────────────────────────────
router.get('/appointments', getAllAppointments);
router.put('/appointments/:id/approve', approveAppointment);
router.put('/appointments/:id/complete', completeAppointment);
router.put('/appointments/:id/cancel', cancelAppointment);

// ── Blog Posts ──────────────────────────────────────────────────────────────────
router.get('/blog-posts', getBlogPosts);
router.post('/blog-posts', createBlogPost);
router.put('/blog-posts/:id', updateBlogPost);
router.delete('/blog-posts/:id', deleteBlogPost);

// ── FAQs ──────────────────────────────────────────────────────────────────────
router.get('/faqs', getFAQs);
router.post('/faqs', createFAQ);
router.put('/faqs/:id', updateFAQ);
router.delete('/faqs/:id', deleteFAQ);

// ── Testimonials ───────────────────────────────────────────────────────────────
router.get('/testimonials', getTestimonials);
router.post('/testimonials', createTestimonial);
router.put('/testimonials/:id', updateTestimonial);
router.delete('/testimonials/:id', deleteTestimonial);

// ── Gallery ─────────────────────────────────────────────────────────────────────
router.get('/gallery', getGalleryImages);
router.post('/gallery', createGalleryImage);
router.delete('/gallery/:id', deleteGalleryImage);

// ── Pricing ─────────────────────────────────────────────────────────────────────
router.get('/pricing', getPricing);
router.post('/pricing', createPricing);
router.put('/pricing/:id', updatePricing);
router.delete('/pricing/:id', deletePricing);

// ── Services (admin) ────────────────────────────────────────────────────────────
router.get('/services', getAdminServices);

// ── Settings ───────────────────────────────────────────────────────────────────
router.get('/settings', getClinicSettings);
router.put('/settings', updateClinicSettings);

// ── Reports ─────────────────────────────────────────────────────────────────────
router.get('/reports/appointments', getAppointmentReports);
router.get('/reports/patients', getPatientStats);
router.get('/reports/export', exportReports);

// ── System ─────────────────────────────────────────────────────────────────────
router.post('/backup', createBackup);
router.get('/audit-logs', getAuditLogs);

export default router;
