import moment from 'moment';
import React, { useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const UserDetailsScreen = ({ route }) => {
  const { contact } = route.params;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);


  // Function to handle opening of image in modal
  const openImageInModal = (image: any) => {
    setSelectedImage(image);
    setIsModalVisible(true);
  };

  const renderMember = ({ item }) => (
    <View style={styles.memberContainer}>
      <TouchableOpacity onPress={() => openImageInModal(item.image)}>
        <Image source={{ uri: item.image }} style={styles.memberImage} />
      </TouchableOpacity>
      <View>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberStatus}>{item.jobTitle}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => openImageInModal(contact.image)}>
        <Image
          source={{ uri: contact.image }}
          style={styles.contactImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
      <Text style={styles.contactName}>{contact.name}</Text>
      <Text style={styles.contactJobTitle}>{contact.jobTitle}</Text>

      <View style={styles.contactInfoContainer}>
        {/* Contact Information Title */}
        <Text style={styles.contactInfo}>Contact Information</Text>

        {/* Email with Icon */}
        <View style={styles.contactInfoRow}>
          <Icon name="envelope" size={20} color="#84818C" style={styles.icon} />
          <Text style={styles.contactInfoDesc}>{contact.email}</Text>
        </View>

        {/* Mobile with Icon */}
        <View style={styles.contactInfoRow}>
          <Icon name="phone" size={20} color="#84818C" style={styles.icon} />
          <Text style={styles.contactInfoDesc}>{contact.mobile}</Text>
        </View>

        {/* Region with Icon */}
        <View style={styles.contactInfoRow}>
          <Icon name="globe" size={20} color="#84818C" style={styles.icon} />
          <Text style={styles.contactInfoDesc}>{contact.region}</Text>
        </View>
      </View>
      <View style={styles.divider} />



      <FlatList
        data={contact.members}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
      />

      {/* Modal to display enlarged image */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  contactImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
  },
  contactName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: '#000',
  },
  contactJobTitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  memberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#d3d3d3',
  },
  memberImage: {
    width: 30,
    height: 30,
    borderRadius: 25,
    marginRight: 10,
  },
  memberName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  memberStatus: {
    fontSize: 12,
    color: '#555',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
  },
  modalImage: {
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactInfoContainer: {
    padding: 10,
  },
  contactInfo: {
    fontSize: 24,
    textAlign: 'start',
    marginVertical: 8,
    color: '#BAB9BF',
    marginBottom: 24,
  },
  contactInfoDesc: {
    fontSize: 16,
    color: '#84818C',
    marginLeft: 10,
  },
  contactInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
  },
});

export default UserDetailsScreen;
