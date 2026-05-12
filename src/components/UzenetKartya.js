import { StyleSheet, Text, View } from "react-native";

export default function UzenetKartya({ title, message }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardMessage}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f9fbff",
    borderLeftWidth: 6,
    borderLeftColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#003e7e"
  },
  cardMessage: {
    fontSize: 15,
    color: "#333"
  }
});
