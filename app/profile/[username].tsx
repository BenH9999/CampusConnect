// app/profile/[username].tsx
import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, Image, ActivityIndicator, FlatList, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Post, { PostProps } from "@/components/Post";
import { useAuth } from "@/context/AuthContext";

const BASE_URL = "http://192.168.0.5:8080";

type ProfileData = {
  username: string;
  email: string;
  display_name: string;
  profile_picture: string;
  created_at: string;
  updated_at: string;
};

type PostData = {
  id: number;
  username: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
};

type ProfileResponse = {
  user: ProfileData;
  posts: PostData[];
};

const ProfileScreen = () => {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  const { user: loggedInUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!username) return;

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${BASE_URL}/api/profile?username=${encodeURIComponent(username)}`
        );
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data: ProfileResponse = await res.json();
        setProfile(data.user);

        const mappedPosts: PostProps[] = data.posts.map((post) => ({
          id: post.id,
          content: post.content,
          createdAt: post.created_at,
          likes_count: post.likes_count,
          comments_count: post.comments_count,
          username: data.user.username,
          display_name: data.user.display_name,
          profile_picture: data.user.profile_picture,
        }));
        setPosts(mappedPosts);
      } catch (err) {
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [username]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#FDC787" />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>Profile not found.</Text>
      </SafeAreaView>
    );
  }

  const isOwnProfile = loggedInUser?.username === profile.username;

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Bar with Back Button */}
      <View style={styles.navBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        {isOwnProfile && (
          <Pressable
            onPress={() => router.push(`/profile/${profile.username}/edit`)}
            style={styles.editProfileButton}
          >
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </Pressable>
        )}
      </View>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        {profile.profile_picture ? (
          <Image source={{ uri: profile.profile_picture }} style={styles.profilePic} />
        ) : (
          <View style={styles.profilePicPlaceholder} />
        )}
        <Text style={styles.displayName}>{profile.display_name}</Text>
        <Text style={styles.username}>@{profile.username}</Text>
        <Text style={styles.email}>{profile.email}</Text>
      </View>
      {/* Posts Section */}
      <View style={styles.postsHeader}>
        <Text style={styles.postsTitle}>Posts</Text>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <Post {...item} />}
        contentContainerStyle={styles.postsList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F141E" },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#161D2B",
    justifyContent: "space-between", // Space out the back button and edit button
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
  editProfileButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#FDC787",
    borderRadius: 6,
  },
  editProfileText: {
    color: "#161D2B",
    fontWeight: "700",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#FDC787",
    fontSize: 16,
  },
  profileHeader: {
    marginTop: 40,
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#161D2B",
    paddingBottom: 20,
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  profilePicPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#444",
    marginBottom: 10,
  },
  displayName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FDC787",
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: "#aaa",
  },
  postsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#161D2B",
  },
  postsTitle: {
    color: "#FDC787",
    fontSize: 18,
    fontWeight: "700",
  },
  postsList: {
    padding: 16,
  },
});

export default ProfileScreen;
