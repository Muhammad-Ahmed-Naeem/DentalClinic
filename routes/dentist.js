import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { allowRoles } from '../middleware/roleCheck.js';
import { upload } from '../middleware/upload.js';
import {
  getDashboard,
  getMyAppointments,
  updateAppointmentStatus,
  getMyPatients,
  getPatientDetails,
  updateMedicalHistory,
  getTreatmentNotes,
  createTreatmentNote,
  updateTreatmentNote,
  deleteTreatmentNote,
  getPrescriptions,
  createPrescription,
  deletePrescription,
  getXrays,
  createXray,
  deleteXray,
  getDiagnoses,
  createDiagnosis,
  updateDiagnosis,
  deleteDiagnosis,
} from '../controllers/dentistController.js';

const router = Router();

router.use(authenticateToken, allowRoles('dentist'));

// Dashboard
router.get('/dashboard', getDashboard);

// Appointments
router.get('/appointments', getMyAppointments);
router.put('/appointments/:id/status', updateAppointmentStatus);

// Patients
router.get('/patients', getMyPatients);
router.get('/patients/:id', getPatientDetails);
router.put('/patients/:id/medical-history', updateMedicalHistory);

// Treatment Notes
router.get('/treatment-notes', getTreatmentNotes);
router.post('/treatment-notes', createTreatmentNote);
router.put('/treatment-notes/:id', updateTreatmentNote);
router.delete('/treatment-notes/:id', deleteTreatmentNote);

// Prescriptions
router.get('/prescriptions', getPrescriptions);
router.post('/prescriptions', createPrescription);
router.delete('/prescriptions/:id', deletePrescription);

// X-rays
router.get('/xrays', getXrays);
router.post('/xrays', upload.single('image'), createXray);
router.delete('/xrays/:id', deleteXray);

// Diagnoses
router.get('/diagnoses', getDiagnoses);
router.post('/diagnoses', createDiagnosis);
router.put('/diagnoses/:id', updateDiagnosis);
router.delete('/diagnoses/:id', deleteDiagnosis);

export default router;
