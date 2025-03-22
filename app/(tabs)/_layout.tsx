// app/(tabs)/_layout.tsx
import React, { useEffect, useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { BASE_URL } from "@/constants/api";

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string; }) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { user } = useAuth();
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  
  // Fetch unread notifications count
  useEffect(() => {
    if (!user?.username) return;
    
    const fetchUnreadNotificationsCount = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/notifications/unread-count?username=${encodeURIComponent(user.username)}`);
        const data = await response.json();
        setUnreadNotificationsCount(data.count);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };
    
    fetchUnreadNotificationsCount();

    const intervalId = setInterval(fetchUnreadNotificationsCount, 30000);
    
    return () => clearInterval(intervalId);
  }, [user?.username]);

  useEffect(() => {
    if(!user?.username) return;

    const fetchUnreadMessagesCount = async () => {
      try {
        console.log(`Fetching unread messages count for ${user.username}`);
        // Use the full URL for debugging
        const url = `${BASE_URL}/api/messages/unread-count?username=${encodeURIComponent(user.username)}`;
        console.log(`Full URL: ${url}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API Error (${response.status}):`, errorText);
          throw new Error(`Failed to fetch unread count: ${response.status}`);
        }
        
        const data = await response.json();
        setUnreadMessagesCount(data.count);
        console.log('Unread messages count:', data.count);
      } catch (error) {
        console.error("Error fetching unread messages count:", error);
      }
    };

    fetchUnreadMessagesCount();

    const intervalId = setInterval(fetchUnreadMessagesCount, 30000);
    
    return () => clearInterval(intervalId);
  }, [user?.username]);
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FDC787", // consistent accent color
        tabBarInactiveTintColor: "#aaa",
        headerShown: false,
      }}
    >
    <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color }) => (
            <View style={{ position: 'relative' }}>
              <TabBarIcon name="bell" color={color} />
              {unreadNotificationsCount > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -2,
                  right: -6,
                  backgroundColor: '#FDC787',
                  borderRadius: 10,
                  width: unreadNotificationsCount > 9 ? 18 : 16,
                  height: 16,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Text style={{ 
                    color: '#161D2B', 
                    fontSize: 10, 
                    fontWeight: 'bold'
                  }}>
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => (
            <View style={{ position: 'relative' }}>
              <TabBarIcon name="envelope" color={color} />
              {unreadMessagesCount > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -2,
                  right: -6,
                  backgroundColor: '#FDC787',
                  borderRadius: 10,
                  width: unreadMessagesCount > 9 ? 18 : 16,
                  height: 16,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Text style={{ 
                    color: '#161D2B', 
                    fontSize: 10, 
                    fontWeight: 'bold'
                  }}>
                    {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                  </Text>
                </View>
              )}
            </View>
          )
        }}
      />
    </Tabs>
  )
}
