import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import { ThemeProvider } from "./components/theme/ThemeProvider";
// import Dashboard from "./pages/Dashboard/Dashboard";
import PatientTable from "./pages/Supervisor/PatientTable";
import Sidebar2 from "./components/Sidebar/Sidebar2";

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <div className="min-h-screen bg-background font-sans antialiased">
          <Navbar />
          <div className="w-full h-full flex">
            <div className="w-2/12 hidden 2xl:block">
              <Sidebar2 role="supervisor"/>
            </div>
            <main className="container mx-auto px-4 py-8 ">
              <Routes>
                <Route path="/patients" element={<PatientTable />} />
                <Route path="/manage-medication"  />
                <Route path="/view-medication-schedule"  />
                <Route path="/manage-activities" />
                <Route path="/manage-attendance" />
                <Route path="*" element={<Navigate to="/patients" />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
};
export default App;
