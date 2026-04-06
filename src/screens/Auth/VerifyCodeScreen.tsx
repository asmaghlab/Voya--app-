import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';

type VerifyCodeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'VerifyCode'>;
};

export const VerifyCodeScreen: React.FC<VerifyCodeScreenProps> = ({ navigation }) => {
  const route = useRoute();
  const { email } = route.params as { email: string };
  const [code, setCode] = useState('');

  const handleContinue = () => {
    if (!code) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    navigation.navigate('ResetPassword', { email, code });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Code</Text>
      <Text style={styles.subtitle}>
        Enter the code sent to your email
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter verification code"
        value={code}
        onChangeText={setCode}
        keyboardType="default"
      />

      <TouchableOpacity
        style={styles.continueButton}
        onPress={handleContinue}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Text style={styles.backText}>Resend Code</Text>
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
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    fontSize: 18,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#00A6E8',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
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