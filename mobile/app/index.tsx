import React from 'react';

import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
} from 'react-native';

import {
  Redirect,
  useRootNavigationState,
  router,
} from 'expo-router';

import { useAuth } from '@/context/AuthContext';

export default function IndexScreen() {
  const {
    isLoading,
    isAuthenticated,
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
    isNavigationReady,
  ]);

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
      fontSize: 16,
    },
  });
