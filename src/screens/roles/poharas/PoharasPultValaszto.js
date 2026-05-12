import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../../../lib/supabaseClient.js";

export default function PoharasPultValaszto({ navigation }) {
  const [pultok, setPultok] = useState([]);

  useEffect(() => {
    const fetchPultok = async () => {
      const { data, error } = await supabase
        .from("pultok")
        .select("*")
        .eq("aktiv", true)
        .order("nev");

      if (!error) setPultok(data);
    };

    fetchPultok();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Válassz pultot</Text>

      <FlatList
        data={pultok || []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.pult}
            onPress={() =>
              navigation.navigate("Poharas", {
                sajatPultId: item.id,
                sajatPultNev: item.nev
              })
            }
          >
            <Text style={styles.pultText}>{item.nev}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  pult: { padding: 15, backgroundColor: "#fff", borderRadius: 10, marginBottom: 10 },
  pultText: { fontSize: 20 }
});
