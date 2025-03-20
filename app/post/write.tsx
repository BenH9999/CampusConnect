import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";

const BASE_URL = "http://192.168.0.5:8080";

export default function WritePostScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert("Error", "Post content cannot be empty");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/posts/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user?.username,
          content,
        }),
      });
      if (!response.ok) throw new Error("Post creation failed");
      Alert.alert("Success", "Post created", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error("Error creating post:", err);
      Alert.alert("Error", "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.navTitle}>New Post</Text>
      </View>
      <View style={styles.form}>
        <TextInput
          style={styles.textArea}
          placeholder="What's on your mind?"
          placeholderTextColor="#888"
          value={content}
          onChangeText={setContent}
          multiline
        />
        <Pressable onPress={handlePost} style={styles.postButton} disabled={loading}>
          <Text style={styles.postButtonText}>
            {loading ? "Posting..." : "Post"}
          </Text>
        </Pressable>
      </View>
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
  backButton: { paddingVertical: 4, paddingHorizontal: 8 },
  backText: { color: "#FDC787", fontSize: 16, fontWeight: "700" },
  navTitle: {
    flex: 1,
    textAlign: "center",
    color: "#FDC787",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 40,
  },
  form: { padding: 16 },
  textArea: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    color: "#333",
    height: 150,
    textAlignVertical: "top",
  },
  postButton: {
    backgroundColor: "#FDC787",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  postButtonText: { color: "#161D2B", fontWeight: "700" },
});
