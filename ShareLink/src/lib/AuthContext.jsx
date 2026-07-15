import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { base44 } from "@/api/base44Client";


const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [authError, setAuthError] = useState(null);


  useEffect(() => {
    checkAuth();
  }, []);


  const checkAuth = async () => {
    try {
      const currentUser = await base44.auth.me();

      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
    }
  };


  const logout = () => {
    base44.auth.logout();
  };


  const navigateToLogin = () => {
    window.location.href = "/login";
  };


  const value = {
    user,

    isAuthenticated,

    isLoadingAuth,

    isLoadingPublicSettings: false,

    authError,

    logout,

    navigateToLogin,

    checkUserAuth: checkAuth,

    checkAppState: checkAuth,
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};