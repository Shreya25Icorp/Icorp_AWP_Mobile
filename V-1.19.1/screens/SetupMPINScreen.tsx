import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  Image,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  PixelRatio,
  BackHandler,
  Alert,
} from "react-native";
import EncryptedStorage from "react-native-encrypted-storage";
import { s as tw } from "react-native-wind";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { colors, globalStyles } from "../styles";
import FeatherIcon from "react-native-vector-icons/Feather";
import CustomText from "../components/CustomText";
import { SERVER_URL_ROASTERING } from "../Constant";
import axios from "axios";
import Toast from "react-native-simple-toast";
import { OtpInput } from "react-native-otp-entry";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { showMessage, FlashMessage } from "react-native-flash-message";
import Carousel from "react-native-snap-carousel";
import { useFocusEffect } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
const scale = width / 375;

const normalize = (size) => {
  const newSize = size * scale;
  return Platform.OS === "ios" 
    ? Math.round(PixelRatio.roundToNearestPixel(newSize))
    : Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

export default function SetupMPINScreen({ navigation }) {
  const [mpin, setMpin] = useState("");
  const [confirmMpin, setConfirmMpin] = useState("");
  const [mpinError, setMpinError] = useState("");
  const [confirmMpinError, setConfirmMpinError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mpinVisible, setMpinVisible] = useState(false);
  const [confirmMpinVisible, setConfirmMpinVisible] = useState(false);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [maskedMpin, setMaskedMpin] = useState("");
  const [maskedConfirmMpin, setMaskedConfirmMpin] = useState("");
  const [userData, setUserData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselEnabled, setCarouselEnabled] = useState(true);

  const otpInputRef1 = useRef(null); // Ref for the first input
  const otpInputRef2 = useRef(null); // Ref for the second input
  const carouselRef = useRef(null);
  
  const toggleMpinVisibility = () => setMpinVisible(!mpinVisible);
  const toggleConfirmMpinVisibility = () =>
    setConfirmMpinVisible(!confirmMpinVisible);

  // Validate MPIN Field
  // const validateMpin = (value) => {
  //   if (value.length < 4) {
  //     setMpinError("MPIN must be 4 digits.");
  //   } else {
  //     setMpinError("");
  //   }
  //   setMpin(value);
  //   validateButton(value, confirmMpin);
  // };

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${SERVER_URL_ROASTERING}/me`, {
          withCredentials: true,
        });
        // console.log(response?.data);

        setUserData(response?.data?.user); // Update userData state
      } catch (error) {
        // console.log("Error fetching user data:", error);
        Toast.show("Failed to fetch user details", Toast.SHORT);
      }
    };

    fetchUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const handleBackPress = () => {
        Alert.alert(
          "Confirm Exit",
          "Are you sure you want to close the application? ",
          [
            {
              text: "No",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel",
            },
            {
              text: "Yes",
              onPress: () => BackHandler.exitApp(),
            },
          ],
          { cancelable: false }
        );
        return true; // Prevents the default back action
      };
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress
      );
      
      return () => {
        backHandler.remove();
      };
    }, [])
  );

 
  const validateButton = (mpin, confirmMpin) => {
    // Check if both MPINs are filled
    if (mpin.length === 4 && confirmMpin.length === 4) {
      if (mpin === confirmMpin) {
        setIsButtonEnabled(true);
        setMpinError(""); // Clear MPIN error
        setConfirmMpinError(""); // Clear Confirm MPIN error
      } else {
        setIsButtonEnabled(false);
        setConfirmMpinError("PINs do not match."); // Set error for mismatch
      }
    } else {
      setIsButtonEnabled(false);
    }
  };

  const handleTextChange = (text) => {
    if (text.length <= 4) {
      setMpin(text);

      setMpinError(""); // Clear MPIN error
      // if (text.length === 4) {
      //   // Focus the second input once 4 digits are entered
      //   otpInputRef2.current.focus();
      // }
      // Validate Button Enable/Disable
      validateButton(text, confirmMpin);
    } else {
      setMpinError("MPIN must be 4 digits.");
    }
  };

  const handleTextChangeConfirm = (text) => {
    if (text.length <= 4) {
      setConfirmMpin(text);
      setConfirmMpinError(""); // Clear confirm MPIN error

      // Validate Button Enable/Disable
      validateButton(mpin, text);
    } else {
      console.log("errpr");

      setConfirmMpinError("Confirm MPIN must be 4 digits.");
    }
  };

   // Enable button based on the current field
   useEffect(() => {
    if (currentIndex === 0 && mpin.length === 4) {
      setIsButtonEnabled(true);
    } else if (
      currentIndex === 1 &&
      confirmMpin.length === 4 &&
      mpin === confirmMpin
    ) {
      setIsButtonEnabled(true);
    } else {
      setIsButtonEnabled(false);
    }
  }, [mpin, confirmMpin, currentIndex]);

  const handleNext = () => {
    if (currentIndex < pinFields.length - 1) {
      carouselRef.current.snapToNext(); // Move to the next field in the carousel
      setCurrentIndex(currentIndex + 1); // Update the current index
      setIsButtonEnabled(false); // Disable the button for the next field initially
    } else {
      saveMPIN(); // Handle the final submission when on the last field
    }
  };

  // Validate Confirm MPIN Field
  // const validateConfirmMpin = (value) => {
  //   if (value.length < 4) {
  //     setConfirmMpinError("MPIN must be 4 digits.");
  //   } else if (value !== mpin) {
  //     setConfirmMpinError("MPINs do not match.");
  //   } else {
  //     setConfirmMpinError("");
  //   }
  //   setConfirmMpin(value);
  //   validateButton(mpin, value);
  // };

  const saveMPIN = async () => {
    if (!isButtonEnabled) return;
    setIsLoading(true); // Show loading indicator
    try {
      const apiUrl = `${SERVER_URL_ROASTERING}/set/mpin`;
      const payload = {
        MPIN: mpin,
      };
      console.log(payload);
      const response = await axios.put(apiUrl, payload, {
        withCredentials: true,
      });
      // console.log("response setup", response.data);
      
      if (response?.data?.success === true) {
        showMessage({
          message: response?.data?.message,
          // description: response?.data?.message,
          type: "success", // Green toast for success
          position: "top", // Show toast from the top
          duration: 4000, // Toast duration
          icon: "success", // Icon to display
          backgroundColor: "green", // Custom background color if needed
          color: "white", // Custom text color
          statusBarHeight: 35
        });
        setMpin('')
        setConfirmMpin('')
        navigation.navigate("UserHome");

      }
    } catch (error: any) {
      // console.log(error);
      
      showMessage({
        message: error.response?.data?.message,
        // description: error.response?.data?.message,
        type: "danger", // Red toast for errors
        position: "top",
        duration: 4000,
        icon: "danger",
        backgroundColor: "#E35335",
        color: "white",
        statusBarHeight: 35
      });
    } finally {
      setIsLoading(false);
    }
  };
  function capitalizeFirstLetter(string: string): string {
    if (!string || typeof string !== "string") return ""; // Handle empty, undefined, or non-string values

    return string
      .split(" ") // Split the string into words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
      .join(" "); // Join the words back together with a space
  }
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
        }}
        secureTextEntry={!item.isVisible}
        autoFocus={item.autoFocus}
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
  //       {currentIndex < 1 && (
  //         <TouchableOpacity
  //           style={styles.navButton}
  //           onPress={handleNext}
  //           disabled={!isButtonEnabled || currentIndex === 1} // Disable if the button is disabled or it's the last field
  //         >
  //           <MaterialCommunityIcons
  //             name="chevron-right-circle"
  //             size={22}
  //             color={!isButtonEnabled || currentIndex === 1 ? "#ccc" : "#3C4764"} // Gray out when disabled
  //           />
  //         </TouchableOpacity>
  //       )}
  //     </View>
  //   );
  // };
  const handlePrev = () => {
    if (currentIndex > 0) {
      // Move to the previous field in the carousel
      carouselRef.current.snapToPrev();
      
      // Update the current index
      setCurrentIndex((prevIndex) => {
        const newIndex = prevIndex - 1;
  
        // Reset button state for the previous field
        if (newIndex === 0 && mpin.length !== 4) {
          setIsButtonEnabled(true);
        } else if (
          newIndex === 1 &&
          (confirmMpin.length !== 4 || confirmMpin !== mpin)
        ) {
          setIsButtonEnabled(true);
        } else {
          setIsButtonEnabled(false);
        }
  
        return newIndex;
      });
  
      // Clear any errors related to the next field
      // if (currentIndex === 1) {
      //   setConfirmMpinError(""); // Clear error for Confirm PIN field
      // } else if (currentIndex === 0) {
      //   setMpinError(""); // Clear error for New PIN field
      // }
    }
  };

  const pinFields = [
   
    {
      label: "Enter New PIN",
      onChangeText: handleTextChange,
      value: mpin,
      isVisible: mpinVisible,
      autoFocus: true,
      accessibilityLabel: "New PIN Input",
      toggleVisibility: toggleMpinVisibility,
      ref: otpInputRef1,
    },
    {
      label: "Confirm New PIN",
      onChangeText: handleTextChangeConfirm,
      value: confirmMpin,
      isVisible: confirmMpinVisible,
      autoFocus: false,
      accessibilityLabel: "Confirm PIN Input",
      toggleVisibility:  toggleConfirmMpinVisibility,
      ref: otpInputRef2,
      error: confirmMpinError,
    },
  ];
  const buttonLabels = [
    "Enter New PIN",
    "Confirm New PIN",
  ];

  const handleCarouselScroll = (index) => {
    if (carouselEnabled) {
      setCurrentIndex(index);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && (
        // Full-page loader overlay
        <View style={globalStyles.loaderContainer1}>
          <ActivityIndicator size="large" color="#3C4764" />
        </View>
      )}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View>
          <View style={globalStyles.overlayImageGlobal}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../assets/images/awp_logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
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
            <View style={[styles.formContainer]}>
              {userData && (
                //   {/* <View style={[globalStyles.profileImageContainer]}> */}
                // {/* {loadingImage ? (
                //   <View style={globalStyles.loaderCircle}>
                //     <ActivityIndicator size="large" color="#3C4764" />
                //   </View>
                // ) : image ? (
                //   <Image
                //     source={{uri: image + `?timestamp=${new Date().getTime()}`}}
                //     resizeMode="contain"
                //     style={globalStyles.profileImage}
                //   />
                // ) : (
                //   <View style={globalStyles.initialsCircle}>
                //     <Text style={globalStyles.initialsText}>
                //       {capitalizeFirstLetter(data?.firstName?.charAt(0)) +
                //         capitalizeFirstLetter(data?.lastName?.charAt(0))}
                //     </Text>
                //   </View>
                // )} */}
                <View style={styles.userDetailsContainer}>
                  <Text style={styles.userDetailText}>
                    {capitalizeFirstLetter(userData?.firstName) +
                      " " +
                      capitalizeFirstLetter(userData?.lastName)}
                  </Text>
                  <Text style={styles.userDetailPhone}>
                    <Text style={styles.detailValue}>
                      {userData?.mobileNumber}
                    </Text>
                  </Text>
                </View>
              )}
              <CustomText style={styles.subTitleText}>
                Please set your 4 digit PIN.
              </CustomText>
              <View style={{ marginTop: 15 }}>
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
                  if (index === 1) otpInputRef2.current.focus(); // Focus on the second fiel
                }}
              />
                {confirmMpinError ? (
                  <Text style={styles.errorText}>{confirmMpinError}</Text>
                ) : null}
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    { backgroundColor: !isButtonEnabled ? "#ccc" :  '#D01E12' },
                  ]}
                  onPress={() => handleNext()}
                  disabled={!isButtonEnabled}
                >
                  <Text style={styles.buttonText}>{buttonLabels[currentIndex]}</Text>
                </TouchableOpacity>

                {renderPagination()}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  },
  titleContainer: {
    flex: 1,
    // alignItems: 'center',
    // marginRight: 30,
    marginTop: 10,
  },
  titleText: {
    fontSize: 18,
    textAlign: "center",
    color: "#000",
    fontWeight: "bold",
    marginLeft: 30
  },
  subTitleText: {
    color: colors.grey,
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    // bottom: 20
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
  footerText: {
    position: "absolute",
    fontFamily: "Roboto",
    color: "#F2F2F2",
    fontSize: 12,
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: 20.02,
    letterSpacing: 0.17,
    textTransform: "uppercase",
    textAlign: "center",
    alignSelf: "center",
    bottom: 20,
  },
  label: { fontSize: 16, fontWeight: "bold", marginVertical: 10 },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    padding: 10,
    color: "#000",
  },
  errorText: { color: "red", textAlign: "center", fontSize: 12  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:'center'

    // marginBottom: 15,
  },
  button: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    top: 20,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
  saveButton: {
    marginTop: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
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
    // width: "31%",
    fontSize: 12,
  },
  eyeIconContainer: {
    alignItems: "flex-end",
    left: normalize(10),
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  dot: {
    borderRadius: 50,
    marginHorizontal: 6,
  },
  navButton: {
    // paddingVertical: 10,
    // paddingHorizontal: 15,
    // backgroundColor: '#007bff',
    borderRadius: 5,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorMessage: {
    color: '#D01E12',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  userDetailsContainer: {
    // padding: 2,
    // marginBottom: 20,
    // backgroundColor: "#F9F9F9",
    // borderRadius: 10,
    // borderColor: "#E0E0E0",
    // borderWidth: 1,
  },
  userDetailText: {
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  userDetailPhone: {
    marginTop: 8,
    fontSize: 13,
    // fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  detailValue: {
    fontWeight: "normal",
    color: "#555",
  },
  iconColor: {
    color: "#3C4764",
  },
});
