import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../../lib/supabaseClient.js";

export default function AdminUzenetekScreen() {
  const [uzenetek, setUzenetek] = useState([]);
  const [felhasznalok, setFelhasznalok] = useState([]);
  const [ujUzenetModal, setUjUzenetModal] = useState(false);
  const [kivalasztottUser, setKivalasztottUser] = useState(null);
  const [uzenetSzoveg, setUzenetSzoveg] = useState("");
  const [showOlvasott, setShowOlvasott] = useState(false);

  const navigation = useNavigation();

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

    if (!error) setUzenetek(data);
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
    const { error } = await supabase
      .from("uzenetek")
      .update({ olvasott: true })
      .eq("id", id);

    if (error) {
      Alert.alert("Hiba", "Nem sikerült olvasottra állítani.");
      return;
    }

    fetchUzenetek();
  };

  // 🔵 Egyedi üzenet küldése (admin → user)
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
      letrehozva: new Date().toISOString()
    });

    setUzenetSzoveg("");
    setKivalasztottUser(null);
    setUjUzenetModal(false);
    fetchUzenetek();
  };

  return (
    <View style={styles.container}>

      {/* Fejléc + váltó ikon */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={styles.title}>💬 Üzenetek</Text>

        <TouchableOpacity onPress={() => setShowOlvasott((prev) => !prev)}>
          <Text style={{ fontSize: 28 }}>{showOlvasott ? "📥" : "📩"}</Text>
        </TouchableOpacity>
      </View>

      {/* Üzenetek listája */}
      <FlatList
        data={uzenetek}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            disabled={item.kuldo_szerep === "pultos"}
            onPress={() => {
              if (item.kuldo_szerep !== "pultos") {
                const partnerId = item.kuldo_szerep === "admin" ? item.fogado_id : item.kuldo_id;
                const partnerName = item.kuldo_szerep === "admin" ? item.fogado_nev?.nev : item.kuldo_nev?.nev;
                const partnerRole = item.kuldo_szerep === "admin" ? item.fogado_szerep : item.kuldo_szerep;

                navigation.navigate("AdminChat", {
                  userId: partnerId,
                  userName: partnerName,
                  userRole: partnerRole
                });
              }
            }}
          >
            <View style={[styles.messageCard, !item.olvasott && styles.unread]}>

              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <TouchableOpacity
                  onPress={() => jelolesOlvasottnak(item.id)}
                  style={styles.checkbox}
                >
                  {item.olvasott && <View style={styles.checkboxTick} />}
                </TouchableOpacity>

                <Text style={styles.messageHeader}>
                  {item.kuldo_nev?.nev} ({item.kuldo_szerep}) ➜ {item.fogado_nev?.nev}
                </Text>
              </View>

              <Text style={styles.messageText}>{item.uzenet}</Text>

              <Text style={styles.messageTime}>
                {new Date(item.letrehozva).toLocaleString()} • Prioritás: {item.prioritas}
              </Text>

            </View>
          </TouchableOpacity>
        )}
      />

      {/* Modal */}
      <Modal visible={ujUzenetModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Új üzenet küldése</Text>

            <Text style={styles.label}>Címzett:</Text>

            <FlatList
              data={felhasznalok}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.userItem,
                    kivalasztottUser?.id === item.id && styles.userSelected
                  ]}
                  onPress={() => setKivalasztottUser(item)}
                >
                  <Text style={styles.userText}>{item.nev} ({item.szerepkor})</Text>
                </TouchableOpacity>
              )}
            />

            <Text style={styles.label}>Üzenet:</Text>
            <TextInput
              style={styles.input}
              value={uzenetSzoveg}
              onChangeText={setUzenetSzoveg}
              placeholder="Írd ide az üzenetet..."
            />

            <TouchableOpacity style={styles.sendButton} onPress={kuldes}>
              <Text style={styles.sendText}>Küldés</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setUjUzenetModal(false)}>
              <Text style={styles.cancelText}>Mégse</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "bold" },

  messageCard: {
    backgroundColor: "#f2f2f2",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15
  },
  unread: { backgroundColor: "#d9eaff" },
  messageHeader: { fontWeight: "bold", marginBottom: 5 },
  messageText: { fontSize: 16 },
  messageTime: { fontSize: 12, color: "#666", marginTop: 5 },

  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#555",
    borderRadius: 4,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  checkboxTick: {
    width: 12,
    height: 12,
    backgroundColor: "#007AFF",
    borderRadius: 2,
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)"
  },
  modalBox: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 15,
    maxHeight: "90%"
  },
  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 15, textAlign: "center" },

  label: { marginTop: 10, fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 10,
    marginTop: 5
  },

  userItem: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#eee",
    marginVertical: 4
  },
  userSelected: { backgroundColor: "#cce0ff" },
  userText: { fontSize: 16 },

  sendButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 10,
    marginTop: 20
  },
  sendText: { color: "#fff", textAlign: "center", fontSize: 18 },

  cancelButton: { marginTop: 10 },
  cancelText: { textAlign: "center", color: "#666" }
});
