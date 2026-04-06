import {
  ScrollView,
  View,
  Text,
  SafeAreaView,
  
  
  StyleSheet,
  
  
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";


import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
// import RNHTMLtoPDF from "react-native-html-to-pdf";

import { flightBookingApi, hotelBookingApi } from "../../utils/api";

/* ===========================
   TYPES
=========================== */
type FlightBooking = {
  id: string;
  name: string;
  from: string;
  to: string;
  airline?: string;
  tickets: number;
  type: string;
  date: string;
};

type HotelBooking = {
  id: string;
  name: string;
  hotelname?: string;
  guest: number;
  type: string;
  checkIn: string;
  checkOut: string;
};

/* ===========================
   SCREEN
=========================== */
export default function ReportsScreen() {
  const [flightBookings, setFlightBookings] = useState<FlightBooking[]>([]);
  const [hotelBookings, setHotelBookings] = useState<HotelBooking[]>([]);
  const [loading, setLoading] = useState(false);

  /* pagination */
  const PAGE_SIZE = 5;
  const [flightPage, setFlightPage] = useState(1);
  const [hotelPage, setHotelPage] = useState(1);




  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [flightsRes, hotelsRes] = await Promise.all([
          flightBookingApi.get("/flightbooking"),
          hotelBookingApi.get("/bookings/hotelbooking"),
        ]);

        setFlightBookings(flightsRes.data ?? []);
        setHotelBookings(hotelsRes.data ?? []);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ===========================
     PAGINATION LOGIC
=========================== */
  const flightData = useMemo(() => {
    const start = (flightPage - 1) * PAGE_SIZE;
    return flightBookings.slice(start, start + PAGE_SIZE);
  }, [flightBookings, flightPage]);

  const hotelData = useMemo(() => {
    const start = (hotelPage - 1) * PAGE_SIZE;
    return hotelBookings.slice(start, start + PAGE_SIZE);
  }, [hotelBookings, hotelPage]);

  /* ===========================
     TOP 5 DATA
=========================== */
  const topAirlines = useMemo(() => {
    const counts: Record<string, number> = {};
    flightBookings.forEach(f => {
      if (f.airline) counts[f.airline] = (counts[f.airline] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [flightBookings]);

  const topHotels = useMemo(() => {
    const counts: Record<string, number> = {};
    hotelBookings.forEach(h => {
      const name = h.hotelname || "Unknown";
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [hotelBookings]);

  /* ===========================
     PDF GENERATION
=========================== */
  // const generatePDF = async () => {
  //   let html = `
  //   <html>
  //   <head>
  //     <style>
  //       body { font-family: Arial, sans-serif; padding: 10px; }
  //       h1 { text-align: center; }
  //       h2 { margin-top:20px; color:#0f172a; }
  //       table { width:100%; border-collapse: collapse; margin-top:10px; }
  //       th, td { border:1px solid #ddd; padding:6px; font-size:12px; text-align:left; }
  //       th { background-color:#f3f4f6; color:#0f172a; font-weight:600; }
  //       tr:nth-child(even) { background-color:#f9fafb; }
  //     </style>
  //   </head>
  //   <body>
     
    
    
  //   <h1>Reports</h1>
  //     <h2>Flight Bookings</h2>
  //     <table>
  //       <tr>
  //         <th>Name</th><th>From</th><th>To</th><th>Airline</th><th>Tickets</th><th>Type</th><th>Date</th>
  //       </tr>`;
  //   flightBookings.forEach(f => {
  //     html += `<tr>
  //       <td>${f.name}</td>
  //       <td>${f.from}</td>
  //       <td>${f.to}</td>
  //       <td>${f.airline ?? '-'}</td>
  //       <td>${f.tickets}</td>
  //       <td>${f.type}</td>
  //       <td>${format(new Date(f.date), "MMM dd, yyyy")}</td>
  //     </tr>`;
  //   });
  //   html += `</table>`;

  //   html += `<h2>Hotel Bookings</h2>
  //     <table>
  //       <tr>
  //         <th>Name</th><th>Hotel</th><th>Guests</th><th>Type</th><th>Check-in</th><th>Check-out</th>
  //       </tr>`;
  //   hotelBookings.forEach(h => {
  //     html += `<tr>
  //       <td>${h.name}</td>
  //       <td>${h.hotelname ?? '-'}</td>
  //       <td>${h.guest}</td>
  //       <td>${h.type}</td>
  //       <td>${format(new Date(h.checkIn), "MMM dd, yyyy")}</td>
  //       <td>${format(new Date(h.checkOut), "MMM dd, yyyy")}</td>
  //     </tr>`;
  //   });
  //   html += `</table></body></html>`;

  //   try {
  //     const file = await (RNHTMLtoPDF as any).default.convert({
  //       html,
  //       fileName: 'reports',
  //     });

  //     Alert.alert("PDF Generated", `Saved at: ${file.filePath}`);
  //   } catch (e) {
  //     Alert.alert("Error", "Failed to generate PDF");
  //     console.log(e);
  //   }
  // };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 60 }} />;
  }

  return (
     <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
    <ScrollView style={styles.container}>
     
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
        <TouchableOpacity style={styles.pdfBtn} onPress={() => {}}>
          <Text style={styles.pdfText}>Export PDF</Text>
        </TouchableOpacity>
      </View>

      {/* SUMMARY */}
      <View style={styles.summaryRow}>
        <SummaryCard title="Flight Bookings" value={flightBookings.length} color="#0ea5e9" />
        <SummaryCard title="Hotel Bookings" value={hotelBookings.length} color="#8b5cf6" />
      </View>

      {/* FLIGHT BOOKINGS */}
      <SectionTitle title="Flight Bookings" />
      {flightData.length === 0 ? (
        <EmptyCard text="No Flight Bookings" />
      ) : (
        flightData.map(b => <FlightCard key={b.id} booking={b} />)
      )}
      <Pagination page={flightPage} total={flightBookings.length} onNext={() => setFlightPage(p => p + 1)} onPrev={() => setFlightPage(p => p - 1)} />

      {/* HOTEL BOOKINGS */}
      <SectionTitle title="Hotel Bookings" />
      {hotelData.length === 0 ? (
        <EmptyCard text="No Hotel Bookings" />
      ) : (
        hotelData.map(b => <HotelCard key={b.id} booking={b} />)
      )}
      <Pagination page={hotelPage} total={hotelBookings.length} onNext={() => setHotelPage(p => p + 1)} onPrev={() => setHotelPage(p => p - 1)} />

      {/* TOP 5 CARDS VERTICAL */}
      <SectionTitle title="Top 5 Airlines" />
      {topAirlines.map(([airline, count]) => (
        <Card key={airline} title={airline} subtitle={`${count} bookings`} color="#0ea5e9" />
      ))}

      <SectionTitle title="Top 5 Hotels" />
      {topHotels.map(([hotel, count]) => (
        <Card key={hotel} title={hotel} subtitle={`${count} bookings`} color="#8b5cf6" />
      ))}
      
    </ScrollView>
    </SafeAreaView>
  );
}

/* ===========================
   COMPONENTS
=========================== */
function SummaryCard({ title, value, color }: any) {
  return (
    <View style={[styles.summaryCard, { borderColor: color }]}>
      <Text style={styles.summaryLabel}>{title}</Text>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
    </View>
  );
}

function SectionTitle({ title }: any) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function EmptyCard({ text }: any) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

function Row({ label, value }: any) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function FlightCard({ booking }: { booking: FlightBooking }) {
  return (
    <View style={[styles.card, { borderColor: "#38bdf8" }]}>
      <Text style={styles.cardTitle}>✈ Flight Ticket</Text>
      <Row label="From" value={booking.from} />
      <Row label="To" value={booking.to} />
      <Row label="Tickets" value={booking.tickets} />
      <Row label="Type" value={booking.type} />
      <Row label="Date" value={format(new Date(booking.date), "MMM dd, yyyy")} />
    </View>
  );
}

function HotelCard({ booking }: { booking: HotelBooking }) {
  return (
    <View style={[styles.card, { borderColor: "#a855f7" }]}>
      <Text style={styles.cardTitle}>🏨 Hotel Reservation</Text>
      <Row label="Guests" value={booking.guest} />
      <Row label="Type" value={booking.type} />
      <Row label="Check-in" value={format(new Date(booking.checkIn), "MMM dd, yyyy")} />
      <Row label="Check-out" value={format(new Date(booking.checkOut), "MMM dd, yyyy")} />
    </View>
  );
}

function Card({ title, subtitle, color }: any) {
  return (
    <View style={[styles.topCard, { borderColor: color }]}>
      <Text style={[styles.topCardTitle, { color }]}>{title}</Text>
      <Text style={styles.topCardSubtitle}>{subtitle}</Text>
    </View>
  );
}

/* ===========================
   PAGINATION
=========================== */
function Pagination({ page, total, onNext, onPrev }: any) {
  const PAGE_SIZE = 5;
  const maxPage = Math.ceil(total / PAGE_SIZE);

  return (
    <View style={styles.pagination}>
      <TouchableOpacity disabled={page === 1} onPress={onPrev}>
        <Text style={[styles.pageBtn, page === 1 && styles.disabled]}>Prev</Text>
      </TouchableOpacity>

      <Text style={styles.pageText}>
        Page {page} / {maxPage || 1}
      </Text>

      <TouchableOpacity disabled={page === maxPage} onPress={onNext}>
        <Text style={[styles.pageBtn, page === maxPage && styles.disabled]}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ===========================
   STYLES
=========================== */
const styles = StyleSheet.create({
  container: { backgroundColor: "#f8fafc", padding: 16 },
  title: { fontSize: 28, fontWeight: "800", color: "#0f172a", marginBottom: 16 },
  pdfBtn: { backgroundColor: "#0284c7", padding: 12, borderRadius: 12, marginBottom: 16, alignItems: "center" },
  pdfBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  summaryCard: { flex: 1, backgroundColor: "#fff", padding: 16, borderRadius: 16, borderWidth: 2 },
  summaryLabel: { color: "#64748b", fontWeight: "600" },
  summaryValue: { fontSize: 28, fontWeight: "800", marginTop: 6 },

  sectionTitle: { fontSize: 22, fontWeight: "800", marginVertical: 16, color: "#1e293b" },
  emptyCard: { backgroundColor: "#fff", padding: 20, borderRadius: 16, alignItems: "center", marginBottom: 12 },
  emptyText: { color: "#64748b", fontWeight: "600" },

  card: { backgroundColor: "#fff", padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 2 },
  cardTitle: { fontSize: 18, fontWeight: "800", marginBottom: 8 },

  row: { flexDirection: "row", justifyContent: "space-between", marginVertical: 4 },
  label: { color: "#475569", fontWeight: "600" },
  value: { fontWeight: "700", color: "#0f172a" },

  topCard: { backgroundColor: "#fff", padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 2 },
  topCardTitle: { fontSize: 18, fontWeight: "800", marginBottom: 4 },
  topCardSubtitle: { fontSize: 14, color: "#475569" },

  pagination: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 16 },
  pageBtn: { fontWeight: "800", color: "#0284c7" },
  pageText: { fontWeight: "700", color: "#334155" },
  disabled: { color: "#cbd5e1" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  pdfText: { color: "#fff", fontWeight: "700" },
});



