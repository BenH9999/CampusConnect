import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';

export type NotificationType = 'like' | 'comment' | 'follow';

export interface NotificationProps {
  id: number;
  username: string;
  sender_name: string;
  sender_display_name: string;
  sender_profile_picture: string;
  type: NotificationType;
  message: string;
  post_id?: number;
  comment_id?: number;
  read: boolean;
  created_at: string;
  onMarkAsRead: (id: number) => void;
}

export default function NotificationItem({ 
  id, 
  sender_name, 
  sender_display_name, 
  sender_profile_picture, 
  type, 
  message, 
  post_id, 
  created_at, 
  read,
  onMarkAsRead
}: NotificationProps) {
  const router = useRouter();
  
  // Format the time (e.g., "3 hours ago")
  const formattedTime = formatDistanceToNow(new Date(created_at), { addSuffix: true });
  
  // Get the notification icon based on type
  const getIcon = () => {
    switch (type) {
      case 'like':
        return <FontAwesome name="heart" size={16} color="#FDC787" />;
      case 'comment':
        return <FontAwesome name="comment" size={16} color="#FDC787" />;
      case 'follow':
        return <FontAwesome name="user-plus" size={16} color="#FDC787" />;
      default:
        return <FontAwesome name="bell" size={16} color="#FDC787" />;
    }
  };
  
  // Handle notification click based on type
  const handlePress = () => {
    // Mark as read if not already
    if (!read) {
      onMarkAsRead(id);
    }
    
    // Navigate based on notification type
    switch (type) {
      case 'like':
      case 'comment':
        if (post_id) {
          router.push(`/post/${post_id}`);
        }
        break;
      case 'follow':
        router.push(`/profile/${sender_name}`);
        break;
    }
  };

  const renderProfileImage = () => {
    if (!sender_profile_picture) {
      return (
        <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
          <Text style={styles.profileImagePlaceholderText}>
            {sender_display_name.charAt(0).toUpperCase()}
          </Text>
        </View>
      );
    }

    // Check if it's already a data URI
    const imageUri = sender_profile_picture.startsWith('data:')
      ? sender_profile_picture
      : `data:image/png;base64,${sender_profile_picture}`;

    return (
      <Image 
        source={{ uri: imageUri }} 
        style={styles.profileImage}
        onError={() => console.log(`Failed to load notification image for ${sender_name}`)}
      />
    );
  };

  return (
    <TouchableOpacity
      style={[styles.container, !read && styles.unread]}
      onPress={handlePress}
    >
      <View style={styles.iconContainer}>
        {getIcon()}
      </View>
      <View style={styles.profileImageContainer}>
        {renderProfileImage()}
      </View>
      <View style={styles.content}>
        <Text style={styles.message}>
          <Text style={styles.name}>{sender_display_name}</Text> {message}
        </Text>
        <Text style={styles.time}>{formattedTime}</Text>
      </View>
      {!read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#243040',
    backgroundColor: '#161D2B',
  },
  unread: {
    backgroundColor: '#1A2436',
  },
  iconContainer: {
    marginRight: 12,
    width: 20,
    alignItems: 'center',
  },
  profileImageContainer: {
    marginRight: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#243040',
  },
  profileImagePlaceholder: {
    backgroundColor: '#243040',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    color: '#A0A0A0',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  message: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 4,
    flexShrink: 1,
  },
  name: {
    fontWeight: '600',
    color: '#FDC787',
  },
  time: {
    color: '#A0A0A0',
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FDC787',
    marginLeft: 10,
  },
}); 