import React from 'react';
import { Text, StyleSheet } from 'react-native';

const CustomText = (props: any) => {
  return <Text style={{ ...styles.text, ...props.style }}>{props.children}</Text>;
};

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Sans-Serif', // Or the appropriate font weight/style
  },
});

export default CustomText;