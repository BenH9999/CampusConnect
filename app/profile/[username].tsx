// app/profile/[username].tsx
import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView, View, Text, StyleSheet, Image, ActivityIndicator, FlatList, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Post, { PostProps } from "@/components/Post";
import { useAuth } from "@/context/AuthContext";
import { BASE_URL } from "@/constants/api";


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
  const { user: loggedInUser, logout } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followLoading, setFollowLoading] = useState<boolean>(false);

  const isOwnProfile = loggedInUser?.username === profile?.username;

  const handlePostLikeUpdate = useCallback((postId: number, newLikeCount: number, isLiked: boolean) => {
    setPosts(currentPosts => 
      currentPosts.map(post => 
        post.id === postId 
          ? {...post, likes_count: newLikeCount, isLiked: isLiked} 
          : post
      )
    );
  }, []);

  const fetchProfileData = useCallback(async () => {
    if (!username) return;
    try {
      setLoading(true);
      const res = await fetch(
        `${BASE_URL}/api/profile?username=${encodeURIComponent(username)}`
      );
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data: ProfileResponse = await res.json();
      const postsData = Array.isArray(data.posts) ? data.posts : [];
      setProfile(data.user);
      const mappedPosts: PostProps[] = postsData.map((p) => ({
        id: p.id,
        content: p.content,
        createdAt: p.created_at,
        likes_count: p.likes_count,
        comments_count: p.comments_count,
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
  }, [username]);

  const fetchFollowStatus = useCallback(async () => {
    if (!loggedInUser || isOwnProfile) return;
    try {
      const res = await fetch(
        `${BASE_URL}/api/follow/status?follower=${encodeURIComponent(
          loggedInUser.username
        )}&following=${encodeURIComponent(username)}`
      );
      if (!res.ok) throw new Error("Failed to fetch follow status");
      const data = await res.json();
      setIsFollowing(data.isFollowing);
    } catch (err) {
      console.error("Error fetching follow status:", err);
    }
  }, [loggedInUser, isOwnProfile, username]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  useEffect(() => {
    fetchFollowStatus();
  }, [fetchFollowStatus]);

  const toggleFollow = async () => {
    if (!loggedInUser || isOwnProfile) return;
    setFollowLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/follow/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          follower: loggedInUser.username,
          following: username,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to toggle follow");
      }
      const data = await response.json();
      setIsFollowing(data.isFollowing);
    } catch (err) {
      console.error("Error toggling follow:", err);
    } finally {
      setFollowLoading(false);
    }
  };

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        {isOwnProfile ? (
          <View style={styles.ownProfileButtons}>
            <Pressable
              onPress={() => router.push(`/profile/${profile.username}/edit`)}
              style={styles.editProfileButton}
            >
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </Pressable>
            <Pressable onPress={logout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/post/write")} style={styles.newPostButton}>
              <Text style={styles.newPostText}>New Post</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={toggleFollow}
            style={[styles.followButton, followLoading && styles.disabledButton]}
          >
            <Text style={styles.followButtonText}>
              {followLoading
                ? "Loading..."
                : isFollowing
                  ? "Unfollow"
                  : "Follow"}
            </Text>
          </Pressable>
        )}
      </View>
      <View style={styles.profileHeader}>
        {profile.profile_picture ? (
          <Image 
            source={{ uri: profile.profile_picture }} 
            style={styles.profilePic}
          />
        ) : (
          <View style={styles.profilePicPlaceholder}>
            <Text style={styles.placeholderText}>
              {profile.display_name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={styles.displayName}>{profile.display_name}</Text>
        <Text style={styles.username}>@{profile.username}</Text>
        <Text style={styles.email}>{profile.email}</Text>
      </View>
      <View style={styles.postsHeader}>
        <Text style={styles.postsTitle}>Posts</Text>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Post 
            {...item} 
            onLikeUpdate={handlePostLikeUpdate}
          />
        )}
        contentContainerStyle={styles.postsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts to show.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F141E" },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#161D2B",
    justifyContent: "space-between",
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
  ownProfileButtons: {
    flexDirection: "row",
  },
  editProfileButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#FDC787",
    borderRadius: 6,
    marginRight: 8,
  },
  editProfileText: {
    color: "#161D2B",
    fontWeight: "700",
  },
  logoutButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#FDC787",
    borderRadius: 6,
  },
  logoutText: {
    color: "#161D2B",
    fontWeight: "700",
  },
  followButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: "#FDC787",
    borderRadius: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  followButtonText: {
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
  profilePic: { width: 100, height: 100, borderRadius: 50 },
  profilePicPlaceholder: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: "#444",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#FDC787",
    fontSize: 32,
    fontWeight: "bold",
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
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#FDC787",
    fontSize: 16,
  },
  newPostButton: { alignSelf: "flex-end", backgroundColor: "#FDC787", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  newPostText: { color: "#161D2B", fontWeight: "700" },
});

export default ProfileScreen;
