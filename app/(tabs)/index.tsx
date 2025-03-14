// app/(tabs)/index.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import Post, { PostProps } from "@/components/Post";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";

const BASE_URL = "http://192.168.0.5:8080";

export default function HomeScreen() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!user?.username) return;

    const fetchFeed = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/api/feed?username=${encodeURIComponent(user.username)}`);
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        console.error("error fetching feed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [user?.username]);

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text>Please log in to see your feed</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      {loading ? (
        <ActivityIndicator size="large" color="#FDC787" />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <Post {...item} />}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F141E",
  },
  header: {
    backgroundColor: "#161D2B",
    marginTop: 5,
    padding: 16,
    alignItems: "flex-start",
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  listContainer: {
    paddingVertical: 8,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  username: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FDC787",
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  welcome: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
  },
});
