import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAppSelector,useAppDispatch } from "../../routes/hooks";
import { format } from "date-fns";
import { useState } from "react";
import { useEffect} from "react";
import { fetchUserFlightBookings } from "../../features/bookings/flightBookingSlice";

const ITEMS_PER_PAGE = 2;

export default function FlightBookings() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);
  const { userBookings, isLoading } = useAppSelector(s => s.flightBooking);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (user?.email) {
      dispatch(fetchUserFlightBookings(user.email));
    }
  }, [user?.email, dispatch]);

  if (isLoading)
    return <Text style={styles.loading}>Loading flight bookings...</Text>;

  if (!userBookings.length)
    return (
      <View style={styles.noBookingCard}>
        <Text style={styles.noBookingText}>No Flight Bookings</Text>
      </View>
    );

  const totalPages = Math.ceil(userBookings.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const currentBookings = userBookings.slice(startIndex, endIndex);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Flight Bookings</Text>

      {currentBookings.map(b => (
        <View key={b.id} style={styles.card}>
          <Text style={styles.cardTitle}>✈ Flight Ticket</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Tickets</Text>
            <Text style={styles.value}>{b.tickets}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Type</Text>
            <Text style={styles.value}>{b.type}</Text>
          </View>

          <View style={[styles.row, styles.highlightRow]}>
            <Text style={styles.label}>From</Text>
            <Text style={styles.value}>{b.from}</Text>
          </View>

          <View style={[styles.row, styles.lightRow]}>
            <Text style={styles.label}>To</Text>
            <Text style={styles.value}>{b.to}</Text>
          </View>

          <View style={[styles.row, styles.highlightRow]}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>
              {format(new Date(b.date), "MMM dd, yyyy")}
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
    marginTop: 20,
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
    borderColor: "#22d3ee", // لون الـ border للكارد
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0c4a6e", // لون مميز للعنوان
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
    color: "#0c4a6e", // لون مميز للعناوين
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
