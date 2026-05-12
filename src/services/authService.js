const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";

function hashPassword(value) {
  // Basic hashing for demo purpose only.
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return `h${(hash >>> 0).toString(16)}`;
}

function sanitizeUser(user) {
  const { password, passwordHash, ...safe } = user;
  return safe;
}

const DEFAULT_ADMIN = {
  name: "Admin Konveksi",
  email: "admin@gmail.com",
  passwordHash: hashPassword("admin123"),
  role: "admin",
};

function readUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  const parsed = raw ? JSON.parse(raw) : [];
  const migrated = parsed.map((u) => {
    if (u.passwordHash) return u;
    if (u.password) {
      const { password, ...rest } = u;
      return { ...rest, passwordHash: hashPassword(password) };
    }
    return u;
  });

  const migrationChanged = JSON.stringify(parsed) !== JSON.stringify(migrated);
  if (migrationChanged) {
    localStorage.setItem(USERS_KEY, JSON.stringify(migrated));
  }

  const hasAdmin = migrated.some((u) => u.email === DEFAULT_ADMIN.email);
  const users = hasAdmin ? migrated : [DEFAULT_ADMIN, ...migrated];
  if (!hasAdmin) localStorage.setItem(USERS_KEY, JSON.stringify(users));
  console.log("[auth] users in storage:", users);
  return users;
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  console.log("[auth] users updated:", users);
}

export function getUsers() {
  return readUsers();
}

export function registerUser({ name, email, password }) {
  const users = readUsers();
  const normalizedEmail = email.toLowerCase();
  const exists = users.some((u) => u.email.toLowerCase() === normalizedEmail);

  console.log("[auth] register payload:", { name, email, password });
  if (exists) {
    return { ok: false, message: "Email sudah terdaftar." };
  }

  const newUser = {
    name,
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    role: "user",
  };
  writeUsers([...users, newUser]);
  return {
    ok: true,
    message: "Register berhasil.",
    user: sanitizeUser(newUser),
  };
}

export function loginUser({ email, password }) {
  const users = readUsers();
  const normalizedEmail = email.toLowerCase();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  const hashedInput = hashPassword(password);

  console.log("[auth] login payload:", { email, password });
  if (!user) return { ok: false, message: "Email tidak ditemukan." };
  if (user.passwordHash !== hashedInput)
    return { ok: false, message: "Password salah." };

  const safeUser = sanitizeUser(user);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
  console.log("[auth] login success:", safeUser);
  return { ok: true, message: "Login berhasil.", user: safeUser };
}

export function getCurrentUser() {
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return null;
  return sanitizeUser(JSON.parse(raw));
}

export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}
