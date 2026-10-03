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

  const [slots, setSlots] =
    useState<AvailableSlot[]>([]);

  const [selectedSlot, setSelectedSlot] =
    useState<AvailableSlot | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [availabilityMessage, setAvailabilityMessage] =
    useState('');

  /**
   * =========================
   * LOAD AVAILABLE SLOTS
   * =========================
   */
  const loadSlots = useCallback(
    async () => {
      /**
       * Reset trạng thái
       */
      setIsLoading(true);
      setError('');
      setAvailabilityMessage('');
      setSelectedSlot(null);
      setSlots([]);

      /**
       * =========================
       * KIỂM TRA PARAMS
       * =========================
       */
      if (
        !salonId ||
        !serviceId ||
        !employeeId ||
        !date
      ) {
        console.error(
          '❌ Missing booking params:',
          {
            salonId,
            serviceId,
            employeeId,
            date,
          },
        );

        setError(
          'Thiếu thông tin đặt lịch.',
        );

        setIsLoading(false);

        return;
      }

      /**
       * =========================
       * PARSE ID
       * =========================
       */
      const parsedSalonId =
        Number(salonId);

      const parsedServiceId =
        Number(serviceId);

      const parsedEmployeeId =
        Number(employeeId);

      /**
       * =========================
       * DEBUG PARAMS
       * =========================
       */
      console.log(
        '🔎 Booking params nhận được:',
        {
          salonId,
          serviceId,
          employeeId,
          date,
        },
      );

      console.log(
        '🔢 Booking params sau Number():',
        {
          salonId:
            parsedSalonId,

          serviceId:
            parsedServiceId,

          employeeId:
            parsedEmployeeId,

          date,
        },
      );

      /**
       * =========================
       * VALIDATE SALON ID
       * =========================
       */
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

      /**
       * =========================
       * VALIDATE SERVICE ID
       * =========================
       */
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

      /**
       * =========================
       * VALIDATE EMPLOYEE ID
       * =========================
       */
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

      /**
       * =========================
       * VALIDATE DATE
       * =========================
       */
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
          date,
        )
      ) {
        console.error(
          '❌ Invalid date:',
          date,
        );

        setError(
          'Ngày đặt lịch không hợp lệ.',
        );

        setIsLoading(false);

        return;
      }

      try {
        /**
         * =========================
         * LOG REQUEST
         * =========================
         */
        console.log(
          '🌐 GET AVAILABLE SLOTS',
        );

        console.log(
          '➡️ employeeId:',
          parsedEmployeeId,
        );

        console.log(
          '➡️ serviceId:',
          parsedServiceId,
        );

        console.log(
          '➡️ date:',
          date,
        );

        /**
         * =========================
         * CALL BACKEND
         * =========================
         */
        const result =
          await getAvailableSlots(
            parsedEmployeeId,
            parsedServiceId,
            date,
          );

        /**
         * =========================
         * LOG RESPONSE
         * =========================
         */
        console.log(
          '📦 Available slots response:',
          JSON.stringify(
            result,
            null,
            2,
          ),
        );

        /**
         * =========================
         * CHECK RESPONSE
         * =========================
         */
        if (!result.success) {
          const message =
            result.message ||
            'Không thể lấy giờ trống.';

          console.error(
            '❌ Backend trả success=false:',
            message,
          );

          setError(message);

          setSlots([]);

          return;
        }

        /**
         * =========================
         * GET SLOTS
         * =========================
         */
        const availableSlots =
          result.data?.slots ?? [];

        const backendAvailabilityMessage =
          result.data?.availabilityMessage ||
          '';

        setAvailabilityMessage(
          backendAvailabilityMessage,
        );

        console.log(
          '🕐 Available slots:',
          availableSlots,
        );

        /**
         * =========================
         * LOG EMPLOYEE / SERVICE
         * =========================
         */
        if (result.data) {
          console.log(
            '👤 Employee:',
            result.data.employee,
          );

          console.log(
            '💇 Service:',
            result.data.service,
          );

          console.log(
            '📅 Date:',
            result.data.date,
          );

          console.log(
            '📆 Day of week:',
            result.data.dayOfWeek,
          );
        }

        setSlots(
          availableSlots,
        );
      } catch (err) {
        console.error(
          '❌ Load available slots error:',
          err,
        );

        setSlots([]);

        setError(
          err instanceof Error
            ? err.message
            : 'Không thể tải giờ trống.',
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

  /**
   * =========================
   * LOAD KHI MỞ SCREEN
   * =========================
   */
  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  /**
   * =========================
   * CHỌN SLOT
   * =========================
   */
  const handleSelectSlot = (
    slot: AvailableSlot,
  ) => {
    /**
     * Backend có thể trả:
     * available = false
     *
     * thì không cho chọn.
     */
    if (
      slot.available === false
    ) {
      return;
    }

    console.log(
      '🕐 Selected slot:',
      {
        startTime:
          slot.startTime,

        endTime:
          slot.endTime,
      },
    );

    setSelectedSlot(slot);
  };

  /**
   * =========================
   * TIẾP TỤC
   * =========================
   */
  const handleContinue = () => {
    if (!selectedSlot) {
      return;
    }

    /**
     * Kiểm tra lại dữ liệu
     */
    if (
      !salonId ||
      !serviceId ||
      !employeeId ||
      !date
    ) {
      setError(
        'Thông tin đặt lịch không đầy đủ.',
      );

      return;
    }

    /**
     * =========================
     * BOOKING PARAMS
     * =========================
     *
     * Đây là 6 dữ liệu cần truyền
     * sang màn hình confirm.
     */
    const bookingParams = {
      salonId: String(
        salonId,
      ),

      serviceId: String(
        serviceId,
      ),

      employeeId: String(
        employeeId,
      ),

      date: String(
        date,
      ),

      startTime:
        selectedSlot.startTime,

      endTime:
        selectedSlot.endTime,
    };

    console.log(
      '➡️ Continue to booking confirmation:',
      bookingParams,
    );

    /**
     * =========================
     * NAVIGATE CONFIRM
     * =========================
     */
    router.push({
      pathname:
        '/booking/confirm',

      params:
        bookingParams,
    });
  };

  /**
   * =========================
   * THIẾU PARAMS
   * =========================
   */
  if (
    !salonId ||
    !serviceId ||
    !employeeId ||
    !date
  ) {
    return (
      <View
        style={styles.center}
      >
        <Text
          style={styles.errorTitle}
        >
          Thiếu thông tin đặt lịch
        </Text>

        <Text
          style={styles.errorText}
        >
          Không xác định được Salon,
          dịch vụ, nhân viên hoặc
          ngày đặt lịch.
        </Text>

        <Pressable
          style={styles.backButton}
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.backButtonText
            }
          >
            Quay lại
          </Text>
        </Pressable>
      </View>
    );
  }

  /**
   * =========================
   * LOADING
   * =========================
   */
  if (isLoading) {
    return (
      <View
        style={styles.center}
      >
        <ActivityIndicator
          size="large"
          color="#8B5CF6"
        />

        <Text
          style={styles.loadingText}
        >
          Đang kiểm tra giờ trống...
        </Text>

        <Text
          style={styles.loadingDate}
        >
          {formatDisplayDate(date)}
        </Text>
      </View>
    );
  }

  /**
   * =========================
   * UI
   * =========================
   */
  return (
    <View
      style={styles.container}
    >
      {/* =========================
          HEADER
      ========================== */}

      <View
        style={styles.header}
      >
        <Pressable
          onPress={() =>
            router.back()
          }
          hitSlop={10}
        >
          <Text
            style={styles.backIcon}
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
            style={styles.headerTitle}
          >
            Chọn giờ
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }
          >
            Chọn thời gian bạn muốn
            đặt lịch
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
        {/* =========================
            BOOKING INFO
        ========================== */}

        <View
          style={styles.infoCard}
        >
          <Text
            style={styles.infoTitle}
          >
            Thông tin đặt lịch
          </Text>

          <View
            style={styles.infoRow}
          >
            <Text
              style={styles.infoLabel}
            >
              Salon
            </Text>

            <Text
              style={styles.infoValue}
            >
              #{salonId}
            </Text>
          </View>

          <View
            style={styles.infoRow}
          >
            <Text
              style={styles.infoLabel}
            >
              Dịch vụ
            </Text>

            <Text
              style={styles.infoValue}
            >
              #{serviceId}
            </Text>
          </View>

          <View
            style={styles.infoRow}
          >
            <Text
              style={styles.infoLabel}
            >
              Nhân viên
            </Text>

            <Text
              style={styles.infoValue}
            >
              #{employeeId}
            </Text>
          </View>

          <View
            style={styles.infoRow}
          >
            <Text
              style={styles.infoLabel}
            >
              Ngày
            </Text>

            <Text
              style={styles.infoValue}
            >
              {formatDisplayDate(
                date,
              )}
            </Text>
          </View>
        </View>

        {/* =========================
            ERROR
        ========================== */}

        {error ? (
          <View
            style={styles.errorCard}
          >
            <Text
              style={
                styles.errorCardTitle
              }
            >
              Không thể tải giờ trống
            </Text>

            <Text
              style={
                styles.errorCardText
              }
            >
              {error}
            </Text>

            <Pressable
              style={
                styles.retryButton
              }
              onPress={loadSlots}
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
        ) : null}

        {/* =========================
            EMPTY
        ========================== */}

        {!error &&
        slots.length === 0 ? (
          <View
            style={styles.emptyCard}
          >
            <Text
              style={styles.emptyIcon}
            >
              🕐
            </Text>

            <Text
              style={styles.emptyTitle}
            >
              Không có giờ trống
            </Text>

            <Text
              style={styles.emptyText}
            >
              {availabilityMessage ||
                'Hiện tại không có khung giờ phù hợp cho ngày này.'}
            </Text>

            <Pressable
              style={
                styles.emptyButton
              }
              onPress={() =>
                router.back()
              }
            >
              <Text
                style={
                  styles.emptyButtonText
                }
              >
                Chọn ngày khác
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* =========================
            SLOTS
        ========================== */}

        {!error &&
        slots.length > 0 ? (
          <View
            style={styles.slotSection}
          >
            <Text
              style={styles.sectionTitle}
            >
              Giờ còn trống
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Chọn một khung giờ phù hợp
            </Text>

            <View
              style={styles.slotGrid}
            >
              {slots.map(
                (
                  slot,
                  index,
                ) => {
                  const isSelected =
                    selectedSlot
                      ?.startTime ===
                      slot.startTime &&
                    selectedSlot
                      ?.endTime ===
                      slot.endTime;

                  const isUnavailable =
                    slot.available ===
                    false;

                  return (
                    <Pressable
                      key={`${slot.startTime}-${slot.endTime}-${index}`}
                      disabled={
                        isUnavailable
                      }
                      style={[
                        styles.slotCard,

                        isSelected &&
                          styles.slotCardSelected,

                        isUnavailable &&
                          styles.slotCardDisabled,
                      ]}
                      onPress={() =>
                        handleSelectSlot(
                          slot,
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.slotTime,

                          isSelected &&
                            styles.slotTimeSelected,

                          isUnavailable &&
                            styles.slotTimeDisabled,
                        ]}
                      >
                        {slot.startTime}
                      </Text>

                      <Text
                        style={[
                          styles.slotSeparator,

                          isSelected &&
                            styles.slotTimeSelected,

                          isUnavailable &&
                            styles.slotTimeDisabled,
                        ]}
                      >
                        -
                      </Text>

                      <Text
                        style={[
                          styles.slotTime,

                          isSelected &&
                            styles.slotTimeSelected,

                          isUnavailable &&
                            styles.slotTimeDisabled,
                        ]}
                      >
                        {slot.endTime}
                      </Text>

                      {isSelected ? (
                        <View
                          style={
                            styles.selectedBadge
                          }
                        >
                          <Text
                            style={
                              styles.selectedBadgeText
                            }
                          >
                            ✓
                          </Text>
                        </View>
                      ) : null}
                    </Pressable>
                  );
                },
              )}
            </View>
          </View>
        ) : null}

        {/* =========================
            SELECTED SLOT
        ========================== */}

        {selectedSlot ? (
          <View
            style={
              styles.selectedCard
            }
          >
            <Text
              style={
                styles.selectedCardTitle
              }
            >
              Giờ đã chọn
            </Text>

            <Text
              style={
                styles.selectedTime
              }
            >
              {selectedSlot.startTime}
              {' - '}
              {selectedSlot.endTime}
            </Text>

            <Text
              style={
                styles.selectedDate
              }
            >
              {formatDisplayDate(
                date,
              )}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* =========================
          BOTTOM BUTTON
      ========================== */}

      <View
        style={styles.bottom}
      >
        <Pressable
          style={[
            styles.continueButton,

            !selectedSlot &&
              styles.continueButtonDisabled,
          ]}
          disabled={!selectedSlot}
          onPress={handleContinue}
        >
          <Text
            style={styles.continueText}
          >
            Tiếp tục xác nhận
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/**
 * =========================
 * FORMAT DATE
 * =========================
 */
function formatDisplayDate(
  value: string,
): string {
  const [
    year,
    month,
    day,
  ] = value.split('-');

  if (
    !year ||
    !month ||
    !day
  ) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

/**
 * =========================
 * STYLES
 * =========================
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7FC',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8F7FC',
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '700',
    color: '#444444',
  },

  loadingDate: {
    marginTop: 6,
    fontSize: 14,
    color: '#777777',
  },

  errorTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#222222',
    marginBottom: 10,
    textAlign: 'center',
  },

  errorText: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },

  backButton: {
    width: '100%',
    maxWidth: 320,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
  },

  backIcon: {
    fontSize: 34,
    lineHeight: 34,
    color: '#222222',
    marginRight: 12,
  },

  headerContent: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#222222',
  },

  headerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#777777',
  },

  content: {
    padding: 16,
    paddingBottom: 120,
  },

  infoCard: {
    backgroundColor: '#EDE9FE',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#6D28D9',
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  infoLabel: {
    fontSize: 14,
    color: '#6D28D9',
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5B21B6',
  },

  errorCard: {
    backgroundColor: '#FFF1F2',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },

  errorCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#BE123C',
    marginBottom: 6,
  },

  errorCardText: {
    fontSize: 14,
    color: '#9F1239',
    lineHeight: 21,
  },

  retryButton: {
    marginTop: 14,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#BE123C',
    justifyContent: 'center',
    alignItems: 'center',
  },

  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },

  emptyIcon: {
    fontSize: 42,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#222222',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: '#777777',
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 20,
  },

  emptyButton: {
    height: 46,
    paddingHorizontal: 22,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  slotSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#222222',
  },

  sectionSubtitle: {
    marginTop: 5,
    marginBottom: 18,
    fontSize: 13,
    color: '#777777',
  },

  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  slotCard: {
    width: '48%',
    minHeight: 62,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },

  slotCardSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },

  slotCardDisabled: {
    backgroundColor: '#F3F3F3',
    borderColor: '#E5E5E5',
    opacity: 0.6,
  },

  slotTime: {
    fontSize: 15,
    fontWeight: '800',
    color: '#333333',
  },

  slotTimeSelected: {
    color: '#FFFFFF',
  },

  slotTimeDisabled: {
    color: '#999999',
  },

  slotSeparator: {
    fontSize: 13,
    color: '#777777',
    marginVertical: 1,
  },

  selectedBadge: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedBadgeText: {
    color: '#8B5CF6',
    fontSize: 13,
    fontWeight: '900',
  },

  selectedCard: {
    marginTop: 16,
    padding: 18,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },

  selectedCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#777777',
  },

  selectedTime: {
    marginTop: 7,
    fontSize: 24,
    fontWeight: '800',
    color: '#8B5CF6',
  },

  selectedDate: {
    marginTop: 5,
    fontSize: 14,
    color: '#777777',
  },

  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },

  continueButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  continueButtonDisabled: {
    backgroundColor: '#CFCFCF',
  },

  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});