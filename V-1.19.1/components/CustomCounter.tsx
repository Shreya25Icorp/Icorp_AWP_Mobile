import React from 'react';
import {Image, Platform, TouchableOpacity} from 'react-native';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LabelWithIconText = ({text, next, imgSource, style}) => {
  return (
    <TouchableOpacity style={[styles.container, style]}  onPress={next}>
      {/* Icon */}
      <Image
        source={imgSource}
        resizeMode="contain"
        style={styles.icon}
        // style={globalStyles.profileImage}
      />

      {/* Text inside the icon */}
      <View style={styles.textContainer}>
        <Text style={styles.labelText}>+{text}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center', // Center icon and text
    alignItems: 'center',
    // right: 5
  },
  icon: {
    position: 'relative',
    height: 40,
    width: 40,
    // bottom: Platform.OS == 'ios' ? 2 : 0 
    // Necessary for absolute positioning of text
  },
  textContainer: {
    position: 'absolute', // Overlay the text on top of the icon
    // top: '35%', // Adjust based on where you want the text inside the icon
    // left: '35%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  labelText: {
    fontSize: 13,
    color: '#fff', // Text color inside the icon
    fontWeight: 'bold',
    // bottom: Platform.OS == 'ios' ? 2 : 0 
  },
});

export default LabelWithIconText;
