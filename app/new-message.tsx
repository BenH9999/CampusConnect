import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  Image,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BASE_URL } from '@/constants/api';

type Follower = {
  username: string;
  display_name: string;
  profile_picture: string;
};

export default function NewMessageScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [filteredFollowers, setFilteredFollowers] = useState<Follower[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<Follower | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user?.username) return;

    const fetchFollowers = async () => {
      try {
        console.log(`Fetching followers for ${user.username}`);
        const response = await fetch(`${BASE_URL}/api/followers?username=${encodeURIComponent(user.username)}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API Error (${response.status}):`, errorText);
          throw new Error(`Failed to fetch followers: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Followers fetched successfully:', data.length);
        setFollowers(data);
        setFilteredFollowers(data);
      } catch (error) {
        console.error('Error fetching followers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [user?.username]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredFollowers(followers);
    } else {
      const lowercasedFilter = searchTerm.toLowerCase();
      const filtered = followers.filter(follower =>
        follower.display_name.toLowerCase().includes(lowercasedFilter) ||
        follower.username.toLowerCase().includes(lowercasedFilter)
      );
      setFilteredFollowers(filtered);
    }
  }, [searchTerm, followers]);

  const handleUserSelect = (follower: Follower) => {
    setSelectedUser(follower);
  };

  const handleStartConversation = async () => {
    if (!user?.username || !selectedUser || !message.trim()) return;
    
    setSending(true);
    try {
      const response = await fetch(`${BASE_URL}/api/conversations/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creator: user.username,
          recipient: selectedUser.username,
          message: message.trim(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }
      
      const data = await response.json();
      router.replace({
        pathname: '/chat/[id]',
        params: { id: data.conversation_id.toString() }
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      setSending(false);
    }
  };

  if (!user) {
    router.replace('/');
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'New Message',
          headerBackTitle: 'Messages',
          headerTintColor: '#FDC787',
          headerStyle: {
            backgroundColor: '#161D2B',
          },
          headerTitleStyle: {
            color: '#F5F5F5',
          },
        }}
      />

      {selectedUser ? (
        <View style={styles.composeContainer}>
          <View style={styles.recipientCard}>
            <View style={styles.recipientInfo}>
              {selectedUser.profile_picture ? (
                <Image
                  source={{ uri: `data:image/jpeg;base64,${selectedUser.profile_picture}` }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {selectedUser.display_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View>
                <Text style={styles.displayName}>{selectedUser.display_name}</Text>
                <Text style={styles.username}>@{selectedUser.username}</Text>
              </View>
            </View>
            <Pressable onPress={() => setSelectedUser(null)} style={styles.changeButton}>
              <Text style={styles.changeButtonText}>Change</Text>
            </Pressable>
          </View>
          
          <View style={styles.messageInputContainer}>
            <TextInput
              style={styles.messageInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Write your message..."
              placeholderTextColor="#999"
              multiline
              autoFocus
            />
          </View>
          
          <Pressable
            style={[
              styles.sendButton,
              (!message.trim()) && styles.disabledButton
            ]}
            onPress={handleStartConversation}
            disabled={!message.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#161D2B" />
            ) : (
              <>
                <FontAwesome name="paper-plane" size={18} color="#161D2B" style={styles.sendIcon} />
                <Text style={styles.sendButtonText}>Send Message</Text>
              </>
            )}
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.searchContainer}>
            <FontAwesome name="search" size={16} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Search followers..."
              placeholderTextColor="#999"
              autoFocus
            />
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FDC787" />
            </View>
          ) : filteredFollowers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchTerm.trim() !== '' 
                  ? 'No followers match your search' 
                  : 'You have no followers yet'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredFollowers}
              keyExtractor={(item) => item.username}
              renderItem={({ item }) => (
                <Pressable 
                  style={styles.followerItem}
                  onPress={() => handleUserSelect(item)}
                >
                  {item.profile_picture ? (
                    <Image
                      source={{ uri: `data:image/jpeg;base64,${item.profile_picture}` }}
                      style={styles.followerAvatar}
                    />
                  ) : (
                    <View style={styles.followerAvatarPlaceholder}>
                      <Text style={styles.followerAvatarInitial}>
                        {item.display_name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.followerInfo}>
                    <Text style={styles.followerDisplayName}>{item.display_name}</Text>
                    <Text style={styles.followerUsername}>@{item.username}</Text>
                  </View>
                </Pressable>
              )}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F141E',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161D2B',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3346',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#F5F5F5',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
  followerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3346',
  },
  followerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  followerAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2A3346',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  followerAvatarInitial: {
    color: '#FDC787',
    fontSize: 22,
    fontWeight: 'bold',
  },
  followerInfo: {
    flex: 1,
  },
  followerDisplayName: {
    color: '#F5F5F5',
    fontSize: 16,
    fontWeight: 'bold',
  },
  followerUsername: {
    color: '#999',
    fontSize: 14,
  },
  composeContainer: {
    flex: 1,
    padding: 16,
  },
  recipientCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#161D2B',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A3346',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarInitial: {
    color: '#FDC787',
    fontSize: 18,
    fontWeight: 'bold',
  },
  displayName: {
    color: '#F5F5F5',
    fontSize: 16,
    fontWeight: 'bold',
  },
  username: {
    color: '#999',
    fontSize: 14,
  },
  changeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2A3346',
    borderRadius: 4,
  },
  changeButtonText: {
    color: '#FDC787',
    fontSize: 14,
  },
  messageInputContainer: {
    backgroundColor: '#161D2B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flex: 1,
  },
  messageInput: {
    color: '#F5F5F5',
    fontSize: 16,
    textAlignVertical: 'top',
    flex: 1,
  },
  sendButton: {
    backgroundColor: '#FDC787',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#2A3346',
  },
  sendIcon: {
    marginRight: 8,
  },
  sendButtonText: {
    color: '#161D2B',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 