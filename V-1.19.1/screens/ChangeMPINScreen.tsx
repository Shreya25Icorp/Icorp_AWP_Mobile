/* eslint-disable prettier/prettier */
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Alert,
  Dimensions,
  PixelRatio,
} from "react-native";
import FeatherIcon from "react-native-vector-icons/Feather";
import EncryptedStorage from "react-native-encrypted-storage";
import { colors, globalStyles } from "../styles";
import CustomText from "../components/CustomText";
import { useNavigation } from "@react-navigation/native";
import { SERVER_URL_ROASTERING } from "../Constant";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-simple-toast";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { OtpInput } from "react-native-otp-entry";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { showMessage, FlashMessage } from "react-native-flash-message";
import Carousel from "react-native-snap-carousel";

const { width, height } = Dimensions.get("window");
const scale = width / 375;

const normalize = (size) => {
  const newSize = size * scale;
  return Platform.OS === "ios"
    ? Math.round(PixelRatio.roundToNearestPixel(newSize))
    : Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPinError, setCurrentPinError] = useState("");
  const [newPinError, setNewPinError] = useState("");
  const [confirmPinError, setConfirmPinError] = useState("");

  const [currentPinVisible, setCurrentPinVisible] = useState(false);
  const [newPinVisible, setNewPinVisible] = useState(false);
  const [confirmPinVisible, setConfirmPinVisible] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselEnabled, setCarouselEnabled] = useState(true);

  const otpInputRef1 = useRef(null); // Ref for the first input
  const otpInputRef2 = useRef(null);
  const otpInputRef3 = useRef(null);

  const carouselRef = useRef(null);

  const toggleVisibility = (field) => {
    switch (field) {
      case "current":
        setCurrentPinVisible(!currentPinVisible);
        break;
      case "new":
        setNewPinVisible(!newPinVisible);
        break;
      case "confirm":
        setConfirmPinVisible(!confirmPinVisible);
        break;
      default:
        break;
    }
  };

  // Enable button based on the current field
  useEffect(() => {
    if (currentIndex === 0 && currentPin.length === 4) {
      setIsButtonDisabled(false);
    } else if (currentIndex === 1 && newPin.length === 4) {
      setIsButtonDisabled(false);
    } else if (
      currentIndex === 2 &&
      confirmPin.length === 4 &&
      newPin === confirmPin
    ) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [currentPin, newPin, confirmPin, currentIndex]);

  const handleNext = () => {
    if (currentIndex < pinFields.length - 1) {
      carouselRef.current.snapToNext(); // Move to the next field in the carousel
      setCurrentIndex(currentIndex + 1); // Update the current index
      setIsButtonDisabled(true); // Disable the button for the next field initially
    } else {
      handleChange(); // Handle the final submission when on the last field
    }
  };
  // Disable carousel sliding from user interaction
  const handleCarouselScroll = (index) => {
    if (carouselEnabled) {
      setCurrentIndex(index);
    }
  };

  const handleCurrentPinChange = (value) => {
    if (value.length <= 4) {
      setCurrentPin(value); // Update the current PIN state

      // Ensure that the error message is cleared if the value is being typed
      if (value.length !== 4 && currentPinError) {
        setCurrentPinError(""); // Clear error when user starts typing
      }

      // Optionally, handle validation after a complete PIN is entered
      // if (value.length === 4) {
      //   otpInputRef2.current.focus(); // Move focus to next field after 4 digits
      // }
    }
  };

  const handleNewPinChange = (value) => {
    if (value.length <= 4) {
      setNewPin(value); // Update the new PIN state

      // Ensure that the error message is cleared if the value is being typed
      if (value.length !== 4 && newPinError) {
        setNewPinError(""); // Clear error when user starts typing
      }

      // Optionally, handle validation or focus handling after 4 digits
      // if (value.length === 4) {
      //   otpInputRef3.current.focus(); // Move focus to next field after 4 digits
      // }
    }
  };
  const validateButton = (newPin, confirmPin) => {
    if (newPin.length === 4 && confirmPin.length === 4) {
      if (newPin === confirmPin) {
        setConfirmPinError(""); // Clear error if PINs match
        setIsButtonDisabled(false); // Enable the button
      } else {
        setConfirmPinError("Confirm PIN does not match."); // Show mismatch error
        setIsButtonDisabled(true); // Disable the button
      }
    } else {
      setConfirmPinError(""); // Clear error for partial input
      setIsButtonDisabled(true); // Disable the button for incomplete input
    }
  };

  const handleConfirmPinChange = (value) => {
    if (value.length <= 4) {
      setConfirmPin(value); // Update confirm PIN value
      setConfirmPinError(""); // Reset error for each change
      validateButton(newPin, value); // Validate the PINs
    }
  };

  const handleChange = async () => {
    if (currentIndex < 2) {
      carouselRef.current.snapToNext();
    } else {
      setIsLoading(true); // Show loading indicator

      try {
        const apiUrl = `${SERVER_URL_ROASTERING}/change/mpin`;
        const payload = {
          oldMPIN: currentPin,
          newMPIN: newPin,
        };
        // console.log(payload);

        const response = await axios.put(apiUrl, payload, {
          withCredentials: true,
        });
        if (response.data.success === true) {
          showMessage({
            message: response?.data?.message,
            // description: response?.data?.message,
            type: "success", // Green toast for success
            position: "top", // Show toast from the top
            duration: 4000, // Toast duration
            icon: "success", // Icon to display
            backgroundColor: "green", // Custom background color if needed
            color: "white", // Custom text color
            statusBarHeight: 35,
          });
          const mpinLastSession = await EncryptedStorage.getItem(
            "mpinLastSession"
          );

          if (mpinLastSession) {
            // If it exists, remove it
            await EncryptedStorage.removeItem("mpinLastSession");
          }
          setCurrentPin("");
          setNewPin("");
          setConfirmPin("");
          navigation.goBack();
        } else {
          showMessage({
            message: response?.data?.message,
            // description: response?.data?.message,
            type: "danger", // Red toast for errors
            position: "top",
            duration: 4000,
            icon: "danger",
            backgroundColor: "#E35335",
            color: "white",
            statusBarHeight: 35,
          });
        }
        // Assuming successful response, navigate to confirmation screen or login
        //   navigation.navigate("ResetPINConfirmation");
      } catch (error: any) {
        showMessage({
          message: error.response?.data?.message,
          // description: error.response?.data?.message,
          type: "danger", // Red toast for errors
          position: "top",
          duration: 4000,
          icon: "danger",
          backgroundColor: "#E35335",
          color: "white",
          statusBarHeight: 35,
        });

        // Handle error appropriately, show message to user
      } finally {
        setIsLoading(false); // Hide loading indicator
      }
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.inputContainer}>
      {/* <Text style={styles.textPinText}>
        {item.label}{" "}
        <Text style={{ color: "#D01E12", fontSize: 16 }}>*</Text> :
      </Text> */}
      <OtpInput
        ref={item.ref}
        numberOfDigits={4}
        onTextChange={item.onChangeText}
        textInputProps={{
          accessibilityLabel: item.accessibilityLabel,
          // accessibilityState:
          //   Platform.OS === "android" ? { selected: false } : {},
          value: item.value,
          keyboardType: "numeric",
          placeholder: "0",
          placeholderTextColor: "#000",
          textContentType: "oneTimeCode",
        }}
        secureTextEntry={!item.isVisible}
        autoFocus={item.autoFocus}
        // focusStickBlinkingDuration={300}
        theme={{
          containerStyle: styles.containerPIN,
          pinCodeContainerStyle: styles.pinCodeContainer,
          pinCodeTextStyle: styles.pinCodeText,
          focusStickStyle: styles.focusStick,
          focusedPinCodeContainerStyle: styles.activePinCodeContainer,
        }}
      />
      <TouchableOpacity
        onPress={item.toggleVisibility}
        style={styles.eyeIconContainer}
      >
        <FontAwesome
          name={item.isVisible ? "eye" : "eye-slash"}
          size={20}
          style={styles.iconColor}
        />
      </TouchableOpacity>
    </View>
  );

  // const renderPagination = () => {
  //   return (
  //     <View style={styles.paginationContainer}>
  //       {/* Prev Button with Icon */}
  //       {currentIndex > 0 && (
  //         <TouchableOpacity
  //           style={styles.navButton}
  //           onPress={handlePrev}
  //           disabled={currentIndex === 0} // Disable if it's the first field
  //         >
  //           <MaterialCommunityIcons
  //             name="chevron-left-circle"
  //             size={22}
  //             color={currentIndex === 0 ? "#ccc" : "#3C4764"} // Gray out when disabled
  //           />
  //         </TouchableOpacity>
  //       )}

  //       {/* Next Button with Icon */}
  //       {currentIndex < 2 && (
  //         <TouchableOpacity
  //           style={styles.navButton}
  //           onPress={handleNext}
  //           disabled={isButtonDisabled || currentIndex === 2} // Disable if the button is disabled or it's the last field
  //         >
  //           <MaterialCommunityIcons
  //             name="chevron-right-circle"
  //             size={22}
  //             color={isButtonDisabled || currentIndex === 2 ? "#ccc" : "#3C4764"} // Gray out when disabled
  //           />
  //         </TouchableOpacity>
  //       )}
  //     </View>
  //   );
  // };

  const renderPagination = () => {
    const totalSteps = pinFields.length; // Total number of fields
    const dotSize = 11;

    return (
      <View style={styles.paginationContainer}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              // Navigate to the corresponding field in the carousel
              carouselRef.current?.snapToItem(index);

              // Update the current index state
              setCurrentIndex(index);

              // Handle focus for the corresponding input field
              if (index === 0 && otpInputRef1.current) otpInputRef1.current.focus();
              if (index === 1 && otpInputRef2.current) otpInputRef2.current.focus();
              if (index === 2 && otpInputRef3.current) otpInputRef3.current.focus();
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} // Extend touchable area
            style={[
              styles.dot,
              {
                backgroundColor: currentIndex === index ? "#3C4764" : "#ccc",
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2, // Circular dots
                marginHorizontal: 8, // Add spacing between dots
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      // Move to the previous field in the carousel
      carouselRef.current.snapToPrev();

      // Update the current index
      setCurrentIndex((prevIndex) => {
        const newIndex = prevIndex - 1;

        // Reset button state for the previous field
        if (newIndex === 0 && currentPin.length !== 4) {
          setIsButtonDisabled(true);
        } else if (newIndex === 1 && newPin.length !== 4) {
          setIsButtonDisabled(true);
        } else if (
          newIndex === 2 &&
          (confirmPin.length !== 4 || confirmPin !== newPin)
        ) {
          setIsButtonDisabled(true);
        } else {
          setIsButtonDisabled(false);
        }

        return newIndex;
      });

      // // Clear any errors related to the next field
      // if (currentIndex === 2) {
      //   setConfirmPinError(""); // Clear error for Confirm PIN field
      // } else if (currentIndex === 1) {
      //   setNewPinError(""); // Clear error for New PIN field
      // }
    }
  };
  const pinFields = [
    {
      label: "Enter Current PIN",
      onChangeText: handleCurrentPinChange,
      value: currentPin,
      isVisible: currentPinVisible,
      autoFocus: true,
      accessibilityLabel: "PIN Input",
      toggleVisibility: () => toggleVisibility("current"),
      ref: otpInputRef1,
    },
    {
      label: "Enter New PIN",
      onChangeText: handleNewPinChange,
      value: newPin,
      isVisible: newPinVisible,
      autoFocus: false,
      accessibilityLabel: "New PIN Input",
      toggleVisibility: () => toggleVisibility("new"),
      ref: otpInputRef2,
    },
    {
      label: "Confirm New PIN",
      onChangeText: handleConfirmPinChange,
      value: confirmPin,
      isVisible: confirmPinVisible,
      autoFocus: false,
      accessibilityLabel: "Confirm PIN Input",
      toggleVisibility: () => toggleVisibility("confirm"),
      error: confirmPinError,
      ref: otpInputRef3,
    },
  ];
  const buttonLabels = [
    "Enter Current PIN",
    "Enter New PIN",
    "Confirm New PIN",
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View>
          <View style={globalStyles.overlayImageGlobal}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../assets/images/awp_logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <TouchableOpacity
                style={globalStyles.backArrow}
                onPress={() => navigation.goBack()}>
                <FeatherIcon
                  name="chevron-left"
                  size={26}
                  color="#FFFFFF"
                  style={globalStyles.menuIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={[globalStyles.whiteBox, { top: 90 }]}>
            <View style={styles.textContainer}>
              {/* <TouchableOpacity
                style={styles.backIconContainer}
                onPress={() => navigation.goBack()}
              >
                <FeatherIcon
                  name="arrow-left"
                  size={22}
                  color="#000"
                  style={styles.backIcon}
                />
              </TouchableOpacity> */}
              <View style={styles.titleContainer}>
                <CustomText style={styles.titleText}>
                  {buttonLabels[currentIndex]}
                </CustomText>
              </View>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.subTitleText}>
                For security reasons, your new PIN must be different from your
                current PIN.
              </Text>
              {/* Current PIN Field */}
              {/* <View style={styles.inputContainer}>
                <Text style={styles.textPinText}>
                  Enter PIN{" "}
                  <Text style={{ color: "#D01E12", fontSize: 16 }}>*</Text> :
                </Text>
                <OtpInput
                  numberOfDigits={4}
                  onTextChange={handleCurrentPinChange} // Handle text changes and backspace
                  textInputProps={{
                    accessibilityLabel: "PIN Input",
                    accessibilityState:
                      Platform.OS === "android" ? { selected: false } : {},
                    value: currentPin, // The actual currentPin value
                    keyboardType: "numeric",
                    placeholder: "0",
                    placeholderTextColor: "#000",
                  }}
                  secureTextEntry={!currentPinVisible}
                  autoFocus={true} // Initially focus on the first input
                  focusStickBlinkingDuration={500}
                  ref={otpInputRef1} // Set ref to handle manual focus
                  theme={{
                    containerStyle: styles.containerPIN,
                    pinCodeContainerStyle: styles.pinCodeContainer,
                    pinCodeTextStyle: styles.pinCodeText,
                    focusStickStyle: styles.focusStick,
                    focusedPinCodeContainerStyle: styles.activePinCodeContainer,
                  }}
                />
                <TouchableOpacity
                  onPress={() => toggleVisibility("current")}
                  style={styles.eyeIconContainer}
                >
                  <FontAwesome
                    name={currentPinVisible ? "eye" : "eye-slash"}
                    size={18}
                    style={styles.iconColor}
                  />
                </TouchableOpacity>
              </View> */}

              {/* New PIN Field */}
              {/* <View style={styles.inputContainer}>
                <Text style={styles.textPinText}>
                  New PIN{" "}
                  <Text style={{ color: "#D01E12", fontSize: 16 }}>*</Text> :
                </Text>
                <OtpInput
                  numberOfDigits={4}
                  onTextChange={handleNewPinChange} // Handle text changes and backspace
                  textInputProps={{
                    accessibilityLabel: "New PIN Input",
                    accessibilityState:
                      Platform.OS === "android" ? { selected: false } : {},
                    value: newPin, // The actual newPin value
                    keyboardType: "numeric",
                    placeholder: "0",
                    placeholderTextColor: "#000",
                  }}
                  secureTextEntry={!newPinVisible}
                  autoFocus={false} // Don't auto-focus initially
                  ref={otpInputRef2} // Set ref to handle manual focus
                  theme={{
                    containerStyle: styles.containerPIN,
                    pinCodeContainerStyle: styles.pinCodeContainer,
                    pinCodeTextStyle: styles.pinCodeText,
                    focusStickStyle: styles.focusStick,
                    focusedPinCodeContainerStyle: styles.activePinCodeContainer,
                  }}
                />
                <TouchableOpacity
                  onPress={() => toggleVisibility("new")}
                  style={styles.eyeIconContainer}
                >
                  <FontAwesome
                    name={newPinVisible ? "eye" : "eye-slash"}
                    size={18}
                    style={styles.iconColor}
                  />
                </TouchableOpacity>
              </View> */}

              {/* Confirm PIN Field */}
              {/* <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="cellphone-lock"
                  size={20}
                  style={styles.iconColor}
                />
                <TextInput
                  placeholder="Confirm New PIN"
                  placeholderTextColor="#ccc"
                  style={styles.input}
                  keyboardType="numeric"
                  secureTextEntry={!confirmPinVisible}
                  value={confirmPin}
                  onChangeText={handleConfirmPinChange}
                  maxLength={4}
                />
                <TouchableOpacity onPress={() => toggleVisibility("confirm")}>
                  <FeatherIcon
                    name={confirmPinVisible ? "eye" : "eye-off"}
                    size={18}
                    style={styles.iconColor}
                  />
                </TouchableOpacity>
              </View>
              {confirmPinError ? (
                <Text style={styles.errorText}>{confirmPinError}</Text>
              ) : null} */}

              {/* <View style={styles.inputContainer}>
                <Text style={styles.textPinText}>
                  Confirm PIN{" "}
                  <Text style={{ color: "#D01E12", fontSize: 16 }}>*</Text> :
                </Text>
                <OtpInput
                  numberOfDigits={4}
                  onTextChange={handleConfirmPinChange}
                  textInputProps={{
                    accessibilityLabel: "Confirm PIN Input",
                    accessibilityState: undefined,
                    value: confirmPin, // Use the actual mpin value
                    keyboardType: "numeric",
                    placeholder: "0",
                    placeholderTextColor: "#000",
                  }}
                  secureTextEntry={!confirmPinVisible}
                  autoFocus={false} // Initially focus
                  // focusStickBlinkingDuration={500}
                  ref={otpInputRef3} // Set ref to handle manual focus
                  theme={{
                    containerStyle: styles.containerPIN,
                    pinCodeContainerStyle: styles.pinCodeContainer,
                    pinCodeTextStyle: styles.pinCodeText,
                    focusStickStyle: styles.focusStick,
                    focusedPinCodeContainerStyle: styles.activePinCodeContainer,
                  }}
                />
                <TouchableOpacity
                  onPress={() => toggleVisibility("confirm")}
                  style={styles.eyeIconContainer}
                >
                  <FontAwesome
                    name={confirmPinVisible ? "eye" : "eye-slash"}
                    size={18}
                    style={styles.iconColor}
                  />
                </TouchableOpacity>
              </View> */}

              <Carousel
                ref={carouselRef}
                data={pinFields}
                renderItem={renderItem}
                sliderWidth={350}
                itemWidth={350}
                inactiveSlideScale={0.95}
                inactiveSlideOpacity={0.7}
                containerCustomStyle={{ flexGrow: 0 }}
                contentContainerCustomStyle={{ alignItems: "center" }}
                scrollEnabled={carouselEnabled} // Disable user slide when not allowed
                onSnapToItem={(index) => {
                  setCurrentIndex(index); // Update the index state
                  if (index === 0) otpInputRef1.current.focus(); // Focus on the first field
                  if (index === 1) otpInputRef2.current.focus(); // Focus on the second field
                  if (index === 2) otpInputRef3.current.focus(); // Focus on the third field
                }}
              />

              {/* <View style={{ flexDirection: "row", alignItems: "center" }}> */}
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
              >
                {currentIndex === 2 && confirmPinError ? (
                  <Text style={styles.errorText}>{confirmPinError}</Text>
                ) : null}
              </View>

              {/* </View> */}
              <TouchableOpacity
                style={[
                  styles.button,
                  isButtonDisabled
                    ? styles.buttonDisabled
                    : styles.buttonEnabled,
                ]}
                onPress={handleNext}
                disabled={isButtonDisabled}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {buttonLabels[currentIndex]}
                  </Text>
                )}
              </TouchableOpacity>
              {/* Pagination Dots */}
              {renderPagination()}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 10,
  },
  logoImage: {
    width: 200,
    height: 50,
  },
  textContainer: {
    // position: 'absolute',
    flexDirection: "row",
    alignItems: "center",
    // paddingHorizontal: 24,
    width: "100%",
    justifyContent: "center",
    marginTop: 10,
  },
  titleContainer: {
    flex: 1,
    // alignItems: 'center',
    marginRight: 30,
  },
  titleText: {
    fontSize: 18,
    textAlign: "center",
    color: "#000",
    fontWeight: "bold",
    marginLeft: 30
  },
  backIcon: {
    width: 25,
    height: 25,
  },
  backIconContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 30,
    paddingRight: 10,
    width: 50,
    height: 50,
  },
  formContainer: {
    top: 15,
    borderWidth: 1,
    borderColor: "#C5C5C5",
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 10,
    backgroundColor: "#FFF",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // marginBottom: 13,
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    padding: 10,
    color: "#000",
  },
  button: {
    backgroundColor: "#D01E12",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  iconColor: {
    color: "#3C4764",
  },
  errorText: {
    fontSize: 12,
    color: "red",
    // top: -30,
    textAlign: "center",
    // alignSelf: "center",
    // left: 30,

    //   marginBottom: 10,
  },
  buttonEnabled: {
    marginVertical: 20,
    backgroundColor: "#D01E12", // Enabled color
  },
  buttonDisabled: {
    marginVertical: 20,
    backgroundColor: "#A9A9A9", // Disabled color
  },
  containerPIN: {
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
    marginVertical: normalize(10),
    width: "70%",
  },
  pinCodeContainer: {
    borderBottomWidth: 3,
    borderBottomColor: "#ccc",
    width: normalize(35), // Responsive width
    height: normalize(40), // Responsive height
    justifyContent: "center",
    alignItems: "center",
  },
  activePinCodeContainer: {
    borderBottomColor: "#D01E12",
    borderColor: '#D01E12'
  },
  pinCodeText: {
    fontSize: normalize(16),
    fontWeight: "bold",
    color: "#3C4764",
    textAlign: "center",
  },
  focusStick: {
    width: normalize(2),
    height: normalize(20),
    backgroundColor: "#D01E12", // Adjusted property for better compatibility
  },
  forgotPinContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: normalize(40),
  },
  textPinText: {
    // width: "32%",
    fontSize: 12,
  },
  eyeIconContainer: {
    alignItems: "flex-end",
    left: normalize(10),
  },

  subTitleText: {
    color: colors.grey,
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    // bottom: 20
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  dot: {
    borderRadius: 50,
    marginHorizontal: 15,
  },
  navButton: {
    // paddingVertical: 10,
    // paddingHorizontal: 15,
    // backgroundColor: '#007bff',
    borderRadius: 5,
    marginHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  errorMessage: {
    color: "#D01E12",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
});
