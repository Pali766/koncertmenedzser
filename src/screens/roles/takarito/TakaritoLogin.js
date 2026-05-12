import { MaterialIcons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../../lib/supabaseClient.js";

export default function TakaritoLogin({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const passwordRef = useRef(null);

  const handleLogin = async () => {
    setErrorMsg("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setErrorMsg("Hibás email vagy jelszó");
      return;
    }

    // 🔥 ÚJ SZABÁLY: nincs szerepkör ellenőrzés
    navigation.replace("Takarito");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧹 Takarító bejelentkezés</Text>

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
          value={password}
          onChangeText={setPassword}
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

      {errorMsg !== "" && <Text style={styles.error}>{errorMsg}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Bejelentkezés</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f2f2f2"
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30
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
    borderColor: "#ddd"
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
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
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginTop: 10
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold"
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center"
  }
});
