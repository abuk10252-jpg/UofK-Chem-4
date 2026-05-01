import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

export default function LoadingScreen() {
  return (
    <View style={{
      flex: 1,
      backgroundColor: '#000',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <ActivityIndicator size="large" color="#fff" />
      <Text style={{ color: '#fff', marginTop: 15, fontSize: 16 }}>
        Loading...
      </Text>
    </View>
  );
}
