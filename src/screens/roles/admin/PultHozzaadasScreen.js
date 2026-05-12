import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabaseClient.js';

export default function PultHozzaadasScreen({ navigation }) {
  const [nev, setNev] = useState("");

  const handleSave = async () => {
    if (!nev.trim()) {
      Alert.alert("Hiba", "A pult neve nem lehet üres!");
      return;
    }

    const { error } = await supabase
      .from('pultok')
      .insert({
        nev: nev.trim(),
        aktiv: true
      });

    if (error) {
      Alert.alert("Hiba", "Nem sikerült hozzáadni a pultot.");
      return;
    }

    Alert.alert("Siker", "A pult sikeresen hozzáadva!");
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Új pult hozzáadása</Text>

      <Text style={styles.label}>Pult neve</Text>
      <TextInput
        style={styles.input}
        value={nev}
        onChangeText={setNev}
        placeholder="Pl. Garden"
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
  label: { fontSize: 16, marginTop: 10, marginBottom: 5 },
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
