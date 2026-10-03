// app/salons/index.tsx

import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  router,
} from 'expo-router';

import {
  getSalons,
} from '@/services/salonService';

import {
  Salon,
} from '@/types/salon';

export default function SalonsScreen() {
  const [salons, setSalons] =
    useState<Salon[]>([]);

  const [search, setSearch] =
    useState('');

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [error, setError] =
    useState('');

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  /**
   * =========================
   * LOAD SALONS
   * =========================
   */

  const loadSalons = useCallback(
    async (
      currentPage = 1,
      currentSearch = search,
      refreshing = false,
    ) => {
      try {
        setError('');

        if (refreshing) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const response =
          await getSalons(
            currentSearch,
            currentPage,
            10,
          );

        setSalons(
          response.data.items,
        );

        setPage(
          response.data.pagination.page,
        );

        setTotalPages(
          response.data.pagination.totalPages,
        );
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Không thể tải danh sách salon.';

        setError(message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [search],
  );

  /**
   * =========================
   * INITIAL LOAD
   * =========================
   */

  useEffect(() => {
    loadSalons(1, '', false);
  }, []);

  /**
   * =========================
   * SEARCH
   * =========================
   */

  const handleSearch = () => {
    loadSalons(1, search, false);
  };

  /**
   * =========================
   * REFRESH
   * =========================
   */

  const handleRefresh = () => {
    loadSalons(
      page,
      search,
      true,
    );
  };

  /**
   * =========================
   * NEXT PAGE
   * =========================
   */

  const handleNextPage = () => {
    if (page >= totalPages) {
      return;
    }

    loadSalons(
      page + 1,
      search,
      false,
    );
  };

  /**
   * =========================
   * PREVIOUS PAGE
   * =========================
   */

  const handlePreviousPage = () => {
    if (page <= 1) {
      return;
    }

    loadSalons(
      page - 1,
      search,
      false,
    );
  };

  /**
   * =========================
   * SALON CARD
   * =========================
   */

  const renderSalon = ({
    item,
  }: {
    item: Salon;
  }) => {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.salonCard,
          pressed &&
            styles.cardPressed,
        ]}
        onPress={() =>
          router.push(
            `/salons/${item.SalonId}`,
          )
        }
      >
        {item.ImageUrl ? (
          <Image
            source={{
              uri: item.ImageUrl,
            }}
            style={styles.salonImage}
          />
        ) : (
          <View
            style={styles.imagePlaceholder}
          >
            <Text
              style={
                styles.placeholderText
              }
            >
              Beauty
            </Text>
          </View>
        )}

        <View style={styles.salonContent}>

          <Text
            style={styles.salonName}
            numberOfLines={2}
          >
            {item.SalonName}
          </Text>

          <Text
            style={styles.address}
            numberOfLines={2}
          >
            📍 {item.Address}
          </Text>

          {item.Phone ? (
            <Text style={styles.phone}>
              ☎ {item.Phone}
            </Text>
          ) : null}

          <View
            style={styles.ratingRow}
          >
            <Text
              style={styles.rating}
            >
              ⭐{' '}
              {Number(
                item.AverageRating,
              ).toFixed(1)}
            </Text>

            <Text
              style={styles.reviewCount}
            >
              ({item.ReviewCount} đánh giá)
            </Text>
          </View>

          <View
            style={styles.statsRow}
          >
            <Text
              style={styles.stat}
            >
              💇 {item.ServiceCount}{' '}
              dịch vụ
            </Text>

            <Text
              style={styles.stat}
            >
              👤 {item.EmployeeCount}{' '}
              nhân viên
            </Text>
          </View>

        </View>
      </Pressable>
    );
  };

  /**
   * =========================
   * LOADING
   * =========================
   */

  if (
    isLoading &&
    salons.length === 0
  ) {
    return (
      <SafeAreaView
        style={styles.loadingContainer}
      >
        <ActivityIndicator
          size="large"
        />

        <Text
          style={styles.loadingText}
        >
          Đang tải danh sách salon...
        </Text>
      </SafeAreaView>
    );
  }

  /**
   * =========================
   * ERROR
   * =========================
   */

  if (
    error &&
    salons.length === 0
  ) {
    return (
      <SafeAreaView
        style={styles.errorContainer}
      >
        <Text
          style={styles.errorTitle}
        >
          Không thể tải dữ liệu
        </Text>

        <Text
          style={styles.errorMessage}
        >
          {error}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={() =>
            loadSalons(
              1,
              search,
              false,
            )
          }
        >
          <Text
            style={styles.retryText}
          >
            Thử lại
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  /**
   * =========================
   * MAIN UI
   * =========================
   */

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <View style={styles.container}>

        {/* HEADER */}

        <View style={styles.header}>

          <View>
            <Text
              style={styles.smallTitle}
            >
              BeautyBooking
            </Text>

            <Text
              style={styles.title}
            >
              Khám phá Salon
            </Text>
          </View>

          <Pressable
            style={styles.profileButton}
            onPress={() =>
              router.push('/home')
            }
          >
            <Text
              style={styles.profileText}
            >
              👤
            </Text>
          </Pressable>

        </View>

        {/* SEARCH */}

        <View
          style={styles.searchContainer}
        >
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm salon hoặc địa chỉ..."
            placeholderTextColor="#999999"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            onSubmitEditing={
              handleSearch
            }
          />

          <Pressable
            style={styles.searchButton}
            onPress={handleSearch}
          >
            <Text
              style={styles.searchButtonText}
            >
              Tìm
            </Text>
          </Pressable>
        </View>

        {/* LIST */}

        <FlatList
          data={salons}
          keyExtractor={(item) =>
            String(item.SalonId)
          }
          renderItem={renderSalon}
          contentContainerStyle={
            salons.length === 0
              ? styles.emptyList
              : styles.listContent
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
          showsVerticalScrollIndicator={
            false
        }
          ListHeaderComponent={
            salons.length > 0 ? (
              <Text
                style={styles.resultText}
              >
                Tìm thấy {salons.length}{' '}
                salon
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View
              style={styles.emptyContainer}
            >
              <Text
                style={styles.emptyIcon}
              >
                🔍
              </Text>

              <Text
                style={styles.emptyTitle}
              >
                Không tìm thấy salon
              </Text>

              <Text
                style={styles.emptyText}
              >
                Hãy thử tìm kiếm với từ khóa
                khác.
              </Text>
            </View>
          }
          ListFooterComponent={
            salons.length > 0 ? (
              <View
                style={styles.pagination}
              >
                <Pressable
                  style={[
                    styles.pageButton,
                    page <= 1 &&
                      styles.disabledButton,
                  ]}
                  onPress={
                    handlePreviousPage
                  }
                  disabled={page <= 1}
                >
                  <Text
                    style={
                      styles.pageButtonText
                    }
                  >
                    ‹ Trước
                  </Text>
                </Pressable>

                <Text
                  style={styles.pageText}
                >
                  {page} / {totalPages}
                </Text>

                <Pressable
                  style={[
                    styles.pageButton,
                    page >=
                      totalPages &&
                      styles.disabledButton,
                  ]}
                  onPress={
                    handleNextPage
                  }
                  disabled={
                    page >= totalPages
                  }
                >
                  <Text
                    style={
                      styles.pageButtonText
                    }
                  >
                    Sau ›
                  </Text>
                </Pressable>
              </View>
            ) : null
          }
        />

      </View>
    </SafeAreaView>
  );
}

/**
 * =========================
 * STYLES
 * =========================
 */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F7FC',
  },

  container: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F7FC',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#777777',
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
    fontWeight: '700',
    color: '#222222',
    marginBottom: 10,
  },

  errorMessage: {
    fontSize: 15,
    color: '#777777',
    textAlign: 'center',
    marginBottom: 20,
  },

  retryButton: {
    height: 48,
    paddingHorizontal: 28,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  retryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 18,
  },

  smallTitle: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '700',
    marginBottom: 4,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#222222',
  },

  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileText: {
    fontSize: 20,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#222222',
  },

  searchButton: {
    height: 50,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  listContent: {
    paddingBottom: 24,
  },

  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  resultText: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 10,
  },

  salonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,

    elevation: 3,
  },

  cardPressed: {
    opacity: 0.75,
  },

  salonImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#EEEEEE',
  },

  imagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  placeholderText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#8B5CF6',
  },

  salonContent: {
    padding: 16,
  },

  salonName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#222222',
    marginBottom: 8,
  },

  address: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
    marginBottom: 6,
  },

  phone: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 10,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  rating: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F59E0B',
  },

  reviewCount: {
    fontSize: 13,
    color: '#888888',
    marginLeft: 6,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  stat: {
    fontSize: 13,
    color: '#666666',
  },

  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },

  emptyIcon: {
    fontSize: 42,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },

  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
    paddingVertical: 20,
  },

  pageButton: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  pageButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  disabledButton: {
    opacity: 0.35,
  },

  pageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555555',
  },
});