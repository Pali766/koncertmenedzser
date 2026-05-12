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

export default function JegyszedoChatScreen() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const flatListRef = useRef(null);

  const [jegyszedoId, setJegyszedoId] = useState(null);
  const [adminId, setAdminId] = useState(null);

  // 🔥 Jegyszedő ID betöltése
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setJegyszedoId(data.user.id);
    };
    loadUser();
  }, []);

  // 🔥 Admin ID betöltése
  useEffect(() => {
    const loadAdmin = async () => {
      const { data } = await supabase
        .from("felhasznalok")
        .select("id")
        .eq("szerepkor", "admin")
        .single();

      if (data) setAdminId(data.id);
    };
    loadAdmin();
  }, []);

  // 🔥 Üzenetek lekérése
  const fetchMessages = async () => {
    if (!jegyszedoId || !adminId) return;

    const { data } = await supabase
      .from("uzenetek")
      .select("*")
      .or(
        `and(kuldo_id.eq.${jegyszedoId},fogado_id.eq.${adminId}),
         and(kuldo_id.eq.${adminId},fogado_id.eq.${jegyszedoId})`
      )
      .order("letrehozva", { ascending: true });

    setMessages(data || []);
  };

  // 🔥 Realtime listener
  useEffect(() => {
    if (!jegyszedoId || !adminId) return;

    fetchMessages();

    const channel = supabase
      .channel(`chat-jegyszedo-${jegyszedoId}-${adminId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "uzenetek" },
        payload => {
          const msg = payload.new;

          if (msg.kuldo_id === jegyszedoId) return;

          const isRelevant =
            (msg.kuldo_id === jegyszedoId && msg.fogado_id === adminId) ||
            (msg.kuldo_id === adminId && msg.fogado_id === jegyszedoId);

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
  }, [jegyszedoId, adminId]);

  // 🔥 Üzenet küldése
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now(),
      uzenet: input.trim(),
      kuldo_id: jegyszedoId,
      fogado_id: adminId,
      kuldo_szerep: "jegyszedo",
      fogado_szerep: "admin",
      letrehozva: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);

    await supabase.from("uzenetek").insert({
      kuldo_id: jegyszedoId,
      kuldo_szerep: "jegyszedo",
      fogado_id: adminId,
      fogado_szerep: "admin",
      uzenet: input.trim(),
      tipus: "manual",
      prioritas: 5,
      olvasott: false,
      letrehozva: new Date().toISOString()
    });

    setInput("");

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // 🔥 Üzenet buborék
  const renderMessage = ({ item }) => {
    const isJegyszedo = item.kuldo_id === jegyszedoId;

    return (
      <View
        style={[
          styles.messageBubble,
          isJegyszedo ? styles.jegyszedoBubble : styles.adminBubble
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
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
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

  jegyszedoBubble: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end"
  },

  adminBubble: {
    backgroundColor: "#e5e5ea",
    alignSelf: "flex-start"
  },

  messageText: {
    color: "#000",
    fontSize: 16
  },

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

  sendText: {
    color: "#fff",
    fontWeight: "bold"
  }
});
