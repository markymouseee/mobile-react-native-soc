import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, TextInput, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await fetch('http://192.168.83.99:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          usernameoremail: email,
          password: password,
        }),
      });
  
      const response = await res.json();
  
      if (res.ok) {
        const token = response.token;
        const user = response.user;
  
        if (typeof token !== 'string' || !user) {
          Alert.alert('Error', response.message);
          return;
        }
  
        await login(token, user);
        router.replace('/');
      } else {
        Alert.alert('Error', response.message || 'Login failed. Try again.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      Alert.alert('Login Failed', err.message || 'An unexpected error occurred.');
    }
  };
  

  return (
    <View style={styles.container}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 12, borderRadius: 6, borderColor: '#ccc' },
});
