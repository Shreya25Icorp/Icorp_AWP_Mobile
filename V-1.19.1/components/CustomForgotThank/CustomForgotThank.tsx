import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";

const ThankYouModal = ({ isVisible, onClose }) => (
  <Modal
    transparent={true}
    animationType="fade"
    visible={isVisible}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <Image
          source={require("../../assets/images/check.png")}
          resizeMode="contain"
          style={styles.icon}
          // style={globalStyles.profileImage}
        />
        {/* <Text style={styles.modalTitle}>Thank You for Requesting a PIN</Text> */}
        <Text style={styles.modalMessage}>
          Thank You for Requesting a PIN. Our team will get back to you shortly.
        </Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
    color: '#708090'
  },
  closeButton: {
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: '#313F63',
  },
  buttonText: {
    color: "white",
    fontSize: 15,
  },
});

export default ThankYouModal;
