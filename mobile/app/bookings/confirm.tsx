import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import {
  createBooking,
} from '@/services/bookingService';
import { getSalonById } from '@/services/salonService';
import type { SalonDetail } from '@/types/salon';

function formatDate(
  date: string,
): string {
  if (!date) {
    return '';
  }

  const parts = date.split('-');

  if (parts.length !== 3) {
    return date;
  }

  const [
    year,
    month,
    day,
  ] = parts;

  return `${day}/${month}/${year}`;
}

function formatMoney(
  value: number,
): string {
  return `${value.toLocaleString('vi-VN')} đ`;
}

export default function ConfirmBookingScreen() {
  const {
    salonId,
    serviceId,
    employeeId,
    date,
    startTime,
    endTime,
  } =
    useLocalSearchParams<{
      salonId?: string;
      serviceId?: string;
      employeeId?: string;
      date?: string;
      startTime?: string;
      endTime?: string;
    }>();

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    success,
    setSuccess,
  ] = useState(false);

  // Ghi chú tùy chọn gửi kèm yêu cầu tạo lịch.
  const [note, setNote] = useState('');
  const [salonDetail, setSalonDetail] = useState<SalonDetail | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  const salonIdNumber = Number(
    salonId,
  );

  const serviceIdNumber = Number(
    serviceId,
  );

  const employeeIdNumber = Number(
    employeeId,
  );

  // Lấy tên salon, dịch vụ và nhân viên từ API chi tiết salon.
  // Không hiển thị ID như thể đó là tên thật.
  useEffect(() => {
    let cancelled = false;

    async function loadSelectionDetails() {
      if (!Number.isInteger(salonIdNumber) || salonIdNumber <= 0) return;

      try {
        setDetailsLoading(true);
        setDetailsError('');
        const response = await getSalonById(salonIdNumber);
        if (!cancelled && response.success && response.data) {
          setSalonDetail(response.data);
        } else if (!cancelled) {
          setDetailsError('Không lấy được thông tin lựa chọn.');
        }
      } catch (error) {
        if (!cancelled) {
          setDetailsError(error instanceof Error ? error.message : 'Không thể tải thông tin salon.');
        }
      } finally {
        if (!cancelled) setDetailsLoading(false);
      }
    }

    loadSelectionDetails();
    return () => { cancelled = true; };
  }, [salonIdNumber]);

  const selectedService = salonDetail?.services?.find(
    (item) => Number(item.ServiceId) === serviceIdNumber,
  );
  const selectedEmployee = salonDetail?.employees?.find(
    (item) => Number(item.EmployeeId) === employeeIdNumber,
  );
  const salonDisplayName = salonDetail?.SalonName?.trim() || '';
  const serviceDisplayName = selectedService?.ServiceName?.trim() || '';
  const employeeDisplayName = selectedEmployee?.FullName?.trim() || '';

  const paramsValid =
    Number.isInteger(salonIdNumber) &&
    salonIdNumber > 0 &&
    Number.isInteger(serviceIdNumber) &&
    serviceIdNumber > 0 &&
    Number.isInteger(employeeIdNumber) &&
    employeeIdNumber > 0 &&
    Boolean(date) &&
    Boolean(startTime) &&
    Boolean(endTime);

  /**
   * Hiện tại API available-slots đã trả
   * thông tin service, employee về màn hình time.
   *
   * Tuy nhiên confirm chỉ nhận ID + date/time.
   * Vì vậy ở bước này ta hiển thị thông tin
   * từ route trước.
   */
  const bookingTime = useMemo(() => {
    if (!startTime || !endTime) {
      return '';
    }

    return `${startTime} - ${endTime}`;
  }, [
    startTime,
    endTime,
  ]);

  const handleConfirm = async () => {
    if (loading) {
      return;
    }

    if (!paramsValid) {
      Alert.alert(
        'Thông tin không hợp lệ',
        'Thiếu thông tin đặt lịch. Vui lòng quay lại và chọn lại thời gian.',
      );

      return;
    }

    try {
      setLoading(true);

      
      
      
      
      
      
      
      
      
      const response =
        await createBooking({
          employeeId:
            employeeIdNumber,
        
          serviceId:
            serviceIdNumber,
        
          bookingDate:
            date as string,
        
          startTime:
            startTime as string,
        
          endTime:
            endTime as string,
          note: note.trim() || undefined,
        });

      
      if (!response.success) {
        throw new Error(
          response.message ||
            'Không thể tạo lịch đặt.',
        );
      }

      setSuccess(true);

      Alert.alert(
        'Đặt lịch thành công 🎉',
        response.message ||
          'Lịch của bạn đã được tạo thành công.',
        [
          {
            text: 'Xem lịch của tôi',
            onPress: () => {
              router.replace(
                '/bookings',
              );
            },
          },
        ],
      );
    } catch (error) {
      console.error(
        '❌ Create booking error:',
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : 'Không thể tạo lịch đặt. Vui lòng thử lại.';

      Alert.alert(
        'Đặt lịch thất bại',
        message,
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={styles.successContainer}
        >
          <View
            style={styles.successIcon}
          >
            <Text
              style={styles.successIconText}
            >
              ✓
            </Text>
          </View>

          <Text
            style={styles.successTitle}
          >
            Đặt lịch thành công
          </Text>

          <Text
            style={styles.successText}
          >
            Lịch hẹn của bạn đã được
            tạo thành công.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() =>
              router.replace('/bookings')
            }
          >
            <Text
              style={styles.primaryButtonText}
            >
              Xem lịch đặt của tôi
            </Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.replace('/home')}
          >
            <Text style={styles.secondaryButtonText}>Về trang chủ</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <ScrollView
        contentContainerStyle={
          styles.container
        }
      >
        <Text
          style={styles.title}
        >
          Xác nhận đặt lịch
        </Text>

        <Text
          style={styles.subtitle}
        >
          Kiểm tra thông tin trước khi
          xác nhận.
        </Text>

        <View
          style={styles.card}
        >
          <Text
            style={styles.sectionTitle}
          >
            📅 Thông tin lịch hẹn
          </Text>

          <View
            style={styles.row}
          >
            <Text
              style={styles.label}
            >
              Ngày
            </Text>

            <Text
              style={styles.value}
            >
              {formatDate(
                date ?? '',
              )}
            </Text>
          </View>

          <View
            style={styles.row}
          >
            <Text
              style={styles.label}
            >
              Thời gian
            </Text>

            <Text
              style={styles.value}
            >
              {bookingTime}
            </Text>
          </View>
        </View>

        <View
          style={styles.card}
        >
          <Text
            style={styles.sectionTitle}
          >
            👤 Thông tin lựa chọn
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>Salon</Text>
            <Text style={styles.value} numberOfLines={2}>
              {detailsLoading && !salonDisplayName ? 'Đang tải...' : salonDisplayName || 'Chưa có tên salon'}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Dịch vụ</Text>
            <Text style={styles.value} numberOfLines={2}>
              {detailsLoading && !serviceDisplayName ? 'Đang tải...' : serviceDisplayName || 'Không tìm thấy dịch vụ'}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Nhân viên</Text>
            <Text style={styles.value} numberOfLines={2}>
              {detailsLoading && !employeeDisplayName ? 'Đang tải...' : employeeDisplayName || 'Không tìm thấy nhân viên'}
            </Text>
          </View>
          {!!detailsError && (
            <Text style={styles.detailsError}>
              Không tải được tên lựa chọn. Vui lòng kiểm tra kết nối rồi quay lại chọn lại nếu cần.
            </Text>
          )}
        </View>

        <View style={styles.noteSection}>
          <Text style={styles.noteLabel}>Ghi chú cho salon (không bắt buộc)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Ví dụ: Tôi muốn cắt tóc ngắn..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
            textAlignVertical="top"
            editable={!loading}
            style={styles.noteInput}
          />
          <Text style={styles.noteCounter}>{note.length}/500</Text>
        </View>

        <View
          style={styles.warningBox}
        >
          <Text
            style={styles.warningTitle}
          >
            ⚠️ Lưu ý
          </Text>

          <Text
            style={styles.warningText}
          >
            Sau khi xác nhận, hệ thống sẽ
            kiểm tra lại khung giờ trước
            khi tạo lịch đặt để tránh
            trùng lịch.
          </Text>
        </View>

        <Pressable
          disabled={
            loading ||
            !paramsValid
          }
          onPress={
            handleConfirm
          }
          style={[
            styles.primaryButton,
            (loading ||
              !paramsValid) &&
              styles.disabledButton,
          ]}
        >
          {loading ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text
              style={
                styles.primaryButtonText
              }
            >
              Xác nhận đặt lịch
            </Text>
          )}
        </Pressable>

        <Pressable
          disabled={loading}
          onPress={() =>
            router.back()
          }
          style={
            styles.secondaryButton
          }
        >
          <Text
            style={
              styles.secondaryButtonText
            }
          >
            Quay lại
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  detailsError: { color: '#B45309', fontSize: 13, marginTop: 8, lineHeight: 18 },
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 20,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,

    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingVertical: 10,

    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  label: {
    fontSize: 15,
    color: '#6B7280',
  },

  value: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    maxWidth: '60%',
    textAlign: 'right',
  },

  noteSection: {
    marginTop: 18,
    marginBottom: 18,
  },
  noteLabel: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  noteInput: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  noteCounter: {
    textAlign: 'right',
    color: '#6B7280',
    fontSize: 12,
    marginTop: 5,
  },

  warningBox: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },

  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9A3412',
    marginBottom: 6,
  },

  warningText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#7C2D12',
  },

  primaryButton: {
    height: 52,
    borderRadius: 14,

    backgroundColor: '#8B5CF6',

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 4,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  disabledButton: {
    opacity: 0.55,
  },

  secondaryButton: {
    height: 52,
    borderRadius: 14,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#D1D5DB',

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 12,
  },

  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '700',
  },

  successContainer: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    padding: 30,
  },

  successIcon: {
    width: 80,
    height: 80,

    borderRadius: 40,

    backgroundColor: '#DCFCE7',

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 20,
  },

  successIconText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#16A34A',
  },

  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',

    textAlign: 'center',

    marginBottom: 10,
  },

  successText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6B7280',

    textAlign: 'center',

    marginBottom: 30,
  },
});