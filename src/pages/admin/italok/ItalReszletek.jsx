import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function ItalReszletek() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const ital = location.state;

  const [pultKeszletek, setPultKeszletek] = useState({});
  const [osszes, setOsszes] = useState(0);

  useEffect(() => {
    const fetchKeszletek = async () => {
      const { data, error } = await supabase
        .from("pult_keszletek")
        .select(`
          mennyiseg,
          pultok ( nev )
        `)
        .eq("ital_id", id);

      if (error) {
        console.error("Hiba a pultkészletek lekérdezésénél:", error);
        return;
      }

      const keszletObj = {};
      let total = 0;

      data.forEach((k) => {
        const pultNev = k.pultok?.nev || "Ismeretlen";
        keszletObj[pultNev] = k.mennyiseg;
        total += k.mennyiseg;
      });

      setPultKeszletek(keszletObj);
      setOsszes(total);
    };

    fetchKeszletek();
  }, [id]);

  const ideiglenesTorles = () => {
    if (!window.confirm("Biztosan ideiglenesen törlöd az italt?")) return;
    alert("Ideiglenes törlés funkció később kerül beépítésre.");
  };

  const veglegesTorles = () => {
    if (!window.confirm("Biztosan végleg törlöd? Ez nem visszavonható.")) return;
    alert("Végleges törlés funkció később kerül beépítésre.");
  };

  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={() => navigate("/admin/italok")}>
        ← Vissza
      </button>

      <h1 style={styles.title}>{ital?.nev}</h1>
      <p style={styles.category}>{ital?.kategoria}</p>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Pultok szerinti bontás</h2>

        {Object.keys(pultKeszletek).map((pult) => (
          <div key={pult} style={styles.row}>
            <span style={styles.pultNev}>{pult}</span>
            <span style={styles.mennyiseg}>{pultKeszletek[pult]} db</span>
          </div>
        ))}
      </div>

      <div style={styles.totalBox}>
        <p style={styles.totalText}>Összes mennyiség: {osszes} db</p>
      </div>

      <button style={styles.softDeleteButton} onClick={ideiglenesTorles}>
        Ideiglenes törlés
      </button>

      <button style={styles.deleteButton} onClick={veglegesTorles}>
        Törlés
      </button>
    </div>
  );
}

const styles = {
  container: { padding: "20px", maxWidth: "700px", margin: "0 auto", position: "relative" },

  backButton: {
    position: "absolute",
    top: "20px",
    left: "20px",
    padding: "8px 12px",
    borderRadius: "8px",
    backgroundColor: "#ddd",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },

  title: { fontSize: "28px", fontWeight: "bold", marginBottom: "5px", marginTop: "40px" },

  category: { fontSize: "18px", color: "#666", marginBottom: "20px" },

  section: { marginTop: "10px" },

  sectionTitle: { fontSize: "20px", fontWeight: "bold", marginBottom: "10px" },

  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #eee",
  },

  pultNev: { fontSize: "16px" },

  mennyiseg: { fontSize: "16px", fontWeight: "bold" },

  totalBox: {
    marginTop: "30px",
    padding: "15px",
    backgroundColor: "#f2f2f2",
    borderRadius: "10px",
  },

  totalText: { fontSize: "18px", fontWeight: "bold", textAlign: "center" },

  softDeleteButton: {
    marginTop: "30px",
    padding: "15px",
    backgroundColor: "#ffcccc",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#b30000",
  },

  deleteButton: {
    marginTop: "15px",
    padding: "15px",
    backgroundColor: "#ff4d4d",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#fff",
  },
};
