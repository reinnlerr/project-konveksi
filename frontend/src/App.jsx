import { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import useAuth from "./hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CustomerPage from "./pages/CustomerPage";
import RoleSelectionPage from "./pages/RoleSelectionPage";

function App() {
  const navigate = useNavigate();
  const { user, login, register, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "").trim();

    if (!email || !password) {
      setLoginError("Email dan password wajib diisi.");
      setLoginSuccess("");
      return;
    }

    setLoading(true);
    setLoginError("");
    setLoginSuccess("");

    const result = await login({ email, password });

    if (!result.ok) {
      setLoading(false);
      setLoginError(result.message);
      setLoginSuccess("");
      return;
    }

    if (result.token) {
      localStorage.setItem("token", result.token);
    }

    setLoginSuccess(result.message);
    setLoading(false);

    if (result.user.role === "admin") {
      navigate("/dashboard");
    } else if (result.user.role === "customer") {
      navigate("/customer");
    } else if (result.user.role === "karyawan") {
      navigate("/select-role"); // ← karyawan pilih divisi dulu
    } else if (["bahan", "cutting", "jahit", "finishing", "pengiriman"].includes(result.user.role)) {
      navigate(`/role/${result.user.role}`);
    } else {
      setLoginError("Role tidak valid. Hubungi administrator.");
      setLoginSuccess("");
      logout();
    }
  };

  const handleSelectRole = (selectedRole) => {
    localStorage.setItem("dashboardRole", selectedRole);
    navigate(`/role/${selectedRole}`);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");
    const role = String(form.get("role") || "").trim();

    if (!email || !password || !confirmPassword) {
      setRegisterError("Semua field wajib diisi.");
      setRegisterSuccess("");
      return;
    }
    if (!role) {
      setRegisterError("Pilih role terlebih dahulu.");
      setRegisterSuccess("");
      return;
    }
    if (password.length < 6) {
      setRegisterError("Password minimal 6 karakter.");
      setRegisterSuccess("");
      return;
    }
    if (password !== confirmPassword) {
      setRegisterError("Konfirmasi password tidak cocok.");
      setRegisterSuccess("");
      return;
    }

    setRegisterError("");
    setRegisterSuccess("");
    setLoading(true);

    const result = await register({ email, password, confirmPassword, role });
    setLoading(false);

    if (!result.ok) {
      setRegisterError(result.message);
      setRegisterSuccess("");
      return;
    }

    setRegisterSuccess(result.message);
    setLoginSuccess("Register berhasil. Silakan login.");
    navigate("/login");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("dashboardRole");
    logout();
    setLoginError("");
    setRegisterError("");
    setLoginSuccess("");
    setRegisterSuccess("");
    navigate("/login");
  };

  // karyawan yang sudah pilih divisi, atau role spesifik
  const isKaryawan = Boolean(user) && 
    (user?.role === "karyawan" || ["bahan","cutting","jahit","finishing","pengiriman"].includes(user?.role));

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={<LoginPage onLogin={handleLogin} loading={loading} error={loginError} success={loginSuccess} />}
      />
      <Route
        path="/register"
        element={<RegisterPage onRegister={handleRegister} loading={loading} error={registerError} success={registerSuccess} />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute isAllowed={user?.role === "admin"}>
            <Dashboard user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer"
        element={
          <ProtectedRoute isAllowed={Boolean(user) && user?.role === "customer"}>
            <CustomerPage user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      {/* Karyawan pilih divisi */}
      <Route
        path="/select-role"
        element={
          <ProtectedRoute isAllowed={Boolean(user) && user?.role === "karyawan"}>
            <RoleSelectionPage onSelectRole={handleSelectRole} />
          </ProtectedRoute>
        }
      />

      {/* Route divisi — izinkan karyawan (sudah pilih divisi) atau role spesifik */}
      <Route
        path="/role/bahan"
        element={
          <ProtectedRoute isAllowed={isKaryawan}>
            <Dashboard user={user} dashboardRole="bahan" initialPage="Dashboard" onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/role/cutting"
        element={
          <ProtectedRoute isAllowed={isKaryawan}>
            <Dashboard user={user} dashboardRole="cutting" initialPage="Dashboard" onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/role/jahit"
        element={
          <ProtectedRoute isAllowed={isKaryawan}>
            <Dashboard user={user} dashboardRole="jahit" initialPage="Dashboard" onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/role/finishing"
        element={
          <ProtectedRoute isAllowed={isKaryawan}>
            <Dashboard user={user} dashboardRole="finishing" initialPage="Dashboard" onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/role/pengiriman"
        element={
          <ProtectedRoute isAllowed={isKaryawan}>
            <Dashboard user={user} dashboardRole="pengiriman" initialPage="Dashboard" onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;