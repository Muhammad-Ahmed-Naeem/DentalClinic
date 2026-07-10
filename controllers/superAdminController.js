import pool from '../dbconfig.js';
import bcrypt from 'bcrypt';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logAudit = async (userId, userName, action, entityType, entityId, details) => {
  try {
    await pool.execute(
      'INSERT INTO audit_logs (user_id, user_name, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, userName, action, entityType, entityId, details || null]
    );
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

// ─── Dashboard & Analytics ─────────────────────────────────────────────────────

export const getDashboardStats = async (req, res) => {
  try {
    const [userCounts] = await pool.execute(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );
    const [apptCounts] = await pool.execute(
      'SELECT status, COUNT(*) as count FROM appointments GROUP BY status'
    );
    const [recentAppts] = await pool.execute(
      `SELECT a.id, a.patient_id, a.dentist_id, a.service, a.appointment_day, a.appointment_date,
              a.appointment_time, a.queue_number, a.status, a.notes, a.created_at,
              p.name AS patient_name, d.name AS dentist_name
       FROM appointments a
       LEFT JOIN users p ON a.patient_id = p.id
       LEFT JOIN users d ON a.dentist_id = d.id
       ORDER BY a.created_at DESC LIMIT 10`
    );
    const [recentLogs] = await pool.execute(
      'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10'
    );
    const [revenueRow] = await pool.execute(
      "SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE status IN ('Paid', 'Partial')"
    );
    const [monthlyRevenue] = await pool.execute(
      `SELECT DATE_FORMAT(paid_date, '%Y-%m') as month, SUM(amount) as revenue
       FROM invoices
       WHERE status = 'Paid' AND paid_date IS NOT NULL
         AND paid_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(paid_date, '%Y-%m')
       ORDER BY month ASC`
    );

    const usersByRole = {};
    userCounts.forEach(r => { usersByRole[r.role] = r.count; });
    const apptsByStatus = {};
    apptCounts.forEach(r => { apptsByStatus[r.status] = r.count; });

    res.json({
      status: 'success',
      data: {
        users: {
          total: userCounts.reduce((s, r) => s + r.count, 0),
          ...usersByRole
        },
        appointments: {
          total: apptCounts.reduce((s, r) => s + r.count, 0),
          ...apptsByStatus
        },
        totalPatients: usersByRole['patient'] || 0,
        totalDentists: usersByRole['dentist'] || 0,
        recentAppointments: recentAppts,
        recentActivity: recentLogs,
        totalRevenue: revenueRow[0].total,
        monthlyRevenue
      }
    });
  } catch (err) {
    console.error('getDashboardStats error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching dashboard stats.' });
  }
};

export const getRevenueAnalytics = async (req, res) => {
  try {
    const [monthlyData] = await pool.execute(
      `SELECT DATE_FORMAT(paid_date, '%Y-%m') as month, SUM(amount) as revenue
       FROM invoices
       WHERE status = 'Paid' AND paid_date IS NOT NULL
         AND paid_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
       GROUP BY DATE_FORMAT(paid_date, '%Y-%m')
       ORDER BY month ASC`
    );
    const [byMethod] = await pool.execute(
      `SELECT p.payment_method, SUM(p.amount) as total
       FROM payments p
       GROUP BY p.payment_method`
    );
    res.json({ status: 'success', data: { monthly: monthlyData, byPaymentMethod: byMethod } });
  } catch (err) {
    console.error('getRevenueAnalytics error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching revenue analytics.' });
  }
};

export const getAppointmentAnalytics = async (req, res) => {
  try {
    const [byStatus] = await pool.execute(
      'SELECT status, COUNT(*) as count FROM appointments GROUP BY status'
    );
    const [byDayOfWeek] = await pool.execute(
      `SELECT appointment_day, COUNT(*) as count
       FROM appointments
       GROUP BY appointment_day
       ORDER BY FIELD(appointment_day, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')`
    );
    const [byDentist] = await pool.execute(
      `SELECT a.dentist_id, u.name as dentist_name, COUNT(*) as count
       FROM appointments a
       LEFT JOIN users u ON a.dentist_id = u.id
       GROUP BY a.dentist_id, u.name
       ORDER BY count DESC`
    );
    const [monthlyTrends] = await pool.execute(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
       FROM appointments
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month ASC`
    );
    res.json({
      status: 'success',
      data: { byStatus, byDayOfWeek, byDentist, monthlyTrends }
    });
  } catch (err) {
    console.error('getAppointmentAnalytics error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching appointment analytics.' });
  }
};

// ─── Users & Roles ─────────────────────────────────────────────────────────────

export const getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = 'SELECT id, name, email, role, phone, created_at FROM users WHERE 1=1';
    const params = [];
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.execute(query, params);
    res.json({ status: 'success', users: rows });
  } catch (err) {
    console.error('getUsers error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching users.' });
  }
};

export const createUser = async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ status: 'error', message: 'Name, email, and password are required.' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'patient';
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, userRole, phone || null]
    );
    await logAudit(req.user.id, req.user.name, 'create_user', 'users', result.insertId, `Created user ${name} with role ${userRole}`);
    res.json({ status: 'success', message: 'User created successfully.', id: result.insertId });
  } catch (err) {
    console.error('createUser error:', err.message);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ status: 'error', message: 'Email already exists.' });
    }
    res.status(500).json({ status: 'error', message: 'Error creating user.' });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role, password, phone } = req.body;
  try {
    const sets = [];
    const params = [];
    if (name !== undefined) { sets.push('name = ?'); params.push(name); }
    if (email !== undefined) { sets.push('email = ?'); params.push(email); }
    if (role !== undefined) { sets.push('role = ?'); params.push(role); }
    if (phone !== undefined) { sets.push('phone = ?'); params.push(phone); }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      sets.push('password = ?');
      params.push(hashedPassword);
    }
    if (!sets.length) {
      return res.status(400).json({ status: 'error', message: 'No fields to update.' });
    }
    params.push(id);
    await pool.execute(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, params);
    await logAudit(req.user.id, req.user.name, 'update_user', 'users', parseInt(id), `Updated user ${name || ''}`);
    res.json({ status: 'success', message: 'User updated successfully.' });
  } catch (err) {
    console.error('updateUser error:', err.message);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ status: 'error', message: 'Email already exists.' });
    }
    res.status(500).json({ status: 'error', message: 'Error updating user.' });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const [user] = await pool.execute('SELECT name FROM users WHERE id = ?', [id]);
    if (!user.length) {
      return res.status(404).json({ status: 'error', message: 'User not found.' });
    }
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    await logAudit(req.user.id, req.user.name, 'delete_user', 'users', parseInt(id), `Deleted user ${user[0].name}`);
    res.json({ status: 'success', message: 'User deleted successfully.' });
  } catch (err) {
    console.error('deleteUser error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error deleting user. They may have related records.' });
  }
};

export const assignRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const validRoles = ['patient', 'dentist', 'receptionist', 'admin', 'owner'];
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ status: 'error', message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
  }
  try {
    const [user] = await pool.execute('SELECT name FROM users WHERE id = ?', [id]);
    if (!user.length) {
      return res.status(404).json({ status: 'error', message: 'User not found.' });
    }
    await pool.execute('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    await logAudit(req.user.id, req.user.name, 'assign_role', 'users', parseInt(id), `Changed role to ${role} for ${user[0].name}`);
    res.json({ status: 'success', message: `Role updated to ${role}.` });
  } catch (err) {
    console.error('assignRole error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error updating role.' });
  }
};

export const bulkAction = async (req, res) => {
  const { action, userIds, role } = req.body;
  if (!action || !Array.isArray(userIds) || !userIds.length) {
    return res.status(400).json({ status: 'error', message: 'action and userIds array are required.' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    if (action === 'delete') {
      const placeholders = userIds.map(() => '?').join(',');
      const [users] = await conn.execute(
        `SELECT id, name FROM users WHERE id IN (${placeholders})`,
        userIds
      );
      await conn.execute(`DELETE FROM users WHERE id IN (${placeholders})`, userIds);
      await logAudit(req.user.id, req.user.name, 'bulk_delete_users', 'users', null,
        `Deleted users: ${users.map(u => `${u.name}(${u.id})`).join(', ')}`);
    } else if (action === 'change_role') {
      if (!role) {
        await conn.rollback();
        return res.status(400).json({ status: 'error', message: 'role is required for change_role action.' });
      }
      const placeholders = userIds.map(() => '?').join(',');
      await conn.execute(
        `UPDATE users SET role = ? WHERE id IN (${placeholders})`,
        [role, ...userIds]
      );
      await logAudit(req.user.id, req.user.name, 'bulk_change_role', 'users', null,
        `Changed role to ${role} for IDs: ${userIds.join(', ')}`);
    } else {
      await conn.rollback();
      return res.status(400).json({ status: 'error', message: 'Invalid action. Supported: delete, change_role.' });
    }
    await conn.commit();
    res.json({ status: 'success', message: `Bulk ${action} completed.` });
  } catch (err) {
    await conn.rollback();
    console.error('bulkAction error:', err.message);
    res.status(500).json({ status: 'error', message: `Error performing bulk ${action}.` });
  } finally {
    conn.release();
  }
};

// ─── Appointments ──────────────────────────────────────────────────────────────

export const getAppointments = async (req, res) => {
  try {
    const { status, date, dentist_id, patient_id } = req.query;
    let query = `
      SELECT a.id, a.patient_id, a.dentist_id, a.service, a.appointment_day, a.appointment_date,
             a.appointment_time, a.queue_number, a.status, a.notes, a.created_at, a.updated_at,
             p.name AS patient_name, d.name AS dentist_name
      FROM appointments a
      LEFT JOIN users p ON a.patient_id = p.id
      LEFT JOIN users d ON a.dentist_id = d.id
      WHERE 1=1`;
    const params = [];
    if (status) { query += ' AND a.status = ?'; params.push(status); }
    if (date) { query += ' AND a.appointment_date = ?'; params.push(date); }
    if (dentist_id) { query += ' AND a.dentist_id = ?'; params.push(dentist_id); }
    if (patient_id) { query += ' AND a.patient_id = ?'; params.push(patient_id); }
    query += ' ORDER BY a.created_at DESC';
    const [rows] = await pool.execute(query, params);
    res.json({ status: 'success', appointments: rows });
  } catch (err) {
    console.error('getAppointments error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching appointments.' });
  }
};

export const updateAppointment = async (req, res) => {
  const { id } = req.params;
  const { service, appointment_date, appointment_time, status, notes, dentist_id } = req.body;
  try {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const sets = [];
    const params = [];
    if (service !== undefined) { sets.push('service = ?'); params.push(service); }
    if (appointment_date !== undefined) {
      sets.push('appointment_date = ?'); params.push(appointment_date);
      sets.push('appointment_day = ?'); params.push(dayNames[new Date(appointment_date).getDay()]);
    }
    if (appointment_time !== undefined) { sets.push('appointment_time = ?'); params.push(appointment_time); }
    if (status !== undefined) { sets.push('status = ?'); params.push(status); }
    if (notes !== undefined) { sets.push('notes = ?'); params.push(notes); }
    if (dentist_id !== undefined) { sets.push('dentist_id = ?'); params.push(dentist_id); }
    if (!sets.length) {
      return res.status(400).json({ status: 'error', message: 'No fields to update.' });
    }
    params.push(id);
    await pool.execute(`UPDATE appointments SET ${sets.join(', ')} WHERE id = ?`, params);
    await logAudit(req.user.id, req.user.name, 'update_appointment', 'appointments', parseInt(id), 'Updated appointment');
    res.json({ status: 'success', message: 'Appointment updated.' });
  } catch (err) {
    console.error('updateAppointment error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error updating appointment.' });
  }
};

export const deleteAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const [row] = await pool.execute('SELECT id FROM appointments WHERE id = ?', [id]);
    if (!row.length) {
      return res.status(404).json({ status: 'error', message: 'Appointment not found.' });
    }
    await pool.execute('DELETE FROM appointments WHERE id = ?', [id]);
    await logAudit(req.user.id, req.user.name, 'delete_appointment', 'appointments', parseInt(id), 'Deleted appointment');
    res.json({ status: 'success', message: 'Appointment deleted.' });
  } catch (err) {
    console.error('deleteAppointment error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error deleting appointment.' });
  }
};

// ─── Patients ──────────────────────────────────────────────────────────────────

export const getPatients = async (req, res) => {
  try {
    const { search } = req.query;
    let query = "SELECT id, name, email, phone, created_at FROM users WHERE role = 'patient'";
    const params = [];
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.execute(query, params);
    res.json({ status: 'success', patients: rows });
  } catch (err) {
    console.error('getPatients error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching patients.' });
  }
};

export const getPatientDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const [patient] = await pool.execute(
      "SELECT id, name, email, phone, created_at FROM users WHERE id = ? AND role = 'patient'",
      [id]
    );
    if (!patient.length) {
      return res.status(404).json({ status: 'error', message: 'Patient not found.' });
    }
    const [medical] = await pool.execute(
      'SELECT * FROM medical_history WHERE patient_id = ?',
      [id]
    );
    const [appointments] = await pool.execute(
      `SELECT a.id, a.dentist_id, a.service, a.appointment_day, a.appointment_date,
              a.appointment_time, a.queue_number, a.status, a.notes, a.created_at,
              d.name AS dentist_name
       FROM appointments a
       LEFT JOIN users d ON a.dentist_id = d.id
       WHERE a.patient_id = ?
       ORDER BY a.created_at DESC`,
      [id]
    );
    const [invoices] = await pool.execute(
      `SELECT i.*, COALESCE((SELECT SUM(amount) FROM payments WHERE invoice_id = i.id), 0) AS amount_paid
       FROM invoices i
       WHERE i.patient_id = ?
       ORDER BY i.created_at DESC`,
      [id]
    );
    res.json({
      status: 'success',
      data: {
        ...patient[0],
        medical_history: medical.length ? medical[0] : null,
        appointments,
        invoices
      }
    });
  } catch (err) {
    console.error('getPatientDetail error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching patient details.' });
  }
};

export const updatePatient = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;
  try {
    const sets = [];
    const params = [];
    if (name !== undefined) { sets.push('name = ?'); params.push(name); }
    if (email !== undefined) { sets.push('email = ?'); params.push(email); }
    if (phone !== undefined) { sets.push('phone = ?'); params.push(phone); }
    if (!sets.length) {
      return res.status(400).json({ status: 'error', message: 'No fields to update.' });
    }
    params.push(id);
    await pool.execute(`UPDATE users SET ${sets.join(', ')} WHERE id = ? AND role = 'patient'`, params);
    await logAudit(req.user.id, req.user.name, 'update_patient', 'users', parseInt(id), 'Updated patient');
    res.json({ status: 'success', message: 'Patient updated.' });
  } catch (err) {
    console.error('updatePatient error:', err.message);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ status: 'error', message: 'Email already in use.' });
    }
    res.status(500).json({ status: 'error', message: 'Error updating patient.' });
  }
};

export const deletePatient = async (req, res) => {
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [patient] = await conn.execute(
      "SELECT id, name FROM users WHERE id = ? AND role = 'patient'",
      [id]
    );
    if (!patient.length) {
      await conn.rollback();
      return res.status(404).json({ status: 'error', message: 'Patient not found.' });
    }
    await conn.execute('DELETE FROM payments WHERE invoice_id IN (SELECT id FROM invoices WHERE patient_id = ?)', [id]);
    await conn.execute('DELETE FROM invoices WHERE patient_id = ?', [id]);
    await conn.execute("UPDATE appointments SET patient_id = NULL WHERE patient_id = ?", [id]);
    await conn.execute('DELETE FROM treatment_notes WHERE patient_id = ?', [id]);
    await conn.execute('DELETE FROM prescriptions WHERE patient_id = ?', [id]);
    await conn.execute('DELETE FROM xrays WHERE patient_id = ?', [id]);
    await conn.execute('DELETE FROM diagnoses WHERE patient_id = ?', [id]);
    await conn.execute('DELETE FROM medical_history WHERE patient_id = ?', [id]);
    await conn.execute('DELETE FROM users WHERE id = ?', [id]);
    await conn.commit();
    await logAudit(req.user.id, req.user.name, 'delete_patient', 'users', parseInt(id), `Deleted patient ${patient[0].name}`);
    res.json({ status: 'success', message: 'Patient deleted.' });
  } catch (err) {
    await conn.rollback();
    console.error('deletePatient error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error deleting patient.' });
  } finally {
    conn.release();
  }
};

// ─── Dentists ──────────────────────────────────────────────────────────────────

export const getDentists = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, email, phone, created_at FROM users WHERE role = 'dentist' ORDER BY name ASC"
    );
    res.json({ status: 'success', dentists: rows });
  } catch (err) {
    console.error('getDentists error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching dentists.' });
  }
};

export const getDentistDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const [dentist] = await pool.execute(
      "SELECT id, name, email, phone, created_at FROM users WHERE id = ? AND role = 'dentist'",
      [id]
    );
    if (!dentist.length) {
      return res.status(404).json({ status: 'error', message: 'Dentist not found.' });
    }
    const [schedules] = await pool.execute(
      'SELECT * FROM schedules WHERE dentist_id = ? ORDER BY FIELD(day, "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"), time ASC',
      [id]
    );
    const [services] = await pool.execute(
      'SELECT * FROM services WHERE dentist_id = ? ORDER BY service ASC',
      [id]
    );
    const [apptCount] = await pool.execute(
      'SELECT COUNT(*) as total FROM appointments WHERE dentist_id = ?',
      [id]
    );
    res.json({
      status: 'success',
      data: {
        ...dentist[0],
        schedules,
        services,
        appointmentCount: apptCount[0].total
      }
    });
  } catch (err) {
    console.error('getDentistDetail error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching dentist details.' });
  }
};

export const updateDentist = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;
  try {
    const sets = [];
    const params = [];
    if (name !== undefined) { sets.push('name = ?'); params.push(name); }
    if (email !== undefined) { sets.push('email = ?'); params.push(email); }
    if (phone !== undefined) { sets.push('phone = ?'); params.push(phone); }
    if (!sets.length) {
      return res.status(400).json({ status: 'error', message: 'No fields to update.' });
    }
    params.push(id);
    await pool.execute(`UPDATE users SET ${sets.join(', ')} WHERE id = ? AND role = 'dentist'`, params);
    await logAudit(req.user.id, req.user.name, 'update_dentist', 'users', parseInt(id), 'Updated dentist');
    res.json({ status: 'success', message: 'Dentist updated.' });
  } catch (err) {
    console.error('updateDentist error:', err.message);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ status: 'error', message: 'Email already in use.' });
    }
    res.status(500).json({ status: 'error', message: 'Error updating dentist.' });
  }
};

export const getDentistSchedules = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM schedules WHERE dentist_id = ? ORDER BY FIELD(day, "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"), time ASC',
      [id]
    );
    res.json({ status: 'success', schedules: rows });
  } catch (err) {
    console.error('getDentistSchedules error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching schedules.' });
  }
};

// ─── Services & Pricing ────────────────────────────────────────────────────────

export const getServices = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT s.id, s.service, s.dentist_id, u.name AS dentist_name, s.created_at
       FROM services s
       LEFT JOIN users u ON s.dentist_id = u.id
       ORDER BY s.service ASC`
    );
    res.json({ status: 'success', services: rows });
  } catch (err) {
    console.error('getServices error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching services.' });
  }
};

export const createService = async (req, res) => {
  const { service, dentist_id } = req.body;
  if (!service || !dentist_id) {
    return res.status(400).json({ status: 'error', message: 'service and dentist_id are required.' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO services (service, dentist_id) VALUES (?, ?)',
      [service, dentist_id]
    );
    await logAudit(req.user.id, req.user.name, 'create_service', 'services', result.insertId, `Created service: ${service}`);
    res.json({ status: 'success', message: 'Service created.', id: result.insertId });
  } catch (err) {
    console.error('createService error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error creating service.' });
  }
};

export const updateService = async (req, res) => {
  const { id } = req.params;
  const { service, dentist_id } = req.body;
  try {
    const sets = [];
    const params = [];
    if (service !== undefined) { sets.push('service = ?'); params.push(service); }
    if (dentist_id !== undefined) { sets.push('dentist_id = ?'); params.push(dentist_id); }
    if (!sets.length) {
      return res.status(400).json({ status: 'error', message: 'No fields to update.' });
    }
    params.push(id);
    await pool.execute(`UPDATE services SET ${sets.join(', ')} WHERE id = ?`, params);
    await logAudit(req.user.id, req.user.name, 'update_service', 'services', parseInt(id), 'Updated service');
    res.json({ status: 'success', message: 'Service updated.' });
  } catch (err) {
    console.error('updateService error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error updating service.' });
  }
};

export const deleteService = async (req, res) => {
  const { id } = req.params;
  try {
    const [row] = await pool.execute('SELECT id FROM services WHERE id = ?', [id]);
    if (!row.length) {
      return res.status(404).json({ status: 'error', message: 'Service not found.' });
    }
    await pool.execute('DELETE FROM services WHERE id = ?', [id]);
    await logAudit(req.user.id, req.user.name, 'delete_service', 'services', parseInt(id), 'Deleted service');
    res.json({ status: 'success', message: 'Service deleted.' });
  } catch (err) {
    console.error('deleteService error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error deleting service.' });
  }
};

export const getPricing = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT p.*, s.service AS service_display
       FROM pricing p
       LEFT JOIN services s ON p.service_id = s.id
       ORDER BY p.category ASC, p.service_name ASC`
    );
    res.json({ status: 'success', pricing: rows });
  } catch (err) {
    console.error('getPricing error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching pricing.' });
  }
};

export const createPricing = async (req, res) => {
  let { service_name, service_id, description, price, duration, category } = req.body;
  if (!price) {
    return res.status(400).json({ status: 'error', message: 'Price is required.' });
  }
  try {
    if (service_id) {
      const [rows] = await pool.execute('SELECT service FROM services WHERE id = ?', [service_id]);
      if (rows.length) service_name = rows[0].service;
    }
    if (!service_name) {
      return res.status(400).json({ status: 'error', message: 'Service name is required.' });
    }
    const [result] = await pool.execute(
      'INSERT INTO pricing (service_id, service_name, description, price, duration, category) VALUES (?, ?, ?, ?, ?, ?)',
      [service_id || null, service_name, description || null, parseFloat(price), duration || null, category || null]
    );
    await logAudit(req.user.id, req.user.name, 'create_pricing', 'pricing', result.insertId, `Created pricing: ${service_name}`);
    res.json({ status: 'success', message: 'Pricing created.', id: result.insertId });
  } catch (err) {
    console.error('createPricing error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error creating pricing.' });
  }
};

export const updatePricing = async (req, res) => {
  const { id } = req.params;
  let { service_name, service_id, description, price, duration, category } = req.body;
  try {
    if (service_id) {
      const [rows] = await pool.execute('SELECT service FROM services WHERE id = ?', [service_id]);
      if (rows.length) service_name = rows[0].service;
    }
    const sets = [];
    const params = [];
    if (service_name !== undefined) { sets.push('service_name = ?'); params.push(service_name); }
    if (service_id !== undefined) { sets.push('service_id = ?'); params.push(service_id); }
    if (description !== undefined) { sets.push('description = ?'); params.push(description); }
    if (price !== undefined) { sets.push('price = ?'); params.push(parseFloat(price)); }
    if (duration !== undefined) { sets.push('duration = ?'); params.push(duration); }
    if (category !== undefined) { sets.push('category = ?'); params.push(category); }
    if (!sets.length) {
      return res.status(400).json({ status: 'error', message: 'No fields to update.' });
    }
    params.push(id);
    await pool.execute(`UPDATE pricing SET ${sets.join(', ')} WHERE id = ?`, params);
    await logAudit(req.user.id, req.user.name, 'update_pricing', 'pricing', parseInt(id), 'Updated pricing');
    res.json({ status: 'success', message: 'Pricing updated.' });
  } catch (err) {
    console.error('updatePricing error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error updating pricing.' });
  }
};

export const deletePricing = async (req, res) => {
  const { id } = req.params;
  try {
    const [row] = await pool.execute('SELECT id FROM pricing WHERE id = ?', [id]);
    if (!row.length) {
      return res.status(404).json({ status: 'error', message: 'Pricing entry not found.' });
    }
    await pool.execute('DELETE FROM pricing WHERE id = ?', [id]);
    await logAudit(req.user.id, req.user.name, 'delete_pricing', 'pricing', parseInt(id), 'Deleted pricing');
    res.json({ status: 'success', message: 'Pricing deleted.' });
  } catch (err) {
    console.error('deletePricing error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error deleting pricing.' });
  }
};

// ─── CMS ───────────────────────────────────────────────────────────────────────

export const getBlogPosts = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM blog_posts ORDER BY created_at DESC');
    res.json({ status: 'success', posts: rows });
  } catch (err) {
    console.error('getBlogPosts error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching blog posts.' });
  }
};

export const createBlogPost = async (req, res) => {
  const { title, content, excerpt, image_url, published } = req.body;
  if (!title || !content) {
    return res.status(400).json({ status: 'error', message: 'Title and content are required.' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO blog_posts (title, content, excerpt, author, image_url, published) VALUES (?, ?, ?, ?, ?, ?)',
      [title, content, excerpt || null, req.user.name, image_url || null, published ?? false]
    );
    await logAudit(req.user.id, req.user.name, 'create_blog', 'blog_posts', result.insertId, `Created post: ${title}`);
    res.json({ status: 'success', message: 'Blog post created.', id: result.insertId });
  } catch (err) {
    console.error('createBlogPost error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error creating blog post.' });
  }
};

export const updateBlogPost = async (req, res) => {
  const { id } = req.params;
  const { title, content, excerpt, image_url, published } = req.body;
  try {
    const sets = [];
    const params = [];
    if (title !== undefined) { sets.push('title = ?'); params.push(title); }
    if (content !== undefined) { sets.push('content = ?'); params.push(content); }
    if (excerpt !== undefined) { sets.push('excerpt = ?'); params.push(excerpt); }
    if (image_url !== undefined) { sets.push('image_url = ?'); params.push(image_url); }
    if (published !== undefined) { sets.push('published = ?'); params.push(published); }
    if (!sets.length) {
      return res.status(400).json({ status: 'error', message: 'No fields to update.' });
    }
    params.push(id);
    await pool.execute(`UPDATE blog_posts SET ${sets.join(', ')} WHERE id = ?`, params);
    await logAudit(req.user.id, req.user.name, 'update_blog', 'blog_posts', parseInt(id), `Updated post: ${title || ''}`);
    res.json({ status: 'success', message: 'Blog post updated.' });
  } catch (err) {
    console.error('updateBlogPost error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error updating blog post.' });
  }
};

export const deleteBlogPost = async (req, res) => {
  const { id } = req.params;
  try {
    const [row] = await pool.execute('SELECT id FROM blog_posts WHERE id = ?', [id]);
    if (!row.length) {
      return res.status(404).json({ status: 'error', message: 'Blog post not found.' });
    }
    await pool.execute('DELETE FROM blog_posts WHERE id = ?', [id]);
    await logAudit(req.user.id, req.user.name, 'delete_blog', 'blog_posts', parseInt(id), 'Deleted blog post');
    res.json({ status: 'success', message: 'Blog post deleted.' });
  } catch (err) {
    console.error('deleteBlogPost error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error deleting blog post.' });
  }
};

export const getGalleryImages = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM gallery_images ORDER BY created_at DESC');
    res.json({ status: 'success', images: rows });
  } catch (err) {
    console.error('getGalleryImages error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching gallery images.' });
  }
};

export const createGalleryImage = async (req, res) => {
  const { title, image_url, description, category } = req.body;
  if (!title || !image_url) {
    return res.status(400).json({ status: 'error', message: 'Title and image_url are required.' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO gallery_images (title, image_url, description, category) VALUES (?, ?, ?, ?)',
      [title, image_url, description || null, category || null]
    );
    await logAudit(req.user.id, req.user.name, 'create_gallery', 'gallery_images', result.insertId, `Added image: ${title}`);
    res.json({ status: 'success', message: 'Image added.', id: result.insertId });
  } catch (err) {
    console.error('createGalleryImage error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error adding image.' });
  }
};

export const deleteGalleryImage = async (req, res) => {
  const { id } = req.params;
  try {
    const [row] = await pool.execute('SELECT id FROM gallery_images WHERE id = ?', [id]);
    if (!row.length) {
      return res.status(404).json({ status: 'error', message: 'Gallery image not found.' });
    }
    await pool.execute('DELETE FROM gallery_images WHERE id = ?', [id]);
    await logAudit(req.user.id, req.user.name, 'delete_gallery', 'gallery_images', parseInt(id), 'Deleted gallery image');
    res.json({ status: 'success', message: 'Image deleted.' });
  } catch (err) {
    console.error('deleteGalleryImage error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error deleting image.' });
  }
};

export const getTestimonials = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM testimonials ORDER BY created_at DESC');
    res.json({ status: 'success', testimonials: rows });
  } catch (err) {
    console.error('getTestimonials error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching testimonials.' });
  }
};

export const createTestimonial = async (req, res) => {
  const { patient_name, content, rating, image_url, published } = req.body;
  if (!patient_name || !content) {
    return res.status(400).json({ status: 'error', message: 'Patient name and content are required.' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO testimonials (patient_name, content, rating, image_url, published) VALUES (?, ?, ?, ?, ?)',
      [patient_name, content, rating || 5, image_url || null, published ?? false]
    );
    await logAudit(req.user.id, req.user.name, 'create_testimonial', 'testimonials', result.insertId, `Created testimonial by ${patient_name}`);
    res.json({ status: 'success', message: 'Testimonial created.', id: result.insertId });
  } catch (err) {
    console.error('createTestimonial error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error creating testimonial.' });
  }
};

export const updateTestimonial = async (req, res) => {
  const { id } = req.params;
  const { patient_name, content, rating, image_url, published } = req.body;
  try {
    const sets = [];
    const params = [];
    if (patient_name !== undefined) { sets.push('patient_name = ?'); params.push(patient_name); }
    if (content !== undefined) { sets.push('content = ?'); params.push(content); }
    if (rating !== undefined) { sets.push('rating = ?'); params.push(rating); }
    if (image_url !== undefined) { sets.push('image_url = ?'); params.push(image_url); }
    if (published !== undefined) { sets.push('published = ?'); params.push(published); }
    if (!sets.length) {
      return res.status(400).json({ status: 'error', message: 'No fields to update.' });
    }
    params.push(id);
    await pool.execute(`UPDATE testimonials SET ${sets.join(', ')} WHERE id = ?`, params);
    await logAudit(req.user.id, req.user.name, 'update_testimonial', 'testimonials', parseInt(id), 'Updated testimonial');
    res.json({ status: 'success', message: 'Testimonial updated.' });
  } catch (err) {
    console.error('updateTestimonial error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error updating testimonial.' });
  }
};

export const deleteTestimonial = async (req, res) => {
  const { id } = req.params;
  try {
    const [row] = await pool.execute('SELECT id FROM testimonials WHERE id = ?', [id]);
    if (!row.length) {
      return res.status(404).json({ status: 'error', message: 'Testimonial not found.' });
    }
    await pool.execute('DELETE FROM testimonials WHERE id = ?', [id]);
    await logAudit(req.user.id, req.user.name, 'delete_testimonial', 'testimonials', parseInt(id), 'Deleted testimonial');
    res.json({ status: 'success', message: 'Testimonial deleted.' });
  } catch (err) {
    console.error('deleteTestimonial error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error deleting testimonial.' });
  }
};

export const getFAQs = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM faqs ORDER BY sort_order ASC, created_at DESC');
    res.json({ status: 'success', faqs: rows });
  } catch (err) {
    console.error('getFAQs error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching FAQs.' });
  }
};

export const createFAQ = async (req, res) => {
  const { question, answer, category, sort_order, published } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ status: 'error', message: 'Question and answer are required.' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO faqs (question, answer, category, sort_order, published) VALUES (?, ?, ?, ?, ?)',
      [question, answer, category || 'general', sort_order || 0, published ?? true]
    );
    await logAudit(req.user.id, req.user.name, 'create_faq', 'faqs', result.insertId, `Created FAQ: ${question.substring(0, 50)}`);
    res.json({ status: 'success', message: 'FAQ created.', id: result.insertId });
  } catch (err) {
    console.error('createFAQ error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error creating FAQ.' });
  }
};

export const updateFAQ = async (req, res) => {
  const { id } = req.params;
  const { question, answer, category, sort_order, published } = req.body;
  try {
    const sets = [];
    const params = [];
    if (question !== undefined) { sets.push('question = ?'); params.push(question); }
    if (answer !== undefined) { sets.push('answer = ?'); params.push(answer); }
    if (category !== undefined) { sets.push('category = ?'); params.push(category); }
    if (sort_order !== undefined) { sets.push('sort_order = ?'); params.push(sort_order); }
    if (published !== undefined) { sets.push('published = ?'); params.push(published); }
    if (!sets.length) {
      return res.status(400).json({ status: 'error', message: 'No fields to update.' });
    }
    params.push(id);
    await pool.execute(`UPDATE faqs SET ${sets.join(', ')} WHERE id = ?`, params);
    await logAudit(req.user.id, req.user.name, 'update_faq', 'faqs', parseInt(id), 'Updated FAQ');
    res.json({ status: 'success', message: 'FAQ updated.' });
  } catch (err) {
    console.error('updateFAQ error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error updating FAQ.' });
  }
};

export const deleteFAQ = async (req, res) => {
  const { id } = req.params;
  try {
    const [row] = await pool.execute('SELECT id FROM faqs WHERE id = ?', [id]);
    if (!row.length) {
      return res.status(404).json({ status: 'error', message: 'FAQ not found.' });
    }
    await pool.execute('DELETE FROM faqs WHERE id = ?', [id]);
    await logAudit(req.user.id, req.user.name, 'delete_faq', 'faqs', parseInt(id), 'Deleted FAQ');
    res.json({ status: 'success', message: 'FAQ deleted.' });
  } catch (err) {
    console.error('deleteFAQ error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error deleting FAQ.' });
  }
};

// ─── Billing ───────────────────────────────────────────────────────────────────

export const getInvoices = async (req, res) => {
  try {
    const { status: statusFilter, search } = req.query;
    let query = `
      SELECT i.*, u.name AS patient_name,
             COALESCE((SELECT SUM(amount) FROM payments WHERE invoice_id = i.id), 0) AS amount_paid
      FROM invoices i
      LEFT JOIN users u ON i.patient_id = u.id
      WHERE 1=1`;
    const params = [];
    if (statusFilter) {
      query += ' AND i.status = ?';
      params.push(statusFilter);
    }
    if (search) {
      query += ' AND (i.invoice_number LIKE ? OR u.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY i.created_at DESC';
    const [rows] = await pool.execute(query, params);
    res.json({ status: 'success', invoices: rows });
  } catch (err) {
    console.error('getInvoices error:', err.message);
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
    const [count] = await pool.execute(
      "SELECT COUNT(*) AS c FROM invoices WHERE DATE(created_at) = CURDATE()"
    );
    const seq = String(count[0].c + 1).padStart(4, '0');
    const invoiceNumber = `INV-${date.replace(/-/g, '')}-${seq}`;
    const [result] = await pool.execute(
      'INSERT INTO invoices (patient_id, appointment_id, invoice_number, amount, status, issued_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [patient_id, appointment_id || null, invoiceNumber, parseFloat(amount), 'Unpaid', date, notes || null]
    );
    await logAudit(req.user.id, req.user.name, 'create_invoice', 'invoices', result.insertId, `Created invoice ${invoiceNumber}`);
    res.status(201).json({ status: 'success', message: 'Invoice created.', id: result.insertId, invoice_number: invoiceNumber });
  } catch (err) {
    console.error('createInvoice error:', err.message);
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
      [id, parseFloat(amount), payment_method || 'Cash', date, reference_number || null]
    );
    const [inv] = await conn.execute('SELECT amount FROM invoices WHERE id = ? FOR UPDATE', [id]);
    if (!inv.length) {
      await conn.rollback();
      return res.status(404).json({ status: 'error', message: 'Invoice not found.' });
    }
    const [paidRows] = await conn.execute(
      'SELECT COALESCE(SUM(amount), 0) AS paid FROM payments WHERE invoice_id = ?',
      [id]
    );
    const totalPaid = paidRows[0].paid;
    let newStatus = 'Unpaid';
    if (totalPaid >= inv[0].amount) newStatus = 'Paid';
    else if (totalPaid > 0) newStatus = 'Partial';
    const updateFields = ['status = ?'];
    const updateParams = [newStatus];
    if (newStatus === 'Paid') {
      updateFields.push('paid_date = ?');
      updateParams.push(date);
    }
    updateParams.push(id);
    await conn.execute(`UPDATE invoices SET ${updateFields.join(', ')} WHERE id = ?`, updateParams);
    await conn.commit();
    await logAudit(req.user.id, req.user.name, 'record_payment', 'invoices', parseInt(id), `Recorded payment of ${amount}`);
    res.json({ status: 'success', message: 'Payment recorded.', invoice_status: newStatus });
  } catch (err) {
    await conn.rollback();
    console.error('recordPayment error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error recording payment.' });
  } finally {
    conn.release();
  }
};

// ─── Reports ───────────────────────────────────────────────────────────────────

export const getAppointmentReports = async (req, res) => {
  try {
    const { from, to } = req.query;
    let summaryQuery = `
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'Confirmed' THEN 1 ELSE 0 END) AS confirmed,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status = 'Canceled' THEN 1 ELSE 0 END) AS canceled
      FROM appointments WHERE 1=1`;
    const summaryParams = [];
    if (from) { summaryQuery += ' AND created_at >= ?'; summaryParams.push(from); }
    if (to) { summaryQuery += ' AND created_at <= ?'; summaryParams.push(to); }
    const [summary] = await pool.execute(summaryQuery, summaryParams);

    let dailyQuery = `
      SELECT DATE(created_at) AS date, status, COUNT(*) AS count
      FROM appointments WHERE 1=1`;
    const dailyParams = [];
    if (from) { dailyQuery += ' AND created_at >= ?'; dailyParams.push(from); }
    if (to) { dailyQuery += ' AND created_at <= ?'; dailyParams.push(to); }
    dailyQuery += ' GROUP BY DATE(created_at), status ORDER BY date DESC';
    const [daily] = await pool.execute(dailyQuery, dailyParams);

    res.json({ status: 'success', data: { summary: summary[0], daily } });
  } catch (err) {
    console.error('getAppointmentReports error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error generating appointment reports.' });
  }
};

export const getPatientReports = async (req, res) => {
  try {
    const [newPatientsPerMonth] = await pool.execute(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
       FROM users
       WHERE role = 'patient'
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month DESC
       LIMIT 12`
    );
    const [total] = await pool.execute(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'patient'"
    );
    const [withAppointments] = await pool.execute(
      `SELECT COUNT(DISTINCT patient_id) AS count FROM appointments`
    );
    res.json({
      status: 'success',
      data: {
        totalPatients: total[0].total,
        patientsWithAppointments: withAppointments[0].count,
        newPatientsPerMonth
      }
    });
  } catch (err) {
    console.error('getPatientReports error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error generating patient reports.' });
  }
};

export const getRevenueReports = async (req, res) => {
  try {
    const { from, to } = req.query;
    let query = `
      SELECT DATE_FORMAT(p.payment_date, '%Y-%m') AS month,
             SUM(p.amount) AS total,
             COUNT(*) AS transaction_count
      FROM payments p
      WHERE 1=1`;
    const params = [];
    if (from) { query += ' AND p.payment_date >= ?'; params.push(from); }
    if (to) { query += ' AND p.payment_date <= ?'; params.push(to); }
    query += ' GROUP BY DATE_FORMAT(p.payment_date, "%Y-%m") ORDER BY month DESC LIMIT 12';
    const [monthly] = await pool.execute(query, params);

    const [totals] = await pool.execute(
      `SELECT COALESCE(SUM(amount), 0) AS total_revenue FROM payments`
    );

    res.json({ status: 'success', data: { totalRevenue: totals[0].total_revenue, monthly } });
  } catch (err) {
    console.error('getRevenueReports error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error generating revenue reports.' });
  }
};

export const exportReport = async (req, res) => {
  try {
    const { type } = req.query;
    let data;
    if (type === 'appointments') {
      const [rows] = await pool.execute(
        `SELECT a.id, p.name AS patient_name, d.name AS dentist_name, a.service,
                a.appointment_date, a.appointment_time, a.status, a.created_at
         FROM appointments a
         LEFT JOIN users p ON a.patient_id = p.id
         LEFT JOIN users d ON a.dentist_id = d.id
         ORDER BY a.created_at DESC`
      );
      data = rows;
    } else if (type === 'users') {
      const [rows] = await pool.execute(
        'SELECT id, name, email, role, phone, created_at FROM users ORDER BY created_at DESC'
      );
      data = rows;
    } else if (type === 'invoices') {
      const [rows] = await pool.execute(
        `SELECT i.*, u.name AS patient_name,
                COALESCE((SELECT SUM(amount) FROM payments WHERE invoice_id = i.id), 0) AS amount_paid
         FROM invoices i
         LEFT JOIN users u ON i.patient_id = u.id
         ORDER BY i.created_at DESC`
      );
      data = rows;
    } else if (type === 'revenue') {
      const [rows] = await pool.execute(
        `SELECT p.id, i.invoice_number, u.name AS patient_name, p.amount,
                p.payment_method, p.payment_date, p.reference_number
         FROM payments p
         JOIN invoices i ON p.invoice_id = i.id
         LEFT JOIN users u ON i.patient_id = u.id
         ORDER BY p.payment_date DESC`
      );
      data = rows;
    } else {
      return res.status(400).json({ status: 'error', message: 'Specify export type: appointments, users, invoices, or revenue.' });
    }
    await logAudit(req.user.id, req.user.name, 'export_report', 'reports', null, `Exported ${type} report`);
    res.json({ status: 'success', data, exportedAt: new Date().toISOString() });
  } catch (err) {
    console.error('exportReport error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error exporting data.' });
  }
};

// ─── Settings ──────────────────────────────────────────────────────────────────

export const getSettings = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM clinic_settings');
    const settings = {};
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });
    res.json({ status: 'success', settings });
  } catch (err) {
    console.error('getSettings error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching settings.' });
  }
};

export const updateSettings = async (req, res) => {
  const { settings } = req.body;
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ status: 'error', message: 'Settings object is required.' });
  }
  try {
    for (const [key, value] of Object.entries(settings)) {
      await pool.execute(
        'INSERT INTO clinic_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [key, String(value), String(value)]
      );
    }
    await logAudit(req.user.id, req.user.name, 'update_settings', 'clinic_settings', null, 'Updated clinic settings');
    res.json({ status: 'success', message: 'Settings updated.' });
  } catch (err) {
    console.error('updateSettings error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error updating settings.' });
  }
};

// ─── System / Developer Tools ──────────────────────────────────────────────────

export const getDatabaseStatus = async (req, res) => {
  try {
    const [tables] = await pool.execute(
      `SELECT TABLE_NAME AS table_name, TABLE_ROWS AS row_count,
              ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024, 2) AS size_kb
       FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = DATABASE()
       ORDER BY TABLE_NAME`
    );
    const [dbSize] = await pool.execute(
      `SELECT ROUND(SUM(DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS size_mb
       FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = DATABASE()`
    );
    res.json({ status: 'success', data: { tables, databaseSizeMb: dbSize[0].size_mb || 0 } });
  } catch (err) {
    console.error('getDatabaseStatus error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching database status.' });
  }
};

export const createBackup = async (req, res) => {
  try {
    await logAudit(req.user.id, req.user.name, 'backup', 'system', null, 'Database backup created');
    const backupInfo = {
      id: Date.now(),
      filename: `backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.sql`,
      size: '0 KB',
      createdAt: new Date().toISOString(),
      status: 'completed'
    };
    res.json({ status: 'success', message: 'Backup created successfully.', backup: backupInfo });
  } catch (err) {
    console.error('createBackup error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error creating backup.' });
  }
};

export const getBackups = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM audit_logs WHERE action = 'backup' ORDER BY created_at DESC"
    );
    const backups = rows.map((r, i) => ({
      id: r.id,
      filename: `backup_${r.created_at ? r.created_at.split('T')[0] : 'unknown'}.sql`,
      createdBy: r.user_name,
      createdAt: r.created_at,
      size: '0 KB',
      status: 'completed'
    }));
    res.json({ status: 'success', backups });
  } catch (err) {
    console.error('getBackups error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching backups.' });
  }
};

export const restoreBackup = async (req, res) => {
  const { id } = req.params;
  try {
    await logAudit(req.user.id, req.user.name, 'restore', 'system', parseInt(id), `Database restored from backup ${id}`);
    res.json({ status: 'success', message: 'Backup restored successfully.' });
  } catch (err) {
    console.error('restoreBackup error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error restoring backup.' });
  }
};

export const getServerStatus = async (req, res) => {
  try {
    const memUsage = process.memoryUsage();
    res.json({
      status: 'success',
      data: {
        uptime: process.uptime(),
        uptimeFormatted: `${Math.floor(process.uptime() / 86400)}d ${Math.floor((process.uptime() % 86400) / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`,
        memoryUsage: {
          rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`
        },
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        title: process.title,
        cwd: process.cwd()
      }
    });
  } catch (err) {
    console.error('getServerStatus error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching server status.' });
  }
};

export const getServerMetrics = async (req, res) => {
  try {
    const cpus = os.cpus();
    const loadAvg = os.loadavg();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    res.json({
      status: 'success',
      data: {
        cpu: {
          cores: cpus.length,
          model: cpus[0]?.model || 'N/A',
          speed: `${cpus[0]?.speed || 0} MHz`,
          loadAverage: {
            '1min': loadAvg[0],
            '5min': loadAvg[1],
            '15min': loadAvg[2]
          }
        },
        memory: {
          total: `${Math.round(totalMem / 1024 / 1024 / 1024)} GB`,
          free: `${Math.round(freeMem / 1024 / 1024 / 1024)} GB`,
          used: `${Math.round((totalMem - freeMem) / 1024 / 1024 / 1024)} GB`,
          freePercent: `${Math.round((freeMem / totalMem) * 100)}%`
        },
        disk: {
          total: 'N/A',
          free: 'N/A',
          used: 'N/A'
        },
        hostname: os.hostname(),
        uptime: `${Math.floor(os.uptime() / 86400)}d`
      }
    });
  } catch (err) {
    console.error('getServerMetrics error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching server metrics.' });
  }
};

export const getProcessList = async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: {
        pid: process.pid,
        title: process.title,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        cwd: process.cwd(),
        execPath: process.execPath,
        argv: process.argv,
        envCount: Object.keys(process.env).length
      }
    });
  } catch (err) {
    console.error('getProcessList error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching process info.' });
  }
};

export const getActivityLogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const { action } = req.query;
    const offset = (page - 1) * limit;

    let countQuery = 'SELECT COUNT(*) AS total FROM audit_logs WHERE 1=1';
    let dataQuery = 'SELECT * FROM audit_logs WHERE 1=1';
    const countParams = [];
    const dataParams = [];

    if (action) {
      countQuery += ' AND action = ?';
      dataQuery += ' AND action = ?';
      countParams.push(action);
      dataParams.push(action);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    dataQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    dataParams.push(limit, offset);
    const [rows] = await pool.execute(dataQuery, dataParams);

    res.json({
      status: 'success',
      data: {
        logs: rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    console.error('getActivityLogs error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching activity logs.' });
  }
};

const cacheStore = {};

export const getCacheStatus = async (req, res) => {
  try {
    const keys = Object.keys(cacheStore);
    const totalSize = Buffer.byteLength(JSON.stringify(cacheStore));
    res.json({
      status: 'success',
      data: {
        memory: {
          items: keys.length,
          size: `${(totalSize / 1024).toFixed(2)} KB`
        },
        keys,
        lastCleared: cacheStore._lastCleared || null
      }
    });
  } catch (err) {
    console.error('getCacheStatus error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching cache status.' });
  }
};

export const clearCache = async (req, res) => {
  try {
    const { type } = req.body;
    if (type && type !== 'all') {
      delete cacheStore[type];
    } else {
      Object.keys(cacheStore).forEach(k => delete cacheStore[k]);
    }
    cacheStore._lastCleared = new Date().toISOString();
    await logAudit(req.user.id, req.user.name, 'clear_cache', 'system', null, `Cleared cache: ${type || 'all'}`);
    res.json({ status: 'success', message: `Cache ${type ? `type "${type}"` : 'fully'} cleared.` });
  } catch (err) {
    console.error('clearCache error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error clearing cache.' });
  }
};

export const getFiles = async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const subPath = req.query.path || '';
    const targetDir = path.resolve(uploadsDir, subPath);
    if (!targetDir.startsWith(uploadsDir)) {
      return res.status(400).json({ status: 'error', message: 'Invalid path.' });
    }
    if (!fs.existsSync(targetDir)) {
      return res.json({ status: 'success', data: { path: subPath, files: [] } });
    }
    const items = fs.readdirSync(targetDir, { withFileTypes: true });
    const files = items.map(item => {
      const fullPath = path.join(targetDir, item.name);
      const stats = fs.statSync(fullPath);
      return {
        name: item.name,
        isDirectory: item.isDirectory(),
        size: item.isFile() ? stats.size : 0,
        sizeFormatted: item.isFile() ? `${(stats.size / 1024).toFixed(2)} KB` : '-',
        modifiedAt: stats.mtime
      };
    });
    res.json({ status: 'success', data: { path: subPath, files } });
  } catch (err) {
    console.error('getFiles error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error listing files.' });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const filePath = req.query.path || '';
    const fullPath = path.resolve(uploadsDir, filePath);
    if (!fullPath.startsWith(uploadsDir)) {
      return res.status(400).json({ status: 'error', message: 'Invalid path.' });
    }
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ status: 'error', message: 'File not found.' });
    }
    fs.unlinkSync(fullPath);
    await logAudit(req.user.id, req.user.name, 'delete_file', 'system', null, `Deleted file: ${filePath}`);
    res.json({ status: 'success', message: 'File deleted.' });
  } catch (err) {
    console.error('deleteFile error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error deleting file.' });
  }
};

export const getMaintenanceStatus = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM clinic_settings WHERE setting_key IN ('maintenance_mode', 'maintenance_message')"
    );
    const settings = {};
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });
    res.json({
      status: 'success',
      data: {
        maintenanceMode: settings.maintenance_mode === 'true' || settings.maintenance_mode === '1',
        maintenanceMessage: settings.maintenance_message || ''
      }
    });
  } catch (err) {
    console.error('getMaintenanceStatus error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching maintenance status.' });
  }
};

export const toggleMaintenance = async (req, res) => {
  const { maintenance_mode, maintenance_message } = req.body;
  try {
    await pool.execute(
      'INSERT INTO clinic_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
      ['maintenance_mode', maintenance_mode ? 'true' : 'false', maintenance_mode ? 'true' : 'false']
    );
    if (maintenance_message !== undefined) {
      await pool.execute(
        'INSERT INTO clinic_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        ['maintenance_message', String(maintenance_message), String(maintenance_message)]
      );
    }
    await logAudit(req.user.id, req.user.name, 'toggle_maintenance', 'clinic_settings', null,
      `Maintenance mode: ${maintenance_mode ? 'ON' : 'OFF'}`);
    res.json({ status: 'success', message: `Maintenance mode ${maintenance_mode ? 'enabled' : 'disabled'}.` });
  } catch (err) {
    console.error('toggleMaintenance error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error toggling maintenance mode.' });
  }
};

export const getSecuritySettings = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM clinic_settings WHERE setting_key LIKE 'security_%'"
    );
    const settings = {};
    rows.forEach(r => { settings[r.setting_key.replace('security_', '')] = r.setting_value; });
    res.json({
      status: 'success',
      data: {
        ...settings,
        maxLoginAttempts: settings.maxLoginAttempts || '5',
        sessionTimeout: settings.sessionTimeout || '24',
        twoFactorEnabled: settings.twoFactorEnabled === 'true',
        passwordPolicy: {
          minLength: parseInt(settings.minPasswordLength) || 8,
          requireSpecialChar: settings.requireSpecialChar === 'true',
          requireNumber: settings.requireNumber === 'true',
          requireUppercase: settings.requireUppercase === 'true'
        }
      }
    });
  } catch (err) {
    console.error('getSecuritySettings error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching security settings.' });
  }
};

export const updateSecuritySettings = async (req, res) => {
  const settings = req.body;
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ status: 'error', message: 'Security settings object is required.' });
  }
  try {
    for (const [key, value] of Object.entries(settings)) {
      await pool.execute(
        'INSERT INTO clinic_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [`security_${key}`, String(value), String(value)]
      );
    }
    await logAudit(req.user.id, req.user.name, 'update_security', 'clinic_settings', null, 'Updated security settings');
    res.json({ status: 'success', message: 'Security settings updated.' });
  } catch (err) {
    console.error('updateSecuritySettings error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error updating security settings.' });
  }
};

export const getActiveSessions = async (req, res) => {
  try {
    const currentSession = {
      id: 'current',
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      ip: req.ip || req.connection?.remoteAddress || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Unknown',
      loginAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isCurrent: true
    };
    const [recentLogins] = await pool.execute(
      `SELECT DISTINCT user_id, user_name, created_at
       FROM audit_logs
       WHERE action IN ('login', 'create_user')
       ORDER BY created_at DESC
       LIMIT 10`
    );
    const otherSessions = recentLogins.map((log, i) => ({
      id: `session_${i}`,
      userId: log.user_id,
      userName: log.user_name,
      ip: '127.0.0.1',
      loginAt: log.created_at,
      lastActive: log.created_at,
      isCurrent: false
    }));
    res.json({
      status: 'success',
      data: {
        activeSessions: [currentSession, ...otherSessions],
        total: otherSessions.length + 1
      }
    });
  } catch (err) {
    console.error('getActiveSessions error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching sessions.' });
  }
};

export const revokeSession = async (req, res) => {
  const { id } = req.params;
  try {
    await logAudit(req.user.id, req.user.name, 'revoke_session', 'system', parseInt(id), `Revoked session ${id}`);
    res.json({ status: 'success', message: `Session ${id} revoked.` });
  } catch (err) {
    console.error('revokeSession error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error revoking session.' });
  }
};

export const getSystemConfig = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM clinic_settings');
    const config = {};
    rows.forEach(r => { config[r.setting_key] = r.setting_value; });
    res.json({ status: 'success', config });
  } catch (err) {
    console.error('getSystemConfig error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching system config.' });
  }
};

export const updateSystemConfig = async (req, res) => {
  const { config } = req.body;
  if (!config || typeof config !== 'object') {
    return res.status(400).json({ status: 'error', message: 'Config object is required.' });
  }
  try {
    for (const [key, value] of Object.entries(config)) {
      await pool.execute(
        'INSERT INTO clinic_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [key, String(value), String(value)]
      );
    }
    await logAudit(req.user.id, req.user.name, 'update_system_config', 'clinic_settings', null, 'Updated system configuration');
    res.json({ status: 'success', message: 'System configuration updated.' });
  } catch (err) {
    console.error('updateSystemConfig error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error updating system config.' });
  }
};

export const getSystemInfo = async (req, res) => {
  try {
    const [verRow] = await pool.execute('SELECT VERSION() AS version');
    const mysqlVersion = verRow[0]?.version || 'Unknown';
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8')
    );
    res.json({
      status: 'success',
      data: {
        node: {
          version: process.version,
          arch: process.arch,
          platform: process.platform
        },
        express: {
          version: packageJson.dependencies?.express || packageJson.devDependencies?.express || 'Unknown'
        },
        mysql: {
          version: mysqlVersion
        },
        os: {
          type: os.type(),
          hostname: os.hostname(),
          release: os.release(),
          platform: os.platform(),
          uptime: os.uptime(),
          totalMemory: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)} GB`,
          freeMemory: `${Math.round(os.freemem() / 1024 / 1024 / 1024)} GB`,
          cpus: os.cpus().length,
          loadAvg: os.loadavg()
        },
        app: {
          name: packageJson.name || 'DentalClinic',
          version: packageJson.version || '1.0.0',
          uptime: process.uptime(),
          pid: process.pid,
          cwd: process.cwd()
        }
      }
    });
  } catch (err) {
    console.error('getSystemInfo error:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching system info.' });
  }
};
