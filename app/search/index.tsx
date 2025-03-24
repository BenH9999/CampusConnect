// app/search/index.tsx
import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, TextInput, StyleSheet, FlatList, ActivityIndicator, Pressable } from "react-native";
import { useRouter } from "expo-router";
import ProfileButton from "@/components/ProfileButton";
import { BASE_URL } from "@/constants/api";

type UserResult = {
  username: string;
  display_name: string;
  profile_picture: string;
  email: string;
};

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) {
      setResults([]);
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/search/users?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Search failed");
      const data: UserResult[] = await response.json();
      setResults(data);
    } catch (err) {
      console.error("Error searching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [query]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.navTitle}>Search Users</Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search by username or display name"
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
        />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#FDC787" style={styles.centered} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.username}
          renderItem={({ item }) => (
            <ProfileButton
              username={item.username}
              display_name={item.display_name}
              profile_picture={item.profile_picture}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No users found.</Text>
            </View>
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F141E" },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161D2B",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backText: {
    color: "#FDC787",
    fontSize: 16,
    fontWeight: "700",
  },
  navTitle: {
    flex: 1,
    textAlign: "center",
    color: "#FDC787",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 40,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#161D2B",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    color: "#333",
  },
  listContainer: {
    padding: 16,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#2A3346",
  },
  resultPic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  resultPicPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#444",
  },
  resultTextContainer: {
    marginLeft: 12,
  },
  resultDisplayName: {
    color: "#FDC787",
    fontSize: 16,
    fontWeight: "800",
  },
  resultUsername: {
    color: "#ccc",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#FDC787",
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
