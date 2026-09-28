import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
} from 'react-native';

import { Redirect } from 'expo-router';

import { useAuth } from '@/context/AuthContext';

export default function IndexScreen() {
  const {
    isLoading,
    isAuthenticated,
  } = useAuth();

  /**
   * Đang kiểm tra token / session
   */
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Đang kiểm tra đăng nhập...
        </Text>
      </SafeAreaView>
    );
  }

  /**
   * Chưa đăng nhập
   * → chuyển sang Login
   */
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  /**
   * Đã đăng nhập
   * → chuyển sang Home
   */
  return <Redirect href="/home" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
});