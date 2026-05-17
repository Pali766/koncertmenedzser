import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function ItalSzerkesztes() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // Az ital adatai a listából érkeznek
  const ital = location.state;

  const [nev, setNev] = useState(ital?.nev || "");
  const [kategoria, setKategoria] = useState(ital?.kategoria || "");

  const [kategoriak, setKategoriak] = useState([]);
  const [kategoriaListaLathato, setKategoriaListaLathato] = useState(false);

  const [pultLista, setPultLista] = useState([]);
  const [keszletek, setKeszletek] = useState([]);

  // 🔹 Kategóriák, pultok és készletek lekérése
  useEffect(() => {
    const fetchData = async () => {
      // Kategóriák
      const { data: katData } = await supabase
        .from("ital_kategoriak")
        .select("*")
        .order("nev");

      setKategoriak(katData || []);

      // Pultok
      const { data: pultData } = await supabase
        .from("pultok")
        .select("*")
        .order("nev");

      setPultLista(pultData || []);

      // Készletek
      const { data: keszletData } = await supabase
        .from("keszletek")
        .select("id, ital_id, pult_id, mennyiseg")
        .eq("ital_id", id);

      const safeKeszletek = keszletData || [];

      // 🔹 Fallback készletsorok létrehozása minden pult számára
      const merged = (pultData || []).map((pult) => {
        const existing = safeKeszletek.find((k) => k.pult_id === pult.id);
        return (
          existing || {
            id: null,
            ital_id: id,
            pult_id: pult.id,
            mennyiseg: 0,
          }
        );
      });

      setKeszletek(merged);
    };

    fetchData();
  }, [id]);

  // 🔹 Összes mennyiség számítása
  const osszesSzamitott = keszletek.reduce(
    (sum, k) => sum + Number(k.mennyiseg || 0),
    0
  );

  // 🔹 Kategória kiválasztása
  const valasszKategoriat = (kat) => {
    setKategoria(kat.nev);
    setKategoriaListaLathato(false);
  };

  // 🔹 Pultkészlet változtatása
  const handlePultValtozas = (pultId, ertek) => {
    const uj = keszletek.map((k) =>
      k.pult_id === pultId ? { ...k, mennyiseg: ertek } : k
    );
    setKeszletek(uj);
  };

  // 🔹 MENTÉS
  const handleSave = async () => {
    // 1) Ital frissítése
    const kategoriaId =
      kategoriak.find((k) => k.nev === kategoria)?.id || null;

    const { error: italError } = await supabase
      .from("italok")
      .update({
        nev,
        kategoria_id: kategoriaId,
      })
      .eq("id", id);

    if (italError) {
      alert("Nem sikerült frissíteni az italt.");
      return;
    }

    // 2) Készletek frissítése vagy létrehozása
    for (const k of keszletek) {
      const menny = Number(k.mennyiseg) || 0;

      if (k.id) {
        // meglévő sor → update
        await supabase
          .from("keszletek")
          .update({ mennyiseg: menny })
          .eq("id", k.id);
      } else {
        // új sor → insert
        await supabase.from("keszletek").insert({
          ital_id: id,
          pult_id: k.pult_id,
          mennyiseg: menny,
        });
      }
    }

    alert("Az ital adatai frissítve lettek!");

    // 🔹 Realtime miatt → vissza a listára, és a lista újra lekéri
    navigate("/admin/italok");
  };

  return (
    <div style={styles.container}>
      {/* Vissza */}
      <button
        style={styles.backButton}
        onClick={() => navigate("/admin/italok")}
      >
        ← Vissza
      </button>

      <h1 style={styles.title}>Ital szerkesztése</h1>

      {/* Ital neve */}
      <label style={styles.label}>Ital neve</label>
      <input
        style={styles.input}
        value={nev}
        onChange={(e) => setNev(e.target.value)}
      />

      {/* Kategória */}
      <label style={styles.label}>Kategória</label>
      <input
        style={styles.input}
        value={kategoria}
        onChange={(e) => {
          setKategoria(e.target.value);
          setKategoriaListaLathato(true);
        }}
      />

      {/* Autocomplete lista */}
      {kategoriaListaLathato && (
        <div style={styles.kategoriaLista}>
          {kategoriak
            .filter((k) =>
              k.nev.toLowerCase().includes(kategoria.toLowerCase())
            )
            .map((item) => (
              <div
                key={item.id}
                style={styles.kategoriaElem}
                onClick={() => valasszKategoriat(item)}
              >
                {item.nev}
              </div>
            ))}
        </div>
      )}

      {/* Összes mennyiség */}
      <label style={styles.label}>Összes mennyiség</label>
      <div style={styles.totalBox}>{osszesSzamitott} db</div>

      {/* Pultok mennyiségei */}
      <h2 style={styles.sectionTitle}>Pultok mennyiségei</h2>

      {pultLista.map((pult) => {
        const keszlet = keszletek.find((k) => k.pult_id === pult.id);

        return (
          <div key={pult.id}>
            <label style={styles.label}>{pult.nev}</label>
            <input
              style={styles.input}
              type="number"
              value={keszlet?.mennyiseg ?? ""}
              onChange={(e) =>
                handlePultValtozas(pult.id, e.target.value)
              }
            />
          </div>
        );
      })}

      {/* Mentés */}
      <button style={styles.saveButton} onClick={handleSave}>
        Mentés
      </button>
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

  title: { fontSize: "26px", fontWeight: "bold", marginBottom: "20px" },

  label: { fontSize: "16px", marginTop: "10px", marginBottom: "5px" },

  input: {
    border: "1px solid #ccc",
    padding: "12px",
    borderRadius: "10px",
    fontSize: "16px",
    width: "100%",
  },

  kategoriaLista: {
    border: "1px solid #ccc",
    borderRadius: "10px",
    marginTop: "5px",
    overflow: "hidden",
  },

  kategoriaElem: {
    padding: "10px",
    backgroundColor: "#eee",
    cursor: "pointer",
  },

  sectionTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    marginTop: "25px",
    marginBottom: "10px",
  },

  totalBox: {
    border: "1px solid #ccc",
    padding: "12px",
    borderRadius: "10px",
    backgroundColor: "#f2f2f2",
    marginBottom: "20px",
    fontSize: "16px",
  },

  saveButton: {
    backgroundColor: "#007AFF",
    padding: "15px",
    borderRadius: "10px",
    marginTop: "30px",
    color: "#fff",
    fontSize: "18px",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
  },
};
