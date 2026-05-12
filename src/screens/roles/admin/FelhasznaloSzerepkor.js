import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabaseClient.js';

export default function FelhasznaloSzerepkor() {
  const [felhasznalok, setFelhasznalok] = useState([]);
  const [szerepkorok, setSzerepkorok] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Szerepkörök betöltése
  const loadRoles = async () => {
    const { data, error } = await supabase
      .from("szerepkorok")
      .select("*")
      .order("nev");

    if (error) {
      console.log("Hiba a szerepkörök lekérdezésénél:", error);
      return;
    }

    setSzerepkorok(data);
  };

  // 🔹 Felhasználók betöltése
  const loadUsers = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("felhasznalok")
      .select(`
        id,
        email,
        szerepkor_id,
        szerepkorok ( nev )
      `)
      .order("email", { ascending: true });

    if (!error) {
      setFelhasznalok(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadRoles();
    loadUsers();
  }, []);

  // 🔹 Szerepkör módosítása
  const szerepkorValtas = async (userId, szerepkorId) => {
    const { error } = await supabase
      .from("felhasznalok")
      .update({ szerepkor_id: szerepkorId })
      .eq("id", userId);

    if (error) {
      Alert.alert("Hiba", "Nem sikerült módosítani a szerepkört!");
      return;
    }

    Alert.alert("Siker", "Szerepkör frissítve!");
    loadUsers();
  };

  const renderItem = ({ item }) => (
    <View style={styles.userCard}>
      <Text style={styles.email}>{item.email}</Text>
      <Text style={styles.currentRole}>
        Jelenlegi szerepkör: {item.szerepkorok?.nev || "nincs"}
      </Text>

      <View style={styles.roleRow}>
        {szerepkorok.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[
              styles.roleButton,
              item.szerepkor_id === role.id && styles.selectedRole
            ]}
            onPress={() => szerepkorValtas(item.id, role.id)}
          >
            <Text
              style={[
                styles.roleText,
                item.szerepkor_id === role.id && styles.selectedRoleText
              ]}
            >
              {role.nev}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👥 Felhasználók szerepkörei</Text>

      {loading ? (
        <Text>Betöltés...</Text>
      ) : (
        <FlatList
          data={felhasznalok}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  userCard: {
    backgroundColor: "#f2f2f2",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15
  },
  email: { fontSize: 18, fontWeight: "600" },
  currentRole: { marginTop: 5, marginBottom: 10, color: "#555" },
  roleRow: { flexDirection: "row", flexWrap: "wrap" },
  roleButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ccc"
  },
  selectedRole: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF"
  },
  roleText: { fontSize: 14 },
  selectedRoleText: { color: "#fff", fontWeight: "bold" }
});
