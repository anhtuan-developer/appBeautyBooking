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

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { getSalonById } from '@/services/salonService';

import {
  SalonDetail,
  SalonService,
} from '@/types/salon';

export default function SalonDetailScreen() {
  const {
    salonId,
  } = useLocalSearchParams<{
    salonId: string;
  }>();

  const [
    salon,
    setSalon,
  ] = useState<SalonDetail | null>(
    null,
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const loadSalon =
    useCallback(
      async () => {
        if (!salonId) {
          setError(
            'Không xác định được Salon.',
          );

          setIsLoading(false);

          return;
        }

        try {
          setIsLoading(true);

          setError('');

          const result =
            await getSalonById(
              Number(salonId),
            );

          setSalon(
            result.data,
          );
        } catch (err) {
          console.error(
            'Load salon detail error:',
            err,
          );

          setError(
            err instanceof Error
              ? err.message
              : 'Không thể tải thông tin Salon.',
          );
        } finally {
          setIsLoading(false);
        }
      },
      [salonId],
    );

  useEffect(() => {
    loadSalon();
  }, [loadSalon]);

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
          Đang tải thông tin
          Salon...
        </Text>
      </View>
    );
  }

  /**
   * =========================
   * ERROR
   * =========================
   */

  if (
    error ||
    !salon
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
          Không thể tải Salon
        </Text>

        <Text
          style={
            styles.errorMessage
          }
        >
          {error ||
            'Không tìm thấy Salon.'}
        </Text>

        <Pressable
          style={
            styles.primaryButton
          }
          onPress={
            loadSalon
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

  /**
   * =========================
   * SCREEN
   * =========================
   */

  return (
    <ScrollView
      style={
        styles.container
      }
      contentContainerStyle={
        styles.content
      }
    >
      {/* BACK */}

      <Pressable
        style={
          styles.backRow
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

        <Text
          style={
            styles.backLabel
          }
        >
          Danh sách Salon
        </Text>
      </Pressable>

      {/* IMAGE */}

      {salon.ImageUrl ? (
        <Image
          source={{
            uri: salon.ImageUrl,
          }}
          style={
            styles.salonImage
          }
          resizeMode="cover"
        />
      ) : (
        <View
          style={
            styles.imagePlaceholder
          }
        >
          <Text
            style={
              styles.placeholderText
            }
          >
            BeautyBooking
          </Text>
        </View>
      )}

      {/* MAIN INFO */}

      <View
        style={
          styles.card
        }
      >
        <Text
          style={
            styles.salonName
          }
        >
          {salon.SalonName}
        </Text>

        <Text
          style={
            styles.address
          }
        >
          📍 {salon.Address}
        </Text>

        {salon.Phone && (
          <Text
            style={
              styles.phone
            }
          >
            📞 {salon.Phone}
          </Text>
        )}

        {salon.Description && (
          <Text
            style={
              styles.description
            }
          >
            {salon.Description}
          </Text>
        )}

        <View
          style={
            styles.statsRow
          }
        >
          <View
            style={
              styles.stat
            }
          >
            <Text
              style={
                styles.statValue
              }
            >
              {salon.AverageRating?.toFixed(
                1,
              ) || '0.0'}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              ⭐ Đánh giá
            </Text>
          </View>

          <View
            style={
              styles.stat
            }
          >
            <Text
              style={
                styles.statValue
              }
            >
              {salon.ServiceCount}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              Dịch vụ
            </Text>
          </View>

          <View
            style={
              styles.stat
            }
          >
            <Text
              style={
                styles.statValue
              }
            >
              {salon.EmployeeCount}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              Nhân viên
            </Text>
          </View>
        </View>
      </View>

      {/* SERVICES */}

      <View
        style={
          styles.card
        }
      >
        <View
          style={
            styles.sectionHeader
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Dịch vụ
          </Text>

          <Text
            style={
              styles.sectionCount
            }
          >
            {salon.services.length}
          </Text>
        </View>

        {salon.services.length ===
        0 ? (
          <Text
            style={
              styles.emptyText
            }
          >
            Salon chưa có dịch
            vụ.
          </Text>
        ) : (
          salon.services.map(
            (
              service: SalonService,
            ) => (
              <ServiceItem
                key={
                  service.ServiceId
                }
                service={
                  service
                }
                onSelect={() => {
                  console.log(
                    '➡️ Selected service:',
                    {
                      salonId:
                        salon.SalonId,
                      serviceId:
                        service.ServiceId,
                    },
                  );

                  router.push({
                    pathname:
                      '/bookings/employee',
                    params: {
                      salonId:
                        String(
                          salon.SalonId,
                        ),
                      serviceId:
                        String(
                          service.ServiceId,
                        ),
                    },
                  });
                }}
              />
            ),
          )
        )}
      </View>

      {/* EMPLOYEES */}

      <View
        style={
          styles.card
        }
      >
        <View
          style={
            styles.sectionHeader
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Nhân viên
          </Text>

          <Text
            style={
              styles.sectionCount
            }
          >
            {salon.employees.length}
          </Text>
        </View>

        {salon.employees.length ===
        0 ? (
          <Text
            style={
              styles.emptyText
            }
          >
            Salon chưa có nhân
            viên.
          </Text>
        ) : (
          salon.employees.map(
            (
              employee,
            ) => (
              <View
                key={
                  employee.EmployeeId
                }
                style={
                  styles.employeeRow
                }
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
                        .charAt(
                          0,
                        )
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
                    {
                      employee.FullName
                    }
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
                </View>
              </View>
            ),
          )
        )}
      </View>
    </ScrollView>
  );
}

/**
 * =========================
 * SERVICE ITEM
 * =========================
 */

function ServiceItem({
  service,
  onSelect,
}: {
  service: SalonService;
  onSelect: () => void;
}) {
  return (
    <Pressable
      style={({
        pressed,
      }) => [
        styles.serviceRow,
        pressed &&
          styles.pressed,
      ]}
      onPress={onSelect}
    >
      <View
        style={
          styles.serviceInfo
        }
      >
        <Text
          style={
            styles.serviceName
          }
        >
          {
            service.ServiceName
          }
        </Text>

        {service.Description && (
          <Text
            style={
              styles.serviceDescription
            }
            numberOfLines={2}
          >
            {
              service.Description
            }
          </Text>
        )}

        <Text
          style={
            styles.duration
          }
        >
          ⏱{' '}
          {
            service.DurationMinutes
          }{' '}
          phút
        </Text>
      </View>

      <View
        style={
          styles.serviceRight
        }
      >
        <Text
          style={
            styles.price
          }
        >
          {service.Price.toLocaleString(
            'vi-VN',
          )}
          đ
        </Text>

        <Text
          style={
            styles.chooseText
          }
        >
          Chọn ›
        </Text>
      </View>
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

    content: {
      padding: 16,
      paddingBottom: 40,
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
      fontSize: 15,
      color: '#6B7280',
    },

    backRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },

    backIcon: {
      fontSize: 34,
      color: '#1F2937',
      marginRight: 8,
    },

    backLabel: {
      fontSize: 15,
      color: '#6B7280',
    },

    salonImage: {
      width: '100%',
      height: 210,
      borderRadius: 18,
      marginBottom: 14,
    },

    imagePlaceholder: {
      width: '100%',
      height: 210,
      borderRadius: 18,
      marginBottom: 14,
      justifyContent:
        'center',
      alignItems: 'center',
      backgroundColor:
        '#EDE9FE',
    },

    placeholderText: {
      fontSize: 18,
      fontWeight: '700',
      color: '#8B5CF6',
    },

    card: {
      backgroundColor:
        '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      marginBottom: 14,
      elevation: 2,
    },

    salonName: {
      fontSize: 24,
      fontWeight: '700',
      color: '#1F2937',
    },

    address: {
      marginTop: 10,
      fontSize: 14,
      color: '#6B7280',
    },

    phone: {
      marginTop: 7,
      fontSize: 14,
      color: '#6B7280',
    },

    description: {
      marginTop: 12,
      fontSize: 14,
      lineHeight: 21,
      color: '#4B5563',
    },

    statsRow: {
      flexDirection: 'row',
      marginTop: 18,
      borderTopWidth: 1,
      borderTopColor:
        '#E5E7EB',
      paddingTop: 16,
    },

    stat: {
      flex: 1,
      alignItems: 'center',
    },

    statValue: {
      fontSize: 18,
      fontWeight: '700',
      color: '#8B5CF6',
    },

    statLabel: {
      marginTop: 4,
      fontSize: 12,
      color: '#6B7280',
    },

    sectionHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },

    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#1F2937',
    },

    sectionCount: {
      minWidth: 28,
      paddingHorizontal: 8,
      paddingVertical: 4,
      textAlign: 'center',
      borderRadius: 14,
      backgroundColor:
        '#EDE9FE',
      color: '#8B5CF6',
      fontWeight: '700',
    },

    emptyText: {
      color: '#6B7280',
      fontSize: 14,
    },

    serviceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      borderTopWidth: 1,
      borderTopColor:
        '#F3F4F6',
    },

    serviceInfo: {
      flex: 1,
      paddingRight: 10,
    },

    serviceName: {
      fontSize: 16,
      fontWeight: '700',
      color: '#1F2937',
    },

    serviceDescription: {
      marginTop: 5,
      fontSize: 13,
      lineHeight: 18,
      color: '#6B7280',
    },

    duration: {
      marginTop: 6,
      fontSize: 12,
      color: '#6B7280',
    },

    serviceRight: {
      alignItems: 'flex-end',
    },

    price: {
      fontSize: 16,
      fontWeight: '700',
      color: '#8B5CF6',
    },

    chooseText: {
      marginTop: 6,
      fontSize: 13,
      fontWeight: '600',
      color: '#8B5CF6',
    },

    employeeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor:
        '#F3F4F6',
    },

    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
    },

    avatarPlaceholder: {
      width: 52,
      height: 52,
      borderRadius: 26,
      justifyContent:
        'center',
      alignItems: 'center',
      backgroundColor:
        '#EDE9FE',
    },

    avatarText: {
      fontSize: 20,
      fontWeight: '700',
      color: '#8B5CF6',
    },

    employeeInfo: {
      marginLeft: 12,
      flex: 1,
    },

    employeeName: {
      fontSize: 16,
      fontWeight: '700',
      color: '#1F2937',
    },

    specialization: {
      marginTop: 4,
      fontSize: 13,
      color: '#6B7280',
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
      marginTop: 10,
      color: '#6B7280',
      textAlign: 'center',
    },

    primaryButton: {
      marginTop: 20,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor:
        '#8B5CF6',
    },

    primaryButtonText: {
      color: '#FFFFFF',
      fontWeight: '700',
    },

    secondaryButton: {
      marginTop: 10,
      paddingHorizontal: 24,
      paddingVertical: 12,
    },

    secondaryButtonText: {
      color: '#6B7280',
      fontWeight: '600',
    },
  });