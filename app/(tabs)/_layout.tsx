// app/(tabs)/_layout.tsx
import React, { useEffect, useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { useAuth } from "@/context/AuthContext";

const BASE_URL = "http://192.168.0.5:8080";

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string; }) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Fetch unread notifications count
  useEffect(() => {
    if (!user?.username) return;
    
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/notifications/unread-count?username=${encodeURIComponent(user.username)}`);
        const data = await response.json();
        setUnreadCount(data.count);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };
    
    fetchUnreadCount();
    
    // Set up polling for unread count (every 30 seconds)
    const intervalId = setInterval(fetchUnreadCount, 30000);
    
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
        name="two"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color }) => (
            <View style={{ position: 'relative' }}>
              <TabBarIcon name="bell" color={color} />
              {unreadCount > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -2,
                  right: -6,
                  backgroundColor: '#FDC787',
                  borderRadius: 10,
                  width: unreadCount > 9 ? 18 : 16,
                  height: 16,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Text style={{ 
                    color: '#161D2B', 
                    fontSize: 10, 
                    fontWeight: 'bold'
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  )
}
