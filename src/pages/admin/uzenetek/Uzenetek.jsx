import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Uzenetek() {
  const navigate = useNavigate();

  const [uzenetek, setUzenetek] = useState([]);
  const [felhasznalok, setFelhasznalok] = useState([]);

  const [showOlvasott, setShowOlvasott] = useState(false);

  const [modalNyitva, setModalNyitva] = useState(false);
  const [kivalasztottUser, setKivalasztottUser] = useState(null);
  const [uzenetSzoveg, setUzenetSzoveg] = useState("");

  // 🔥 Üzenetek lekérése
  const fetchUzenetek = async () => {
    const { data, error } = await supabase
      .from("uzenetek")
      .select(`
        id,
        uzenet,
        tipus,
        prioritas,
        olvasott,
        letrehozva,
        kuldo_id,
        fogado_id,
        kuldo_szerep,
        fogado_szerep,
        kuldo_nev:felhasznalok!uzenetek_kuldo_id_fkey(nev),
        fogado_nev:felhasznalok!uzenetek_fogado_id_fkey(nev)
      `)
      .eq("olvasott", showOlvasott)
      .order("prioritas", { ascending: true })
      .order("letrehozva", { ascending: false });

    if (!error) setUzenetek(data || []);
  };

  // 🔥 Felhasználók lekérése
  const fetchFelhasznalok = async () => {
    const { data } = await supabase
      .from("felhasznalok")
      .select("id, nev, szerepkor, utolso_belepes");

    setFelhasznalok(data || []);
  };

  // 🔥 Realtime frissítés
  useEffect(() => {
    fetchUzenetek();
    fetchFelhasznalok();

    const channel = supabase
      .channel("uzenetek-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "uzenetek" },
        () => fetchUzenetek()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [showOlvasott]);

  // 🔵 Üzenet olvasottra állítása
  const jelolesOlvasottnak = async (id) => {
    await supabase.from("uzenetek").update({ olvasott: true }).eq("id", id);
    fetchUzenetek();
  };

  // 🔵 Üzenet küldése
  const kuldes = async () => {
    if (!kivalasztottUser || !uzenetSzoveg.trim()) return;

    const user = (await supabase.auth.getUser()).data.user;

    await supabase.from("uzenetek").insert({
      kuldo_id: user.id,
      kuldo_szerep: "admin",
      fogado_id: kivalasztottUser.id,
      fogado_szerep: kivalasztottUser.szerepkor,
      uzenet: uzenetSzoveg,
      tipus: "egyedi",
      prioritas: 5,
      olvasott: false,
    });

    setUzenetSzoveg("");
    setKivalasztottUser(null);
    setModalNyitva(false);
    fetchUzenetek();
  };

  return (
    <div style={styles.container}>
      {/* Fejléc */}
      <div style={styles.header}>
        <h1 style={styles.title}>💬 Üzenetek</h1>

        <button
          style={styles.toggleButton}
          onClick={() => setShowOlvasott((prev) => !prev)}
        >
          {showOlvasott ? "📥 Olvasatlanok" : "📩 Olvasottak"}
        </button>

        <button style={styles.newButton} onClick={() => setModalNyitva(true)}>
          ➕ Új üzenet
        </button>
      </div>

      {/* Üzenetek listája */}
      <div style={styles.list}>
        {uzenetek.map((item) => {
          const partnerId =
            item.kuldo_szerep === "admin" ? item.fogado_id : item.kuldo_id;

          const partnerName =
            item.kuldo_szerep === "admin"
              ? item.fogado_nev?.nev
              : item.kuldo_nev?.nev;

          const partnerRole =
            item.kuldo_szerep === "admin"
              ? item.fogado_szerep
              : item.kuldo_szerep;

          return (
            <div
              key={item.id}
              style={{
                ...styles.messageCard,
                ...(item.olvasott ? {} : styles.unread),
              }}
              onClick={() =>
                navigate(`/admin/uzenetek/${partnerId}`, {
                  state: {
                    userId: partnerId,
                    userName: partnerName,
                    userRole: partnerRole,
                  },
                })
              }
            >
              <div style={styles.row}>
                <input
                  type="checkbox"
                  checked={item.olvasott}
                  onChange={() => jelolesOlvasottnak(item.id)}
                />

                <strong style={{ marginLeft: 10 }}>
                  {item.kuldo_nev?.nev} ({item.kuldo_szerep}) ➜{" "}
                  {item.fogado_nev?.nev}
                </strong>
              </div>

              <div style={styles.messageText}>{item.uzenet}</div>

              <div style={styles.messageTime}>
                {new Date(item.letrehozva).toLocaleString()} • Prioritás:{" "}
                {item.prioritas}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalNyitva && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h2 style={styles.modalTitle}>Új üzenet küldése</h2>

            <label style={styles.label}>Címzett:</label>
            <div style={styles.userList}>
              {felhasznalok.map((user) => (
                <div
                  key={user.id}
                  style={{
                    ...styles.userItem,
                    ...(kivalasztottUser?.id === user.id
                      ? styles.userSelected
                      : {}),
                  }}
                  onClick={() => setKivalasztottUser(user)}
                >
                  {user.nev} ({user.szerepkor})
                </div>
              ))}
            </div>

            <label style={styles.label}>Üzenet:</label>
            <textarea
              style={styles.textarea}
              value={uzenetSzoveg}
              onChange={(e) => setUzenetSzoveg(e.target.value)}
              placeholder="Írd ide az üzenetet..."
            />

            <button style={styles.sendButton} onClick={kuldes}>
              Küldés
            </button>

            <button
              style={styles.cancelButton}
              onClick={() => setModalNyitva(false)}
            >
              Mégse
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: 20, maxWidth: 900, margin: "0 auto" },

  header: {
    display: "flex",
    alignItems: "center",
    gap: 15,
    marginBottom: 20,
  },

  title: { fontSize: 28, fontWeight: "bold", flexGrow: 1 },

  toggleButton: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #ccc",
    cursor: "pointer",
    background: "#eee",
  },

  newButton: {
    padding: "8px 12px",
    borderRadius: 8,
    background: "#007AFF",
    color: "white",
    border: "none",
    cursor: "pointer",
  },

  list: { marginTop: 10 },

  messageCard: {
    background: "#f2f2f2",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    cursor: "pointer",
  },

  unread: { background: "#d9eaff" },

  row: { display: "flex", alignItems: "center", marginBottom: 8 },

  messageText: { fontSize: 16 },

  messageTime: { fontSize: 12, color: "#666", marginTop: 5 },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    background: "white",
    padding: 20,
    borderRadius: 15,
    width: "90%",
    maxWidth: 500,
    maxHeight: "90%",
    overflowY: "auto",
  },

  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },

  label: { marginTop: 10, fontWeight: "bold" },

  userList: {
    marginTop: 5,
    border: "1px solid #ccc",
    borderRadius: 10,
    padding: 10,
    maxHeight: 200,
    overflowY: "auto",
  },

  userItem: {
    padding: 8,
    borderRadius: 8,
    background: "#eee",
    marginBottom: 5,
    cursor: "pointer",
  },

  userSelected: { background: "#cce0ff" },

  textarea: {
    width: "100%",
    height: 100,
    marginTop: 5,
    padding: 10,
    borderRadius: 10,
    border: "1px solid #ccc",
    resize: "none",
  },

  sendButton: {
    background: "#007AFF",
    color: "white",
    padding: 12,
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    marginTop: 20,
    width: "100%",
  },

  cancelButton: {
    marginTop: 10,
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: "none",
    background: "#ddd",
    cursor: "pointer",
  },
};
