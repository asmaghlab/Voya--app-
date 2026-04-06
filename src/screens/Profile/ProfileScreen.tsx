import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";
import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../routes/hooks";
import { updateUserProfile, logout } from "../../features/auth/authSlice";
import ProfileAvatar from "./ProfileAvatar";
import UserBookings from "./UserBookings";
import { User, Mail, Phone, MapPin, Edit3, Check, X, Plane, Ticket, Globe } from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);
  
  // احصل على بيانات الحجوزات
  const { bookings } = useAppSelector((state) => state.flightBooking);

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
  });

  // احسب الإحصائيات من بيانات المستخدم والحجوزات
  const stats = useMemo(() => {
    if (!user) return { flights: 0, bookings: 0, countries: 0 };
    
    // احسب عدد الرحلات من الحجوزات - استخدم email فقط للمقارنة
    const userBookings = bookings.filter(booking => 
      booking.email === user.email
    );
    
    // احسب عدد الدول الفريدة من الحجوزات
    const uniqueCountries = new Set(
      userBookings
        .map(booking => booking.to?.split(',').pop()?.trim())
        .filter(Boolean)
    );
    
    return {
      flights: userBookings.length,
      bookings: userBookings.length,
      countries: uniqueCountries.size,
    };
  }, [user, bookings]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        country: user.country || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (user) {
      try {
        await dispatch(
          updateUserProfile({ id: user.id, ...form })
        ).unwrap();
        setEditMode(false);
      } catch (error) {
        alert("Failed to update profile");
      }
    }
  };

  const handleCancel = () => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        country: user.country || "",
      });
    }
    setEditMode(false);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
        <Text style={styles.loginRequired}>Please login to view your profile</Text>
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      {/* Header with User Info */}
      <View style={styles.header}>
        <View style={styles.profileHeader}>
          <ProfileAvatar user={user} />
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <View style={styles.emailRow}>
              <Mail size={16} color="#666" />
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
            
            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={() => setEditMode(true)}
            >
              <Edit3 size={16} color="#FFF" />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards - مع بيانات حقيقية */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Plane size={20} color="#00A6E8" />
            <Text style={styles.statNumber}>{stats.flights}</Text>
            <Text style={styles.statLabel}>Flights</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statCard}>
            <Ticket size={20} color="#00A6E8" />
            <Text style={styles.statNumber}>{stats.bookings}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statCard}>
            <Globe size={20} color="#00A6E8" />
            <Text style={styles.statNumber}>{stats.countries}</Text>
            <Text style={styles.statLabel}>Countries</Text>
          </View>
        </View>
      </View>

      {/* Edit Form Modal */}
      {editMode && (
        <View style={styles.modalOverlay}>
          <View style={styles.editModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={handleCancel}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              {[
                { key: "name", icon: User, label: "Full Name", placeholder: "Enter your name" },
                { key: "email", icon: Mail, label: "Email", placeholder: "your@email.com" },
                { key: "phone", icon: Phone, label: "Phone", placeholder: "+1234567890" },
                { key: "country", icon: MapPin, label: "Country", placeholder: "Your country" },
              ].map((item) => (
                <View key={item.key} style={styles.inputGroup}>
                  <View style={styles.inputLabelRow}>
                    <item.icon size={16} color="#00A6E8" />
                    <Text style={styles.inputLabel}>{item.label}</Text>
                  </View>
                  <TextInput
                    value={form[item.key as keyof typeof form]}
                    onChangeText={(text) =>
                      setForm(prev => ({ ...prev, [item.key]: text }))
                    }
                    style={styles.input}
                    placeholder={item.placeholder}
                    placeholderTextColor="#999"
                    keyboardType={item.key === "email" ? "email-address" : "default"}
                  />
                </View>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Check size={18} color="#FFF" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <User size={20} color="#00A6E8" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{user.name}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Mail size={20} color="#00A6E8" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Phone size={20} color="#00A6E8" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{user.phone || "Not set"}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <MapPin size={20} color="#00A6E8" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Country</Text>
              <Text style={styles.infoValue}>{user.country || "Not set"}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* My Bookings Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Bookings</Text>
          {stats.bookings > 0 && (
            <TouchableOpacity style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <UserBookings />
      </View>
      {/* Logout Button */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
  },
  loginRequired: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#00A6E8',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#FFF',
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  userInfo: {
    flex: 1,
    marginLeft: 20,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userEmail: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A6E8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 6,
  },
  editProfileText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statCard: {
    alignItems: 'center',
    padding: 15,
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#00A6E8',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  editModal: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    padding: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  formContainer: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 0,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00A6E8',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  viewAllBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F0F9FF',
  },
  viewAllText: {
    fontSize: 14,
    color: '#00A6E8',
    fontWeight: '600',
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  settingsSection: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  settingArrow: {
    fontSize: 24,
    color: '#00A6E8',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpace: {
    height: 40,
  },
});