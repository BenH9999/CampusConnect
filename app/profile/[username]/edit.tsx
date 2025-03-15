// app/profile/[username]/edit.tsx 
// fsfsf
import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, TextInput, StyleSheet, Pressable, Alert, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import * as ImagePicker from "expo-image-picker";

const getMimeType = (uri: string): string => {
  const lower = uri.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return "image/jpeg";
};

const BASE_URL = "http://192.168.0.5:8080";

export default function EditProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.username !== username) {
      Alert.alert("Unauthorized", "You can only edit your own profile.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  }, [username, user]);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
        const mediaPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (
          cameraPerm.status !== "granted" ||
          mediaPerm.status !== "granted"
        ) {
          Alert.alert(
            "Permissions Required",
            "We need camera and media library permissions to upload a profile picture."
          );
        }
      }
    })();
  }, []);

  const pickProfilePicture = () => {
    Alert.alert("Change Profile Picture", "Select an option:", [
      { text: "Take Photo", onPress: handleTakePhoto },
      { text: "Choose from Library", onPress: handlePickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        base64: true,
        quality: 1,
      });
      if (!result.canceled && result.assets) {
        const asset = result.assets[0];
        const mimeType = getMimeType(asset.uri);
        setProfilePicture(`data:${mimeType};base64,${asset.base64}`);
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        base64: true,
        quality: 1,
      });
      if (!result.canceled && result.assets) {
        const asset = result.assets[0];
        const mimeType = getMimeType(asset.uri);
        setProfilePicture(`data:${mimeType};base64,${asset.base64}`);
      }
    } catch (err) {
      console.error("Image library error:", err);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/profile/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          display_name: displayName,
          profile_picture: profilePicture,
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      Alert.alert("Success", "Profile updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error("Error updating profile:", err);
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Bar with Back Button */}
      <View style={styles.navBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.navTitle}>Edit Profile</Text>
      </View>
      <View style={styles.form}>
        <Text style={styles.label}>Display Name</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="New display name"
          placeholderTextColor="#888"
        />

        <Pressable onPress={pickProfilePicture} style={styles.pictureButton}>
          <Text style={styles.pictureButtonText}>Change Profile Picture</Text>
        </Pressable>

        {profilePicture ? (
          <Text style={styles.previewText}>
            Picture selected. Ready to save.
          </Text>
        ) : null}

        <Pressable
          onPress={handleSave}
          style={styles.saveButton}
          disabled={loading}
        >
          <Text style={styles.saveText}>
            {loading ? "Saving..." : "Save Changes"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F141E" },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161D2B",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backText: {
    color: "#FDC787",
    fontSize: 16,
    fontWeight: "700",
  },
  navTitle: {
    flex: 1,
    textAlign: "center",
    color: "#FDC787",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 40, // Offset for the back button
  },
  form: {
    padding: 16,
  },
  label: {
    color: "#FDC787",
    fontSize: 16,
    marginTop: 16,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    color: "#333",
  },
  pictureButton: {
    backgroundColor: "#2A3346",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
  },
  pictureButtonText: {
    color: "#FDC787",
    fontWeight: "700",
  },
  previewText: {
    color: "#FDC787",
    marginTop: 8,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: "#FDC787",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  saveText: {
    color: "#161D2B",
    fontWeight: "700",
  },
});
