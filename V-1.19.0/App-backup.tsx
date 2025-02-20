/* eslint-disable prettier/prettier */
import React, { useEffect, useRef, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider } from "react-redux";
import store, { persistor } from "./store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistGate } from "redux-persist/integration/react";
import LoadingScreen from "./screens/LoadingScreen";
import Login from "./screens/Login";
import {
  Alert,
  AppState,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  View,
} from "react-native";
import ProfileDetailsUser from "./screens/ProfileDetailsUser";
import UserHome from "./components/User/UserHome";
import axios from "axios";
import {
  SERVER_URL_ROASTERING,
  SERVER_URL_ROASTERING_DOMAIN,
} from "./Constant";
import Cookies from "@react-native-cookies/cookies";
import NetInfo from "@react-native-community/netinfo";
import UnconfirmedShifts from "./screens/UnconfirmedShifts";
import ShiftDetails from "./screens/ShiftDetails";
import ScheduleAndAttendance from "./screens/Schedule_Attendance";
import DeclinedShifts from "./screens/DeclinedShift";
import Reports from "./screens/Reports";
import ReportDetails from "./screens/ReportDetails";
import SubmitReport from "./screens/SubmitReport";
import SiteActivityLog from "./screens/SiteActivityLog";
import IncidentReport from "./screens/IncidentReport";
import MaintenanceReport from "./screens/MaintenanceReport";
import Documents from "./screens/Documents";
import FileViewer from "./components/CustomFileViewer/CustomFileViewer";
import ChangeMPINScreen from "./screens/ChangeMPINScreen";
import SetupMPINScreen from "./screens/SetupMPINScreen";
import MPINAuth from "./screens/MPINAuthScreen";
import UnableToLogin from "./screens/UnableToLogin";
import ForgotPIN from "./screens/ForgotPIN";
import ResetPIN from "./screens/ResetPIN";
import CheckPoints from "./screens/CheckPointList";
import ConfigureNFC from "./screens/ConfigureNFC";

import DeviceInfo from "react-native-device-info";
import EncryptedStorage from "react-native-encrypted-storage";
import FlashMessage from "react-native-flash-message";
import ChatScreen from "./screens/ChatScreen";
import GroupDetailsScreen from "./screens/GroupDetailsScreen";
import UserDetailsScreen from "./screens/UserDetailsScreen";
// import MPINAuthBiometric from "./screens/MPINAuth_Biometeric";

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ["activeworkforcepro://"],
  config: {
    screens: {
      UserHome: "",
      UnconfirmedShifts: "UnconfirmedShifts", // Maps to 'myapp://your-screen',
      Login: "",
      LoadingScreen: "",
      ProfileDetailsUser: "",
      ShiftDetails: "",
      ScheduleAndAttendance: "",
      DeclinedShifts: "",
      Reports: "",
      ReportDetails: "",
      SubmitReport: "",
      SiteActivityLog: "",
      IncidentReport: "",
      MaintenanceReport: "",
      Documents: "",
      FileViewer: "",
    },
  },
};

function App(): JSX.Element {
  const appState = useRef(AppState.currentState);
  const [isAppStateChanged, setAppStateChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [appVersion, setAppVersion] = useState("");
  const [backendVersion, setBackendVersion] = useState("");
  const [appVersionAPK, setAppVersionAPK] = useState("");
  const [isMPINSet, setIsMPINSet] = useState(false);
  const [isMpinSessionValid, setIsMpinSessionValid] = useState(false);

  useEffect(() => {
    const handleConnectivityChange = (state: any) => {
      if (state.isConnected) {
        checkAuthentication(); // Call checkAuthentication when network is available
      } else {
        Alert.alert(
          "No Internet Connection",
          "Please check your internet connection and try again."
        );
      }
    };

    const unsubscribe = NetInfo.addEventListener(handleConnectivityChange);

    return () => {
      unsubscribe();
    };
  }, []);

  // const getStoredCookie = async () => {
  //   try {
  //     const storedCookie = await AsyncStorage.getItem('accessCookie');
  //     if (storedCookie) {
  //       return JSON.parse(storedCookie);
  //     }
  //   } catch (error) {
  //     console.error('Error retrieving cookie from AsyncStorage:', error);
  //   }
  //   return null;
  // };

  async function checkAuthentication() {
    try {
      await AsyncStorage.getItem("accessCookie").then((cookie) => {
        const parsedCookie = JSON.parse(cookie);

        Cookies.set(SERVER_URL_ROASTERING_DOMAIN, {
          name: parsedCookie.name,
          value: parsedCookie.value,
          expires: parsedCookie.expires,
          path: parsedCookie.path || "/", // Ensure path is set, default to root if not provided
          secure: parsedCookie.secure, // Set Secure flag
          httpOnly: parsedCookie.httpOnly, // Set HttpOnly flag
        });
      });

      // Make the API call to verify user authentication
      const response = await axios.get(`${SERVER_URL_ROASTERING}/me`, {
        withCredentials: true,
      });

      if (response?.data?.user) {
        const { status, isMpinEnabled } = response.data.user;
        console.log(isMpinEnabled);

        setIsLoggedIn(status === "active");
        setIsMPINSet(isMpinEnabled);
      }
      await fetchAndCheckShiftStatus();
      setLoadingComplete(true);
    } catch (error) {
      // console.log('Error==>', error);
      setIsLoggedIn(false);
      setIsMPINSet(false);
      setLoadingComplete(true);
    }
  }
  async function fetchAndCheckShiftStatus() {
    try {
      const response = await axios.get(`${SERVER_URL_ROASTERING}/get/button`, {
        withCredentials: true,
      });

      const mpinSessionConfig = response.data.button.find(
        (item) => item.useFor === "mobile-mpin"
      );

      if (mpinSessionConfig) {
        const sessionTimeout = mpinSessionConfig.range; // E.g., 180 minutes
        const lastMpinSession = await EncryptedStorage.getItem(
          "mpinLastSession"
        );

        if (lastMpinSession) {
          const currentTime = new Date().getTime();
          const sessionElapsed =
            (currentTime - parseInt(lastMpinSession, 10)) / (1000 * 60); // Minutes elapsed

          // Update session validity based on elapsed time
          setIsMpinSessionValid(sessionElapsed < sessionTimeout);
        } else {
          setIsMpinSessionValid(false); // No session exists
        }
      }
    } catch (error) {
      console.error("Error in fetchAndCheckShiftStatus:", error);
      setIsMpinSessionValid(false);
    }
  }

  const handleAppStateChange = async (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      setAppStateChanged(true);
      await fetchAndCheckShiftStatus();
    }

    // if (nextAppState === "background") {
    //   const currentTime = new Date().getTime();
    //   await EncryptedStorage.setItem("mpinLastSession", currentTime.toString());
    // }

    // Ensure session expires if app quits
    if (nextAppState === "inactive" || nextAppState === "background") {
      const mpinLastSession = await EncryptedStorage.getItem(
        "mpinLastSession"
      );
      if (mpinLastSession) {
        // If it exists, remove it
        await EncryptedStorage.removeItem("mpinLastSession");
      }
    }

    appState.current = nextAppState;
  };

  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange);

    // Clean up the event listener
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  // useEffect(() => {
  //   const checkMPINStatus = async () => {
  //     try {
  //       const value = await EncryptedStorage.getItem('user_mpin');
  //       console.log("value",value);
  //        if(value !== null && value !== undefined && value !== ''){
  //         setIsMPINSet(true); // Update the state based on the stored value
  //        } else {
  //         setIsMPINSet(false); // Update the state based on the stored value
  //        }
  //     } catch (error) {
  //       console.error('Error checking MPIN status:', error);
  //     }
  //   };

  //   checkMPINStatus(); // Call the async function
  // }, []);

  useEffect(() => {
    if (Platform.OS === "android") {
      import("./package.json").then((pkg) => {
        setAppVersion(pkg.version);
      });
    } else if (Platform.OS === "ios") {
      const version = DeviceInfo.getVersion();
      setAppVersion(version);
    }
  }, []);

  useEffect(() => {
    const fetchVersionsAndCompare = async () => {
      try {
        const response = await axios.get(
          `${SERVER_URL_ROASTERING}/get/versions`
        );
        const backendVersionFromAPI =
          Platform.OS === "ios"
            ? response?.data?.version?.iosVersion
            : response?.data?.version?.apkVersion;
        // console.log('Backend Version:', backendVersionFromAPI);

        const playStoreUrl =
          "https://play.google.com/store/apps/details?id=com.activeworkforcepro.app";
        const appStoreUrl =
          "https://apps.apple.com/in/app/active-workforce-pro/id6670550788"; // Replace YOUR_IOS_APP_ID with your app's ID

        const storeUrl = Platform.OS === "ios" ? appStoreUrl : playStoreUrl;
        setBackendVersion(backendVersionFromAPI);
        // Compare the versions
        if (appVersion !== backendVersionFromAPI) {
          // console.log('inside ', appVersion !== backendVersionFromAPI);

          Alert.alert(
            "App Version Update",
            "Your app version is outdated. You must update to continue using the app.",
            [
              {
                text: "Update",
                onPress: () => {
                  Linking.openURL(storeUrl)
                    .then(() => { })
                    .catch((err) => {
                      console.error("Error opening URL:", err);
                    });
                },
                style: "default",
              },
            ],
            { cancelable: false } // Disable dismissing the alert
          );
        } else {
          console.log("Version Matched", backendVersionFromAPI);
        }
      } catch (error) {
        console.error("Error fetching backend version:", error);
      }
    };

    if (appVersion) {
      fetchVersionsAndCompare();
    }
  }, [appVersion]);

  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            {/* Status Bar customization */}
            <StatusBar barStyle="light-content" />

            {/* iOS custom background view for StatusBar */}
            {Platform.OS === "ios" && (
              <View style={{ height: 60, backgroundColor: "#39445F" }} />
            )}

            {/* <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}> */}
            <NavigationContainer linking={linking}>
              {isLoading ? (
                <LoadingScreen />
              ) : (
                <Stack.Navigator>
                  {loadingComplete ? (
                    isLoggedIn ? (
                      <>
                        {isMPINSet ? (
                          isAppStateChanged ? (
                            isMpinSessionValid ? (
                              <Stack.Screen
                                name="UserHome1"
                                component={UserHome}
                                options={{
                                  headerShown: false,
                                  gestureEnabled: false,
                                }}
                              />
                            ) : (
                              <Stack.Screen
                                name="MPINAuth"
                                component={MPINAuth}
                                options={{
                                  headerShown: false,
                                  gestureEnabled: false,
                                }}
                              />
                            )
                          ) : (
                            <Stack.Screen
                              name="MPINAuth"
                              component={MPINAuth}
                              options={{
                                headerShown: false,
                                gestureEnabled: false,
                              }}
                            />
                          )
                        ) : (
                          <Stack.Screen
                            name="SetupMPINScreen"
                            component={SetupMPINScreen}
                            options={{
                              headerShown: false,
                              gestureEnabled: false,
                            }}
                          />
                        )}
                      </>
                    ) : (
                      <Stack.Screen
                        name="LoginPage1"
                        component={Login}
                        options={{ headerShown: false, gestureEnabled: false }}
                      />
                    )
                  ) : (
                    <Stack.Screen
                      name="Loading"
                      component={LoadingScreen}
                      options={{ headerShown: false }}
                    />
                  )}

                  <Stack.Screen
                    name="LoginPage"
                    component={Login}
                    options={{ headerShown: false, gestureEnabled: false }}
                  />
                  <Stack.Screen
                    name="SetupMPINScreenOut"
                    component={SetupMPINScreen}
                    options={{ headerShown: false, gestureEnabled: false }}
                  />
                  <Stack.Screen
                    name="UserHome"
                    component={UserHome}
                    options={{ headerShown: false, gestureEnabled: false }}
                  />
                  <Stack.Screen
                    name="ProfileDetailsUser"
                    component={ProfileDetailsUser}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="UnconfirmedShifts"
                    component={UnconfirmedShifts}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="ShiftDetails"
                    component={ShiftDetails}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="ScheduleAndAttendance"
                    component={ScheduleAndAttendance}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="DeclinedShifts"
                    component={DeclinedShifts}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="Reports"
                    component={Reports}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="ReportDetails"
                    component={ReportDetails}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="SubmitReport"
                    component={SubmitReport}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="SiteActivityLog"
                    component={SiteActivityLog}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="IncidentReport"
                    component={IncidentReport}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="MaintenanceReport"
                    component={MaintenanceReport}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="Documents"
                    component={Documents}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="UnableToLogin"
                    component={UnableToLogin}
                    options={{ headerShown: false }}
                  />

                  <Stack.Screen
                    name="Chat"
                    component={ChatScreen}
                    options={{ headerShown: false }}
                  />

                  <Stack.Screen
                    name="GroupDetailsScreen"
                    component={GroupDetailsScreen}
                    options={{
                      headerShown: true,
                      title: "Group Details",
                    }}
                  />

                  <Stack.Screen
                    name="UserDetailsScreen"
                    component={UserDetailsScreen}
                    options={{
                      headerShown: true,
                      title: "User Details",
                    }}
                  />


                  <Stack.Screen
                    name="ChangeMPINScreen"
                    component={ChangeMPINScreen}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="FileViewer"
                    component={FileViewer}
                    options={{
                      headerShown: true,
                      title: "Document",
                      headerTintColor: "#fff",
                      headerBackTitleVisible: false,
                      headerStyle: { backgroundColor: "#39445F" },
                    }}
                  />
                  <Stack.Screen
                    name="Checkpoints"
                    component={CheckPoints}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="ConfigureNFC"
                    component={ConfigureNFC}
                    options={{
                      headerShown: true,
                      title: "",
                      headerTintColor: "#fff",
                      headerBackTitleVisible: false,
                      headerStyle: { backgroundColor: "#39445F" },
                    }}
                  />
                </Stack.Navigator>

              )}
            </NavigationContainer>
            <FlashMessage position="top" />

            {/* </SafeAreaView> */}
          </View>
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
}

export default App;
