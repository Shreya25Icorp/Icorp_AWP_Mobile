import React, {useState, useCallback, useRef, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Pressable,
} from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CustomBottomSheet = ({
  label,
  items,
  searchText,
  onValueChange,
  isRequired,
  selectedValue,
  handleReset,
  searchQuery = '',
  onSearchQueryChange,
  labelBottomsheet,
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
  labelBottomsheet: string;
}) => {
  const [pressedItem, setPressedItem] = useState(null);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['80%', '90%'], []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleDismissModalPress = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
    setPressedItem(null);
    onSearchQueryChange('');
  }, [onSearchQueryChange]);

  const handleSelectItem = (value: any) => {
    onValueChange(value);
    handleDismissModalPress();
  };

  const handlePressItem = (value: any) => {
    setPressedItem(value);
  };

  const filteredItems = items.filter(item => {
    const label = item.label || ''; // Default to an empty string if item.label is undefined
    return label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedLabel =
    items.find((item: any) => item.value === selectedValue)?.label || label;

  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop {...props} opacity={0.7} disappearsOnIndex={-1} />
    ),
    [],
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.pickerTrigger,
          { borderColor: selectedValue !== '' ? '#2E9E4A' : '#BFBBBB' }, // Conditionally set border color
        ]}
        onPress={handlePresentModalPress}>
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

      {/* Bottom Sheet for Custom Picker Items */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        onDismiss={handleDismissModalPress}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            {/* Close Icon */}
            <Pressable
              onPress={handleDismissModalPress}
              style={styles.closeIcon}>
              <Ionicons name="close" size={28} color="grey" />
            </Pressable>

            {/* Label */}
            <Text style={styles.modalLabel}>{labelBottomsheet}</Text>

            {/* Search Input */}
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder={searchText}
            placeholderTextColor={'#ccc'}
            value={searchQuery}
            onChangeText={text => onSearchQueryChange(text)}
          />
          {filteredItems.length === 0 ? (
            <Text style={styles.noResults}>No options available!</Text>
          ) : (
            <BottomSheetFlatList
              nestedScrollEnabled={true}
              data={filteredItems}
              keyExtractor={item => item.value}
              showsVerticalScrollIndicator={true}
              renderItem={({item}) => (
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
              contentContainerStyle={styles.flatList}
            />
          )}
        </View>
      </BottomSheetModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 10,
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFBBBB',
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
  closeIcon: {
    position: 'absolute',
    right: 5,
    bottom: 7,
    zIndex: 1, // Make sure it's on top of other content
  },
  modalContent: {
    flex: 1, // Ensures modal content is scrollable
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B4560',
    marginBottom: 10, // Space between label and input
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    fontSize: 16,
    color: '#000',
    // flex: 1,
  },
  flatList: {
    flexGrow: 1, // Enables scrolling for the FlatList
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
    backgroundColor: '#e0e0e0',
  },
  pressedItem: {
    backgroundColor: '#d0d0d0',
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

export default CustomBottomSheet;
