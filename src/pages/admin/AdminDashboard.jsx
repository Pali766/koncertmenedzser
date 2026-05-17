import React from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin-login");
  };

  return (
    <div style={styles.container}>
      {/* Kijelentkezés gomb */}
      <button style={styles.logoutButton} onClick={handleLogout}>
        Kijelentkezés
      </button>

      <h1 style={styles.title}>👔 Admin főoldal</h1>

      <div style={styles.cardContainer}>

        {/* Italok kezelése */}
        <div
          style={styles.card}
          onClick={() => navigate("/admin/italok")}
        >
          <div style={styles.icon}>🍸</div>
          <div style={styles.cardText}>Italok kezelése</div>
        </div>

        {/* Pultok kezelése */}
        <div
          style={styles.card}
          onClick={() => navigate("/admin/pultok")}
        >
          <div style={styles.icon}>🧃</div>
          <div style={styles.cardText}>Pultok kezelése</div>
        </div>

        {/* Üzenetek */}
        <div
          style={styles.card}
          onClick={() => navigate("/admin/uzenetek")}
        >
          <div style={styles.icon}>💬</div>
          <div style={styles.cardText}>Üzenetek</div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "40px 20px",
    backgroundColor: "#fff",
    position: "relative",
    maxWidth: "900px",
    margin: "0 auto"
  },

  logoutButton: {
    position: "absolute",
    top: "20px",
    right: "20px",
    backgroundColor: "#FF4D4D",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold"
  },

  title: {
    fontSize: "32px",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "40px",
    marginTop: "20px"
  },

  cardContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },

  card: {
    width: "48%",
    backgroundColor: "#f9f9f9",
    padding: "25px 0",
    borderRadius: "15px",
    marginBottom: "25px",
    textAlign: "center",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    transition: "0.2s"
  },

  icon: {
    fontSize: "40px",
    marginBottom: "10px"
  },

  cardText: {
    fontSize: "18px",
    fontWeight: "600"
  }
};
