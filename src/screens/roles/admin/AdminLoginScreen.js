import { MaterialIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../../lib/supabaseClient.js';

export default function AdminLoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);
  const [showRemember, setShowRemember] = useState(false);

  const passwordInputRef = useRef(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();

        if (hasHardware && enrolled) {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: "Admin belépés",
            fallbackLabel: "Használd a jelszót"
          });

          if (result.success) {
            navigation.replace("AdminFooldal");
          }
        }
      }
    };

    checkSession();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Hiba", "Kérlek töltsd ki az emailt és a jelszót.");
      return;
    }

    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      setLoading(false);
      Alert.alert("Hiba", "Hibás email vagy jelszó!");
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from('felhasznalok')
      .select('id, email, szerepkor')
      .eq('email', email)
      .maybeSingle();

    if (userError || !userData) {
      setLoading(false);
      Alert.alert("Hiba", "Nem található a felhasználó szerepköre!");
      return;
    }

    if (userData.szerepkor !== "admin") {
      setLoading(false);
      Alert.alert("Hozzáférés megtagadva", "Csak admin jogosultsággal lehet belépni!");
      return;
    }

    if (!rememberMe) {
      await supabase.auth.updateUser({ data: { autoLogout: true } });
    }

    setLoading(false);
    navigation.replace("AdminFooldal");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin belépés</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        returnKeyType="next"
        onSubmitEditing={() => passwordInputRef.current.focus()}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Jelszó"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          ref={passwordInputRef}
          returnKeyType="next"
          onSubmitEditing={() => setShowRemember(true)}
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

      {showRemember && (
        <>
          <TouchableOpacity 
            style={styles.rememberContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <Text style={styles.checkbox}>{rememberMe ? "☑" : "☐"}</Text>
            <Text style={styles.rememberText}>Maradjak bejelentkezve</Text>
          </TouchableOpacity>

          {rememberMe && (
            <Text style={styles.infoText}>
              Ha ezt bepipálod, a következő alkalommal biometrikus azonosítással is be tudsz lépni.
            </Text>
          )}
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Belépés</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff"
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#fff"
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: "#fff"
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16
  },
  eyeButton: {
    padding: 8
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10
  },
  checkbox: {
    fontSize: 22,
    marginRight: 10
  },
  rememberText: {
    fontSize: 16
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20
  },
  button: {
    backgroundColor: "#FF3B30",
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
