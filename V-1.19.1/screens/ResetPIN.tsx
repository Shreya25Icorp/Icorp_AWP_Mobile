import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { colors, globalStyles } from "../styles";
import CustomText from "../components/CustomText";
import FeatherIcon from "react-native-vector-icons/Feather";
import { SERVER_URL_ROASTERING } from "../Constant";
import axios from "axios";
import Toast from "react-native-simple-toast";
import { OtpInput } from "react-native-otp-entry";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { showMessage, FlashMessage } from "react-native-flash-message";

export default function ResetPINScreen({ route, navigation }) {
  const { mobileNumber } = route.params;

  const [otp, setOtp] = useState("");
  const [newPIN, setNewPIN] = useState("");
  const [confirmPIN, setConfirmPIN] = useState("");

  const [mobileNumberError, setMobileNumberError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [newPinError, setNewPinError] = useState("");
  const [confirmPinError, setConfirmPinError] = useState("");
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [mpinVisible, setMpinVisible] = useState(false);
  const [confirmMpinVisible, setConfirmMpinVisible] = useState(false);

  const otpInputRef1 = useRef(null); // Ref for the first input
  const otpInputRef2 = useRef(null); // Ref for the second input
  const otpInputRef3 = useRef(null); // Ref for the first input

  const toggleMpinVisibility = () => setMpinVisible(!mpinVisible);
  const toggleConfirmMpinVisibility = () =>
    setConfirmMpinVisible(!confirmMpinVisible);

  // Validate OTP
  const validateOtp = (value) => {
    setOtp(value);

    if (value.length !== 6) {
      setOtpError("Enter a valid 6-digit OTP.");
      setIsButtonEnabled(false);
    } else {
      setOtpError("");
      checkAllValidations(value, newPIN, confirmPIN);
    }
  };

  const validateNewPIN = (value) => {
    const pinPattern = /^[0-9]{4}$/; // 4-digit numeric PIN
    setNewPIN(value);
    if (value.length === 4) {
      // Focus the second input once 4 digits are entered
      otpInputRef2.current.focus();
    }
    if (!value.match(pinPattern)) {
      setNewPinError("PIN must be 4 digits."); // Validation for PIN length
      setIsButtonEnabled(false);
    } else {
      setNewPinError(""); // Clear error if valid

      // Check if the confirm PIN matches the new PIN
      if (confirmPIN && confirmPIN !== value) {
        setConfirmPinError("PINs do not match.");
        setIsButtonEnabled(false);
      } else {
        setConfirmPinError(""); // Clear confirm PIN error if they match
        checkAllValidations(otp, value, confirmPIN); // Check overall validation
      }
    }
  };

  // Validate Confirm PIN
  const validateConfirmPIN = (value) => {
    setConfirmPIN(value);

    // if (value.length === 4) {
    if (value !== newPIN) {
      setConfirmPinError("PINs do not match."); // Mismatch error
      setIsButtonEnabled(false);
    } else {
      setConfirmPinError(""); // Clear error if they match
      checkAllValidations(otp, newPIN, value); // Check overall validation
    }
    // } else {
    //   setConfirmPinError(""); // Reset error if PIN is incomplete
    // }
  };

  // Check All Validations
  const checkAllValidations = (otpValue, pin, confirmPin) => {
    const isValidOtp = /^[0-9]{6}$/.test(otpValue);
    const isValidPin = /^[0-9]{4}$/.test(pin);
    const isConfirmPinValid = pin === confirmPin;

    setIsButtonEnabled(isValidOtp && isValidPin && isConfirmPinValid);
  };
  // Submit Request for Reset MPIN
  const submitRequest = async () => {
    if (!isButtonEnabled) return;

    setIsLoading(true); // Show loading indicator

    try {
      const apiUrl = `${SERVER_URL_ROASTERING}/reset/mpin`;
      const payload = {
        mobileNumber: mobileNumber,
        otp: parseInt(otp),
        newMPIN: newPIN,
        confirmMPIN: confirmPIN,
      };
      console.log(payload);

      const response = await axios.put(apiUrl, payload, {
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
          statusBarHeight: 35
        });
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
          statusBarHeight: 35
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
        statusBarHeight: 35
      });

      // Handle error appropriately, show message to user
    } finally {
      setIsLoading(false); // Hide loading indicator
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
                <CustomText style={styles.titleText}>Reset PIN</CustomText>
              </View>
            </View>
            <View style={styles.formContainer}>
              <CustomText style={styles.subTitleText}>
                Enter given details to reset your PIN.
              </CustomText>
              <View style={{ marginTop: 10 }}>
                {/* Mobile Number Field */}
                {/* OTP Field */}
                {/* OTP Field */}
                <View style={[styles.inputContainer]}>
                  <Text style={[styles.textPinText, { width: '28%' }]}>
                    OTP{" "}
                    <Text style={{ color: "#D01E12", fontSize: 16 }}>*</Text> :
                  </Text>
                  <OtpInput
                    numberOfDigits={6}
                    onTextChange={validateOtp}
                    textInputProps={{
                      accessibilityLabel: "OTP Input",
                      value: otp,
                      keyboardType: "numeric",
                      placeholder: "0",
                      placeholderTextColor: "#000",
                    }}
                    autoFocus={true} // Initially focus on the first input
                    focusStickBlinkingDuration={500}
                    ref={otpInputRef3} // Ref to handle focus manually
                    theme={{
                      containerStyle: styles.containerPINOTP,
                      pinCodeContainerStyle: styles.pinCodeContainer,
                      pinCodeTextStyle: styles.pinCodeText,
                      focusStickStyle: styles.focusStick,
                      focusedPinCodeContainerStyle:
                        styles.activePinCodeContainer,
                    }}
                  />
                </View>
                {/* {otpError ? (
                  <Text style={styles.errorText}>{otpError}</Text>
                ) : null} */}

                <View style={styles.inputContainer}>
                  <Text style={styles.textPinText}>
                    New PIN{" "}
                    <Text style={{ color: "#D01E12", fontSize: 16 }}>*</Text> :
                  </Text>
                  <OtpInput
                    numberOfDigits={4}
                    onTextChange={validateNewPIN}
                    textInputProps={{
                      accessibilityLabel: "PIN Input",
                      value: newPIN,
                      keyboardType: "numeric",
                      placeholder: "0",
                      placeholderTextColor: "#000",
                    }}
                    secureTextEntry={!mpinVisible}
                    autoFocus={false} // Initially focus on the first input
                    // focusStickBlinkingDuration={500}
                    ref={otpInputRef1} // Ref to handle focus manually
                    theme={{
                      containerStyle: styles.containerPIN,
                      pinCodeContainerStyle: styles.pinCodeContainer,
                      pinCodeTextStyle: styles.pinCodeText,
                      focusStickStyle: styles.focusStick,
                      focusedPinCodeContainerStyle:
                        styles.activePinCodeContainer,
                    }}
                  />
                  <TouchableOpacity
                    onPress={toggleMpinVisibility}
                    style={styles.eyeIconContainer}
                  >
                    <FontAwesome
                      name={mpinVisible ? "eye" : "eye-slash"}
                      size={18}
                      style={styles.iconColor}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.textPinText}>
                    Confirm PIN{" "}
                    <Text style={{ color: "#D01E12", fontSize: 16 }}>*</Text> :
                  </Text>

                  <OtpInput
                    numberOfDigits={4}
                    onTextChange={validateConfirmPIN}
                    textInputProps={{
                      accessibilityLabel: "Confirm PIN Input",
                      value: confirmPIN,
                      keyboardType: "numeric",
                      placeholder: "0",
                      placeholderTextColor: "#000",
                    }}
                    autoFocus={false}
                    // focusStickBlinkingDuration={500}
                    ref={otpInputRef2} // Ref for second input
                    theme={{
                      containerStyle: styles.containerPIN,
                      pinCodeContainerStyle: styles.pinCodeContainer,
                      pinCodeTextStyle: styles.pinCodeText,
                      focusStickStyle: styles.focusStick,
                      focusedPinCodeContainerStyle:
                        styles.activePinCodeContainer,
                    }}
                    secureTextEntry={!confirmMpinVisible}
                  />
                  <TouchableOpacity
                    onPress={toggleConfirmMpinVisibility}
                    style={styles.eyeIconContainer}
                  >
                    <FontAwesome
                      name={confirmMpinVisible ? "eye" : "eye-slash"}
                      size={18}
                      style={styles.iconColor}
                    />
                  </TouchableOpacity>
                </View>
                {confirmPinError ? (
                  <Text style={styles.errorText}>{confirmPinError}</Text>
                ) : null}
                {/* Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: isButtonEnabled ? "#D01E12" : "#ccc" },
                  ]}
                  onPress={submitRequest}
                  disabled={!isButtonEnabled}
                >
                  {/* {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : ( */}
                  <Text style={styles.buttonText}>Submit</Text>
                  {/* )} */}
                </TouchableOpacity>
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
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
    marginVertical: 10,
  },
  titleContainer: {
    flex: 1,
    marginRight: 30,
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
  errorText: { color: "red", textAlign: "center", top: -15, },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    padding: 10,
    color: "#000",
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
    width: "55%",
  },
  containerPINOTP: {
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
    marginVertical: 10,
    width: "70%",
  },
  pinCodeContainer: {
    borderBottomWidth: 3, // Underline
    borderBottomColor: "#ccc", // Default underline color
    width: 35, // Adjust for digit spacing
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    // borderColor: "transparent",
    // borderBottomLeftRadius: 0,
    // borderBottomRightRadius: 0,
  },
  activePinCodeContainer: {
    borderBottomColor: "#50C878", // Color when focused
    // borderColor: "transparent",
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
    marginTop: 40, // Space from the bottom edge
  },
  textPinText: {
    width: "28%",
    fontSize: 13,
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
  eyeIconContainer: {
    alignItems: "flex-end",
    left: 10,
    // top: -20,
    // right: 20,
  },
  iconColor: {
    color: "#3C4764",
  },
});
