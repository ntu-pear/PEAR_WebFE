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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

import EditRoles from './pages/Admin/EditRoles';
import CreateRole from './pages/Admin/CreateRole';
import EditRole from './pages/Admin/EditRole';
import EditUserInRole from './pages/Admin/EditUserInRole';

import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import TempPage from './pages/TempPage';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <ModalProvider>
              <div className="min-h-screen bg-background font-sans antialiased">
                <main>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                      path="/forgot-password"
                      element={<ForgotPassword />}
                    />

                    {/* Routes for Supervisor */}
                    <Route
                      path="/supervisor/*"
                      element={<ProtectedRoute allowedRoles={['SUPERVISOR']} />}
                    >
                      <Route
                        path="manage-patients"
                        element={<PatientTable />}
                      />
                      <Route
                        path="view-patient/:id"
                        element={<ViewPatient />}
                      />
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

                    {/* Routes for Admin*/}
                    <Route
                      path="admin/*"
                      element={<ProtectedRoute allowedRoles={['ADMIN']} />}
                    >
                      <Route path="temp-page" element={<TempPage />} />
                      <Route path="edit-roles" element={<EditRoles />} />
                      <Route path="create-role" element={<CreateRole />} />
                      <Route path="edit-role/:id" element={<EditRole />} />
                      <Route
                        path="edit-user-in-role/:id"
                        element={<EditUserInRole />}
                      />
                    </Route>

                    {/* Routes for Doctor*/}
                    <Route
                      path="doctor/*"
                      element={<ProtectedRoute allowedRoles={['DOCTOR']} />}
                    >
                      <Route path="temp-page" element={<TempPage />} />
                    </Route>

                    {/* Routes for Guardian*/}
                    <Route
                      path="guardian/*"
                      element={<ProtectedRoute allowedRoles={['GUARDIAN']} />}
                    >
                      <Route path="temp-page" element={<TempPage />} />
                    </Route>

                    {/* Routes for Game Therapist*/}
                    <Route
                      path="game-therapist/*"
                      element={
                        <ProtectedRoute allowedRoles={['GAME THERAPIST']} />
                      }
                    >
                      <Route path="temp-page" element={<TempPage />} />
                    </Route>

                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="/not-found" element={<NotFound />} />
                    <Route path="/test-geocode" element={<TestGeocode />} />
                    <Route path="/" element={<Navigate to="/login" />} />
                  </Routes>
                </main>
                <Toaster richColors />
              </div>
            </ModalProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
};
export default App;
