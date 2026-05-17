import React, { useState, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);
  const [showRemember, setShowRemember] = useState(false);

  const passwordRef = useRef(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Kérlek töltsd ki az emailt és a jelszót.");
      return;
    }

    setLoading(true);

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (authError) {
      setLoading(false);
      alert("Hibás email vagy jelszó!");
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("felhasznalok")
      .select("id, email, szerepkor")
      .eq("email", email)
      .maybeSingle();

    if (userError || !userData) {
      setLoading(false);
      alert("Nem található a felhasználó szerepköre!");
      return;
    }

    if (userData.szerepkor !== "admin") {
      setLoading(false);
      alert("Csak admin jogosultsággal lehet belépni!");
      return;
    }

    if (!rememberMe) {
      await supabase.auth.updateUser({ data: { autoLogout: true } });
    }

    setLoading(false);
    navigate("/admin");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Admin belépés</h1>

      {/* Email mező */}
      <input
        style={styles.input}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && passwordRef.current.focus()}
      />

      {/* Jelszó mező */}
      <div style={styles.passwordContainer}>
        <input
          style={styles.passwordInput}
          type={showPassword ? "text" : "password"}
          placeholder="Jelszó"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          ref={passwordRef}
          onKeyDown={(e) => e.key === "Enter" && setShowRemember(true)}
        />

        <button
          style={styles.eyeButton}
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? "👁️" : "🙈"}
        </button>
      </div>

      {/* Maradjak bejelentkezve */}
      {showRemember && (
        <>
          <div
            style={styles.rememberContainer}
            onClick={() => setRememberMe(!rememberMe)}
          >
            <span style={styles.checkbox}>
              {rememberMe ? "☑" : "☐"}
            </span>
            <span style={styles.rememberText}>Maradjak bejelentkezve</span>
          </div>

          {rememberMe && (
            <p style={styles.infoText}>
              Ha ezt bepipálod, a következő alkalommal automatikusan be leszel
              jelentkezve, amíg ki nem lépsz.
            </p>
          )}
        </>
      )}

      {/* Belépés gomb */}
      <button
        style={styles.button}
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "Betöltés..." : "Belépés"}
      </button>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "#fff",
    maxWidth: "400px",
    margin: "0 auto"
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "30px"
  },
  input: {
    border: "1px solid #ccc",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "15px",
    fontSize: "16px",
    width: "100%"
  },
  passwordContainer: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ccc",
    borderRadius: "10px",
    padding: "5px 10px",
    marginBottom: "20px",
    backgroundColor: "#fff"
  },
  passwordInput: {
    flex: 1,
    padding: "12px",
    fontSize: "16px",
    border: "none",
    outline: "none"
  },
  eyeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "20px"
  },
  rememberContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
    cursor: "pointer"
  },
  checkbox: {
    fontSize: "22px",
    marginRight: "10px"
  },
  rememberText: {
    fontSize: "16px"
  },
  infoText: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "20px"
  },
  button: {
    backgroundColor: "#FF3B30",
    padding: "15px",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "18px",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer"
  }
};
