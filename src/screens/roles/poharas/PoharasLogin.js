import { MaterialIcons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../../lib/supabaseClient.js";

export default function PoharasLogin({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const passwordRef = useRef(null);

  const login = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      Alert.alert("Hiba", "Hibás email vagy jelszó");
      return;
    }

    navigation.replace("PoharasPultValaszto");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍺 Poharas bejelentkezés</Text>

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

      <TouchableOpacity style={styles.button} onPress={login}>
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
    marginBottom: 20, 
    textAlign: "center" 
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    marginLeft: 2
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
    fontSize: 16
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
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
    borderRadius: 10
  },
  buttonText: { 
    color: "#fff", 
    textAlign: "center", 
    fontSize: 18,
    fontWeight: "bold"
  }
});
