import React from "react";
import { Stack } from "expo-router";

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#161D2B",
        },
        headerTintColor: "#FDC787",
        headerTitleStyle: {
          color: "#F5F5F5",
        },
      }}
    />
  );
} 