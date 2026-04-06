import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
  Share,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@react-navigation/native';


// Types
interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  status: 'active' | 'inactive';
  role: 'admin' | 'user' | 'moderator';
  createdAt: string;
  location: string;
  phone: string;
}

interface FormData {
  name: string;
  username: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  role: 'admin' | 'user' | 'moderator';
  location: string;
}

interface FormErrors {
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
}

const { width, height } = Dimensions.get('window');
const ITEMS_PER_PAGE = 8;

const UsersPage: React.FC = () => {
  const { colors, dark } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState<FormData>({ 
    name: '', 
    username: '', 
    email: '', 
    phone: '',
    status: 'active',
    role: 'user',
    location: 'Egypt',
  });
  
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const API = 'https://692b1d9e7615a15ff24ec4d9.mockapi.io/users';

  const fetchUsers = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(API);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      const usersWithDefaults: User[] = data.map((user: any) => ({
        id: user.id || '',
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        status: (user.status === 'active' || user.status === 'inactive') ? user.status : 'active',
        role: (user.role === 'admin' || user.role === 'user' || user.role === 'moderator') ? user.role : 'user',
        createdAt: user.createdAt || new Date().toISOString(),
        location: user.location || 'Egypt',
        phone: user.phone || '+20 123 456 7890',
      }));
      
      setUsers(usersWithDefaults);
      setCurrentPage(1);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error fetching users:', errorMessage);
      Alert.alert('Error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!form.name.trim()) {
      errors.name = 'Name is required';
    } else if (form.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!form.username.trim()) {
      errors.username = 'Username is required';
    } else if (form.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (!form.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Invalid email address';
    }
    
    if (form.phone && !/^[0-9+\-\s()]+$/.test(form.phone)) {
      errors.phone = 'Invalid phone number';
    }
    
    if (!editUser && users.some(user => user.email.toLowerCase() === form.email.toLowerCase())) {
      errors.email = 'Email already exists';
    }
    
    if (!editUser && users.some(user => user.username.toLowerCase() === form.username.toLowerCase())) {
      errors.username = 'Username already taken';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (name: string, value: string): void => {
    const currentFormErrors: FormErrors = { ...formErrors };
    if (name in currentFormErrors) {
      delete currentFormErrors[name as keyof FormErrors];
      setFormErrors(currentFormErrors);
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (): Promise<void> => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          createdAt: new Date().toISOString(),
        })
      });
      
      if (!response.ok) throw new Error('Failed to create user');
      
      closeModal();
      fetchUsers();
      Alert.alert('Success', 'User created successfully!');
    } catch (error: unknown) {
      Alert.alert('Error', 'Failed to create user');
    }
  };

  const handleUpdate = async (): Promise<void> => {
    if (!editUser || !validateForm()) return;

    try {
      const response = await fetch(`${API}/${editUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (!response.ok) throw new Error('Failed to update user');
      
      closeModal();
      fetchUsers();
      Alert.alert('Success', 'User updated successfully!');
    } catch (error: unknown) {
      Alert.alert('Error', 'Failed to update user');
    }
  };

  const handleDelete = (id: string, name: string): void => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${API}/${id}`, { method: 'DELETE' });
              fetchUsers();
              Alert.alert('Success', 'User deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ],
    );
  };

  const toggleUserStatus = async (user: User): Promise<void> => {
    const newStatus: 'active' | 'inactive' = user.status === 'active' ? 'inactive' : 'active';
    
    try {
      await fetch(`${API}/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, status: newStatus })
      });
      
      fetchUsers();
      Alert.alert('Success', `User ${newStatus === 'active' ? 'activated' : 'deactivated'}!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const openEdit = (user: User): void => {
    setEditUser(user);
    setForm({ 
      name: user.name, 
      username: user.username, 
      email: user.email, 
      phone: user.phone || '',
      status: user.status,
      role: user.role,
      location: user.location || 'Egypt',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = (): void => {
    setEditUser(null);
    setForm({ 
      name: '', username: '', email: '', phone: '',
      status: 'active', role: 'user', location: 'Egypt',
    });
    setFormErrors({});
    setModalOpen(false);
  };

  const getInitials = (name: string): string => {
    if (!name.trim()) return '?';
    return name.split(' ').map(w => w.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name: string): string => {
    const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F97316', '#EF4444'];
    return colors[name ? name.charCodeAt(0) % colors.length : 0];
  };

  const filteredUsers: User[] = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const activeUsers = users.filter(u => u.status === 'active').length;
  const adminUsers = users.filter(u => u.role === 'admin').length;

  const renderUserCard = ({ item }: { item: User }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.cardHeader}>
        <View style={styles.userMainInfo}>
          <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.name) }]}>
            <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
          </View>
          
          <View style={styles.userDetails}>
            <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.userSubtext, { color: colors.text }]} numberOfLines={1}>
              @{item.username}
            </Text>
            <Text style={[styles.userEmail, { color: colors.text }]} numberOfLines={1}>
              {item.email}
            </Text>
          </View>
        </View>

        <View style={styles.badges}>
          <View style={[
            styles.badge,
            { backgroundColor: item.status === 'active' ? '#DEF7EC' : '#FDE8E8' }
          ]}>
            <Text style={[
              styles.badgeText,
              { color: item.status === 'active' ? '#03543F' : '#9B1C1C' }
            ]}>
              {item.status}
            </Text>
          </View>
          
          <View style={[styles.badge, styles.roleBadge]}>
            <Text style={styles.roleBadgeText}>{item.role}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardInfo}>
        <View style={styles.infoRow}>
          <Icon name="map-marker" size={16} color="#6B7280" />
          <Text style={styles.infoText}>{item.location || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="phone" size={16} color="#6B7280" />
          <Text style={styles.infoText}>{item.phone || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => openEdit(item)}
        >
          <Icon name="pencil" size={18} color="#2563EB" />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.statusBtn]}
          onPress={() => toggleUserStatus(item)}
        >
          <Icon 
            name={item.status === 'active' ? 'pause-circle' : 'play-circle'} 
            size={18} 
            color="#059669" 
          />
          <Text style={styles.statusBtnText}>
            {item.status === 'active' ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => handleDelete(item.id, item.name)}
        >
          <Icon name="delete" size={18} color="#DC2626" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <View style={styles.pagination}>
        <TouchableOpacity
          style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
          onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          <Icon name="chevron-left" size={20} color={currentPage === 1 ? '#9CA3AF' : '#374151'} />
        </TouchableOpacity>

        <View style={styles.pageNumbers}>
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <TouchableOpacity
                key={pageNum}
                style={[
                  styles.pageNumBtn,
                  currentPage === pageNum && styles.pageNumBtnActive
                ]}
                onPress={() => setCurrentPage(pageNum)}
              >
                <Text style={[
                  styles.pageNumText,
                  currentPage === pageNum && styles.pageNumTextActive
                ]}>
                  {pageNum}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
          onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          <Icon name="chevron-right" size={20} color={currentPage === totalPages ? '#9CA3AF' : '#374151'} />
        </TouchableOpacity>

        <Text style={styles.pageInfo}>
          Page {currentPage} of {totalPages}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex:1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>

        <TouchableOpacity style={styles.addButton} onPress={() => setModalOpen(true)}>
          <Icon name="plus" size={22} color="#FFFFFF " />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Icon name="account-multiple" size={28} color="#3B82F6" />
          <Text style={[styles.statValue, { color: colors.text }]}>{users.length}</Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Total Users</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Icon name="check-circle" size={28} color="#10B981" />
          <Text style={[styles.statValue, { color: colors.text }]}>{activeUsers}</Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Active</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Icon name="shield-account" size={28} color="#8B5CF6" />
          <Text style={[styles.statValue, { color: colors.text }]}>{adminUsers}</Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Admins</Text>
        </View>
      </View>

      {/* Search & Filters */}
      <View style={styles.controls}>
        <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
          <Icon name="magnify" size={20} color="#9CA3AF" />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search users..."
            placeholderTextColor="#9CA3AF"
            value={searchTerm}
            onChangeText={(text) => {
              setSearchTerm(text);
              setCurrentPage(1);
            }}
          />
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filters}
        >
          <TouchableOpacity
            style={[
              styles.filterBtn,
              selectedStatus === 'all' && styles.filterBtnActive
            ]}
            onPress={() => { setSelectedStatus('all'); setCurrentPage(1); }}
          >
            <Text style={[
              styles.filterBtnText,
              selectedStatus === 'all' && styles.filterBtnTextActive
            ]}>All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterBtn,
              selectedStatus === 'active' && styles.filterBtnActive
            ]}
            onPress={() => { setSelectedStatus('active'); setCurrentPage(1); }}
          >
            <Text style={[
              styles.filterBtnText,
              selectedStatus === 'active' && styles.filterBtnTextActive
            ]}>Active</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterBtn,
              selectedStatus === 'inactive' && styles.filterBtnActive
            ]}
            onPress={() => { setSelectedStatus('inactive'); setCurrentPage(1); }}
          >
            <Text style={[
              styles.filterBtnText,
              selectedStatus === 'inactive' && styles.filterBtnTextActive
            ]}>Inactive</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {['all', 'admin', 'moderator', 'user'].map(role => (
            <TouchableOpacity
              key={role}
              style={[
                styles.filterBtn,
                selectedRole === role && styles.filterBtnActive
              ]}
              onPress={() => { setSelectedRole(role); setCurrentPage(1); }}
            >
              <Text style={[
                styles.filterBtnText,
                selectedRole === role && styles.filterBtnTextActive
              ]}>{role === 'all' ? 'All Roles' : role}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Users List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
        </View>
      ) : paginatedUsers.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="account-off" size={64} color="#9CA3AF" />
          <Text style={styles.emptyText}>No users found</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => setModalOpen(true)}>
            <Text style={styles.emptyBtnText}>Add First User</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={paginatedUsers}
          renderItem={renderUserCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderPagination}
          
        />
      )}

      {/* Modal */}
      <Modal
        visible={modalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editUser ? 'Edit User' : 'Add New User'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Full Name *</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      borderColor: formErrors.name ? '#EF4444' : '#E5E7EB',
                      backgroundColor: colors.background,
                      color: colors.text
                    }
                  ]}
                  placeholder="John Doe"
                  placeholderTextColor="#9CA3AF"
                  value={form.name}
                  onChangeText={(v) => handleChange('name', v)}
                />
                {formErrors.name && <Text style={styles.error}>{formErrors.name}</Text>}
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Username *</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      borderColor: formErrors.username ? '#EF4444' : '#E5E7EB',
                      backgroundColor: colors.background,
                      color: colors.text
                    }
                  ]}
                  placeholder="johndoe"
                  placeholderTextColor="#9CA3AF"
                  value={form.username}
                  onChangeText={(v) => handleChange('username', v)}
                  autoCapitalize="none"
                />
                {formErrors.username && <Text style={styles.error}>{formErrors.username}</Text>}
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Email *</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      borderColor: formErrors.email ? '#EF4444' : '#E5E7EB',
                      backgroundColor: colors.background,
                      color: colors.text
                    }
                  ]}
                  placeholder="john@example.com"
                  placeholderTextColor="#9CA3AF"
                  value={form.email}
                  onChangeText={(v) => handleChange('email', v)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {formErrors.email && <Text style={styles.error}>{formErrors.email}</Text>}
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Phone</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      borderColor: formErrors.phone ? '#EF4444' : '#E5E7EB',
                      backgroundColor: colors.background,
                      color: colors.text
                    }
                  ]}
                  placeholder="+20 123 456 7890"
                  placeholderTextColor="#9CA3AF"
                  value={form.phone}
                  onChangeText={(v) => handleChange('phone', v)}
                  keyboardType="phone-pad"
                />
                {formErrors.phone && <Text style={styles.error}>{formErrors.phone}</Text>}
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.label, { color: colors.text }]}>Status</Text>
                  <View style={[styles.pickerWrapper, { backgroundColor: colors.background }]}>
                    <Picker
                      selectedValue={form.status}
                      onValueChange={(v) => handleChange('status', v)}
                      style={{ color: colors.text }}
                    >
                      <Picker.Item label="Active" value="active" />
                      <Picker.Item label="Inactive" value="inactive" />
                    </Picker>
                  </View>
                </View>

                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.label, { color: colors.text }]}>Role</Text>
                  <View style={[styles.pickerWrapper, { backgroundColor: colors.background }]}>
                    <Picker
                      selectedValue={form.role}
                      onValueChange={(v) => handleChange('role', v)}
                      style={{ color: colors.text }}
                    >
                      <Picker.Item label="User" value="user" />
                      <Picker.Item label="Moderator" value="moderator" />
                      <Picker.Item label="Admin" value="admin" />
                    </Picker>
                  </View>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Location</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      borderColor: '#E5E7EB',
                      backgroundColor: colors.background,
                      color: colors.text
                    }
                  ]}
                  placeholder="Egypt"
                  placeholderTextColor="#9CA3AF"
                  value={form.location}
                  onChangeText={(v) => handleChange('location', v)}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={closeModal}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={editUser ? handleUpdate : handleCreate}
              >
                <Text style={styles.saveBtnText}>
                  {editUser ? 'Update' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  saveArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#00A6E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    marginTop: 4,
    opacity: 0.7,
  },
  controls: {
    paddingHorizontal: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  filters: {
    marginBottom: 16,
  },
  filterBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterBtnActive: {
    backgroundColor: '#00A6E8',
  },
  filterBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterBtnTextActive: {
    color: '#FFFFFF',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardHeader: {
    marginBottom: 12,
  },
  userMainInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userSubtext: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.8,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  roleBadge: {
    backgroundColor: '#EDE9FE',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00A6E8',
    textTransform: 'capitalize',
  },
  cardInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  editBtn: {
    backgroundColor: '#EFF6FF',
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00A6E8',
  },
  statusBtn: {
    backgroundColor: '#ECFDF5',
  },
  statusBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
    flex: 0.3,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  pageBtn: {
    padding: 8,
    borderRadius: 8,
  },
  pageBtnDisabled: {
    opacity: 0.3,
  },
  pageNumbers: {
    flexDirection: 'row',
    gap: 4,
  },
  pageNumBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  pageNumBtnActive: {
    backgroundColor: '#00A6E8',
  },
  pageNumText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  pageNumTextActive: {
    color: '#FFFFFF',
  },
  pageInfo: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 20,
  },
  emptyBtn: {
    backgroundColor: '#00A6E8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
  },
  formRow: {
    flexDirection: 'row',
  },
  error: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 6,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F3F4F6',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveBtn: {
    backgroundColor: '#00A6E8',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default UsersPage;