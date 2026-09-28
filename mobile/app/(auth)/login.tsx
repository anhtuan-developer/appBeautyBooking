import React, { useState } from 'react';

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { router } from 'expo-router';

import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setError('');

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Vui lòng nhập email.');
      return;
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }

    try {
      setIsSubmitting(true);

      await login(
        trimmedEmail,
        password,
      );

      /**
       * AuthContext đã:
       *
       * 1. Gọi Backend
       * 2. Nhận JWT
       * 3. Lưu JWT
       * 4. Lưu user
       *
       * Sau đó quay về Auth Gate.
       */

      router.replace('/');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Đăng nhập thất bại. Vui lòng thử lại.';

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>
                  B
                </Text>
              </View>

              <Text style={styles.title}>
                BeautyBooking
              </Text>

              <Text style={styles.subtitle}>
                Đặt lịch làm đẹp dễ dàng
              </Text>
            </View>

            {/* Login Card */}
            <View style={styles.card}>
              <Text style={styles.formTitle}>
                Đăng nhập
              </Text>

              {/* Email */}
              <Text style={styles.label}>
                Email
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Nhập email của bạn"
                placeholderTextColor="#999999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSubmitting}
                returnKeyType="next"
              />

              {/* Password */}
              <Text style={styles.label}>
                Mật khẩu
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#999999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSubmitting}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />

              {/* Error */}
              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>
                    {error}
                  </Text>
                </View>
              ) : null}

              {/* Login button */}
              <Pressable
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed &&
                    styles.buttonPressed,
                  isSubmitting &&
                    styles.buttonDisabled,
                ]}
                onPress={handleLogin}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Text style={styles.loginButtonText}>
                    Đăng nhập
                  </Text>
                )}
              </Pressable>

              {/* Register */}
              <View style={styles.registerRow}>
                <Text style={styles.registerText}>
                  Chưa có tài khoản?
                </Text>

                <Pressable
                  onPress={() =>
                    router.push('/register')
                  }
                  disabled={isSubmitting}
                >
                  <Text style={styles.registerLink}>
                    Đăng ký
                  </Text>
                </Pressable>
              </View>

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F7FC',
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  container: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  header: {
    alignItems: 'center',
    marginBottom: 28,
  },

  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  logoText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#222222',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 15,
    color: '#777777',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,

    elevation: 4,
  },

  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 24,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#222222',
    backgroundColor: '#FFFFFF',
    marginBottom: 18,
  },

  errorBox: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },

  errorText: {
    color: '#BE123C',
    fontSize: 14,
    lineHeight: 20,
  },

  loginButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },

  buttonPressed: {
    opacity: 0.8,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 5,
  },

  registerText: {
    fontSize: 14,
    color: '#777777',
  },

  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B5CF6',
  },
});