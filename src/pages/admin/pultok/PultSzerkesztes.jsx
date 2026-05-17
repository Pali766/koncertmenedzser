import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function PultSzerkesztes() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // Ha a listából jöttünk, itt lesz a pult adata
  const { pult: initialPult } = location.state || {};

  const [nev, setNev] = useState(initialPult?.nev || "");
  const [aktiv, setAktiv] = useState(initialPult?.aktiv || false);

  const [hiba, setHiba] = useState("");
  const [siker, setSiker] = useState("");

  // Ha valaki közvetlen URL-ből jön → lekérjük a pultot
  useEffect(() => {
    if (initialPult) return;

    const fetchPult = async () => {
      const { data, error } = await supabase
        .from("pultok")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setHiba("Nem sikerült betölteni a pult adatait.");
        return;
      }

      setNev(data.nev);
      setAktiv(data.aktiv);
    };

    fetchPult();
  }, [id, initialPult]);

  const handleSave = async () => {
    setHiba("");
    setSiker("");

    if (!nev.trim()) {
      setHiba("A pult neve nem lehet üres.");
      return;
    }

    const { error } = await supabase
      .from("pultok")
      .update({
        nev: nev.trim(),
        aktiv: aktiv,
      })
      .eq("id", id);

    if (error) {
      setHiba("Nem sikerült menteni a módosításokat.");
      return;
    }

    setSiker("A pult sikeresen frissítve!");

    setTimeout(() => navigate("/admin/pultok"), 1000);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Pult szerkesztése</h1>

      <label style={styles.label}>Pult neve</label>
      <input
        style={styles.input}
        value={nev}
        onChange={(e) => setNev(e.target.value)}
      />

      <label style={styles.label}>Aktív állapot</label>
      <div style={styles.switchRow}>
        <input
          type="checkbox"
          checked={aktiv}
          onChange={() => setAktiv(!aktiv)}
        />
        <span style={{ marginLeft: 10 }}>
          {aktiv ? "Aktív" : "Inaktív"}
        </span>
      </div>

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

  switchRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: 15,
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
