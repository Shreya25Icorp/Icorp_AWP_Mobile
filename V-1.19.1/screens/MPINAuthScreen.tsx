import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Animated,
  BackHandler,
  Modal,
} from "react-native";
import EncryptedStorage from "react-native-encrypted-storage";
import { s as tw } from "react-native-wind";
import Feather from "react-native-vector-icons/Feather";
import { OtpInput } from "react-native-otp-entry";
import { TouchableOpacity } from "react-native-gesture-handler";
import { colors, globalStyles } from "../styles";
import CustomText from "../components/CustomText";
import FeatherIcon from "react-native-vector-icons/Feather";
import { SERVER_URL_ROASTERING } from "../Constant";
import axios from "axios";
// import Toast from "react-native-simple-toast";
import CustomKeyboard from "../components/CustomKeyboard/CustomKeyboard";
import CustomToast from "../components/CustomToast/CustomToast";
import Toast from "react-native-simple-toast";
import { showMessage, FlashMessage } from "react-native-flash-message";
import { useFocusEffect } from "@react-navigation/native";
import ReactNativeBiometrics, { BiometryTypes } from "react-native-biometrics";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import ThankYouModal from "../components/CustomForgotThank/CustomForgotThank";

const ForgotPinModal = ({ isVisible, onClose, onConfirm }) => (
  <Modal
    transparent={true}
    animationType="fade"
    visible={isVisible}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Forgot PIN?</Text>
        <Text style={styles.modalMessage}>
          Are you sure you forgot your PIN?
        </Text>
        <View style={styles.modalButtons}>
          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>No</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={onConfirm}>
            <Text style={styles.modalButtonText}>Yes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export default function MPINAuthScreen({ navigation }) {
  const [mpin, setMpin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [maskedMpin, setMaskedMpin] = useState("");
  const [userData, setUserData] = useState(null);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [thankModalVisible, setThankModalVisible] = useState(false);

  const [selectedButton, setSelectedButton] = useState<string | null>(null);
  const otpInputRef = useRef();

  // Cursor position
  const cursorPosition = new Animated.Value(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${SERVER_URL_ROASTERING}/me`, {
          withCredentials: true,
        });
        console.log(response?.data);

        setUserData(response?.data?.user); // Update userData state
      } catch (error) {
        console.log("Error fetching user data:", error);
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

  useEffect(() => {
    const autoAuthenticate = async () => {
      const rnBiometrics = new ReactNativeBiometrics();
      const { available } = await rnBiometrics.isSensorAvailable();

      if (available) {
        await handleBiometricAuthentication();
      }
    };

    autoAuthenticate();
  }, []);

  const handleBiometricAuthentication = async () => {
    const rnBiometrics = new ReactNativeBiometrics();

    try {
      const { available, biometryType } =
        await rnBiometrics.isSensorAvailable();

      if (available) {
        // console.log(`Biometric type available: ${biometryType}`);

        // Step 1: Attempt Face ID
        if (biometryType === BiometryTypes.FaceID) {
          console.log("Trying Face ID authentication");
          const faceIdSuccess = await rnBiometrics.simplePrompt({
            promptMessage: "Authenticate using Face ID",
            cancelButtonText: "Cancel",
          });

          if (faceIdSuccess.success) {
            // console.log("Face ID authentication successful");
            await handleSuccessfulAuthentication();
            return;
          } else {
            console.log(
              "Face ID authentication failed or canceled. Trying Fingerprint..."
            );
          }
        }

        // Step 2: Attempt Fingerprint
        if (biometryType === BiometryTypes.Biometrics) {
          // console.log("Trying Fingerprint authentication");
          const fingerprintSuccess = await rnBiometrics.simplePrompt({
            promptMessage: "Authenticate using Fingerprint",
            cancelButtonText: "Cancel",
          });

          if (fingerprintSuccess.success) {
            // console.log("Fingerprint authentication successful");
            await handleSuccessfulAuthentication();
            return;
          } else {
            console.log(
              "Fingerprint authentication failed or canceled. Trying Touch ID..."
            );
          }
        }

        // Step 3: Attempt Touch ID
        if (biometryType === BiometryTypes.TouchID) {
          // console.log("Trying Touch ID authentication");
          const touchIdSuccess = await rnBiometrics.simplePrompt({
            promptMessage: "Authenticate using Touch ID",
            cancelButtonText: "Cancel",
          });

          if (touchIdSuccess.success) {
            // console.log("Touch ID authentication successful");
            await handleSuccessfulAuthentication();
            return;
          } else {
            console.log("Touch ID authentication failed or canceled.");
          }
        }

        // If all fail
        // console.log("Biometric authentication failed for all available types");
        showMessage({
          message: "Authentication failed. Please try again.",
          type: "danger",
          position: "top",
          duration: 4000,
          backgroundColor: "#E35335",
          color: "white",
        });
      } else {
        // console.log("Biometric authentication not available or not enabled");
        showMessage({
          message: "Biometric authentication not available",
          type: "danger",
          position: "top",
          duration: 4000,
          backgroundColor: "#E35335",
          color: "white",
        });
      }
    } catch (error) {
      // console.error("Biometric authentication failed:", error);
      showMessage({
        message: "Biometric authentication failed",
        type: "danger",
        position: "top",
        duration: 4000,
        backgroundColor: "#E35335",
        color: "white",
      });
    }
  };

  // Helper function to handle successful authentication
  const handleSuccessfulAuthentication = async () => {
    const currentTime = new Date().getTime();
    await EncryptedStorage.setItem("mpinLastSession", currentTime.toString());
    navigation.navigate("UserHome");
  };

  // Handle text change when a digit is entered
  const handleTextChange = async (digit) => {
    if (mpin.length <= 4) {
      const newMpin = mpin + digit; // Append the digit
      // console.log(newMpin);

      setMpin(newMpin); // Update state
      if (newMpin.length === 4) {
        setIsButtonEnabled(true); // Enable button
        await verifyMPIN(newMpin); // Auto-verify the MPIN
      } else {
        setIsButtonEnabled(false); // Disable button for incomplete PIN
      } // Enable button if 4 digits entered
    }
  };

  // Handle backspace to remove the last digit
  const handleBackspace = () => {
    const newMpin = mpin.slice(0, -1); // Remove the last digit
    setMpin(newMpin); // Update the MPIN state
    setIsButtonEnabled(newMpin.length === 4); // Disable button if less than 4 digits
  };

  const renderOtpDigits = () => {
    const digits = mpin.split("");
    return Array.from({ length: 4 }).map((_, index) => (
      <View
        key={index}
        style={[
          styles.digitContainer,
          index < digits.length ? styles.filledDigit : styles.emptyDigit,
          index === digits.length ? styles.focusedDigit : null, // Focus on the current digit
        ]}
      >
        {/* Secure text entry: Show '*' or '●' for entered digits */}
        <Text style={styles.digitText}>{digits[index] ? "●" : ""}</Text>
      </View>
    ));
  };

  const verifyMPIN = async (newMpin) => {
    setIsLoading(true); // Show loading indicator

    try {
      const apiUrl = `${SERVER_URL_ROASTERING}/verify/mpin`;
      const payload = {
        MPIN: newMpin,
      };
      console.log(payload);

      const response = await axios.post(apiUrl, payload, {
        withCredentials: true,
      });

      // console.log("Response:", response?.data);

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
        const currentTime = new Date().getTime();
        await EncryptedStorage.setItem(
          "mpinLastSession",
          currentTime.toString()
        );
        setMpin("");
        navigation.navigate("UserHome");
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
      // console.log(error.response.data);
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
  };

  const handleForgotPinPress = () => {
    setModalVisible(true);
  };

  function capitalizeFirstLetter(string: string): string {
    if (!string || typeof string !== "string") return ""; // Handle empty, undefined, or non-string values

    return string
      .split(" ") // Split the string into words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
      .join(" "); // Join the words back together with a space
  }
  const handleYesPress = () => {
    setModalVisible(false);
    handlePress();
  };
  const handlePress = async () => {
    try {
      setIsLoading(true);
      const apiUrl = `${SERVER_URL_ROASTERING}/request/mpin/reset`;
      const response = await axios.post(apiUrl);
      if (response?.data.success === true) {
        // Toast.show(response?.data?.message, Toast.SHORT);
        setIsLoading(false);
        setModalVisible(false); // Close the initial modal
        setThankModalVisible(true);
        // setCurrentWeek(dayjs());
      }
    } catch (error) {
      throw error;
    }
  };
  const closeModal = () => {
    setThankModalVisible(false);
    // navigation.goBack();
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
                  Enter Your PIN to Continue
                </CustomText>
              </View>
            </View>
            <View style={[styles.formContainer]}>
              {userData && (
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
                Unlock App using PIN
              </CustomText>
              <View style={{ flexDirection: "row" }}>
                <View style={styles.otpContainer}>{renderOtpDigits()}</View>
              </View>

              {/* {error ? <Text style={styles.errorText}>{error}</Text> : null} */}

              {/* <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: isButtonEnabled ? "#D01E12" : "#ccc" },
                ]}
                onPress={verifyMPIN}
                disabled={!isButtonEnabled || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Verify MPIN</Text>
                )}
              </TouchableOpacity> */}

              <TouchableOpacity
                onPress={handleForgotPinPress}
                style={styles.forgotPinContainer}
              >
                <Text style={styles.forgotPinText}>FORGOT PIN?</Text>
              </TouchableOpacity>
              <ForgotPinModal
                isVisible={modalVisible}
                onClose={() => setModalVisible(false)}
                onConfirm={handleYesPress}
              />

              <ThankYouModal
                isVisible={thankModalVisible}
                onClose={closeModal}
              />

              <CustomKeyboard
                onChange={handleTextChange}
                onBackspace={handleBackspace}
                onSubmit={() => {
                  if (isButtonEnabled) {
                    verifyMPIN(mpin); // Call verifyMPIN only if the button is enabled
                  }
                }}
              />
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
    marginTop: 12,
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
    // right: 3,
    backgroundColor: "#FFF",
    height: "68%",
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
  input: { flex: 1, color: "#fff", padding: 10 },
  errorText: { color: "red", textAlign: "left" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 5,
    paddingHorizontal: 10,
    width: "100%",
    marginVertical: 10,
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

  containerPIN: {
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
    marginVertical: 10,
  },
  pinCodeContainer: {
    borderBottomWidth: 3, // Underline
    borderBottomColor: "#ccc", // Default underline color
    width: 40, // Adjust for digit spacing
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "transparent",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  activePinCodeContainer: {
    borderBottomColor: "#50C878", // Color when focused
    borderColor: "transparent",
  },
  pinCodeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000", // Digit color
    textAlign: "center",
  },
  focusStick: {
    width: 2,
    height: 25,
    color: "#50C878",
  },
  forgotPinContainer: {
    alignItems: "center",
    justifyContent: "flex-end", // Align at the bottom
    // marginTop: 25, // Space from the bottom edge
  },
  forgotPinText: {
    color: "#3C4764",
    fontSize: 13,
    // textDecorationLine: "underline",
    fontWeight: "bold",
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
    marginTop: 5,
  },
  userDetailPhone: {
    marginTop: 12,
    fontSize: 13,
    // fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  detailValue: {
    fontWeight: "normal",
    color: "#555",
  },
  otpContainer: {
    justifyContent: "space-around",
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    marginVertical: 30,
    width: "100%",
  },

  digitContainer: {
    borderWidth: 1, // Underline
    borderBottomWidth: 3, // Underline
    borderColor: "#ccc", // Default underline color
    borderRadius: 10,
    width: 40, // Adjust for digit spacing
    height: 45,
    justifyContent: "center",
    alignItems: "center",
  },

  filledDigit: {
    borderWidth: 1,
    // borderBottomColor: "#D01E12",
  },
  emptyDigit: {
    // borderWidth: 1,
    borderBottomColor: "#ccc",
    // borderTopColor: 'transparent' ,
    // borderLeftColor: 'transparent',
    // borderRightColor: 'transparent',
  },
  focusedDigit: {
    backgroundColor: "#E5E4E2", // Focused digit background color
    borderColor: "#D01E12", // Focused digit border color
    borderWidth: 1,
    borderBottomColor: "#D01E12",
  },
  digitText: {
    fontSize: 11,
    // fontWeight: 'bold',
    color: "#000", // Color for the text inside the filled digits
  },
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  modalButton: {
    padding: 10,
    backgroundColor: "#D01E12",
    borderRadius: 5,
    marginHorizontal: 10,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
  },
});
