import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import ProfileButton from '@/components/ProfileButton';
import { useAuth } from '@/context/AuthContext';

type HeaderProps = {
  showSearch?: boolean;
  title?: string;
};

const Header: React.FC<HeaderProps> = ({ showSearch, title }) => {
  const { user } = useAuth();
  const router = useRouter();

  // If title is provided, show a title-only header
  if (title) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user ? (
        <View style={styles.loggedInRow}>
          {/* Left: Profile Button */}
          <ProfileButton 
            username={user.username}
            display_name={user.display_name}
            profile_picture={user.profile_picture}
          />
          
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
