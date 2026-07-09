import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Bell,
  Search,
  LogOut,
  Home,
  Calendar,
  FileText,
  Settings,
  Users,
  CreditCard,
  BarChart,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import styles from './DashboardLayout.module.css';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const getNavItemsForRole = (role: string): NavItem[] => {
  const base = '/dashboard/' + role;
  switch (role) {
    case 'patient':
      return [
        { label: 'Dashboard', path: base, icon: <Home size={20} /> },
        { label: 'Appointments', path: `${base}/appointments`, icon: <Calendar size={20} /> },
        { label: 'Medical Records', path: `${base}/records`, icon: <FileText size={20} /> },
        { label: 'Billing', path: `${base}/billing`, icon: <CreditCard size={20} /> },
      ];
    case 'dentist':
      return [
        { label: 'Schedule', path: base, icon: <Calendar size={20} /> },
        { label: 'Patients', path: `${base}/patients`, icon: <Users size={20} /> },
        { label: 'Treatments', path: `${base}/treatments`, icon: <FileText size={20} /> },
      ];
    case 'receptionist':
      return [
        { label: 'Appointments', path: base, icon: <Calendar size={20} /> },
        { label: 'Patients', path: `${base}/patients`, icon: <Users size={20} /> },
        { label: 'Billing', path: `${base}/billing`, icon: <CreditCard size={20} /> },
      ];
    case 'admin':
      return [
        { label: 'Overview', path: base, icon: <BarChart size={20} /> },
        { label: 'User Management', path: `${base}/users`, icon: <Users size={20} /> },
        { label: 'Appointments', path: `${base}/appointments`, icon: <Calendar size={20} /> },
        { label: 'Settings', path: `${base}/settings`, icon: <Settings size={20} /> },
      ];
    case 'owner':
      return [
        { label: 'Business Insights', path: base, icon: <BarChart size={20} /> },
        { label: 'Financials', path: `${base}/financials`, icon: <CreditCard size={20} /> },
        { label: 'Staff Performance', path: `${base}/staff`, icon: <Users size={20} /> },
      ];
    default:
      return [];
  }
};

export const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const pathParts = location.pathname.split('/');
  const role = pathParts[2] || 'patient';
  const navItems = getNavItemsForRole(role);

  const handleLogout = () => {
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={styles.layout}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <Stethoscope size={22} />
            </div>
            {!collapsed && <span className={styles.logoText}>DentalCare</span>}
          </Link>
          <button
            className={styles.collapseBtn}
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className={styles.userProfile}>
          <div className={styles.avatar}>
            {role.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className={styles.userInfo}>
              <span className={styles.userName}>Test User</span>
              <span className={styles.userRole}>{role}</span>
            </div>
          )}
        </div>
      </aside>

      <main className={`${styles.main} ${collapsed ? styles.mainCollapsed : ''}`}>
        <header className={styles.topbar}>
          <div className={styles.topbarTitle}>
            {navItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
          </div>
          <div className={styles.topbarActions}>
            <div className={styles.searchBox}>
              <Search size={18} />
              <input type="text" placeholder="Search..." className={styles.searchInput} />
            </div>
            <div className={styles.iconButton}>
              <Bell size={20} />
              <span className={styles.notificationDot} />
            </div>
            <div className={styles.iconButton} onClick={handleLogout} title="Logout">
              <LogOut size={20} />
            </div>
          </div>
        </header>
        <div className={styles.content}>
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
