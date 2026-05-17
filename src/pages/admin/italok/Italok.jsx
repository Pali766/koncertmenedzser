import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Italok() {
  const navigate = useNavigate();

  const [kereses, setKereses] = useState("");
  const [italok, setItalok] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Italok + készletek lekérése (régi logika 1:1-ben)
  const fetchItalok = useCallback(async () => {
    setLoading(true);

    // 1) Italok lekérése kategóriával
    const { data: italData, error } = await supabase
      .from("italok")
      .select(`
        id,
        nev,
        kategoria_id,
        ital_kategoriak ( nev )
      `)
      .order("nev");

    if (error) {
      console.error("Hiba az italok lekérdezésénél:", error);
      setLoading(false);
      return;
    }

    // 2) Készletek lekérése
    const { data: keszletek } = await supabase
      .from("keszletek")
      .select("ital_id, mennyiseg");

    // 3) Összes mennyiség kiszámítása
    const formatted = italData.map((i) => {
      const osszes = keszletek
        ?.filter((k) => k.ital_id === i.id)
        .reduce((sum, k) => sum + k.mennyiseg, 0) || 0;

      return {
        id: i.id,
        nev: i.nev,
        kategoria: i.ital_kategoriak?.nev || "Ismeretlen",
        osszes,
      };
    });

    setItalok(formatted);
    setLoading(false);
  }, []);

  // 🔹 Betöltés oldal megnyitásakor
  useEffect(() => {
    fetchItalok();
  }, [fetchItalok]);

  // 🔹 Keresés
  const szurtItalok = italok.filter((i) =>
    i.nev.toLowerCase().includes(kereses.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Vissza */}
      <button style={styles.backButton} onClick={() => navigate("/admin")}>
        ← Vissza
      </button>

      {/* Törölt italok */}
      <button
        style={styles.trashButton}
        onClick={() => navigate("/admin/italok/toroltek")}
      >
        🗑
      </button>

      {/* Új ital */}
      <button
        style={styles.addButton}
        onClick={() => navigate("/admin/italok/hozzaadas")}
      >
        ➕
      </button>

      <h1 style={styles.title}>🍸 Italok kezelése</h1>

      {/* Kereső */}
      <input
        style={styles.search}
        type="text"
        placeholder="Keresés..."
        value={kereses}
        onChange={(e) => setKereses(e.target.value)}
      />

      {loading ? (
        <p>Betöltés...</p>
      ) : (
        <div style={styles.list}>
          {szurtItalok.map((item) => (
            <div
              key={item.id}
              style={styles.row}
              onClick={() => navigate(`/admin/italok/${item.id}`, { state: item })}
            >
              <div>
                <div style={styles.name}>{item.nev}</div>
                <div style={styles.category}>{item.kategoria}</div>
              </div>

              <div style={styles.rightSide}>
                <div style={styles.amount}>{item.osszes} db</div>

                <button
                  style={styles.editButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/italok/${item.id}/szerkesztes`, {
                      state: item,
                    });
                  }}
                >
                  ✏️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    maxWidth: "900px",
    margin: "0 auto",
    position: "relative",
  },

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

  trashButton: {
    position: "absolute",
    top: "20px",
    right: "70px",
    padding: "8px 12px",
    borderRadius: "8px",
    backgroundColor: "#ffdddd",
    border: "1px solid red",
    cursor: "pointer",
    fontSize: "20px",
  },

  addButton: {
    position: "absolute",
    top: "20px",
    right: "20px",
    padding: "8px 12px",
    borderRadius: "8px",
    backgroundColor: "#e0f0ff",
    border: "1px solid #007aff",
    cursor: "pointer",
    fontSize: "20px",
  },

  title: {
    fontSize: "28px",
    fontWeight: "bold",
    marginTop: "60px",
    marginBottom: "20px",
  },

  search: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    marginBottom: "20px",
    fontSize: "16px",
  },

  list: {
    display: "flex",
    flexDirection: "column",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 0",
    borderBottom: "1px solid #eee",
    cursor: "pointer",
  },

  name: {
    fontSize: "18px",
    fontWeight: "600",
  },

  category: {
    fontSize: "14px",
    color: "#666",
  },

  rightSide: {
    textAlign: "right",
  },

  amount: {
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "5px",
  },

  editButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "20px",
  },
};
