// components/Post.tsx
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import ProfileButton from "@/components/ProfileButton";

export type PostProps = {
  id: number;
  username: string;
  display_name?: string;
  profile_picture?: string;
  content?: string;
  created_at?: string;
  likes_count?: number;
  comments_count?: number;
};

const Post: React.FC<PostProps> = ({
  id,
  username,
  display_name,
  profile_picture,
  content,
  likes_count = 0,
  comments_count = 0,
}) => {

  const router = useRouter();

  const handlePostPress = () => {
    router.push(`/post/${id}`);
  };

  return (
    <View style={styles.postContainer}>
      <Pressable onPress={() => { /* Navigate via ProfileButton logic inside it */ }}>
        <ProfileButton
          username={username}
          display_name={display_name}
          profile_picture={profile_picture}
        />
      </Pressable>
      <Pressable onPress={handlePostPress}>
        <View style={styles.content}>
          <Text style={styles.contentText}>{content}</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Likes: {likes_count}</Text>
          <Text style={styles.footerText}>Comments: {comments_count}</Text>
        </View>
      </Pressable>
    </View>
  );
};
const styles = StyleSheet.create({
  postContainer: {
    backgroundColor: "#161D2B",
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    backgroundColor: "#202837",
    padding: 12,
  },
  contentText: {
    fontSize: 16,
    color: "#F5F5F5",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#161D2B",
    borderTopWidth: 1,
    borderTopColor: "#2A3346",
  },
  footerText: {
    fontSize: 14,
    color: "#F5F5F5",
  },
});

export default Post;
