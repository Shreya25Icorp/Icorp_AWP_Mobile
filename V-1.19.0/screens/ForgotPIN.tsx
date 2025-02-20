import React, { useState } from "react";
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
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { colors, globalStyles } from "../styles";
import CustomText from "../components/CustomText";
import FeatherIcon from "react-native-vector-icons/Feather";
import { SERVER_URL_ROASTERING } from "../Constant";
import axios from "axios";
import Toast from "react-native-simple-toast";
import { showMessage, FlashMessage } from "react-native-flash-message";

export default function ForgotPINScreen({ navigation }) {
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileNumberError, setMobileNumberError] = useState("");
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedButton, setSelectedButton] = useState(null);

  // Validate Mobile Number Field
  const validateMobileNumber = (value) => {
    const mobileNumberPattern = /^[0-9]{10}$/; // Example pattern for a 10-digit number
    if (!value.match(mobileNumberPattern)) {
      setMobileNumberError("Enter a valid 10-digit mobile number.");
    } else {
      setMobileNumberError("");
    }
    setMobileNumber(value);
    validateButton(value);
  };

  // Enable/Disable Button Based on Validation
  const validateButton = (mobileValue) => {
    if (mobileValue.match(/^[0-9]{10}$/)) {
      setIsButtonEnabled(true);
    } else {
      setIsButtonEnabled(false);
    }
  };

  // Submit Request for Forgot MPIN
  const submitRequest = async (btnType: string) => {
    if (!isButtonEnabled) return;


    try {
      setIsLoading(true); // Show loading indicator

      setSelectedButton(btnType);

      // Determine the boolean values based on type
      const isEmail = btnType === "email";
      const isSms = btnType === "sms";

      const apiUrl = `${SERVER_URL_ROASTERING}/forgot/mpin`;
      const payload = {
        mobileNumber: mobileNumber,
        sendEmail: isEmail,
        sendTextMessage: isSms
      };

      const response = await axios.post(apiUrl, payload);
      // console.log("Response:", response.data);
      if (response.data.success === true) {
        setIsLoading(false); // Hide loading indicator
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
        navigation.navigate("ResetPIN", { mobileNumber });
      }

      // Assuming successful response, navigate to OTP verification screen
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
                <CustomText style={styles.titleText}>Forgot PIN</CustomText>
              </View>
            </View>
            <View style={[styles.formContainer]}>
              <CustomText style={styles.subTitleText}>
                Enter your registered mobile number to reset your PIN.
              </CustomText>
              <View style={{ marginTop: 10 }}>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons
                    name="phone"
                    size={22}
                    color="#3C4764"
                  />
                  <TextInput
                    style={styles.input}
                    autoFocus={true}
                    placeholder="Mobile Number"
                    placeholderTextColor={"#ccc"}
                    keyboardType="numeric"
                    value={mobileNumber}
                    onChangeText={validateMobileNumber}
                    maxLength={10}
                  />
                </View>
                {mobileNumberError ? (
                  <Text style={styles.errorText}>{mobileNumberError}</Text>
                ) : null}
              </View>
              {/* <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: isButtonEnabled ? "#D01E12" : "#ccc" },
                ]}
                onPress={submitRequest}
                disabled={!isButtonEnabled}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Submit</Text>
                )}
              </TouchableOpacity> */}

              {/* SMS me OTP and Email me OTP buttons */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.button,
                    {
                      marginRight: 10,
                      width: "45%",
                      backgroundColor: isButtonEnabled
                        ? "#D01E12"
                        : "#A9A9A9",
                    },
                  ]}
                  onPress={() => submitRequest("sms")}
                  disabled={!isButtonEnabled || isLoading} // Disable if invalid or loading
                >
                  {isLoading && selectedButton === "sms" ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>SMS me OTP</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    {
                      width: "45%",
                      backgroundColor: isButtonEnabled
                        ? "#D01E12"
                        : "#A9A9A9",
                    },
                  ]}
                  onPress={() => submitRequest("email")}
                  disabled={!isButtonEnabled || isLoading} // Disable if invalid or loading
                >
                  {isLoading && selectedButton === "email" ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Email me OTP</Text>
                  )}
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
    // position: 'absolute',
    flexDirection: "row",
    alignItems: "center",
    // paddingHorizontal: 24,
    width: "100%",
    justifyContent: "center",
    marginVertical: 10,
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
  subTitleText: {
    color: colors.grey,
    fontSize: 14,
    textAlign: "center",
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
  errorText: { color: "red", textAlign: "left" },
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
});
