import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

const PURPLE = '#8B5CF6';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, changePassword } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setFullName(user?.fullName || '');
    setPhone(user?.phone || '');
  }, [user]);

  const saveProfile = async () => {
    const name = fullName.trim();
    const normalizedPhone = phone.trim();
    if (!name) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ tên.');
      return;
    }
    if (normalizedPhone && !/^[0-9+().\-\s]{8,20}$/.test(normalizedPhone)) {
      Alert.alert('Số điện thoại chưa hợp lệ', 'Hãy kiểm tra lại số điện thoại.');
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile({ fullName: name, phone: normalizedPhone });
      Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật.');
    } catch (e) {
      Alert.alert('Không thể cập nhật', e instanceof Error ? e.message : 'Vui lòng thử lại.');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ các trường mật khẩu.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Mật khẩu chưa đủ mạnh', 'Mật khẩu mới cần ít nhất 8 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mật khẩu không khớp', 'Hai lần nhập mật khẩu mới chưa giống nhau.');
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Thành công', 'Mật khẩu đã được thay đổi.');
    } catch (e) {
      Alert.alert('Không thể đổi mật khẩu', e instanceof Error ? e.message : 'Vui lòng thử lại.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user) {
    return <SafeAreaView style={styles.safe}><View style={styles.center}><ActivityIndicator color={PURPLE} /><Text style={styles.muted}>Đang kiểm tra tài khoản…</Text></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
            <View><Text style={styles.title}>Tài khoản của tôi</Text><Text style={styles.subtitle}>Quản lý thông tin cá nhân</Text></View>
          </View>

          <View style={styles.avatar}><Text style={styles.avatarText}>{(user.fullName || 'B').trim().charAt(0).toUpperCase()}</Text></View>
          <Text style={styles.displayName}>{user.fullName}</Text>
          <Text style={styles.email}>{user.email}</Text>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
            <Text style={styles.label}>Họ và tên</Text>
            <TextInput value={fullName} onChangeText={setFullName} placeholder="Nhập họ tên" autoCapitalize="words" style={styles.input} maxLength={100} />
            <Text style={styles.label}>Email</Text>
            <TextInput value={user.email} editable={false} style={[styles.input, styles.disabled]} />
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput value={phone} onChangeText={setPhone} placeholder="Nhập số điện thoại" keyboardType="phone-pad" style={styles.input} maxLength={20} />
            <Pressable disabled={savingProfile} onPress={() => void saveProfile()} style={[styles.primaryButton, savingProfile && styles.disabledButton]}>
              <Text style={styles.primaryText}>{savingProfile ? 'Đang lưu…' : 'Lưu thay đổi'}</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Đổi mật khẩu</Text>
            <Text style={styles.label}>Mật khẩu hiện tại</Text>
            <TextInput value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry autoCapitalize="none" style={styles.input} placeholder="Nhập mật khẩu hiện tại" />
            <Text style={styles.label}>Mật khẩu mới</Text>
            <TextInput value={newPassword} onChangeText={setNewPassword} secureTextEntry autoCapitalize="none" style={styles.input} placeholder="Ít nhất 8 ký tự" />
            <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
            <TextInput value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry autoCapitalize="none" style={styles.input} placeholder="Nhập lại mật khẩu mới" />
            <Pressable disabled={savingPassword} onPress={() => void savePassword()} style={[styles.secondaryButton, savingPassword && styles.disabledButton]}>
              <Text style={styles.secondaryText}>{savingPassword ? 'Đang cập nhật…' : 'Cập nhật mật khẩu'}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F7FC' },
  flex: { flex: 1 },
  content: { padding: 18, paddingBottom: 36 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 22 },
  back: { width: 36, height: 42, justifyContent: 'center' },
  backText: { fontSize: 34, color: PURPLE, lineHeight: 38 },
  title: { fontSize: 22, fontWeight: '800', color: '#211B2D' },
  subtitle: { color: '#777184', marginTop: 3, fontSize: 13 },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#EDE5FF', alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  avatarText: { color: PURPLE, fontSize: 30, fontWeight: '800' },
  displayName: { textAlign: 'center', marginTop: 10, fontSize: 18, fontWeight: '800', color: '#211B2D' },
  email: { textAlign: 'center', marginTop: 4, color: '#777184', marginBottom: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 18, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#EEEAF5' },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#211B2D', marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '700', color: '#4D465B', marginBottom: 7, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#E4DEEF', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 13, paddingVertical: 12, color: '#211B2D', fontSize: 14 },
  disabled: { backgroundColor: '#F3F1F7', color: '#8C8599' },
  primaryButton: { marginTop: 18, borderRadius: 12, padding: 14, alignItems: 'center', backgroundColor: PURPLE },
  primaryText: { color: '#FFF', fontWeight: '800' },
  secondaryButton: { marginTop: 18, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: PURPLE },
  secondaryText: { color: PURPLE, fontWeight: '800' },
  disabledButton: { opacity: 0.6 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { marginTop: 10, color: '#777184' },
});
