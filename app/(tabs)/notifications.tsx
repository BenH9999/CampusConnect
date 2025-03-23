// app/(tabs)/notifications.tsx
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, RefreshControl, SafeAreaView } from "react-native";
import { useAuth } from "@/context/AuthContext";
import NotificationItem, { NotificationProps } from "@/components/NotificationItem";
import Header from "@/components/Header";
import { BASE_URL } from "@/constants/api";

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user?.username) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/notifications?username=${encodeURIComponent(user.username)}`);
      const data = await response.json();
      
      // Debug logging
      console.log("Notifications data:", JSON.stringify(data, null, 2));
      if (data && data.length > 0) {
        console.log("First notification profile picture:", data[0].sender_profile_picture);
      }
      
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.username]);

  const markAsRead = async (id: number) => {
    try {
      await fetch(`${BASE_URL}/api/notifications/read?id=${id}`, {
        method: 'PUT',
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true } 
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.username) return;
    
    try {
      await fetch(`${BASE_URL}/api/notifications/read-all?username=${encodeURIComponent(user.username)}`, {
        method: 'PUT',
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  if (!user) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>Please log in to see your notifications</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Notifications" />
      
      {notifications.length > 0 && (
        <Pressable 
          style={styles.markAllButton} 
          onPress={markAllAsRead}
        >
          <Text style={styles.markAllText}>Mark all as read</Text>
        </Pressable>
      )}
      
      {loading ? (
        <ActivityIndicator style={styles.centered} size="large" color="#FDC787" />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <NotificationItem 
              {...item} 
              onMarkAsRead={markAsRead}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchNotifications}
              tintColor="#FDC787"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
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
  },
  markAllButton: {
    alignSelf: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  markAllText: {
    color: "#FDC787",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 50,
  },
  emptyText: {
    color: "#A0A0A0",
    fontSize: 16,
  },
}); 