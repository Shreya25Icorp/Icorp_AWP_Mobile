/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  TextInput,
  AppState,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  ActivityIndicator,
  Button,
  Alert,
} from "react-native";
import { s as tw } from "react-native-wind";
import { useFocusEffect, useIsFocused, useNavigation } from "@react-navigation/native";
import { login } from "../redux/authSlice";
import { useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-simple-toast";
import axios from "axios";
import { SERVER_URL_ROASTERING } from "../Constant";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import { colors } from "../styles";

const UnableToLogin = () => {
  const windowWidth = Dimensions.get("window").width;

  let otpInputRef = useRef<number>(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [commentError, setCommentError] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
    setName("");
    setEmail("");
    setPhone("");
    setComment("");
    setNameError("");
    setEmailError("");
    setPhoneError("");
    setCommentError("");
  }, [])
);
  const validateName = (text) => {
    setName(text);
    if (!text) {
      setNameError("Name is required.");
    } else if (!/^[a-zA-Z\s]+$/.test(text)) {
      setNameError("Name must contain only letters.");
    } else {
      setNameError("");
    }
  };

  const validateEmail = (text) => {
    setEmail(text);
    if (!text) {
      setEmailError("Email is required.");
    } else if (!/\S+@\S+\.\S+/.test(text)) {
      setEmailError("Enter a valid email.");
    } else {
      setEmailError("");
    }
  };

  const validatePhone = (text) => {
    setPhone(text);
    if (!text) {
      setPhoneError("Phone number is required.");
    } else if (!/^\d{10}$/.test(text)) {
      setPhoneError("Phone number must be 10 digits.");
    } else {
      setPhoneError("");
    }
  };

  const validateComment = (text) => {
    setComment(text);
    if (!text) {
      setCommentError("Comment is required.");
    } else {
      setCommentError("");
    }
  };

  const handleSubmit = async () => {
    validateName(name);
    validateEmail(email);
    validatePhone(phone);
    validateComment(comment);

    // Check if any error exists
    const isFormValid =
      !nameError && !emailError && !phoneError && !commentError;

    if (isFormValid) {
      const payload = {
        name: name,
        email: email,
        mobileNumber: phone,
        comment: comment,
      };
      setIsLoading(true);
      try {
        const response = await axios.post(
          `${SERVER_URL_ROASTERING}/submit/login/issue`,
          payload,
          {
            withCredentials: true,
          }
        );

        console.log(response.data);

        if (response.status === 201) {
          setIsLoading(false);
          Alert.alert(
            response?.data?.message,
            "Your request has been sent successfully."
          );
          navigation.goBack(); // Navigate back to the previous screen
          setIsLoading(false);
        } else {
          Alert.alert("Error", response?.data?.message);
        }
      } catch (error) {
        setIsLoading(false);
        console.error(error);
        Alert.alert("Error", error?.response?.data?.message);
      }
    }
  };


  return (
    <KeyboardAvoidingView
      style={tw`flex-1`}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
      >
        <Image
          source={require("../assets/images/home.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <View style={styles.overlayContainer}>
          <Image
            source={require("../assets/images/overlay.png")}
            style={styles.overlayImage}
            resizeMode="cover"
          />

          <View style={[styles.bottomImageContainer]}>
            <View style={styles.logoTitleContainer}>
              <View style={styles.logoContainer}>
                <Image
                  source={require("../assets/images/awp_logo.png")}
                  style={[styles.logoImage,]}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.titleText}>Experiencing login issues?</Text>
                <Text style={styles.subTitleText}>
                  Please provide the details below, and our team will assist you
                  in resolving the issue.
                </Text>
              </View>
            </View>
            <View style={[styles.formContainer]}>
              <View style={styles.inputContainer}>
                <Feather name="user" size={22} color="#fff" />
                <View style={{ flexDirection: "row" }}>
                  <TextInput
                    placeholder="Name"
                    placeholderTextColor="#ccc"
                    style={[styles.input, { marginLeft: 5 }]}
                    value={name}
                    onChangeText={validateName}
                  />
                </View>
              </View>
              {nameError ? (
                <Text style={styles.errorText}>{nameError}</Text>
              ) : null}

              <View style={styles.inputContainer}>
                <Feather name="mail" size={22} color="#fff" />
                <TextInput
                  placeholder="Email"
                  placeholderTextColor="#ccc"
                  style={[styles.input, { marginLeft: 5 }]}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={validateEmail}
                />
              </View>
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}

              <View style={styles.inputContainer}>
                <Feather name="phone" size={22} color="#fff" />
                <TextInput
                  placeholder="Phone"
                  placeholderTextColor="#ccc"
                  style={[styles.input, { marginLeft: 5 }]}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={validatePhone}
                  maxLength={10}
                />
              </View>
              {phoneError ? (
                <Text style={styles.errorText}>{phoneError}</Text>
              ) : null}

              <View
                style={[
                  styles.inputContainer,
                  { alignItems: "flex-start", paddingTop: 2 },
                ]}
              >
                <Feather name="edit" size={22} color="#fff" style={{ paddingTop: Platform.OS === "ios" ? 0 : 7 }} />
                <TextInput
                  placeholder="Comment"
                  placeholderTextColor="#ccc"
                  style={[
                    styles.input,
                    {
                      marginLeft: 5,
                      height: Platform.OS === "ios" ? 100 : 'auto',
                      textAlignVertical: "top",
                    },
                  ]}
                  numberOfLines={Platform.OS === "ios" ? 0 : 5}
                  multiline
                  value={comment}
                  onChangeText={validateComment}
                />
              </View>
              {commentError ? (
                <Text style={styles.errorText}>{commentError}</Text>
              ) : null}
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#D01E12" }]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Submit</Text>
                )}
              </TouchableOpacity>
              {/* Back to Login Link */}
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("LoginPage" as never); // Navigate to LoginPage
                }} // Reset to username entry screen
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 20,
                }}
              >
                <Ionicons
                  name="chevron-back" // Left-pointing arrow icon
                  size={20}
                  color={colors.secondary} // Light green color for the icon
                  style={{ marginRight: 5 }} // Add some space between icon and text
                />
                <Text
                  style={{
                    color: colors.secondary,
                    textAlign: "center",
                  }}
                >
                  BACK TO LOGIN
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  loginTextHeader: {
    flexDirection: "row", // Align items horizontally
    alignItems: "center", // Center items vertically
    justifyContent: "center", // Center the content horizontally
    width: "100%", // Take full width of the parent container
    // marginVertical: 10,
  },
  icon: {
    position: "absolute", // Position the icon absolutely
    left: 0, // Position from the left side
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    // justifyContent: "flex-end",
  },
  overlayImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  logoTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // marginTop: Platform.OS === "ios" ? 20 : 40,
    // paddingBottom: 10,
    flexDirection: "column",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    // marginBottom: 10,
  },
  logoImage: {
    width: 150,
    height: 150,
  },
  bottomImageContainer: {
    flex: 0.9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  // bottomImage: {
  //   height: 318,
  // },
  textContainer: {
   // position: 'absolute',
   justifyContent: "center",
   // alignItems: 'center',
   bottom: 20,
  },
  titleText: {
    fontSize: 20,
    color: "#FFF",
    textAlign: "center",
    fontFamily: "Quicksand-SemiBold",
    // marginTop: 10,
  },
  subTitleText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    top: 10,
    // bottom: 20
  },
  formContainer: {
  // position: 'absolute',
    // paddingTop: 50,
    width: "100%",
    justifyContent: "center",
    // alignItems: "center",
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
    textAlign: 'center',
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
    top: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
});

export default UnableToLogin;
