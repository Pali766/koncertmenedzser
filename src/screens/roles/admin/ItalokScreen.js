import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabaseClient.js';

export default function ItalokScreen({ navigation }) {
  const [kereses, setKereses] = useState("");
  const [italok, setItalok] = useState([]);

  // 🔹 Italok + készletek lekérése
  const fetchItalok = useCallback(async () => {
    // 1) Italok lekérése
    const { data, error } = await supabase
      .from('italok')
      .select(`
        id,
        nev,
        kategoria_id,
        ital_kategoriak ( nev )
      `)
      .order('nev');

    if (error) {
      console.log("Hiba az italok lekérdezésénél:", error);
      return;
    }

    // 2) Készletek lekérése
    const { data: keszletek } = await supabase
      .from('keszletek')
      .select('ital_id, mennyiseg');

    // 3) Összes mennyiség kiszámítása
    const formatted = data.map(i => {
      const osszes = keszletek
        .filter(k => k.ital_id === i.id)
        .reduce((sum, k) => sum + k.mennyiseg, 0);

      return {
        id: i.id,
        nev: i.nev,
        kategoria: i.ital_kategoriak?.nev || "Ismeretlen",
        osszes
      };
    });

    setItalok(formatted);
  }, []);

  // 🔹 Képernyő fókusz esemény → mindig frissít
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchItalok();
    });

    return unsubscribe;
  }, [navigation, fetchItalok]);

  // 🔹 Fejléc gombok (KUKA + PLUSZ)
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("ToroltItalok")}
            style={{ marginRight: 20 }}
          >
            <Ionicons name="trash" size={26} color="red" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("ItalHozzaadas")}
            style={{ marginRight: 10 }}
          >
            <Ionicons name="add" size={28} color="#007AFF" />
          </TouchableOpacity>
        </View>
      )
    });
  }, [navigation]);

  // 🔹 Keresés
  const szurtItalok = italok.filter(i =>
    i.nev.toLowerCase().includes(kereses.toLowerCase())
  );

  return (
    <View style={styles.kontener}>
      <Text style={styles.cim}>🍸 Italok kezelése</Text>

      <TextInput
        style={styles.kereso}
        placeholder="Keresés..."
        value={kereses}
        onChangeText={setKereses}
      />

      <FlatList
        data={szurtItalok}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.sor}
            onPress={() => navigation.navigate("ItalReszletek", {
              ital: item
            })}
          >
            <View>
              <Text style={styles.italNev}>{item.nev}</Text>
              <Text style={styles.kategoria}>{item.kategoria}</Text>
            </View>

            <View style={styles.jobbOldal}>
              <Text style={styles.mennyiseg}>{item.osszes} db</Text>

              <TouchableOpacity
                onPress={(event) => {
                  event.stopPropagation();
                  navigation.navigate("ItalSzerkesztes", {
                    ital: item,
                    onSave: fetchItalok
                  });
                }}
              >
                <Ionicons name="pencil" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
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
  kereso: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
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
  kategoria: {
    fontSize: 14,
    color: "#666"
  },
  jobbOldal: {
    alignItems: "flex-end"
  },
  mennyiseg: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5
  }
});
