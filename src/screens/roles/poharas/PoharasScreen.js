import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PoharasScreen({ navigation, route }) {
  const { sajatPultId, sajatPultNev } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍺 Poharas felület</Text>

      {/* Admin üzenetek */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("PoharasChatScreen")}
      >
        <Text style={styles.cardTitle}>📨 Admin üzenetek</Text>
        <Text style={styles.cardDesc}>Üzenet küldése az adminnak</Text>
      </TouchableOpacity>

      {/* Ital felírás */}
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("PoharasItalFeliras", {
            sajatPultId,
            sajatPultNev
          })
        }
      >
        <Text style={styles.cardTitle}>🍹 Ital felírás</Text>
        <Text style={styles.cardDesc}>Italok rögzítése</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f2f2f2",
    justifyContent: "flex-start"
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5
  },
  cardDesc: {
    fontSize: 16,
    color: "#555"
  }
});
