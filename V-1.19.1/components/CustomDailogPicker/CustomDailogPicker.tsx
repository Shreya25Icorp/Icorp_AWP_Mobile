// CustomDialogPicker.js
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Pressable,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import RNPickerSelect from 'react-native-picker-select';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CustomDialogPicker = ({
  label,
  items,
  searchText,
  onValueChange,
  isRequired,
  selectedValue,
  handleReset,
  searchQuery = '',
  onSearchQueryChange,
}: {
  label: any[];
  items: any[];
  searchText: string;
  onValueChange: (value: any) => void;
  isRequired: boolean;
  selectedValue: string;
  handleReset: () => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  // const [selectedValue, setSelectedValue] = useState('');
  const [pressedItem, setPressedItem] = useState(null);
  // const [searchQuery, setSearchQuery] = useState('');

  const handleSelectItem = (value: any) => {
    // setSelectedValue(value);
    onValueChange(value);
    handleCloseModal();
  };
  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setPressedItem(null);
    onSearchQueryChange('');
    // setSearchQuery('');
  };

  const handlePressItem = (value: any) => {
    setPressedItem(value);
  };

  // const handleReset = () => {
  //   setSelectedValue('');
  //   onValueChange('');
  //   setModalVisible(false);
  // };

  const filteredItems = items.filter((item) => {
    const label = item.label || ''; // Default to an empty string if item.label is undefined
    return label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedLabel =
    items.find((item: any) => item.value === selectedValue)?.label || label;

  return (
    <View style={styles.container}>
      {/* <Text style={styles.label}>{label} {isRequired && (<Text style={{ color: 'red'}}>*</Text>)} </Text> */}
      <TouchableOpacity style={styles.pickerTrigger} onPress={handleOpenModal}>
        <Text style={styles.pickerTriggerText}>{selectedLabel}</Text>
        {selectedValue !== '' && (
          <TouchableOpacity onPress={handleReset} style={styles.closeButton}>
            <Ionicons name="close" size={22} color="grey" />
          </TouchableOpacity>
        )}

        <AntDesign
          name="caretdown"
          size={12}
          color="#000"
          style={styles.icon}
        />
      </TouchableOpacity>

      {/* Modal for Custom Picker Items */}
      <Modal
  visible={modalVisible}
  transparent={true}
  animationType="fade"
  onRequestClose={handleCloseModal}>
  <TouchableOpacity
    style={styles.modalContainer}
    activeOpacity={1}
    onPress={handleCloseModal} // Close modal when clicking outside
  >
    <View style={styles.modalContentContainer}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.modalContent} // This will prevent the modal from closing when clicking inside the modal content
      >
        <View style={styles.modalHeader}>
          <TextInput
            style={styles.searchInput}
            placeholder={searchText}
            placeholderTextColor={'#ccc'}
            cursorColor={'#3B4560'}
            value={searchQuery} // Controlled value
            onChangeText={(text) => onSearchQueryChange(text)} 
          />
          <TouchableOpacity
            style={styles.closeIconContainer}
            onPress={handleCloseModal}>
            <AntDesign
              name="closecircle"
              size={26}
              color="#D01E12"
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
        {filteredItems.length === 0 ? (
          <Text style={styles.noResults}>No options available!</Text>
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.value}
            showsVerticalScrollIndicator={true}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.item,
                  item.value === selectedValue && styles.selectedItem,
                  item.value === pressedItem && styles.pressedItem,
                ]}
                onPress={() => handleSelectItem(item.value)}
                onPressIn={() => handlePressItem(item.value)}
                onPressOut={() => setPressedItem(null)}>
                <Text style={styles.itemText}>{item.label}</Text>
              </Pressable>
            )}
          />
        )}
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
</Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // padding: 20,
    // backgroundColor: '#f9f9f9',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 10,
  },
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#252724',
    flexDirection: 'row',
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  pickerTriggerText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  icon: {
    // fontSize: 20,
    // color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: 400, // Set fixed height for the modal content
    position: 'relative',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeIconContainer: {
    position: 'absolute',
    top: -28, // Adjust based on the icon size
    right: -28, // Adjust based on the icon size
    zIndex: 1,
    backgroundColor: '#fff', // Optional: to make the icon more visible
    borderRadius: 12,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedItem: {
    backgroundColor: '#e0e0e0', // Background color for selected item
  },
  searchInput: {
    fontSize: 16,
    color: '#000',
  },
  pressedItem: {
    backgroundColor: '#d0d0d0', // Background color when item is pressed
  },
  noResults: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  closeButton: {
    paddingRight: 10,
  },
});

export default CustomDialogPicker;
