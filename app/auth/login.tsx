// app/auth/login.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

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
        alert("Login Error" + data.error);
      }
    } catch (error) {
        console.error("Login error: ", error);
        alert("An error occurred, please try again");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
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
