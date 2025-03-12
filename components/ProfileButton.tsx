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

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      {profile_picture ? (
        <Image source={{ uri: profile_picture }} style={styles.profilePic} />
      ) : (
        <View style={styles.profilePicPlaceholder} />
      )}
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
  },
  username: {
    color: "#FDC787",
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 8,
  },
});

export default ProfileButton;
