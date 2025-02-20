import React from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Entypo from "react-native-vector-icons/Entypo";
const ImageUploader = ({ imageUris, removeImage, toggleOverlay, label }) => {
  return (
    <View
      // onPress={toggleOverlay}
      style={[
        styles.uploadButton,
        // { height: imageUris.length > 0 ? "auto" : 120 },
      ]}
    >
      {imageUris.length > 0 ? (
        <View style={styles.imageWrapperContainer}>
          <ScrollView
            horizontal={true}
            contentContainerStyle={styles.imageScrollContainer}
            showsHorizontalScrollIndicator={false}
            style={styles.imageScrollView}
          >
            <View style={styles.imageContainer}>
              <>
                {imageUris.map((uri, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri: uri.url }} style={styles.uploadedImage} />
                    <TouchableOpacity
                      style={styles.closeIcon}
                      onPress={() => removeImage(index)}
                    >
                      <Icon name="close-circle" size={22} color="#D01E12" />
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            </View>
          </ScrollView>
          {imageUris.length > 0 && (
            <TouchableOpacity style={styles.addButton} onPress={toggleOverlay}>
              <Icon name="add-circle" size={40} color="#313F63" />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity
          onPress={toggleOverlay}
          style={styles.placeholderContainer}
        >
          <Entypo
            name="upload"
            size={30}
            color="#888"
            style={{ marginBottom: 10 }}
          />
          <Text style={styles.uploadButtonText}>
            {label ? label : "Upload images here"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  uploadButton: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#C5C5C5",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#F9F9F9",
    flexDirection: "row", // Changed to column to stack images and button vertically
    alignItems: "center",
    justifyContent: "center",
    height: "auto", // Adjust based on content
    overflow: "hidden",
  },
  uploadButtonText: {
    color: "#888",
    textAlign: "center",
  },
  uploadedImage: {
    width: 110, // Adjust the width as needed
    height: 110, // Adjust the height as needed
    resizeMode: "cover", // Or 'contain' depending on your need
  },
  imageScrollView: {
    flex: 1,
    flexDirection: "row",
  },
  imageScrollContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageWrapperContainer: {
    flexDirection: "row", // Ensure images and button are in a row
    alignItems: "center",
    width: "100%",
    position: "relative",
    justifyContent: "center", // For positioning the + button
  },
  imageWrapper: {
    marginRight: 10, // Space between images
    position: "relative", // For positioning the close icon on top of the image
  },
  addButton: {
    // position: 'absolute',
    // right: 10, // Adjust positioning
    // bottom: 10, // Position it below the images
    height: 50, // Fixed height to avoid overlap
    justifyContent: "center",
    alignItems: "center",
    width: 45,
  },
  closeIcon: {
    position: "absolute",
    top: -2, // Adjust positioning
    right: -8, // Adjust positioning
    backgroundColor: "#fff", // Optional: to make the icon more visible
    borderRadius: 12, // Optional: round the background
  },
  placeholderContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%", // Set a fixed width or use '100%' if you want it to take up the full width
    // height: 120, // Set a fixed height
    backgroundColor: "#F9F9F9",
    padding: 25,
  },
});
export default ImageUploader;