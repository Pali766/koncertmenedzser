import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { FlatList, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabaseClient.js';

export default function PultokScreen({ navigation }) {
  const [pultok, setPultok] = useState([]);

  // 🔹 Pultok lekérése
  const fetchPultok = useCallback(async () => {
    const { data, error } = await supabase
      .from('pultok')
      .select('*')
      .order('nev');

    if (error) {
      console.log("Hiba a pultok lekérdezésénél:", error);
      return;
    }

    setPultok(data || []);
  }, []);

  // 🔹 Képernyő fókusz → mindig frissít
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchPultok);
    return unsubscribe;
  }, [navigation, fetchPultok]);

  // 🔹 Fejléc gomb
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("PultHozzaadas")}
          style={{ marginRight: 15 }}
        >
          <Ionicons name="add" size={28} color="#007AFF" />
        </TouchableOpacity>
      )
    });
  }, [navigation]);

  // 🔹 Aktiválás / inaktiválás
  const toggleAktiv = async (pult) => {
    const { error } = await supabase
      .from('pultok')
      .update({ aktiv: !pult.aktiv })
      .eq('id', pult.id);

    if (error) {
      console.log("Hiba az aktiválásnál:", error);
      return;
    }

    fetchPultok();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pultok kezelése</Text>

      <FlatList
        data={pultok}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.nev}</Text>

            <View style={styles.right}>
              <Text style={{ marginRight: 10, color: item.aktiv ? "green" : "red" }}>
                {item.aktiv ? "Aktív" : "Inaktív"}
              </Text>

              <Switch
                value={item.aktiv}
                onValueChange={() => toggleAktiv(item)}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#eee"
  },
  name: { fontSize: 18, fontWeight: "600" },
  right: { flexDirection: "row", alignItems: "center" }
});
