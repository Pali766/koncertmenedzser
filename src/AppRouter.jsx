import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Oldalak
import RoleSelection from "./pages/RoleSelection";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Italok from "./pages/admin/italok/Italok";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Szerepkörválasztó */}
        <Route path="/" element={<RoleSelection />} />

        {/* Később ide jönnek majd a többi oldalak */}
        <Route path="/pultos" element={<div>Pultos oldal</div>} />
        <Route path="/poharas-login" element={<div>Poharas login</div>} />
        <Route path="/jegyszedo-login" element={<div>Jegyszedő login</div>} />
        <Route path="/ruhataros-login" element={<div>Ruhatáros login</div>} />
        <Route path="/takarito-login" element={<div>Takarító login</div>} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/italok" element={<Italok />} />
      </Routes>
    </Router>
  );
}
