import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

/* Szerepkörválasztó oldal */
import RoleSelection from "./pages/RoleSelection";

/* Admin bejelentkezés */
import AdminLogin from "./pages/admin/AdminLogin";

/* Admin főoldal / Dashboard */
import AdminDashboard from "./pages/admin/AdminDashboard";

/* Italok modul */
import Italok from "./pages/admin/italok/Italok";
import ItalReszletek from "./pages/admin/italok/ItalReszletek";
import ItalHozzaadas from "./pages/admin/italok/ItalHozzaadas";
import ItalSzerkesztes from "./pages/admin/italok/ItalSzerkesztes";
import ToroltItalok from "./pages/admin/italok/ToroltItalok";

/* Üzenetek modul */
import Uzenetek from "./pages/admin/uzenetek/Uzenetek";
import Chat from "./pages/admin/uzenetek/Chat";

/* Pultok modul */
import Pultok from "./pages/admin/pultok/Pultok";
import PultHozzaadas from "./pages/admin/pultok/PultHozzaadas";
import PultSzerkesztes from "./pages/admin/pultok/PultSzerkesztes";

export default function AppRouter() {
  return (
    <Router>
      <Routes>

        {/* Szerepkörválasztó */}
        <Route path="/" element={<RoleSelection />} />

        {/* Admin auth */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin dashboard */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Italok modul */}
        <Route path="/admin/italok" element={<Italok />} />
        <Route path="/admin/italok/hozzaadas" element={<ItalHozzaadas />} />
        <Route path="/admin/italok/torolt" element={<ToroltItalok />} />
        <Route path="/admin/italok/:id" element={<ItalReszletek />} />
        <Route path="/admin/italok/:id/szerkesztes" element={<ItalSzerkesztes />} />

        {/* Admin üzenetek modul */}
        <Route path="/admin/uzenetek" element={<Uzenetek />} />
        <Route path="/admin/uzenetek/:id" element={<Chat />} />

        {/* Pultok modul */}
        <Route path="/admin/pultok" element={<Pultok />} />
        <Route path="/admin/pultok/hozzaadas" element={<PultHozzaadas />} />
        <Route path="/admin/pultok/:id/szerkesztes" element={<PultSzerkesztes />} />

      </Routes>
    </Router>
  );
}
