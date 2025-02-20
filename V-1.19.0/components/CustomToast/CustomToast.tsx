// CustomToast.js
import React, { useEffect } from "react";
import { Animated, Text, View, StyleSheet, Easing } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";

const CustomToast = ({ message, visible, onHide }) => {
  const translateY = new Animated.Value(-100); // Start above the screen

  useEffect(() => {
    if (visible) {
      // Slide in animation
      Animated.timing(translateY, {
        toValue: 0, // Visible position
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        // Auto-hide after 3 seconds
        setTimeout(() => {
          Animated.timing(translateY, {
            toValue: -100, // Slide out
            duration: 300,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }).start(() => {
            if (onHide) onHide(); // Trigger hide callback
          });
        }, 3000);
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toastContainer, { transform: [{ translateY }] }]}>
      <FontAwesome name="check-circle" size={20} color="#fff" style={styles.icon} />
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "#28a745", // Green background
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    marginRight: 10,
  },
  toastText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default CustomToast;
