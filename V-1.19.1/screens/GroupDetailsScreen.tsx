import moment from 'moment';
import React, { useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';

const GroupDetailsScreen = ({ route }) => {
  const { group } = route.params;
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
      <TouchableOpacity onPress={() => openImageInModal(group.groupImage)}>
        <Image
          source={{ uri: group.groupImage }}
          style={styles.groupImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
      <Text style={styles.groupName}>{group.groupName}</Text>
      <Text style={styles.groupMembers}>
        Employees: {group.members.length}
      </Text>

      <View>
        <Text style={styles.groupInfo}>Group Information</Text>
        <Text style={styles.groupInfoDesc}>
          {/* Format the createdAt field */}
          {moment(group.createdAt).format('DD/MM/YYYY, h:mm A')}
        </Text>
      </View>

      <FlatList
        data={group.members}
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
  groupImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: '#000'
  },
  groupMembers: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
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
  groupInfo: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'start',
    marginVertical: 8,
    color: '#5D5A68',
  },
  groupInfoDesc: {
    fontSize: 14,
    textAlign: 'start',
    marginBottom: 20,
    color: '#7F7C87',
  },
});

export default GroupDetailsScreen;
