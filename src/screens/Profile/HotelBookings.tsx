import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAppSelector } from "../../routes/hooks";
import { format } from "date-fns";
import { useState ,useEffect } from "react";
import { useAppDispatch } from "../../routes/hooks";
import { fetchUserHotelBookings } from "../../features/bookings/hotelBookingSlice";

const ITEMS_PER_PAGE = 2;

export default function HotelBookings() {
   const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);
  const { userBookings, isLoading } = useAppSelector(s => s.hotelBooking);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (user?.email) {
      dispatch(fetchUserHotelBookings(user.email));
    }
  }, [user?.email, dispatch]);

  if (isLoading)
    return <Text style={styles.loading}>Loading hotel bookings...</Text>;

  if (!userBookings.length)
    return (
      <View style={styles.noBookingCard}>
        <Text style={styles.noBookingText}>No Hotel Bookings</Text>
      </View>
    );

  const totalPages = Math.ceil(userBookings.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const currentBookings = userBookings.slice(startIndex, endIndex);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hotel Bookings</Text>

      {currentBookings.map(b => (
        <View key={b.id} style={styles.card}>
          <Text style={styles.cardTitle}>🏨 Hotel Reservation</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Guests</Text>
            <Text style={styles.value}>{b.guest}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Type</Text>
            <Text style={styles.value}>{b.type}</Text>
          </View>

          <View style={[styles.row, styles.highlightRow]}>
            <Text style={styles.label}>Check-in</Text>
            <Text style={styles.value}>
              {format(new Date(b.checkIn), "MMM dd, yyyy")}
            </Text>
          </View>

          <View style={[styles.row, styles.lightRow]}>
            <Text style={styles.label}>Check-out</Text>
            <Text style={styles.value}>
              {format(new Date(b.checkOut), "MMM dd, yyyy")}
            </Text>
          </View>
        </View>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={styles.pagination}>
          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1;
            const isActive = page === currentPage;

            return (
              <TouchableOpacity
                key={page}
                style={[
                  styles.pageBtn,
                  isActive && styles.activePageBtn,
                ]}
                onPress={() => setCurrentPage(page)}
              >
                <Text
                  style={[
                    styles.pageText,
                    isActive && styles.activePageText,
                  ]}
                >
                  {page}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  loading: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#64748b",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 16,
  },
  noBookingCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#06b6d4",
  },
  noBookingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 2,
    borderColor: "#22d3ee", // لون الكارد
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0c4a6e",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  highlightRow: {
    backgroundColor: "#e0f2fe",
  },
  lightRow: {
    backgroundColor: "#f1f5f9",
  },
  label: {
    fontWeight: "700",
    color: "#0c4a6e",
    fontSize: 14,
  },
  value: {
    fontWeight: "600",
    color: "#1e293b",
    fontSize: 14,
  },
  pagination: {
  flexDirection: "row",
  justifyContent: "center",
  gap: 10,
  marginTop: 12,
},

pageBtn: {
  width: 42,
  height: 42,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: "#22d3ee",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#fff",
},

activePageBtn: {
  backgroundColor: "#0ea5e9",
  borderColor: "#0ea5e9",
},

pageText: {
  fontWeight: "800",
  color: "#0ea5e9",
  fontSize: 16,
},

activePageText: {
  color: "#fff",
},

});
