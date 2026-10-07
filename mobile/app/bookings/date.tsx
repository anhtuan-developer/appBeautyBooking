import React, {
  useMemo,
  useState,
} from 'react';

import {
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

export default function BookingDateScreen() {
  const {
    salonId,
    serviceId,
    employeeId,
  } = useLocalSearchParams<{
    salonId?: string;
    serviceId?: string;
    employeeId?: string;
  }>();

  const [
    selectedDate,
    setSelectedDate,
  ] = useState<
    string | null
  >(null);

  /**
   * =========================
   * VALIDATE PARAMS
   * =========================
   */

  const paramsValid =
    Boolean(
      salonId &&
        serviceId &&
        employeeId,
    );

  /**
   * =========================
   * GENERATE 14 DAYS
   * =========================
   */

  const dates = useMemo(() => {
    const result: {
      date: string;
      dayName: string;
      dayNumber: number;
      month: number;
    }[] = [];

    const today =
      new Date();

    const dayNames = [
      'CN',
      'T2',
      'T3',
      'T4',
      'T5',
      'T6',
      'T7',
    ];

    for (
      let i = 0;
      i < 14;
      i++
    ) {
      const date =
        new Date(today);

      date.setDate(
        today.getDate() + i,
      );

      const year =
        date.getFullYear();

      const month =
        String(
          date.getMonth() + 1,
        ).padStart(2, '0');

      const day =
        String(
          date.getDate(),
        ).padStart(2, '0');

      result.push({
        date: `${year}-${month}-${day}`,

        dayName:
          dayNames[
            date.getDay()
          ],

        dayNumber:
          date.getDate(),

        month:
          date.getMonth() + 1,
      });
    }

    return result;
  }, []);

  /**
   * =========================
   * INVALID PARAMS
   * =========================
   */

  if (!paramsValid) {
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
          Thiếu thông tin đặt
          lịch
        </Text>

        <Text
          style={
            styles.errorMessage
          }
        >
          Không xác định được
          Salon, dịch vụ hoặc
          nhân viên.
        </Text>

        <Pressable
          style={
            styles.primaryButton
          }
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.primaryButtonText
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
   * SELECT DATE
   * =========================
   */

  const handleSelectDate = (
    date: string,
  ) => {
    setSelectedDate(date);

    console.log(
      '📅 Selected date:',
      date,
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
        !selectedDate
      ) {
        return;
      }

      console.log(
        '========================================',
      );

      console.log(
        '➡️ CONTINUE TO TIME',
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
        selectedDate,
      );

      console.log(
        '========================================',
      );

      router.push({
        pathname:
          '/bookings/time',

        params: {
          salonId:
            String(salonId),

          serviceId:
            String(serviceId),

          employeeId:
            String(employeeId),

          date:
            selectedDate,
        },
      });
    };

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
            Chọn ngày
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }
          >
            Chọn ngày bạn muốn
            đặt lịch
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        {/* BOOKING INFO */}

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

          <View
            style={
              styles.infoRow
            }
          >
            <Text
              style={
                styles.infoLabel
              }
            >
              Salon
            </Text>

            <Text
              style={
                styles.infoValue
              }
            >
              #{salonId}
            </Text>
          </View>

          <View
            style={
              styles.infoRow
            }
          >
            <Text
              style={
                styles.infoLabel
              }
            >
              Dịch vụ
            </Text>

            <Text
              style={
                styles.infoValue
              }
            >
              #{serviceId}
            </Text>
          </View>

          <View
            style={
              styles.infoRow
            }
          >
            <Text
              style={
                styles.infoLabel
              }
            >
              Nhân viên
            </Text>

            <Text
              style={
                styles.infoValue
              }
            >
              #{employeeId}
            </Text>
          </View>
        </View>

        {/* DATE */}

        <View
          style={
            styles.section
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Chọn ngày
          </Text>

          <Text
            style={
              styles.sectionSubtitle
            }
          >
            Bạn có thể đặt lịch
            trong 14 ngày tới.
          </Text>

          {dates.map(
            (item) => {
              const selected =
                selectedDate ===
                item.date;

              return (
                <Pressable
                  key={
                    item.date
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.dateCard,

                    selected &&
                      styles.dateCardSelected,

                    pressed &&
                      styles.pressed,
                  ]}
                  onPress={() =>
                    handleSelectDate(
                      item.date,
                    )
                  }
                >
                  <View
                    style={
                      styles.dayNameBox
                    }
                  >
                    <Text
                      style={[
                        styles.dayName,
                        selected &&
                          styles.selectedText,
                      ]}
                    >
                      {
                        item.dayName
                      }
                    </Text>
                  </View>

                  <View
                    style={
                      styles.dateNumberBox
                    }
                  >
                    <Text
                      style={[
                        styles.dateNumber,
                        selected &&
                          styles.selectedText,
                      ]}
                    >
                      {
                        item.dayNumber
                      }
                    </Text>

                    <Text
                      style={[
                        styles.monthText,
                        selected &&
                          styles.selectedText,
                      ]}
                    >
                      Tháng{' '}
                      {
                        item.month
                      }
                    </Text>
                  </View>

                  <View
                    style={
                      styles.radio
                    }
                  >
                    {selected && (
                      <View
                        style={
                          styles.radioSelected
                        }
                      />
                    )}
                  </View>
                </Pressable>
              );
            },
          )}
        </View>

        {/* CONTINUE */}

        <Pressable
          style={({
            pressed,
          }) => [
            styles.continueButton,

            !selectedDate &&
              styles.continueDisabled,

            pressed &&
              selectedDate &&
              styles.pressed,
          ]}
          disabled={
            !selectedDate
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
            Tiếp tục chọn giờ
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
      marginBottom: 10,
    },

    infoRow: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      marginTop: 7,
    },

    infoLabel: {
      color: '#6B7280',
      fontSize: 14,
    },

    infoValue: {
      color: '#1F2937',
      fontWeight: '600',
      fontSize: 14,
    },

    section: {
      marginBottom: 20,
    },

    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#1F2937',
    },

    sectionSubtitle: {
      marginTop: 5,
      marginBottom: 14,
      fontSize: 13,
      color: '#6B7280',
    },

    dateCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      marginBottom: 10,
      borderRadius: 14,
      backgroundColor:
        '#FFFFFF',
      borderWidth: 1,
      borderColor:
        '#E5E7EB',
    },

    dateCardSelected: {
      borderColor:
        '#8B5CF6',
      backgroundColor:
        '#EDE9FE',
    },

    dayNameBox: {
      width: 48,
      alignItems: 'center',
    },

    dayName: {
      fontSize: 14,
      fontWeight: '700',
      color: '#6B7280',
    },

    dateNumberBox: {
      flex: 1,
      marginLeft: 10,
    },

    dateNumber: {
      fontSize: 18,
      fontWeight: '700',
      color: '#1F2937',
    },

    monthText: {
      marginTop: 2,
      fontSize: 12,
      color: '#6B7280',
    },

    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor:
        '#D1D5DB',
      justifyContent:
        'center',
      alignItems: 'center',
    },

    radioSelected: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor:
        '#8B5CF6',
    },

    selectedText: {
      color: '#8B5CF6',
    },

    continueButton: {
      marginTop: 8,
      paddingVertical: 15,
      borderRadius: 13,
      alignItems: 'center',
      backgroundColor:
        '#8B5CF6',
    },

    continueDisabled: {
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

    errorTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#1F2937',
      textAlign: 'center',
    },

    errorMessage: {
      marginTop: 8,
      color: '#6B7280',
      textAlign: 'center',
    },

    primaryButton: {
      marginTop: 20,
      paddingHorizontal: 25,
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor:
        '#8B5CF6',
    },

    primaryButtonText: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
  });