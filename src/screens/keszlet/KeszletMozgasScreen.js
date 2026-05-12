import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabaseClient.js';

export default function KeszletMozgasScreen({ navigation }) {
  const [italok, setItalok] = useState([]);
  const [pultok, setPultok] = useState([]);

  const [italId, setItalId] = useState(null);
  const [honnanPult, setHonnanPult] = useState(null);
  const [hovaPult, setHovaPult] = useState(null);
  const [mennyiseg, setMennyiseg] = useState("");

  // 🔹 Italok lekérése
  const fetchItalok = async () => {
    const { data, error } = await supabase
      .from('italok')
      .select('*')
      .order('nev');

    if (error) {
      console.log("Hiba az italok lekérdezésénél:", error);
      return;
    }

    setItalok(data || []);
  };

  // 🔹 Pultok lekérése
  const fetchPultok = async () => {
    const { data, error } = await supabase
      .from('pultok')
      .select('*')
      .eq('aktiv', true)
      .order('nev');

    if (error) {
      console.log("Hiba a pultok lekérdezésénél:", error);
      return;
    }

    setPultok(data || []);
  };

  useEffect(() => {
    fetchItalok();
    fetchPultok();
  }, []);

  // 🔹 Mentés
  const handleSave = async () => {
    if (!italId) {
      Alert.alert("Hiba", "Válassz ki egy italt!");
      return;
    }

    if (!mennyiseg || isNaN(mennyiseg) || Number(mennyiseg) <= 0) {
      Alert.alert("Hiba", "A mennyiségnek pozitív számnak kell lennie!");
      return;
    }

    if (!honnanPult && !hovaPult) {
      Alert.alert("Hiba", "Legalább az egyik pultot ki kell választani!");
      return;
    }

    if (honnanPult && hovaPult && honnanPult === hovaPult) {
      Alert.alert("Hiba", "A két pult nem lehet ugyanaz!");
      return;
    }

    const { error } = await supabase
      .from('pult_keszlet_mozgasok')
      .insert({
        ital_id: italId,
        honnan_pult: honnanPult || null,
        hova_pult: hovaPult || null,
        mennyiseg: Number(mennyiseg),
        felhasznalo: "admin"
      });

    if (error) {
      console.log(error);
      Alert.alert("Hiba", "Nem sikerült rögzíteni a mozgást.");
      return;
    }

    Alert.alert("Siker", "A készletmozgás rögzítve!");
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Készletmozgás rögzítése</Text>

      <Text style={styles.label}>Ital</Text>
      <Picker
        selectedValue={italId}
        onValueChange={(v) => setItalId(v)}
        style={styles.picker}
      >
        <Picker.Item label="Válassz italt..." value={null} />
        {italok.map((ital) => (
          <Picker.Item key={ital.id} label={ital.nev} value={ital.id} />
        ))}
      </Picker>

      <Text style={styles.label}>Honnan pult (opcionális)</Text>
      <Picker
        selectedValue={honnanPult}
        onValueChange={(v) => setHonnanPult(v)}
        style={styles.picker}
      >
        <Picker.Item label="Nincs (külső forrás)" value={null} />
        {pultok.map((p) => (
          <Picker.Item key={p.id} label={p.nev} value={p.id} />
        ))}
      </Picker>

      <Text style={styles.label}>Hova pult (opcionális)</Text>
      <Picker
        selectedValue={hovaPult}
        onValueChange={(v) => setHovaPult(v)}
        style={styles.picker}
      >
        <Picker.Item label="Nincs (fogyás / eladás)" value={null} />
        {pultok.map((p) => (
          <Picker.Item key={p.id} label={p.nev} value={p.id} />
        ))}
      </Picker>

      <Text style={styles.label}>Mennyiség</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={mennyiseg}
        onChangeText={setMennyiseg}
        placeholder="Pl. 5"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Mentés</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 16, marginTop: 15, marginBottom: 5 },
  picker: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginBottom: 10
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    fontSize: 16
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginTop: 30
  },
  saveText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold"
  }
});
