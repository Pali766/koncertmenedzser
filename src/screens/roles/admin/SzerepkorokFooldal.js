import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SzerepkorokFooldal({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛠 Felhasználók és szerepkörök</Text>

      <View style={styles.cardContainer}>

        {/* Szerepkörök listája */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate("SzerepkorLista")}
        >
          <Text style={styles.icon}>📋</Text>
          <Text style={styles.cardText}>Szerepkörök listája</Text>
        </TouchableOpacity>

        {/* Új szerepkör létrehozása */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate("SzerepkorLetrehozas")}
        >
          <Text style={styles.icon}>➕</Text>
          <Text style={styles.cardText}>Új szerepkör</Text>
        </TouchableOpacity>

        {/* Felhasználók szerepkörhöz rendelése */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate("FelhasznaloSzerepkor")}
        >
          <Text style={styles.icon}>👤</Text>
          <Text style={styles.cardText}>Felhasználók szerepkörei</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    backgroundColor: "#fff"
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30
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
    marginBottom: 20,
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
