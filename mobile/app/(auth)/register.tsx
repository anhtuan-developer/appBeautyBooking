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

export default function RegisterScreen() {
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /**
   * =========================
   * HANDLE REGISTER
   * =========================
   */

  const handleRegister = async () => {
    setError('');

    const trimmedFullName =
      fullName.trim();

    const trimmedEmail =
      email.trim().toLowerCase();

    const trimmedPhone =
      phone.trim();

    /**
     * =========================
     * VALIDATE HỌ TÊN
     * =========================
     */

    if (!trimmedFullName) {
      setError('Vui lòng nhập họ và tên.');
      return;
    }

    if (
      trimmedFullName.length < 2 ||
      trimmedFullName.length > 100
    ) {
      setError(
        'Họ tên phải từ 2 đến 100 ký tự.',
      );
      return;
    }

    /**
     * =========================
     * VALIDATE EMAIL
     * =========================
     */

    if (!trimmedEmail) {
      setError('Vui lòng nhập email.');
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      setError('Email không hợp lệ.');
      return;
    }

    /**
     * =========================
     * VALIDATE PHONE
     * =========================
     */

    if (trimmedPhone) {
      const phoneRegex =
        /^\+?[0-9\s().-]{8,20}$/;

      if (!phoneRegex.test(trimmedPhone)) {
        setError(
          'Số điện thoại không hợp lệ.',
        );
        return;
      }
    }

    /**
     * =========================
     * VALIDATE PASSWORD
     * =========================
     */

    if (!password) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }

    if (
      password.length < 6 ||
      password.length > 72
    ) {
      setError(
        'Mật khẩu phải từ 6 đến 72 ký tự.',
      );
      return;
    }

    /**
     * =========================
     * CONFIRM PASSWORD
     * =========================
     */

    if (!confirmPassword) {
      setError(
        'Vui lòng nhập lại mật khẩu.',
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        'Mật khẩu xác nhận không khớp.',
      );
      return;
    }

    /**
     * =========================
     * CALL API
     * =========================
     */

    try {
      setIsSubmitting(true);

      await register({
        fullName: trimmedFullName,
        email: trimmedEmail,
        phone: trimmedPhone || undefined,
        password,
      });

      /**
       * Đăng ký thành công
       * → quay về Login
       */

      router.replace('/login');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Đăng ký thất bại. Vui lòng thử lại.';

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * =========================
   * UI
   * =========================
   */

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
          contentContainerStyle={
            styles.scrollContent
          }
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>

            {/* HEADER */}

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
                Tạo tài khoản mới
              </Text>

            </View>

            {/* FORM */}

            <View style={styles.card}>

              <Text style={styles.formTitle}>
                Đăng ký
              </Text>

              {/* HỌ TÊN */}

              <Text style={styles.label}>
                Họ và tên
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Nhập họ và tên"
                placeholderTextColor="#999999"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isSubmitting}
                returnKeyType="next"
              />

              {/* EMAIL */}

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

              {/* PHONE */}

              <Text style={styles.label}>
                Số điện thoại
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Nhập số điện thoại"
                placeholderTextColor="#999999"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!isSubmitting}
                returnKeyType="next"
              />

              {/* PASSWORD */}

              <Text style={styles.label}>
                Mật khẩu
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Ít nhất 6 ký tự"
                placeholderTextColor="#999999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSubmitting}
                returnKeyType="next"
              />

              {/* CONFIRM PASSWORD */}

              <Text style={styles.label}>
                Nhập lại mật khẩu
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor="#999999"
                value={confirmPassword}
                onChangeText={
                  setConfirmPassword
                }
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSubmitting}
                returnKeyType="done"
                onSubmitEditing={
                  handleRegister
                }
              />

              {/* ERROR */}

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>
                    {error}
                  </Text>
                </View>
              ) : null}

              {/* REGISTER BUTTON */}

              <Pressable
                style={({ pressed }) => [
                  styles.registerButton,

                  pressed &&
                    styles.buttonPressed,

                  isSubmitting &&
                    styles.buttonDisabled,
                ]}
                onPress={handleRegister}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={
                      styles.registerButtonText
                    }
                  >
                    Đăng ký
                  </Text>
                )}
              </Pressable>

              {/* BACK TO LOGIN */}

              <View style={styles.loginRow}>

                <Text style={styles.loginText}>
                  Đã có tài khoản?
                </Text>

                <Pressable
                  onPress={() =>
                    router.replace('/login')
                  }
                  disabled={isSubmitting}
                >
                  <Text style={styles.loginLink}>
                    Đăng nhập
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

/**
 * =========================
 * STYLES
 * =========================
 */

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

  registerButton: {
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

  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    marginTop: 24,

    gap: 5,
  },

  loginText: {
    fontSize: 14,
    color: '#777777',
  },

  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B5CF6',
  },
});