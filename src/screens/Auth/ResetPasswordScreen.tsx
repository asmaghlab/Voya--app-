// ResetPasswordScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import bcrypt from 'bcryptjs';
import { resetPassword, clearResetData } from '../../features/auth/authSlice';
import { AppDispatch, RootState } from '../../routes/store';
import { RootStackParamList } from '../../navigation/types';

type ResetPasswordScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;
  route: RouteProp<RootStackParamList, 'ResetPassword'>;
};

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ navigation, route }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const { code } = route.params;

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      // تشفير الباسورد
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(newPassword, salt);

      // تغيير الباسورد في الـ mock API
      const updatedUser = await dispatch(resetPassword({ code, newPassword: hashedPassword })).unwrap();

      // خزن الـ user مباشرة في state بدل login
      dispatch({
        type: 'auth/loginUser/fulfilled',
        payload: { user: updatedUser, token: 'fake-jwt-token' },
      });

      dispatch(clearResetData());

      // الانتقال للهوم
      navigation.replace('Home');({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (err) {
      Alert.alert('Error', error || 'Failed to reset password');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Enter your new password</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showNewPassword}
        />
        <TouchableOpacity style={styles.showButton} onPress={() => setShowNewPassword(!showNewPassword)}>
          <Text>{showNewPassword ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity style={styles.showButton} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Text>{showConfirmPassword ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.resetButtonText}>Reset Password</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8, color: '#00A6E8' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 32 },
  inputContainer: { position: 'relative', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, paddingRight: 60 },
  showButton: { position: 'absolute', right: 10, top: 12 },
  resetButton: { backgroundColor: '#00A6E8', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  resetButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default ResetPasswordScreen;
