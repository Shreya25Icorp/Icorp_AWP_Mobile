import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Vibration, Platform } from "react-native";

const CustomKeyboard = ({ onChange, onBackspace, onSubmit }) => {
  const handleKeyPress = (digit) => {
    // Vibration.vibrate(10);
    onChange(digit); // Handle digit input
  };

  const renderRow = (digits) => (
    <View style={styles.row}>
      {digits.map((digit, index) => (
        <React.Fragment key={digit}>
          <TouchableOpacity style={styles.key} onPress={() => handleKeyPress(digit)}>
            <Text style={styles.keyText}>{digit}</Text>
          </TouchableOpacity>
          {/* Add a pipe separator unless it's the last button */}
          {/* {index < digits.length - 1 && <Text style={styles.separator}>|</Text>} */}
        </React.Fragment>
      ))}
    </View>
  );

  return (
    <View style={styles.keyboardContainer}>
      {renderRow([1, 2, 3])}
      {renderRow([4, 5, 6])}
      {renderRow([7, 8, 9])}
      <View style={styles.row}>
        <TouchableOpacity style={styles.key} onPress={onBackspace}>
          <Text style={styles.keyText}>⌫</Text>
        </TouchableOpacity>
        {/* <Text style={styles.separator}>|</Text> */}
        <TouchableOpacity style={styles.key} onPress={() => handleKeyPress(0)}>
          <Text style={styles.keyText}>0</Text>
        </TouchableOpacity>
        {/* <Text style={styles.separator}>|</Text> */}
        <TouchableOpacity style={styles.key} onPress={onSubmit}>
          <Text style={styles.keyText}>✔</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CustomKeyboard;

const styles = StyleSheet.create({
  keyboardContainer: {
    marginTop: 80,
    width: "100%",
    alignItems: "center", // Center align the keyboard
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    width: '100%'
  },
  key: {
    width: 90,
    height: 60,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Semi-transparent background
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity:  0.1 ,
    shadowRadius: 10,
    marginHorizontal: 10,

    // elevation: 1, // Shadow for Android
  },
  keyText: {
    fontSize: 24,
    color: "#3C4764",
    fontWeight: "bold",
  },
  separator: {
    fontSize: 24,
    color: "#ccc",
    // marginHorizontal: 10, // Space around the pipe
  },
});
