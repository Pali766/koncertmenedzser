import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../../../lib/supabaseClient.js";

export default function PultosFooldal({ navigation, route }) {

  const { pultId } = route.params;

  const [uzenetek, setUzenetek] = useState([]);

  // 🔥 Pultos user ID lekérése
  const getUserId = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    return user?.id;
  };

  // 🔥 Üzenetek lekérése (csak a pultosnak küldött üzenetek)
  const fetchUzenetek = async () => {
    const pultosUserId = await getUserId();

    const { data, error } = await supabase
      .from("uzenetek")
      .select(`
        id,
        uzenet,
        tipus,
        prioritas,
        olvasott,
        letrehozva,
        kuldo:felhasznalok!uzenetek_kuldo_id_fkey(id, nev, szerepkor)?,
        fogado:felhasznalok!uzenetek_fogado_id_fkey(id, nev, szerepkor)?,
        kuldo_id,
        fogado_id
      `)
      .eq("fogado_id", pultosUserId)
      .order("prioritas", { ascending: true })
      .order("letrehozva", { ascending: false });

    if (!error) setUzenetek(data);
  };

  // 🔥 Realtime frissítés
  useEffect(() => {
    fetchUzenetek();

    const channel = supabase
      .channel("pultos-uzenetek")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "uzenetek" },
        () => fetchUzenetek()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // 🔵 Üzenet olvasottra állítása
  const jelolesOlvasottnak = async (id) => {
    await supabase
      .from("uzenetek")
      .update({ olvasott: true })
      .eq("id", id);

    fetchUzenetek();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍹 Pultos felület</Text>

      <View style={styles.cardContainer}>

        {/* Üzenet az üzletvezetőnek */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("UzenetUzletvezeto", { pultId })}
        >
          <Text style={styles.icon}>🚨</Text>
          <Text style={styles.cardText}>Üzenet az üzletvezetőnek</Text>
        </TouchableOpacity>

      </View>

      {/* Beérkező üzenetek */}
      <Text style={styles.subtitle}>📨 Beérkező üzenetek</Text>

      <FlatList
        data={uzenetek}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => jelolesOlvasottnak(item.id)}
          >
            <View style={[styles.messageCard, !item.olvasott && styles.unread]}>
              <Text style={styles.messageHeader}>
                {item.kuldo?.nev} ({item.kuldo?.szerepkor})
              </Text>

              <Text style={styles.messageText}>{item.uzenet}</Text>

              <Text style={styles.messageTime}>
                {new Date(item.letrehozva).toLocaleString()} • Prioritás: {item.prioritas}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create
