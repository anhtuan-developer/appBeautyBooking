import React, {
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
  View,
} from 'react-native';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import {
  createBooking,
} from '@/services/bookingService';

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

  const salonIdNumber = Number(
    salonId,
  );

  const serviceIdNumber = Number(
    serviceId,
  );

  const employeeIdNumber = Number(
    employeeId,
  );

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

      console.log(
        '========================================',
      );

      console.log(
        '📝 CONFIRM BOOKING',
      );

      console.log(
        '➡️ salonId:',
        salonIdNumber,
      );

      console.log(
        '➡️ serviceId:',
        serviceIdNumber,
      );

      console.log(
        '➡️ employeeId:',
        employeeIdNumber,
      );

      console.log(
        '➡️ date:',
        date,
      );

      console.log(
        '➡️ startTime:',
        startTime,
      );

      console.log(
        '➡️ endTime:',
        endTime,
      );

      console.log(
        '========================================',
      );

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
        });

      console.log(
        '📦 CREATE BOOKING RESPONSE:',
        response,
      );

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
                '/home',
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
              router.replace(
                '/home',
              )
            }
          >
            <Text
              style={styles.primaryButtonText}
            >
              Về trang chủ
            </Text>
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

          <View
            style={styles.row}
          >
            <Text
              style={styles.label}
            >
              Salon ID
            </Text>

            <Text
              style={styles.value}
            >
              #{salonIdNumber}
            </Text>
          </View>

          <View
            style={styles.row}
          >
            <Text
              style={styles.label}
            >
              Dịch vụ ID
            </Text>

            <Text
              style={styles.value}
            >
              #{serviceIdNumber}
            </Text>
          </View>

          <View
            style={styles.row}
          >
            <Text
              style={styles.label}
            >
              Nhân viên ID
            </Text>

            <Text
              style={styles.value}
            >
              #{employeeIdNumber}
            </Text>
          </View>
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