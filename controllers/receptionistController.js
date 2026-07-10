import pool from "../dbconfig.js";
import bcrypt from "bcrypt";

// ── Dashboard ──────────────────────────────────────────────────────────────────

export const getDashboard = async (req, res) => {
  const receptionistId = req.user.id;
  try {
    const [todayAppts] = await pool.execute(
      `SELECT a.id, a.patient_id, a.dentist_id, a.service, a.appointment_date, a.appointment_time, a.queue_number, a.status,
              u.name AS patient_name, d.name AS dentist_name
       FROM appointments a
       LEFT JOIN users u ON a.patient_id = u.id
       LEFT JOIN users d ON a.dentist_id = d.id
       WHERE a.appointment_date = CURDATE()
       ORDER BY a.appointment_time ASC`
    );
    const [stats] = await pool.execute(`
      SELECT
        (SELECT COUNT(*) FROM appointments WHERE appointment_date = CURDATE()) AS today_total,
        (SELECT COUNT(*) FROM appointments WHERE appointment_date = CURDATE() AND status = 'Confirmed') AS today_confirmed,
        (SELECT COUNT(*) FROM appointments WHERE appointment_date = CURDATE() AND status = 'Completed') AS today_completed,
        (SELECT COUNT(*) FROM appointments WHERE appointment_date = CURDATE() AND status = 'Canceled') AS today_canceled,
        (SELECT COUNT(*) FROM users WHERE role = 'patient') AS total_patients
    `);
    const [dentists] = await pool.execute("SELECT id, name FROM users WHERE role = 'dentist' ORDER BY name");
    res.json({ status: 'success', data: { todayAppointments: todayAppts, stats: stats[0], dentists } });
  } catch (err) {
    console.error('Error fetching receptionist dashboard:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching dashboard data.' });
  }
};

// ── Appointment Management ──────────────────────────────────────────────────────

export const getAppointments = async (req, res) => {
  const { date, status, search } = req.query;
  try {
    let query = `
      SELECT a.*, u.name AS patient_name, d.name AS dentist_name
      FROM appointments a
      LEFT JOIN users u ON a.patient_id = u.id
      LEFT JOIN users d ON a.dentist_id = d.id
      WHERE 1=1`;
    const params = [];
    if (date) { query += ' AND a.appointment_date = ?'; params.push(date); }
    if (status) { query += ' AND a.status = ?'; params.push(status); }
    if (search) { query += ' AND (u.name LIKE ? OR d.name LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    query += ' ORDER BY a.appointment_date DESC, a.appointment_time ASC';
    const [rows] = await pool.execute(query, params);
    res.json({ status: 'success', appointments: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching appointments.' });
  }
};

export const createAppointment = async (req, res) => {
  const { patient_id, patient_name, dentist_id, service, schedule_id, appointment_date, appointment_time, notes } = req.body;
  if (!dentist_id || !service || !appointment_date || !appointment_time) {
    return res.status(400).json({ status: 'error', message: 'dentist_id, service, appointment_date, and appointment_time are required.' });
  }
  if (!patient_id && !patient_name) {
    return res.status(400).json({ status: 'error', message: 'Either patient_id or patient_name is required.' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    let finalPatientId = patient_id;

    if (!finalPatientId || finalPatientId === 0) {
      if (!patient_name || !patient_name.trim()) {
        await conn.rollback();
        return res.status(400).json({ status: 'error', message: 'Patient name is required for walk-in patients.' });
      }
      const timestamp = Date.now();
      const autoEmail = `walkin-${timestamp}@clinic.local`;
      const autoPassword = Math.random().toString(36).slice(-8);
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash(autoPassword, 10);
      const [patientResult] = await conn.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [patient_name.trim(), autoEmail, hashedPassword, 'patient']
      );
      finalPatientId = patientResult.insertId;
    }

    if (schedule_id) {
      const [schedRows] = await conn.execute(
        'SELECT id, dentist_id, day, time, max_patients, confirmed_count, status FROM schedules WHERE id = ? FOR UPDATE',
        [schedule_id]
      );
      if (!schedRows.length) {
        await conn.rollback();
        return res.status(404).json({ status: 'error', message: 'Selected schedule slot not found.' });
      }
      const slot = schedRows[0];
      if (slot.dentist_id !== Number(dentist_id)) {
        await conn.rollback();
        return res.status(400).json({ status: 'error', message: 'Selected dentist does not match schedule slot.' });
      }
      if (slot.status !== 'available') {
        await conn.rollback();
        return res.status(409).json({ status: 'error', message: 'Selected schedule slot is not available.' });
      }
      if (slot.confirmed_count >= slot.max_patients) {
        await conn.rollback();
        return res.status(409).json({ status: 'error', message: 'This slot is fully booked.' });
      }
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const appointmentDay = dayNames[new Date(appointment_date).getDay()];

    const [result] = await conn.execute(
      `INSERT INTO appointments (schedule_id, patient_id, dentist_id, service, appointment_day, appointment_date, appointment_time, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Confirmed', ?)`,
      [schedule_id || null, finalPatientId, dentist_id, service, appointmentDay, appointment_date, appointment_time, notes || null]
    );
    const apptId = result.insertId;

    const [queueResult] = await conn.execute(
      `SELECT COALESCE(MAX(queue_number), 0) + 1 AS next_queue FROM appointments WHERE dentist_id = ? AND appointment_date = ? AND status != 'Canceled'`,
      [dentist_id, appointment_date]
    );
    const queueNumber = queueResult[0].next_queue;
    await conn.execute('UPDATE appointments SET queue_number = ? WHERE id = ?', [queueNumber, apptId]);

    if (schedule_id) {
      await conn.execute('UPDATE schedules SET confirmed_count = confirmed_count + 1 WHERE id = ?', [schedule_id]);
      const [updatedSched] = await conn.execute('SELECT confirmed_count, max_patients FROM schedules WHERE id = ?', [schedule_id]);
      if (updatedSched[0].confirmed_count >= updatedSched[0].max_patients) {
        await conn.execute("UPDATE schedules SET status = 'booked' WHERE id = ?", [schedule_id]);
      }
    }

    const [priceRows] = await conn.execute(
      "SELECT price FROM pricing WHERE service_name = ? LIMIT 1",
      [service]
    );
    const amount = priceRows.length ? parseFloat(priceRows[0].price) : 0;

    const dateStr = appointment_date.replace(/-/g, '');
    const [invCount] = await conn.execute("SELECT COUNT(*) AS c FROM invoices WHERE DATE(created_at) = CURDATE()");
    const seq = String(invCount[0].c + 1).padStart(3, '0');
    const invoiceNumber = `INV-${dateStr}-${seq}`;

    const [invResult] = await conn.execute(
      'INSERT INTO invoices (patient_id, appointment_id, invoice_number, amount, status, issued_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [finalPatientId, apptId, invoiceNumber, amount, 'Unpaid', appointment_date, notes || null]
    );

    await conn.commit();
    res.status(201).json({
      status: 'success',
      message: 'Appointment created successfully.',
      appointment_id: apptId,
      patient_id: finalPatientId,
      invoice_id: invResult.insertId,
      invoice_number: invoiceNumber,
      amount,
      queue_number: queueNumber,
    });
  } catch (err) {
    await conn.rollback();
    console.error('Error creating appointment:', err.message);
    res.status(500).json({ status: 'error', message: 'Error creating appointment.' });
  } finally {
    conn.release();
  }
};

export const updateAppointment = async (req, res) => {
  const { id } = req.params;
  const { service, appointment_date, appointment_time, dentist_id, notes } = req.body;
  try {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const appointmentDay = appointment_date ? dayNames[new Date(appointment_date).getDay()] : undefined;
    const sets = []; const params = [];
    if (service !== undefined) { sets.push('service = ?'); params.push(service); }
    if (appointment_date !== undefined) {
      sets.push('appointment_date = ?'); params.push(appointment_date);
      sets.push('appointment_day = ?'); params.push(appointmentDay);
    }
    if (appointment_time !== undefined) { sets.push('appointment_time = ?'); params.push(appointment_time); }
    if (dentist_id !== undefined) { sets.push('dentist_id = ?'); params.push(dentist_id); }
    if (notes !== undefined) { sets.push('notes = ?'); params.push(notes); }
    if (!sets.length) return res.status(400).json({ status: 'error', message: 'No fields to update.' });
    params.push(id);
    await pool.execute(`UPDATE appointments SET ${sets.join(', ')} WHERE id = ?`, params);
    res.json({ status: 'success', message: 'Appointment updated.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error updating appointment.' });
  }
};

export const cancelAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute('SELECT id, schedule_id, status FROM appointments WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ status: 'error', message: 'Appointment not found.' });
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.execute("UPDATE appointments SET status = 'Canceled' WHERE id = ?", [id]);
      if (rows[0].schedule_id) {
        if (rows[0].status === 'Confirmed') {
          await conn.execute("UPDATE schedules SET confirmed_count = GREATEST(0, confirmed_count - 1) WHERE id = ?", [rows[0].schedule_id]);
          const [sched] = await conn.execute('SELECT confirmed_count, max_patients FROM schedules WHERE id = ?', [rows[0].schedule_id]);
          if (sched.length && sched[0].confirmed_count < sched[0].max_patients) {
            await conn.execute("UPDATE schedules SET status = 'available' WHERE id = ?", [rows[0].schedule_id]);
          }
        } else {
          await conn.execute("UPDATE schedules SET status = 'available' WHERE id = ?", [rows[0].schedule_id]);
        }
      }
      await conn.commit();
      res.json({ status: 'success', message: 'Appointment canceled.' });
    } catch (err2) {
      await conn.rollback();
      throw err2;
    } finally {
      conn.release();
    }
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error canceling appointment.' });
  }
};

export const rescheduleAppointment = async (req, res) => {
  const { id } = req.params;
  const { appointment_date, appointment_time, dentist_id } = req.body;
  if (!appointment_date || !appointment_time) {
    return res.status(400).json({ status: 'error', message: 'appointment_date and appointment_time are required.' });
  }
  try {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const appointmentDay = dayNames[new Date(appointment_date).getDay()];
    const params = [appointment_date, appointmentDay, appointment_time];
    let sets = 'appointment_date = ?, appointment_day = ?, appointment_time = ?';
    if (dentist_id) { sets += ', dentist_id = ?'; params.push(dentist_id); }
    params.push(id);
    await pool.execute(`UPDATE appointments SET ${sets} WHERE id = ?`, params);
    res.json({ status: 'success', message: 'Appointment rescheduled.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error rescheduling appointment.' });
  }
};

export const getDentists = async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT id, name, email FROM users WHERE role = 'dentist' ORDER BY name");
    res.json({ status: 'success', dentists: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching dentists.' });
  }
};

export const getDentistSchedules = async (req, res) => {
  const { dentist_id } = req.params;
  try {
    const [rows] = await pool.execute(
      'SELECT id, day, time, max_patients, confirmed_count FROM schedules WHERE dentist_id = ? AND status = ? ORDER BY FIELD(day, "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"), time',
      [dentist_id, 'available']
    );
    const schedules = rows.map(s => ({
      ...s,
      available_count: Math.max(0, s.max_patients - s.confirmed_count),
    }));
    res.json({ status: 'success', schedules });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching schedules.' });
  }
};

// ── Patient Management ──────────────────────────────────────────────────────────

export const getPatients = async (req, res) => {
  const { search } = req.query;
  try {
    let query = 'SELECT id, name, email, phone, created_at FROM users WHERE role = ?';
    const params = ['patient'];
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY created_at DESC LIMIT 100';
    const [rows] = await pool.execute(query, params);
    const enriched = await Promise.all(rows.map(async (r) => {
      const [visits] = await pool.execute(
        'SELECT COUNT(*) AS total, MAX(COALESCE(appointment_date, created_at)) AS last FROM appointments WHERE patient_id = ?', [r.id]
      );
      return { ...r, total_visits: visits[0].total, last_visit: visits[0].last };
    }));
    res.json({ status: 'success', patients: enriched });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching patients.' });
  }
};

export const registerPatient = async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ status: 'error', message: 'Name, email, and password are required.' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'patient', phone || null]
    );
    res.status(201).json({ status: 'success', message: 'Patient registered.', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ status: 'error', message: 'Email already in use.' });
    }
    res.status(500).json({ status: 'error', message: 'Error registering patient.' });
  }
};

export const updatePatient = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;
  try {
    const sets = []; const params = [];
    if (name !== undefined) { sets.push('name = ?'); params.push(name); }
    if (email !== undefined) { sets.push('email = ?'); params.push(email); }
    if (phone !== undefined) { sets.push('phone = ?'); params.push(phone); }
    if (!sets.length) return res.status(400).json({ status: 'error', message: 'No fields to update.' });
    params.push(id);
    await pool.execute(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, params);
    res.json({ status: 'success', message: 'Patient updated.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ status: 'error', message: 'Email already in use.' });
    }
    res.status(500).json({ status: 'error', message: 'Error updating patient.' });
  }
};

// ── Billing ─────────────────────────────────────────────────────────────────────

export const getInvoices = async (req, res) => {
  const { search } = req.query;
  try {
    let query = `
      SELECT i.*, u.name AS patient_name
      FROM invoices i
      LEFT JOIN users u ON i.patient_id = u.id
      WHERE 1=1`;
    const params = [];
    if (search) {
      query += ' AND (i.invoice_number LIKE ? OR u.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY i.created_at DESC LIMIT 100';
    const [rows] = await pool.execute(query, params);
    const enriched = await Promise.all(rows.map(async (inv) => {
      const [payments] = await pool.execute('SELECT SUM(amount) AS paid FROM payments WHERE invoice_id = ?', [inv.id]);
      return { ...inv, amount_paid: payments[0].paid || 0 };
    }));
    res.json({ status: 'success', invoices: enriched });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching invoices.' });
  }
};

export const createInvoice = async (req, res) => {
  const { patient_id, appointment_id, amount, notes } = req.body;
  if (!patient_id || !amount) {
    return res.status(400).json({ status: 'error', message: 'patient_id and amount are required.' });
  }
  try {
    const date = new Date().toISOString().split('T')[0];
    const [count] = await pool.execute("SELECT COUNT(*) AS c FROM invoices WHERE DATE(created_at) = CURDATE()");
    const seq = String(count[0].c + 1).padStart(3, '0');
    const invoiceNumber = `INV-${date.replace(/-/g, '')}-${seq}`;
    const [result] = await pool.execute(
      'INSERT INTO invoices (patient_id, appointment_id, invoice_number, amount, status, issued_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [patient_id, appointment_id || null, invoiceNumber, amount, 'Unpaid', date, notes || null]
    );
    res.status(201).json({ status: 'success', message: 'Invoice created.', id: result.insertId, invoice_number: invoiceNumber });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error creating invoice.' });
  }
};

export const recordPayment = async (req, res) => {
  const { id } = req.params;
  const { amount, payment_method, reference_number } = req.body;
  if (!amount) {
    return res.status(400).json({ status: 'error', message: 'Amount is required.' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const date = new Date().toISOString().split('T')[0];
    await conn.execute(
      'INSERT INTO payments (invoice_id, amount, payment_method, payment_date, reference_number) VALUES (?, ?, ?, ?, ?)',
      [id, amount, payment_method || 'Cash', date, reference_number || null]
    );
    const [inv] = await conn.execute('SELECT amount FROM invoices WHERE id = ? FOR UPDATE', [id]);
    if (!inv.length) { await conn.rollback(); return res.status(404).json({ status: 'error', message: 'Invoice not found.' }); }
    const [paidRows] = await conn.execute('SELECT SUM(amount) AS paid FROM payments WHERE invoice_id = ?', [id]);
    const totalPaid = paidRows[0].paid || 0;
    let status = 'Unpaid';
    if (totalPaid >= inv[0].amount) status = 'Paid';
    else if (totalPaid > 0) status = 'Partial';
    const updateFields = ['status = ?'];
    const updateParams = [status];
    if (status === 'Paid') { updateFields.push('paid_date = ?'); updateParams.push(date); }
    updateParams.push(id);
    await conn.execute(`UPDATE invoices SET ${updateFields.join(', ')} WHERE id = ?`, updateParams);
    await conn.commit();
    res.json({ status: 'success', message: 'Payment recorded.' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ status: 'error', message: 'Error recording payment.' });
  } finally {
    conn.release();
  }
};

export const getInvoiceReceipt = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(
      `SELECT i.*, u.name AS patient_name, u.email AS patient_email
       FROM invoices i
       LEFT JOIN users u ON i.patient_id = u.id
       WHERE i.id = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ status: 'error', message: 'Invoice not found.' });
    const [payments] = await pool.execute('SELECT * FROM payments WHERE invoice_id = ? ORDER BY payment_date DESC', [id]);
    res.json({ status: 'success', data: { ...rows[0], payments } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching receipt data.' });
  }
};
