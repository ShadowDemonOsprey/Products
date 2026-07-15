import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import PageNotFound from "./lib/PageNotFound";
import { AuthProvider } from "@/lib/AuthContext";
import ScrollToTop from "./components/ScrollToTop";

import Home from "@/pages/Home";
import Share from "@/pages/Share";
import Connect from "@/pages/Connect";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";


function AppRoutes() {
  return (
    <Routes>

      {/* Public authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Application */}
      <Route path="/" element={<Home />} />
      <Route path="/share" element={<Share />} />
      <Route path="/connect" element={<Connect />} />

      {/* Catch all */}
      <Route path="*" element={<PageNotFound />} />

    </Routes>
  );
}


export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AppRoutes />
        </Router>

        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}