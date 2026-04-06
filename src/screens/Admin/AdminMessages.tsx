import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import axios from "axios";
import emailjs from "@emailjs/react-native";

const API_URL =
  "https://693e2dd4f55f1be793048237.mockapi.io/contactus/messages";

const PAGE_SIZE = 4;

interface Message {
  id: string;
  email: string;
  name: string;
  subject: string;
  message: string;
  reply?: string;
  createdAt: string;
}

type FilterType = "all" | "replied" | "pending";

const AdminMessagesScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [expandedMessages, setExpandedMessages] = useState<{ [id: string]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const res = await axios.get(API_URL);
      setMessages(res.data);
      setCurrentPage(1);
    } catch {
      Toast.show({
        type: "error",
        text1: "Failed to fetch messages",
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  /* ================= REPLY ================= */
  const handleReply = async () => {
    if (!selectedMessage) return;

    if (!selectedMessage.reply?.trim()) {
      Toast.show({ type: "error", text1: "Reply is empty" });
      return;
    }

    setSendingReply(true);

    try {
      await axios.put(`${API_URL}/${selectedMessage.id}`, {
        ...selectedMessage,
      });

      await emailjs.send(
        "service_xk2p9q1",
        "template_2gmqpki",
        {
          to_email: selectedMessage.email,
          user_name: selectedMessage.name,
          message: selectedMessage.message,
          reply: selectedMessage.reply,
        },
        { publicKey: "3APPgNXmg7rTOjXAa" }
      );

      Toast.show({
        type: "success",
        text1: "Reply sent",
      });

      fetchMessages();
      setSelectedMessage(null);
    } catch {
      Toast.show({
        type: "error",
        text1: "Failed to send email",
      });
    } finally {
      setSendingReply(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Delete Message",
      `Are you sure you want to delete message from ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            axios.delete(`${API_URL}/${id}`).then(() => {
              setMessages(prev => prev.filter(m => m.id !== id));
              Toast.show({ type: "success", text1: "Message deleted" });
            });
          },
        },
      ]
    );
  };

  /* ================= PAGINATION ================= */
  const filteredMessages = messages.filter(msg => {
    if (filter === "replied") return msg.reply;
    if (filter === "pending") return !msg.reply;
    return true;
  });

  const totalPages = Math.ceil(filteredMessages.length / PAGE_SIZE);

  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const renderMessageCard = (msg: Message) => {
    const isExpanded = expandedMessages[msg.id];
    const shouldShowMore = msg.message.split(" ").length > 20;

    return (
      <View key={msg.id} style={styles.messageCard}>
        <View style={styles.messageHeader}>
          <View style={styles.userAvatar}>
            <Text style={styles.avatarText}>{msg.name[0].toUpperCase()}</Text>
          </View>

          <View style={styles.messageHeaderInfo}>
            <Text style={styles.messageName} numberOfLines={1}>
              {msg.name}
            </Text>
            <Text style={styles.messageEmail} numberOfLines={1}>
              {msg.email}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              msg.reply ? styles.statusReplied : styles.statusPending,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                msg.reply ? styles.statusTextReplied : styles.statusTextPending,
              ]}
            >
              {msg.reply ? "Replied" : "Pending"}
            </Text>
          </View>
        </View>

        <View style={styles.messageContent}>
          <Text style={styles.messageDate}>
            {new Date(msg.createdAt).toLocaleDateString()}
          </Text>

          <Text style={styles.messageSubject}>{msg.subject}</Text>

          <Text style={styles.messageText} numberOfLines={isExpanded ? undefined : 2}>
            {msg.message}
          </Text>

          {shouldShowMore && (
            <TouchableOpacity
              onPress={() =>
                setExpandedMessages(prev => ({
                  ...prev,
                  [msg.id]: !prev[msg.id],
                }))
              }
            >
              <Text style={styles.showMoreText}>
                {isExpanded ? "Show less" : "Show more"}
              </Text>
            </TouchableOpacity>
          )}

          {msg.reply && (
            <View style={styles.replyContainer}>
              <Text style={styles.replyLabel}>Reply</Text>
              <Text style={styles.replyText}>{msg.reply}</Text>
            </View>
          )}
        </View>

        <View style={styles.messageFooter}>
          <TouchableOpacity
            style={[styles.actionButton, styles.replyButton]}
            onPress={() => setSelectedMessage(msg)}
          >
            <Text style={styles.replyButtonText}>
              {msg.reply ? "Edit" : "Reply"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(msg.id, msg.name)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.messagesContent}
        refreshControl={
          <RefreshControl refreshing={loadingMessages} onRefresh={fetchMessages} />
        }
      >
        {paginatedMessages.map(renderMessageCard)}

        {totalPages > 1 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              disabled={currentPage === 1}
              onPress={() => setCurrentPage(p => p - 1)}
              style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
            >
              <Text>Prev</Text>
            </TouchableOpacity>

            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              return (
                <TouchableOpacity
                  key={page}
                  onPress={() => setCurrentPage(page)}
                  style={[
                    styles.pageButton,
                    currentPage === page && styles.pageButtonActive,
                  ]}
                >
                  <Text
                    style={currentPage === page ? styles.pageNumberActive : undefined}
                  >
                    {page}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              disabled={currentPage === totalPages}
              onPress={() => setCurrentPage(p => p + 1)}
              style={[
                styles.pageButton,
                currentPage === totalPages && styles.pageButtonDisabled,
              ]}
            >
              <Text>Next</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal visible={!!selectedMessage} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedMessage?.name}</Text>
              <TouchableOpacity onPress={() => setSelectedMessage(null)}>
                <Text>X</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.replyInputContainer}>
              <TextInput
                style={styles.replyInput}
                multiline
                value={selectedMessage?.reply || ""}
                onChangeText={text =>
                  setSelectedMessage(
                    selectedMessage ? { ...selectedMessage, reply: text } : null
                  )
                }
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.sendButton} onPress={handleReply}>
                {sendingReply ? <ActivityIndicator color="#fff" /> : <Text>Send</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AdminMessagesScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8fafc" },
  messagesContent: { padding: 20, gap: 16 },

  messageCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },

  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9fafb",
    gap: 10,
  },

  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: { color: "#0ea5e9", fontWeight: "600" },
  messageHeaderInfo: { flex: 1 },
  messageName: { fontWeight: "600", fontSize: 14 },
  messageEmail: { fontSize: 12, color: "#6b7280" },

  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusReplied: { backgroundColor: "#dcfce7" },
  statusPending: { backgroundColor: "#fee2e2" },
  statusText: { fontSize: 11, fontWeight: "600" },
  statusTextReplied: { color: "#15803d" },
  statusTextPending: { color: "#dc2626" },

  messageContent: { padding: 12 },
  messageDate: { fontSize: 11, color: "#9ca3af" },
  messageSubject: { fontSize: 14, fontWeight: "600", marginVertical: 6 },
  messageText: { fontSize: 13, color: "#4b5563", lineHeight: 20 },

  showMoreText: { color: "#0ea5e9", fontSize: 12, marginTop: 6 },

  replyContainer: {
    backgroundColor: "#dbeafe",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },

  replyLabel: { fontSize: 11, fontWeight: "600", color: "#1e40af" },
  replyText: { fontSize: 12 },

  messageFooter: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },

  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteButtonText: {
  color: "#dc2626",
  fontWeight: "600",
},
replyButtonText: {
  color: "#1e40af",
  fontWeight: "600",
},


  replyButton: { backgroundColor: "#dbeafe" },
  deleteButton: { backgroundColor: "#fee2e2" },

  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
  },

  pageButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
  },

  pageButtonActive: { backgroundColor: "#0ea5e9" },
  pageButtonDisabled: { opacity: 0.4 },
  pageNumberActive: { color: "#fff", fontWeight: "700" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  modalHeader: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  modalTitle: { fontSize: 18, fontWeight: "700" },
  replyInputContainer: { padding: 20 },

  replyInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
  },

  modalFooter: { padding: 20 },

  sendButton: {
    backgroundColor: "#0ea5e9",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
});
