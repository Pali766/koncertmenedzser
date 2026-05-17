import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ItalHozzaadas() {
  const navigate = useNavigate();

  const [nev, setNev] = useState("");

  const [kategoriak, setKategoriak] = useState([]);
  const [kategoriaKereses, setKategoriaKereses] = useState("");
  const [szurtKategoriak, setSzurtKategoriak] = useState([]);
  const [kivalasztottKategoria, setKivalasztottKategoria] = useState(null);

  const [mutatLista, setMutatLista] = useState(false);

  // 🔹 Kategóriák lekérése
  const fetchKategoriak = async () => {
    const { data } = await supabase
      .from("ital_kategoriak")
      .select("*")
      .order("nev");

    setKategoriak(data || []);
    setSzurtKategoriak(data || []);
  };

  useEffect(() => {
    fetchKategoriak();
  }, []);

  // 🔹 Kategória szűrés gépelés közben
  useEffect(() => {
    if (!kategoriaKereses.trim()) {
      setSzurtKategoriak(kategoriak);
      setMutatLista(false);
      return;
    }

    const lower = kategoriaKereses.toLowerCase();
    const filtered = kategoriak.filter((k) =>
      k.nev.toLowerCase().includes(lower)
    );

    setSzurtKategoriak(filtered);
    setMutatLista(true);
  }, [kategoriaKereses, kategoriak]);

  // 🔹 Új kategória hozzáadása
  const handleUjKategoria = async () => {
    if (!kategoriaKereses.trim()) {
      alert("A kategória neve nem lehet üres!");
      return;
    }

    const { error } = await supabase
      .from("ital_kategoriak")
      .insert({ nev: kategoriaKereses.trim() });

    if (error) {
      alert("Nem sikerült hozzáadni a kategóriát.");
      return;
    }

    setKategoriaKereses("");
    setKivalasztottKategoria(null);
    fetchKategoriak();
  };

  // 🔹 Ital mentése + készletsorok létrehozása
  const handleSave = async () => {
    if (!nev.trim()) {
      alert("Az ital neve nem lehet üres!");
      return;
    }

    if (!kivalasztottKategoria) {
      alert("Válassz kategóriát!");
      return;
    }

    // 1) Ital létrehozása
    const { data: ujItal, error: italError } = await supabase
      .from("italok")
      .insert({
        nev,
        kategoria_id: kivalasztottKategoria.id,
      })
      .select()
      .single();

    if (italError || !ujItal) {
      alert("Nem sikerült hozzáadni az italt.");
      return;
    }

    // 2) Pultok lekérése
    const { data: pultok } = await supabase.from("pultok").select("id");

    // 3) Készletsorok létrehozása minden pultra
    for (const pult of pultok) {
      await supabase.from("keszletek").insert({
        ital_id: ujItal.id,
        pult_id: pult.id,
        mennyiseg: 0,
      });
    }

    alert("Az ital sikeresen hozzáadva!");
    navigate("/admin/italok");
  };

  return (
    <div style={styles.container}>
      {/* Vissza */}
      <button style={styles.backButton} onClick={() => navigate("/admin/italok")}>
        ← Vissza
      </button>

      <h1 style={styles.title}>Új ital hozzáadása</h1>

      {/* Ital neve */}
      <label style={styles.label}>Ital neve</label>
      <input
        style={styles.input}
        value={nev}
        onChange={(e) => setNev(e.target.value)}
        placeholder="Pl. Heineken"
      />

      {/* Kategória keresőmező */}
      <label style={styles.label}>Kategória</label>

      <div style={styles.kategoriaSor}>
        <input
          style={{ ...styles.input, flex: 1 }}
          value={kategoriaKereses}
          onChange={(e) => {
            setKategoriaKereses(e.target.value);
            setKivalasztottKategoria(null);
          }}
          placeholder="Kezdj el gépelni..."
        />

        {/* + gomb új kategóriához */}
        <button
          style={{
            ...styles.plusButton,
            ...(szurtKategoriak.length > 0 && kategoriaKereses.trim() !== ""
              ? styles.plusDisabled
              : {}),
          }}
          disabled={szurtKategoriak.length > 0 && kategoriaKereses.trim() !== ""}
          onClick={handleUjKategoria}
        >
          +
        </button>
      </div>

      {/* Autocomplete lista */}
      {mutatLista && szurtKategoriak.length > 0 && (
        <div style={styles.lista}>
          {szurtKategoriak.map((k) => (
            <div
              key={k.id}
              style={{
                ...styles.listaElem,
                ...(kivalasztottKategoria?.id === k.id
                  ? styles.listaElemAktiv
                  : {}),
              }}
              onClick={() => {
                setKivalasztottKategoria(k);
                setKategoriaKereses(k.nev);
                setMutatLista(false);
              }}
            >
              <span
                style={{
                  ...styles.listaElemSzoveg,
                  ...(kivalasztottKategoria?.id === k.id
                    ? styles.listaElemSzovegAktiv
                    : {}),
                }}
              >
                {k.nev}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Mentés */}
      <button style={styles.saveButton} onClick={handleSave}>
        Mentés
      </button>
    </div>
  );
}

const styles = {
  container: { padding: "20px", maxWidth: "600px", margin: "0 auto", position: "relative" },

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

  title: { fontSize: "26px", fontWeight: "bold", marginBottom: "20px", marginTop: "40px" },

  label: { fontSize: "16px", marginTop: "10px", marginBottom: "5px" },

  input: {
    border: "1px solid #ccc",
    padding: "12px",
    borderRadius: "10px",
    fontSize: "16px",
    width: "100%",
  },

  kategoriaSor: { display: "flex", alignItems: "center", gap: "10px" },

  plusButton: {
    backgroundColor: "#007AFF",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
  },

  plusDisabled: {
    backgroundColor: "#9BBEFF",
    cursor: "not-allowed",
  },

  lista: {
    marginTop: "10px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    overflow: "hidden",
  },

  listaElem: {
    padding: "12px",
    backgroundColor: "#fff",
    cursor: "pointer",
  },

  listaElemAktiv: {
    backgroundColor: "#007AFF",
  },

  listaElemSzoveg: { fontSize: "16px", color: "#000" },

  listaElemSzovegAktiv: { color: "#fff" },

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
