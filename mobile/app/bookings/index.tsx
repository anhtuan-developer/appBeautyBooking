import React, {
  useCallback,
  useState,
} from 'react';

import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  useFocusEffect,
  useRouter,
} from 'expo-router';

import {
  Booking,
  getMyBookings,
} from '@/services/bookingService';

/**
 * =========================
 * COLORS
 * =========================
 */

const COLORS = {
  primary: '#8B5CF6',

  background: '#F8F7FC',

  white: '#FFFFFF',

  text: '#1F2937',

  gray: '#6B7280',

  lightGray: '#E5E7EB',

  pending: '#F59E0B',

  confirmed: '#10B981',

  completed: '#3B82F6',

  cancelled: '#EF4444',

  rejected: '#EF4444',
};

/**
 * =========================
 * STATUS TEXT
 * =========================
 */

function getStatusText(
  status: string,
) {
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

/**
 * =========================
 * STATUS COLOR
 * =========================
 */

function getStatusColor(
  status: string,
) {
  switch (status) {
    case 'PENDING':
      return COLORS.pending;

    case 'CONFIRMED':
      return COLORS.confirmed;

    case 'COMPLETED':
      return COLORS.completed;

    case 'CANCELLED':
      return COLORS.cancelled;

    case 'REJECTED':
      return COLORS.rejected;

    default:
      return COLORS.gray;
  }
}

/**
 * =========================
 * FORMAT DATE
 * =========================
 */

function formatDate(
  date: string,
) {
  if (!date) {
    return '';
  }

  const value =
    date.substring(0, 10);

  const parts =
    value.split('-');

  if (
    parts.length !== 3
  ) {
    return value;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * =========================
 * FORMAT TIME
 * =========================
 */

function formatTime(
  time: string,
) {
  if (!time) {
    return '';
  }

  /**
   * SQL TIME khi Node trả JSON
   * có thể thành:
   *
   * 1970-01-01T08:00:00.000Z
   */

  if (time.includes('T')) {
    const date =
      new Date(time);

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

  /**
   * HH:mm:ss
   */

  if (time.length >= 5) {
    return time.substring(
      0,
      5,
    );
  }

  return time;
}

/**
 * =========================
 * FORMAT MONEY
 * =========================
 */

function formatMoney(
  price: number,
) {
  return `${price.toLocaleString(
    'vi-VN',
  )}đ`;
}

/**
 * =========================
 * SCREEN
 * =========================
 */

export default function MyBookingsScreen() {
  const router = useRouter();

  const [
    bookings,
    setBookings,
  ] = useState<Booking[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  /**
   * =========================
   * LOAD BOOKINGS
   * =========================
   */

  const loadBookings =
    async (
      showLoading = true,
    ) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        setError(null);

        console.log(
          '========================================',
        );

        console.log(
          '📋 LOAD MY BOOKINGS',
        );

        console.log(
          '========================================',
        );

        const response =
          await getMyBookings(
            1,
            10,
          );

        console.log(
          '📋 MY BOOKINGS RESPONSE:',
          JSON.stringify(
            response,
            null,
            2,
          ),
        );

        if (
          response.success
        ) {
          /**
           * Backend trả:
           *
           * data: {
           *   items: [],
           *   pagination: {}
           * }
           */

          setBookings(
            response.data?.items ||
              [],
          );
        } else {
          setBookings([]);

          setError(
            response.message ||
              'Không thể tải lịch đặt.',
          );
        }
      } catch (err) {
        console.error(
          '❌ Load my bookings failed:',
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Không thể tải lịch đặt.',
        );
      } finally {
        setLoading(false);

        setRefreshing(false);
      }
    };

  /**
   * =========================
   * RELOAD WHEN SCREEN FOCUS
   * =========================
   */

  useFocusEffect(
    useCallback(() => {
      loadBookings();

      return undefined;
    }, []),
  );

  /**
   * =========================
   * REFRESH
   * =========================
   */

  const handleRefresh =
    () => {
      setRefreshing(true);

      loadBookings(false);
    };

  /**
   * =========================
   * BOOKING ITEM
   * =========================
   */

  const renderBooking = ({
    item,
  }: {
    item: Booking;
  }) => {
    const statusColor =
      getStatusColor(
        item.Status,
      );

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.card}
        onPress={() => {
          console.log(
            '➡️ Selected booking:',
            item.BookingId,
          );

          /**
           * Chưa chuyển sang
           * màn hình detail ở bước này.
           *
           * Sẽ làm ở bước tiếp theo.
           */
        }}
      >
        {/* HEADER */}

        <View
          style={
            styles.cardHeader
          }
        >
          <View
            style={
              styles.titleContainer
            }
          >
            <Text
              style={
                styles.serviceName
              }
            >
              {item.ServiceName}
            </Text>

            <Text
              style={
                styles.bookingId
              }
            >
              Mã lịch: #
              {item.BookingId}
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
                item.Status,
              )}
            </Text>
          </View>
        </View>

        <View
          style={styles.divider}
        />

        {/* SALON */}

        <View
          style={styles.infoRow}
        >
          <Text
            style={
              styles.infoLabel
            }
          >
            🏪 Salon
          </Text>

          <Text
            style={
              styles.infoValue
            }
          >
            {item.SalonName}
          </Text>
        </View>

        {/* DATE */}

        <View
          style={styles.infoRow}
        >
          <Text
            style={
              styles.infoLabel
            }
          >
            📅 Ngày
          </Text>

          <Text
            style={
              styles.infoValue
            }
          >
            {formatDate(
              item.BookingDate,
            )}
          </Text>
        </View>

        {/* TIME */}

        <View
          style={styles.infoRow}
        >
          <Text
            style={
              styles.infoLabel
            }
          >
            🕐 Thời gian
          </Text>

          <Text
            style={
              styles.infoValue
            }
          >
            {formatTime(
              item.StartTime,
            )}{' '}
            -{' '}
            {formatTime(
              item.EndTime,
            )}
          </Text>
        </View>

        {/* EMPLOYEE */}

        <View
          style={styles.infoRow}
        >
          <Text
            style={
              styles.infoLabel
            }
          >
            👤 Nhân viên
          </Text>

          <Text
            style={
              styles.infoValue
            }
          >
            {item.EmployeeName}
          </Text>
        </View>

        {/* DURATION */}

        <View
          style={styles.infoRow}
        >
          <Text
            style={
              styles.infoLabel
            }
          >
            ⏱ Thời lượng
          </Text>

          <Text
            style={
              styles.infoValue
            }
          >
            {item.DurationMinutes}{' '}
            phút
          </Text>
        </View>

        {/* PRICE */}

        <View
          style={styles.infoRow}
        >
          <Text
            style={
              styles.infoLabel
            }
          >
            💰 Giá
          </Text>

          <Text
            style={[
              styles.infoValue,
              styles.price,
            ]}
          >
            {formatMoney(
              item.Price,
            )}
          </Text>
        </View>
      </TouchableOpacity>
    );
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
          color={
            COLORS.primary
          }
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Đang tải lịch đặt...
        </Text>
      </View>
    );
  }

  /**
   * =========================
   * SCREEN
   * =========================
   */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* HEADER */}

      <View
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() =>
            router.back()
          }
          style={
            styles.backButton
          }
        >
          <Text
            style={
              styles.backIcon
            }
          >
            ‹
          </Text>
        </TouchableOpacity>

        <View
          style={
            styles.headerTextContainer
          }
        >
          <Text
            style={
              styles.title
            }
          >
            Lịch đặt của tôi
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Quản lý các lịch hẹn
            của bạn
          </Text>
        </View>
      </View>

      {/* ERROR */}

      {error && (
        <View
          style={
            styles.errorBox
          }
        >
          <Text
            style={
              styles.errorText
            }
          >
            {error}
          </Text>

          <TouchableOpacity
            onPress={() =>
              loadBookings()
            }
          >
            <Text
              style={
                styles.retryText
              }
            >
              Thử lại
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* EMPTY */}

      {!error &&
        bookings.length ===
          0 && (
          <View
            style={
              styles.empty
            }
          >
            <Text
              style={
                styles.emptyIcon
              }
            >
              📅
            </Text>

            <Text
              style={
                styles.emptyTitle
              }
            >
              Chưa có lịch đặt
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Bạn chưa có lịch
              hẹn nào.
            </Text>

            <TouchableOpacity
              style={
                styles.bookButton
              }
              onPress={() =>
                router.push(
                  '/salons',
                )
              }
            >
              <Text
                style={
                  styles.bookButtonText
                }
              >
                Đặt lịch ngay
              </Text>
            </TouchableOpacity>
          </View>
        )}

      {/* LIST */}

      {bookings.length >
        0 && (
        <FlatList
          data={bookings}
          keyExtractor={(item) =>
            String(
              item.BookingId,
            )
          }
          renderItem={
            renderBooking
          }
          contentContainerStyle={
            styles.listContent
          }
          showsVerticalScrollIndicator={
            false
          }
          refreshControl={
            <RefreshControl
              refreshing={
                refreshing
              }
              onRefresh={
                handleRefresh
              }
            />
          }
        />
      )}
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
        COLORS.background,
    },

    center: {
      flex: 1,
      justifyContent:
        'center',
      alignItems: 'center',
      backgroundColor:
        COLORS.background,
    },

    loadingText: {
      marginTop: 12,
      fontSize: 15,
      color: COLORS.gray,
    },

    header: {
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 18,
      backgroundColor:
        COLORS.white,
      flexDirection: 'row',
      alignItems: 'center',
    },

    backButton: {
      width: 38,
      height: 38,
      justifyContent:
        'center',
      alignItems: 'center',
      marginRight: 10,
    },

    backIcon: {
      fontSize: 36,
      lineHeight: 38,
      color: COLORS.text,
    },

    headerTextContainer: {
      flex: 1,
    },

    title: {
      fontSize: 25,
      fontWeight: '700',
      color: COLORS.text,
    },

    subtitle: {
      marginTop: 4,
      fontSize: 14,
      color: COLORS.gray,
    },

    listContent: {
      padding: 16,
      paddingBottom: 30,
    },

    card: {
      backgroundColor:
        COLORS.white,
      borderRadius: 16,
      padding: 16,
      marginBottom: 14,

      shadowColor: '#000',

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.08,

      shadowRadius: 6,

      elevation: 3,
    },

    cardHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems:
        'flex-start',
    },

    titleContainer: {
      flex: 1,
      paddingRight: 10,
    },

    serviceName: {
      fontSize: 18,
      fontWeight: '700',
      color: COLORS.text,
    },

    bookingId: {
      marginTop: 5,
      fontSize: 12,
      color: COLORS.gray,
    },

    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
    },

    statusText: {
      color: COLORS.white,
      fontSize: 12,
      fontWeight: '600',
    },

    divider: {
      height: 1,
      backgroundColor:
        COLORS.lightGray,
      marginVertical: 14,
    },

    infoRow: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },

    infoLabel: {
      fontSize: 14,
      color: COLORS.gray,
    },

    infoValue: {
      maxWidth: '62%',
      textAlign: 'right',
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.text,
    },

    price: {
      color: COLORS.primary,
      fontSize: 16,
    },

    errorBox: {
      margin: 16,
      padding: 14,
      borderRadius: 12,
      backgroundColor:
        '#FEE2E2',
    },

    errorText: {
      color: '#991B1B',
      fontSize: 14,
    },

    retryText: {
      marginTop: 8,
      color: COLORS.primary,
      fontWeight: '700',
    },

    empty: {
      flex: 1,
      justifyContent:
        'center',
      alignItems: 'center',
      paddingHorizontal: 30,
    },

    emptyIcon: {
      fontSize: 50,
      marginBottom: 15,
    },

    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: COLORS.text,
    },

    emptyText: {
      marginTop: 8,
      fontSize: 14,
      color: COLORS.gray,
      textAlign: 'center',
    },

    bookButton: {
      marginTop: 20,
      paddingHorizontal: 25,
      paddingVertical: 13,
      borderRadius: 12,
      backgroundColor:
        COLORS.primary,
    },

    bookButtonText: {
      color: COLORS.white,
      fontSize: 15,
      fontWeight: '700',
    },
  });