import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "../../routes/hooks";
import { createFlightBooking, clearError, fetchUserFlightBookings } from "../../features/bookings/flightBookingSlice";
import { X, User, Phone, Mail, Ticket, Calendar, MapPin, CreditCard, Plane, Lock } from "lucide-react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from "moment";

const { width, height } = Dimensions.get("window");

/* ================= ZOD SCHEMA ================= */
const flightBookingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().regex(/^[0-9]{10,15}$/, "Phone must be 10–15 digits"),
  email: z.string().email("Invalid email"),
  tickets: z.coerce
    .number()
    .int()
    .min(1, "At least 1 ticket")
    .max(10, "Maximum 10 tickets"),
  type: z.string().min(1, "Flight type is required"),
  from: z.string().min(1, "From is required"),
  to: z.string().min(1, "To is required"),
  date: z.string().min(1, "Date is required"),
  cardNumber: z
    .string()
    .min(16, "Card number must be 16 digits")
    .max(19, "Card number is too long")
    .refine(val => /^[0-9\s]+$/.test(val.replace(/\s/g, '')), "Only numbers allowed")
    .refine(val => val.replace(/\s/g, '').length === 16, "Must be exactly 16 digits"),
  cvv: z
    .string()
    .regex(/^[0-9]{3,4}$/, "CVV must be 3 or 4 digits")
    .min(3, "CVV is required"),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid expiry date (MM/YY)")
    .refine(val => {
      const [month, year] = val.split('/');
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      const today = new Date();
      return expiry > today;
    }, "Card has expired"),
});

type FlightBookingFormData = z.infer<typeof flightBookingSchema>;

/* ================= COMPONENT ================= */
interface Props {
  visible: boolean;
  onClose: () => void;
  flight: any;
}

const FlightBookingScreen = ({ visible, onClose, flight }: Props) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { isLoading, error } = useAppSelector((state) => state.flightBooking);

  const [modalVisible, setModalVisible] = useState(visible);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showTestButton, setShowTestButton] = useState(__DEV__); // Show only in development

  useEffect(() => {
    setModalVisible(visible);
    if (visible) {
      resetForm();
    }
  }, [visible]);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = useForm<FlightBookingFormData>({
    resolver: zodResolver(flightBookingSchema),
    mode: "onChange",
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      email: user?.email || "",
      tickets: 1,
      type: flight?.type || "economy",
      from: flight?.from || "",
      to: flight?.to || "",
      date: "",
      cardNumber: "",
      cvv: "",
      expiryDate: "",
    },
  });

  /* ================= RESET FORM ================= */
  const resetForm = () => {
    reset({
      name: user?.name || "",
      phone: user?.phone || "",
      email: user?.email || "",
      tickets: 1,
      type: flight?.type || "economy",
      from: flight?.from || "",
      to: flight?.to || "",
      date: "",
      cardNumber: "",
      cvv: "",
      expiryDate: "",
    });
    setSelectedDate(null);
  };

  /* ================= FILL TEST DATA ================= */
  const fillTestData = () => {
    setValue("name", user?.name || "Test User");
    setValue("email", user?.email || "test@example.com");
    setValue("phone", user?.phone || "01234567890");
    setValue("cardNumber", "4012 8888 8888 1881");
    setValue("cvv", "123");
    setValue("expiryDate", "12/30");
    
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    setSelectedDate(futureDate);
    setValue("date", moment(futureDate).format("YYYY-MM-DD"));
    
    setTimeout(() => trigger(), 100);
  };

  /* ================= SET FLIGHT DATA ================= */
  useEffect(() => {
    if (flight) {
      setValue("from", flight.from, { shouldValidate: true });
      setValue("to", flight.to, { shouldValidate: true });
      setValue("type", flight.type || "economy", { shouldValidate: true });
    }
  }, [flight, setValue]);

  /* ================= WATCHERS ================= */
  const tickets = watch("tickets");
  const cardNumberValue = watch("cardNumber");

  const totalPrice = useMemo(() => {
    if (!flight?.price) return 0;
    return flight.price * tickets;
  }, [flight, tickets]);

  /* ================= ERROR HANDLING ================= */
  useEffect(() => {
    if (error) {
      alert(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  /* ================= DATE HANDLER ================= */
  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const formattedDate = moment(date).format("YYYY-MM-DD");
      setValue("date", formattedDate, { shouldValidate: true });
    }
  };

  /* ================= CARD NUMBER FORMATTING ================= */
  const formatCardNumber = (value: string): string => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    
    // Take only first 16 digits
    const limited = cleaned.slice(0, 16);
    
    // Add space every 4 digits
    const parts = [];
    for (let i = 0; i < limited.length; i += 4) {
      parts.push(limited.substring(i, i + 4));
    }
    
    return parts.join(' ');
  };

  /* ================= EXPIRY DATE FORMATTING ================= */
  const formatExpiryDate = (value: string): string => {
    // Remove all non-digits
    let cleaned = value.replace(/\D/g, '');
    
    // Take only first 4 digits
    cleaned = cleaned.slice(0, 4);
    
    // Add slash after 2 digits
    if (cleaned.length > 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2);
    }
    
    return cleaned;
  };

  /* ================= SUBMIT ================= */
  const onSubmit = async (data: FlightBookingFormData) => {
    if (!user) {
      alert("Please login first");
      return;
    }

    if (!flight) {
      alert("No flight selected");
      return;
    }

    try {
      await dispatch(
        createFlightBooking({
          ...data,
          airline: flight.airline,
          price: flight.price,
          payment: "paid",
          date: new Date(data.date).toISOString(),
          cardNumber: data.cardNumber.replace(/\s/g, ''), // Remove spaces for storage
        })
      ).unwrap();
      
      dispatch(fetchUserFlightBookings(user.email));
      alert("Booking confirmed 🎉");
      resetForm();
      onClose();
    } catch {
      alert("Something went wrong");
    }
  };

  /* ================= HANDLE CLOSE ================= */
  const handleClose = () => {
    setModalVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  /* ================= RENDER INPUT ================= */
  const renderInput = (
    name: keyof FlightBookingFormData,
    label: string,
    icon: React.ReactNode,
    props: any = {}
  ) => (
    <View style={styles.inputContainer}>
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>{label}</Text>
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <TextInput
              {...field}
              style={[
                styles.input, 
                errors[name] && styles.inputError,
                props.editable === false && styles.readOnlyInput
              ]}
              placeholderTextColor="#999"
              onChangeText={(text) => {
                let formattedText = text;
                
                // Apply formatting based on field type
                if (name === 'cardNumber') {
                  formattedText = formatCardNumber(text);
                } else if (name === 'expiryDate') {
                  formattedText = formatExpiryDate(text);
                }
                
                field.onChange(formattedText);
                trigger(name);
              }}
              value={field.value?.toString() || ""}
              {...props}
            />
          )}
        />
        {errors[name] && (
          <Text style={styles.errorText}>{errors[name]?.message}</Text>
        )}
      </View>
    </View>
  );

  /* ================= UI ================= */
  return (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="dark-content" backgroundColor="rgba(0,0,0,0.5)" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.overlay}>
          <TouchableOpacity 
            style={styles.backdrop}
            activeOpacity={1}
            onPress={handleClose}
          />
          
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Book Your Flight</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                <X size={28} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Test Data Button (Development Only) */}
              {showTestButton && (
                <TouchableOpacity 
                  style={styles.testButton}
                  onPress={fillTestData}
                >
                  <Text style={styles.testButtonText}>🔧 Fill Test Data</Text>
                </TouchableOpacity>
              )}

              {/* Flight Info Card */}
              {flight && (
                <View style={styles.flightCard}>
                  <View style={styles.flightHeader}>
                    <View style={styles.airlineInfo}>
                      <Plane size={20} color="#00A6E8" />
                      <Text style={styles.airlineText}>
                        {flight.airline || "Flight"}
                      </Text>
                    </View>
                    <Text style={styles.flightPrice}>
                      ${flight.price || "0"} <Text style={styles.perTicket}>(per ticket)</Text>
                    </Text>
                  </View>
                  <Text style={styles.routeText}>
                    {flight.from || "From"} → {flight.to || "To"}
                  </Text>
                  <Text style={styles.typeText}>
                    Class: {flight.type?.charAt(0).toUpperCase() + flight.type?.slice(1) || "Economy"}
                  </Text>
                </View>
              )}

              {/* Passenger Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Passenger Details</Text>
                
                {renderInput("name", "Full Name", <User size={18} color="#00A6E8" />, {
                  placeholder: "Enter your full name",
                  editable: !user?.name,
                  autoComplete: "name",
                })}

                {renderInput("email", "Email Address", <Mail size={18} color="#00A6E8" />, {
                  placeholder: "your@email.com",
                  keyboardType: "email-address",
                  autoCapitalize: "none",
                  autoComplete: "email",
                  editable: !user?.email,
                })}

                {renderInput("phone", "Phone Number", <Phone size={18} color="#00A6E8" />, {
                  placeholder: "01234567890",
                  keyboardType: "phone-pad",
                  autoComplete: "tel",
                  editable: !user?.phone,
                })}
              </View>

              {/* Flight Details */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Flight Details</Text>
                
                {/* From & To - Read Only */}
                <View style={styles.row}>
                  <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                    <View style={styles.iconContainer}>
                      <MapPin size={18} color="#00A6E8" />
                    </View>
                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>From</Text>
                      <TextInput
                        style={[styles.input, styles.readOnlyInput]}
                        value={flight?.from || ""}
                        placeholderTextColor="#999"
                        editable={false}
                      />
                    </View>
                  </View>

                  <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                    <View style={styles.iconContainer}>
                      <MapPin size={18} color="#00A6E8" />
                    </View>
                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>To</Text>
                      <TextInput
                        style={[styles.input, styles.readOnlyInput]}
                        value={flight?.to || ""}
                        placeholderTextColor="#999"
                        editable={false}
                      />
                    </View>
                  </View>
                </View>

                {/* Tickets & Date */}
                <View style={styles.row}>
                  <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                    <View style={styles.iconContainer}>
                      <Ticket size={18} color="#00A6E8" />
                    </View>
                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>Tickets</Text>
                      <Controller
                        control={control}
                        name="tickets"
                        render={({ field }) => (
                          <TextInput
                            style={[styles.input, errors.tickets && styles.inputError]}
                            placeholder="1"
                            placeholderTextColor="#999"
                            keyboardType="number-pad"
                            onChangeText={(text) => {
                              const num = text ? parseInt(text) : "";
                              field.onChange(num);
                              trigger("tickets");
                            }}
                            value={field.value?.toString() || ""}
                          />
                        )}
                      />
                      {errors.tickets && (
                        <Text style={styles.errorText}>{errors.tickets.message}</Text>
                      )}
                    </View>
                  </View>

                  <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                    <View style={styles.iconContainer}>
                      <Calendar size={18} color="#00A6E8" />
                    </View>
                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>Flight Date</Text>
                      <TouchableOpacity
                        style={[styles.input, styles.dateInput, errors.date && styles.inputError]}
                        onPress={() => setShowDatePicker(true)}
                      >
                        <Text style={selectedDate ? styles.dateText : styles.datePlaceholder}>
                          {selectedDate ? moment(selectedDate).format("YYYY-MM-DD") : "Select date"}
                        </Text>
                      </TouchableOpacity>
                      {showDatePicker && (
                        <DateTimePicker
                          value={selectedDate || new Date()}
                          mode="date"
                          display="default"
                          minimumDate={new Date()}
                          onChange={handleDateChange}
                        />
                      )}
                      {errors.date && (
                        <Text style={styles.errorText}>{errors.date.message}</Text>
                      )}
                    </View>
                  </View>
                </View>

                {/* Flight Type - Read Only */}
                <View style={styles.inputContainer}>
                  <View style={styles.iconContainer}>
                    <Plane size={18} color="#00A6E8" />
                  </View>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Class Type</Text>
                    <TextInput
                      style={[styles.input, styles.readOnlyInput]}
                      value={flight?.type?.charAt(0).toUpperCase() + flight?.type?.slice(1) || "Economy"}
                      placeholderTextColor="#999"
                      editable={false}
                    />
                  </View>
                </View>
              </View>

              {/* Payment Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Payment Details</Text>
                
                {renderInput("cardNumber", "Card Number", <CreditCard size={18} color="#00A6E8" />, {
                  placeholder: "4012 8888 8888 1881",
                  keyboardType: "number-pad",
                  maxLength: 19,
                  autoComplete: "cc-number",
                })}

                <View style={styles.row}>
                  <View style={[styles.inputContainer, { flex: 2, marginRight: 8 }]}>
                    <View style={styles.iconContainer}>
                      <Lock size={18} color="#00A6E8" />
                    </View>
                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>CVV</Text>
                      <Controller
                        control={control}
                        name="cvv"
                        render={({ field }) => (
                          <TextInput
                            style={[styles.input, errors.cvv && styles.inputError]}
                            placeholder="123"
                            placeholderTextColor="#999"
                            keyboardType="number-pad"
                            maxLength={4}
                            secureTextEntry
                            onChangeText={(text) => {
                              field.onChange(text.replace(/[^0-9]/g, ''));
                              trigger("cvv");
                            }}
                            value={field.value}
                          />
                        )}
                      />
                      {errors.cvv && (
                        <Text style={styles.errorText}>{errors.cvv.message}</Text>
                      )}
                    </View>
                  </View>

                  <View style={[styles.inputContainer, { flex: 3, marginLeft: 8 }]}>
                    <View style={styles.iconContainer}>
                      <Calendar size={18} color="#00A6E8" />
                    </View>
                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>Expiry Date (MM/YY)</Text>
                      {renderInput("expiryDate", "", <Calendar size={18} color="#00A6E8" />, {
                        placeholder: "12/30",
                        keyboardType: "number-pad",
                        maxLength: 5,
                      })}
                    </View>
                  </View>
                </View>
              </View>

              {/* Total Price */}
              <View style={styles.totalContainer}>
                <View>
                  <Text style={styles.totalLabel}>Total Price</Text>
                  <Text style={styles.ticketsText}>
                    {tickets} ticket{tickets > 1 ? 's' : ''} × ${flight?.price || 0}
                  </Text>
                </View>
                <Text style={styles.totalPrice}>${totalPrice.toFixed(2)}</Text>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={handleClose}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.confirmButton, 
                    (!isValid || isLoading) && styles.confirmButtonDisabled
                  ]}
                  onPress={handleSubmit(onSubmit)}
                  disabled={!isValid || isLoading}
                >
                  <Text style={styles.confirmButtonText}>
                    {isLoading ? "Processing..." : `Pay $${totalPrice.toFixed(2)}`}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.bottomSpace} />
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: height * 0.9,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  testButton: {
    backgroundColor: "#6C63FF",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignSelf: 'center',
  },
  testButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  flightCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  flightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  airlineInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  airlineText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginLeft: 8,
  },
  flightPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: "#00A6E8",
  },
  perTicket: {
    fontSize: 12,
    color: "#666",
    fontWeight: "400",
  },
  routeText: {
    fontSize: 15,
    color: "#666",
    fontWeight: "500",
    marginBottom: 4,
  },
  typeText: {
    fontSize: 14,
    color: "#888",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  inputError: {
    borderColor: "#FF6B6B",
    backgroundColor: "#FFF9F9",
  },
  readOnlyInput: {
    backgroundColor: "#F0F0F0",
    color: "#666",
  },
  dateInput: {
    justifyContent: "center",
  },
  dateText: {
    fontSize: 15,
    color: "#1A1A1A",
  },
  datePlaceholder: {
    fontSize: 15,
    color: "#999",
  },
  errorText: {
    fontSize: 12,
    color: "#FF6B6B",
    marginTop: 4,
    marginLeft: 4,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#C5E8FF",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  ticketsText: {
    fontSize: 14,
    color: "#666",
  },
  totalPrice: {
    fontSize: 28,
    fontWeight: "800",
    color: "#00A6E8",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#00A6E8",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: "#99D9F3",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  bottomSpace: {
    height: 40,
  },
});

export default FlightBookingScreen;