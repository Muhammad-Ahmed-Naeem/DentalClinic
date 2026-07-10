import pool from "../dbconfig.js";
import bcrypt from "bcrypt";

// ── Profile ──────────────────────────────────────────────────────────────────

export const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ status: 'error', message: 'User not found.' });
    res.json({ status: 'success', user: rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching profile.' });
  }
};

export const updateProfile = async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email) {
    return res.status(400).json({ status: 'error', message: 'Name and email are required.' });
  }
  try {
    await pool.execute(
      'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?',
      [name, email, phone || null, req.user.id]
    );
    res.json({ status: 'success', message: 'Profile updated.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ status: 'error', message: 'Email already in use.' });
    }
    res.status(500).json({ status: 'error', message: 'Error updating profile.' });
  }
};

export const changePassword = async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) {
    return res.status(400).json({ status: 'error', message: 'Current and new password are required.' });
  }
  if (new_password.length < 6) {
    return res.status(400).json({ status: 'error', message: 'New password must be at least 6 characters.' });
  }
  try {
    const [rows] = await pool.execute('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ status: 'error', message: 'User not found.' });

    const isValid = await bcrypt.compare(current_password, rows[0].password);
    if (!isValid) return res.status(401).json({ status: 'error', message: 'Current password is incorrect.' });

    const hashed = await bcrypt.hash(new_password, 10);
    await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    res.json({ status: 'success', message: 'Password changed.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error changing password.' });
  }
};

// ── Medical Records ────────────────────────────────────────────────────────────

export const getMyTreatmentNotes = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT tn.*, u.name AS dentist_name
       FROM treatment_notes tn
       LEFT JOIN users u ON tn.dentist_id = u.id
       WHERE tn.patient_id = ?
       ORDER BY tn.created_at DESC`,
      [req.user.id]
    );
    res.json({ status: 'success', notes: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching treatment notes.' });
  }
};

export const getMyPrescriptions = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT p.*, u.name AS dentist_name
       FROM prescriptions p
       LEFT JOIN users u ON p.dentist_id = u.id
       WHERE p.patient_id = ?
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json({ status: 'success', prescriptions: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching prescriptions.' });
  }
};

export const getMyXrays = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT x.*, u.name AS dentist_name
       FROM xrays x
       LEFT JOIN users u ON x.dentist_id = u.id
       WHERE x.patient_id = ?
       ORDER BY x.created_at DESC`,
      [req.user.id]
    );
    res.json({ status: 'success', xrays: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching X-rays.' });
  }
};

// ── Dashboard ──────────────────────────────────────────────────────────────────

export const getDashboard = async (req, res) => {
  try {
    const [userRows] = await pool.execute(
      'SELECT id, name, email, phone, role FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!userRows.length) return res.status(404).json({ status: 'error', message: 'User not found.' });

    const [apptRows] = await pool.execute(
      `SELECT a.id, a.dentist_id, u.name AS dentist_name, a.service, a.appointment_date, a.appointment_time, a.status, a.notes
       FROM appointments a LEFT JOIN users u ON a.dentist_id = u.id
       WHERE a.patient_id = ? AND a.status IN ('Pending','Confirmed')
       ORDER BY a.appointment_date ASC, a.appointment_time ASC
       LIMIT 5`,
      [req.user.id]
    );

    const [pastCountRows] = await pool.execute(
      "SELECT COUNT(*) as count FROM appointments WHERE patient_id = ? AND status IN ('Completed','Canceled')",
      [req.user.id]
    );

    const [upcomingCountRows] = await pool.execute(
      "SELECT COUNT(*) as count FROM appointments WHERE patient_id = ? AND status IN ('Pending','Confirmed')",
      [req.user.id]
    );

    const [invoiceRows] = await pool.execute(
      "SELECT COUNT(*) as count, COALESCE(SUM(amount - COALESCE((SELECT COALESCE(SUM(amount),0) FROM payments WHERE invoice_id = i.id), 0)), 0) as balance FROM invoices i WHERE i.patient_id = ? AND i.status != 'Paid'",
      [req.user.id]
    );

    res.json({
      status: 'success',
      data: {
        user: userRows[0],
        upcomingAppointments: apptRows,
        upcomingCount: upcomingCountRows[0].count,
        pastCount: pastCountRows[0].count,
        outstandingBalance: parseFloat(invoiceRows[0].balance) || 0,
        unpaidInvoices: invoiceRows[0].count || 0,
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching dashboard.' });
  }
};

// ── Billing ────────────────────────────────────────────────────────────────────

export const getMyInvoices = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT i.*,
              COALESCE((SELECT COALESCE(SUM(amount),0) FROM payments WHERE invoice_id = i.id), 0) as amount_paid
       FROM invoices i
       WHERE i.patient_id = ?
       ORDER BY i.issued_date DESC`,
      [req.user.id]
    );
    res.json({ status: 'success', invoices: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching invoices.' });
  }
};

export const getMyInvoiceDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const [invRows] = await pool.execute(
      `SELECT i.*, u.name AS patient_name, u.email AS patient_email
       FROM invoices i LEFT JOIN users u ON i.patient_id = u.id
       WHERE i.id = ? AND i.patient_id = ?`,
      [id, req.user.id]
    );
    if (!invRows.length) return res.status(404).json({ status: 'error', message: 'Invoice not found.' });

    const [pmtRows] = await pool.execute(
      'SELECT * FROM payments WHERE invoice_id = ? ORDER BY payment_date ASC',
      [id]
    );

    res.json({
      status: 'success',
      data: { ...invRows[0], payments: pmtRows }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching invoice.' });
  }
};
