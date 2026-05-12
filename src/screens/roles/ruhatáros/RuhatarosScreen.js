import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RuhatarosScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ruhatáros feladatok</Text>

      <Text style={styles.description}>
        Itt találod a ruhatáros munkakörhöz tartozó feladatokat és tudnivalókat.
      </Text>

      <View style={styles.taskBox}>
        <Text style={styles.taskItem}>• Ruhatári jegyek kezelése</Text>
        <Text style={styles.taskItem}>• Kabátok átvétele és kiadása</Text>
        <Text style={styles.taskItem}>• Elveszett jegyek kezelése</Text>
        <Text style={styles.taskItem}>• Ruhatár rendben tartása</Text>
      </View>

      {/* Üzenetek gomb */}
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate("RuhatarosChatScreen")}
      >
        <Text style={styles.buttonText}>Üzenetek</Text>
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
    marginBottom: 10,
    textAlign: "center"
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#555"
  },
  taskBox: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 10
  },
  taskItem: {
    fontSize: 18,
    marginBottom: 8
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center"
  }
});
