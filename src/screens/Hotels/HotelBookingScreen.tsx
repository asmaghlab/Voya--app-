import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from "moment";

import { useAppDispatch, useAppSelector } from "../../routes/hooks";
import { createHotelBooking, clearError, fetchUserHotelBookings } from "../../features/bookings/hotelBookingSlice";

const hotelBookingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[0-9]{10,15}$/, "Phone number must be 10-15 digits"),
  guest: z.coerce.number().min(1, "Must have at least 1 guest").max(10, "Maximum 10 guests"),
  type: z.string().min(1, "Booking type is required"),
  checkIn: z.string().min(1, "Check-in date is required"),
  checkOut: z.string().min(1, "Check-out date is required"),
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

type HotelBookingFormData = z.infer<typeof hotelBookingSchema>;

interface Props {
  hotelId: string;
  hotelName: string;
  pricePerNight: number;
  modalVisible: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export const HotelBookingModal = ({ hotelId, hotelName, pricePerNight, modalVisible, onClose, onSuccess }: Props) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { isLoading, error } = useAppSelector((s) => s.hotelBooking);

  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [nights, setNights] = useState(1);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = useForm<HotelBookingFormData>({
    resolver: zodResolver(hotelBookingSchema),
    mode: "onChange",
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      guest: 1,
      type: "Standard Room",
      checkIn: "",
      checkOut: "",
      cardNumber: "",
      cvv: "",
      expiryDate: "",
    },
  });

  const guestCount = watch("guest");

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setNights(diffDays > 0 ? diffDays : 1);
    }
  }, [checkInDate, checkOutDate]);

  const totalPrice = pricePerNight * nights * guestCount;

  // Format card number with spaces
  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.slice(0, 16);
    const parts = [];
    for (let i = 0; i < limited.length; i += 4) {
      parts.push(limited.substring(i, i + 4));
    }
    return parts.join(' ');
  };

  // Format expiry date
  const formatExpiryDate = (value: string): string => {
    let cleaned = value.replace(/\D/g, '');
    cleaned = cleaned.slice(0, 4);
    if (cleaned.length > 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2);
    }
    return cleaned;
  };

  // Fill test data
  const fillTestData = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    setCheckInDate(tomorrow);
    setCheckOutDate(nextWeek);

    setValue("name", user?.name || "Test User");
    setValue("email", user?.email || "test@example.com");
    setValue("phone", user?.phone || "01234567890");
    setValue("cardNumber", "4012 8888 8888 1881");
    setValue("cvv", "123");
    setValue("expiryDate", "12/30");
    setValue("type", "Deluxe Suite");
    setValue("checkIn", moment(tomorrow).format("YYYY-MM-DD"));
    setValue("checkOut", moment(nextWeek).format("YYYY-MM-DD"));

    setTimeout(() => trigger(), 100);
  };

  const handleCheckInChange = (event: any, date?: Date) => {
    setShowCheckInPicker(false);
    if (date) {
      setCheckInDate(date);
      setValue("checkIn", moment(date).format("YYYY-MM-DD"), { shouldValidate: true });
      // Auto-set check-out to next day if not set
      if (!checkOutDate || date >= checkOutDate) {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        setCheckOutDate(nextDay);
        setValue("checkOut", moment(nextDay).format("YYYY-MM-DD"), { shouldValidate: true });
      }
    }
  };

  const handleCheckOutChange = (event: any, date?: Date) => {
    setShowCheckOutPicker(false);
    if (date) {
      setCheckOutDate(date);
      setValue("checkOut", moment(date).format("YYYY-MM-DD"), { shouldValidate: true });
    }
  };

  const onSubmit = async (data: HotelBookingFormData) => {
    if (!user) {
      Alert.alert("Error", "Please login first");
      return;
    }

    try {
      await dispatch(
        createHotelBooking({
          name: data.name,
          email: data.email,
          phone: data.phone,
          guest: data.guest,
          type: data.type,
          checkIn: new Date(data.checkIn).toISOString(),
          checkOut: new Date(data.checkOut).toISOString(),
          hotelname: hotelName,
          hotelId,
          payment: "paid",
          cardNumber: data.cardNumber.replace(/\s/g, ''),
          totalAmount: totalPrice,
        })
      ).unwrap();
      
      dispatch(fetchUserHotelBookings(user.email));

      reset();
      Alert.alert("Success", "Booking confirmed! 🎉");
      onSuccess?.();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong");
    }
  };

  const handleClose = () => {
    reset();
    onClose?.();
  };

  return (
    <Modal visible={modalVisible} animationType="slide" transparent>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            {/* Hotel Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{hotelName}</Text>
              <Text style={styles.cardPrice}>${pricePerNight.toFixed(2)} / night</Text>
            </View>

            <ScrollView 
              contentContainerStyle={styles.container} 
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Test Data Button (Development Only) */}
              {__DEV__ && (
                <TouchableOpacity 
                  style={styles.testButton}
                  onPress={fillTestData}
                >
                  <Text style={styles.testButtonText}>Check me </Text>
                </TouchableOpacity>
              )}

              {/* Guest Info */}
              <Text style={styles.sectionTitle}>Guest Information</Text>
              <Field label="Full Name" control={control} name="name" error={errors.name?.message} />
              <Field label="Email Address" control={control} name="email" error={errors.email?.message} />
              <Field label="Phone Number" control={control} name="phone" error={errors.phone?.message} />
              
              {/* Booking Details */}
              <Text style={styles.sectionTitle}>Booking Details</Text>
              
              <View style={styles.row}>
                <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Guests</Text>
                  <Controller
                    control={control}
                    name="guest"
                    render={({ field }) => (
                      <TextInput
                        style={[styles.input, errors.guest && styles.inputError]}
                        value={String(field.value)}
                        onChangeText={(text) => {
                          const num = text ? parseInt(text) : "";
                          field.onChange(num);
                        }}
                        keyboardType="number-pad"
                        placeholder="1"
                        placeholderTextColor="#6b7280"
                      />
                    )}
                  />
                  {errors.guest && <Text style={styles.error}>{errors.guest.message}</Text>}
                </View>

                <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Room Type</Text>
                  <Controller
                    control={control}
                    name="type"
                    render={({ field }) => (
                      <TextInput
                        style={[styles.input, errors.type && styles.inputError]}
                        value={field.value}
                        onChangeText={field.onChange}
                        placeholder="Standard Room"
                        placeholderTextColor="#6b7280"
                      />
                    )}
                  />
                  {errors.type && <Text style={styles.error}>{errors.type.message}</Text>}
                </View>
              </View>

              {/* Dates */}
              <Text style={styles.label}>Check-in Date</Text>
              <TouchableOpacity
                style={[styles.dateInput, errors.checkIn && styles.inputError]}
                onPress={() => setShowCheckInPicker(true)}
              >
                <Text style={checkInDate ? styles.dateText : styles.datePlaceholder}>
                  {checkInDate ? moment(checkInDate).format("YYYY-MM-DD") : "Select date"}
                </Text>
              </TouchableOpacity>
              {errors.checkIn && <Text style={styles.error}>{errors.checkIn.message}</Text>}
              {showCheckInPicker && (
                <DateTimePicker
                  value={checkInDate || new Date()}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={handleCheckInChange}
                />
              )}

              <Text style={[styles.label, { marginTop: 16 }]}>Check-out Date</Text>
              <TouchableOpacity
                style={[styles.dateInput, errors.checkOut && styles.inputError]}
                onPress={() => setShowCheckOutPicker(true)}
              >
                <Text style={checkOutDate ? styles.dateText : styles.datePlaceholder}>
                  {checkOutDate ? moment(checkOutDate).format("YYYY-MM-DD") : "Select date"}
                </Text>
              </TouchableOpacity>
              {errors.checkOut && <Text style={styles.error}>{errors.checkOut.message}</Text>}
              {showCheckOutPicker && (
                <DateTimePicker
                  value={checkOutDate || new Date()}
                  mode="date"
                  display="default"
                  minimumDate={checkInDate || new Date()}
                  onChange={handleCheckOutChange}
                />
              )}

              {/* Payment Section */}
              <Text style={styles.sectionTitle}>Payment Details</Text>
              
              <View style={styles.field}>
                <Text style={styles.label}>Card Number</Text>
                <Controller
                  control={control}
                  name="cardNumber"
                  render={({ field }) => (
                    <TextInput
                      style={[styles.input, errors.cardNumber && styles.inputError]}
                      value={field.value}
                      onChangeText={(text) => {
                        const formatted = formatCardNumber(text);
                        field.onChange(formatted);
                      }}
                      keyboardType="number-pad"
                      placeholder="4012 8888 8888 1881"
                      placeholderTextColor="#6b7280"
                      maxLength={19}
                    />
                  )}
                />
                {errors.cardNumber && <Text style={styles.error}>{errors.cardNumber.message}</Text>}
              </View>

              <View style={styles.row}>
                <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>CVV</Text>
                  <Controller
                    control={control}
                    name="cvv"
                    render={({ field }) => (
                      <TextInput
                        style={[styles.input, errors.cvv && styles.inputError]}
                        value={field.value}
                        onChangeText={(text) => {
                          field.onChange(text.replace(/[^0-9]/g, ''));
                        }}
                        keyboardType="number-pad"
                        placeholder="123"
                        placeholderTextColor="#6b7280"
                        maxLength={4}
                        secureTextEntry
                      />
                    )}
                  />
                  {errors.cvv && <Text style={styles.error}>{errors.cvv.message}</Text>}
                </View>

                <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Expiry Date (MM/YY)</Text>
                  <Controller
                    control={control}
                    name="expiryDate"
                    render={({ field }) => (
                      <TextInput
                        style={[styles.input, errors.expiryDate && styles.inputError]}
                        value={field.value}
                        onChangeText={(text) => {
                          const formatted = formatExpiryDate(text);
                          field.onChange(formatted);
                        }}
                        keyboardType="number-pad"
                        placeholder="12/30"
                        placeholderTextColor="#6b7280"
                        maxLength={5}
                      />
                    )}
                  />
                  {errors.expiryDate && <Text style={styles.error}>{errors.expiryDate.message}</Text>}
                </View>
              </View>

              {/* Price Summary */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Price Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Room Price ({nights} nights)</Text>
                  <Text style={styles.summaryValue}>${(pricePerNight * nights).toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Guests (x{guestCount})</Text>
                  <Text style={styles.summaryValue}>${totalPrice.toFixed(2)}</Text>
                </View>
                <View style={[styles.summaryRow, { marginTop: 8, borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 8 }]}>
                  <Text style={[styles.summaryLabel, { fontWeight: '700', fontSize: 16 }]}>Total</Text>
                  <Text style={[styles.summaryValue, { fontWeight: '800', fontSize: 20, color: '#00A6E8' }]}>
                    ${totalPrice.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitBtn, (!isValid || isLoading) && styles.submitBtnDisabled]}
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>
                    Pay ${totalPrice.toFixed(2)}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const Field = ({ label, control, name, error, ...props }: any) => (
  <Controller
    control={control}
    name={name}
    render={({ field }) => (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={String(field.value ?? "")}
          onChangeText={field.onChange}
          placeholder={label}
          placeholderTextColor="#6b7280"
          {...props}
        />
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    )}
  />
);

const styles = StyleSheet.create({
  keyboardAvoid: { flex: 1 },
  overlay: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeBtn: {
    position: "absolute",
    right: 16,
    top: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  card: {
    backgroundColor: "#F8F9FA",
    padding: 20,
    margin: 16,
    marginTop: 40,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  cardPrice: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#00A6E8" 
  },
  container: { 
    padding: 16,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 8,
    marginBottom: 16,
  },
  field: { 
    marginBottom: 16 
  },
  row: {
    flexDirection: "row",
    marginBottom: 16,
  },
  label: { 
    marginBottom: 6, 
    fontWeight: "600", 
    color: "#333",
    fontSize: 14,
  },
  input: { 
    borderWidth: 1, 
    borderColor: "#E5E7EB", 
    borderRadius: 10, 
    padding: 12, 
    fontSize: 15, 
    backgroundColor: "#F8F9FA",
    color: "#1A1A1A",
  },
  inputError: {
    borderColor: "#FF6B6B",
    backgroundColor: "#FFF9F9",
  },
  error: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
  },
  dateText: {
    fontSize: 15,
    color: "#1A1A1A",
  },
  datePlaceholder: {
    fontSize: 15,
    color: "#6b7280",
  },
  summaryCard: {
    backgroundColor: "#F0F9FF",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#C5E8FF",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  submitBtn: { 
    marginTop: 10,
    backgroundColor: "#00A6E8", 
    padding: 18, 
    borderRadius: 12, 
    alignItems: "center" 
  },
  submitBtnDisabled: {
    backgroundColor: "#99D9F3",
  },
  submitText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 16 
  },
});

export default HotelBookingModal;