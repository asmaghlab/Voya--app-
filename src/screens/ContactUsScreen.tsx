import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Header } from "../components/home/Header";
import Toast from "react-native-toast-message";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

const API_URL = "https://693e2dd4f55f1be793048237.mockapi.io/contactus/messages";

const ContactUsScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendMessage = async () => {
    // Validation
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      Toast.show({
        type: "error",
        text1: "Please fill all fields",
        text2: "All fields are required",
      });
      return;
    }

    if (!validateEmail(email)) {
      Toast.show({
        type: "error",
        text1: "Invalid email",
        text2: "Please enter a valid email address",
      });
      return;
    }

    setLoading(true);

    try {
      await axios.post(API_URL, {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        createdAt: new Date().toISOString(),
      });

      Toast.show({
        type: "success",
        text1: "Message sent successfully!",
        text2: "We'll get back to you soon",
      });

      // Clear form
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error("Error:", error);
      Toast.show({
        type: "error",
        text1: "Failed to send message",
        text2: "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
      <Header />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Contact Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Send us a Message</Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#00A6E8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor="#00A6E8"
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#00A6E8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor="#00A6E8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="document-text-outline" size={20} color="#00A6E8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Subject"
                placeholderTextColor="#00A6E8"
                value={subject}
                onChangeText={setSubject}
                editable={!loading}
              />
            </View>

            <View style={styles.messageContainer}>
              <TextInput
                style={styles.messageInput}
                placeholder="Your message..."
                placeholderTextColor="#00A6E8"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={message}
                onChangeText={setMessage}
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSendMessage}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Ionicons name="paper-plane-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitButtonText}>Send Message</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Contact Information */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Other Ways to Reach Us</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: "#fff" }]}>
                  <Ionicons name="mail" size={22} color="#00A6E8" />
                </View>
                <View>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>support@voya.com</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: "#fff" }]}>
                  <Ionicons name="call" size={22} color="#00A6E8" />
                </View>
                <View>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>+1 (123) 456-7890</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: "#fff" }]}>
                  <Ionicons name="location" size={22} color="#00A6E8" />
                </View>
                <View>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>123 Travel Street, Adventure City</Text>
                </View>
              </View>
            </View>

            {/* Working Hours */}
            <View style={[styles.infoCard, { marginTop: 16 }]}>
              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: "#fff" }]}>
                  <Ionicons name="time-outline" size={22} color="#00A6E8" />
                </View>
                <View>
                  <Text style={styles.infoLabel}>Working Hours</Text>
                  <Text style={styles.infoValue}>Monday - Friday: 9 AM - 6 PM</Text>
                  <Text style={[styles.infoValue, { fontSize: 13, color: "#00A6E8", marginTop: 2 }]}>
                    Saturday: 10 AM - 4 PM
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ContactUsScreen;

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  
  // Hero Section
  heroSection: {
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0f7ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e8f2ff",
  },
  title: {
    fontSize: 32,
    fontWeight: "300",
    color: "#2c3e50",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#00A6E8",
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 300,
    fontWeight: "300",
  },

  // Form Card
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
    shadowColor: "#3d5a73",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f7ff",
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "400",
    color: "#00A6E8",
    marginBottom: 24,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e8f2ff",
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#fafcff",
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: "#3a506b",
    fontWeight: "300",
  },
  messageContainer: {
    borderWidth: 1,
    borderColor: "#e8f2ff",
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: "#fafcff",
    overflow: "hidden",
  },
  messageInput: {
    padding: 16,
    fontSize: 15,
    color: "#00A6E8",
    minHeight: 140,
    textAlignVertical: "top",
    fontWeight: "300",
  },
  submitButton: {
    backgroundColor: "#00A6E8",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#5d7b93",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#a3b8cc",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 0.5,
  },

  // Info Section
  infoSection: {
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: "300",
    color: "#3a506b",
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#3d5a73",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f7ff",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "400",
    color: "#8a9fb2",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "300",
    color: "#3a506b",
    lineHeight: 20,
  },
});