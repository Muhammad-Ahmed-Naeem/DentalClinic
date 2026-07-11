import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../dbconfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'dentalclinic_jwt_secret_key_2026';

const maintenanceHtmlPath = path.join(__dirname, '..', 'public', 'maintenance.html');
let htmlTemplate = null;

const loadHtmlTemplate = () => {
  if (htmlTemplate) return htmlTemplate;
  try {
    htmlTemplate = fs.readFileSync(maintenanceHtmlPath, 'utf-8');
  } catch {
    htmlTemplate = `<html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0b0f1a;color:#e2e8f0;text-align:center">
      <div><h1>Under Maintenance</h1><p>We'll be back shortly.</p></div></body></html>`;
  }
  return htmlTemplate;
};

let cachedEnabled = null;
let cacheTime = 0;
const CACHE_TTL = 30000;

const isMaintenanceEnabled = async () => {
  const now = Date.now();
  if (cachedEnabled !== null && (now - cacheTime) < CACHE_TTL) {
    return cachedEnabled;
  }
  try {
    const [rows] = await pool.execute(
      "SELECT setting_value FROM clinic_settings WHERE setting_key = 'maintenance_mode' LIMIT 1"
    );
    cachedEnabled = rows.length > 0 && (rows[0].setting_value === 'true' || rows[0].setting_value === '1');
    cacheTime = now;
  } catch {
    cachedEnabled = false;
  }
  return cachedEnabled;
};

export const clearMaintenanceCache = () => {
  cachedEnabled = null;
  cacheTime = 0;
};

const getMaintenanceMessage = async () => {
  try {
    const [rows] = await pool.execute(
      "SELECT setting_value FROM clinic_settings WHERE setting_key = 'maintenance_message' LIMIT 1"
    );
    if (rows.length && rows[0].setting_value) {
      return rows[0].setting_value;
    }
  } catch {}
  return '';
};

const sendMaintenancePage = async (res) => {
  const template = loadHtmlTemplate();
  const message = await getMaintenanceMessage();
  const html = template.replace('__MAINTENANCE_MESSAGE__', message.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
  res.status(503).set('Content-Type', 'text/html; charset=utf-8').send(html);
};

export const maintenanceGuard = async (req, res, next) => {
  const enabled = await isMaintenanceEnabled();
  if (!enabled) return next();

  let user = null;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      user = jwt.verify(token, JWT_SECRET);
    } catch {}
  }

  if (user && (user.role === 'super_admin' || user.role === 'admin')) {
    return next();
  }

  if (req.method === 'GET' && req.accepts('html')) {
    return sendMaintenancePage(res);
  }

  return res.status(503).json({
    status: 'error',
    message: 'System is currently under maintenance. Please try again later.',
    maintenance: true,
  });
};
