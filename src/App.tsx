import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { ThemeProvider } from './components/ThemeProvider';

// import Dashboard from "./pages/Dashboard/Dashboard";
import PatientTable from './pages/Supervisor/PatientTable';
import AddPatient from './pages/Supervisor/AddPatient';
import ManageAdhoc from './pages/Supervisor/ManageAdhoc';
import AddAdhoc from './pages/Supervisor/AddAdhoc';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ViewMedicationSchedule from './pages/Supervisor/ViewMedicationSchedule';
import ManageMedication from './pages/Supervisor/ManageMedication';
import ManageActivities from './pages/Supervisor/ManageActivities';
import ViewPatient from './pages/ViewPatient';
import TestGeocode from './pages/testGeocode';
import { Toaster } from './components/ui/sonner';
import { ModalProvider } from './hooks/useModal';

const App: React.FC = () => {
  const isAuthPage =
    location.pathname === '/Login' || location.pathname === '/ForgotPassword';
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <div className="min-h-screen bg-background font-sans antialiased">
          {!isAuthPage && <Navbar />}
          <ModalProvider>
            <main>
              <Routes>
                {/* <Route path="/" element={<Dashboard />} /> */}
                <Route path="/Login" element={<Login />} />
                <Route path="/ForgotPassword" element={<ForgotPassword />} />
                <Route path="/ViewPatient/:id" element={<ViewPatient />} />
                <Route path="/" element={<PatientTable />} />

                {/* Routes for Supervisor*/}
                <Route
                  path="/Supervisor/ManagePatients"
                  element={<PatientTable />}
                />
                <Route
                  path="/Supervisor/AddPatients"
                  element={<AddPatient />}
                />
                <Route
                  path="/Supervisor/ViewMedicationSchedule"
                  element={<ViewMedicationSchedule />}
                />
                <Route
                  path="/Supervisor/ManageMedication"
                  element={<ManageMedication />}
                />
                <Route
                  path="/Supervisor/ManageActivities"
                  element={<ManageActivities />}
                />
                <Route
                  path="/Supervisor/ManageAdhoc"
                  element={<ManageAdhoc />}
                />
                <Route path="/Supervisor/AddAdhoc" element={<AddAdhoc />} />

                {/* Routes for Other roles */}
                <Route path="/TestGeocode" element={<TestGeocode />} />
              </Routes>
            </main>
          </ModalProvider>
          <Toaster richColors />
        </div>
      </Router>
    </ThemeProvider>
  );
};
export default App;
