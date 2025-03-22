// components/ProfileButton.tsx
import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";

export type ProfileButtonProps = {
  username: string;
  display_name?: string;
  profile_picture?: string;
};

const ProfileButton: React.FC<ProfileButtonProps> = ({
  username,
  display_name,
  profile_picture,
}) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/profile/${username}`);
  };

  const renderProfileImage = () => {
    if (!profile_picture) {
      return (
        <View style={styles.profilePicPlaceholder}>
          <Text style={styles.placeholderText}>
            {(display_name || username).charAt(0).toUpperCase()}
          </Text>
        </View>
      );
    }

    // Check if it's already a data URI
    const imageUri = profile_picture.startsWith('data:')
      ? profile_picture
      : `data:image/png;base64,${profile_picture}`;

    return (
      <Image
        source={{ uri: imageUri }}
        style={styles.profilePic}
        onError={() => console.log(`Failed to load profile image for ${username}`)}
      />
    );
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      {renderProfileImage()}
      <Text style={styles.username}>{display_name || username}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profilePicPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#444",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#FDC787",
    fontSize: 18,
    fontWeight: "bold",
  },
  username: {
    color: "#FDC787",
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 8,
  },
});

export default ProfileButton;
