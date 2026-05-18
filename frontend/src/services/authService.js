const API_URL = "http://localhost/project-konveksi/Backend";

export async function loginUser({ email, password }) {
  try {
    const response = await fetch(`${API_URL}/login.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.status === "success") {
      localStorage.setItem("currentUser", JSON.stringify(data.data));
      return { ok: true, message: data.message, user: data.data };
    } else {
      return { ok: false, message: data.message };
    }
  } catch (error) {
    return { ok: false, message: "Gagal terhubung ke server." };
  }
}

export async function registerUser({ email, password, confirmPassword, role }) {
  try {
    const response = await fetch(`${API_URL}/register.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, confirmPassword, role }),
    });

    const data = await response.json();

    if (data.status === "success") {
      return { ok: true, message: data.message };
    } else {
      return { ok: false, message: data.message };
    }
  } catch (error) {
    return { ok: false, message: "Gagal terhubung ke server." };
  }
}

export function getCurrentUser() {
  const raw = localStorage.getItem("currentUser");
  if (!raw) return null;
  return JSON.parse(raw);
}

export function logoutUser() {
  localStorage.removeItem("currentUser");
}

// Tambahan ini aja yang baru! ⬇️
export async function getUsers() {
  try {
    const response = await fetch(`${API_URL}/users.php`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (data.status === "success") {
      return data.data;
    }
    return [];
  } catch (error) {
    return [];
  }
}