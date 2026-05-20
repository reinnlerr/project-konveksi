import { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import useAuth from "./hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CustomerPage from "./pages/CustomerPage";
import RoleSelectionPage from "./pages/RoleSelectionPage"; // ← IMPORT HALAMAN BARU INI

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

    // 👇 LOGIKA BARU UNTUK REDIRECT 👇
    if (result.user.role === "admin") {
      navigate("/dashboard");
    } else if (result.user.role === "customer") {
      navigate("/customer");
    } else if (result.user.role === "karyawan") {
      navigate("/pilih-divisi"); // ← Arahkan ke halaman pilih divisi
    } else if (["bahan", "cutting", "jahit", "finishing", "pengiriman"].includes(result.user.role)) {
      navigate(`/role/${result.user.role}`); // Jaga-jaga kalau masih ada user lama
    } else {
      setLoginError("Role tidak valid. Hubungi administrator.");
      setLoginSuccess("");
      logout();
    }
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
    logout();
    setLoginError("");
    setRegisterError("");
    setLoginSuccess("");
    setRegisterSuccess("");
    navigate("/login");
  };

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
      
      {/* Route Dashboard Admin */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute isAllowed={user?.role === "admin"}>
            <Dashboard user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      {/* Route Customer */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute isAllowed={Boolean(user) && user?.role === "customer"}>
            <CustomerPage user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      {/* 👇 HALAMAN BARU: Pilih Divisi Karyawan 👇 */}
      <Route
        path="/pilih-divisi"
        element={
          <ProtectedRoute isAllowed={Boolean(user) && user?.role === "karyawan"}>
            <RoleSelectionPage onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      {/* 👇 UPDATE: Rute Karyawan sekarang mengizinkan user dengan role "karyawan" 👇 */}
      <Route
        path="/role/bahan"
        element={
          <ProtectedRoute isAllowed={Boolean(user) && (user?.role === "bahan" || user?.role === "karyawan")}>
            <Dashboard user={user} dashboardRole="bahan" initialPage="Dashboard" onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/role/cutting"
        element={
          <ProtectedRoute isAllowed={Boolean(user) && (user?.role === "cutting" || user?.role === "karyawan")}>
            <Dashboard user={user} dashboardRole="cutting" initialPage="Dashboard" onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/role/jahit"
        element={
          <ProtectedRoute isAllowed={Boolean(user) && (user?.role === "jahit" || user?.role === "karyawan")}>
            <Dashboard user={user} dashboardRole="jahit" initialPage="Dashboard" onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/role/finishing"
        element={
          <ProtectedRoute isAllowed={Boolean(user) && (user?.role === "finishing" || user?.role === "karyawan")}>
            <Dashboard user={user} dashboardRole="finishing" initialPage="Dashboard" onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/role/pengiriman"
        element={
          <ProtectedRoute isAllowed={Boolean(user) && (user?.role === "pengiriman" || user?.role === "karyawan")}>
            <Dashboard user={user} dashboardRole="pengiriman" initialPage="Dashboard" onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;