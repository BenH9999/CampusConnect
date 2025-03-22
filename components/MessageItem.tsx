// components/MessageItem.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

export type MessageItemProps = {
  id: number;
  participant: {
    username: string;
    display_name: string;
    profile_picture: string;
  };
  lastMessage: {
    content: string;
    sender: string;
    created_at: string;
  };
  unreadCount: number;
  currentUser: string;
};

const MessageItem: React.FC<MessageItemProps> = ({ 
  id, 
  participant, 
  lastMessage, 
  unreadCount,
  currentUser
}) => {
  const router = useRouter();
  
  // Format timestamp to a relative time (e.g., "2h ago")
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return "just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  };

  const navigateToChat = () => {
    router.push({
      pathname: `/chat/[id]`,
      params: { id: id.toString() }
    });
  };

  // Determine if the last message is from the current user
  const isOwnMessage = lastMessage.sender === currentUser;
  
  // Truncate message content if it's too long
  const truncateContent = (content: string, maxLength = 30) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <Pressable
      style={[styles.container, unreadCount > 0 && styles.unreadContainer]}
      onPress={navigateToChat}
    >
      <View style={styles.avatarContainer}>
        {participant.profile_picture ? (
          <Image
            source={{ uri: `data:image/jpeg;base64,${participant.profile_picture}` }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {participant.display_name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.name}>{participant.display_name}</Text>
          <Text style={styles.time}>{formatRelativeTime(lastMessage.created_at)}</Text>
        </View>
        
        <View style={styles.messageContainer}>
          <Text 
            style={[
              styles.message, 
              unreadCount > 0 && styles.unreadMessage,
              isOwnMessage && styles.ownMessage
            ]}
            numberOfLines={1}
          >
            {isOwnMessage && "You: "}
            {truncateContent(lastMessage.content)}
          </Text>
          
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A3346",
    backgroundColor: "#161D2B",
  },
  unreadContainer: {
    backgroundColor: "#1E2635",
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2A3346",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: "#FDC787",
    fontSize: 22,
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#F5F5F5",
  },
  time: {
    fontSize: 12,
    color: "#aaa",
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  message: {
    fontSize: 14,
    color: "#aaa",
    flex: 1,
  },
  unreadMessage: {
    color: "#F5F5F5",
    fontWeight: "600",
  },
  ownMessage: {
    fontStyle: "italic",
  },
  badge: {
    backgroundColor: "#FDC787",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
    marginLeft: 8,
  },
  badgeText: {
    color: "#161D2B",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default MessageItem;

