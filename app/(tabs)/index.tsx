// app/(tabs)/index.tsx
import React, { useCallback, useEffect, useState } from "react";
import { View, SafeAreaView, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Pressable } from "react-native";
import { useRouter } from "expo-router";
import Post, { PostProps } from "@/components/Post";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { BASE_URL } from "@/constants/api";

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handlePostLikeUpdate = useCallback((postId: number, newLikeCount: number, isLiked: boolean) => {
    setPosts(currentPosts => 
      currentPosts.map(post => 
        post.id === postId 
          ? {...post, likes_count: newLikeCount, isLiked: isLiked} 
          : post
      )
    );
  }, []);

  const fetchFeed = useCallback(async () => {
    if (!user?.username) return;
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/feed?username=${encodeURIComponent(user.username)}`);
      const data = await response.json();
      const feedData = Array.isArray(data) ? data : [];
      setPosts(feedData);
    } catch (err) {
      console.error("error fetching feed", err);
    } finally {
      setLoading(false);
    }
  }, [user?.username]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  if (!user) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>Please log in to see your feed</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header showSearch={true} />
      <View style={styles.newPostContainer}>
        <Pressable onPress={() => router.push("/post/write")} style={styles.newPostButton}>
          <Text style={styles.newPostText}>New Post</Text>
        </Pressable>
      </View>
      {loading && posts.length === 0 ? (
        <ActivityIndicator size="large" color="#FDC787" style={styles.centered} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <Post {...item} onLikeUpdate={handlePostLikeUpdate} />}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchFeed}
              tintColor="#FDC787"
            />
          }
          ListEmptyComponent={
            <SafeAreaView style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts to show.</Text>
            </SafeAreaView>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: { flex: 1, backgroundColor: "#0F141E" },
  newPostContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#161D2B",
  },
  newPostButton: {
    alignSelf: "flex-end",
    backgroundColor: "#FDC787",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  newPostText: {
    color: "#161D2B",
    fontWeight: "700",
  },
  listContainer: { paddingVertical: 8 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  emptyText: { color: "#FDC787", fontSize: 16 },
});
