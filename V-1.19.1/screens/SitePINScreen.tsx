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
import { useFocusEffect, useRoute } from "@react-navigation/native";
import ReactNativeBiometrics, { BiometryTypes } from "react-native-biometrics";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import ThankYouModal from "../components/CustomForgotThank/CustomForgotThank";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// const ForgotPinModal = ({ isVisible, onClose, onConfirm }) => (
//   <Modal
//     transparent={true}
//     animationType="fade"
//     visible={isVisible}
//     onRequestClose={onClose}
//   >
//     <View style={styles.modalOverlay}>
//       <View style={styles.modalContainer}>
//         <Text style={styles.modalTitle}>Forgot PIN?</Text>
//         <Text style={styles.modalMessage}>
//           Are you sure you forgot your PIN?
//         </Text>
//         <View style={styles.modalButtons}>
//           <TouchableOpacity style={styles.modalButton} onPress={onClose}>
//             <Text style={styles.modalButtonText}>No</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.modalButton} onPress={onConfirm}>
//             <Text style={styles.modalButtonText}>Yes</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   </Modal>
// );

export default function SitePINScreen({ navigation }) {
  const route = useRoute();
  const { siteId } = route.params;

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
    const fetchUserData = async () => { };

    fetchUserData();
  }, []);

  useFocusEffect(React.useCallback(() => { }, []));

  // Handle text change when a digit is entered
  const handleTextChange = async (digit) => {
    if (mpin.length <= 4) {
      const newMpin = mpin + digit;
      console.log(newMpin);

      setMpin(newMpin);
      if (newMpin.length === 4) {
        setIsButtonEnabled(true);
        await verifyMPIN(newMpin);
      } else {
        setIsButtonEnabled(false);
      }
    }
  };

  const handleBackspace = () => {
    const newMpin = mpin.slice(0, -1);
    setMpin(newMpin);
    setIsButtonEnabled(newMpin.length === 4);
  };

  const renderOtpDigits = () => {
    const digits = mpin.split("");
    return Array.from({ length: 4 }).map((_, index) => (
      <View
        key={index}
        style={[
          styles.digitContainer,
          index < digits.length ? styles.filledDigit : styles.emptyDigit,
          index === digits.length ? styles.focusedDigit : null,
        ]}
      >
        <Text style={styles.digitText}>{digits[index] ? "●" : ""}</Text>
      </View>
    ));
  };

  const verifyMPIN = async (newMpin) => {
    setIsLoading(true);
    try {
      const apiUrl = `${SERVER_URL_ROASTERING}/verify/site/pin/${siteId._id}`;
      const payload = {
        PIN: newMpin,
      };
      console.log(payload);
      const response = await axios.post(apiUrl, payload, {
        withCredentials: true,
      });
      console.log("Response:", response?.data);
      if (response.data.success === true) {
        // showMessage({
        //   message: "",
        //   type: "success",
        //   position: "center",
        //   duration: 4000,
        //   backgroundColor: "green",
        //   color: "white",
        //   statusBarHeight: 35,
        //   renderCustomContent: () => (
        //     <View
        //       style={{
        //         alignItems: "center",
        //         justifyContent: "center",
        //         paddingHorizontal: 15,
        //       }}
        //     >
        //       <Icon name="check-circle-outline" size={40} color="white" />
        //       <Text
        //         style={{
        //           color: "white",
        //           fontSize: 16,
        //           marginTop: 10,
        //           textAlign: "center",
        //         }}
        //       >
        //         {response?.data?.message}
        //       </Text>
        //     </View>
        //   ),
        // });
        setMpin("");
        navigation.navigate("Checkpoints", { siteId: siteId });
      } else {
        showMessage({
          message: response?.data?.message,
          type: "danger",
          icon: "danger",
          position: "center",
          duration: 4000,
          backgroundColor: "#E35335",
          color: "white",
          statusBarHeight: 35,
          // renderCustomContent: () => (
          //   <View
          //     style={{
          //       alignItems: "center",
          //       justifyContent: "center",
          //       paddingHorizontal: 15,
          //     }}
          //   >
          //     <Icon name="close-circle-outline" size={40} color="white" />
          //     <Text
          //       style={{
          //         color: "white",
          //         fontSize: 16,
          //         marginTop: 10,
          //         textAlign: "center",
          //       }}
          //     >
          //       {response.data.message}
          //     </Text>
          //   </View>
          // ),
        });
      }
    } catch (error: any) {
      console.log("eror", error?.response?.data);
      showMessage({
        message: error?.response?.data?.message,
        type: "danger",
        icon: "danger",
        position: "center",
        duration: 4000,
        backgroundColor: "#E35335",
        color: "white",
        statusBarHeight: 35,
        //   renderCustomContent: () => (
        //     <View
        //       style={{
        //         alignItems: "center",
        //         justifyContent: "center",
        //         paddingHorizontal: 15,
        //       }}
        //     >
        //       <Icon name="close-circle-outline" size={40} color="white" />
        //       <Text
        //         style={{
        //           color: "white",
        //           fontSize: 16,
        //           marginTop: 10,
        //           textAlign: "center",
        //         }}
        //       >
        //         {error?.response?.data?.message}
        //       </Text>
        //     </View>
        //   ),
      });
    } finally {
      setIsLoading(false);
    }
  };

  function capitalizeFirstLetter(string: string): string {
    if (!string || typeof string !== "string") return "";
    return string
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* {isLoading && (
        // Full-page loader overlay
        <View style={globalStyles.loaderContainer1}>
          <ActivityIndicator size="large" color="#3C4764" />
        </View>
      )} */}
      {/* <ScrollView contentContainerStyle={styles.scrollViewContent}> */}
      {/* <View> */}
      <View style={globalStyles.overlayImageGlobal}>
        <View style={styles.logoContainer}>
          <TouchableOpacity
            style={globalStyles.backArrowSitePin}
            onPress={() => navigation.goBack()}>
            <FeatherIcon
              name="chevron-left"
              size={26}
              color="#FFFFFF"
              style={globalStyles.menuIcon}
            />
          </TouchableOpacity>

          <View style={styles.logoWrapper}>
            <Image
              source={require("../assets/images/awp_logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>
      <View style={globalStyles.whiteBox}>
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
              Enter site PIN to access checkpoints
            </CustomText>
          </View>
        </View>
        <View style={[styles.formContainer]}>
          {siteId && (
            <View style={styles.userDetailsContainer}>
              {siteId?.logo && (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: siteId.logo }}
                    style={styles.previewImage}
                  // resizeMode="contain"
                  />
                </View>
              )}
              <Text style={styles.userDetailText}>
                {capitalizeFirstLetter(siteId?.siteName)}
              </Text>
            </View>
          )}
          <CustomText style={styles.subTitleText}>
            Access checkpoints using site PIN
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

          <CustomKeyboard
            onChange={handleTextChange}
            onBackspace={handleBackspace}
            onSubmit={() => {
              if (isButtonEnabled) {
                verifyMPIN(mpin); // Call verifyMPIN only if the button is enabled
                // navigation.navigate("Checkpoints", { siteId: siteId });
              }
            }}
          />
        </View>
      </View>
      {/* </View> */}
      {/* </ScrollView> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDEFF4",
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 15,
  },
  logoWrapper: {
    flex: 1, // Pushes the logo to the center
    alignItems: 'center',
    right: 18
  },
  logoImage: {
    width: 200,
    height: 50,
    top: 12
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
    alignItems: "center",
    marginRight: 30,
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
    height: "85%",
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
    alignItems: "center",
  },
  userDetailText: {
    fontSize: 15,
    fontWeight: "bold",
    // textAlign: "center",
    color: "#333",
    marginTop: 5,
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F0F0F0",
    overflow: "hidden",
    marginRight: 12, // Space between image and text
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
