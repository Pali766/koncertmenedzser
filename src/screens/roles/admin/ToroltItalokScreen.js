import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabaseClient.js';

export default function ToroltItalokScreen({ navigation }) {
  const [italok, setItalok] = useState([]);

  // 🔹 Törölt italok lekérése
  const fetchToroltItalok = async () => {
    const { data, error } = await supabase
      .from('torolt_italok')
      .select('*')
      .order('torolve', { ascending: false });

    if (error) {
      console.log("Hiba a törölt italok lekérdezésénél:", error);
      return;
    }

    setItalok(data);
  };

  useEffect(() => {
    fetchToroltItalok();
  }, []);

  // 🔹 Visszaállítás
  const visszaallit = async (item) => {
    try {
      // 1) Visszahelyezés az italok táblába
      const { error: insertError } = await supabase
        .from('italok')
        .insert({
          nev: item.nev,
          kategoria_id: item.kategoria_id
        });

      if (insertError) {
        console.log("Hiba a visszaállításnál:", insertError);
        return;
      }

      // 2) Törlés a torolt_italok táblából
      const { error: deleteError } = await supabase
        .from('torolt_italok')
        .delete()
        .eq('id', item.id);

      if (deleteError) {
        console.log("Hiba a törölt ital törlésénél:", deleteError);
        return;
      }

      // 3) Lista frissítése
      fetchToroltItalok();

    } catch (e) {
      console.log("Visszaállítás hiba:", e);
    }
  };

  return (
    <View style={styles.kontener}>
      <Text style={styles.cim}>🗑️ Törölt italok</Text>

      <FlatList
        data={italok}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.sor}>
            <View>
              <Text style={styles.italNev}>{item.nev}</Text>
              <Text style={styles.datum}>
                Törölve: {new Date(item.torolve).toLocaleString()}
              </Text>
            </View>

            <TouchableOpacity onPress={() => visszaallit(item)}>
              <Ionicons name="refresh" size={26} color="green" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  kontener: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff"
  },
  cim: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20
  },
  sor: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#eee"
  },
  italNev: {
    fontSize: 18,
    fontWeight: "600"
  },
  datum: {
    fontSize: 14,
    color: "#666"
  }
});
