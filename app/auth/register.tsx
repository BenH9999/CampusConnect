// app/auth/register.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

import Header from "@/components/Header";

const BASE_URL = "http://192.168.0.5:8080";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter(); 

  const handleRegister = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify ({
          username,
          email,
          password,
        }),
      }); 

      const responseText = await response.text();
    console.log("Raw response:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      throw new Error("Invalid JSON received from the server");
    }

    if (response.ok) { 
      Alert.alert("Registration Successful", data.message, [
        {
          text: "OK",
          onPress: () => router.replace("/auth/login"),
        },
      ]);
    } else {
      Alert.alert("Registration Error", data.error || "An error occurred during registration.");
    }
  } catch (error) {
    console.error("Registration error: ", error);
    Alert.alert("Registration Error", "An error occurred. Please try again.");
  }
};  return (
    <View style={styles.container}>
      <Header />

      <Text style={styles.title}>Register</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#161D2B"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#161D2B"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#161D2B"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="Sign Up" onPress={handleRegister} />

      <Text style={styles.registerText}>
        Already have an account?{" "}
        <Text
          style={styles.registerLink}
          onPress={() => router.push("/auth/login")} // relative route name
        >
          Login
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
    marginBottom: 24,
    color: "#FDC787",
    textAlign: "center",
    fontWeight: "800",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  registerText: {
    marginTop: 40,
    color: "#FDC787",
    textAlign: "center",
    marginBottom: 200,
  },
  registerLink: {
    color: "#65B3C9",
    textDecorationLine: "underline",
  },
});
