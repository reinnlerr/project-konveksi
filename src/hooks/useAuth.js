import { useEffect, useState } from "react";
import { getCurrentUser, getUsers, loginUser, logoutUser, registerUser } from "../services/authService";

export default function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUsers();
    setUser(getCurrentUser());
  }, []);

  const login = (payload) => {
    const result = loginUser(payload);
    if (result.ok) setUser(result.user);
    return result;
  };

  const register = (payload) => registerUser(payload);

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return { user, login, register, logout };
}
