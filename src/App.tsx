import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from './components/ui/sonner';
import { ModalProvider } from './hooks/useModal';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';

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
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <div className="min-h-screen bg-background font-sans antialiased">
          <AuthProvider>
            <ModalProvider>
              <main>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  {/* Routes for Supervisor */}
                  <Route
                    path="/supervisor/*"
                    element={<ProtectedRoute allowedRoles={['SUPERVISOR']} />}
                  >
                    <Route path="manage-patients" element={<PatientTable />} />
                    <Route path="view-patient/:id" element={<ViewPatient />} />
                    <Route path="add-patient" element={<AddPatient />} />
                    <Route
                      path="view-medication-schedule"
                      element={<ViewMedicationSchedule />}
                    />
                    <Route
                      path="manage-medication"
                      element={<ManageMedication />}
                    />
                    <Route
                      path="manage-activities"
                      element={<ManageActivities />}
                    />
                    <Route path="manage-adhoc" element={<ManageAdhoc />} />
                    <Route path="add-adhoc" element={<AddAdhoc />} />
                  </Route>

                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="/not-found" element={<NotFound />} />
                  <Route path="/test-geocode" element={<TestGeocode />} />
                  <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
              </main>
            </ModalProvider>
          </AuthProvider>
          <Toaster richColors />
        </div>
      </Router>
    </ThemeProvider>
  );
};
export default App;
