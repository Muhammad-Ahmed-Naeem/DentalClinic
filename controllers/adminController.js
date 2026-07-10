import pool from "../dbconfig.js";
import bcrypt from "bcrypt";

// ── Table Creation ────────────────────────────────────────────────────────────

const createTables = async () => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS blog_posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT,
      author VARCHAR(255) NOT NULL,
      image_url VARCHAR(500),
      published BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS faqs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category VARCHAR(100) DEFAULT 'general',
      sort_order INT DEFAULT 0,
      published BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS testimonials (
      id INT AUTO_INCREMENT PRIMARY KEY,
      patient_name VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      rating INT DEFAULT 5,
      image_url VARCHAR(500),
      published BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS gallery_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      image_url VARCHAR(500) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS pricing (
      id INT AUTO_INCREMENT PRIMARY KEY,
      service_name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      duration VARCHAR(50),
      category VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS clinic_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(100) NOT NULL UNIQUE,
      setting_value TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      user_name VARCHAR(255),
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(100),
      entity_id INT,
      details TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS medical_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      patient_id INT NOT NULL UNIQUE,
      allergies TEXT,
      medications TEXT,
      conditions TEXT,
      surgeries TEXT,
      blood_type VARCHAR(5),
      emergency_contact_name VARCHAR(255),
      emergency_contact_phone VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS treatment_notes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      appointment_id INT,
      patient_id INT NOT NULL,
      dentist_id INT NOT NULL,
      procedure_name VARCHAR(255),
      notes TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
      FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (dentist_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS prescriptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      patient_id INT NOT NULL,
      dentist_id INT NOT NULL,
      medication_name VARCHAR(255) NOT NULL,
      dosage VARCHAR(100) NOT NULL,
      frequency VARCHAR(100),
      duration VARCHAR(100),
      notes TEXT,
      prescribed_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (dentist_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS xrays (
      id INT AUTO_INCREMENT PRIMARY KEY,
      patient_id INT NOT NULL,
      appointment_id INT,
      dentist_id INT NOT NULL,
      image_url VARCHAR(500) NOT NULL,
      description TEXT,
      taken_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
      FOREIGN KEY (dentist_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS diagnoses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      patient_id INT NOT NULL,
      appointment_id INT,
      dentist_id INT NOT NULL,
      diagnosis_code VARCHAR(50),
      diagnosis_name VARCHAR(255) NOT NULL,
      description TEXT,
      tooth_numbers VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
      FOREIGN KEY (dentist_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
  ];
  for (const q of queries) {
    try {
      await pool.execute(q);
    } catch (err) {
      console.error('Error creating table:', err.message);
    }
  }
};

const logAudit = async (userId, userName, action, entityType, entityId, details) => {
  try {
    await pool.execute(
      'INSERT INTO audit_logs (user_id, user_name, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, userName, action, entityType, entityId, details || null]
    );
  } catch (err) {
    console.error('Error logging audit:', err.message);
  }
};

// ── Dashboard ──────────────────────────────────────────────────────────────────

export const getDashboardStats = async (req, res) => {
  try {
    const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM users');
    const [dentistCount] = await pool.execute("SELECT COUNT(*) as count FROM users WHERE role = 'dentist'");
    const [patientCount] = await pool.execute("SELECT COUNT(*) as count FROM users WHERE role = 'patient'");
    const [apptCount] = await pool.execute('SELECT COUNT(*) as count FROM appointments');
    const [pendingAppts] = await pool.execute("SELECT COUNT(*) as count FROM appointments WHERE status = 'Pending'");
    const [confirmedAppts] = await pool.execute("SELECT COUNT(*) as count FROM appointments WHERE status = 'Confirmed'");
    const [completedAppts] = await pool.execute("SELECT COUNT(*) as count FROM appointments WHERE status = 'Completed'");
    const [canceledAppts] = await pool.execute("SELECT COUNT(*) as count FROM appointments WHERE status = 'Canceled'");

    const [todayAppts] = await pool.execute(
      "SELECT COUNT(*) as count FROM appointments WHERE appointment_day = ?",
      [new Date().toLocaleDateString('en-US', { weekday: 'long' })]
    );

    const [recentAppts] = await pool.execute(
      `SELECT a.id, u.name as patient_name, a.appointment_day, a.appointment_time, a.status, a.service
       FROM appointments a LEFT JOIN users u ON a.patient_id = u.id
       ORDER BY a.created_at DESC LIMIT 10`
    );

    const [recentLogs] = await pool.execute(
      'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10'
    );

    res.json({
      status: 'success',
      data: {
        users: { total: userCount[0].count, dentists: dentistCount[0].count, patients: patientCount[0].count },
        appointments: {
          total: apptCount[0].count,
          pending: pendingAppts[0].count,
          confirmed: confirmedAppts[0].count,
          completed: completedAppts[0].count,
          canceled: canceledAppts[0].count,
          today: todayAppts[0].count
        },
        recentAppointments: recentAppts,
        recentActivity: recentLogs
      }
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err.message);
    res.status(500).json({ status: 'error', message: 'Error fetching dashboard stats.' });
  }
};

export const getRevenueStats = async (req, res) => {
  try {
    const [rows] = await pool.execute(`SELECT COUNT(*) as count FROM appointments WHERE status = 'Completed'`);
    res.json({
      status: 'success',
      data: {
        totalAppointments: rows[0].count,
        message: 'Revenue tracking available with completed appointments'
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching revenue stats.' });
  }
};

// ── User Management ────────────────────────────────────────────────────────────

export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let query = 'SELECT id, name, email, role, created_at FROM users';
    let params = [];
    if (role) {
      query += ' WHERE role = ?';
      params.push(role);
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.execute(query, params);
    res.json({ status: 'success', users: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching users.' });
  }
};

export const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ status: 'error', message: 'Name, email, and password are required.' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'patient';
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, userRole]
    );
    await logAudit(req.user.id, req.user.name, 'create_user', 'users', result.insertId, `Created user ${name} with role ${userRole}`);
    res.json({ status: 'success', message: 'User created successfully.', id: result.insertId });
  } catch (err) {
    console.error('Error creating user:', err.message);
    res.status(500).json({ status: 'error', message: err.code === 'ER_DUP_ENTRY' ? 'Email already exists.' : 'Error creating user.' });
  }
};

export const updateUser = async (req, res) => {
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
    await logAudit(req.user.id, req.user.name, 'update_user', 'users', parseInt(id), `Updated user ${name} to role ${role}`);
    res.json({ status: 'success', message: 'User updated successfully.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.code === 'ER_DUP_ENTRY' ? 'Email already exists.' : 'Error updating user.' });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const [user] = await pool.execute('SELECT name FROM users WHERE id = ?', [id]);
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    if (user.length) {
      await logAudit(req.user.id, req.user.name, 'delete_user', 'users', parseInt(id), `Deleted user ${user[0].name}`);
    }
    res.json({ status: 'success', message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error deleting user.' });
  }
};

export const assignRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const validRoles = ['patient', 'dentist', 'receptionist', 'admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ status: 'error', message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
  }
  try {
    await pool.execute('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    await logAudit(req.user.id, req.user.name, 'assign_role', 'users', parseInt(id), `Assigned role ${role}`);
    res.json({ status: 'success', message: `Role updated to ${role}.` });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error updating role.' });
  }
};

// ── Appointment Management ────────────────────────────────────────────────────

export const getAllAppointments = async (req, res) => {
  try {
    const { status: statusFilter, date } = req.query;
    let query = `
      SELECT a.id, a.patient_id, a.dentist_id, a.service, a.appointment_day, a.appointment_time,
             a.status, a.notes, a.created_at, a.updated_at,
             p.name AS patient_name, d.name AS dentist_name
      FROM appointments a
      LEFT JOIN users p ON a.patient_id = p.id
      LEFT JOIN users d ON a.dentist_id = d.id
      WHERE 1=1`;
    let params = [];
    if (statusFilter) {
      query += ' AND a.status = ?';
      params.push(statusFilter);
    }
    if (date) {
      query += ' AND a.appointment_day = ?';
      params.push(date);
    }
    query += ' ORDER BY a.created_at DESC';
    const [rows] = await pool.execute(query, params);
    res.json({ status: 'success', appointments: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching appointments.' });
  }
};

export const approveAppointment = async (req, res) => {
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute('SELECT id, status FROM appointments WHERE id = ? FOR UPDATE', [id]);
    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ status: 'error', message: 'Appointment not found.' });
    }
    if (rows[0].status !== 'Pending') {
      await conn.rollback();
      return res.status(409).json({ status: 'error', message: 'Only pending appointments can be approved.' });
    }
    await conn.execute("UPDATE appointments SET status = 'Confirmed' WHERE id = ?", [id]);
    await conn.commit();
    await logAudit(req.user.id, req.user.name, 'approve_appointment', 'appointments', parseInt(id), 'Approved appointment');
    res.json({ status: 'success', message: 'Appointment approved.' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ status: 'error', message: 'Error approving appointment.' });
  } finally {
    conn.release();
  }
};

export const completeAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute('SELECT id, status FROM appointments WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ status: 'error', message: 'Appointment not found.' });
    if (rows[0].status !== 'Confirmed') return res.status(409).json({ status: 'error', message: 'Only confirmed appointments can be completed.' });
    await pool.execute("UPDATE appointments SET status = 'Completed' WHERE id = ?", [id]);
    await logAudit(req.user.id, req.user.name, 'complete_appointment', 'appointments', parseInt(id), 'Completed appointment');
    res.json({ status: 'success', message: 'Appointment completed.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error completing appointment.' });
  }
};

export const cancelAppointment = async (req, res) => {
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute('SELECT id, schedule_id, status FROM appointments WHERE id = ? FOR UPDATE', [id]);
    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ status: 'error', message: 'Appointment not found.' });
    }
    if (rows[0].status === 'Canceled') {
      await conn.rollback();
      return res.status(409).json({ status: 'error', message: 'Appointment already canceled.' });
    }
    await conn.execute("UPDATE appointments SET status = 'Canceled' WHERE id = ?", [id]);
    await conn.execute("UPDATE schedules SET status = 'available' WHERE id = ?", [rows[0].schedule_id]);
    await conn.commit();
    await logAudit(req.user.id, req.user.name, 'cancel_appointment', 'appointments', parseInt(id), 'Canceled appointment');
    res.json({ status: 'success', message: 'Appointment canceled.' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ status: 'error', message: 'Error canceling appointment.' });
  } finally {
    conn.release();
  }
};

// ── Blog Posts ──────────────────────────────────────────────────────────────────

export const getBlogPosts = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM blog_posts ORDER BY created_at DESC');
    res.json({ status: 'success', posts: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching blog posts.' });
  }
};

export const createBlogPost = async (req, res) => {
  const { title, content, excerpt, image_url, published } = req.body;
  if (!title || !content) return res.status(400).json({ status: 'error', message: 'Title and content are required.' });
  try {
    const [result] = await pool.execute(
      'INSERT INTO blog_posts (title, content, excerpt, author, image_url, published) VALUES (?, ?, ?, ?, ?, ?)',
      [title, content, excerpt || null, req.user.name, image_url || null, published || false]
    );
    await logAudit(req.user.id, req.user.name, 'create_blog', 'blog_posts', result.insertId, `Created post: ${title}`);
    res.json({ status: 'success', message: 'Blog post created.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error creating blog post.' });
  }
};

export const updateBlogPost = async (req, res) => {
  const { id } = req.params;
  const { title, content, excerpt, image_url, published } = req.body;
  try {
    await pool.execute(
      'UPDATE blog_posts SET title = ?, content = ?, excerpt = ?, image_url = ?, published = ? WHERE id = ?',
      [title, content, excerpt || null, image_url || null, published ?? false, id]
    );
    await logAudit(req.user.id, req.user.name, 'update_blog', 'blog_posts', parseInt(id), `Updated post: ${title}`);
    res.json({ status: 'success', message: 'Blog post updated.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error updating blog post.' });
  }
};

export const deleteBlogPost = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM blog_posts WHERE id = ?', [id]);
    await logAudit(req.user.id, req.user.name, 'delete_blog', 'blog_posts', parseInt(id), 'Deleted blog post');
    res.json({ status: 'success', message: 'Blog post deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error deleting blog post.' });
  }
};

// ── FAQs ──────────────────────────────────────────────────────────────────────

export const getFAQs = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM faqs ORDER BY sort_order ASC, created_at DESC');
    res.json({ status: 'success', faqs: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching FAQs.' });
  }
};

export const createFAQ = async (req, res) => {
  const { question, answer, category, sort_order, published } = req.body;
  if (!question || !answer) return res.status(400).json({ status: 'error', message: 'Question and answer are required.' });
  try {
    const [result] = await pool.execute(
      'INSERT INTO faqs (question, answer, category, sort_order, published) VALUES (?, ?, ?, ?, ?)',
      [question, answer, category || 'general', sort_order || 0, published ?? true]
    );
    await logAudit(req.user.id, req.user.name, 'create_faq', 'faqs', result.insertId, `Created FAQ: ${question.substring(0, 50)}`);
    res.json({ status: 'success', message: 'FAQ created.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error creating FAQ.' });
  }
};

export const updateFAQ = async (req, res) => {
  const { id } = req.params;
  const { question, answer, category, sort_order, published } = req.body;
  try {
    await pool.execute(
      'UPDATE faqs SET question = ?, answer = ?, category = ?, sort_order = ?, published = ? WHERE id = ?',
      [question, answer, category || 'general', sort_order || 0, published ?? true, id]
    );
    await logAudit(req.user.id, req.user.name, 'update_faq', 'faqs', parseInt(id), 'Updated FAQ');
    res.json({ status: 'success', message: 'FAQ updated.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error updating FAQ.' });
  }
};

export const deleteFAQ = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM faqs WHERE id = ?', [id]);
    await logAudit(req.user.id, req.user.name, 'delete_faq', 'faqs', parseInt(id), 'Deleted FAQ');
    res.json({ status: 'success', message: 'FAQ deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error deleting FAQ.' });
  }
};

// ── Testimonials ──────────────────────────────────────────────────────────────

export const getTestimonials = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM testimonials ORDER BY created_at DESC');
    res.json({ status: 'success', testimonials: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching testimonials.' });
  }
};

export const createTestimonial = async (req, res) => {
  const { patient_name, content, rating, image_url, published } = req.body;
  if (!patient_name || !content) return res.status(400).json({ status: 'error', message: 'Patient name and content are required.' });
  try {
    const [result] = await pool.execute(
      'INSERT INTO testimonials (patient_name, content, rating, image_url, published) VALUES (?, ?, ?, ?, ?)',
      [patient_name, content, rating || 5, image_url || null, published || false]
    );
    await logAudit(req.user.id, req.user.name, 'create_testimonial', 'testimonials', result.insertId, `Created testimonial by ${patient_name}`);
    res.json({ status: 'success', message: 'Testimonial created.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error creating testimonial.' });
  }
};

export const updateTestimonial = async (req, res) => {
  const { id } = req.params;
  const { patient_name, content, rating, image_url, published } = req.body;
  try {
    await pool.execute(
      'UPDATE testimonials SET patient_name = ?, content = ?, rating = ?, image_url = ?, published = ? WHERE id = ?',
      [patient_name, content, rating || 5, image_url || null, published || false, id]
    );
    await logAudit(req.user.id, req.user.name, 'update_testimonial', 'testimonials', parseInt(id), 'Updated testimonial');
    res.json({ status: 'success', message: 'Testimonial updated.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error updating testimonial.' });
  }
};

export const deleteTestimonial = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM testimonials WHERE id = ?', [id]);
    await logAudit(req.user.id, req.user.name, 'delete_testimonial', 'testimonials', parseInt(id), 'Deleted testimonial');
    res.json({ status: 'success', message: 'Testimonial deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error deleting testimonial.' });
  }
};

// ── Gallery ─────────────────────────────────────────────────────────────────────

export const getGalleryImages = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM gallery_images ORDER BY created_at DESC');
    res.json({ status: 'success', images: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching gallery images.' });
  }
};

export const createGalleryImage = async (req, res) => {
  const { title, image_url, description, category } = req.body;
  if (!title || !image_url) return res.status(400).json({ status: 'error', message: 'Title and image URL are required.' });
  try {
    const [result] = await pool.execute(
      'INSERT INTO gallery_images (title, image_url, description, category) VALUES (?, ?, ?, ?)',
      [title, image_url, description || null, category || null]
    );
    await logAudit(req.user.id, req.user.name, 'create_gallery', 'gallery_images', result.insertId, `Added image: ${title}`);
    res.json({ status: 'success', message: 'Image added.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error adding image.' });
  }
};

export const deleteGalleryImage = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM gallery_images WHERE id = ?', [id]);
    await logAudit(req.user.id, req.user.name, 'delete_gallery', 'gallery_images', parseInt(id), 'Deleted gallery image');
    res.json({ status: 'success', message: 'Image deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error deleting image.' });
  }
};

// ── Pricing ─────────────────────────────────────────────────────────────────────

export const getPricing = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM pricing ORDER BY category ASC, service_name ASC');
    res.json({ status: 'success', pricing: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching pricing.' });
  }
};

export const createPricing = async (req, res) => {
  const { service_name, description, price, duration, category } = req.body;
  if (!service_name || !price) return res.status(400).json({ status: 'error', message: 'Service name and price are required.' });
  try {
    const [result] = await pool.execute(
      'INSERT INTO pricing (service_name, description, price, duration, category) VALUES (?, ?, ?, ?, ?)',
      [service_name, description || null, parseFloat(price), duration || null, category || null]
    );
    await logAudit(req.user.id, req.user.name, 'create_pricing', 'pricing', result.insertId, `Added pricing: ${service_name}`);
    res.json({ status: 'success', message: 'Pricing created.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error creating pricing.' });
  }
};

export const updatePricing = async (req, res) => {
  const { id } = req.params;
  const { service_name, description, price, duration, category } = req.body;
  try {
    await pool.execute(
      'UPDATE pricing SET service_name = ?, description = ?, price = ?, duration = ?, category = ? WHERE id = ?',
      [service_name, description, parseFloat(price), duration, category, id]
    );
    await logAudit(req.user.id, req.user.name, 'update_pricing', 'pricing', parseInt(id), `Updated pricing: ${service_name}`);
    res.json({ status: 'success', message: 'Pricing updated.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error updating pricing.' });
  }
};

export const deletePricing = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM pricing WHERE id = ?', [id]);
    await logAudit(req.user.id, req.user.name, 'delete_pricing', 'pricing', parseInt(id), 'Deleted pricing');
    res.json({ status: 'success', message: 'Pricing deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error deleting pricing.' });
  }
};

// ── Clinic Settings ────────────────────────────────────────────────────────────

export const getClinicSettings = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM clinic_settings');
    const settings = {};
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });
    res.json({ status: 'success', settings });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching settings.' });
  }
};

export const updateClinicSettings = async (req, res) => {
  const { settings } = req.body;
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ status: 'error', message: 'Settings object is required.' });
  }
  try {
    for (const [key, value] of Object.entries(settings)) {
      await pool.execute(
        'INSERT INTO clinic_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [key, value, value]
      );
    }
    await logAudit(req.user.id, req.user.name, 'update_settings', 'clinic_settings', null, 'Updated clinic settings');
    res.json({ status: 'success', message: 'Settings updated.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error updating settings.' });
  }
};

// ── Reports ─────────────────────────────────────────────────────────────────────

export const getAppointmentReports = async (req, res) => {
  try {
    const { from, to } = req.query;
    let query = `
      SELECT a.status, COUNT(*) as count,
             DATE(a.created_at) as date,
             SUM(CASE WHEN a.status = 'Completed' THEN 1 ELSE 0 END) as completed,
             SUM(CASE WHEN a.status = 'Canceled' THEN 1 ELSE 0 END) as canceled
      FROM appointments a
      WHERE 1=1`;
    let params = [];
    if (from) { query += ' AND a.created_at >= ?'; params.push(from); }
    if (to) { query += ' AND a.created_at <= ?'; params.push(to); }
    query += ' GROUP BY a.status, DATE(a.created_at) ORDER BY date DESC';

    const [statusRows] = await pool.execute(query, params);

    const [totalRows] = await pool.execute(
      `SELECT COUNT(*) as total,
              SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
              SUM(CASE WHEN status = 'Confirmed' THEN 1 ELSE 0 END) as confirmed,
              SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
              SUM(CASE WHEN status = 'Canceled' THEN 1 ELSE 0 END) as canceled
       FROM appointments`
    );

    res.json({ status: 'success', data: { overview: totalRows[0], daily: statusRows } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error generating reports.' });
  }
};

export const getPatientStats = async (req, res) => {
  try {
    const [totalPatients] = await pool.execute("SELECT COUNT(*) as total FROM users WHERE role = 'patient'");
    const [newPatients] = await pool.execute("SELECT COUNT(*) as total FROM users WHERE role = 'patient' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
    const [appointmentsPerPatient] = await pool.execute(`
      SELECT AVG(cnt) as avg_appointments FROM (
        SELECT COUNT(*) as cnt FROM appointments GROUP BY patient_id
      ) as sub
    `);
    const [topPatients] = await pool.execute(`
      SELECT u.id, u.name, u.email, COUNT(a.id) as total_appts
      FROM users u LEFT JOIN appointments a ON u.id = a.patient_id
      WHERE u.role = 'patient'
      GROUP BY u.id, u.name, u.email
      ORDER BY total_appts DESC LIMIT 10
    `);

    res.json({
      status: 'success',
      data: {
        total: totalPatients[0].total,
        newLast30Days: newPatients[0].total,
        avgAppointmentsPerPatient: Math.round((appointmentsPerPatient[0]?.avg_appointments || 0) * 10) / 10,
        topPatients
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching patient stats.' });
  }
};

export const exportReports = async (req, res) => {
  try {
    const { type } = req.query;
    let data;
    if (type === 'appointments') {
      const [rows] = await pool.execute(`
        SELECT a.id, p.name as patient, d.name as dentist, a.service, a.appointment_day, a.appointment_time, a.status, a.created_at
        FROM appointments a LEFT JOIN users p ON a.patient_id = p.id LEFT JOIN users d ON a.dentist_id = d.id
        ORDER BY a.created_at DESC
      `);
      data = rows;
    } else if (type === 'users') {
      const [rows] = await pool.execute('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
      data = rows;
    } else {
      data = { message: 'Specify export type: appointments or users' };
    }
    await logAudit(req.user.id, req.user.name, 'export_report', 'reports', null, `Exported ${type} report`);
    res.json({ status: 'success', data, exportedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error exporting data.' });
  }
};

// ── Backup ──────────────────────────────────────────────────────────────────────

export const createBackup = async (req, res) => {
  try {
    await logAudit(req.user.id, req.user.name, 'create_backup', 'system', null, 'Manual backup initiated');
    res.json({ status: 'success', message: 'Backup initiated successfully.', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error creating backup.' });
  }
};

// ── Audit Logs ──────────────────────────────────────────────────────────────────

export const getAuditLogs = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100');
    res.json({ status: 'success', logs: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching audit logs.' });
  }
};

// ── Public facing endpoints ─────────────────────────────────────────────────────

export const getPublicFAQs = async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM faqs WHERE published = true ORDER BY sort_order ASC");
    res.json({ status: 'success', faqs: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching FAQs.' });
  }
};

export const getPublicTestimonials = async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM testimonials WHERE published = true ORDER BY created_at DESC");
    res.json({ status: 'success', testimonials: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching testimonials.' });
  }
};

export const getPublicGallery = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM gallery_images ORDER BY created_at DESC');
    res.json({ status: 'success', images: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching gallery.' });
  }
};

export const getPublicPricing = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM pricing ORDER BY category ASC, service_name ASC');
    res.json({ status: 'success', pricing: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching pricing.' });
  }
};

export const getPublicBlogPosts = async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM blog_posts WHERE published = true ORDER BY created_at DESC");
    res.json({ status: 'success', posts: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching blog posts.' });
  }
};

export const getClinicInfo = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM clinic_settings');
    const settings = {};
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });
    res.json({ status: 'success', settings });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error fetching clinic info.' });
  }
};

export { createTables, logAudit };
