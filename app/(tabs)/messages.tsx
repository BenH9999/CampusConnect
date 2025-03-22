// app/(tabs)/messages.tsx
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, RefreshControl, SafeAreaView } from "react-native";
import { useAuth } from "@/context/AuthContext";
import MessageItem from "@/components/MessageItem";
import Header from "@/components/Header";
import { useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { BASE_URL } from "@/constants/api";

type Participant = {
  username: string;
  display_name: string;
  profile_picture: string;
};

type LastMessage = {
  id: number;
  conversation_id: number;
  sender: string;
  content: string;
  created_at: string;
  read: boolean;
};

type ConversationPreview = {
  id: number;
  participants: Participant[];
  last_message: LastMessage;
  unread_count: number;
};

export default function MessagesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!user?.username) return;
    
    try {
      console.log(`Fetching conversations for ${user.username}`);
      const response = await fetch(`${BASE_URL}/api/conversations?username=${encodeURIComponent(user.username)}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}):`, errorText);
        throw new Error(`Failed to fetch conversations: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Conversations fetched successfully:', data.length);
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.username]);

  useEffect(() => {
    fetchConversations();
    
    // Set up polling for new messages
    const intervalId = setInterval(fetchConversations, 10000);
    
    return () => clearInterval(intervalId);
  }, [fetchConversations]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchConversations();
  }, [fetchConversations]);

  const handleNewMessage = () => {
    router.push({
      pathname: "/new-message"
    });
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Messages" />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Please log in to view messages</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Messages" 
        rightComponent={
          <Pressable onPress={handleNewMessage} style={styles.newMessageButton}>
            <FontAwesome name="pencil-square-o" size={22} color="#FDC787" />
          </Pressable>
        }
      />
      
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FDC787" />
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No messages yet</Text>
          <Pressable style={styles.startButton} onPress={handleNewMessage}>
            <Text style={styles.startButtonText}>Start a conversation</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MessageItem
              id={item.id}
              participant={item.participants[0]} // Assuming the first participant is the other user
              lastMessage={{
                content: item.last_message.content,
                sender: item.last_message.sender,
                created_at: item.last_message.created_at
              }}
              unreadCount={item.unread_count}
              currentUser={user.username}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#FDC787"]}
              tintColor="#FDC787"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F141E",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#FDC787",
    fontSize: 16,
    textAlign: "center",
  },
  emptyText: {
    color: "#F5F5F5",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  startButton: {
    backgroundColor: "#FDC787",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  startButtonText: {
    color: "#161D2B",
    fontWeight: "bold",
    fontSize: 16,
  },
  newMessageButton: {
    padding: 10,
  },
});

