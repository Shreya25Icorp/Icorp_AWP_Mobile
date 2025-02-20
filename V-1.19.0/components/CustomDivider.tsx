import React from 'react';
import { View, StyleSheet } from 'react-native';

const Divider = () => (
  <View style={styles.divider} />
);

const styles = StyleSheet.create({
  divider: {
    // marginVertical: 10, 
    height: 1, // Thickness of the divider
    backgroundColor: '#D3D3D3', // Color of the divider
    // marginVertical: 10, // Space above and below the divider
    width: '100%', // Full width of the parent container
  },
});

export default Divider;