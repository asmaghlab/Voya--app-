import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import { Mail, Send } from "lucide-react-native";
import Toast from "react-native-toast-message";
import emailjs from "emailjs-com";

export const NewsletterSection = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (!email) return;

    emailjs
      .send(
        "service_y5m44xi",    // service ID 
        "template_597vzfq",    // template ID
        { user_email: email }, //template parameters
        "Q7rYCbg8yztdmO1xU"      // public key
      )
      .then(() => {
        Toast.show({
          type: "success",
          text1: "Subscribed!",
          text2: "A confirmation email has been sent to you 🎉",
        });

        setEmail("");
      })
      .catch((err) => {
        console.error("EmailJS Error:", err);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Something went wrong while sending email.",
        });
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Mail size={32} color="#0ea5e9" />
      </View>

      <Text style={styles.title}>Don't miss a thing</Text>
      <Text style={styles.subtitle}>
        Get updates on special deals and exclusive offers.{'\n'}
        Sign up to our newsletter!
      </Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <Pressable style={styles.button} onPress={handleSubmit}>
          <Send size={16} color="#fff" />
          <Text style={styles.buttonText}>Subscribe</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  iconContainer: {
    height: 64,
    width: 64,
    borderRadius: 32,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: "#666",
  },
  form: {
    width: "100%",
    maxWidth: 400,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0ea5e9",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
