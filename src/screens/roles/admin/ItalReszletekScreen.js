import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabaseClient.js';

export default function ItalReszletekScreen({ route, navigation }) {
  const { ital, onSoftDelete, onDelete } = route.params;

  const [pultKeszletek, setPultKeszletek] = useState({});
  const [osszes, setOsszes] = useState(0);

  // 🔹 Pultkészletek lekérése az adatbázisból
  useEffect(() => {
    const fetchKeszletek = async () => {
      const { data, error } = await supabase
        .from('pult_keszletek')
        .select(`
          mennyiseg,
          pultok ( nev )
        `)
        .eq('ital_id', ital.id);

      if (error) {
        console.log("Hiba a pultkészletek lekérdezésénél:", error);
        return;
      }

      // Átalakítjuk a pultok szerinti objektummá
      const keszletObj = {};
      let total = 0;

      data.forEach(k => {
        const pultNev = k.pultok?.nev || "Ismeretlen";
        keszletObj[pultNev] = k.mennyiseg;
        total += k.mennyiseg;
      });

      setPultKeszletek(keszletObj);
      setOsszes(total);
    };

    fetchKeszletek();
  }, []);

  // 🔹 IDEIGLENES TÖRLÉS
  const ideiglenesTorles = () => {
    Alert.alert(
      "Ideiglenes törlés",
      "Ezzel ideiglenesen törlöd az italt. Biztosan szeretnéd?",
      [
        { text: "Nem", style: "cancel" },
        {
          text: "Igen",
          style: "destructive",
          onPress: () => {
            onSoftDelete();
            navigation.goBack();
          }
        }
      ]
    );
  };

  // 🔹 VÉGLEGES TÖRLÉS
  const veglegesTorles = () => {
    Alert.alert(
      "Végleges törlés",
      "Ez a művelet nem visszavonható. Biztosan törlöd?",
      [
        { text: "Nem", style: "cancel" },
        {
          text: "Igen",
          style: "destructive",
          onPress: () => {
            onDelete();
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{ital.nev}</Text>
      <Text style={styles.category}>{ital.kategoria}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pultok szerinti bontás</Text>

        {Object.keys(pultKeszletek).map((pult) => (
          <View key={pult} style={styles.row}>
            <Text style={styles.pultNev}>{pult}</Text>
            <Text style={styles.mennyiseg}>{pultKeszletek[pult]} db</Text>
          </View>
        ))}
      </View>

      <View style={styles.totalBox}>
        <Text style={styles.totalText}>Összes mennyiség: {osszes} db</Text>
      </View>

      <TouchableOpacity style={styles.softDeleteButton} onPress={ideiglenesTorles}>
        <Text style={styles.softDeleteText}>Ideiglenes törlés</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={veglegesTorles}>
        <Text style={styles.deleteText}>Törlés</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff"
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5
  },
  category: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20
  },
  section: {
    marginTop: 10
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee"
  },
  pultNev: {
    fontSize: 16
  },
  mennyiseg: {
    fontSize: 16,
    fontWeight: "bold"
  },
  totalBox: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#f2f2f2",
    borderRadius: 10
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center"
  },
  softDeleteButton: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#ffcccc",
    borderRadius: 10
  },
  softDeleteText: {
    color: "#b30000",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold"
  },
  deleteButton: {
    marginTop: 15,
    padding: 15,
    backgroundColor: "#ff4d4d",
    borderRadius: 10
  },
  deleteText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold"
  }
});
