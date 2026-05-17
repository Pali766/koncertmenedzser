import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function Chat() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: userId } = useParams();

  // Fallback értékek, ha valaki közvetlen URL-ből nyitja meg
  const {
    userName = "Ismeretlen felhasználó",
    userRole = "ismeretlen szerepkör",
  } = location.state || {};

  const [adminId, setAdminId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const bottomRef = useRef(null);

  // 🔥 Admin ID betöltése
  useEffect(() => {
    const loadAdmin = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setAdminId(data.user.id);
    };
    loadAdmin();
  }, []);

  // 🔥 Üzenetek lekérése
  useEffect(() => {
    if (!adminId || !userId) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("uzenetek")
        .select("*")
        .or(
          `and(kuldo_id.eq.${adminId},fogado_id.eq.${userId}),and(kuldo_id.eq.${userId},fogado_id.eq.${adminId})`
        )
        .order("letrehozva", { ascending: true });

      setMessages(data || []);
    };

    fetchMessages();
  }, [adminId, userId]);

  // 🔥 Realtime listener
  useEffect(() => {
    if (!adminId || !userId) return;

    const channel = supabase
      .channel(`chat-admin-${adminId}-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "uzenetek" },
        (payload) => {
          const msg = payload.new;

          const relevant =
            (msg.kuldo_id === adminId && msg.fogado_id === userId) ||
            (msg.kuldo_id === userId && msg.fogado_id === adminId);

          if (relevant) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [adminId, userId]);

  // 🔥 Automatikus görgetés
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔥 Üzenet küldése
  const sendMessage = async () => {
    if (!input.trim() || !adminId || !userId) return;

    await supabase.from("uzenetek").insert({
      kuldo_id: adminId,
      kuldo_szerep: "admin",
      fogado_id: userId,
      fogado_szerep: userRole,
      uzenet: input.trim(),
      tipus: "egyedi",
      prioritas: 5,
      olvasott: false,
      letrehozva: new Date().toISOString(),
    });

    setInput("");
  };

  if (!adminId) return <div>Betöltés...</div>;

  return (
    <div style={styles.container}>
      {/* Fejléc */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate("/admin/uzenetek")}>
          ←
        </button>
        <h2 style={styles.headerText}>
          {userName} <span style={styles.role}>({userRole})</span>
        </h2>
      </div>

      {/* Üzenetek */}
      <div style={styles.messagesBox}>
        {messages.map((msg) => {
          const isAdmin = msg.kuldo_id === adminId;

          return (
            <div
              key={msg.id}
              style={{
                ...styles.bubble,
                ...(isAdmin ? styles.adminBubble : styles.userBubble),
              }}
            >
              <div>{msg.uzenet}</div>
              <div style={styles.time}>
                {new Date(msg.letrehozva).toLocaleTimeString("hu-HU", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Üzenetküldő sáv */}
      <div style={styles.inputRow}>
        <input
          style={styles.input}
          placeholder="Írj üzenetet..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button style={styles.sendButton} onClick={sendMessage}>
          Küldés
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#fff",
  },

  header: {
    padding: "15px",
    background: "#f2f2f2",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  backButton: {
    background: "#ddd",
    border: "none",
    padding: "6px 10px",
    borderRadius: 8,
    cursor: "pointer",
  },

  headerText: {
    fontSize: "20px",
    fontWeight: "bold",
  },

  role: {
    fontSize: "16px",
    color: "#666",
  },

  messagesBox: {
    flex: 1,
    overflowY: "auto",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  bubble: {
    maxWidth: "70%",
    padding: "10px",
    borderRadius: "12px",
    fontSize: "16px",
  },

  adminBubble: {
    background: "#007AFF",
    color: "white",
    alignSelf: "flex-end",
  },

  userBubble: {
    background: "#e5e5ea",
    color: "black",
    alignSelf: "flex-start",
  },

  time: {
    fontSize: "10px",
    marginTop: "4px",
    textAlign: "right",
    opacity: 0.7,
  },

  inputRow: {
    display: "flex",
    padding: "10px",
    borderTop: "1px solid #ddd",
    gap: "10px",
  },

  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    background: "#f2f2f2",
  },

  sendButton: {
    background: "#007AFF",
    color: "white",
    padding: "10px 15px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
