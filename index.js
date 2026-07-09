import express from "express";
import pool from "./dbconfig.js";
import cors from "cors";
import bcrypt from "bcrypt";
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.get("/", async (req, res) => {
  const query = `CREATE TABLE IF NOT EXISTS users (
                 id INT AUTO_INCREMENT PRIMARY KEY,
                  name VARCHAR(255) NOT NULL,
                  email VARCHAR(255) NOT NULL UNIQUE,
                  password VARCHAR(255) NOT NULL,
                  role ENUM('patient', 'admin' , 'dentist', 'receptionist') DEFAULT 'user',
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
               )`;

  try {
    await pool.execute(query);
    res.send('Table created successfully.');
  } catch (err) {
    console.error('Error creating table:', err.message);
    res.status(500).send('Error creating table.');
  }
});

app.post("/register/user", async (req, res) => {
  const { name, email, password, role } = req.body;
  if(!name || !email || !password) {
    return res.status(400).send('Name, email, and password are required.');
  }
  //encrypting the password before storing it in the database
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('Received user registration data:', { name, email, hashedPassword , role});
  // return res.status(200).json({ message: 'User registration data received successfully.' });
  let query;
  if(role){
    query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
  }else{
    query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  }
  try {
    if (role){
    await pool.execute(query, [name, email, hashedPassword, role]);
    }
    else{
      await pool.execute(query, [name, email, hashedPassword]);
    }
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
    console.log('Error details:', err);
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
    res.json({
      success: 'success',
      message: 'User logged in successfully.',
      user: user
    });
  } catch (err) {
    console.error('Error logging in user:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Error logging in user.'
    }); 
  }
});


app.get("/allusers", async (req, res) => {
  const query = 'SELECT id, name, email, role, created_at FROM users';
  try {
    const [rows] = await pool.execute(query);
    res.json({
      status: 'success',
      users: rows
    });
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching users.'
    });
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
      await pool.execute(
        'UPDATE users SET name = ?, email = ?, role = ?, password = ? WHERE id = ?',
        [name, email, role, hashedPassword, id]
      );
    } else {
      await pool.execute(
        'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
        [name, email, role, id]
      );
    }
    res.json({ status: 'success', message: 'User updated successfully.' });
  } catch (err) {
    console.error('Error updating user:', err.message);
    res.status(500).json({ status: 'error', message: 'Error updating user.' });
  }
});

// ── Schedules (Dentist availability) ─────────────────────────────────────

const createSchedulesTable = async () => {
  const query = `
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
  `;
  try {
    await pool.execute(query);
    console.log('Schedules table ready.');
  } catch (err) {
    console.error('Error creating schedules table:', err.message);
  }
};

// POST /schedules — dentist defines availability slots
// Body: { dentist_id: number, day: string, times: string[] }
app.post('/schedules', async (req, res) => {
  createSchedulesTable();
  const { dentist_id, day, times } = req.body;
  if (!dentist_id || !day || !Array.isArray(times) || times.length === 0) {
    return res.status(400).json({ status: 'error', message: 'dentist_id, day, and times[] are required.' });
  }

  try {
    const cleanedTimes = times
      .map((t) => String(t).trim())
      .filter(Boolean);

    if (cleanedTimes.length === 0) {
      return res.status(400).json({ status: 'error', message: 'times[] must contain valid time strings.' });
    }

    // Insert (ignore duplicates)
    const values = cleanedTimes.map((t) => [dentist_id, day, t]);
    for (const [d_id, d_day, d_time] of values) {
      await pool.execute(
        'INSERT INTO schedules (dentist_id, day, time, status) VALUES (?, ?, ?, "available") ON DUPLICATE KEY UPDATE status = VALUES(status)',
        [d_id, d_day, d_time]
      );
    }

    res.json({ status: 'success', message: 'Availability saved.' });
  } catch (err) {
    console.error('Error saving schedules:', err.message);
    res.status(500).json({ status: 'error', message: 'Error saving schedules.' });
  }
});

// GET /schedules/:dentist_id — list availability
app.get('/schedules/:dentist_id', async (req, res) => {
  createSchedulesTable();
  const { dentist_id } = req.params;
  try {
    const [rows] = await pool.execute(
      `SELECT id, dentist_id, day, time, status, created_at, updated_at
       FROM schedules
       WHERE dentist_id = ?
       ORDER BY day ASC, time ASC`,
      [dentist_id]
    );
    res.json({ status: 'success', schedules: rows });
  } catch (err) {
    console.error('Error fetching schedules:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching schedules.' });
  }
});

// DELETE /schedules — remove a single slot
// Body: { dentist_id: number, day: string, time: string }
app.delete('/schedules', async (req, res) => {
  createSchedulesTable();
  const { dentist_id, day, time } = req.body;
  if (!dentist_id || !day || !time) {
    return res.status(400).json({ status: 'error', message: 'dentist_id, day and time are required.' });
  }
  try {
    await pool.execute(
      'DELETE FROM schedules WHERE dentist_id = ? AND day = ? AND time = ?',
      [dentist_id, day, time]
    );
    res.json({ status: 'success', message: 'Schedule slot deleted.' });
  } catch (err) {
    console.error('Error deleting schedule slot:', err.message);
    res.status(500).json({ status: 'error', message: 'Error deleting schedule slot.' });
  }
});

// ── Services ──────────────────────────────────────────────────────────────────

// Create services table if it doesn't exist (runs once on startup)
const createServicesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS services (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      service    VARCHAR(255) NOT NULL,
      dentist_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (dentist_id) REFERENCES users(id) ON DELETE CASCADE
    )`;
  try {
    await pool.execute(query);
    console.log('Services table ready.');
  } catch (err) {
    console.error('Error creating services table:', err.message);
  }
};

// ── Appointments ───────────────────────────────────────────────────────────────

const createAppointmentsTable = async () => {
  const query = `
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
    )`;

  try {
    await pool.execute(query);
    console.log('Appointments table ready.');
  } catch (err) {
    console.error('Error creating appointments table:', err.message);
  }
};

const isActiveStatus = (s) => s === 'Pending' || s === 'Confirmed';

createAppointmentsTable();

// Helper: return dentists for patient dropdown
app.get('/dentists', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, name, email, role, created_at FROM users WHERE role = 'dentist' ORDER BY created_at DESC`
    );
    res.json({ status: 'success', dentists: rows });
  } catch (err) {
    console.error('Error fetching dentists:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching dentists.' });
  }
});

// GET /available/slots?schedule_id=... (not required; patient will use schedule_id directly)

// POST /appointments/book
// Body: { schedule_id:number, patient_id:number, dentist_id:number, service:string }
app.post('/appointments/book', async (req, res) => {
  createAppointmentsTable();
  createSchedulesTable();

  const { schedule_id, patient_id, dentist_id, service } = req.body;
  if (!schedule_id || !patient_id || !dentist_id || !service) {
    return res.status(400).json({ status: 'error', message: 'schedule_id, patient_id, dentist_id, and service are required.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [schedRows] = await conn.execute(
      `SELECT id, dentist_id, day, time, status FROM schedules WHERE id = ? FOR UPDATE`,
      [schedule_id]
    );
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

    // Prevent double booking for this schedule slot (any patient with active appointment)
    const [activeRows] = await conn.execute(
      `SELECT id FROM appointments WHERE schedule_id = ? AND status IN ('Pending','Confirmed') LIMIT 1`,
      [schedule_id]
    );
    if (activeRows.length) {
      await conn.rollback();
      return res.status(409).json({ status: 'error', message: 'This slot already has an active appointment.' });
    }

    const [result] = await conn.execute(
      `INSERT INTO appointments (schedule_id, patient_id, dentist_id, service, appointment_day, appointment_time, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Confirmed')`,
      [schedule_id, patient_id, dentist_id, service, slot.day, slot.time]
    );

    await conn.execute(
      `UPDATE schedules SET status = 'booked' WHERE id = ?`,
      [schedule_id]
    );

    await conn.commit();

    res.status(201).json({ status: 'success', message: 'Appointment confirmed.', appointment_id: result.insertId });
  } catch (err) {
    await conn.rollback();
    console.error('Error booking appointment:', err.message);
    res.status(500).json({ status: 'error', message: 'Error booking appointment.' });
  } finally {
    conn.release();
  }
});

// POST /appointments/cancel
// Body: { appointment_id:number }
app.post('/appointments/cancel', async (req, res) => {
  createAppointmentsTable();
  const { appointment_id } = req.body;
  if (!appointment_id) {
    return res.status(400).json({ status: 'error', message: 'appointment_id is required.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.execute(
      `SELECT id, schedule_id, status FROM appointments WHERE id = ? FOR UPDATE`,
      [appointment_id]
    );
    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ status: 'error', message: 'Appointment not found.' });
    }
    const appt = rows[0];
    if (appt.status === 'Canceled') {
      await conn.rollback();
      return res.status(409).json({ status: 'error', message: 'Appointment already canceled.' });
    }

    await conn.execute(
      `UPDATE appointments SET status = 'Canceled' WHERE id = ?`,
      [appointment_id]
    );

    // restore slot if it is currently booked
    await conn.execute(
      `UPDATE schedules SET status = 'available' WHERE id = ?`,
      [appt.schedule_id]
    );

    await conn.commit();
    res.json({ status: 'success', message: 'Appointment canceled.' });
  } catch (err) {
    await conn.rollback();
    console.error('Error canceling appointment:', err.message);
    res.status(500).json({ status: 'error', message: 'Error canceling appointment.' });
  } finally {
    conn.release();
  }
});

// POST /appointments/reschedule
// Body: { appointment_id:number, new_schedule_id:number, service?:string }
app.post('/appointments/reschedule', async (req, res) => {
  createAppointmentsTable();
  createSchedulesTable();

  const { appointment_id, new_schedule_id, service } = req.body;
  if (!appointment_id || !new_schedule_id) {
    return res.status(400).json({ status: 'error', message: 'appointment_id and new_schedule_id are required.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [oldRows] = await conn.execute(
      `SELECT id, schedule_id, patient_id, dentist_id, service AS old_service, status
       FROM appointments WHERE id = ? FOR UPDATE`,
      [appointment_id]
    );
    if (!oldRows.length) {
      await conn.rollback();
      return res.status(404).json({ status: 'error', message: 'Appointment not found.' });
    }
    const oldAppt = oldRows[0];
    if (!isActiveStatus(oldAppt.status)) {
      await conn.rollback();
      return res.status(409).json({ status: 'error', message: 'Only Pending/Confirmed appointments can be rescheduled.' });
    }

    // lock new slot
    const [newSlotRows] = await conn.execute(
      `SELECT id, dentist_id, day, time, status FROM schedules WHERE id = ? FOR UPDATE`,
      [new_schedule_id]
    );
    if (!newSlotRows.length) {
      await conn.rollback();
      return res.status(404).json({ status: 'error', message: 'Selected new schedule slot not found.' });
    }
    const newSlot = newSlotRows[0];

    if (newSlot.status !== 'available') {
      await conn.rollback();
      return res.status(409).json({ status: 'error', message: 'Selected new schedule slot is not available.' });
    }

    const [activeRows] = await conn.execute(
      `SELECT id FROM appointments WHERE schedule_id = ? AND status IN ('Pending','Confirmed') LIMIT 1`,
      [new_schedule_id]
    );
    if (activeRows.length) {
      await conn.rollback();
      return res.status(409).json({ status: 'error', message: 'This new slot already has an active appointment.' });
    }

    // cancel old and release old slot
    await conn.execute(
      `UPDATE appointments SET status = 'Canceled' WHERE id = ?`,
      [appointment_id]
    );
    await conn.execute(
      `UPDATE schedules SET status = 'available' WHERE id = ?`,
      [oldAppt.schedule_id]
    );

    const nextService = service || oldAppt.old_service;

    const [result] = await conn.execute(
      `INSERT INTO appointments (schedule_id, patient_id, dentist_id, service, appointment_day, appointment_time, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Confirmed')`,
      [new_schedule_id, oldAppt.patient_id, newSlot.dentist_id, nextService, newSlot.day, newSlot.time]
    );

    await conn.execute(
      `UPDATE schedules SET status = 'booked' WHERE id = ?`,
      [new_schedule_id]
    );

    await conn.commit();

    res.json({ status: 'success', message: 'Appointment rescheduled.', appointment_id: result.insertId });
  } catch (err) {
    await conn.rollback();
    console.error('Error rescheduling appointment:', err.message);
    res.status(500).json({ status: 'error', message: 'Error rescheduling appointment.' });
  } finally {
    conn.release();
  }
});

// GET /appointments/patient/:patient_id (history)
app.get('/appointments/patient/:patient_id', async (req, res) => {
  createAppointmentsTable();
  const { patient_id } = req.params;
  try {
    const [rows] = await pool.execute(
      `SELECT a.id,
              a.patient_id,
              a.dentist_id,
              u.name AS dentist_name,
              a.service,
              a.appointment_day,
              a.appointment_time,
              a.status,
              a.notes,
              a.created_at,
              a.updated_at
       FROM appointments a
       LEFT JOIN users u ON a.dentist_id = u.id
       WHERE a.patient_id = ?
       ORDER BY a.created_at DESC`,
      [patient_id]
    );
    res.json({ status: 'success', appointments: rows });
  } catch (err) {
    console.error('Error fetching patient appointments:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching appointments.' });
  }
});

// POST /add/service — add a new service
app.post('/add/service', async (req, res) => {
  createServicesTable();
  const { service, dentist_id } = req.body;
  if (!service || !dentist_id) {
    return res.status(400).json({ status: 'error', message: 'service and dentist_id are required.' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO services (service, dentist_id) VALUES (?, ?)',
      [service, dentist_id]
    );
    res.status(201).json({
      status: 'success',
      message: 'Service added successfully.',
      id: result.insertId,
    });
  } catch (err) {
    console.error('Error adding service:', err.message);
    res.status(500).json({ status: 'error', message: 'Error adding service.' });
  }
});


// GET /allservices — fetch all services (joined with dentist name)
app.get('/allservices', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT s.id, s.service, s.dentist_id, u.name AS dentist_name, s.created_at
       FROM services s
       LEFT JOIN users u ON s.dentist_id = u.id
       ORDER BY s.created_at DESC`
    );
    res.json({ status: 'success', services: rows });
  } catch (err) {
    console.error('Error fetching services:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching services.' });
  }
});

// DELETE /delete/service/:id — remove a service
app.delete('/delete/service/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM services WHERE id = ?', [id]);
    res.json({ status: 'success', message: 'Service deleted successfully.' });
  } catch (err) {
    console.error('Error deleting service:', err.message);
    res.status(500).json({ status: 'error', message: 'Error deleting service.' });
  }
});

// Create schedules table on server startup
createSchedulesTable();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

