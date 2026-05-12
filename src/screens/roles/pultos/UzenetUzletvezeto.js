import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../../../lib/supabaseClient.js";

export default function UzenetUzletvezeto() {
  const [loading, setLoading] = useState(false);
  const [kivalasztott, setKivalasztott] = useState([]);

  const kategoriak = {
    Problema: [
      "Pénztár probléma",
      "Terminál hiba",
      "Problémás vendég",
      "Token kell"
    ],
    PapirValto: [
      "Papír váltó: 500 Ft",
      "Papír váltó: 1000 Ft",
      "Papír váltó: 2000 Ft",
      "Papír váltó: 5000 Ft"
    ],
    Apro: [
      "Apró váltó: 10 Ft",
      "Apró váltó: 20 Ft",
      "Apró váltó: 50 Ft",
      "Apró váltó: 100 Ft",
      "Apró váltó: 200 Ft"
    ]
  };

  const toggle = (uzenet) => {
    setKivalasztott((prev) =>
      prev.includes(uzenet)
        ? prev.filter((x) => x !== uzenet)
        : [...prev, uzenet]
    );
  };

  const brandCorrections = {
    sommersby: "Somersby",
    somersby: "Somersby",
    jager: "Jägermeister",
    jäger: "Jägermeister",
    jagermeister: "Jägermeister",
    absolut: "Absolut",
    finlandia: "Finlandia",
    bacardi: "Bacardi",
    captain: "Captain Morgan",
    captainmorgan: "Captain Morgan"
  };

  const helyesirasEllenorzes = (szoveg) => {
    return szoveg
      .split(" ")
      .map((w) => {
        const lower = w.toLowerCase();
        if (brandCorrections[lower]) return brandCorrections[lower];
        return w.charAt(0).toUpperCase() + w.slice(1);
      })
      .join(" ");
  };

  const getPrioritas = (szoveg) => {
    if (szoveg.includes("Problémás vendég")) return 1;
    if (szoveg.includes("Pénztár") || szoveg.includes("Terminál")) return 2;
    if (szoveg.includes("váltó") || szoveg.includes("apró")) return 3;
    return 5;
  };

  const kuldes = async () => {
    if (kivalasztott.length === 0) {
      Alert.alert("Hiba", "Válassz ki legalább egy üzenetet!");
      return;
    }

    setLoading(true);

    const user = (await supabase.auth.getUser()).data.user;

    const { data: admin } = await supabase
      .from("felhasznalok")
      .select("id")
      .eq("szerepkor", "admin")
      .single();

    const combined = kivalasztott.join("; ");
    const corrected = helyesirasEllenorzes(combined);
    const prioritas = getPrioritas(corrected);

    const { error } = await supabase.from("uzenetek").insert({
      kuldo_id: user?.id,
      kuldo_szerep: "pultos",
      fogado_id: admin?.id,
      fogado_szerep: "admin",
      uzenet: corrected,
      tipus: "auto",
      prioritas,
      olvasott: false
    });

    if (error) {
      Alert.alert("Hiba", error.message);
      setLoading(false);
      return;
    }

    setKivalasztott([]);
    setLoading(false);
    Alert.alert("Siker", "Üzenet elküldve az adminnak!");
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 70 }}>
      <View style={styles.container}>
        <Text style={styles.title}>🚨 Üzenet az üzletvezetőnek</Text>

        {Object.entries(kategoriak).map(([kategoria, lista]) => (
          <View key={kategoria}>
            <Text style={styles.subtitle}>
              {kategoria === "Problema" && "Problémák"}
              {kategoria === "PapirValto" && "Papírváltó kell"}
              {kategoria === "Apro" && "Apró kell"}
            </Text>

            {lista.map((uzenet) => (
              <TouchableOpacity
                key={uzenet}
                style={[
                  styles.option,
                  kivalasztott.includes(uzenet) && styles.selected
                ]}
                onPress={() => toggle(uzenet)}
              >
                <Text style={styles.optionText}>{uzenet}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <TouchableOpacity
          style={styles.kuldesGomb}
          disabled={loading}
          onPress={kuldes}
        >
          <Text style={styles.kuldesText}>Küldés az üzletvezetőnek</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f2f2f2" },
  title: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  subtitle: { fontSize: 20, fontWeight: "600", marginTop: 20, marginBottom: 10 },
  option: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10
  },
  selected: {
    backgroundColor: "#4CAF50"
  },
  optionText: {
    fontSize: 18,
    color: "#000"
  },
  kuldesGomb: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 10,
    marginTop: 20
  },
  kuldesText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold"
  }
});
