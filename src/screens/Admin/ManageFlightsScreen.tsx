import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  FlatList,
  RefreshControl,
} from 'react-native';
import axios from 'axios';

export type Flight = {
  id: number;
  airline: string;
  from: string;
  to: string;
  price: number;
  duratuion: string;
  passanger: number;
  country: string;
  city: string;
  image?: string;
  _countryId?: string;
  _cityId?: string;
};

export type APICityFlight = {
  id: number | string;
  airline: string;
  from: string;
  to: string;
  price: number;
  offer?: string;
  passanger: number;
  duratuion: string;
};

export type APICity = { id: string; name: string; flights: APICityFlight[] };

export type APICountry = {
  id: string;
  name: string;
  city: APICity[];
  image?: string;
};

const API_BASE = 'https://6927461426e7e41498fdb2c5.mockapi.io';

export default function AdminFlightsDashboard() {
  const [countries, setCountries] = useState<APICountry[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [form, setForm] = useState<Partial<Flight>>({});
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [modalFlight, setModalFlight] = useState<Flight | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteFlightModal, setDeleteFlightModal] = useState<Flight | null>(null);

  const [searchText, setSearchText] = useState('');
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);

  const fetchCountries = async () => {
    setLoading(true);
    try {
      const res = await axios.get<APICountry[]>(`${API_BASE}/countries`);
      setCountries(res.data || []);

      const allFlights: Flight[] = [];
      res.data.forEach((country) =>
        country.city.forEach((city) =>
          city.flights.forEach((f) =>
            allFlights.push({
              id: Number(f.id),
              airline: f.airline,
              from: f.from,
              to: f.to,
              price: Number(f.price),
              duratuion: f.duratuion,
              passanger: Number(f.passanger),
              country: country.name,
              city: city.name,
              image: country.image,
              _countryId: country.id,
              _cityId: city.id,
            })
          )
        )
      );
      setFlights(allFlights);
      setFilteredFlights(allFlights);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load flights');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (!searchText) setFilteredFlights(flights);
    else {
      const lower = searchText.toLowerCase();
      setFilteredFlights(
        flights.filter(
          (f) =>
            f.airline.toLowerCase().includes(lower) ||
            f.from.toLowerCase().includes(lower) ||
            f.to.toLowerCase().includes(lower) ||
            f.country.toLowerCase().includes(lower) ||
            f.city.toLowerCase().includes(lower)
        )
      );
    }
    setCurrentPage(1);
  }, [searchText, flights]);

  const computeNextFlightId = () => {
    const allIds = countries.flatMap((c) =>
      c.city.flatMap((ci) => ci.flights.map((f) => Number(f.id) || 0))
    );
    const max = allIds.length ? Math.max(...allIds) : 0;
    return max + 1;
  };

  const addFlight = async (payload: Partial<Flight>) => {
    try {
      if (!payload.country || !payload.city || !payload.airline) {
        Alert.alert('Error', 'Please fill required fields: Airline, Country, City');
        return;
      }

      let country = countries.find(
        (c) => c.name.toLowerCase() === payload.country!.toLowerCase()
      );

      if (!country) {
        const newCountryPayload: Partial<APICountry> = {
          name: payload.country!,
          image: payload.image || '',
          city: [],
        };
        const createdCountry = await axios.post(
          `${API_BASE}/countries`,
          newCountryPayload
        );
        country = createdCountry.data as APICountry;
        setCountries((prev) => [...prev, country!]);
      }

      let city = country.city.find(
        (c) => c.name.toLowerCase() === payload.city!.toLowerCase()
      );
      if (!city) {
        city = {
          id: payload.city!.toLowerCase().replace(/\s+/g, '-'),
          name: payload.city!,
          flights: [],
        } as APICity;
        country.city.push(city);
      }

      const newFlightId = computeNextFlightId();

      const newFlight: APICityFlight = {
        id: newFlightId,
        airline: payload.airline!,
        from: payload.from || '',
        to: payload.to || '',
        price: Number(payload.price || 0),
        duratuion: payload.duratuion || '',
        passanger: Number(payload.passanger || 1),
        offer: payload.image ? 'Has image' : 'No offer',
      };

      city.flights.unshift(newFlight);

      await axios.put(`${API_BASE}/countries/${country.id}`, country);

      await fetchCountries();
      closeFormModal();
      Alert.alert('Success', 'Flight added successfully');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to add flight');
    }
  };

  const editFlight = async (payload: Flight) => {
    try {
      const oldCountry = countries.find((c) =>
        c.city.some((ci) => ci.flights.some((f) => Number(f.id) === payload.id))
      );
      if (!oldCountry) {
        Alert.alert('Error', 'Original country not found');
        return;
      }

      oldCountry.city.forEach((ci) => {
        ci.flights = ci.flights.filter((f) => Number(f.id) !== payload.id);
      });

      let targetCountry = countries.find(
        (c) => c.name.toLowerCase() === payload.country.toLowerCase()
      );
      if (!targetCountry) {
        const created = await axios.post(`${API_BASE}/countries`, {
          name: payload.country,
          image: payload.image || '',
          city: [],
        });
        targetCountry = created.data as APICountry;
        countries.push(targetCountry);
      }

      let targetCity = targetCountry.city.find(
        (ci) => ci.name.toLowerCase() === payload.city.toLowerCase()
      );
      if (!targetCity) {
        targetCity = {
          id: payload.city.toLowerCase().replace(/\s+/g, '-'),
          name: payload.city,
          flights: [],
        };
        targetCountry.city.push(targetCity);
      }

      targetCity.flights.unshift({
        id: payload.id,
        airline: payload.airline,
        from: payload.from,
        to: payload.to,
        price: payload.price,
        duratuion: payload.duratuion,
        passanger: payload.passanger,
        offer: 'No offer',
      });

      await axios.put(`${API_BASE}/countries/${targetCountry.id}`, targetCountry);
      if (oldCountry.id !== targetCountry.id) {
        await axios.put(`${API_BASE}/countries/${oldCountry.id}`, oldCountry);
      }

      await fetchCountries();
      closeFormModal();
      Alert.alert('Success', 'Flight updated successfully');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to edit flight');
    }
  };

  const confirmDeleteFlight = async () => {
    if (!deleteFlightModal) return;
    const country = countries.find((c) => c.id === deleteFlightModal._countryId);
    if (!country) return;
    
    country.city.forEach((ci) => {
      ci.flights = ci.flights.filter((f) => Number(f.id) !== deleteFlightModal.id);
    });
    
    try {
      await axios.put(`${API_BASE}/countries/${country.id}`, country);
      await fetchCountries();
      setDeleteModalOpen(false);
      setDeleteFlightModal(null);
      Alert.alert('Success', 'Flight deleted successfully');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to delete flight');
    }
  };

  const openAddModal = () => {
    setFormMode('add');
    setForm({});
    setSelectedFlight(null);
    setFormModalOpen(true);
  };

  const openEditModal = (flight: Flight) => {
    setFormMode('edit');
    setSelectedFlight(flight);
    setForm({
      airline: flight.airline,
      from: flight.from,
      to: flight.to,
      price: flight.price,
      duratuion: flight.duratuion,
      passanger: flight.passanger,
      country: flight.country,
      city: flight.city,
      image: flight.image,
    });
    setFormModalOpen(true);
  };

  const closeFormModal = () => {
    setFormModalOpen(false);
    setForm({});
    setSelectedFlight(null);
    setFormMode('add');
  };

  const validateAndSubmit = async () => {
    const required = ['airline', 'country', 'city', 'from', 'to'] as const;
    for (const key of required) {
      if (!form[key as keyof Flight]) {
        Alert.alert('Error', `Please fill ${key}`);
        return;
      }
    }

    const urlRegex = /^(https?:\/\/[^\s]+)$/;
    const minLen3 = /^.{3,}$/;
    const hasLetters = /[A-Za-z]/;
    const positiveNumber = /^[1-9][0-9]*$/;

    if (!form.airline || !minLen3.test(String(form.airline)) || !hasLetters.test(String(form.airline))) {
      Alert.alert('Error', 'Airline must be at least 3 characters and contain letters');
      return;
    }
    if (!form.country || !minLen3.test(String(form.country)) || !hasLetters.test(String(form.country))) {
      Alert.alert('Error', 'Country must be at least 3 characters and contain letters');
      return;
    }
    if (!form.city || !minLen3.test(String(form.city)) || !hasLetters.test(String(form.city))) {
      Alert.alert('Error', 'City must be at least 3 characters and contain letters');
      return;
    }
    if (!form.from || !minLen3.test(String(form.from)) || !hasLetters.test(String(form.from))) {
      Alert.alert('Error', 'From must be at least 3 characters and contain letters');
      return;
    }
    if (!form.to || !minLen3.test(String(form.to)) || !hasLetters.test(String(form.to))) {
      Alert.alert('Error', 'To must be at least 3 characters and contain letters');
      return;
    }

    if (!form.image || form.image.trim() === '') {
      Alert.alert('Error', 'Image URL is required');
      return;
    }
    if (!urlRegex.test(String(form.image))) {
      Alert.alert('Error', 'Image must be a valid URL (starting with http or https)');
      return;
    }

    if (!form.price || !positiveNumber.test(String(form.price))) {
      Alert.alert('Error', 'Price must be a positive number');
      return;
    }

    if (!form.duratuion || !minLen3.test(String(form.duratuion))) {
      Alert.alert('Error', 'Duration must be at least 3 characters');
      return;
    }

    if (!form.passanger || !positiveNumber.test(String(form.passanger))) {
      Alert.alert('Error', 'Passengers must be a positive number');
      return;
    }

    if (formMode === 'add') {
      await addFlight(form);
    } else if (formMode === 'edit' && selectedFlight) {
      const payload: Flight = {
        ...selectedFlight,
        airline: String(form.airline || selectedFlight.airline),
        from: String(form.from || selectedFlight.from),
        to: String(form.to || selectedFlight.to),
        price: Number(typeof form.price !== 'undefined' ? form.price : selectedFlight.price),
        duratuion: String(form.duratuion || selectedFlight.duratuion),
        passanger: Number(
          typeof form.passanger !== 'undefined' ? form.passanger : selectedFlight.passanger
        ),
        country: String(form.country || selectedFlight.country),
        city: String(form.city || selectedFlight.city),
        image: form.image || selectedFlight.image,
        id: selectedFlight.id,
        _countryId: selectedFlight._countryId,
        _cityId: selectedFlight._cityId,
      };
      await editFlight(payload);
    }
  };

  const renderFlightCard = ({ item }: { item: Flight }) => (
    <View style={styles.card}>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.cardImage} />
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.airline}</Text>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>From:</Text>
          <Text style={styles.cardValue}>{item.from}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>To:</Text>
          <Text style={styles.cardValue}>{item.to}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Country:</Text>
          <Text style={styles.cardValue}>{item.country}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>City:</Text>
          <Text style={styles.cardValue}>{item.city}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Price:</Text>
          <Text style={styles.cardPrice}>${item.price}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Duration:</Text>
          <Text style={styles.cardValue}>{item.duratuion}</Text>
        </View>
        
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.viewBtn]}
            onPress={() => {
              setModalFlight(item);
              setViewModalOpen(true);
            }}
          >
            <Text style={styles.actionBtnText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => openEditModal(item)}
          >
            <Text style={styles.actionBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => {
              setDeleteFlightModal(item);
              setDeleteModalOpen(true);
            }}
          >
            <Text style={styles.actionBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const ITEMS_PER_PAGE = 5;

const [currentPage, setCurrentPage] = useState(1);

const totalPages = Math.ceil(filteredFlights.length / ITEMS_PER_PAGE);

const paginatedFlights = filteredFlights.slice(
  (currentPage - 1) * ITEMS_PER_PAGE,
  currentPage * ITEMS_PER_PAGE
);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Flights Management</Text>
        <View style={styles.headerActions}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search flights..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
            <Text style={styles.addBtnText}>+ New Flight</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Flight List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00c0f5" />
        </View>
      ) : (
        <FlatList
          data={paginatedFlights}
          renderItem={renderFlightCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchCountries();
              }}
              colors={['#00c0f5']}
            />
            
          }
          
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No flights found</Text>
            </View>
          }
        />
      )}
      {totalPages > 1 && (
  <View style={styles.pagination}>
    <TouchableOpacity
      style={[
        styles.pageBtn,
        currentPage === 1 && styles.disabledBtn,
      ]}
      disabled={currentPage === 1}
      onPress={() => setCurrentPage((p) => p - 1)}
    >
      <Text style={styles.pageText}>Prev</Text>
    </TouchableOpacity>

    <Text style={styles.pageIndicator}>
      Page {currentPage} of {totalPages}
    </Text>

    <TouchableOpacity
      style={[
        styles.pageBtn,
        currentPage === totalPages && styles.disabledBtn,
      ]}
      disabled={currentPage === totalPages}
      onPress={() => setCurrentPage((p) => p + 1)}
    >
      <Text style={styles.pageText}>Next</Text>
    </TouchableOpacity>
  </View>
)}


      
      <Modal
        visible={formModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={closeFormModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {formMode === 'edit' ? 'Edit Flight' : 'Add Flight'}
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Airline</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Airline"
                  value={form.airline || ''}
                  onChangeText={(text) => setForm({ ...form, airline: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>From</Text>
                <TextInput
                  style={styles.input}
                  placeholder="From"
                  value={form.from || ''}
                  onChangeText={(text) => setForm({ ...form, from: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>To</Text>
                <TextInput
                  style={styles.input}
                  placeholder="To"
                  value={form.to || ''}
                  onChangeText={(text) => setForm({ ...form, to: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Country</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Country"
                  value={form.country || ''}
                  onChangeText={(text) => setForm({ ...form, country: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  value={form.city || ''}
                  onChangeText={(text) => setForm({ ...form, city: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Price</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Price"
                  keyboardType="numeric"
                  value={form.price?.toString() || ''}
                  onChangeText={(text) =>
                    setForm({ ...form, price: text === '' ? undefined : Number(text) })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Duration</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Duration (e.g., 2h 35m)"
                  value={form.duratuion || ''}
                  onChangeText={(text) => setForm({ ...form, duratuion: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Passengers</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Passengers"
                  keyboardType="numeric"
                  value={form.passanger?.toString() || ''}
                  onChangeText={(text) =>
                    setForm({ ...form, passanger: text === '' ? undefined : Number(text) })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Image URL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Image URL"
                  value={form.image || ''}
                  onChangeText={(text) => setForm({ ...form, image: text })}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={closeFormModal}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={validateAndSubmit}>
                  <Text style={styles.submitBtnText}>
                    {formMode === 'edit' ? 'Save' : 'Add'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      
      <Modal
        visible={viewModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setViewModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.viewModalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Flight Details</Text>
              {modalFlight && (
                <>
                  {modalFlight.image && (
                    <Image
                      source={{ uri: modalFlight.image }}
                      style={styles.viewModalImage}
                    />
                  )}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Airline:</Text>
                    <Text style={styles.detailValue}>{modalFlight.airline}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>From:</Text>
                    <Text style={styles.detailValue}>{modalFlight.from}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>To:</Text>
                    <Text style={styles.detailValue}>{modalFlight.to}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Country:</Text>
                    <Text style={styles.detailValue}>{modalFlight.country}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>City:</Text>
                    <Text style={styles.detailValue}>{modalFlight.city}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Price:</Text>
                    <Text style={styles.detailValue}>${modalFlight.price}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Duration:</Text>
                    <Text style={styles.detailValue}>{modalFlight.duratuion}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Passengers:</Text>
                    <Text style={styles.detailValue}>{modalFlight.passanger}</Text>
                  </View>
                </>
              )}
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setViewModalOpen(false)}
              >
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      
      <Modal
        visible={deleteModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDeleteModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.modalTitle}>Delete Flight</Text>
            <Text style={styles.deleteText}>
              Are you sure you want to delete{' '}
              <Text style={styles.deleteBold}>{deleteFlightModal?.airline}</Text> flight?
            </Text>
            <View style={styles.deleteActions}>
              <TouchableOpacity
                style={styles.deleteCancelBtn}
                onPress={() => setDeleteModalOpen(false)}
              >
                <Text style={styles.deleteCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteConfirmBtn} onPress={confirmDeleteFlight}>
                <Text style={styles.deleteConfirmText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  headerActions: {
    gap: 12,
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addBtn: {
    backgroundColor: '#00c0f5',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '400',
  },
  cardPrice: {
    fontSize: 16,
    color: '#00c0f5',
    fontWeight: '700',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewBtn: {
    backgroundColor: '#e3f2fd',
  },
  editBtn: {
    backgroundColor: '#e8e8e8',
  },
  deleteBtn: {
    backgroundColor: '#ffebee',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#9e9e9e',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 1,
    backgroundColor: '#00c0f5',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  viewModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  viewModalImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  detailValue: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },
  closeBtn: {
    backgroundColor: '#00c0f5',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '85%',
  },
  deleteText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 24,
    lineHeight: 24,
  },
  deleteBold: {
    fontWeight: '700',
    color: '#000',
  },
  deleteActions: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteCancelBtn: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteCancelText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteConfirmBtn: {
    flex: 1,
    backgroundColor: '#f44336',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pagination: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingVertical: 16,
  backgroundColor: '#fff',
  borderTopWidth: 1,
  borderTopColor: '#eee',
},

pageBtn: {
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 8,
  backgroundColor: '#00c0f5',
},

pageText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},

pageIndicator: {
  fontSize: 14,
  fontWeight: '600',
  color: '#555',
},

disabledBtn: {
  opacity: 0.4,
},

});