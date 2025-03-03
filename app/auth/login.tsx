// app/auth/login.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      await login(username, password);
      // On successful login, navigate to the main tabs
      router.replace("/(tabs)"); // main app layout
    } catch (error) {
      console.error("Login error: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="Sign In" onPress={handleLogin} />

      <Text style={styles.loginText}>
        Don&apos;t have an account?{" "}
        <Text
          style={styles.loginLink}
          onPress={() => router.push("/auth/register")} // relative route name
        >
          Register
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#161D2B",
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    color: "#FDC787",
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
  },
  loginText: {
    marginTop: 16,
    color: "#FDC787",
    textAlign: "center",
  },
  loginLink: {
    color: "#65B3C9",
    textDecorationLine: "underline",
  },
});
