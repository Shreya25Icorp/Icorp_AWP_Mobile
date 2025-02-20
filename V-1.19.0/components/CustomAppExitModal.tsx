import React from 'react';
import { View, Text, Button, StyleSheet, Modal } from 'react-native';

const ExitAppDialog = ({ visible, onConfirm, onCancel }) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        <View style={styles.dialogBox}>
          <Text style={styles.dialogText}>Are you sure you want to exit the app?</Text>
          <View style={styles.buttonContainer}>
            <Button title="Cancel" onPress={onCancel} />
            <Button title="Exit" onPress={onConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dialogBox: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  dialogText: {
    fontSize: 18,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default ExitAppDialog;
