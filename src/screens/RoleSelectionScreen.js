import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RoleSelectionScreen({ navigation }) {
  const roles = [
    { label: "Pultos", screen: "Pultos" },
    { label: "Poharas", screen: "PoharasLogin" },
    { label: "Jegyszedő", screen: "JegyszedoLogin" },
    { label: "Ruhatáros", screen: "RuhatarosLogin" },
    { label: "Takarító", screen: "TakaritoLogin" }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Válassz szerepkört, {"\n"}miben fogsz dolgozni!
      </Text>

      {roles.map((role) => (
        <TouchableOpacity
          key={role.screen}
          style={styles.button}
          onPress={() => navigation.navigate(role.screen)}
        >
          <Text style={styles.buttonText}>{role.label}</Text>
        </TouchableOpacity>
      ))}

      {/* Admin gomb blokk */}
      <View style={styles.adminContainer}>
        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => navigation.navigate("AdminLogin")}
        >
          <Text style={styles.adminButtonText}>Üzletvezető / Admin belépés</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center"
  },
  button: {
    width: "80%",
    padding: 15,
    backgroundColor: "#007AFF",
    borderRadius: 10,
    marginBottom: 15
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center"
  },

  /* --- Admin stílusok --- */
  adminContainer: {
    marginTop: 40,
    width: "80%",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 20
  },
  adminButton: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 10
  },
  adminButtonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold"
  }
});
