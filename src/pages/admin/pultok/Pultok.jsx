import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Pultok() {
  const navigate = useNavigate();
  const [pultok, setPultok] = useState([]);

  // 🔹 Pultok lekérése
  const fetchPultok = async () => {
    const { data, error } = await supabase
      .from("pultok")
      .select("*")
      .order("nev");

    if (error) {
      console.error("Hiba a pultok lekérdezésénél:", error);
      return;
    }

    setPultok(data || []);
  };

  useEffect(() => {
    fetchPultok();
  }, []);

  // 🔹 Aktiválás / inaktiválás
  const toggleAktiv = async (pult) => {
    const { error } = await supabase
      .from("pultok")
      .update({ aktiv: !pult.aktiv })
      .eq("id", pult.id);

    if (error) {
      console.error("Hiba az aktiválásnál:", error);
      return;
    }

    fetchPultok();
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h1 style={styles.title}>Pultok kezelése</h1>

        <button
          style={styles.addButton}
          onClick={() => navigate("/admin/pultok/hozzaadas")}
        >
          ➕ Új pult
        </button>
      </div>

      <div style={styles.list}>
        {pultok.map((pult) => (
          <div key={pult.id} style={styles.row}>
            <div>
              <strong style={styles.name}>{pult.nev}</strong>
              <div style={{ color: pult.aktiv ? "green" : "red" }}>
                {pult.aktiv ? "Aktív" : "Inaktív"}
              </div>
            </div>

            <div style={styles.right}>
              <label style={styles.switchLabel}>
                <input
                  type="checkbox"
                  checked={pult.aktiv}
                  onChange={() => toggleAktiv(pult)}
                />
                <span style={styles.switch}></span>
              </label>

              <button
                style={styles.editButton}
                onClick={() =>
                  navigate(`/admin/pultok/${pult.id}/szerkesztes`, {
                    state: { pult },
                  })
                }
              >
                Szerkesztés
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 20, maxWidth: 800, margin: "0 auto" },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: { fontSize: 28, fontWeight: "bold" },

  addButton: {
    background: "#007AFF",
    color: "white",
    padding: "10px 15px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontSize: 16,
  },

  list: { marginTop: 10 },

  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 0",
    borderBottom: "1px solid #eee",
  },

  name: { fontSize: 18 },

  right: {
    display: "flex",
    alignItems: "center",
    gap: 15,
  },

  editButton: {
    background: "#555",
    color: "white",
    padding: "6px 12px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
  },

  switchLabel: {
    position: "relative",
    display: "inline-block",
    width: 50,
    height: 26,
  },

  switch: {
    position: "absolute",
    cursor: "pointer",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#ccc",
    borderRadius: 26,
    transition: ".4s",
  },
};
