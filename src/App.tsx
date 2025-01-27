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
import EditRoles from './pages/Admin/EditRoles';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import CreateRole from './pages/Admin/CreateRole';
import EditRole from './pages/Admin/EditRole';
import EditUserInRole from './pages/Admin/EditUserInRole';

const queryClient = new QueryClient()

const App: React.FC = () => {
  const isAuthPage =
    location.pathname === '/Login' || location.pathname === '/ForgotPassword';
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
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
                  {/* Routes for Admin */}
                  <Route path="/Admin/EditRoles" element={<EditRoles />} />
                  <Route path="/Admin/CreateRole" element={<CreateRole />} />
                  <Route path="/Admin/EditRole/:id" element={<EditRole />} />
                  <Route path="/Admin/EditUserInRole/:id" element={<EditUserInRole />} />
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
      </QueryClientProvider>
    </ThemeProvider>
  );
};
export default App;
