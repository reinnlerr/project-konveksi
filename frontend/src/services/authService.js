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
      // ── Simpan user & token ──
      localStorage.setItem("currentUser", JSON.stringify(data.data));
      localStorage.setItem("token", data.token); // ← tambah ini
      return { ok: true, message: data.message, user: data.data, token: data.token }; // ← return token
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
  localStorage.removeItem("token"); // ← hapus token juga saat logout
}

export async function getUsers() {
  try {
    const token = localStorage.getItem("token"); // ← ambil token
    const response = await fetch(`${API_URL}/users.php`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // ← kirim token
      },
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
