import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, SafeAreaView } from 'react-native';

const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api/message' : 'http://localhost:3000/api/message';

function App() {
  const [message, setMessage] = useState('Yükleniyor...');

  useEffect(() => {
    const loadData = () => {
      fetch(API_URL)
        .then((res) => res.json())
        .then((data) => setMessage(data.message))
        .catch((err) => setMessage('Hata: ' + err.message));
    };

    loadData();
    const intervalId = setInterval(loadData, 2000); // 2 saniyede bir güncelle
    return () => clearInterval(intervalId);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>{message}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
});

export default App;
