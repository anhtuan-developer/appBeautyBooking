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

import { getSalonEmployees } from '@/services/salonService';

import { SalonEmployee } from '@/types/salon';

export default function BookingEmployeeScreen() {
  const {
    salonId,
    serviceId,
  } = useLocalSearchParams<{
    salonId: string;
    serviceId: string;
  }>();

  const [employees, setEmployees] =
    useState<SalonEmployee[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  /**
   * =========================
   * LOAD EMPLOYEES
   * =========================
   */
  const loadEmployees = useCallback(
    async () => {
      if (!salonId || !serviceId) {
        setError(
          'Thiếu thông tin Salon hoặc dịch vụ.',
        );

        setIsLoading(false);
        return;
      }

      const parsedSalonId =
        Number(salonId);

      const parsedServiceId =
        Number(serviceId);

      if (
        !Number.isInteger(parsedSalonId) ||
        parsedSalonId <= 0
      ) {
        setError(
          'Salon ID không hợp lệ.',
        );

        setIsLoading(false);
        return;
      }

      if (
        !Number.isInteger(parsedServiceId) ||
        parsedServiceId <= 0
      ) {
        setError(
          'Service ID không hợp lệ.',
        );

        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');

        console.log(
          '📌 Booking information:',
          {
            salonId: parsedSalonId,
            serviceId: parsedServiceId,
          },
        );

        const result =
          await getSalonEmployees(
            parsedSalonId,
          );

        setEmployees(result.data);

        console.log(
          '👥 Employees:',
          result.data,
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
    [salonId, serviceId],
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
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Đang tải nhân viên...
        </Text>
      </View>
    );
  }

  /**
   * =========================
   * ERROR
   * =========================
   */
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          Không thể tải nhân viên
        </Text>

        <Text style={styles.errorMessage}>
          {error}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={loadEmployees}
        >
          <Text style={styles.retryText}>
            Thử lại
          </Text>
        </Pressable>

        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>
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
    <View style={styles.container}>
      {/* HEADER */}

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
            Chọn nhân viên
          </Text>

          <Text style={styles.headerSubtitle}>
            Chọn nhân viên thực hiện dịch vụ
          </Text>
        </View>
      </View>

      {/* THÔNG TIN BOOKING */}

      <View style={styles.bookingInfo}>
        <Text style={styles.bookingInfoTitle}>
          Thông tin đặt lịch
        </Text>

        <Text style={styles.bookingInfoText}>
          Salon ID: {salonId}
        </Text>

        <Text style={styles.bookingInfoText}>
          Dịch vụ ID: {serviceId}
        </Text>
      </View>

      {/* DANH SÁCH NHÂN VIÊN */}

      <ScrollView
        contentContainerStyle={
          styles.listContent
        }
      >
        {employees.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>
              Chưa có nhân viên
            </Text>

            <Text style={styles.emptyText}>
              Salon hiện chưa có nhân viên.
            </Text>
          </View>
        ) : (
          employees.map(
            (employee) => (
              <EmployeeItem
                key={employee.EmployeeId}
                employee={employee}
                onSelect={() => {
                  console.log(
                    '✅ Selected employee:',
                    {
                      salonId,
                      serviceId,
                      employeeId:
                        employee.EmployeeId,
                    },
                  );
                
                  router.push({
                    pathname: '/booking/date',
                    params: {
                      salonId: String(salonId),
                      serviceId: String(serviceId),
                      employeeId: String(
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
      style={({ pressed }) => [
        styles.employeeCard,
        pressed && styles.pressed,
      ]}
      onPress={onSelect}
    >
      {/* AVATAR */}

      {employee.AvatarUrl ? (
        <Image
          source={{
            uri: employee.AvatarUrl,
          }}
          style={styles.avatar}
        />
      ) : (
        <View
          style={styles.avatarPlaceholder}
        >
          <Text style={styles.avatarText}>
            {employee.FullName
              .charAt(0)
              .toUpperCase()}
          </Text>
        </View>
      )}

      {/* THÔNG TIN NHÂN VIÊN */}

      <View style={styles.employeeInfo}>
        <Text style={styles.employeeName}>
          {employee.FullName}
        </Text>

        {employee.Specialization && (
          <Text
            style={styles.specialization}
          >
            {employee.Specialization}
          </Text>
        )}

        {employee.Phone && (
          <Text style={styles.phone}>
            {employee.Phone}
          </Text>
        )}
      </View>

      {/* MŨI TÊN */}

      <Text style={styles.arrow}>
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
    marginTop: 12,
    fontSize: 15,
    color: '#666666',
  },

  errorTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#222222',
    marginBottom: 10,
  },

  errorMessage: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },

  retryButton: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  backButton: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  backText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '700',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
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

  bookingInfo: {
    margin: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#EDE9FE',
  },

  bookingInfoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#6D28D9',
    marginBottom: 8,
  },

  bookingInfoText: {
    fontSize: 13,
    color: '#6D28D9',
    fontWeight: '600',
    marginBottom: 4,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  employeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },

  pressed: {
    opacity: 0.7,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },

  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#8B5CF6',
  },

  employeeInfo: {
    flex: 1,
    marginLeft: 14,
  },

  employeeName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#222222',
  },

  specialization: {
    marginTop: 5,
    fontSize: 14,
    color: '#8B5CF6',
  },

  phone: {
    marginTop: 4,
    fontSize: 13,
    color: '#777777',
  },

  arrow: {
    fontSize: 28,
    color: '#999999',
    marginLeft: 8,
  },

  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222222',
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
  },
});