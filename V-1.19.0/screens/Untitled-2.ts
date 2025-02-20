/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { s as tw } from 'react-native-wind';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { login } from '../redux/authSlice';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-simple-toast';
import FooterButton from '../components/Footer/FooterButton';
import Icon from 'react-native-vector-icons/Ionicons';
import { OtpInput } from 'react-native-otp-entry';
import { SERVER_URL_ROASTERING, SERVER_URL_ROASTERING_DOMAIN } from '../Constant';
import axios from 'axios';
import Cookies from '@react-native-cookies/cookies';
import IconEI from 'react-native-vector-icons/EvilIcons';
import Feather from 'react-native-vector-icons/Feather';
import Clipboard from '@react-native-clipboard/clipboard';
import { colors, globalStyles } from '../styles';
import DeviceInfo from 'react-native-device-info';

const Login = () => {
  const windowWidth = Dimensions.get('window').width;

  let otpInputRef = useRef<number>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>({});

  const [isLoading, setIsLoading] = useState(false);
  const [focusedPhone, setFocusedPhone] = useState(false);
  const [focusedPassword, setFocusedPassword] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUsernameSubmitted, setIsUsernameSubmitted] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [prevOTP, setPrevOTP] = useState('');
  const [timer, setTimer] = useState('00:30'); // 20 seconds
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  useEffect(() => {
    const fetchDeviceInfo = async () => {
      const deviceId = DeviceInfo.getDeviceId();
      const systemName = DeviceInfo.getSystemName();
      const systemVersion = DeviceInfo.getSystemVersion();
      const model = DeviceInfo.getModel();
      const brand = DeviceInfo.getBrand();
      const uniqueId = await DeviceInfo.getUniqueId();
      const isTablet = DeviceInfo.isTablet();

      setDeviceInfo({
        deviceId,
        systemName,
        systemVersion,
        model,
        brand,
        uniqueId,
        isTablet,
      });
    };

    fetchDeviceInfo();
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const isOTP = text => {
    // Define OTP pattern: numeric and exactly 6 digits
    const otpPattern = /^\d{6}$/;
    return otpPattern.test(text);
  };

  const checkClipboard = async () => {
    const clipboardContent = await Clipboard.getString();

    if (isOTP(clipboardContent)) {
      setPrevOTP(clipboardContent);

      // Clear clipboard content after processing
    }
  };

  useEffect(() => {
    // Check clipboard content periodically
    const intervalId = setInterval(() => {
      checkClipboard();
    }, 3000); // Adjust the interval as needed

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handlePaste = async () => {
    const clipboardContent = await Clipboard.getString();
    if (clipboardContent.length === 6 && /^[0-9]+$/.test(clipboardContent)) {
      setOTP(clipboardContent);
      otpInputRef.current.setValue(clipboardContent.toString());
      handleLogin(clipboardContent);

      await Clipboard.setString('');
    }
  };

  const getTimerResend = () => {
    // Duration of countdown in seconds
    const duration = 30;
    const endTime = Date.now() + duration * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const distance = endTime - now;

      if (distance <= 0) {
        setTimer('00:00');
        setIsButtonEnabled(true);
        clearInterval(interval);
      } else {
        const minutes = Math.floor(distance / 1000 / 60);
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimer(
          `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
            2,
            '0',
          )}`,
        );
      }
    };

    updateTimer(); // Update immediately

    const interval = setInterval(updateTimer, 1000);

    // Clear the interval if the component is unmounted
    return () => clearInterval(interval);
  };

  const handleResend = () => {
    // Handle resend OTP logic here
    // Reset the countdown and disable the button
    setTimer('00:30');
    setIsButtonEnabled(false);
    handleNext();
  };

  const handleCellTextChange = async text => {
    setOTP(text);
    if (text.length === 6) {
      handleLogin(text);
    }
  };

  const clearText = () => {
    otpInputRef.current.clear();
  };

  const validatePhoneNumber = (phoneNumber: string) => {
    const phoneRegex = /^\+614\d{8}$/; // Australian mobile numbers start with +614 followed by 8 digits
    return phoneRegex.test(phoneNumber);
  };

  // Phone field validation function
  const validatePhoneNumberField = (phoneNumber: string) => {
    if (phoneNumber.trim() === '') {
      return 'Phone number is required';
    } else if (!validatePhoneNumber('+614' + phoneNumber)) {
      return 'Phone number must be 8 digits';
    }
    return '';
  };

  // Handle Next button press
  const handleNext = async () => {
    const error = validatePhoneNumberField(username);
    if (error) {
      setUsernameError(error);
    } else {
      setUsernameError('');
      try {
        setIsLoading(true);
        const response = await dispatch(login(username.toLowerCase()));
        console.log('response', response.data);
        if (response?.success === true) {
          setIsLoading(false);
          setIsUsernameSubmitted(true);
          Toast.show(response?.message, Toast.SHORT);
          getTimerResend();
        }
        if (!response) {
          Toast.show('Login failed. Please try again.', Toast.SHORT);
          return;
        }
      } catch (error) {
        setIsLoading(false);
        Toast.show(error?.response?.data?.message, Toast.LONG);
      }
    }
  };

  const handleFocusPhone = () => {
    setFocusedPhone(true);
  };

  const handleBlurPhone = () => {
    setFocusedPhone(false);
  };

  const handleFocusPassword = () => {
    setFocusedPassword(true);
  };

  const handleBlurPassword = () => {
    setFocusedPassword(false);
  };

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [username, setUsername] = useState('');
  const [otp, setOTP] = useState('');
  const [appState, setAppState] = useState(AppState.currentState);

  const parseSetCookieHeader = (setCookieHeader: any) => {
    const parts = setCookieHeader[0].split(';');
    const cookieData = parts[0].split('=');
    const cookie = {
      name: cookieData[0].trim(),
      value: cookieData[1].trim(),
      expires: '', // Initialize expires as an empty string
      path: '', // Initialize path as an empty string
      httpOnly: false, // Default to false
      secure: false, // Default to false
    };

    parts.slice(1).forEach((part: any) => {
      const [key, value] = part
        .split('=')
        .map((item: any) => item.trim().toLowerCase());

      switch (key) {
        case 'expires':
          cookie.expires = value;
          break;
        case 'path':
          cookie.path = value;
          break;
        case 'httponly':
          cookie.httpOnly = true;
          break;
        case 'secure':
          cookie.secure = true;
          break;
        default:
          break;
      }
    });

    return cookie;
  };

  const storeCookie = async (cookie: any) => {
    try {
      const expires = cookie.expires
        ? cookie.expires
        : new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toUTCString();
      await Cookies.set(SERVER_URL_ROASTERING_DOMAIN, {
        name: cookie.name,
        value: cookie.value,
        expires: expires,
        path: cookie.path || '/', // Ensure path is set, default to root if not provided
        secure: cookie.secure, // Set Secure flag
        httpOnly: cookie.httpOnly, // Set HttpOnly flag
      });

      await AsyncStorage.setItem(
        'accessCookie',
        JSON.stringify({
          ...cookie,
          expires: expires,
        }),
      );

      console.log('Cookie set successfully');
    } catch (error) {
      console.error('Error setting cookie:', error);
    }
  };

  const handleLogin = async (code: string) => {
    try {
      setIsLoading(true);
      // console.log('deviceInfo', deviceInfo);

      const apiUrl = `${SERVER_URL_ROASTERING}/verify/otp/login`;
      const payload = {
        email: username.toLowerCase(),
        otp: code ? parseInt(code) : parseInt(otp),
      };

      const response = await axios.post(apiUrl, payload);
      console.log('response', response.data);

      if (response?.data?.success === true) {
        // Access Cookie
        const setCookieHeader = response.headers['set-cookie'];

        if (setCookieHeader) {
          const cookie = parseSetCookieHeader(setCookieHeader);
          await storeCookie(cookie);
        }
      }

      if (response?.data && response?.data?.success === true) {
        const responseMe = await axios.get(`${SERVER_URL_ROASTERING}/me`, {
          // headers,
          withCredentials: true,
        });
        console.log('response me', responseMe);
        if (responseMe?.data?.success === true) {
          const apiUrl = `${SERVER_URL_ROASTERING}/device/info/${responseMe?.data?.user?._id}`;
          const payload = {
            userId: responseMe?.data?.user?._id,
            deviceId: deviceInfo?.deviceId,
            systemName: deviceInfo?.systemName,
            systemVersion: deviceInfo?.systemVersion,
            model: deviceInfo?.model,
            brand: deviceInfo?.brand,
            uniqueId: deviceInfo?.uniqueId,
            isTablet: deviceInfo?.isTablet,
          };
          console.log('payload', payload);

          const responsedevice = await axios.post(apiUrl, payload);

          Toast.show(response?.data?.message, Toast.SHORT);
          setIsUsernameSubmitted(false);
          setIsButtonEnabled(false);
          setIsLoading(false);
          navigation.navigate('UserHome' as never);
        }
      } else {
        Toast.show(response?.data?.message, Toast.SHORT);
      }
    } catch (error) {
      setIsLoading(false);
      Toast.show('Invalid or expired OTP', Toast.SHORT);
    }
  };

  // useEffect(() => {
  //   const isUsernameValid = username.trim() !== '';
  //   setIsFormValid(isUsernameValid && isPasswordValid);
  // }, [username, password]);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      setUsername('');
      // setPassword('');
      setUsernameError('');
      setPasswordError('');
    }
  }, [isFocused]);

  return (
    <KeyboardAvoidingView
      style={tw`flex-1`}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled">
        <Image
          source={require('../assets/images/home.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <View style={styles.overlayContainer}>
          <Image
            source={require('../assets/images/overlay.png')}
            style={styles.overlayImage}
            resizeMode="cover"
          />
          <View
            style={[styles.logoContainer, keyboardVisible && { bottom: 120 }]}>
            <Image
              source={require('../assets/images/awp_logo.png')}
              style={[
                styles.logoImage,
                { top: Platform.OS == 'ios' ? 200 : 200 },
              ]}
              resizeMode="contain"
            />
          </View>

          <View
            style={[styles.bottomImageContainer, keyboardVisible && { top: 50 }]}>
            <View style={styles.formContainer}>
              {!isUsernameSubmitted ? (
                <View style={styles.textContainer}>
                  <Text style={styles.titleText}>
                    Welcome to Active Workforce Pro
                  </Text>
                  <Text style={styles.subTitleText}>
                    Enter your mobile number to Sign In
                  </Text>
                </View>
              ) : null}
              {/* </View> */}
              {!isUsernameSubmitted ? (
                <View style={{ bottom: 30 }}>
                  <View style={styles.inputContainer}>
                    <Feather name="phone" size={24} color="#fff" />
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {/* Non-editable prefix */}
                      <Text style={{ color: '#fff', fontSize: 15, marginLeft: 2 }}>+614</Text>

                      {/* Editable input for phone number */}
                      <TextInput
                        placeholder="Phone Number"
                        placeholderTextColor="#ccc"
                        style={[styles.input, { marginLeft: 5 }]} // Adding space between +614 and input field
                        keyboardType="phone-pad" // Sets the phone type keyboard
                        value={username} // This is just the phone number (8 digits max)
                        onChangeText={text => {
                          // Only allow input after +614, and limit input to 8 digits
                          if (text.length <= 8) {
                            setUsername(text);
                            if (text.length !== 8) {
                              setUsernameError('Phone number must be 8 digits');
                            } else {
                              setUsernameError('');
                            }
                          }
                        }}
                        onFocus={handleFocusPhone}
                        onBlur={handleBlurPhone}
                        maxLength={8} // Only allow 8 digits for the user input
                      />
                    </View>
                  </View>
                  {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
                </View>
              ) : (
                <View
                  style={[
                    styles.textContainer,
                    keyboardVisible && { marginTop: 50 },
                  ]}>
                  <Text style={styles.titleText}>Enter OTP</Text>
                  <Text style={styles.otpText}>
                    Enter the OTP that has been sent to your email
                  </Text>
                  {/* <OTPInputView
                    containerStyle={styles.otpInputView}
                    inputCount={6}
                    textInputStyle={styles.underlineStyleBase}
                    tintColor={'#3CB371'}
                    defaultValue={otp}
                    // handleTextChange={code => setText(code)}
                    handleCellTextChange={code => handleCellTextChange(code)}
                    autoFocus={true}
                    ref={otpInputRef}
                  /> */}

                  {Platform.OS === 'ios' ? (

                    <View
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginHorizontal: 10,
                      }}>
                      <OtpInput
                        numberOfDigits={6}
                        focusColor="green"
                        // focusStickBlinkingDuration={500}
                        onTextChange={code => handleCellTextChange(code)}
                        // containerStyle={styles.otpContainer}
                        // pinCodeContainerStyle={styles.otpInputView}
                        // pinCodeTextStyle={styles.underlineStyleBase}
                        defaultValue={otp}
                        ref={otpInputRef}
                        autoFocus={true}
                        type="numeric"
                        theme={{
                          containerStyle: styles.otpContainer,
                          pinCodeContainerStyle: styles.otpInputView,
                          pinCodeTextStyle: styles.underlineStyleBase,
                          // focusStickStyle: styles.focusStick,
                          // focusedPinCodeContainerStyle: styles.activePinCodeContainer,
                        }}
                      />
                    </View>
                  ) : (
                    <OtpInput
                      numberOfDigits={6}
                      focusColor="green"
                      // focusStickBlinkingDuration={500}
                      onTextChange={code => handleCellTextChange(code)}
                      // containerStyle={styles.otpContainer}
                      // pinCodeContainerStyle={styles.otpInputView}
                      // pinCodeTextStyle={styles.underlineStyleBase}
                      defaultValue={otp}
                      ref={otpInputRef}
                      autoFocus={true}
                      type="numeric"
                      theme={{
                        containerStyle: styles.otpContainer,
                        pinCodeContainerStyle: styles.otpInputView,
                        pinCodeTextStyle: styles.underlineStyleBase,
                        // focusStickStyle: styles.focusStick,
                        // focusedPinCodeContainerStyle: styles.activePinCodeContainer,
                      }}
                    />
                  )}
                  {prevOTP && (
                    <View style={styles.otpclaerFillView}>
                      <TouchableOpacity onPress={clearText}>
                        <Text style={{ color: '#fff', fontSize: 18 }}>Clear</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handlePaste}>
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 18,
                            textAlign: 'center',
                            padding: 3,
                          }}>
                          Fill
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
              {/* Resend OTP Button */}

              <TouchableOpacity
                style={styles.button}
                onPress={isUsernameSubmitted ? handleLogin : handleNext}
                disabled={isLoading ? true : false}>
                {isLoading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isUsernameSubmitted ? 'LOG IN' : 'NEXT'}
                  </Text>
                )}
              </TouchableOpacity>

              {isUsernameSubmitted && (
                <View style={styles.resendContainer}>
                  <TouchableOpacity
                    style={[
                      styles.resendButton,
                      { opacity: isButtonEnabled ? 1 : 0.5 },
                    ]}
                    onPress={isButtonEnabled ? handleResend : () => { }}
                    disabled={!isButtonEnabled}>
                    {isButtonEnabled ? (
                      <Text
                        style={[
                          styles.resendbuttonText,
                          { textDecorationLine: 'underline' },
                        ]}>
                        Resend OTP
                      </Text>
                    ) : (
                      <Text
                        style={[
                          styles.resendbuttonText,
                          { textDecorationLine: 'none' },
                        ]}>
                        You can resend OTP in{' '}
                        <Text
                          style={{
                            color: colors.secondary,
                            fontWeight: 'bold',
                            fontSize: 18,
                            textDecorationLine: 'none', // Remove underline here
                          }}>
                          {timer}
                        </Text>
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              <Text style={styles.footerText}>
                POWERED BY ACTIVE WORKFORCE PRO
              </Text>

              {/* <View style={styles.footerContainer}>
              <FooterButton
                isUsernameSubmitted={isUsernameSubmitted}
                onPress={isUsernameSubmitted ? handleLogin : handleNext}
                // disabled={isUsernameSubmitted ? !password : !username}
                disabled={false}
              />
            </View> */}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  loginTextHeader: {
    flexDirection: 'row', // Align items horizontally
    alignItems: 'center', // Center items vertically
    justifyContent: 'center', // Center the content horizontally
    width: '100%', // Take full width of the parent container
    marginVertical: 10,
  },
  icon: {
    position: 'absolute', // Position the icon absolutely
    left: 0, // Position from the left side
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  overlayImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 150,
    height: 150,
  },
  bottomImageContainer: {
    alignItems: 'center',
    top: 27,
  },
  // bottomImage: {
  //   height: 318,
  // },
  textContainer: {
    // position: 'absolute',
    justifyContent: 'center',
    // alignItems: 'center',
    bottom: 70,
  },
  titleText: {
    fontSize: 20, // Adjust the font size as needed
    // fontWeight: 'bold', // Make the text bold
    color: '#FFF', // Text color
    textAlign: 'center', // Center the text
    fontFamily: 'Quicksand-SemiBold', // Use the Roboto font
  },
  subTitleText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    top: 10,
  },
  formContainer: {
    // position: 'absolute',
    // paddingTop: 50,
    width: '90%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: '#fff',
    padding: 10,
  },

  inputWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 70,
  },

  eyeIcon: {
    position: 'absolute',
    top: 16,
    right: 10,
    zIndex: 1,
  },

  inputBorder: {
    position: 'absolute',
    top: 0,
    left: 10,
    paddingHorizontal: 5,
    backgroundColor: '#fff',
  },
  inputPlaceholder: {
    fontSize: 16,
    color: '#808EB3',
    position: 'absolute',
    top: -12,
    left: 10,
    backgroundColor: 'white',
    paddingLeft: 4,
    paddingRight: 4,
  },
  login: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontSize: 16,
  },
  buttonImage: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    // marginTop: 5,
  },
  activePinCodeContainer: {
    color: '#000',
  },
  otpclaerFillView: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    // width: '50%',
    top: 60,
  },
  otpBtn: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 5,
    width: 50,
  },
  button: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#3C4764',
    fontSize: 15,
  },
  otpContainer: {
    top: 40,
    width: '100%',
  },
  otpInputView: {
    // top: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: 50,
  },
  underlineStyleBase: {
    // width: 43,
    // height: 45,
    color: '#000',
    backgroundColor: '#fff',
    borderRadius: 5,
    textAlign: 'center',
  },
  underlineStyleHighLighted: {
    borderColor: '#03DAC6',
  },
  otpMainText: {
    fontSize: 26, // Adjust the font size as needed
    // fontWeight: 'bold', // Make the text bold
    color: '#FFF', // Text color
    textAlign: 'center', // Center the text
    fontFamily: 'Quicksand-SemiBold',
  },
  otpText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    top: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 10,
    width: '92%',
  },
  footerText: {
    position: 'absolute',
    fontFamily: 'Roboto',
    color: '#F2F2F2',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 20.02,
    letterSpacing: 0.17,
    textTransform: 'uppercase',
    bottom: 60,
  },
  resendButton: {
    // backgroundColor: '#007BFF', // Button color
    borderRadius: 25, // Rounded corners
    paddingVertical: 10, // Vertical padding
    paddingHorizontal: 20, // Horizontal padding
    alignItems: 'center', // Center text
    justifyContent: 'center', // Center text
    // borderWidth: 1, // Border width
    // borderColor: '#0056b3', // Border color for a slight outline effect
  },
  resendbuttonText: {
    color: '#FFFFFF', // Text color
    fontSize: 16, // Font size
    fontWeight: 'bold', // Bold text,
    textDecorationLine: 'underline',
  },
  timerText: {
    color: '#888888', // Timer text color
    fontSize: 14, // Font size
    marginTop: 10, // Space above timer text
  },
  resendContainer: {
    //  top: 20
  },
});

export default Login;
