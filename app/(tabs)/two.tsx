// app/(tabs)/two.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function OtherScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Other Tab</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.text}>This is placeholder content for the other tab.</Text>
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
    padding: 16,
    alignItems: "flex-start",
  },
  title: {
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
  text: {
    fontSize: 20,
    color: "#333",
  },
});
