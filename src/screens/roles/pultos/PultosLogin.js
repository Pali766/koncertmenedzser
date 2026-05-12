import { MaterialIcons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../../lib/supabaseClient.js";

export default function PultosLogin({ navigation, route }) {
  const { pultId } = route.params;

  const [email, setEmail] = useState("");
  const [jelszo, setJelszo] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const passwordRef = useRef(null);

  const bejelentkezes = async () => {
    if (!email || !jelszo) {
      Alert.alert("Hiba", "Add meg az emailt és a jelszót");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: jelszo
    });

    if (error) {
      Alert.alert("Hiba", "Hibás email vagy jelszó");
      return;
    }

    navigation.navigate("PultosFooldal", { pultId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Pultos bejelentkezés</Text>

      {/* EMAIL LABEL */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Email cím"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current.focus()}
      />

      {/* JELSZÓ LABEL */}
      <Text style={styles.label}>Jelszó</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Jelszó"
          secureTextEntry={!showPassword}
          value={jelszo}
          onChangeText={setJelszo}
          ref={passwordRef}
        />

        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <MaterialIcons
            name={showPassword ? "visibility" : "visibility-off"}
            size={24}
            color="#555"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={bejelentkezes}>
        <Text style={styles.buttonText}>Bejelentkezés</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f2f2f2"
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    marginLeft: 2
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc"
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    marginBottom: 15
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16
  },
  eyeButton: {
    padding: 6
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 10
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold"
  }
});
