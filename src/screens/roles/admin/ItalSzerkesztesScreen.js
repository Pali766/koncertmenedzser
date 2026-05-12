import { useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabaseClient.js';

export default function ItalSzerkesztesScreen({ route, navigation }) {
  const { ital, onSave } = route.params;

  const [nev, setNev] = useState(ital.nev);
  const [kategoria, setKategoria] = useState(ital.kategoria);
  const [kategoriak, setKategoriak] = useState([]);
  const [kategoriaListaLathato, setKategoriaListaLathato] = useState(false);

  const [pultLista, setPultLista] = useState([]);
  const [keszletek, setKeszletek] = useState([]);

  // 🔹 Kategóriák, pultok és készletek lekérése + fallback készletsorok létrehozása
  useEffect(() => {
    const fetchData = async () => {
      // Kategóriák
      const { data: katData } = await supabase
        .from('ital_kategoriak')
        .select('*')
        .order('nev');

      setKategoriak(katData || []);

      // Pultok
      const { data: pultData } = await supabase
        .from('pultok')
        .select('*')
        .order('nev');

      setPultLista(pultData || []);

      // Készletek
      const { data: keszletData } = await supabase
        .from('keszletek')
        .select('id, ital_id, pult_id, mennyiseg')
        .eq('ital_id', ital.id);

      const safeKeszletek = keszletData || [];

      // 🔹 Fallback készletsorok létrehozása minden pult számára
      const merged = (pultData || []).map(pult => {
        const existing = safeKeszletek.find(k => k.pult_id === pult.id);
        return existing || {
          id: null,
          ital_id: ital.id,
          pult_id: pult.id,
          mennyiseg: 0
        };
      });

      setKeszletek(merged);
    };

    fetchData();
  }, [ital.id]);

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
    const uj = keszletek.map(k =>
      k.pult_id === pultId
        ? { ...k, mennyiseg: ertek }
        : k
    );
    setKeszletek(uj);
  };

  // 🔹 MENTÉS
  const handleSave = async () => {
    // 1) Ital frissítése
    const kategoriaId = kategoriak.find(k => k.nev === kategoria)?.id || null;

    const { error: italError } = await supabase
      .from('italok')
      .update({
        nev,
        kategoria_id: kategoriaId
      })
      .eq('id', ital.id);

    if (italError) {
      Alert.alert("Hiba", "Nem sikerült frissíteni az italt.");
      return;
    }

    // 2) Készletek frissítése vagy létrehozása
    for (const k of keszletek) {
      const menny = Number(k.mennyiseg) || 0;

      if (k.id) {
        // meglévő sor → update
        await supabase
          .from('keszletek')
          .update({ mennyiseg: menny })
          .eq('id', k.id);
      } else {
        // új sor → insert
        await supabase
          .from('keszletek')
          .insert({
            ital_id: ital.id,
            pult_id: k.pult_id,
            mennyiseg: menny
          });
      }
    }

    // 3) Visszaadjuk az új adatokat a listának
    onSave?.({
      id: ital.id,
      nev,
      kategoria,
      osszes: osszesSzamitott
    });

    Alert.alert("Siker", "Az ital adatai frissítve lettek!");
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Ital szerkesztése</Text>

      {/* 🔹 Ital neve */}
      <Text style={styles.label}>Ital neve</Text>
      <TextInput
        style={styles.input}
        value={nev}
        onChangeText={setNev}
      />

      {/* 🔹 Kategória */}
      <Text style={styles.label}>Kategória</Text>
      <TextInput
        style={styles.input}
        value={kategoria}
        onChangeText={(text) => {
          setKategoria(text);
          setKategoriaListaLathato(true);
        }}
      />

      {/* 🔹 Autocomplete lista */}
      {kategoriaListaLathato && (
        <FlatList
          data={kategoriak.filter(k =>
            k.nev.toLowerCase().includes(kategoria.toLowerCase())
          )}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.kategoriaElem}
              onPress={() => valasszKategoriat(item)}
            >
              <Text>{item.nev}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* 🔹 Összes mennyiség */}
      <Text style={styles.label}>Összes mennyiség (db)</Text>
      <Text style={styles.totalBox}>{osszesSzamitott} db</Text>

      {/* 🔹 Pultok mennyiségei */}
      <Text style={styles.sectionTitle}>Pultok mennyiségei</Text>

      {pultLista.map((pult) => {
        const keszlet = keszletek.find(k => k.pult_id === pult.id);

        return (
          <View key={pult.id}>
            <Text style={styles.label}>{pult.nev}</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(keszlet?.mennyiseg ?? "")}
              onChangeText={(ertek) => handlePultValtozas(pult.id, ertek)}
            />
          </View>
        );
      })}

      {/* 🔹 Mentés gomb */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Mentés</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff"
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 25,
    marginBottom: 10
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    fontSize: 16
  },
  totalBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: "#f2f2f2",
    marginBottom: 20
  },
  kategoriaElem: {
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 5,
    marginBottom: 5
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    marginBottom: 40
  },
  saveText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold"
  }
});
