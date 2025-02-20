import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Platform, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { HelperText } from 'react-native-paper';

const CustomTextArea = ({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  isRequired = false,
  error,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
    // console.log(value);
    
  return (
    <View style={styles.inputGroup}>
      <View style={[styles.labelContainer, (isFocused || value) && styles.labelFocused]}>
      <TouchableOpacity onPress={() => inputRef.current?.focus()}>
      <Text
        style={[
          styles.label,
          (isFocused || value) && styles.labelSmall,
          error ? styles.labelError : isFocused && styles.labelFocusedColor,
        ]}
      >
        {label} {isRequired && <Text style={styles.required}>*</Text>}
      </Text>
    </TouchableOpacity>
      </View>
      <TextInput
        ref={inputRef}
        mode="outlined"
        outlineColor={error ? '#C41E3A' : value ? '#2E9E4A' : '#BFBBBB'}
        // activeOutlineColor={error ? '#C41E3A' : '#2E9E4A'}
        style={[
          styles.textAreaDesc,
          {
            borderColor: value ? '#2E9E4A' : '#BFBBBB',
            height: Platform.OS === 'ios' ? 120 : 'auto', // Adjust height for 6 lines on iOS
            textAlignVertical: 'top',
            color: '#000'
          },
          error ? styles.errorBorder : isFocused && styles.focusedBorder,
        ]}
        placeholder={!value ? '' : placeholder} // Only show placeholder if there's no value
        placeholderTextColor="#BFBBBB"
        multiline
        numberOfLines={6}
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          onBlur && onBlur();
          setIsFocused(false);
        }}
        onChangeText={onChangeText}
      />
      {error && (
        <HelperText type="error" visible={error}>
          {label} is required.
        </HelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    position: 'relative',
    marginBottom: 20,
  },
  labelContainer: {
    position: 'absolute',
    top: 18,
    left: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  labelFocused: {
    top: -10,
    left: 8,
  },
  label: {
    fontSize: 16,
    color: '#343434',
  },
  labelSmall: {
    fontSize: 12,
  },
  labelFocusedColor: {
    color: '#C41E3A', // Green when focused
  },
  labelError: {
    color: '#D22B2B', // Red when there is an error
  },
  required: {
    color: 'red',
  },
  textAreaDesc: {
    
    borderWidth: 1,
    padding: 12,
    borderRadius: 5,
    fontSize: 16,
    paddingTop: 20, // To accommodate the label inside the TextInput
    color: '#000', // Set the font color explicitly
    backgroundColor: '#fff',
  },
  focusedBorder: {
    borderColor: '#C41E3A', // Green border when focused
  },
  errorBorder: {
    borderColor: '#D22B2B', // Red border when there's an error
  },
});

export default CustomTextArea;
