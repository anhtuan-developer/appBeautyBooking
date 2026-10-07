import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Image,
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

import { getSalonEmployees } from '@/services/salonService';

import {
  SalonEmployee,
} from '@/types/salon';

export default function BookingEmployeeScreen() {
  const {
    salonId,
    serviceId,
  } = useLocalSearchParams<{
    salonId?: string;
    serviceId?: string;
  }>();

  const [
    employees,
    setEmployees,
  ] = useState<SalonEmployee[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  /**
   * =========================
   * LOAD EMPLOYEES
   * =========================
   */
  const loadEmployees = useCallback(
    async () => {
      if (
        !salonId ||
        !serviceId
      ) {
        setError(
          'Thiếu thông tin Salon hoặc dịch vụ.',
        );

        setIsLoading(false);

        return;
      }

      const parsedSalonId =
        Number(salonId);

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

      try {
        setIsLoading(true);
        setError('');

        console.log(
          '👤 LOAD SALON EMPLOYEES',
        );

        console.log(
          '➡️ salonId:',
          parsedSalonId,
        );

        const result =
          await getSalonEmployees(
            parsedSalonId,
          );

        console.log(
          '👤 EMPLOYEES RESPONSE:',
          JSON.stringify(
            result,
            null,
            2,
          ),
        );

        setEmployees(
          result.data || [],
        );
      } catch (err) {
        console.error(
          '❌ Load employees error:',
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Không thể tải danh sách nhân viên.',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [
      salonId,
      serviceId,
    ],
  );

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

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
          Đang tải nhân viên...
        </Text>
      </View>
    );
  }

  /**
   * =========================
   * ERROR - MISSING PARAMS
   * =========================
   */
  if (
    !salonId ||
    !serviceId
  ) {
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
          Thiếu thông tin đặt lịch
        </Text>

        <Pressable
          style={
            styles.button
          }
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.buttonText
            }
          >
            Quay lại
          </Text>
        </Pressable>
      </View>
    );
  }

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
            Chọn nhân viên
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }
          >
            Chọn nhân viên bạn
            muốn phục vụ
          </Text>
        </View>
      </View>

      {/* BOOKING INFO */}
      <View
        style={
          styles.bookingInfo
        }
      >
        <Text
          style={
            styles.bookingInfoTitle
          }
        >
          Thông tin đặt lịch
        </Text>

        <Text
          style={
            styles.bookingInfoText
          }
        >
          Salon: #{salonId}
        </Text>

        <Text
          style={
            styles.bookingInfoText
          }
        >
          Dịch vụ: #{serviceId}
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
              loadEmployees
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

      {/* LIST */}
      <ScrollView
        contentContainerStyle={
          styles.listContent
        }
      >
        {employees.length ===
        0 ? (
          <View
            style={
              styles.emptyBox
            }
          >
            <Text
              style={
                styles.emptyTitle
              }
            >
              Chưa có nhân viên
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Salon hiện chưa có
              nhân viên.
            </Text>
          </View>
        ) : (
          employees.map(
            (
              employee,
            ) => (
              <EmployeeItem
                key={
                  employee.EmployeeId
                }
                employee={
                  employee
                }
                onSelect={() => {
                  console.log(
                    '========================================',
                  );

                  console.log(
                    '✅ SELECT EMPLOYEE',
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
                    employee.EmployeeId,
                  );

                  console.log(
                    '========================================',
                  );

                  router.push({
                    pathname:
                      '/bookings/date',

                    params: {
                      salonId:
                        String(
                          salonId,
                        ),

                      serviceId:
                        String(
                          serviceId,
                        ),

                      employeeId:
                        String(
                          employee.EmployeeId,
                        ),
                    },
                  });
                }}
              />
            ),
          )
        )}
      </ScrollView>
    </View>
  );
}

/**
 * =========================
 * EMPLOYEE ITEM
 * =========================
 */
function EmployeeItem({
  employee,
  onSelect,
}: {
  employee: SalonEmployee;
  onSelect: () => void;
}) {
  return (
    <Pressable
      style={({
        pressed,
      }) => [
        styles.employeeCard,
        pressed &&
          styles.pressed,
      ]}
      onPress={onSelect}
    >
      {employee.AvatarUrl ? (
        <Image
          source={{
            uri: employee.AvatarUrl,
          }}
          style={
            styles.avatar
          }
        />
      ) : (
        <View
          style={
            styles.avatarPlaceholder
          }
        >
          <Text
            style={
              styles.avatarText
            }
          >
            {employee.FullName
              .charAt(0)
              .toUpperCase()}
          </Text>
        </View>
      )}

      <View
        style={
          styles.employeeInfo
        }
      >
        <Text
          style={
            styles.employeeName
          }
        >
          {employee.FullName}
        </Text>

        {employee.Specialization && (
          <Text
            style={
              styles.specialization
            }
          >
            {
              employee.Specialization
            }
          </Text>
        )}

        {employee.Phone && (
          <Text
            style={
              styles.phone
            }
          >
            📞 {employee.Phone}
          </Text>
        )}
      </View>

      <Text
        style={
          styles.arrow
        }
      >
        ›
      </Text>
    </Pressable>
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

    bookingInfo: {
      margin: 16,
      padding: 16,
      borderRadius: 14,
      backgroundColor:
        '#EDE9FE',
    },

    bookingInfoTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#1F2937',
      marginBottom: 8,
    },

    bookingInfoText: {
      marginTop: 4,
      fontSize: 14,
      color: '#4B5563',
    },

    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 30,
    },

    employeeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        '#FFFFFF',
      padding: 16,
      marginBottom: 12,
      borderRadius: 16,
      elevation: 2,
    },

    pressed: {
      opacity: 0.7,
    },

    avatar: {
      width: 58,
      height: 58,
      borderRadius: 29,
    },

    avatarPlaceholder: {
      width: 58,
      height: 58,
      borderRadius: 29,
      justifyContent:
        'center',
      alignItems: 'center',
      backgroundColor:
        '#EDE9FE',
    },

    avatarText: {
      fontSize: 22,
      fontWeight: '700',
      color: '#8B5CF6',
    },

    employeeInfo: {
      flex: 1,
      marginLeft: 14,
    },

    employeeName: {
      fontSize: 17,
      fontWeight: '700',
      color: '#1F2937',
    },

    specialization: {
      marginTop: 4,
      fontSize: 13,
      color: '#6B7280',
    },

    phone: {
      marginTop: 4,
      fontSize: 12,
      color: '#9CA3AF',
    },

    arrow: {
      fontSize: 30,
      color: '#8B5CF6',
      marginLeft: 8,
    },

    emptyBox: {
      padding: 30,
      alignItems: 'center',
    },

    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#1F2937',
    },

    emptyText: {
      marginTop: 8,
      color: '#6B7280',
      textAlign: 'center',
    },

    errorBox: {
      marginHorizontal: 16,
      marginBottom: 12,
      padding: 14,
      borderRadius: 12,
      backgroundColor:
        '#FEE2E2',
    },

    errorText: {
      color: '#991B1B',
    },

    retryText: {
      marginTop: 8,
      color: '#8B5CF6',
      fontWeight: '700',
    },

    errorTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#1F2937',
      textAlign: 'center',
    },

    button: {
      marginTop: 20,
      paddingHorizontal: 25,
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor:
        '#8B5CF6',
    },

    buttonText: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
  });