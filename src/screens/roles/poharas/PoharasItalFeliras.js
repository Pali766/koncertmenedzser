import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { supabase } from "../../../lib/supabaseClient.js";

export default function PoharasItalFeliras({ navigation, route }) {
  const { sajatPultId, sajatPultNev } = route.params || {};

  const [italok, setItalok] = useState([]);
  const [pultok, setPultok] = useState([]);

  const [kereses, setKereses] = useState("");
  const [talalatok, setTalalatok] = useState([]);

  const [kivalasztottItal, setKivalasztottItal] = useState(null);
  const [mennyiseg, setMennyiseg] = useState(1);

  const [kivalasztottPultId, setKivalasztottPultId] = useState(sajatPultId);
  const [kivalasztottPultNev, setKivalasztottPultNev] = useState(sajatPultNev);

  const [felirtTetelek, setFelirtTetelek] = useState([]);

  const [pultValasztoNyitva, setPultValasztoNyitva] = useState(false);

  // --- Italok betöltése ---
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from("italok").select("*");
      if (error) {
        Alert.alert("Italok hiba", error.message);
        return;
      }
      setItalok(data || []);
    };
    load();
  }, []);

  // --- Pultok betöltése ---
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("pultok")
        .select("*")
        .eq("aktiv", true)
        .order("nev");

      if (error) {
        Alert.alert("Pultok hiba", error.message);
        return;
      }

      setPultok(data || []);
    };
    load();
  }, []);

  // --- Keresés ---
  useEffect(() => {
    if (!kereses.trim()) {
      setTalalatok([]);
      return;
    }

    const lower = kereses.toLowerCase();
    const filtered = italok.filter((i) =>
      (i.nev || "").toLowerCase().includes(lower)
    );

    setTalalatok(filtered);
  }, [kereses, italok]);

  // --- Tétel hozzáadása ---
  const hozzaad = async () => {
    if (!kivalasztottItal) {
      Alert.alert("Hiba", "Válassz italt a listából.");
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      Alert.alert("Hiba", "Nem sikerült azonosítani a felhasználót.");
      return;
    }

    const user = userData.user;

    const payload = {
      ital_id: kivalasztottItal.id,
      ital_nev: kivalasztottItal.nev,
      kategoria_id: kivalasztottItal.kategoria_id,
      pult_id: kivalasztottPultId,
      pult_nev: kivalasztottPultNev,
      mennyiseg,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from("pult_italigeny").insert(payload);

    if (error) {
      Alert.alert("Mentés hiba", error.message);
      return;
    }

    // 🔥 Felírt tételek listájába is bekerül
    setFelirtTetelek(prev => [
      ...prev,
      {
        id: Date.now(),
        ital: kivalasztottItal,
        mennyiseg,
        pultId: kivalasztottPultId,
        pultNev: kivalasztottPultNev,
        szin: "#007AFF"
      }
    ]);

    // sikeres mentés → ürítjük a mezőket
    setKivalasztottItal(null);
    setKereses("");
    setTalalatok([]);
    setMennyiseg(1);

    Alert.alert("Siker", "Ital hozzáadva!");
  };

  const torles = (id) => {
    setFelirtTetelek((elozo) => elozo.filter((t) => t.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍹 Ital felírás</Text>

      <Text style={{ marginBottom: 10 }}>
        Italok: {italok.length} | Pultok: {pultok.length} | Felírt tételek: {felirtTetelek.length}
      </Text>

      {/* Pult választó */}
      <Text style={styles.label}>Pult</Text>

      {!pultValasztoNyitva && (
        <View style={styles.dropdown}>
          <TouchableOpacity
            style={[
              styles.dropdownItem,
              {
                borderLeftColor: "red",
                borderLeftWidth: 6,
                backgroundColor: "#ffecec"
              }
            ]}
            onPress={() => setPultValasztoNyitva(true)}
          >
            <Text>{kivalasztottPultNev}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setPultValasztoNyitva(true)}>
            <Text style={styles.moreBtn}>További pultok</Text>
          </TouchableOpacity>
        </View>
      )}

      {pultValasztoNyitva && (
        <View style={styles.dropdown}>
          {pultok.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.dropdownItem,
                {
                  borderLeftColor: p.id === kivalasztottPultId ? "red" : "#ccc",
                  borderLeftWidth: 6,
                  backgroundColor: p.id === kivalasztottPultId ? "#ffecec" : "#fff"
                }
              ]}
              onPress={() => {
                setKivalasztottPultId(p.id);
                setKivalasztottPultNev(p.nev);
                setPultValasztoNyitva(false);
              }}
            >
              <Text>{p.nev}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Kereső */}
      <TextInput
        style={styles.input}
        placeholder="Keresés italra..."
        value={kereses}
        onChangeText={setKereses}
      />

      {/* Találatok */}
      {talalatok.length > 0 && (
        <View style={styles.dropdown}>
          {talalatok.map((i) => (
            <TouchableOpacity
              key={i.id}
              style={styles.dropdownItem}
              onPress={() => {
                setKivalasztottItal(i);
                setKereses(i.nev);
                setTalalatok([]);
              }}
            >
              <Text>{i.nev}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Mennyiség */}
      <View style={styles.row}>
        <TouchableOpacity onPress={() => setMennyiseg(Math.max(1, mennyiseg - 1))}>
          <Text style={styles.qtyBtn}>-</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.qtyInput}
          keyboardType="numeric"
          value={String(mennyiseg)}
          onChangeText={(v) => {
            const num = parseInt(v, 10);
            const safe = Number.isNaN(num) || num <= 0 ? 1 : num;
            setMennyiseg(safe);
          }}
        />

        <TouchableOpacity onPress={() => setMennyiseg(mennyiseg + 1)}>
          <Text style={styles.qtyBtn}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Hozzáadás */}
      <TouchableOpacity style={styles.addBtn} onPress={hozzaad}>
        <Text style={styles.addBtnText}>Hozzáadás</Text>
      </TouchableOpacity>

      {/* Felírt tételek */}
      <FlatList
        data={felirtTetelek}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.listItem,
              { borderLeftColor: item.szin, borderLeftWidth: 6 }
            ]}
          >
            <Text>
              {item.pultNev} – {item.ital.nev} – {item.mennyiseg} db
            </Text>
            <TouchableOpacity onPress={() => torles(item.id)}>
              <Text style={styles.delete}>Törlés</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Mentés */}
      <TouchableOpacity
        style={styles.saveBtn}
        onPress={() =>
          navigation.navigate("PoharasOsszegzes", {
            sajatPultId,
            sajatPultNev
          })
        }
      >
        <Text style={styles.saveBtnText}>Indulok a raktárba</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 5 },

  input: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10
  },

  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 3,
    marginBottom: 10
  },

  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },

  moreBtn: {
    padding: 10,
    textAlign: "center",
    color: "#007AFF",
    fontWeight: "600"
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10
  },

  qtyBtn: {
    fontSize: 28,
    paddingHorizontal: 20
  },

  qtyInput: {
    width: 60,
    textAlign: "center",
    fontSize: 22,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 6,
    marginHorizontal: 10
  },

  addBtn: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10
  },

  addBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  listItem: {
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between"
  },

  delete: { color: "red", fontWeight: "bold" },

  saveBtn: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10
  },

  saveBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" }
});
