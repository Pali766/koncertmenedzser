import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../../lib/supabaseClient.js";

export default function PoharasChatScreen() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const flatListRef = useRef(null);

  const [poharasId, setPoharasId] = useState(null);
  const [adminId, setAdminId] = useState(null);

  // 🔥 Poharas ID betöltése (auth user)
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setPoharasId(data.user.id);
    };
    loadUser();
  }, []);

  // 🔥 Admin ID (fix Supabase Auth UID)
  useEffect(() => {
    setAdminId("c9b2d7d7-6743-4535-8e53-621a8ab031e5");
  }, []);

  // 🔥 Üzenetek lekérése
  useEffect(() => {
    if (!poharasId || !adminId) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("uzenetek")
        .select("*")
        .or(
          `and(kuldo_id.eq.${poharasId},fogado_id.eq.${adminId}),and(kuldo_id.eq.${adminId},fogado_id.eq.${poharasId})`
        )
        .order("letrehozva", { ascending: true });

      setMessages(data || []);
    };

    fetchMessages();
  }, [poharasId, adminId]);

  // 🔥 Realtime listener
  useEffect(() => {
    if (!poharasId || !adminId) return;

    const channel = supabase
      .channel(`chat-poharas-${poharasId}-${adminId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "uzenetek" },
        payload => {
          const msg = payload.new;

          const isRelevant =
            (msg.kuldo_id === poharasId && msg.fogado_id === adminId) ||
            (msg.kuldo_id === adminId && msg.fogado_id === poharasId);

          if (isRelevant) {
            setMessages(prev => {
              if (prev.some(m => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [poharasId, adminId]);

  // 🔥 Üzenet küldése
  const sendMessage = async () => {
    if (!input.trim() || !poharasId || !adminId) return;

    await supabase.from("uzenetek").insert({
      kuldo_id: poharasId,
      kuldo_szerep: "poharas",
      fogado_id: adminId,
      fogado_szerep: "admin",
      uzenet: input.trim(),
      tipus: "manual",
      prioritas: 5,
      olvasott: false,
      letrehozva: new Date().toISOString()
    });

    setInput("");
  };

  const renderMessage = ({ item }) => {
    const isPoharas = item.kuldo_id === poharasId;

    return (
      <View
        style={[
          styles.messageBubble,
          isPoharas ? styles.poharasBubble : styles.adminBubble
        ]}
      >
        <Text style={styles.messageText}>{item.uzenet}</Text>
        <Text style={styles.timeText}>
          {new Date(item.letrehozva).toLocaleTimeString("hu-HU", {
            hour: "2-digit",
            minute: "2-digit"
          })}
        </Text>
      </View>
    );
  };

  if (!poharasId || !adminId) return <Text>Betöltés...</Text>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Text style={styles.header}>Adminnal folytatott beszélgetés</Text>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id.toString()}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 15 }}
        />

        <View style={[styles.inputRow, { paddingBottom: 30 }]}>
          <TextInput
            style={styles.input}
            placeholder="Írj üzenetet..."
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendText}>Küldés</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    padding: 15,
    backgroundColor: "#f2f2f2",
    textAlign: "center"
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 12,
    marginVertical: 5
  },
  poharasBubble: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end"
  },
  adminBubble: {
    backgroundColor: "#e5e5ea",
    alignSelf: "flex-start"
  },
  messageText: { color: "#000", fontSize: 16 },
  timeText: {
    fontSize: 10,
    color: "#333",
    marginTop: 4,
    textAlign: "right"
  },
  inputRow: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd"
  },
  input: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderRadius: 10
  },
  sendButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginLeft: 10
  },
  sendText: { color: "#fff", fontWeight: "bold" }
});
