import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { allowRoles } from '../middleware/roleCheck.js';
import {
  getProfile, updateProfile, changePassword,
  getMyTreatmentNotes, getMyPrescriptions, getMyXrays,
  getDashboard, getMyInvoices, getMyInvoiceDetail
} from '../controllers/patientController.js';

const router = Router();

router.use(authenticateToken, allowRoles('patient'));

router.get('/dashboard', getDashboard);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/password', changePassword);

router.get('/treatment-notes', getMyTreatmentNotes);
router.get('/prescriptions', getMyPrescriptions);
router.get('/xrays', getMyXrays);

router.get('/invoices', getMyInvoices);
router.get('/invoices/:id', getMyInvoiceDetail);

export default router;
