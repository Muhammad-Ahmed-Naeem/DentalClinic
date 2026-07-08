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
import { PatientDashboard } from './pages/Dashboards/PatientDashboard';
import { DentistDashboard } from './pages/Dashboards/DentistDashboard';
import { ReceptionistDashboard } from './pages/Dashboards/ReceptionistDashboard';
import { AdminDashboard } from './pages/Dashboards/AdminDashboard';
import { OwnerDashboard } from './pages/Dashboards/OwnerDashboard';



function App() {
  return (
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
          <Route path="/dashboard/patient/*" element={<PatientDashboard />} />
          <Route path="/dashboard/dentist/*" element={<DentistDashboard />} />
          <Route path="/dashboard/receptionist/*" element={<ReceptionistDashboard />} />
          <Route path="/dashboard/admin/*" element={<AdminDashboard />} />
          <Route path="/dashboard/owner/*" element={<OwnerDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
