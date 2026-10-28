import React from 'react';

import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
} from 'react-native';

import {
  useRootNavigationState,
  router,
} from 'expo-router';

import { useAuth } from '@/context/AuthContext';

export default function IndexScreen() {
  const {
    isLoading,
    isAuthenticated,
    sessionUnavailable,
    refreshUser,
    logout,
  } = useAuth();

  const rootNavigationState =
    useRootNavigationState();

  const isNavigationReady =
    rootNavigationState?.key != null;

  /**
   * Không điều hướng trực tiếp trong render.
   * Chờ component mount + navigation ready rồi mới replace.
   */
  React.useEffect(() => {
    if (
      isLoading ||
      sessionUnavailable ||
      !isNavigationReady
    ) {
      return;
    }

    router.replace(
      isAuthenticated
        ? '/home'
        : '/login',
    );
  }, [
    isLoading,
    isAuthenticated,
    sessionUnavailable,
    isNavigationReady,
  ]);

  if (sessionUnavailable && !isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorTitle}>Không thể kiểm tra phiên đăng nhập</Text>
        <Text style={styles.loadingText}>Có thể máy chủ hoặc mạng đang tạm thời không khả dụng. Phiên đăng nhập đã được giữ lại.</Text>
        <Pressable style={styles.button} onPress={() => void refreshUser()}>
          <Text style={styles.buttonText}>Thử lại</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => void logout()}>
          <Text style={styles.secondaryButtonText}>Đăng xuất</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (isLoading || !isNavigationReady) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <ActivityIndicator
          size="large"
        />

        <Text
          style={styles.loadingText}
        >
          Đang kiểm tra đăng nhập...
        </Text>
      </SafeAreaView>
    );
  }

  // Navigation được xử lý trong useEffect.
  return null;
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },

    loadingText: {
      marginTop: 12,
      marginHorizontal: 24,
      textAlign: 'center',
      fontSize: 16,
    },
    errorTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginHorizontal: 24 },
    button: { marginTop: 20, backgroundColor: '#8B5CF6', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 10 },
    buttonText: { color: '#FFFFFF', fontWeight: '700' },
    secondaryButton: { marginTop: 12, paddingHorizontal: 28, paddingVertical: 12 },
    secondaryButtonText: { color: '#8B5CF6', fontWeight: '600' },
  });
