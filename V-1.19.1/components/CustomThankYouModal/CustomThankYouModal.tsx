import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useState} from 'react';
import {IconButton} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ThankYouModal = ({
  isVisible,
  onClose,
  subActivityType,
  reportedAt,
  location,
  activityType,
  activityNo,
  reportType,
}: {
  isVisible: boolean;
  onClose: () => void;
  subActivityType: string;
  reportedAt: string;
  location: string;
  activityType: string;
  activityNo: string;
  reportType: string;
}) => {
  function capitalizeFirstLetter(string: string): string {
    if (!string || typeof string !== 'string') return ''; // Handle empty, undefined, or non-string values

    return string
      .split(' ') // Split the string into words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
      .join(' '); // Join the words back together with a space
  }

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* <IconButton
            icon={() => <MaterialCommunityIcons name="checkbox-multiple-marked-circle-outline" size={60} color="green" />}
            style={styles.icon}
          /> */}
          <Image
            source={require('../../assets/images/check.png')}
            resizeMode="contain"
            style={styles.icon}
            // style={globalStyles.profileImage}
          />
          {/* <Text style={styles.title}>Thank You!</Text> */}
          <Text style={styles.subtitle}>
            Thank you for submitting the report
          </Text>
          <View style={styles.detailsContainer}>
            <Text style={styles.detailText}>
              {reportType === 'Activity'
                ? 'Activity Number'
                : reportType === 'Incident'
                ? 'Incident Number' : reportType === 'EndofShift' ? "Number"
                : 'Maintnance Number'}
              : <Text style={styles.subText}>{activityNo}</Text>
            </Text>
            <Text style={styles.detailText}>
              Report Date & Time:{' '}
              <Text style={styles.subText}>{reportedAt}</Text>
            </Text>
            {reportType === 'EndofShift' ? null : (  <Text style={styles.detailText}>
              Category:{' '}
              <Text style={styles.subText}>
                {capitalizeFirstLetter(activityType)}
              </Text>
            </Text>)}
            {subActivityType && (
              <Text style={styles.detailText}>
                {reportType === 'Activity'
                  ? 'Activity'
                  : reportType === 'Incident'
                  ? 'Incident'
                  : 'Maintenance'}{' '}
                Type:{' '}
                <Text style={styles.subText}>
                  {capitalizeFirstLetter(subActivityType)}
                </Text>
              </Text>
            )}
            {location && (
              <Text style={styles.detailText}>
                Location:{' '}
                <Text style={styles.subText}>
                  {capitalizeFirstLetter(location)}
                </Text>
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    width: 300,
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 10,
    height: 65,
    width: 65,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  subtitle: {
    fontSize: 18,
    color: 'gray',
    marginBottom: 20,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailText: {
    fontSize: 16,
    marginVertical: 4,
    color: '#000',
    fontWeight: 'bold',
  },
  button: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#313F63',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  subText: {
    fontWeight: '400',
  },
});

export default ThankYouModal;
