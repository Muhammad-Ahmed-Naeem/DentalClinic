import React from 'react';
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
  BarChart
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
  
  // Extract role from path (e.g., /dashboard/patient -> patient)
  const pathParts = location.pathname.split('/');
  const role = pathParts[2] || 'patient';
  
  const navItems = getNavItemsForRole(role);

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <Link to="/" className={styles.logo}>
          <Stethoscope size={24} color="var(--color-primary)" />
          DentalCare
        </Link>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.userProfile}>
          <div className={styles.avatar}>
            {role.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Test User</span>
            <span className={styles.userRole}>{role}</span>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarTitle}>
            {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
          </div>
          <div className={styles.topbarActions}>
            <div className={styles.iconButton}>
              <Search size={20} />
            </div>
            <div className={styles.iconButton}>
              <Bell size={20} />
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
