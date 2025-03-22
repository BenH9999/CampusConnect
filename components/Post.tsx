// components/Post.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import ProfileButton from "@/components/ProfileButton";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useAuth } from "@/context/AuthContext";

const BASE_URL = "http://192.168.0.5:8080";

export type PostProps = {
  id: number;
  username: string;
  display_name?: string;
  profile_picture?: string;
  content?: string;
  created_at?: string;
  likes_count?: number;
  comments_count?: number;
  isLiked?: boolean;
  onLikeUpdate?: (postId: number, newLikeCount: number, isLiked: boolean) => void;
};

const Post: React.FC<PostProps> = ({
  id,
  username,
  display_name,
  profile_picture,
  content,
  likes_count = 0,
  comments_count = 0,
  isLiked: initialIsLiked,
  onLikeUpdate,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(likes_count);
  const [isLiked, setIsLiked] = useState(initialIsLiked || false);
  const [likeLoading, setLikeLoading] = useState(false);

  // Check if user has liked the post on initial load
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!user) return;
      
      try {
        const response = await fetch(`${BASE_URL}/api/posts/like/status?post_id=${id}&username=${user.username}`);
        if (response.ok) {
          const data = await response.json();
          setIsLiked(data.is_liked);
        }
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };
    
    checkLikeStatus();
  }, [id, user]);

  const handlePostPress = () => {
    router.push(`/post/${id}`);
  };

  const handleLike = async () => {
    if (!user || likeLoading) return;
    
    setLikeLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/posts/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          post_id: id,
          username: user.username 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setLikeCount(data.count);
        setIsLiked(data.is_liked);
        
        // Call the callback if provided
        if (onLikeUpdate) {
          onLikeUpdate(id, data.count, data.is_liked);
        }
      }
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setLikeLoading(false);
    }
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
      </Pressable>
      <View style={styles.footer}>
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.likeButton} 
            onPress={handleLike}
            disabled={likeLoading}
          >
            <FontAwesome 
              name={isLiked ? "heart" : "heart-o"} 
              size={20} 
              color={isLiked ? "#FDC787" : "#F5F5F5"} 
            />
          </TouchableOpacity>
          <Text style={styles.footerText}>{likeCount}</Text>
        </View>
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.commentButton} onPress={handlePostPress}>
            <FontAwesome name="comment-o" size={20} color="#F5F5F5" />
          </TouchableOpacity>
          <Text style={styles.footerText}>{comments_count}</Text>
        </View>
      </View>
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#161D2B",
    borderTopWidth: 1,
    borderTopColor: "#2A3346",
  },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  likeButton: {
    marginRight: 6,
    padding: 5,
  },
  commentButton: {
    marginRight: 6,
    padding: 5,
  },
  footerText: {
    fontSize: 14,
    color: "#F5F5F5",
  },
});

export default Post;
