import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ToroltItalok() {
  const navigate = useNavigate();
  const [italok, setItalok] = useState([]);

  // 🔹 Törölt italok lekérése
  const fetchToroltItalok = async () => {
    const { data, error } = await supabase
      .from("torolt_italok")
      .select("*")
      .order("torolve", { ascending: false });

    if (error) {
      console.error("Hiba a törölt italok lekérdezésénél:", error);
      return;
    }

    setItalok(data || []);
  };

  useEffect(() => {
    fetchToroltItalok();
  }, []);

  // 🔹 Visszaállítás
  const visszaallit = async (item) => {
    if (!window.confirm(`Biztosan visszaállítod ezt az italt?\n\n${item.nev}`)) {
      return;
    }

    try {
      // 1) Visszahelyezés az italok táblába
      const { error: insertError } = await supabase.from("italok").insert({
        nev: item.nev,
        kategoria_id: item.kategoria_id,
      });

      if (insertError) {
        console.error("Hiba a visszaállításnál:", insertError);
        alert("Nem sikerült visszaállítani az italt.");
        return;
      }

      // 2) Törlés a torolt_italok táblából
      const { error: deleteError } = await supabase
        .from("torolt_italok")
        .delete()
        .eq("id", item.id);

      if (deleteError) {
        console.error("Hiba a törölt ital törlésénél:", deleteError);
        alert("Nem sikerült eltávolítani a törölt listából.");
        return;
      }

      // 3) Lista frissítése
      fetchToroltItalok();
      alert("Az ital sikeresen visszaállítva!");

    } catch (e) {
      console.error("Visszaállítás hiba:", e);
    }
  };

  return (
    <div style={styles.container}>
      {/* Vissza */}
      <button style={styles.backButton} onClick={() => navigate("/admin/italok")}>
        ← Vissza
      </button>

      <h1 style={styles.title}>🗑️ Törölt italok</h1>

      {italok.length === 0 ? (
        <p style={styles.empty}>Nincs törölt ital.</p>
      ) : (
        <div style={styles.list}>
          {italok.map((item) => (
            <div key={item.id} style={styles.row}>
              <div>
                <div style={styles.name}>{item.nev}</div>
                <div style={styles.date}>
                  Törölve: {new Date(item.torolve).toLocaleString()}
                </div>
              </div>

              <button style={styles.restoreButton} onClick={() => visszaallit(item)}>
                ♻️
              </button>
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
    maxWidth: "700px",
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

  title: {
    fontSize: "26px",
    fontWeight: "bold",
    marginBottom: "20px",
    marginTop: "40px",
  },

  list: {
    marginTop: "10px",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 0",
    borderBottom: "1px solid #eee",
  },

  name: {
    fontSize: "18px",
    fontWeight: "600",
  },

  date: {
    fontSize: "14px",
    color: "#666",
  },

  restoreButton: {
    backgroundColor: "green",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "18px",
  },

  empty: {
    marginTop: "20px",
    fontSize: "18px",
    color: "#666",
  },
};
