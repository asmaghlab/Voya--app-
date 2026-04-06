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
import { sendResetCode } from '../../features/auth/authSlice';
import { AppDispatch, RootState } from '../../routes/store';
import { RootStackParamList } from '../../navigation/types';

type ForgotPasswordScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;
};

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    try {
      const result = await dispatch(sendResetCode({ email })).unwrap();
      Alert.alert(
        'Hello :', 
        `Your reset code is: ${result.code}`,
        [{ text: 'Continue', onPress: () => navigation.navigate('VerifyCode', { email }) }]
      );
    } catch (err) {
      Alert.alert('Error', error || 'Failed to send reset code');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>
        Enter your email address and we'll send you a code to reset your password
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={styles.sendButton}
        onPress={handleSendCode}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.sendButtonText}>Send Reset Code</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Text style={styles.backText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#00A6E8',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#00A6E8',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  backText: {
    color: '#00A6E8',
    fontSize: 16,
  },
});