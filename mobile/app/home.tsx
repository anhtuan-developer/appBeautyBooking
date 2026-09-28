import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Redirect, router } from 'expo-router';

import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const {
    user,
    isLoading,
    logout,
  } = useAuth();

  /**
   * Đang khôi phục session
   */
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Đang tải...
        </Text>
      </SafeAreaView>
    );
  }

  /**
   * Trường hợp bất thường:
   * không có user nhưng vẫn vào Home.
   *
   * Chuyển về Login.
   */
  if (!user) {
  return <Redirect href="/login" />;
}

  /**
   * Đăng xuất
   */
  const handleLogout = async () => {
    await logout();

    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeText}>
                Xin chào,
              </Text>

              <Text style={styles.userName}>
                {user.fullName}
              </Text>
            </View>

            <View style={styles.logo}>
              <Text style={styles.logoText}>
                B
              </Text>
            </View>
          </View>

          {/* Welcome Card */}
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>
              Chào mừng đến BeautyBooking
            </Text>

            <Text style={styles.welcomeDescription}>
              Đặt lịch làm đẹp nhanh chóng,
              thuận tiện và dễ dàng.
            </Text>
          </View>

          {/* User information */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Thông tin tài khoản
            </Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                Họ tên
              </Text>

              <Text style={styles.infoValue}>
                {user.fullName}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                Email
              </Text>

              <Text style={styles.infoValue}>
                {user.email}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                Số điện thoại
              </Text>

              <Text style={styles.infoValue}>
                {user.phone || 'Chưa cập nhật'}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                Vai trò
              </Text>

              <Text style={styles.infoValue}>
                {user.role}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                Trạng thái
              </Text>

              <Text style={styles.activeText}>
                {user.isActive
                  ? 'Đang hoạt động'
                  : 'Đã khóa'}
              </Text>
            </View>
          </View>

          {/* Logout */}
          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>
              Đăng xuất
            </Text>
          </Pressable>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F7FC',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },

  scrollContent: {
    flexGrow: 1,
  },

  container: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    padding: 24,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  welcomeText: {
    fontSize: 15,
    color: '#777777',
    marginBottom: 4,
  },

  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#222222',
  },

  logo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },

  welcomeCard: {
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },

  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
  },

  welcomeDescription: {
    color: '#F5F3FF',
    fontSize: 15,
    lineHeight: 22,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,

    elevation: 3,
  },

  cardTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 18,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    minHeight: 32,
  },

  infoLabel: {
    fontSize: 14,
    color: '#777777',
    flex: 1,
  },

  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222222',
    flex: 2,
    textAlign: 'right',
  },

  activeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#16A34A',
    flex: 2,
    textAlign: 'right',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 12,
  },

  logoutButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoutText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '700',
  },

  buttonPressed: {
    opacity: 0.65,
  },
});