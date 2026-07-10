import pool from "../dbconfig.js";

// ── Dashboard ──────────────────────────────────────────────────────────────────

export const getDashboard = async (req, res) => {
  const dentistId = req.user.id;
  try {
    const [todayAppts] = await pool.execute(
      `SELECT a.id, a.patient_id, a.service, a.appointment_day, a.appointment_date, a.appointment_time, a.status,
              u.name AS patient_name
       FROM appointments a
       LEFT JOIN users u ON a.patient_id = u.id
       WHERE a.dentist_id = ? AND a.appointment_date = CURDATE() AND a.status IN ('Confirmed','Completed')
       ORDER BY a.appointment_time ASC`,
      [dentistId]
    );

    const [upcomingAppts] = await pool.execute(
      `SELECT a.id, a.patient_id, a.service, a.appointment_day, a.appointment_date, a.appointment_time, a.status,
              u.name AS patient_name
       FROM appointments a
       LEFT JOIN users u ON a.patient_id = u.id
       WHERE a.dentist_id = ? AND (a.appointment_date > CURDATE() OR a.appointment_date IS NULL) AND a.status IN ('Confirmed','Completed')
       ORDER BY a.appointment_date ASC, a.appointment_time ASC LIMIT 10`,
      [dentistId]
    );

    const [totalPatients] = await pool.execute(
      `SELECT COUNT(DISTINCT patient_id) as count FROM appointments WHERE dentist_id = ? AND status IN ('Confirmed','Completed')`,
      [dentistId]
    );

    const [nameRow] = await pool.execute('SELECT name FROM users WHERE id = ?', [dentistId]);

    res.json({
      status: 'success',
      data: {
        dentistName: nameRow.length ? nameRow[0].name : 'Doctor',
        todayAppointments: todayAppts,
        todayCount: todayAppts.length,
        upcomingAppointments: upcomingAppts,
        totalPatients: totalPatients[0].count
      }
    });
  } catch (err) {
    console.error('Error fetching dentist dashboard:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching dashboard data.' });
  }
};

// ── Appointments ───────────────────────────────────────────────────────────────

export const getMyAppointments = async (req, res) => {
  const dentistId = req.user.id;
  const { status, date } = req.query;
  try {
    let query = `
      SELECT a.id, a.patient_id, a.service, a.appointment_day, a.appointment_date, a.appointment_time, a.status, a.notes,
             a.created_at, a.updated_at, u.name AS patient_name
      FROM appointments a
      LEFT JOIN users u ON a.patient_id = u.id
      WHERE a.dentist_id = ?`;
    let params = [dentistId];
    if (status) { query += ' AND a.status = ?'; params.push(status); }
    if (date) { query += ' AND a.appointment_date = ?'; params.push(date); }
    query += ' ORDER BY a.appointment_date ASC, a.appointment_time ASC';
    const [rows] = await pool.execute(query, params);
    res.json({ status: 'success', appointments: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching appointments.' });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Canceled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ status: 'error', message: `Invalid status. Use: ${validStatuses.join(', ')}` });
  }
  try {
    const [rows] = await pool.execute(
      'SELECT id, dentist_id FROM appointments WHERE id = ?',
      [id]
    );
    if (!rows.length) return res.status(404).json({ status: 'error', message: 'Appointment not found.' });
    if (rows[0].dentist_id !== req.user.id) {
      return res.status(403).json({ status: 'error', message: 'You can only update your own appointments.' });
    }
    await pool.execute('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
    res.json({ status: 'success', message: 'Appointment status updated.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error updating appointment.' });
  }
};

// ── Patients ────────────────────────────────────────────────────────────────────

export const getMyPatients = async (req, res) => {
  const dentistId = req.user.id;
  try {
    const [rows] = await pool.execute(
      `SELECT DISTINCT u.id, u.name, u.email, u.created_at,
              (SELECT COALESCE(a2.appointment_date, a2.created_at) FROM appointments a2 WHERE a2.patient_id = u.id AND a2.dentist_id = ? AND a2.status IN ('Confirmed','Completed') ORDER BY a2.created_at DESC LIMIT 1) as last_visit,
              (SELECT COUNT(*) FROM appointments a WHERE a.patient_id = u.id AND a.dentist_id = ? AND a.status IN ('Confirmed','Completed')) as total_visits
       FROM users u
       INNER JOIN appointments a ON u.id = a.patient_id
       WHERE a.dentist_id = ? AND u.role = 'patient' AND a.status IN ('Confirmed','Completed')
       ORDER BY last_visit DESC`,
      [dentistId, dentistId, dentistId]
    );
    res.json({ status: 'success', patients: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching patients.' });
  }
};

export const getPatientDetails = async (req, res) => {
  const { id } = req.params;
  const dentistId = req.user.id;
  try {
    const [patient] = await pool.execute(
      'SELECT id, name, email, created_at FROM users WHERE id = ? AND role = ?',
      [id, 'patient']
    );
    if (!patient.length) return res.status(404).json({ status: 'error', message: 'Patient not found.' });

    const [history] = await pool.execute(
      'SELECT * FROM medical_history WHERE patient_id = ?',
      [id]
    );

    const [appointments] = await pool.execute(
      `SELECT id, service, appointment_day, appointment_time, status, notes, created_at
       FROM appointments WHERE patient_id = ? AND dentist_id = ?
       ORDER BY created_at DESC`,
      [id, dentistId]
    );

    const [notes] = await pool.execute(
      `SELECT tn.*, a.appointment_day, a.appointment_time
       FROM treatment_notes tn
       LEFT JOIN appointments a ON tn.appointment_id = a.id
       WHERE tn.patient_id = ? AND tn.dentist_id = ?
       ORDER BY tn.created_at DESC`,
      [id, dentistId]
    );

    const [prescriptions] = await pool.execute(
      'SELECT * FROM prescriptions WHERE patient_id = ? AND dentist_id = ? ORDER BY created_at DESC',
      [id, dentistId]
    );

    const [xrays] = await pool.execute(
      'SELECT * FROM xrays WHERE patient_id = ? AND dentist_id = ? ORDER BY created_at DESC',
      [id, dentistId]
    );

    const [diagnoses] = await pool.execute(
      'SELECT * FROM diagnoses WHERE patient_id = ? AND dentist_id = ? ORDER BY created_at DESC',
      [id, dentistId]
    );

    res.json({
      status: 'success',
      data: {
        patient: patient[0],
        medicalHistory: history.length ? history[0] : null,
        appointments,
        treatmentNotes: notes,
        prescriptions,
        xrays,
        diagnoses
      }
    });
  } catch (err) {
    console.error('Error fetching patient details:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching patient details.' });
  }
};

export const updateMedicalHistory = async (req, res) => {
  const { id } = req.params;
  const { allergies, medications, conditions, surgeries, blood_type, emergency_contact_name, emergency_contact_phone } = req.body;
  try {
    const [existing] = await pool.execute('SELECT id FROM medical_history WHERE patient_id = ?', [id]);
    if (existing.length) {
      await pool.execute(
        `UPDATE medical_history SET allergies = ?, medications = ?, conditions = ?, surgeries = ?,
         blood_type = ?, emergency_contact_name = ?, emergency_contact_phone = ? WHERE patient_id = ?`,
        [allergies, medications, conditions, surgeries, blood_type, emergency_contact_name, emergency_contact_phone, id]
      );
    } else {
      await pool.execute(
        `INSERT INTO medical_history (patient_id, allergies, medications, conditions, surgeries, blood_type, emergency_contact_name, emergency_contact_phone)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, allergies, medications, conditions, surgeries, blood_type, emergency_contact_name, emergency_contact_phone]
      );
    }
    res.json({ status: 'success', message: 'Medical history updated.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error updating medical history.' });
  }
};

// ── Treatment Notes ────────────────────────────────────────────────────────────

export const getTreatmentNotes = async (req, res) => {
  const dentistId = req.user.id;
  const { appointment_id, patient_id } = req.query;
  try {
    let query = 'SELECT tn.*, u.name AS patient_name FROM treatment_notes tn LEFT JOIN users u ON tn.patient_id = u.id WHERE tn.dentist_id = ?';
    let params = [dentistId];
    if (appointment_id) { query += ' AND tn.appointment_id = ?'; params.push(appointment_id); }
    if (patient_id) { query += ' AND tn.patient_id = ?'; params.push(patient_id); }
    query += ' ORDER BY tn.created_at DESC';
    const [rows] = await pool.execute(query, params);
    res.json({ status: 'success', treatmentNotes: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching treatment notes.' });
  }
};

export const createTreatmentNote = async (req, res) => {
  const dentistId = req.user.id;
  const { appointment_id, patient_id, procedure_name, notes, status } = req.body;
  if (!patient_id || !notes) {
    return res.status(400).json({ status: 'error', message: 'Patient ID and notes are required.' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO treatment_notes (appointment_id, patient_id, dentist_id, procedure_name, notes, status) VALUES (?, ?, ?, ?, ?, ?)',
      [appointment_id || null, patient_id, dentistId, procedure_name || null, notes, status || 'Pending']
    );
    res.status(201).json({ status: 'success', message: 'Treatment note created.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error creating treatment note.' });
  }
};

export const updateTreatmentNote = async (req, res) => {
  const { id } = req.params;
  const dentistId = req.user.id;
  const { procedure_name, notes, status } = req.body;
  try {
    const [existing] = await pool.execute('SELECT id FROM treatment_notes WHERE id = ? AND dentist_id = ?', [id, dentistId]);
    if (!existing.length) return res.status(404).json({ status: 'error', message: 'Treatment note not found.' });
    await pool.execute(
      'UPDATE treatment_notes SET procedure_name = ?, notes = ?, status = ? WHERE id = ?',
      [procedure_name, notes, status, id]
    );
    res.json({ status: 'success', message: 'Treatment note updated.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error updating treatment note.' });
  }
};

export const deleteTreatmentNote = async (req, res) => {
  const { id } = req.params;
  const dentistId = req.user.id;
  try {
    await pool.execute('DELETE FROM treatment_notes WHERE id = ? AND dentist_id = ?', [id, dentistId]);
    res.json({ status: 'success', message: 'Treatment note deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error deleting treatment note.' });
  }
};

// ── Prescriptions ──────────────────────────────────────────────────────────────

export const getPrescriptions = async (req, res) => {
  const dentistId = req.user.id;
  const { patient_id } = req.query;
  try {
    let query = 'SELECT p.*, u.name AS patient_name FROM prescriptions p LEFT JOIN users u ON p.patient_id = u.id WHERE p.dentist_id = ?';
    let params = [dentistId];
    if (patient_id) { query += ' AND p.patient_id = ?'; params.push(patient_id); }
    query += ' ORDER BY p.created_at DESC';
    const [rows] = await pool.execute(query, params);
    res.json({ status: 'success', prescriptions: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching prescriptions.' });
  }
};

export const createPrescription = async (req, res) => {
  const dentistId = req.user.id;
  const { patient_id, medication_name, dosage, frequency, duration, notes, prescribed_date } = req.body;
  if (!patient_id || !medication_name || !dosage) {
    return res.status(400).json({ status: 'error', message: 'Patient ID, medication name, and dosage are required.' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO prescriptions (patient_id, dentist_id, medication_name, dosage, frequency, duration, notes, prescribed_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [patient_id, dentistId, medication_name, dosage, frequency || null, duration || null, notes || null, prescribed_date || new Date().toISOString().split('T')[0]]
    );
    res.status(201).json({ status: 'success', message: 'Prescription created.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error creating prescription.' });
  }
};

export const deletePrescription = async (req, res) => {
  const { id } = req.params;
  const dentistId = req.user.id;
  try {
    await pool.execute('DELETE FROM prescriptions WHERE id = ? AND dentist_id = ?', [id, dentistId]);
    res.json({ status: 'success', message: 'Prescription deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error deleting prescription.' });
  }
};

// ── X-rays ──────────────────────────────────────────────────────────────────────

export const getXrays = async (req, res) => {
  const dentistId = req.user.id;
  const { patient_id } = req.query;
  try {
    let query = 'SELECT x.*, u.name AS patient_name FROM xrays x LEFT JOIN users u ON x.patient_id = u.id WHERE x.dentist_id = ?';
    let params = [dentistId];
    if (patient_id) { query += ' AND x.patient_id = ?'; params.push(patient_id); }
    query += ' ORDER BY x.created_at DESC';
    const [rows] = await pool.execute(query, params);
    res.json({ status: 'success', xrays: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching X-rays.' });
  }
};

export const createXray = async (req, res) => {
  const dentistId = req.user.id;
  const { patient_id, appointment_id, image_url, description, taken_date } = req.body;
  if (!patient_id || !image_url) {
    return res.status(400).json({ status: 'error', message: 'Patient ID and image URL are required.' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO xrays (patient_id, appointment_id, dentist_id, image_url, description, taken_date) VALUES (?, ?, ?, ?, ?, ?)',
      [patient_id, appointment_id || null, dentistId, image_url, description || null, taken_date || new Date().toISOString().split('T')[0]]
    );
    res.status(201).json({ status: 'success', message: 'X-ray added.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error adding X-ray.' });
  }
};

export const deleteXray = async (req, res) => {
  const { id } = req.params;
  const dentistId = req.user.id;
  try {
    await pool.execute('DELETE FROM xrays WHERE id = ? AND dentist_id = ?', [id, dentistId]);
    res.json({ status: 'success', message: 'X-ray deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error deleting X-ray.' });
  }
};

// ── Diagnoses ───────────────────────────────────────────────────────────────────

export const getDiagnoses = async (req, res) => {
  const dentistId = req.user.id;
  const { patient_id } = req.query;
  try {
    let query = 'SELECT d.*, u.name AS patient_name FROM diagnoses d LEFT JOIN users u ON d.patient_id = u.id WHERE d.dentist_id = ?';
    let params = [dentistId];
    if (patient_id) { query += ' AND d.patient_id = ?'; params.push(patient_id); }
    query += ' ORDER BY d.created_at DESC';
    const [rows] = await pool.execute(query, params);
    res.json({ status: 'success', diagnoses: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching diagnoses.' });
  }
};

export const createDiagnosis = async (req, res) => {
  const dentistId = req.user.id;
  const { patient_id, appointment_id, diagnosis_code, diagnosis_name, description, tooth_numbers } = req.body;
  if (!patient_id || !diagnosis_name) {
    return res.status(400).json({ status: 'error', message: 'Patient ID and diagnosis name are required.' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO diagnoses (patient_id, appointment_id, dentist_id, diagnosis_code, diagnosis_name, description, tooth_numbers) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [patient_id, appointment_id || null, dentistId, diagnosis_code || null, diagnosis_name, description || null, tooth_numbers || null]
    );
    res.status(201).json({ status: 'success', message: 'Diagnosis recorded.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error recording diagnosis.' });
  }
};

export const updateDiagnosis = async (req, res) => {
  const { id } = req.params;
  const dentistId = req.user.id;
  const { diagnosis_code, diagnosis_name, description, tooth_numbers } = req.body;
  try {
    const [existing] = await pool.execute('SELECT id FROM diagnoses WHERE id = ? AND dentist_id = ?', [id, dentistId]);
    if (!existing.length) return res.status(404).json({ status: 'error', message: 'Diagnosis not found.' });
    await pool.execute(
      'UPDATE diagnoses SET diagnosis_code = ?, diagnosis_name = ?, description = ?, tooth_numbers = ? WHERE id = ?',
      [diagnosis_code, diagnosis_name, description, tooth_numbers, id]
    );
    res.json({ status: 'success', message: 'Diagnosis updated.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error updating diagnosis.' });
  }
};

export const deleteDiagnosis = async (req, res) => {
  const { id } = req.params;
  const dentistId = req.user.id;
  try {
    await pool.execute('DELETE FROM diagnoses WHERE id = ? AND dentist_id = ?', [id, dentistId]);
    res.json({ status: 'success', message: 'Diagnosis deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error deleting diagnosis.' });
  }
};
