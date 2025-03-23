import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { BASE_URL } from "@/constants/api";

type Message = {
  id: number;
  conversation_id: number;
  sender: string;
  content: string;
  created_at: string;
  read: boolean;
};

type Participant = {
  username: string;
  display_name: string;
  profile_picture: string;
};

export default function ChatScreen() {
  const { user } = useAuth();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);
  
  const conversationId = typeof id === "string" ? parseInt(id) : 0;

  // Keep track of previous messages to prevent unnecessary updates
  const previousMessagesRef = useRef<Message[]>([]);

  const fetchMessages = useCallback(async () => {
    if (!user?.username || !conversationId) return;
    
    try {
      const showLoader = messages.length === 0 && loading;
      if (showLoader) {
        setLoading(true);
      }
      
      const response = await fetch(
        `${BASE_URL}/api/messages?conversation_id=${conversationId}&username=${encodeURIComponent(user.username)}`
      );
      
      if (!response.ok) {
        console.error(`Failed to fetch messages: ${response.status}`);
        throw new Error("Failed to fetch messages");
      }
      
      const data = await response.json();
      
      // Only update messages if they've changed
      const hasNewMessages = data.length !== previousMessagesRef.current.length || 
        JSON.stringify(data) !== JSON.stringify(previousMessagesRef.current);
      
      if (hasNewMessages) {
        previousMessagesRef.current = data;
        setMessages(data);
      }
      
      // Only fetch participant info if we don't have it yet
      if (!participant) {
        // Fetch participant info
        let otherUsername = null;
        
        // First try to get the other username from messages
        if (data.length > 0) {
          const messageSenders = [...new Set(data.map((m: Message) => m.sender))];
          
          // If there are two senders and one is the current user
          if (messageSenders.length === 2 && messageSenders.includes(user.username)) {
            otherUsername = messageSenders.find(sender => sender !== user.username) || null;
          } 
          // If there's only one sender and it's not the current user
          else if (messageSenders.length === 1 && messageSenders[0] !== user.username) {
            otherUsername = messageSenders[0];
          }
          // Otherwise, need to fetch from participants
          else {
            otherUsername = await getOtherParticipant(conversationId, user.username);
          }
        } else {
          otherUsername = await getOtherParticipant(conversationId, user.username);
        }
            
        if (otherUsername) {
          const participantResponse = await fetch(
            `${BASE_URL}/api/profile?username=${encodeURIComponent(String(otherUsername))}`
          );
          
          if (participantResponse.ok) {
            const participantData = await participantResponse.json();
            
            // Check if we have the actual user object
            const userData = participantData.user || participantData;
            
            setParticipant({
              username: userData.username,
              display_name: userData.display_name || userData.username,
              profile_picture: userData.profile_picture || "",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      if (loading) {
        setLoading(false);
      }
    }
  }, [user?.username, conversationId, participant, messages.length, loading]);

  // Helper function to get the other participant in a conversation
  const getOtherParticipant = async (conversationId: number, username: string): Promise<string | null> => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/conversations?username=${encodeURIComponent(username)}`
      );
      
      if (!response.ok) {
        console.error(`Failed to fetch conversations: ${response.status}`);
        return null;
      }
      
      const conversations = await response.json();
      
      const conversation = conversations.find((c: any) => c.id === conversationId);
      
      if (conversation && conversation.participants && conversation.participants.length > 0) {
        // Filter out the current user to get the other participant
        const otherParticipants = conversation.participants.filter(
          (p: any) => p.username !== username
        );
        
        if (otherParticipants.length > 0) {
          return otherParticipants[0].username;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching other participant:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchMessages();
    
    // Set up polling for new messages - reduced from 3000ms to 5000ms to be less jarring
    const intervalId = setInterval(fetchMessages, 5000);
    
    return () => clearInterval(intervalId);
  }, [fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!user?.username || !inputText.trim() || !conversationId) return;
    
    const trimmedText = inputText.trim();
    setInputText("");
    
    try {
      const response = await fetch(`${BASE_URL}/api/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          sender: user.username,
          content: trimmedText,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      
      // Add the new message immediately for better UX
      const newMessage = await response.json();
      setMessages((prev) => [...prev, newMessage]);
      
      // Force scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      // Restore input text if send fails
      setInputText(trimmedText);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  // Group messages by date
  const groupedMessages = () => {
    const groups: { date: string; messages: Message[] }[] = [];
    
    messages.forEach((message) => {
      const messageDate = formatDate(message.created_at);
      const existingGroup = groups.find((group) => group.date === messageDate);
      
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({ date: messageDate, messages: [message] });
      }
    });
    
    return groups;
  };
  
  // Custom header component with profile picture
  const renderProfileHeader = () => {
    if (!participant) return <Text style={styles.headerDisplayName}>Chat</Text>;
    
    return (
      <View style={styles.headerContainer}>
        {participant.profile_picture ? (
          <Image
            source={{ 
              uri: participant.profile_picture.startsWith('data:') 
                ? participant.profile_picture 
                : `data:image/jpeg;base64,${participant.profile_picture}` 
            }}
            style={styles.avatarHeader}
          />
        ) : (
          <View style={styles.avatarPlaceholderHeader}>
            <Text style={styles.avatarInitialHeader}>
              {participant.display_name && participant.display_name.length > 0 
                ? participant.display_name.charAt(0).toUpperCase() 
                : "?"}
            </Text>
          </View>
        )}
        <Text style={styles.headerDisplayName}>{participant.display_name || "Chat"}</Text>
      </View>
    );
  };

  if (!user) {
    router.replace("/");
    return null;
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: participant?.display_name || "Chat",
          headerTitle: renderProfileHeader,
          headerLeft: () => (
            <Pressable 
              style={styles.backButton} 
              onPress={() => router.back()}
            >
              <FontAwesome name="angle-left" size={24} color="#FDC787" />
            </Pressable>
          ),
          headerTitleAlign: "center",
        }}
      />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FDC787" />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={groupedMessages()}
              keyExtractor={(item) => item.date}
              renderItem={({ item: group }) => (
                <View>
                  <View style={styles.dateHeaderContainer}>
                    <Text style={styles.dateHeader}>{group.date}</Text>
                  </View>
                  {group.messages.map((message: Message) => (
                    <View
                      key={message.id}
                      style={[
                        styles.messageContainer,
                        message.sender === user.username
                          ? styles.sentMessage
                          : styles.receivedMessage,
                      ]}
                    >
                      <View
                        style={[
                          styles.messageBubble,
                          message.sender === user.username
                            ? styles.sentBubble
                            : styles.receivedBubble,
                        ]}
                      >
                        <Text 
                          style={[
                            styles.messageText,
                            message.sender === user.username
                              ? styles.sentMessageText
                              : styles.receivedMessageText
                          ]}
                        >
                          {message.content}
                        </Text>
                        <Text style={styles.timeText}>{formatTime(message.created_at)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
              contentContainerStyle={styles.messagesContainer}
            />
          )}
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              multiline
            />
            <Pressable
              style={[styles.sendButton, !inputText.trim() && styles.disabledSendButton]}
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <FontAwesome name="send" size={20} color={inputText.trim() ? "#161D2B" : "#999"} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F141E",
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesContainer: {
    flexGrow: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  dateHeaderContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  dateHeader: {
    color: "#999",
    fontSize: 12,
    backgroundColor: "rgba(22, 29, 43, 0.8)",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: "80%",
  },
  sentMessage: {
    alignSelf: "flex-end",
  },
  receivedMessage: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: 18,
    position: "relative",
  },
  sentBubble: {
    backgroundColor: "#FDC787",
  },
  receivedBubble: {
    backgroundColor: "#2A3346",
  },
  messageText: {
    fontSize: 16,
  },
  sentMessageText: {
    color: "#161D2B",
  },
  receivedMessageText: {
    color: "#F5F5F5",
  },
  timeText: {
    fontSize: 10,
    color: "rgba(0, 0, 0, 0.5)",
    position: "absolute",
    bottom: 4,
    right: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#161D2B",
    borderTopWidth: 1,
    borderTopColor: "#2A3346",
    marginBottom: Platform.OS === "ios" ? 8 : 0,
  },
  input: {
    flex: 1,
    backgroundColor: "#2A3346",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    color: "#F5F5F5",
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#FDC787",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  disabledSendButton: {
    backgroundColor: "#2A3346",
  },
  // Header styles
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarHeader: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  avatarPlaceholderHeader: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#2A3346",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarInitialHeader: {
    color: "#FDC787",
    fontSize: 16,
    fontWeight: "bold",
  },
  headerDisplayName: {
    color: "#F5F5F5",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
}); 