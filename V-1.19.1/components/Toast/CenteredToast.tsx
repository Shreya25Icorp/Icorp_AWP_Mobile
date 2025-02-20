import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CenteredToastProps {
  message: string;
}

const CenteredToast: React.FC<CenteredToastProps> = ({ message }) => (
  <View style={styles.container}>
    <View style={styles.toast}>
      <Text>{message}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toast: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 5,
  },
});

export default CenteredToast;
