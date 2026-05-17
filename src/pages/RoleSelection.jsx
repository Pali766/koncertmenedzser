import React from "react";

export default function RoleSelection() {
  const roles = [
    { label: "Pultos", path: "/pultos" },
    { label: "Poharas", path: "/poharas-login" },
    { label: "Jegyszedő", path: "/jegyszedo-login" },
    { label: "Ruhatáros", path: "/ruhataros-login" },
    { label: "Takarító", path: "/takarito-login" }
  ];

  function navigateTo(path) {
    // Ezt később React Routerre cseréljük
    window.location.href = path;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        Válassz szerepkört, <br /> miben fogsz dolgozni!
      </h1>

      {roles.map((role) => (
        <button
          key={role.path}
          style={styles.button}
          onClick={() => navigateTo(role.path)}
        >
          {role.label}
        </button>
      ))}

      <div style={styles.adminContainer}>
        <button
          style={styles.adminButton}
          onClick={() => navigateTo("/admin-login")}
        >
          Üzletvezető / Admin belépés
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: "20px"
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "30px",
    textAlign: "center"
  },
  button: {
    width: "80%",
    padding: "15px",
    backgroundColor: "#007AFF",
    borderRadius: "10px",
    marginBottom: "15px",
    color: "#fff",
    fontSize: "18px",
    textAlign: "center",
    border: "none",
    cursor: "pointer"
  },
  adminContainer: {
    marginTop: "40px",
    width: "80%",
    borderTop: "1px solid #ccc",
    paddingTop: "20px"
  },
  adminButton: {
    width: "100%",
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
