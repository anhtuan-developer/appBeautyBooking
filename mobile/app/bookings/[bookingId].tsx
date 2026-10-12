import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
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
  cancelBooking,
  BookingDetail,
  getBookingDetail,
} from '@/services/bookingService';

/**
 * =========================
 * STATUS
 * =========================
 */

function getStatusText(
  status: string,
): string {
  switch (status) {
    case 'PENDING':
      return 'Chờ xác nhận';

    case 'CONFIRMED':
      return 'Đã xác nhận';

    case 'COMPLETED':
      return 'Đã hoàn thành';

    case 'CANCELLED':
      return 'Đã hủy';

    case 'REJECTED':
      return 'Bị từ chối';

    default:
      return status;
  }
}

function getStatusColor(
  status: string,
): string {
  switch (status) {
    case 'PENDING':
      return '#F59E0B';

    case 'CONFIRMED':
      return '#10B981';

    case 'COMPLETED':
      return '#3B82F6';

    case 'CANCELLED':
    case 'REJECTED':
      return '#EF4444';

    default:
      return '#6B7280';
  }
}

/**
 * =========================
 * DATE
 * =========================
 */

function formatDate(
  value?: string,
): string {
  if (!value) {
    return '';
  }

  const dateOnly =
    value.substring(0, 10);

  const parts =
    dateOnly.split('-');

  if (
    parts.length !== 3
  ) {
    return dateOnly;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * =========================
 * TIME
 * =========================
 */

function formatTime(
  value?: string,
): string {
  if (!value) {
    return '';
  }

  if (value.includes('T')) {
    const date =
      new Date(value);

    if (
      !Number.isNaN(
        date.getTime(),
      )
    ) {
      return date
        .toISOString()
        .substring(11, 16);
    }
  }

  return value.substring(
    0,
    5,
  );
}

/**
 * =========================
 * MONEY
 * =========================
 */

function formatMoney(
  value?: number,
): string {
  if (
    value === undefined ||
    value === null
  ) {
    return '—';
  }

  return `${value.toLocaleString(
    'vi-VN',
  )}đ`;
}

/**
 * =========================
 * SCREEN
 * =========================
 */

export default function BookingDetailScreen() {
  const {
    bookingId,
  } = useLocalSearchParams<{
    bookingId?: string;
  }>();

  const [
    booking,
    setBooking,
  ] = useState<BookingDetail | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    cancelling,
    setCancelling,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  const parsedBookingId =
    Number(bookingId);

  const loadBooking =
    useCallback(
      async () => {
        if (
          !Number.isInteger(
            parsedBookingId,
          ) ||
          parsedBookingId <= 0
        ) {
          setError(
            'Mã booking không hợp lệ.',
          );
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setError('');

          console.log(
            '========================================',
          );

          console.log(
            '📄 LOAD BOOKING DETAIL',
          );

          console.log(
            '➡️ bookingId:',
            parsedBookingId,
          );

          const response =
            await getBookingDetail(
              parsedBookingId,
            );

          console.log(
            '📄 BOOKING DETAIL RESPONSE:',
            JSON.stringify(
              response,
              null,
              2,
            ),
          );

          if (
            !response.success ||
            !response.data
          ) {
            throw new Error(
              response.message ||
                'Không thể lấy chi tiết booking.',
            );
          }

          setBooking(
            response.data,
          );
        } catch (err) {
          console.error(
            '❌ Load booking detail failed:',
            err,
          );

          setBooking(null);

          setError(
            err instanceof Error
              ? err.message
              : 'Không thể lấy chi tiết booking.',
          );
        } finally {
          setLoading(false);
        }
      },
      [parsedBookingId],
    );

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  /**
   * =========================
   * CANCEL
   * =========================
   */

  const handleCancel =
    () => {
      if (
        !booking ||
        booking.Status !== 'PENDING' ||
        cancelling
      ) {
        return;
      }

      Alert.alert(
        'Hủy booking',
        `Bạn có chắc muốn hủy booking #${booking.BookingId}?`,
        [
          {
            text: 'Không',
            style: 'cancel',
          },
          {
            text: 'Hủy booking',
            style: 'destructive',
            onPress:
              confirmCancel,
          },
        ],
      );
    };

  const confirmCancel =
    async () => {
      if (
        !booking ||
        booking.Status !== 'PENDING' ||
        cancelling
      ) {
        return;
      }

      try {
        setCancelling(true);

        console.log(
          '========================================',
        );

        console.log(
          '❌ CANCEL BOOKING',
        );

        console.log(
          '➡️ bookingId:',
          booking.BookingId,
        );

        const response =
          await cancelBooking(
            Number(
              booking.BookingId,
            ),
          );

        console.log(
          '❌ CANCEL BOOKING RESPONSE:',
          JSON.stringify(
            response,
            null,
            2,
          ),
        );

        if (
          !response.success
        ) {
          throw new Error(
            response.message ||
              'Không thể hủy booking.',
          );
        }

        Alert.alert(
          'Đã hủy booking',
          response.message ||
            'Booking đã được hủy thành công.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace(
                  '/bookings',
                );
              },
            },
          ],
        );
      } catch (err) {
        console.error(
          '❌ Cancel booking failed:',
          err,
        );

        const message =
          err instanceof Error
            ? err.message
            : 'Không thể hủy booking. Vui lòng thử lại.';

        Alert.alert(
          'Hủy booking thất bại',
          message,
        );
      } finally {
        setCancelling(false);
      }
    };

  /**
   * =========================
   * LOADING
   * =========================
   */

  if (loading) {
    return (
      <View
        style={
          styles.center
        }
      >
        <ActivityIndicator
          size="large"
          color="#8B5CF6"
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Đang tải chi tiết booking...
        </Text>
      </View>
    );
  }

  /**
   * =========================
   * ERROR
   * =========================
   */

  if (!booking) {
    return (
      <View
        style={
          styles.center
        }
      >
        <Text
          style={
            styles.errorTitle
          }
        >
          Không thể tải booking
        </Text>

        <Text
          style={
            styles.errorText
          }
        >
          {error ||
            'Booking không tồn tại hoặc không thuộc tài khoản của bạn.'}
        </Text>

        <Pressable
          style={
            styles.primaryButton
          }
          onPress={
            loadBooking
          }
        >
          <Text
            style={
              styles.primaryButtonText
            }
          >
            Thử lại
          </Text>
        </Pressable>

        <Pressable
          style={
            styles.secondaryButton
          }
          onPress={() =>
            router.back()
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
      </View>
    );
  }

  const statusColor =
    getStatusColor(
      booking.Status,
    );

  return (
    <View
      style={
        styles.container
      }
    >
      {/* HEADER */}

      <View
        style={
          styles.header
        }
      >
        <Pressable
          style={
            styles.backButton
          }
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.backIcon
            }
          >
            ‹
          </Text>
        </Pressable>

        <View
          style={
            styles.headerContent
          }
        >
          <Text
            style={
              styles.headerTitle
            }
          >
            Chi tiết Booking
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }
          >
            #{booking.BookingId}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                statusColor,
            },
          ]}
        >
          <Text
            style={
              styles.statusText
            }
          >
            {getStatusText(
              booking.Status,
            )}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* SERVICE */}

        <View
          style={
            styles.card
          }
        >
          <Text
            style={
              styles.cardTitle
            }
          >
            💇 Dịch vụ
          </Text>

          <Text
            style={
              styles.serviceName
            }
          >
            {booking.ServiceName}
          </Text>

          {booking.ServiceDescription && (
            <Text
              style={
                styles.description
              }
            >
              {
                booking.ServiceDescription
              }
            </Text>
          )}

          <View
            style={
              styles.row
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Thời lượng
            </Text>

            <Text
              style={
                styles.value
              }
            >
              {
                booking.DurationMinutes
              } phút
            </Text>
          </View>

          <View
            style={
              styles.row
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Giá
            </Text>

            <Text
              style={[
                styles.value,
                styles.price,
              ]}
            >
              {formatMoney(
                booking.Price,
              )}
            </Text>
          </View>
        </View>

        {/* SALON */}

        <View
          style={
            styles.card
          }
        >
          <Text
            style={
              styles.cardTitle
            }
          >
            🏪 Salon
          </Text>

          <Text
            style={
              styles.serviceName
            }
          >
            {booking.SalonName}
          </Text>

          {booking.SalonAddress && (
            <View
              style={
                styles.row
              }
            >
              <Text
                style={
                  styles.label
                }
              >
                Địa chỉ
              </Text>

              <Text
                style={
                  styles.valueLong
                }
              >
                {
                  booking.SalonAddress
                }
              </Text>
            </View>
          )}

          {booking.SalonPhone && (
            <View
              style={
                styles.row
              }
            >
              <Text
                style={
                  styles.label
                }
              >
                Điện thoại
              </Text>

              <Text
                style={
                  styles.value
                }
              >
                {booking.SalonPhone}
              </Text>
            </View>
          )}
        </View>

        {/* EMPLOYEE */}

        <View
          style={
            styles.card
          }
        >
          <Text
            style={
              styles.cardTitle
            }
          >
            👤 Nhân viên
          </Text>

          <Text
            style={
              styles.serviceName
            }
          >
            {booking.EmployeeName}
          </Text>

          {booking.Specialization && (
            <Text
              style={
                styles.description
              }
            >
              {
                booking.Specialization
              }
            </Text>
          )}

          {booking.EmployeePhone && (
            <View
              style={
                styles.row
              }
            >
              <Text
                style={
                  styles.label
                }
              >
                Điện thoại
              </Text>

              <Text
                style={
                  styles.value
                }
              >
                {
                  booking.EmployeePhone
                }
              </Text>
            </View>
          )}
        </View>

        {/* BOOKING TIME */}

        <View
          style={
            styles.card
          }
        >
          <Text
            style={
              styles.cardTitle
            }
          >
            📅 Lịch hẹn
          </Text>

          <View
            style={
              styles.row
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Ngày
            </Text>

            <Text
              style={
                styles.value
              }
            >
              {formatDate(
                booking.BookingDate,
              )}
            </Text>
          </View>

          <View
            style={
              styles.row
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Thời gian
            </Text>

            <Text
              style={
                styles.value
              }
            >
              {formatTime(
                booking.StartTime,
              )}{' '}
              -{' '}
              {formatTime(
                booking.EndTime,
              )}
            </Text>
          </View>

          <View
            style={
              styles.row
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Mã booking
            </Text>

            <Text
              style={
                styles.value
              }
            >
              #{booking.BookingId}
            </Text>
          </View>
        </View>

        {/* NOTE */}

        {booking.Note && (
          <View
            style={
              styles.noteCard
            }
          >
            <Text
              style={
                styles.noteTitle
              }
            >
              📝 Ghi chú
            </Text>

            <Text
              style={
                styles.noteText
              }
            >
              {booking.Note}
            </Text>
          </View>
        )}

        {/* CANCEL */}

        {booking.Status ===
          'PENDING' && (
          <Pressable
            disabled={
              cancelling
            }
            style={[
              styles.cancelButton,
              cancelling &&
                styles.disabledButton,
            ]}
            onPress={
              handleCancel
            }
          >
            {cancelling ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text
                style={
                  styles.cancelButtonText
                }
              >
                ❌ Hủy Booking
              </Text>
            )}
          </Pressable>
        )}

        <Pressable
          style={
            styles.secondaryButton
          }
          onPress={() =>
            router.replace(
              '/bookings',
            )
          }
        >
          <Text
            style={
              styles.secondaryButtonText
            }
          >
            Xem lịch đặt của tôi
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

/**
 * =========================
 * STYLES
 * =========================
 */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        '#F8F7FC',
    },

    center: {
      flex: 1,
      justifyContent:
        'center',
      alignItems: 'center',
      padding: 24,
      backgroundColor:
        '#F8F7FC',
    },

    loadingText: {
      marginTop: 12,
      color: '#6B7280',
      textAlign: 'center',
    },

    errorTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: '#1F2937',
      textAlign: 'center',
      marginBottom: 10,
    },

    errorText: {
      color: '#991B1B',
      textAlign: 'center',
      lineHeight: 21,
      marginBottom: 20,
    },

    header: {
      paddingTop: 50,
      paddingHorizontal: 16,
      paddingBottom: 16,
      backgroundColor:
        '#FFFFFF',
      flexDirection: 'row',
      alignItems: 'center',
    },

    backButton: {
      width: 40,
      height: 40,
      justifyContent:
        'center',
      alignItems: 'center',
    },

    backIcon: {
      fontSize: 36,
      lineHeight: 40,
      color: '#1F2937',
    },

    headerContent: {
      flex: 1,
      marginLeft: 6,
    },

    headerTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: '#1F2937',
    },

    headerSubtitle: {
      marginTop: 3,
      fontSize: 13,
      color: '#6B7280',
    },

    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 20,
    },

    statusText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '700',
    },

    content: {
      padding: 16,
      paddingBottom: 40,
    },

    card: {
      backgroundColor:
        '#FFFFFF',
      borderRadius: 16,
      padding: 18,
      marginBottom: 14,
      borderWidth: 1,
      borderColor:
        '#E5E7EB',
    },

    cardTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: '#1F2937',
      marginBottom: 12,
    },

    serviceName: {
      fontSize: 19,
      fontWeight: '800',
      color: '#111827',
    },

    description: {
      marginTop: 7,
      fontSize: 14,
      lineHeight: 21,
      color: '#6B7280',
    },

    row: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'flex-start',
      gap: 16,
      paddingVertical: 9,
      borderBottomWidth: 1,
      borderBottomColor:
        '#F1F5F9',
    },

    label: {
      flex: 1,
      fontSize: 14,
      color: '#6B7280',
    },

    value: {
      flex: 1.5,
      fontSize: 14,
      fontWeight: '700',
      color: '#1F2937',
      textAlign: 'right',
    },

    valueLong: {
      flex: 1.5,
      fontSize: 14,
      fontWeight: '600',
      color: '#1F2937',
      textAlign: 'right',
      lineHeight: 20,
    },

    price: {
      color: '#8B5CF6',
      fontSize: 16,
    },

    noteCard: {
      backgroundColor:
        '#EEF2FF',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    },

    noteTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: '#3730A3',
      marginBottom: 7,
    },

    noteText: {
      fontSize: 14,
      lineHeight: 21,
      color: '#4338CA',
    },

    cancelButton: {
      height: 52,
      borderRadius: 14,
      backgroundColor:
        '#DC2626',
      justifyContent:
        'center',
      alignItems: 'center',
      marginTop: 4,
      marginBottom: 12,
    },

    cancelButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },

    primaryButton: {
      minWidth: 180,
      height: 50,
      borderRadius: 13,
      backgroundColor:
        '#8B5CF6',
      justifyContent:
        'center',
      alignItems: 'center',
      paddingHorizontal: 24,
      marginBottom: 12,
    },

    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },

    secondaryButton: {
      height: 50,
      borderRadius: 13,
      backgroundColor:
        '#FFFFFF',
      borderWidth: 1,
      borderColor:
        '#D1D5DB',
      justifyContent:
        'center',
      alignItems: 'center',
      marginBottom: 12,
    },

    secondaryButtonText: {
      color: '#374151',
      fontSize: 15,
      fontWeight: '700',
    },

    disabledButton: {
      opacity: 0.55,
    },
  });
