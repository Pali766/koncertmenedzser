import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabaseClient.js';

export default function SzerepkorLista({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [szerepkorok, setSzerepkorok] = useState([]);

  const loadRoles = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('szerepkorok')
      .select('*')
      .order('nev', { ascending: true });

    if (!error) {
      setSzerepkorok(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    // Frissítés minden visszatéréskor
    const unsubscribe = navigation.addListener("focus", loadRoles);
    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.roleCard}
      onPress={() => navigation.navigate("SzerepkorLetrehozas", { szerepkor: item })}
    >
      <Text style={styles.roleName}>{item.nev}</Text>
      <Text style={styles.editText}>Szerkesztés ➜</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 Szerepkörök listája</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={szerepkorok}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff"
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20
  },
  roleCard: {
    backgroundColor: "#f2f2f2",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12
  },
  roleName: {
    fontSize: 18,
    fontWeight: "600"
  },
  editText: {
    marginTop: 6,
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500"
  }
});
