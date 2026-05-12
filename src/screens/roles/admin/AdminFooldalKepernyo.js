import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../lib/supabaseClient.js';

export default function AdminFooldalKepernyo({ navigation }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.replace("AdminLogin");
  };

  return (
    <ScrollView style={styles.container}>

      {/* Kijelentkezés gomb */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Kijelentkezés</Text>
      </TouchableOpacity>

      <Text style={styles.title}>👔 Admin főoldal</Text>

      <View style={styles.cardContainer}>

        {/* Italok kezelése */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate("Italok")}
        >
          <Text style={styles.icon}>🍸</Text>
          <Text style={styles.cardText}>Italok kezelése</Text>
        </TouchableOpacity>

        {/* Pultok kezelése */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate("Pultok")}
        >
          <Text style={styles.icon}>🧃</Text>
          <Text style={styles.cardText}>Pultok kezelése</Text>
        </TouchableOpacity>

        {/* Üvegek */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate("Uvegek")}
        >
          <Text style={styles.icon}>♻</Text>
          <Text style={styles.cardText}>Üvegek</Text>
        </TouchableOpacity>

        {/* Mentett adatok */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate("RogzitettAdatok")}
        >
          <Text style={styles.icon}>🗂</Text>
          <Text style={styles.cardText}>Mentett adatok</Text>
        </TouchableOpacity>

        {/* Készletkezelés */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate("Keszlet")}
        >
          <Text style={styles.icon}>📦</Text>
          <Text style={styles.cardText}>Készletkezelés</Text>
        </TouchableOpacity>

        {/* Felhasználók és szerepkörök */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate("SzerepkorokFooldal")}
        >
          <Text style={styles.icon}>🛠</Text>
          <Text style={styles.cardText}>Felhasználók és szerepkörök</Text>
        </TouchableOpacity>

        {/* Üzenetek */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate("AdminUzenetek")}
        >
          <Text style={styles.icon}>💬</Text>
          <Text style={styles.cardText}>Üzenetek</Text>
        </TouchableOpacity>

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    backgroundColor: "#fff"
  },

  logoutButton: {
    position: "absolute",
    top: 30,
    right: 20,
    backgroundColor: "#FF4D4D",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    zIndex: 10
  },

  logoutText: {
    color: "#fff",
    fontWeight: "bold"
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    marginTop: 35
  },

  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },

  card: {
    width: "48%",
    backgroundColor: "#f9f9f9",
    paddingVertical: 25,
    borderRadius: 15,
    marginBottom: 25,
    alignItems: "center",
    elevation: 4
  },

  icon: {
    fontSize: 40,
    marginBottom: 10
  },

  cardText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center"
  }
});
