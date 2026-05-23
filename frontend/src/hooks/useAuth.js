import { useEffect, useState } from "react";
import { getCurrentUser, loginUser, logoutUser, registerUser } from "../services/authService";

export default function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getCurrentUser()); // ← hapus getUsers()
  }, []);

  const login = async (payload) => {
    const result = await loginUser(payload);
    if (result.ok) setUser(result.user);
    return result;
  };

  const register = async (payload) => {
    const result = await registerUser(payload);
    return result;
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return { user, login, register, logout };
}