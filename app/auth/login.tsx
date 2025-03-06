// app/auth/login.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";

import Header from "@/components/Header";

const BASE_URL = "http://192.168.0.5:8080";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/login`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify ({
          email,
          password,
        }),
      });

      const data = await response.json();

      if(response.ok){
        await login(email, password);
        router.replace("/(tabs)");
      }
      else {
        Alert.alert("Login Error", data.error || "An error occurred during login.");
      }
    } catch (error) {
        console.error("Login error: ", error);
        Alert.alert("Login Error", "An error occurred. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Header />

      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#161D2B"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#161D2B"
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
    fontSize: 64,
    marginTop: 20,
    marginBottom: 50,
    color: "#FDC787",
    textAlign: "center",
    fontWeight: 800,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
  },
  loginText: {
    marginTop: 40,
    color: "#FDC787",
    textAlign: "center",
    marginBottom: 200,
  },
  loginLink: {
    color: "#65B3C9",
    textDecorationLine: "underline",
  },
});
