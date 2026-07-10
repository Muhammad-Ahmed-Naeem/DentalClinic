import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { allowRoles } from '../middleware/roleCheck.js';
import {
  getDashboard,
  getAppointments, createAppointment, updateAppointment, cancelAppointment, rescheduleAppointment,
  getDentists, getDentistSchedules,
  getPatients, registerPatient, updatePatient,
  getInvoices, createInvoice, recordPayment, getInvoiceReceipt,
} from '../controllers/receptionistController.js';

const router = Router();

router.use(authenticateToken, allowRoles('receptionist'));

// Dashboard
router.get('/dashboard', getDashboard);

// Appointment Management
router.get('/appointments', getAppointments);
router.post('/appointments', createAppointment);
router.put('/appointments/:id', updateAppointment);
router.put('/appointments/:id/cancel', cancelAppointment);
router.put('/appointments/:id/reschedule', rescheduleAppointment);

// Dentist lookup
router.get('/dentists', getDentists);
router.get('/dentists/:dentist_id/schedules', getDentistSchedules);

// Patient Management
router.get('/patients', getPatients);
router.post('/patients', registerPatient);
router.put('/patients/:id', updatePatient);

// Billing
router.get('/invoices', getInvoices);
router.post('/invoices', createInvoice);
router.post('/invoices/:id/pay', recordPayment);
router.get('/invoices/:id/receipt', getInvoiceReceipt);

export default router;
