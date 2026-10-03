import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useLocalSearchParams, router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { getSalonById } from '@/services/salonService';
import {
  SalonDetail,
  SalonEmployee,
  SalonService,
} from '@/types/salon';

export default function SalonDetailScreen() {
  const { salonId } = useLocalSearchParams<{
    salonId: string;
  }>();

  const [salon, setSalon] = useState<SalonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSalon = useCallback(async () => {
    if (!salonId) {
      setError('Không xác định được Salon.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const result = await getSalonById(
        Number(salonId),
      );

      setSalon(result.data);
    } catch (err) {
      console.error('Load salon detail error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Không thể tải thông tin Salon.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [salonId]);

  useEffect(() => {
    loadSalon();
  }, [loadSalon]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Đang tải thông tin Salon...
        </Text>
      </View>
    );
  }

  if (error || !salon) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>
          Không thể tải Salon
        </Text>

        <Text style={styles.errorMessage}>
          {error || 'Không tìm thấy Salon.'}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={loadSalon}
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Nút quay lại */}
      <Pressable
        style={styles.backRow}
        onPress={() => router.back()}
      >
        <Text style={styles.backIcon}>
          ‹
        </Text>

        <Text style={styles.backLabel}>
          Danh sách Salon
        </Text>
      </Pressable>

      {/* Ảnh Salon */}
      {salon.ImageUrl ? (
        <Image
          source={{
            uri: salon.ImageUrl,
          }}
          style={styles.salonImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>
            BeautyBooking
          </Text>
        </View>
      )}

      {/* Thông tin chính */}
      <View style={styles.mainCard}>
        <Text style={styles.salonName}>
          {salon.SalonName}
        </Text>

        <View style={styles.ratingRow}>
          <Text style={styles.star}>
            ★
          </Text>

          <Text style={styles.rating}>
            {Number(salon.AverageRating).toFixed(1)}
          </Text>

          <Text style={styles.reviewCount}>
            ({salon.ReviewCount} đánh giá)
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>
            📍
          </Text>

          <Text style={styles.infoText}>
            {salon.Address}
          </Text>
        </View>

        {salon.Phone && (
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>
              ☎
            </Text>

            <Text style={styles.infoText}>
              {salon.Phone}
            </Text>
          </View>
        )}

        {salon.Description && (
          <View style={styles.descriptionBox}>
            <Text style={styles.sectionTitle}>
              Giới thiệu
            </Text>

            <Text style={styles.description}>
              {salon.Description}
            </Text>
          </View>
        )}
      </View>

      {/* Thống kê */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {salon.ServiceCount}
          </Text>

          <Text style={styles.statLabel}>
            Dịch vụ
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {salon.EmployeeCount}
          </Text>

          <Text style={styles.statLabel}>
            Nhân viên
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {salon.ReviewCount}
          </Text>

          <Text style={styles.statLabel}>
            Đánh giá
          </Text>
        </View>
      </View>

      {/* Dịch vụ */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Dịch vụ
          </Text>

          <Text style={styles.sectionCount}>
            {salon.services.length}
          </Text>
        </View>

        {salon.services.length === 0 ? (
          <Text style={styles.emptyText}>
            Salon chưa có dịch vụ.
          </Text>
        ) : (
          salon.services.map(
          (service: SalonService) => (
            <ServiceItem
              key={service.ServiceId}
              service={service}
              onSelect={() => {
                router.push({
                  pathname: '/booking/employee',
                  params: {
                    salonId: String(salon.SalonId),
                    serviceId: String(
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

      {/* Nhân viên */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Nhân viên
          </Text>

          <Text style={styles.sectionCount}>
            {salon.employees.length}
          </Text>
        </View>

        {salon.employees.length === 0 ? (
          <Text style={styles.emptyText}>
            Salon chưa có nhân viên.
          </Text>
        ) : (
          salon.employees.map(
            (employee: SalonEmployee) => (
              <EmployeeItem
                key={employee.EmployeeId}
                employee={employee}
              />
            ),
          )
        )}
      </View>

      {/* Nút đặt lịch */}
      <Pressable
        style={({ pressed }) => [
          styles.bookingButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => {
          // Tạm thời chưa chuyển sang Booking.
          // Chúng ta sẽ nối chức năng này
          // sau khi hoàn thành Service + Employee + Schedule.
        }}
      >
        <Text style={styles.bookingButtonText}>
          Đặt lịch tại Salon này
        </Text>
      </Pressable>
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
      style={({ pressed }) => [
        styles.itemCard,
        pressed && styles.itemPressed,
      ]}
      onPress={onSelect}
    >
      {service.ImageUrl ? (
        <Image
          source={{
            uri: service.ImageUrl,
          }}
          style={styles.serviceImage}
        />
      ) : (
        <View style={styles.servicePlaceholder}>
          <Text style={styles.servicePlaceholderText}>
            ✂
          </Text>
        </View>
      )}

      <View style={styles.itemContent}>
        <Text
          style={styles.itemTitle}
          numberOfLines={2}
        >
          {service.ServiceName}
        </Text>

        {service.Description && (
          <Text
            style={styles.itemDescription}
            numberOfLines={2}
          >
            {service.Description}
          </Text>
        )}

        <View style={styles.itemBottomRow}>
          <View>
            <Text style={styles.price}>
              {formatMoney(service.Price)}
            </Text>

            <Text style={styles.duration}>
              {service.DurationMinutes} phút
            </Text>
          </View>

          <View style={styles.selectButton}>
            <Text style={styles.selectButtonText}>
              Chọn
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

/**
 * =========================
 * EMPLOYEE ITEM
 * =========================
 */

function EmployeeItem({
  employee,
}: {
  employee: SalonEmployee;
}) {
  return (
    <View style={styles.employeeCard}>
      {employee.AvatarUrl ? (
        <Image
          source={{
            uri: employee.AvatarUrl,
          }}
          style={styles.avatar}
        />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {employee.FullName
              .charAt(0)
              .toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.employeeInfo}>
        <Text style={styles.employeeName}>
          {employee.FullName}
        </Text>

        {employee.Specialization && (
          <Text style={styles.specialization}>
            {employee.Specialization}
          </Text>
        )}

        {employee.Phone && (
          <Text style={styles.employeePhone}>
            {employee.Phone}
          </Text>
        )}
      </View>
    </View>
  );
}

/**
 * =========================
 * FORMAT MONEY
 * =========================
 */

function formatMoney(value: number) {
  return `${Number(value).toLocaleString(
    'vi-VN',
  )} đ`;
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

  itemPressed: {
  opacity: 0.7,
},

selectButton: {
  minWidth: 68,
  height: 36,
  paddingHorizontal: 14,
  borderRadius: 10,
  backgroundColor: '#8B5CF6',
  justifyContent: 'center',
  alignItems: 'center',
},

selectButtonText: {
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: '700',
},

  content: {
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F7FC',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },

  errorContainer: {
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

  retryButton: {
    width: '100%',
    maxWidth: 320,
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
    maxWidth: 320,
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

  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
  },

  backIcon: {
    fontSize: 34,
    lineHeight: 34,
    color: '#222222',
    marginRight: 8,
  },

  backLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555555',
  },

  salonImage: {
    width: '100%',
    height: 230,
  },

  imagePlaceholder: {
    width: '100%',
    height: 230,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  placeholderText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#8B5CF6',
  },

  mainCard: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    marginBottom: 12,
  },

  salonName: {
    fontSize: 25,
    fontWeight: '800',
    color: '#222222',
    marginBottom: 10,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  star: {
    fontSize: 19,
    color: '#F59E0B',
    marginRight: 5,
  },

  rating: {
    fontSize: 16,
    fontWeight: '800',
    color: '#222222',
  },

  reviewCount: {
    fontSize: 14,
    color: '#777777',
    marginLeft: 5,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  infoIcon: {
    width: 28,
    fontSize: 18,
  },

  infoText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    color: '#444444',
  },

  descriptionBox: {
    marginTop: 10,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#222222',
  },

  description: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 23,
    color: '#666666',
  },

  statsCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 12,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 21,
    fontWeight: '800',
    color: '#8B5CF6',
  },

  statLabel: {
    marginTop: 4,
    fontSize: 13,
    color: '#777777',
  },

  statDivider: {
    width: 1,
    height: 38,
    backgroundColor: '#EEEEEE',
  },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 12,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  sectionCount: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EDE9FE',
    color: '#8B5CF6',
    textAlign: 'center',
    paddingTop: 5,
    fontSize: 13,
    fontWeight: '800',
  },

  emptyText: {
    fontSize: 14,
    color: '#888888',
  },

  itemCard: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  serviceImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },

  servicePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  servicePlaceholderText: {
    fontSize: 30,
    color: '#8B5CF6',
  },

  itemContent: {
    flex: 1,
    marginLeft: 12,
  },

  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222222',
  },

  itemDescription: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 18,
    color: '#777777',
  },

  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  price: {
    fontSize: 15,
    fontWeight: '800',
    color: '#8B5CF6',
  },

  duration: {
    fontSize: 13,
    color: '#777777',
  },

  employeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
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
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#8B5CF6',
  },

  employeeInfo: {
    flex: 1,
    marginLeft: 14,
  },

  employeeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222222',
  },

  specialization: {
    marginTop: 4,
    fontSize: 13,
    color: '#8B5CF6',
  },

  employeePhone: {
    marginTop: 4,
    fontSize: 13,
    color: '#777777',
  },

  bookingButton: {
    height: 54,
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  bookingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  buttonPressed: {
    opacity: 0.7,
  },
});