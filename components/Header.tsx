import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ProfileButton from '@/components/ProfileButton';
import { useAuth } from '@/context/AuthContext';

const Header: React.FC = () => {
  const { user } = useAuth();

  if (user) {
    return (
      <View style={styles.loggedInContainer}>
        <ProfileButton
          username={user.username}
          display_name={user.display_name}
          profile_picture={user.profile_picture}
        />
      </View>
    );
  } else {
    return (
      <View style={styles.loggedOutContainer}>
        <Text style={styles.title}>Campus Connect</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  loggedInContainer: {
    width: "100%",
    backgroundColor: "#161D2B",
    paddingHorizontal: 16,
    paddingVertical: 30,
    flexDirection: "row",
    alignItems: "center",
  },
  loggedOutContainer: {
    width: "100%",
    backgroundColor: "#161D2B",
    paddingVertical: 20,
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
