import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
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
  AvailableSlot,
  getAvailableSlots,
} from '@/services/scheduleService';

export default function BookingTimeScreen() {
  const {
    salonId,
    serviceId,
    employeeId,
    date,
  } = useLocalSearchParams<{
    salonId?: string;
    serviceId?: string;
    employeeId?: string;
    date?: string;
  }>();

  const [
    slots,
    setSlots,
  ] = useState<
    AvailableSlot[]
  >([]);

  const [
    selectedSlot,
    setSelectedSlot,
  ] = useState<
    AvailableSlot | null
  >(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const [
    availabilityMessage,
    setAvailabilityMessage,
  ] = useState('');

  /**
   * =========================
   * LOAD SLOTS
   * =========================
   */

  const loadSlots =
    useCallback(
      async () => {
        setIsLoading(true);

        setError('');

        setAvailabilityMessage('');

        setSelectedSlot(null);

        setSlots([]);

        /**
         * PARAMS
         */

        if (
          !salonId ||
          !serviceId ||
          !employeeId ||
          !date
        ) {
          setError(
            'Thiếu thông tin đặt lịch.',
          );

          setIsLoading(false);

          return;
        }

        const parsedSalonId =
          Number(salonId);

        const parsedServiceId =
          Number(serviceId);

        const parsedEmployeeId =
          Number(employeeId);

        if (
          !Number.isInteger(
            parsedSalonId,
          ) ||
          parsedSalonId <= 0
        ) {
          setError(
            'Salon ID không hợp lệ.',
          );

          setIsLoading(false);

          return;
        }

        if (
          !Number.isInteger(
            parsedServiceId,
          ) ||
          parsedServiceId <= 0
        ) {
          setError(
            'Service ID không hợp lệ.',
          );

          setIsLoading(false);

          return;
        }

        if (
          !Number.isInteger(
            parsedEmployeeId,
          ) ||
          parsedEmployeeId <= 0
        ) {
          setError(
            'Employee ID không hợp lệ.',
          );

          setIsLoading(false);

          return;
        }

        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(
            date,
          )
        ) {
          setError(
            'Ngày đặt lịch không hợp lệ.',
          );

          setIsLoading(false);

          return;
        }

        try {
          console.log(
            '========================================',
          );

          console.log(
            '🕐 LOAD AVAILABLE SLOTS',
          );

          console.log(
            '➡️ salonId:',
            parsedSalonId,
          );

          console.log(
            '➡️ serviceId:',
            parsedServiceId,
          );

          console.log(
            '➡️ employeeId:',
            parsedEmployeeId,
          );

          console.log(
            '➡️ date:',
            date,
          );

          console.log(
            '========================================',
          );

          const result =
            await getAvailableSlots(
              parsedEmployeeId,
              parsedServiceId,
              date,
            );

          console.log(
            '🕐 AVAILABLE SLOTS RESPONSE:',
            JSON.stringify(
              result,
              null,
              2,
            ),
          );

          const data =
            result.data;

          if (
            data?.availabilityMessage
          ) {
            setAvailabilityMessage(
              data.availabilityMessage,
            );
          }

          const availableSlots =
            (data?.slots || []).filter(
              (slot) =>
                slot.available !==
                false,
            );

          setSlots(
            availableSlots,
          );

          if (
            availableSlots.length ===
              0 &&
            !data?.availabilityMessage
          ) {
            setAvailabilityMessage(
              'Hiện không có khung giờ trống.',
            );
          }
        } catch (err) {
          console.error(
            '❌ Load available slots failed:',
            err,
          );

          setError(
            err instanceof Error
              ? err.message
              : 'Không thể tải khung giờ.',
          );
        } finally {
          setIsLoading(false);
        }
      },
      [
        salonId,
        serviceId,
        employeeId,
        date,
      ],
    );

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  /**
   * =========================
   * SELECT SLOT
   * =========================
   */

  const handleSelectSlot =
    (
      slot: AvailableSlot,
    ) => {
      if (
        slot.available ===
        false
      ) {
        return;
      }

      setSelectedSlot(
        slot,
      );

      console.log(
        '🕐 Selected slot:',
        slot,
      );
    };

  /**
   * =========================
   * CONTINUE
   * =========================
   */

  const handleContinue =
    () => {
      if (
        !selectedSlot ||
        !salonId ||
        !serviceId ||
        !employeeId ||
        !date
      ) {
        return;
      }

      console.log(
        '========================================',
      );

      console.log(
        '➡️ CONTINUE TO CONFIRM BOOKING',
      );

      console.log(
        '➡️ salonId:',
        salonId,
      );

      console.log(
        '➡️ serviceId:',
        serviceId,
      );

      console.log(
        '➡️ employeeId:',
        employeeId,
      );

      console.log(
        '➡️ date:',
        date,
      );

      console.log(
        '➡️ startTime:',
        selectedSlot.startTime,
      );

      console.log(
        '➡️ endTime:',
        selectedSlot.endTime,
      );

      console.log(
        '========================================',
      );

      router.push({
        pathname:
          '/bookings/confirm',

        params: {
          salonId:
            String(salonId),

          serviceId:
            String(serviceId),

          employeeId:
            String(employeeId),

          date:
            String(date),

          startTime:
            String(
              selectedSlot.startTime,
            ),

          endTime:
            String(
              selectedSlot.endTime,
            ),
        },
      });
    };

  /**
   * =========================
   * LOADING
   * =========================
   */

  if (isLoading) {
    return (
      <View
        style={
          styles.center
        }
      >
        <ActivityIndicator
          size="large"
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Đang tìm khung giờ
          trống...
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
        style={
          styles.header
        }
      >
        <Pressable
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
            Chọn giờ
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }
          >
            {date}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        {/* INFO */}

        <View
          style={
            styles.infoCard
          }
        >
          <Text
            style={
              styles.infoTitle
            }
          >
            Thông tin đặt lịch
          </Text>

          <Text
            style={
              styles.infoText
            }
          >
            Salon: #{salonId}
          </Text>

          <Text
            style={
              styles.infoText
            }
          >
            Dịch vụ: #{serviceId}
          </Text>

          <Text
            style={
              styles.infoText
            }
          >
            Nhân viên: #
            {employeeId}
          </Text>

          <Text
            style={
              styles.infoText
            }
          >
            Ngày: {date}
          </Text>
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

            <Pressable
              onPress={
                loadSlots
              }
            >
              <Text
                style={
                  styles.retryText
                }
              >
                Thử lại
              </Text>
            </Pressable>
          </View>
        )}

        {/* AVAILABILITY */}

        {availabilityMessage && (
          <View
            style={
              styles.messageBox
            }
          >
            <Text
              style={
                styles.messageText
              }
            >
              {availabilityMessage}
            </Text>
          </View>
        )}

        {/* TITLE */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Khung giờ trống
        </Text>

        {/* SLOTS */}

        {slots.length ===
        0 ? (
          <View
            style={
              styles.emptyBox
            }
          >
            <Text
              style={
                styles.emptyIcon
              }
            >
              🕐
            </Text>

            <Text
              style={
                styles.emptyTitle
              }
            >
              Không có giờ trống
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Vui lòng chọn ngày
              khác.
            </Text>
          </View>
        ) : (
          <View
            style={
              styles.slotsContainer
            }
          >
            {slots.map(
              (
                slot,
                index,
              ) => {
                const selected =
                  selectedSlot
                    ?.startTime ===
                    slot.startTime &&
                  selectedSlot
                    ?.endTime ===
                    slot.endTime;

                return (
                  <Pressable
                    key={`${slot.startTime}-${slot.endTime}-${index}`}
                    style={({
                      pressed,
                    }) => [
                      styles.slot,
                      selected &&
                        styles.slotSelected,
                      pressed &&
                        styles.pressed,
                    ]}
                    onPress={() =>
                      handleSelectSlot(
                        slot,
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.slotText,
                        selected &&
                          styles.slotTextSelected,
                      ]}
                    >
                      {slot.startTime.substring(
                        0,
                        5,
                      )}
                    </Text>

                    <Text
                      style={[
                        styles.slotEndText,
                        selected &&
                          styles.slotTextSelected,
                      ]}
                    >
                      -
                      {
                        slot.endTime.substring(
                          0,
                          5,
                        )
                      }
                    </Text>
                  </Pressable>
                );
              },
            )}
          </View>
        )}

        {/* CONTINUE */}

        <Pressable
          style={({
            pressed,
          }) => [
            styles.continueButton,

            !selectedSlot &&
              styles.disabledButton,

            pressed &&
              selectedSlot &&
              styles.pressed,
          ]}
          disabled={
            !selectedSlot
          }
          onPress={
            handleContinue
          }
        >
          <Text
            style={
              styles.continueText
            }
          >
            Xác nhận booking
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
      backgroundColor:
        '#F8F7FC',
    },

    loadingText: {
      marginTop: 12,
      color: '#6B7280',
    },

    header: {
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor:
        '#FFFFFF',
      flexDirection: 'row',
      alignItems: 'center',
    },

    backIcon: {
      fontSize: 36,
      color: '#1F2937',
      marginRight: 10,
    },

    headerContent: {
      flex: 1,
    },

    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: '#1F2937',
    },

    headerSubtitle: {
      marginTop: 4,
      fontSize: 13,
      color: '#6B7280',
    },

    content: {
      padding: 16,
      paddingBottom: 30,
    },

    infoCard: {
      padding: 16,
      borderRadius: 14,
      backgroundColor:
        '#EDE9FE',
      marginBottom: 20,
    },

    infoTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: '#1F2937',
      marginBottom: 8,
    },

    infoText: {
      marginTop: 5,
      fontSize: 14,
      color: '#4B5563',
    },

    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#1F2937',
      marginBottom: 14,
    },

    slotsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent:
        'space-between',
    },

    slot: {
      width: '48%',
      minHeight: 60,
      marginBottom: 12,
      borderRadius: 13,
      borderWidth: 1,
      borderColor:
        '#E5E7EB',
      backgroundColor:
        '#FFFFFF',
      justifyContent:
        'center',
      alignItems: 'center',
      flexDirection: 'row',
    },

    slotSelected: {
      backgroundColor:
        '#8B5CF6',
      borderColor:
        '#8B5CF6',
    },

    slotText: {
      fontSize: 17,
      fontWeight: '700',
      color: '#1F2937',
    },

    slotEndText: {
      marginLeft: 4,
      fontSize: 14,
      color: '#6B7280',
    },

    slotTextSelected: {
      color: '#FFFFFF',
    },

    messageBox: {
      padding: 13,
      borderRadius: 12,
      marginBottom: 16,
      backgroundColor:
        '#FEF3C7',
    },

    messageText: {
      color: '#92400E',
      fontSize: 14,
    },

    errorBox: {
      padding: 14,
      borderRadius: 12,
      marginBottom: 16,
      backgroundColor:
        '#FEE2E2',
    },

    errorText: {
      color: '#991B1B',
      fontSize: 14,
    },

    retryText: {
      marginTop: 8,
      color: '#8B5CF6',
      fontWeight: '700',
    },

    emptyBox: {
      alignItems: 'center',
      padding: 30,
    },

    emptyIcon: {
      fontSize: 45,
    },

    emptyTitle: {
      marginTop: 10,
      fontSize: 18,
      fontWeight: '700',
      color: '#1F2937',
    },

    emptyText: {
      marginTop: 6,
      color: '#6B7280',
    },

    continueButton: {
      marginTop: 20,
      paddingVertical: 15,
      borderRadius: 13,
      alignItems: 'center',
      backgroundColor:
        '#8B5CF6',
    },

    disabledButton: {
      backgroundColor:
        '#D1D5DB',
    },

    continueText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },

    pressed: {
      opacity: 0.7,
    },
  });