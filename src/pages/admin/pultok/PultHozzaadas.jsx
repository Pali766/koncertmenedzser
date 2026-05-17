import React, { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function PultHozzaadas() {
  const navigate = useNavigate();
  const [nev, setNev] = useState("");
  const [hiba, setHiba] = useState("");
  const [siker, setSiker] = useState("");

  const handleSave = async () => {
    setHiba("");
    setSiker("");

    if (!nev.trim()) {
      setHiba("A pult neve nem lehet üres.");
      return;
    }

    const { error } = await supabase.from("pultok").insert({
      nev: nev.trim(),
      aktiv: true,
    });

    if (error) {
      setHiba("Nem sikerült hozzáadni a pultot.");
      return;
    }

    setSiker("A pult sikeresen hozzáadva!");
    setNev("");

    // 1 másodperc múlva vissza a listára
    setTimeout(() => navigate("/admin/pultok"), 1000);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Új pult hozzáadása</h1>

      <label style={styles.label}>Pult neve</label>
      <input
        style={styles.input}
        value={nev}
        onChange={(e) => setNev(e.target.value)}
        placeholder="Pl. Garden"
      />

      {hiba && <div style={styles.error}>{hiba}</div>}
      {siker && <div style={styles.success}>{siker}</div>}

      <button style={styles.saveButton} onClick={handleSave}>
        Mentés
      </button>

      <button style={styles.backButton} onClick={() => navigate("/admin/pultok")}>
        Mégse
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
    maxWidth: 500,
    margin: "0 auto",
    background: "#fff",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },

  label: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
    display: "block",
  },

  input: {
    width: "100%",
    border: "1px solid #ccc",
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
  },

  saveButton: {
    background: "#007AFF",
    color: "#fff",
    padding: 15,
    borderRadius: 10,
    border: "none",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 30,
    width: "100%",
    cursor: "pointer",
  },

  backButton: {
    marginTop: 10,
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ccc",
    background: "#f2f2f2",
    cursor: "pointer",
  },

  error: {
    marginTop: 10,
    color: "red",
    fontWeight: "bold",
  },

  success: {
    marginTop: 10,
    color: "green",
    fontWeight: "bold",
  },
};
