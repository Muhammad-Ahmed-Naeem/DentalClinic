import express from "express";
import pool from "./dbconfig.js";
import cors from "cors";
import bcrypt from "bcrypt";
import { generateToken, authenticateToken } from "./middleware/auth.js";
import adminRoutes from "./routes/admin.js";
import dentistRoutes from "./routes/dentist.js";
import receptionistRoutes from "./routes/receptionist.js";
import patientRoutes from "./routes/patient.js";
import {
  getPublicFAQs, getPublicTestimonials, getPublicGallery, getPublicPricing, getPublicBlogPosts, getClinicInfo,
  createTables
} from "./controllers/adminController.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ── Root: create users table ─────────────────────────────────────────────────
app.get("/", async (req, res) => {
  const query = `CREATE TABLE IF NOT EXISTS users (
                 id INT AUTO_INCREMENT PRIMARY KEY,
                  name VARCHAR(255) NOT NULL,
                  email VARCHAR(255) NOT NULL UNIQUE,
                  password VARCHAR(255) NOT NULL,
                  role ENUM('patient', 'admin' , 'dentist', 'receptionist', 'owner') DEFAULT 'patient',
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
               )`;

  try {
    await pool.execute(query);
    await createTables();
    const [schedulesResult] = await pool.execute(`
      CREATE TABLE IF NOT EXISTS schedules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dentist_id INT NOT NULL,
        day VARCHAR(20) NOT NULL,
        time VARCHAR(10) NOT NULL,
        status ENUM('available','booked','blocked') DEFAULT 'available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_dentist_day_time (dentist_id, day, time),
        FOREIGN KEY (dentist_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    const [servicesResult] = await pool.execute(`
      CREATE TABLE IF NOT EXISTS services (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        service    VARCHAR(255) NOT NULL,
        dentist_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dentist_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    const [appointmentsResult] = await pool.execute(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        schedule_id INT NOT NULL,
        patient_id INT NOT NULL,
        dentist_id INT NOT NULL,
        service VARCHAR(255) NOT NULL,
        appointment_day VARCHAR(20) NOT NULL,
        appointment_time VARCHAR(10) NOT NULL,
        status ENUM('Pending','Confirmed','Canceled','Completed') DEFAULT 'Pending',
        notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_active_booking (schedule_id, patient_id),
        KEY idx_patient (patient_id),
        KEY idx_dentist (dentist_id),
        KEY idx_status (status),
        CONSTRAINT fk_appointments_schedule FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE RESTRICT,
        CONSTRAINT fk_appointments_patient FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE RESTRICT,
        CONSTRAINT fk_appointments_dentist FOREIGN KEY (dentist_id) REFERENCES users(id) ON DELETE RESTRICT
      )
    `);
    res.send('All tables created successfully.');
  } catch (err) {
    console.error('Error creating table:', err.message);
    res.status(500).send('Error creating table.');
  }
});

// ── Auth Routes ───────────────────────────────────────────────────────────────

app.post("/register/user", async (req, res) => {
  const { name, email, password, role } = req.body;
  if(!name || !email || !password) {
    return res.status(400).send('Name, email, and password are required.');
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const userRole = role || 'patient';
  try {
    await pool.execute('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, userRole]);
    res.json({
      status: 'success',
      message: 'User registered successfully.',
    });
  } catch (err) {
    console.error('Error registering user:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Error registering user.'
    });
  }
});

app.post("/login/user", async (req, res) => {
  const { email, password } = req.body;
  if(!email || !password) {
    return res.status(400).send('Email and password are required.');
  }
  const query = 'SELECT * FROM users WHERE email = ?';
  try {
    const [rows] = await pool.execute(query, [email]);
    if (rows.length === 0) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password.' });
    }
    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.json({
      status: 'success',
      message: 'User logged in successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Error logging in user:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Error logging in user.'
    });
  }
});

// ── Authenticated User Info ──────────────────────────────────────────────────

app.get("/me", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ status: 'error', message: 'User not found.' });
    res.json({ status: 'success', user: rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching user.' });
  }
});

// ── Admin Routes ─────────────────────────────────────────────────────────────

app.use('/api/admin', adminRoutes);
app.use('/api/dentist', dentistRoutes);
app.use('/api/receptionist', receptionistRoutes);
app.use('/api/patient', patientRoutes);

// ── Public Routes ──────────────────────────────────────────────────────────────

app.get('/api/faqs', getPublicFAQs);
app.get('/api/testimonials', getPublicTestimonials);
app.get('/api/gallery', getPublicGallery);
app.get('/api/pricing', getPublicPricing);
app.get('/api/blog-posts', getPublicBlogPosts);
app.get('/api/clinic-info', getClinicInfo);

// ── Existing Routes (kept for backward compatibility) ──────────────────────────

app.get("/allusers", async (req, res) => {
  const query = 'SELECT id, name, email, role, created_at FROM users';
  try {
    const [rows] = await pool.execute(query);
    res.json({ status: 'success', users: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching users.' });
  }
});

app.put("/update/user/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, role, password } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ status: 'error', message: 'Name, email, and role are required.' });
  }
  try {
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.execute('UPDATE users SET name = ?, email = ?, role = ?, password = ? WHERE id = ?', [name, email, role, hashedPassword, id]);
    } else {
      await pool.execute('UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?', [name, email, role, id]);
    }
    res.json({ status: 'success', message: 'User updated successfully.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error updating user.' });
  }
});

app.get('/dentists', async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT id, name, email, role, created_at FROM users WHERE role = 'dentist' ORDER BY created_at DESC");
    res.json({ status: 'success', dentists: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching dentists.' });
  }
});

// ── Schedules ────────────────────────────────────────────────────────────────

app.post('/schedules', async (req, res) => {
  const { dentist_id, day, times, max_patients } = req.body;
  if (!dentist_id || !day || !Array.isArray(times) || times.length === 0) {
    return res.status(400).json({ status: 'error', message: 'dentist_id, day, and times[] are required.' });
  }
  const cap = (max_patients && Number(max_patients) >= 1) ? Number(max_patients) : 1;
  try {
    const cleanedTimes = times.map((t) => String(t).trim()).filter(Boolean);
    if (cleanedTimes.length === 0) {
      return res.status(400).json({ status: 'error', message: 'times[] must contain valid time strings.' });
    }
    for (const t of cleanedTimes) {
      await pool.execute(
        'INSERT INTO schedules (dentist_id, day, time, max_patients, status) VALUES (?, ?, ?, ?, "available") ON DUPLICATE KEY UPDATE max_patients = VALUES(max_patients), status = VALUES(status)',
        [dentist_id, day, t, cap]
      );
    }
    res.json({ status: 'success', message: 'Availability saved.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error saving schedules.' });
  }
});

app.get('/schedules/:dentist_id', async (req, res) => {
  const { dentist_id } = req.params;
  try {
    const [rows] = await pool.execute(
      'SELECT id, dentist_id, day, time, max_patients, confirmed_count, status, created_at, updated_at FROM schedules WHERE dentist_id = ? ORDER BY day ASC, time ASC',
      [dentist_id]
    );
    const schedules = rows.map(s => ({
      ...s,
      available_count: Math.max(0, s.max_patients - s.confirmed_count),
      is_available: s.status === 'available' && s.confirmed_count < s.max_patients,
    }));
    res.json({ status: 'success', schedules });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching schedules.' });
  }
});

app.delete('/schedules', async (req, res) => {
  const { dentist_id, day, time } = req.body;
  if (!dentist_id || !day || !time) {
    return res.status(400).json({ status: 'error', message: 'dentist_id, day and time are required.' });
  }
  try {
    await pool.execute('DELETE FROM schedules WHERE dentist_id = ? AND day = ? AND time = ?', [dentist_id, day, time]);
    res.json({ status: 'success', message: 'Schedule slot deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error deleting schedule slot.' });
  }
});

// ── Appointments ─────────────────────────────────────────────────────────────

function getNextWeekdayDate(dayName) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetIndex = dayNames.indexOf(dayName);
  if (targetIndex === -1) throw new Error(`Invalid day: ${dayName}`);
  const now = new Date();
  const todayIndex = now.getDay();
  let diff = targetIndex - todayIndex;
  if (diff < 0) diff += 7;
  const date = new Date(now);
  date.setDate(now.getDate() + diff);
  return date.toISOString().split('T')[0];
}

app.post('/appointments/pay', async (req, res) => {
  const { appointment_id, invoice_id, payment_method, reference_number } = req.body;
  if (!appointment_id || !invoice_id) {
    return res.status(400).json({ status: 'error', message: 'appointment_id and invoice_id are required.' });
  }
  const method = payment_method || 'Cash';
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [apptRows] = await conn.execute('SELECT id, schedule_id, patient_id, status FROM appointments WHERE id = ? FOR UPDATE', [appointment_id]);
    if (!apptRows.length) {
      await conn.rollback();
      return res.status(404).json({ status: 'error', message: 'Appointment not found.' });
    }
    const appt = apptRows[0];
    if (appt.status !== 'Pending') {
      await conn.rollback();
      return res.status(409).json({ status: 'error', message: `Cannot pay for an appointment with status '${appt.status}'.` });
    }
    const [invRows] = await conn.execute('SELECT id, amount, status FROM invoices WHERE id = ? FOR UPDATE', [invoice_id]);
    if (!invRows.length) {
      await conn.rollback();
      return res.status(404).json({ status: 'error', message: 'Invoice not found.' });
    }
    const invoice = invRows[0];
    if (invoice.status !== 'Unpaid') {
      await conn.rollback();
      return res.status(409).json({ status: 'error', message: 'Invoice is already paid or canceled.' });
    }
    const [schedRows] = await conn.execute('SELECT id, max_patients, confirmed_count, status FROM schedules WHERE id = ? FOR UPDATE', [appt.schedule_id]);
    if (!schedRows.length) {
      await conn.rollback();
      return res.status(404).json({ status: 'error', message: 'Schedule slot not found.' });
    }
    const slot = schedRows[0];
    if (slot.confirmed_count >= slot.max_patients) {
      await conn.execute("UPDATE appointments SET status = 'Canceled' WHERE id = ?", [appointment_id]);
      await conn.commit();
      return res.status(409).json({ status: 'error', message: 'Sorry, this slot has been fully booked by another patient. Your appointment has been canceled.', appointment_id });
    }
    const today = new Date().toISOString().split('T')[0];
    await conn.execute(
      "INSERT INTO payments (invoice_id, amount, payment_method, payment_date, reference_number) VALUES (?, ?, ?, ?, ?)",
      [invoice_id, invoice.amount, method, today, reference_number || null]
    );
    await conn.execute("UPDATE invoices SET status = 'Paid', paid_date = ? WHERE id = ?", [today, invoice_id]);
    await conn.execute("UPDATE appointments SET status = 'Confirmed' WHERE id = ?", [appointment_id]);
    await conn.execute("UPDATE schedules SET confirmed_count = confirmed_count + 1 WHERE id = ?", [appt.schedule_id]);
    const [updatedSched] = await conn.execute('SELECT confirmed_count, max_patients FROM schedules WHERE id = ?', [appt.schedule_id]);
    if (updatedSched[0].confirmed_count >= updatedSched[0].max_patients) {
      await conn.execute("UPDATE schedules SET status = 'booked' WHERE id = ?", [appt.schedule_id]);
    }
    await conn.commit();
    res.json({ status: 'success', message: 'Payment successful. Appointment confirmed.', appointment_id });
  } catch (err) {
    await conn.rollback();
    console.error('Error processing payment:', err);
    res.status(500).json({ status: 'error', message: 'Error processing payment.' });
  } finally {
    conn.release();
  }
});

app.post('/appointments/book', async (req, res) => {
  const { schedule_id, patient_id, dentist_id, service } = req.body;
  if (!schedule_id || !patient_id || !dentist_id || !service) {
    return res.status(400).json({ status: 'error', message: 'schedule_id, patient_id, dentist_id, and service are required.' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [schedRows] = await conn.execute('SELECT id, dentist_id, day, time, max_patients, confirmed_count, status FROM schedules WHERE id = ? FOR UPDATE', [schedule_id]);
    if (!schedRows.length) {
      await conn.rollback();
      return res.status(404).json({ status: 'error', message: 'Selected schedule slot not found.' });
    }
    const slot = schedRows[0];
    if (slot.dentist_id !== Number(dentist_id)) {
      await conn.rollback();
      return res.status(400).json({ status: 'error', message: 'Selected dentist does not match schedule slot dentist.' });
    }
    if (slot.status !== 'available') {
      await conn.rollback();
      return res.status(409).json({ status: 'error', message: 'Selected schedule slot is not available.' });
    }
    if (slot.confirmed_count >= slot.max_patients) {
      await conn.rollback();
      return res.status(409).json({ status: 'error', message: 'This slot is fully booked. No capacity remaining.' });
    }
    const appointmentDate = getNextWeekdayDate(slot.day);
    const [apptResult] = await conn.execute(
      "INSERT INTO appointments (schedule_id, patient_id, dentist_id, service, appointment_day, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')",
      [schedule_id, patient_id, dentist_id, service, slot.day, appointmentDate, slot.time]
    );
    const apptId = apptResult.insertId;
    const invNumber = `INV-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${apptId}`;
    const [priceRows] = await conn.execute(
      "SELECT price FROM pricing WHERE service_name = ? OR service_id = (SELECT id FROM services WHERE service = ? LIMIT 1) LIMIT 1",
      [service, service]
    );
    const amount = priceRows.length ? parseFloat(priceRows[0].price) : 0;
    const [invResult] = await conn.execute(
      "INSERT INTO invoices (patient_id, appointment_id, invoice_number, amount, status, issued_date) VALUES (?, ?, ?, ?, 'Unpaid', ?)",
      [patient_id, apptId, invNumber, amount, appointmentDate]
    );
    await conn.commit();
    res.status(201).json({
      status: 'success',
      message: 'Appointment booked. Please complete payment to confirm.',
      appointment_id: apptId,
      invoice_id: invResult.insertId,
      amount,
      invoice_number: invNumber,
    });
  } catch (err) {
    await conn.rollback();
    console.error('Error booking appointment:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ status: 'error', message: 'You already have a booking for this slot.' });
    }
    if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ status: 'error', message: 'Invalid patient or dentist reference.' });
    }
    if (err.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(500).json({ status: 'error', message: 'Database schema mismatch. Please refresh the app.' });
    }
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ status: 'error', message: 'Database tables missing. Please restart the server.' });
    }
    res.status(500).json({ status: 'error', message: `Error booking appointment: ${err.message}` });
  } finally {
    conn.release();
  }
});

app.post('/appointments/cancel', async (req, res) => {
  const { appointment_id } = req.body;
  if (!appointment_id) {
    return res.status(400).json({ status: 'error', message: 'appointment_id is required.' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute('SELECT id, schedule_id, status FROM appointments WHERE id = ? FOR UPDATE', [appointment_id]);
    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ status: 'error', message: 'Appointment not found.' });
    }
    const appt = rows[0];
    if (appt.status === 'Canceled') {
      await conn.rollback();
      return res.status(409).json({ status: 'error', message: 'Appointment already canceled.' });
    }
    await conn.execute("UPDATE appointments SET status = 'Canceled' WHERE id = ?", [appointment_id]);
    if (appt.status === 'Confirmed' || appt.status === 'Completed') {
      await conn.execute("UPDATE schedules SET confirmed_count = GREATEST(0, confirmed_count - 1) WHERE id = ?", [appt.schedule_id]);
      const [schedRows] = await conn.execute('SELECT confirmed_count, max_patients FROM schedules WHERE id = ?', [appt.schedule_id]);
      if (schedRows.length && schedRows[0].confirmed_count < schedRows[0].max_patients) {
        await conn.execute("UPDATE schedules SET status = 'available' WHERE id = ?", [appt.schedule_id]);
      }
    }
    await conn.execute("UPDATE invoices SET status = 'Canceled' WHERE appointment_id = ? AND status = 'Unpaid'", [appointment_id]);
    await conn.commit();
    res.json({ status: 'success', message: 'Appointment canceled.' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ status: 'error', message: 'Error canceling appointment.' });
  } finally {
    conn.release();
  }
});

app.post('/appointments/reschedule', async (req, res) => {
  const { appointment_id, new_schedule_id, service } = req.body;
  if (!appointment_id || !new_schedule_id) {
    return res.status(400).json({ status: 'error', message: 'appointment_id and new_schedule_id are required.' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [oldRows] = await conn.execute(
      "SELECT id, schedule_id, patient_id, dentist_id, service AS old_service, status FROM appointments WHERE id = ? FOR UPDATE",
      [appointment_id]
    );
    if (!oldRows.length) {
      await conn.rollback();
      return res.status(404).json({ status: 'error', message: 'Appointment not found.' });
    }
    const oldAppt = oldRows[0];
    if (oldAppt.status !== 'Confirmed') {
      await conn.rollback();
      return res.status(409).json({ status: 'error', message: 'Only Confirmed (paid) appointments can be rescheduled.' });
    }
    const [newSlotRows] = await conn.execute('SELECT id, dentist_id, day, time, max_patients, confirmed_count, status FROM schedules WHERE id = ? FOR UPDATE', [new_schedule_id]);
    if (!newSlotRows.length) {
      await conn.rollback();
      return res.status(404).json({ status: 'error', message: 'Selected new schedule slot not found.' });
    }
    const newSlot = newSlotRows[0];
    if (newSlot.status !== 'available') {
      await conn.rollback();
      return res.status(409).json({ status: 'error', message: 'Selected new schedule slot is not available.' });
    }
    if (newSlot.confirmed_count >= newSlot.max_patients) {
      await conn.rollback();
      return res.status(409).json({ status: 'error', message: 'New slot is fully booked. No capacity remaining.' });
    }
    await conn.execute("UPDATE appointments SET status = 'Canceled' WHERE id = ?", [appointment_id]);
    await conn.execute("UPDATE schedules SET confirmed_count = GREATEST(0, confirmed_count - 1) WHERE id = ?", [oldAppt.schedule_id]);
    const [oldSchedRows] = await conn.execute('SELECT confirmed_count, max_patients FROM schedules WHERE id = ?', [oldAppt.schedule_id]);
    if (oldSchedRows.length && oldSchedRows[0].confirmed_count < oldSchedRows[0].max_patients) {
      await conn.execute("UPDATE schedules SET status = 'available' WHERE id = ?", [oldAppt.schedule_id]);
    }
    const nextService = service || oldAppt.old_service;
    const newApptDate = getNextWeekdayDate(newSlot.day);
    const [result] = await conn.execute(
      "INSERT INTO appointments (schedule_id, patient_id, dentist_id, service, appointment_day, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Confirmed')",
      [new_schedule_id, oldAppt.patient_id, newSlot.dentist_id, nextService, newSlot.day, newApptDate, newSlot.time]
    );
    await conn.execute("UPDATE schedules SET confirmed_count = confirmed_count + 1 WHERE id = ?", [new_schedule_id]);
    const [updatedSched] = await conn.execute('SELECT confirmed_count, max_patients FROM schedules WHERE id = ?', [new_schedule_id]);
    if (updatedSched[0].confirmed_count >= updatedSched[0].max_patients) {
      await conn.execute("UPDATE schedules SET status = 'booked' WHERE id = ?", [new_schedule_id]);
    }
    await conn.commit();
    res.json({ status: 'success', message: 'Appointment rescheduled.', appointment_id: result.insertId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ status: 'error', message: 'Error rescheduling appointment.' });
  } finally {
    conn.release();
  }
});

app.get('/appointments/patient/:patient_id', async (req, res) => {
  const { patient_id } = req.params;
  try {
    const [rows] = await pool.execute(
      `SELECT a.id, a.patient_id, a.dentist_id, u.name AS dentist_name, a.service, a.appointment_day, a.appointment_time, a.status, a.notes, a.created_at, a.updated_at,
              i.id AS invoice_id, i.amount, i.status AS invoice_status, i.invoice_number
       FROM appointments a LEFT JOIN users u ON a.dentist_id = u.id
       LEFT JOIN invoices i ON i.appointment_id = a.id
       WHERE a.patient_id = ? ORDER BY a.created_at DESC`,
      [patient_id]
    );
    res.json({ status: 'success', appointments: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching appointments.' });
  }
});

// ── Services ────────────────────────────────────────────────────────────────

app.post('/add/service', async (req, res) => {
  const { service, dentist_id } = req.body;
  if (!service || !dentist_id) {
    return res.status(400).json({ status: 'error', message: 'service and dentist_id are required.' });
  }
  try {
    const [result] = await pool.execute('INSERT INTO services (service, dentist_id) VALUES (?, ?)', [service, dentist_id]);
    res.status(201).json({ status: 'success', message: 'Service added successfully.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error adding service.' });
  }
});

app.get('/allservices', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT s.id, s.service, s.dentist_id, u.name AS dentist_name, s.created_at
       FROM services s LEFT JOIN users u ON s.dentist_id = u.id ORDER BY s.created_at DESC`
    );
    res.json({ status: 'success', services: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching services.' });
  }
});

app.get('/dentist-services/:dentist_id', async (req, res) => {
  const { dentist_id } = req.params;
  try {
    const [rows] = await pool.execute(
      `SELECT s.id, s.service, s.dentist_id, u.name AS dentist_name, s.created_at
       FROM services s LEFT JOIN users u ON s.dentist_id = u.id
       WHERE s.dentist_id = ? ORDER BY s.created_at DESC`,
      [dentist_id]
    );
    res.json({ status: 'success', services: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching services.' });
  }
});

app.delete('/delete/service/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM services WHERE id = ?', [id]);
    res.json({ status: 'success', message: 'Service deleted successfully.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error deleting service.' });
  }
});

// ── Auto-create tables on startup ─────────────────────────────────────────────

const ensureTables = async () => {
  try {
    await pool.execute(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(50) DEFAULT NULL,
      role ENUM('patient', 'admin', 'dentist', 'receptionist') DEFAULT 'patient',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await createTables();
    await pool.execute(`CREATE TABLE IF NOT EXISTS schedules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      dentist_id INT NOT NULL,
      day VARCHAR(20) NOT NULL,
      time VARCHAR(10) NOT NULL,
      max_patients INT NOT NULL DEFAULT 1,
      confirmed_count INT NOT NULL DEFAULT 0,
      status ENUM('available','booked','blocked') DEFAULT 'available',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_dentist_day_time (dentist_id, day, time),
      FOREIGN KEY (dentist_id) REFERENCES users(id) ON DELETE CASCADE
    )`);
    try {
      await pool.execute('ALTER TABLE schedules ADD COLUMN max_patients INT NOT NULL DEFAULT 1 AFTER time');
    } catch {}
    try {
      await pool.execute('ALTER TABLE schedules ADD COLUMN confirmed_count INT NOT NULL DEFAULT 0 AFTER max_patients');
    } catch {}
    try {
      await pool.execute("UPDATE schedules SET confirmed_count = (SELECT COUNT(*) FROM appointments WHERE schedule_id = schedules.id AND status IN ('Confirmed','Completed'))");
    } catch {}
    await pool.execute(`CREATE TABLE IF NOT EXISTS services (
      id INT AUTO_INCREMENT PRIMARY KEY,
      service VARCHAR(255) NOT NULL,
      dentist_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (dentist_id) REFERENCES users(id) ON DELETE CASCADE
    )`);
    await pool.execute(`CREATE TABLE IF NOT EXISTS appointments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      schedule_id INT NULL DEFAULT NULL,
      patient_id INT NOT NULL,
      dentist_id INT NOT NULL,
      service VARCHAR(255) NOT NULL,
      appointment_day VARCHAR(20) NOT NULL,
      appointment_date DATE DEFAULT NULL,
      appointment_time VARCHAR(10) NOT NULL,
      status ENUM('Pending','Confirmed','Canceled','Completed') DEFAULT 'Pending',
      notes TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_active_booking (schedule_id, patient_id),
      KEY idx_patient (patient_id),
      KEY idx_dentist (dentist_id),
      KEY idx_status (status),
      CONSTRAINT fk_appointments_schedule FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE RESTRICT,
      CONSTRAINT fk_appointments_patient FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE RESTRICT,
      CONSTRAINT fk_appointments_dentist FOREIGN KEY (dentist_id) REFERENCES users(id) ON DELETE RESTRICT
    )`);
    try {
      await pool.execute('ALTER TABLE appointments ADD COLUMN appointment_date DATE DEFAULT NULL AFTER appointment_day');
    } catch { /* column already exists */ }
    try {
      await pool.execute('ALTER TABLE appointments MODIFY schedule_id INT NULL DEFAULT NULL');
    } catch { /* already nullable */ }
    try {
      await pool.execute("ALTER TABLE users ADD COLUMN phone VARCHAR(50) DEFAULT NULL AFTER password");
    } catch { /* column already exists */ }

    await pool.execute(`CREATE TABLE IF NOT EXISTS invoices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      patient_id INT NOT NULL,
      appointment_id INT DEFAULT NULL,
      invoice_number VARCHAR(50) NOT NULL UNIQUE,
      amount DECIMAL(10,2) NOT NULL,
      status ENUM('Paid','Unpaid','Partial','Canceled') DEFAULT 'Unpaid',
      issued_date DATE NOT NULL,
      paid_date DATE DEFAULT NULL,
      notes TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE RESTRICT,
      FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
    )`);

    await pool.execute(`CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      invoice_id INT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      payment_method ENUM('Cash','Card','Insurance','Bank Transfer','Other') DEFAULT 'Cash',
      payment_date DATE NOT NULL,
      reference_number VARCHAR(100) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    )`);

    try {
      await pool.execute('ALTER TABLE pricing ADD COLUMN service_id INT DEFAULT NULL AFTER id');
    } catch { /* column already exists */ }

    console.log('✅ All tables ensured on startup.');
  } catch (err) {
    console.error('❌ Error ensuring tables:', err.message);
  }
};

// ── Start Server ─────────────────────────────────────────────────────────────

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await ensureTables();
});
