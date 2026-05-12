import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabaseClient.js';

export default function ItalHozzaadasScreen({ navigation }) {
  const [nev, setNev] = useState("");

  const [kategoriak, setKategoriak] = useState([]);
  const [kategoriaKereses, setKategoriaKereses] = useState("");
  const [szurtKategoriak, setSzurtKategoriak] = useState([]);
  const [kivalasztottKategoria, setKivalasztottKategoria] = useState(null);

  const [mutatLista, setMutatLista] = useState(false);

  // 🔹 Kategóriák lekérése
  const fetchKategoriak = async () => {
    const { data } = await supabase
      .from('ital_kategoriak')
      .select('*')
      .order('nev');

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
    const filtered = kategoriak.filter(k =>
      k.nev.toLowerCase().includes(lower)
    );

    setSzurtKategoriak(filtered);
    setMutatLista(true);
  }, [kategoriaKereses, kategoriak]);

  // 🔹 Új kategória hozzáadása
  const handleUjKategoria = async () => {
    if (!kategoriaKereses.trim()) {
      Alert.alert("Hiba", "A kategória neve nem lehet üres!");
      return;
    }

    const { error } = await supabase
      .from('ital_kategoriak')
      .insert({ nev: kategoriaKereses.trim() });

    if (error) {
      Alert.alert("Hiba", "Nem sikerült hozzáadni a kategóriát.");
      return;
    }

    setKategoriaKereses("");
    setKivalasztottKategoria(null);
    fetchKategoriak();
  };

  // 🔹 Ital mentése + készletsorok létrehozása
  const handleSave = async () => {
    if (!nev.trim()) {
      Alert.alert("Hiba", "Az ital neve nem lehet üres!");
      return;
    }

    if (!kivalasztottKategoria) {
      Alert.alert("Hiba", "Válassz kategóriát!");
      return;
    }

    // 1) Ital létrehozása
    const { data: ujItal, error: italError } = await supabase
      .from('italok')
      .insert({
        nev,
        kategoria_id: kivalasztottKategoria.id
      })
      .select()
      .single();

    if (italError || !ujItal) {
      Alert.alert("Hiba", "Nem sikerült hozzáadni az italt.");
      return;
    }

    // 2) Pultok lekérése
    const { data: pultok } = await supabase
      .from('pultok')
      .select('id');

    // 3) Készletsorok létrehozása minden pultra
    for (const pult of pultok) {
      await supabase
        .from('keszletek')
        .insert({
          ital_id: ujItal.id,
          pult_id: pult.id,
          mennyiseg: 0
        });
    }

    Alert.alert("Siker", "Az ital sikeresen hozzáadva!");
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Új ital hozzáadása</Text>

      {/* Ital neve */}
      <Text style={styles.label}>Ital neve</Text>
      <TextInput
        style={styles.input}
        value={nev}
        onChangeText={setNev}
        placeholder="Pl. Heineken"
      />

      {/* Kategória keresőmező */}
      <Text style={styles.label}>Kategória</Text>

      <View style={styles.kategoriaSor}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={kategoriaKereses}
          onChangeText={(text) => {
            setKategoriaKereses(text);
            setKivalasztottKategoria(null);
          }}
          placeholder="Kezdj el gépelni..."
        />

        {/* + gomb új kategóriához */}
        <TouchableOpacity
          style={[
            styles.plusButton,
            szurtKategoriak.length > 0 && kategoriaKereses.trim() !== "" ? styles.plusDisabled : null
          ]}
          disabled={szurtKategoriak.length > 0 && kategoriaKereses.trim() !== ""}
          onPress={handleUjKategoria}
        >
          <Text style={styles.plusText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Autocomplete lista */}
      {mutatLista && szurtKategoriak.length > 0 && (
        <View style={styles.lista}>
          {szurtKategoriak.map(k => (
            <TouchableOpacity
              key={k.id}
              style={[
                styles.listaElem,
                kivalasztottKategoria?.id === k.id && styles.listaElemAktiv
              ]}
              onPress={() => {
                setKivalasztottKategoria(k);
                setKategoriaKereses(k.nev);
                setMutatLista(false);
              }}
            >
              <Text
                style={[
                  styles.listaElemSzoveg,
                  kivalasztottKategoria?.id === k.id && styles.listaElemSzovegAktiv
                ]}
              >
                {k.nev}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Mentés */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Mentés</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 16, marginTop: 10, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 10, fontSize: 16 },

  kategoriaSor: { flexDirection: "row", alignItems: "center", gap: 10 },

  plusButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10
  },
  plusDisabled: {
    backgroundColor: "#9BBEFF"
  },
  plusText: { color: "#fff", fontSize: 24, fontWeight: "bold" },

  lista: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    overflow: "hidden"
  },
  listaElem: { padding: 12, backgroundColor: "#fff" },
  listaElemAktiv: { backgroundColor: "#007AFF" },
  listaElemSzoveg: { fontSize: 16, color: "#000" },
  listaElemSzovegAktiv: { color: "#fff" },

  saveButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    marginBottom: 40
  },
  saveText: { color: "#fff", fontSize: 18, textAlign: "center", fontWeight: "bold" }
});
