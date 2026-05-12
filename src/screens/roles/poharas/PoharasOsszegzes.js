import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { supabase } from "../../../lib/supabaseClient.js";

export default function PoharasOsszegzes({ route }) {
  const { sajatPultId, sajatPultNev } = route.params;

  const [adatok, setAdatok] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("pult_italigeny")
        .select(`
          id,
          ital_id,
          ital_nev,
          pult_id,
          pult_nev,
          mennyiseg,
          created_by,
          created_at,
          updated_at,
          italok ( kategoria )
        `);

      if (error) {
        console.log(error);
        return;
      }

      setAdatok(data || []);
    };

    load();
  }, []);

  // --- Csoportosítás pult szerint ---
  const pultok = {};

  adatok.forEach((t) => {
    const pult = t.pult_nev;
    if (!pultok[pult]) pultok[pult] = [];
    pultok[pult].push(t);
  });

  // --- Saját pult előre ---
  const rendezettPultok = Object.keys(pultok).sort((a, b) => {
    if (a === sajatPultNev) return -1;
    if (b === sajatPultNev) return 1;
    return a.localeCompare(b);
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📦 Raktári összesítés</Text>

      {rendezettPultok.map((pultNev) => {
        const tetelek = pultok[pultNev];

        // kategóriák szerint csoportosítás
        const kategoriak = {};
        tetelek.forEach((t) => {
          const kat = t.italok?.kategoria || "Ismeretlen";
          if (!kategoriak[kat]) kategoriak[kat] = [];
          kategoriak[kat].push(t);
        });

        return (
          <View key={pultNev} style={styles.pultBox}>
            <Text style={styles.pultTitle}>{pultNev}</Text>

            {Object.keys(kategoriak).map((kat) => {
              const lista = kategoriak[kat].sort(
                (a, b) => b.mennyiseg - a.mennyiseg
              );

              return (
                <View key={kat} style={styles.kategoriaBox}>
                  <Text style={styles.kategoriaTitle}>{kat}</Text>

                  {lista.map((t) => (
                    <Text key={t.id} style={styles.tetel}>
                      {t.ital_nev} – {t.mennyiseg} db
                    </Text>
                  ))}
                </View>
              );
            })}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },

  pultBox: {
    backgroundColor: "#f7f7f7",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20
  },

  pultTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#007AFF"
  },

  kategoriaBox: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10
  },

  kategoriaTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5
  },

  tetel: {
    fontSize: 16,
    paddingVertical: 2
  }
});
