import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../routes/store';
import { fetchCountries, setSearch, setPage } from '../../features/countries/countriesSlice';
import CountryCard from '../../screens/Countries/CountryCard';
import HeroSection from '../../screens/Countries/HeroSection';

const CountriesScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { countries, loading, error, search, currentPage, itemsPerPage } =
    useSelector((state: RootState) => state.countries);

  useEffect(() => {
    dispatch(fetchCountries());
  }, [dispatch]);

  const filteredCountries = useMemo(
    () =>
      countries.filter((c: any) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      ),
    [countries, search]
  );

  const totalPages = Math.ceil(filteredCountries.length / itemsPerPage);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCountries.slice(start, start + itemsPerPage);
  }, [filteredCountries, currentPage, itemsPerPage]);

  const handleSearch = (value: string) => {
    dispatch(setSearch(value));
  };

  const renderCountryItem = ({ item, index }: any) => (
    <CountryCard
      country={item}
      index={index}
      onPress={() => navigation.navigate('CountryDetails', { id: item.id })}
    />
  );

  const renderPagination = () => {
    if (loading || totalPages <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[
            styles.paginationButton,
            currentPage === 1 && styles.disabledButton,
          ]}
          onPress={() => dispatch(setPage(currentPage - 1))}
          disabled={currentPage === 1}
        >
          <Text style={styles.paginationText}>Prev</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paginationButton,
            currentPage === totalPages && styles.disabledButton,
          ]}
          onPress={() => dispatch(setPage(currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <Text style={styles.paginationText}>Next</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      <FlatList
        data={paginated}
        renderItem={renderCountryItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <>
            <HeroSection
              title="Country"
              description="Discover breathtaking places around the globe."
            />

            <View style={styles.searchContainer}>
              <View style={styles.searchWrapper}>
                <TextInput
                  style={styles.searchInput}
                  value={search}
                  onChangeText={handleSearch}
                  placeholder="Search countries..."
                  placeholderTextColor="#9ca3af"
                />
                {search && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => handleSearch('')}
                  >
                    <Text style={styles.clearButtonText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No countries found.</Text>
            </View>
          ) : null
        }
        ListFooterComponent={renderPagination}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={() => dispatch(fetchCountries())}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00A6E8" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  listContent: {
    paddingBottom: 20,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#6b7280',
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  row: {
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  paginationButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  disabledButton: {
    opacity: 0.5,
  },
  paginationText: {
    color: '#1f2937',
    fontWeight: '500',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CountriesScreen;
