import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DarkModeProvider, useDarkMode } from "./context/DarkModeContext";
import DashboardPage from "./pages/DashboardPage";
import InvoicesPage from './pages/InvoicesPage';
import LoginPage from "./pages/LoginPage";
import ClientsPage from "./pages/ClientsPage";
import ProductsPage from "./pages/ProductsPage";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { AnimatePresence } from "framer-motion";
import Layout from "./components/layout/Layout";
import SettingsPage from "./pages/SettingsPage";
import "./index.css";

function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) {
    return <div>Chargement...</div>
  }
  if (!token) {
    return <Navigate to={"/login"} />
  }
  return children;
}

// Component for dashboard pages with Material-UI
function DashboardRoutes() {
  const { darkMode } = useDarkMode();
  
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: { main: "#1976d2" },
      secondary: { main: "#ff9800" },
      background: { default: darkMode ? "#121212" : "#f4f6fa" },
    },
    shape: { borderRadius: 10 },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout>
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/factures"
            element={
              <PrivateRoute>
                <InvoicesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <PrivateRoute>
                <ClientsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/produits"
            element={
              <PrivateRoute>
                <ProductsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}

function AppContent() {
  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Login page without Material-UI - uses only Tailwind */}
          <Route path="/login" element={<LoginPage />} />
          {/* Dashboard pages with Material-UI */}
          <Route path="/*" element={<DashboardRoutes />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default App;