import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import { ThemeProvider } from "./components/theme/ThemeProvider";

// import Dashboard from "./pages/Dashboard/Dashboard";
import PatientTable from "./pages/PatientTable";
import AddPatient from "./pages/AddPatient";

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <div className="min-h-screen bg-background font-sans antialiased">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {/* <Route path="/" element={<Dashboard />} /> */}
              <Route path="/" element={<PatientTable />} />
              <Route path="/AddPatients" element={<AddPatient />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
};
export default App;
