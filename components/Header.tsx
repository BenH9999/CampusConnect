import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import ProfileButton from '@/components/ProfileButton';
import { useAuth } from '@/context/AuthContext';

type HeaderProps = {
  showSearch?: boolean;
};

const Header: React.FC<HeaderProps> = ({ showSearch }) => {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {user ? (
        <View style={styles.loggedInRow}>
          {/* Left: Profile Button */}
          <Pressable onPress={() => router.push(`/profile/${user.username}`)} style={styles.profileContainer}>
            {user.profile_picture ? (
              <Image source={{ uri: user.profile_picture }} style={styles.profilePic} />
            ) : (
              <View style={styles.profilePicPlaceholder} />
            )}
            <Text style={styles.username}>{user.display_name || user.username}</Text>
          </Pressable>
          {/* Right: Optional Search Button */}
          {showSearch && (
            <Pressable onPress={() => router.push("/search")} style={styles.searchButton}>
              <Text style={styles.searchText}>Search</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={styles.loggedOutContainer}>
          <Text style={styles.title}>Campus Connect</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#161D2B",
    paddingHorizontal: 16,
    paddingVertical: 30,
  },
  loggedInRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileContainer: {
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
  searchButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#FDC787",
    borderRadius: 6,
  },
  searchText: {
    color: "#161D2B",
    fontWeight: "700",
  },
  loggedOutContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FDC787",
  },
});

export default Header;
