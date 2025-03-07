// app/(tabs)/index.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "@/context/AuthContext";

export default function HomeScreen(){
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.username}>{user?.username || "Guest"}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.welcome}>Welcome to campus connect</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "#161D2B",
    marginTop: 100,
    padding: 16,
    alignItems: "flex-start",
  },
  username: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FDC787",
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  welcome: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
  },
});
