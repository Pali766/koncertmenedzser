import { useRoute } from "@react-navigation/native";
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

export default function AdminChatScreen() {
  const route = useRoute();
  const { userId, userName, userRole } = route.params;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const flatListRef = useRef(null);
  const [adminId, setAdminId] = useState(null);

  // 🔥 Admin ID betöltése (auth user ID)
  useEffect(() => {
    const loadAdmin = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setAdminId(data.user.id);
      }
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
        payload => {
          const msg = payload.new;

          const isRelevant =
            (msg.kuldo_id === adminId && msg.fogado_id === userId) ||
            (msg.kuldo_id === userId && msg.fogado_id === adminId);

          if (isRelevant) {
            setMessages(prev => {
              if (prev.some(m => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [adminId, userId]);

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
      letrehozva: new Date().toISOString()
    });

    setInput("");
  };

  const renderMessage = ({ item }) => {
    const isAdmin = item.kuldo_id === adminId;

    return (
      <View
        style={[
          styles.messageBubble,
          isAdmin ? styles.adminBubble : styles.userBubble
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

  if (!adminId) return <Text>Betöltés...</Text>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Text style={styles.header}>
          {userName} ({userRole})
        </Text>

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
  adminBubble: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end"
  },
  userBubble: {
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
