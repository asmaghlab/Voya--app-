import React, { useEffect, useState } from "react";
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
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../routes/store";
import {
  fetchHotels,
  addHotel,
  editHotel,
  deleteHotel,
} from "../../features/hotels/hotelsSlice";
import { IHotel } from "../../features/hotels/type";

const ITEMS_PER_PAGE = 5;

export default function ManageHotelsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { hotels, status } = useSelector((state: RootState) => state.hotels);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [form, setForm] = useState<Partial<IHotel>>({});
  const [selectedHotel, setSelectedHotel] = useState<IHotel | null>(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [modalHotel, setModalHotel] = useState<IHotel | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteHotelModal, setDeleteHotelModal] = useState<IHotel | null>(null);

  const [searchText, setSearchText] = useState("");
  const [filteredHotels, setFilteredHotels] = useState<IHotel[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    setLoading(true);
    try {
      await dispatch(fetchHotels()).unwrap();
    } catch (err) {
      Alert.alert("Error", "Failed to load hotels");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!searchText) {
      setFilteredHotels(hotels);
    } else {
      const lower = searchText.toLowerCase();
      setFilteredHotels(
        hotels.filter(
          (h) =>
            h.name?.toLowerCase().includes(lower) ||
            h.cityId?.toLowerCase().includes(lower) ||
            h.countryId?.toLowerCase().includes(lower) ||
            h.id?.toString().includes(lower)
        )
      );
    }
    setCurrentPage(1);
  }, [searchText, hotels]);

  const totalPages = Math.ceil(filteredHotels.length / ITEMS_PER_PAGE);
  const paginatedHotels = filteredHotels.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const openAddModal = () => {
    setFormMode("add");
    setForm({});
    setSelectedHotel(null);
    setFormModalOpen(true);
  };

  const openEditModal = (hotel: IHotel) => {
    setFormMode("edit");
    setSelectedHotel(hotel);
    setForm({
      name: hotel.name,
      cityId: hotel.cityId,
      countryId: hotel.countryId,
      pricePerNight: hotel.pricePerNight,
      currency: hotel.currency,
      stars: hotel.stars,
      rating: hotel.rating,
      description: hotel.description,
      images: hotel.images,
      amenities: hotel.amenities,
    });
    setFormModalOpen(true);
  };

  const closeFormModal = () => {
    setFormModalOpen(false);
    setForm({});
    setSelectedHotel(null);
    setFormMode("add");
  };

  const validateAndSubmit = async () => {
    const required = ["name", "cityId", "countryId", "pricePerNight"] as const;
    for (const key of required) {
      if (!form[key as keyof IHotel]) {
        Alert.alert("Error", `Please fill ${key}`);
        return;
      }
    }

    const onlyText = /^[A-Za-z ]+$/;
    const minLen = /^.{3,}$/;
    const onlyNumbers = /^[0-9]+$/;
    const urlRegex = /^(https?:\/\/[^\s]+)$/;

    if (!form.name || !minLen.test(form.name)) {
      Alert.alert("Error", "Hotel name must be at least 3 characters");
      return;
    }

    if (
      !form.cityId ||
      !onlyText.test(form.cityId) ||
      !minLen.test(form.cityId)
    ) {
      Alert.alert(
        "Error",
        "City must contain letters only and at least 3 characters"
      );
      return;
    }

    if (
      !form.countryId ||
      !onlyText.test(form.countryId) ||
      !minLen.test(form.countryId)
    ) {
      Alert.alert(
        "Error",
        "Country must contain letters only and at least 3 characters"
      );
      return;
    }

    if (!form.pricePerNight || !onlyNumbers.test(String(form.pricePerNight))) {
      Alert.alert("Error", "Price must be numbers only");
      return;
    }

    if (form.images && !urlRegex.test(String(form.images))) {
      Alert.alert("Error", "Image must be a valid URL");
      return;
    }

    try {
      if (formMode === "add") {
        await dispatch(addHotel(form as Omit<IHotel, "id">)).unwrap();
        Alert.alert("Success", "Hotel added successfully");
      } else if (formMode === "edit" && selectedHotel) {
        const hotelData: Omit<IHotel, "id"> = {
          name: form.name || selectedHotel.name,
          cityId: form.cityId || selectedHotel.cityId,
          countryId: form.countryId || selectedHotel.countryId,
          pricePerNight: form.pricePerNight ?? selectedHotel.pricePerNight,
          currency: form.currency || selectedHotel.currency,
          stars: form.stars ?? selectedHotel.stars,
          rating: form.rating ?? selectedHotel.rating,
          description: form.description || selectedHotel.description,
          images: form.images || selectedHotel.images,
          amenities: form.amenities || selectedHotel.amenities,
        };

        await dispatch(
          editHotel({
            id: selectedHotel.id,
            data: hotelData,
          })
        ).unwrap();
        Alert.alert("Success", "Hotel updated successfully");
      }
      closeFormModal();
      await loadHotels();
    } catch (err) {
      Alert.alert("Error", `Failed to ${formMode} hotel`);
    }
  };

  const confirmDeleteHotel = async () => {
    if (!deleteHotelModal) return;
    try {
      await dispatch(deleteHotel(deleteHotelModal.id)).unwrap();
      setDeleteModalOpen(false);
      setDeleteHotelModal(null);
      Alert.alert("Success", "Hotel deleted successfully");
      await loadHotels();
    } catch (err) {
      Alert.alert("Error", "Failed to delete hotel");
    }
  };

  const renderHotelCard = ({ item }: { item: IHotel }) => (
    <View style={styles.card}>
      {item.images?.length > 0 && (
        <Image source={{ uri: item.images[0] }} style={styles.cardImage} />
      )}

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>

        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>City:</Text>
          <Text style={styles.cardValue}>{item.cityId}</Text>
        </View>

        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Country:</Text>
          <Text style={styles.cardValue}>{item.countryId}</Text>
        </View>

        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Price/Night:</Text>
          <Text style={styles.cardPrice}>
            ${item.pricePerNight} {item.currency || "USD"}
          </Text>
        </View>

        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Stars:</Text>
          <Text style={styles.cardValue}>{"⭐".repeat(item.stars || 0)}</Text>
        </View>

        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Rating:</Text>
          <Text style={styles.cardValue}>{item.rating}/10</Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.viewBtn]}
            onPress={() => {
              setModalHotel(item);
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
              setDeleteHotelModal(item);
              setDeleteModalOpen(true);
            }}
          >
            <Text style={styles.actionBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hotels Management</Text>
        <View style={styles.headerActions}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search hotels..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
            <Text style={styles.addBtnText}>+ New Hotel</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hotel List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00c0f5" />
        </View>
      ) : (
        <FlatList
          data={paginatedHotels}
          renderItem={renderHotelCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadHotels();
              }}
              colors={["#00c0f5"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hotels found</Text>
            </View>
          }
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageBtn, currentPage === 1 && styles.disabledBtn]}
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

      {/* Add/Edit Modal */}
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
                {formMode === "edit" ? "Edit Hotel" : "Add Hotel"}
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Hotel Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Hotel Name"
                  value={form.name || ""}
                  onChangeText={(text) => setForm({ ...form, name: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  value={form.cityId || ""}
                  onChangeText={(text) => setForm({ ...form, cityId: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Country</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Country"
                  value={form.countryId || ""}
                  onChangeText={(text) => setForm({ ...form, countryId: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Price Per Night</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Price"
                  keyboardType="numeric"
                  value={form.pricePerNight?.toString() || ""}
                  onChangeText={(text) =>
                    setForm({
                      ...form,
                      pricePerNight: text === "" ? undefined : Number(text),
                    })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Currency</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Currency (e.g., USD)"
                  value={form.currency || ""}
                  onChangeText={(text) => setForm({ ...form, currency: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Stars (1-5)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Stars"
                  keyboardType="numeric"
                  value={form.stars?.toString() || ""}
                  onChangeText={(text) =>
                    setForm({
                      ...form,
                      stars: text === "" ? undefined : Number(text),
                    })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Rating (1-10)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Rating"
                  keyboardType="numeric"
                  value={form.rating?.toString() || ""}
                  onChangeText={(text) =>
                    setForm({
                      ...form,
                      rating: text === "" ? undefined : Number(text),
                    })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Description"
                  multiline
                  numberOfLines={4}
                  value={form.description || ""}
                  onChangeText={(text) =>
                    setForm({ ...form, description: text })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Image URL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Image URL"
                  value={form.images?.[0] ?? ""}
                  onChangeText={(text) =>
                    setForm({ ...form, images: text ? [text] : [] })
                  }
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={closeFormModal}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={validateAndSubmit}
                >
                  <Text style={styles.submitBtnText}>
                    {formMode === "edit" ? "Save" : "Add"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* View Modal */}
      <Modal
        visible={viewModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setViewModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.viewModalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Hotel Details</Text>
              {modalHotel && (
                <>
                  {modalHotel.images?.length > 0 && (
                    <Image
                      source={{ uri: modalHotel.images[0] }}
                      style={styles.viewModalImage}
                    />
                  )}

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Name:</Text>
                    <Text style={styles.detailValue}>{modalHotel.name}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>City:</Text>
                    <Text style={styles.detailValue}>{modalHotel.cityId}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Country:</Text>
                    <Text style={styles.detailValue}>
                      {modalHotel.countryId}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Price/Night:</Text>
                    <Text style={styles.detailValue}>
                      ${modalHotel.pricePerNight} {modalHotel.currency || "USD"}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Stars:</Text>
                    <Text style={styles.detailValue}>{modalHotel.stars}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Rating:</Text>
                    <Text style={styles.detailValue}>
                      {modalHotel.rating}/10
                    </Text>
                  </View>
                  {modalHotel.description && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Description:</Text>
                      <Text style={styles.detailValue}>
                        {modalHotel.description}
                      </Text>
                    </View>
                  )}
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

      {/* Delete Modal */}
      <Modal
        visible={deleteModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDeleteModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.modalTitle}>Delete Hotel</Text>
            <Text style={styles.deleteText}>
              Are you sure you want to delete{" "}
              <Text style={styles.deleteBold}>{deleteHotelModal?.name}</Text>?
            </Text>
            <View style={styles.deleteActions}>
              <TouchableOpacity
                style={styles.deleteCancelBtn}
                onPress={() => setDeleteModalOpen(false)}
              >
                <Text style={styles.deleteCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteConfirmBtn}
                onPress={confirmDeleteHotel}
              >
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
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    padding: 16,
    paddingTop: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  headerActions: {
    gap: 12,
  },
  searchInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#000",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  addBtn: {
    backgroundColor: "#00c0f5",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  addBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  cardValue: {
    fontSize: 14,
    color: "#000",
    fontWeight: "400",
  },
  cardPrice: {
    fontSize: 16,
    color: "#00c0f5",
    fontWeight: "700",
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  viewBtn: {
    backgroundColor: "#e3f2fd",
  },
  editBtn: {
    backgroundColor: "#e8e8e8",
  },
  deleteBtn: {
    backgroundColor: "#ffebee",
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#000",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#9e9e9e",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  submitBtn: {
    flex: 1,
    backgroundColor: "#00c0f5",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  viewModalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  viewModalImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    resizeMode: "cover",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
  detailValue: {
    fontSize: 15,
    color: "#000",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  closeBtn: {
    backgroundColor: "#00c0f5",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  closeBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteModalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "85%",
  },
  deleteText: {
    fontSize: 16,
    color: "#000",
    marginBottom: 24,
    lineHeight: 24,
  },
  deleteBold: {
    fontWeight: "700",
    color: "#000",
  },
  deleteActions: {
    flexDirection: "row",
    gap: 12,
  },
  deleteCancelBtn: {
    flex: 1,
    backgroundColor: "#e0e0e0",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteCancelText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteConfirmBtn: {
    flex: 1,
    backgroundColor: "#f44336",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteConfirmText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  pageBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#00c0f5",
  },
  pageText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  pageIndicator: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  disabledBtn: {
    opacity: 0.4,
  },
});
