import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { Home } from './pages/Home';
import { Services } from './pages/Services';
import { Team } from './pages/Team';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ToastProvider } from './components/Toast';
import { 
  PatientDashboard, 
  PatientAppointments, 
  PatientRecords, 
  PatientBilling 
} from './pages/Dashboards/PatientDashboard';
import { 
  DentistDashboard,
  DentistPatients,
  DentistTreatments
} from './pages/Dashboards/DentistDashboard';
import { 
  ReceptionistDashboard,
  ReceptionistPatients,
  ReceptionistBilling
} from './pages/Dashboards/ReceptionistDashboard';
import { 
  AdminDashboard,
  AdminUsers,
  AdminAppointments,
  AdminSettings
} from './pages/Dashboards/AdminDashboard';
import { 
  OwnerDashboard,
  OwnerFinancials,
  OwnerStaff
} from './pages/Dashboards/OwnerDashboard';

const App = () => {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/team" element={<Team />} />
            <Route path="/contact" element={<Contact />} />
          </Route>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route element={<DashboardLayout />}>
            {/* Patient Routes */}
            <Route path="/dashboard/patient" element={<PatientDashboard />} />
            <Route path="/dashboard/patient/appointments" element={<PatientAppointments />} />
            <Route path="/dashboard/patient/records" element={<PatientRecords />} />
            <Route path="/dashboard/patient/billing" element={<PatientBilling />} />
            
            {/* Dentist Routes */}
            <Route path="/dashboard/dentist" element={<DentistDashboard />} />
            <Route path="/dashboard/dentist/patients" element={<DentistPatients />} />
            <Route path="/dashboard/dentist/treatments" element={<DentistTreatments />} />
            
            {/* Receptionist Routes */}
            <Route path="/dashboard/receptionist" element={<ReceptionistDashboard />} />
            <Route path="/dashboard/receptionist/patients" element={<ReceptionistPatients />} />
            <Route path="/dashboard/receptionist/billing" element={<ReceptionistBilling />} />
            
            {/* Admin Routes */}
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/dashboard/admin/users" element={<AdminUsers />} />
            <Route path="/dashboard/admin/appointments" element={<AdminAppointments />} />
            <Route path="/dashboard/admin/settings" element={<AdminSettings />} />
            
            {/* Owner Routes */}
            <Route path="/dashboard/owner" element={<OwnerDashboard />} />
            <Route path="/dashboard/owner/financials" element={<OwnerFinancials />} />
            <Route path="/dashboard/owner/staff" element={<OwnerStaff />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;
