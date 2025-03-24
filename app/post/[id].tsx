// app/post/[id].tsx
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TextInput,
  Pressable,
  TouchableOpacity,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import ProfileButton from "@/components/ProfileButton";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { BASE_URL } from "@/constants/api";

type PostDetail = {
  id: number;
  username: string;
  display_name: string;
  profile_picture: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
};

type CommentDetail = {
  id: number;
  post_id: number;
  username: string;
  display_name: string;
  profile_picture: string;
  content: string;
  created_at: string;
};

type ViewPostResponse = {
  post: PostDetail;
  comments: CommentDetail[];
};

export default function ViewPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<CommentDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/api/posts/view?id=${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error("Failed to fetch post");
        const data: ViewPostResponse = await res.json();
        setPost(data.post);
        setLikeCount(data.post.likes_count);
        // Ensure comments defaults to an empty array if none
        setComments(data.comments || []);
      } catch (err) {
        console.error("Error fetching post details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPostDetails();
  }, [id]);

  const handleLike = async () => {
    if (!user || !post || likeLoading) return;
    
    setLikeLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/posts/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          post_id: post.id,
          username: user.username 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setLikeCount(data.count);
        setIsLiked(data.is_liked);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      setPostingComment(true);
      const res = await fetch(`${BASE_URL}/api/comments/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: post?.id,
          username: user?.username,
          content: commentText,
        }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      const newComment: CommentDetail = await res.json();
      setComments((prev) => [...prev, newComment]);
      setCommentText("");
    } catch (err) {
      console.error("Error posting comment:", err);
    } finally {
      setPostingComment(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <ActivityIndicator size="large" color="#FDC787" />
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Post not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Nav Bar with Back Button */}
      <View style={styles.navBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>
      <View style={styles.contentContainer}>
        <ProfileButton
          username={post.username}
          display_name={post.display_name}
          profile_picture={post.profile_picture}
        />
        <Text style={styles.postContent}>{post.content}</Text>
        <Text style={styles.postInfo}>
          Posted by {post.display_name} (@{post.username}) on {new Date(post.created_at).toLocaleString()}
        </Text>
        
        {/* Like Button */}
        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.likeButton} 
            onPress={handleLike}
            disabled={likeLoading}
          >
            <FontAwesome 
              name={isLiked ? "heart" : "heart-o"} 
              size={22} 
              color={isLiked ? "#FDC787" : "#F5F5F5"} 
            />
            <Text style={styles.likeText}>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.separator} />
        <Text style={styles.commentsTitle}>Comments</Text>
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.commentItem}>
              {item.profile_picture ? (
                <Image source={{ uri: item.profile_picture }} style={styles.commentPic} />
              ) : (
                <View style={styles.commentPicPlaceholder} />
              )}
              <View style={styles.commentTextContainer}>
                <Text style={styles.commentUser}>
                  {item.display_name || item.username}:
                </Text>
                <Text style={styles.commentContent}>{item.content}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No comments yet.</Text>
            </View>
          }
          contentContainerStyle={styles.commentsList}
        />
        <View style={styles.commentForm}>
          <TextInput
            style={styles.commentInput}
            placeholder="Write a comment..."
            placeholderTextColor="#888"
            value={commentText}
            onChangeText={setCommentText}
          />
          <Pressable onPress={handleComment} style={styles.commentButton} disabled={postingComment}>
            <Text style={styles.commentButtonText}>{postingComment ? "Posting..." : "Post"}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

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
  contentContainer: { padding: 16 },
  postContent: { fontSize: 18, color: "#F5F5F5", marginBottom: 8 },
  postInfo: { fontSize: 14, color: "#ccc", marginBottom: 16 },
  postActions: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 16,
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  likeText: {
    color: "#F5F5F5",
    marginLeft: 8,
    fontSize: 16,
  },
  separator: { borderBottomWidth: 1, borderBottomColor: "#2A3346", marginBottom: 16 },
  commentsTitle: { fontSize: 18, color: "#FDC787", fontWeight: "700", marginBottom: 8 },
  commentsList: { paddingBottom: 16 },
  commentItem: { flexDirection: "row", marginBottom: 8, alignItems: "center" },
  commentPic: { width: 40, height: 40, borderRadius: 20 },
  commentPicPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#444" },
  commentTextContainer: { marginLeft: 8 },
  commentUser: { color: "#FDC787", fontSize: 14, fontWeight: "800" },
  commentContent: { color: "#F5F5F5", fontSize: 14 },
  emptyContainer: { alignItems: "center", padding: 20 },
  emptyText: { color: "#FDC787", fontSize: 16 },
  commentForm: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  commentInput: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    color: "#333",
  },
  commentButton: {
    backgroundColor: "#FDC787",
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  commentButtonText: { color: "#161D2B", fontWeight: "700" },
});
