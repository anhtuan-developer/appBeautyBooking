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

import {
  useMemo,
  useState,
} from 'react';

export default function BookingDateScreen() {
  const {
    salonId,
    serviceId,
    employeeId,
  } = useLocalSearchParams<{
    salonId: string;
    serviceId: string;
    employeeId: string;
  }>();

  const [selectedDate, setSelectedDate] =
    useState<string | null>(null);

  /**
   * =========================
   * TẠO DANH SÁCH 14 NGÀY TIẾP THEO
   * =========================
   */
  const dates = useMemo(() => {
    const result: {
      date: string;
      dayName: string;
      dayNumber: number;
      month: number;
    }[] = [];

    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);

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

      const dayNames = [
        'CN',
        'T2',
        'T3',
        'T4',
        'T5',
        'T6',
        'T7',
      ];

      result.push({
        date: `${year}-${month}-${day}`,

        dayName:
          dayNames[date.getDay()],

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
   * KIỂM TRA DỮ LIỆU TRUYỀN SANG
   * =========================
   */
  if (
    !salonId ||
    !serviceId ||
    !employeeId
  ) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          Thiếu thông tin đặt lịch
        </Text>

        <Text style={styles.errorMessage}>
          Không xác định được Salon,
          dịch vụ hoặc nhân viên.
        </Text>

        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>
            Quay lại
          </Text>
        </Pressable>
      </View>
    );
  }

  /**
   * =========================
   * CHỌN NGÀY
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
   * TIẾP TỤC
   * =========================
   */
  const handleContinue = () => {
    if (!selectedDate) {
      return;
    }

    console.log(
      '➡️ Continue to available slots:',
      {
        salonId,
        serviceId,
        employeeId,
        date: selectedDate,
      },
    );

    router.push({
      pathname: '/booking/time',
      params: {
        salonId: String(salonId),
        serviceId: String(serviceId),
        employeeId: String(employeeId),
        date: selectedDate,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* =========================
          HEADER
      ========================= */}

      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
        >
          <Text style={styles.backIcon}>
            ‹
          </Text>
        </Pressable>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            Chọn ngày
          </Text>

          <Text style={styles.headerSubtitle}>
            Chọn ngày bạn muốn đặt lịch
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        {/* =========================
            THÔNG TIN BOOKING
        ========================= */}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            Thông tin đặt lịch
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Salon
            </Text>

            <Text style={styles.infoValue}>
              #{salonId}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Dịch vụ
            </Text>

            <Text style={styles.infoValue}>
              #{serviceId}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Nhân viên
            </Text>

            <Text style={styles.infoValue}>
              #{employeeId}
            </Text>
          </View>
        </View>

        {/* =========================
            CHỌN NGÀY
        ========================= */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Chọn ngày
          </Text>

          <Text style={styles.sectionSubtitle}>
            Bạn có thể đặt lịch trong 14
            ngày tới.
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.dateList
            }
          >
            {dates.map((item) => {
              const isSelected =
                selectedDate ===
                item.date;

              return (
                <Pressable
                  key={item.date}
                  style={[
                    styles.dateCard,
                    isSelected &&
                      styles.dateCardSelected,
                  ]}
                  onPress={() =>
                    handleSelectDate(
                      item.date,
                    )
                  }
                >
                  <Text
                    style={[
                      styles.dayName,
                      isSelected &&
                        styles.selectedText,
                    ]}
                  >
                    {item.dayName}
                  </Text>

                  <Text
                    style={[
                      styles.dayNumber,
                      isSelected &&
                        styles.selectedText,
                    ]}
                  >
                    {item.dayNumber}
                  </Text>

                  <Text
                    style={[
                      styles.month,
                      isSelected &&
                        styles.selectedText,
                    ]}
                  >
                    Tháng {item.month}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* =========================
            NGÀY ĐÃ CHỌN
        ========================= */}

        {selectedDate && (
          <View style={styles.selectedCard}>
            <Text
              style={
                styles.selectedCardTitle
              }
            >
              Ngày đã chọn
            </Text>

            <Text
              style={
                styles.selectedCardDate
              }
            >
              {formatDisplayDate(
                selectedDate,
              )}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* =========================
          BUTTON TIẾP TỤC
      ========================= */}

      <View style={styles.bottom}>
        <Pressable
          style={[
            styles.continueButton,
            !selectedDate &&
              styles.continueButtonDisabled,
          ]}
          disabled={!selectedDate}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>
            Tiếp tục
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
) {
  const [
    year,
    month,
    day,
  ] = value.split('-');

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

  errorTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#222222',
    marginBottom: 10,
  },

  errorMessage: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
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
    paddingBottom: 110,
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
    marginBottom: 7,
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

  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#222222',
  },

  sectionSubtitle: {
    marginTop: 5,
    marginBottom: 16,
    fontSize: 13,
    color: '#777777',
  },

  dateList: {
    paddingRight: 8,
  },

  dateCard: {
    width: 82,
    height: 105,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  dateCardSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },

  dayName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#777777',
  },

  dayNumber: {
    marginTop: 5,
    fontSize: 25,
    fontWeight: '800',
    color: '#222222',
  },

  month: {
    marginTop: 3,
    fontSize: 11,
    color: '#888888',
  },

  selectedText: {
    color: '#FFFFFF',
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

  selectedCardDate: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '800',
    color: '#8B5CF6',
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