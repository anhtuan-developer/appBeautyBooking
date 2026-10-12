import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  NotificationItem,
} from '@/services/notificationService';

const PURPLE = '#8B5CF6';

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const response = await getNotifications(1, 50);
      if (!response.success) throw new Error(response.message || 'Không thể tải thông báo.');
      setItems(response.data.items || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tải thông báo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const markRead = async (item: NotificationItem) => {
    if (item.isRead) return;
    try {
      await markNotificationRead(item.notificationId);
      setItems(current => current.map(n =>
        n.notificationId === item.notificationId ? { ...n, isRead: true } : n,
      ));
    } catch (e) {
      Alert.alert('Chưa cập nhật được', e instanceof Error ? e.message : 'Vui lòng thử lại.');
    }
  };

  const markAllRead = async () => {
    if (markingAll || !items.some(item => !item.isRead)) return;
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setItems(current => current.map(item => ({ ...item, isRead: true })));
    } catch (e) {
      Alert.alert('Chưa cập nhật được', e instanceof Error ? e.message : 'Vui lòng thử lại.');
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Thông báo</Text>
          <Text style={styles.subtitle}>
            {items.filter(item => !item.isRead).length} thông báo chưa đọc
          </Text>
        </View>
        <Pressable onPress={() => void markAllRead()} disabled={markingAll}>
          <Text style={styles.markAll}>{markingAll ? 'Đang lưu…' : 'Đọc hết'}</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={PURPLE} /><Text style={styles.helper}>Đang tải thông báo…</Text></View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <Pressable style={styles.primaryButton} onPress={() => void load()}><Text style={styles.primaryText}>Thử lại</Text></Pressable>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => String(item.notificationId)}
          contentContainerStyle={items.length ? styles.list : styles.emptyList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={PURPLE} />}
          ListEmptyComponent={<View style={styles.center}><Text style={styles.emptyTitle}>Chưa có thông báo</Text><Text style={styles.helper}>Thông tin đặt lịch sẽ xuất hiện tại đây.</Text></View>}
          renderItem={({ item }) => (
            <Pressable onPress={() => void markRead(item)} style={[styles.card, !item.isRead && styles.unread]}>
              <View style={styles.cardTop}>
                <View style={[styles.dot, item.isRead && styles.readDot]} />
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.type}>{item.type}</Text>
              </View>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
              {!item.isRead && <Text style={styles.tapHint}>Chạm để đánh dấu đã đọc</Text>}
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F7FC' },
  header: { minHeight: 76, paddingHorizontal: 18, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEEAF5' },
  back: { width: 36, height: 40, justifyContent: 'center' },
  backText: { fontSize: 34, color: PURPLE, lineHeight: 38 },
  headerCopy: { flex: 1 },
  title: { fontSize: 21, fontWeight: '800', color: '#211B2D' },
  subtitle: { fontSize: 12, color: '#777184', marginTop: 3 },
  markAll: { color: PURPLE, fontWeight: '700', fontSize: 13 },
  list: { padding: 16, gap: 12 },
  emptyList: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#EEEAF5' },
  unread: { borderColor: '#D8C8FF', backgroundColor: '#FBF9FF' },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: PURPLE },
  readDot: { backgroundColor: '#D1CBDD' },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: '#211B2D' },
  type: { fontSize: 10, color: '#817991' },
  message: { marginTop: 10, color: '#4D465B', lineHeight: 21, fontSize: 14 },
  date: { marginTop: 10, fontSize: 11, color: '#8C8599' },
  tapHint: { marginTop: 8, color: PURPLE, fontSize: 11, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  helper: { marginTop: 10, color: '#777184', textAlign: 'center' },
  error: { color: '#B42318', textAlign: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#211B2D' },
  primaryButton: { marginTop: 14, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: PURPLE },
  primaryText: { color: '#FFF', fontWeight: '700' },
});
