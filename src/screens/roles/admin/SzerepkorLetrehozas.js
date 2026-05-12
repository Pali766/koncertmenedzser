import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabaseClient.js';

export default function SzerepkorLetrehozas({ navigation, route }) {
  const szerkesztett = route?.params?.szerepkor || null;

  const [nev, setNev] = useState("");

  useEffect(() => {
    if (szerkesztett) {
      setNev(szerkesztett.nev);
    }
  }, []);

  const mentes = async () => {
    if (!nev.trim()) {
      Alert.alert("Hiba", "A szerepkör neve kötelező!");
      return;
    }

    if (szerkesztett) {
      // SZERKESZTÉS
      const { error } = await supabase
        .from("szerepkorok")
        .update({ nev })
        .eq("id", szerkesztett.id);

      if (error) {
        Alert.alert("Hiba", "Nem sikerült frissíteni a szerepkört!");
        return;
      }

      Alert.alert("Siker", "Szerepkör frissítve!");
      navigation.goBack();
    } else {
      // LÉTREHOZÁS
      const { error } = await supabase
        .from("szerepkorok")
        .insert({ nev });

      if (error) {
        Alert.alert("Hiba", "Nem sikerült létrehozni a szerepkört!");
        return;
      }

      Alert.alert("Siker", "Új szerepkör létrehozva!");
      navigation.goBack();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {szerkesztett ? "Szerepkör szerkesztése" : "Új szerepkör létrehozása"}
      </Text>

      <Text style={styles.label}>Szerepkör neve</Text>
      <TextInput
        style={styles.input}
        value={nev}
        onChangeText={setNev}
        placeholder="Pl.: Pultos"
      />

      <TouchableOpacity style={styles.saveButton} onPress={mentes}>
        <Text style={styles.saveText}>Mentés</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 18, marginTop: 15, marginBottom: 5 },
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
