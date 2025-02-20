/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
/* eslint-disable quotes */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  BackHandler,
  Alert,
  Platform,
  Linking,
  Animated,
  Easing,
  SafeAreaView,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
  Pressable,
  RefreshControl,
  PermissionsAndroid,
} from "react-native";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useSelector } from "react-redux";
import store, { RootState } from "../../store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import io, { Socket } from "socket.io-client";
import axios from "axios";
import Toast from "react-native-simple-toast";
import SidebarUser from "../Sidebar/SidebarUser";
import FooterUser from "../Footer/FooterUser";
import {
  SERVER_URL_ROASTERING,
  SERVER_URL_ROASTERING_DOMAIN,
} from "../../Constant";
import ReactNativeRestart from "react-native-restart";
import FeatherIcon from "react-native-vector-icons/Feather";
import Icon from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";

import Cookies from "@react-native-cookies/cookies";
import CustomText from "../CustomText";
// import dayjs from 'dayjs';
// import utc from 'dayjs/plugin/utc';
// import timezone from 'dayjs/plugin/timezone';
// import advancedFormat from 'dayjs/plugin/advancedFormat';
import moment from "moment";
// import 'moment-timezone';
import { globalStyles } from "../../styles";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isoWeek from "dayjs/plugin/isoWeek";
import { FlatList } from "react-native-gesture-handler";
import CustomBottomSheet from "../CustomBottomSheet/CustomBottomSheet";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
// import { getCookieHeader } from '../../Constant';
import Ionicons from "react-native-vector-icons/Ionicons";

import NfcManager, { NfcTech } from "react-native-nfc-manager";
import CustomNFCModal from "../CustomNFCModals/CustomNFCModals";
import {
  NEXT_PUBLIC_MONITORING_OPTION_ID_DO_NOT,
  NEXT_PUBLIC_MONITORING_OPTION_ID_FIXED,
  NEXT_PUBLIC_MONITORING_OPTION_ID_INTRERWAL,
  NEXT_PUBLIC_SCAN_DISPLAY_MESSAGE,
  NEXT_PUBLIC_SCAN_EXCEPTION_MULTI_QUESTION,
  NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION,
  NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_NO,
  NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_YES,
  NEXT_PUBLIC_SCAN_LOG_ONLY,
} from "../../Constant";

import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInputMask } from 'react-native-masked-text';

const windowWidth = Dimensions.get("window").width;

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  color: string;
}
const CustomButton: React.FC<CustomButtonProps> = ({ title, onPress, color }) => {
  return (
    <TouchableOpacity style={[styles.button, { backgroundColor: color }]} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

// dayjs.extend(advancedFormat);
// dayjs.extend(utc);
// dayjs.extend(timezone);

const DATA = [
  { id: "1", title: "Activity Log", screen: "SiteActivityLog" },
  { id: "2", title: "Incident Report", screen: "IncidentReport" },
  { id: "3", title: "Maintenance Issue", screen: "MaintenanceReport" },
];

const UserHome = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeIcon, setActiveIcon] = useState<number>(0);
  const [loadingImage, setLoadingImage] = useState(false);

  const [loadingUpcoming, setLoadingUpcoming] = useState<boolean>(false);
  const [loadingFollowing, setLoadingFollowing] = useState<boolean>(false);

  //fetch states
  const [data, setData] = useState<any>([]);
  const [upcomingShift, setUpcomingShift] = useState<any>([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [followingStartDate, setFollowingStartDate] = useState(null);
  const [followingEndDate, setFollowingEndDate] = useState(null);

  const [followingShift, setFollowingShift] = useState<any>([]);
  const [uniformType, setUniformType] = useState<any>([]);
  const [nextUniformType, setNextUniformType] = useState<any>([]);

  const [shiftCount, setShiftCount] = useState<any>([]);

  const [image, setImage] = useState(null);
  const [report, setReport] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(dayjs());

  const [isEnabled, setIsEnabled] = useState(false);
  const [isFollowingEnabled, setIsFollowingEnabled] = useState(false);
  const [min, setMin] = useState(null);
  const [footerRefreshKey, setFooterRefreshKey] = useState(0);
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);

  const [isClockedIn, setIsClockedIn] = useState(false);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [checkpoints, setCheckpoints] = useState([]); 
  // for pop-up logtime
  const [isModalVisible, setModalVisible] = useState(false); // Modal visibility state
  // const [checkpointUsecase, setCheckpointUsecase] = useState(
  //   "Exception Verification"
  // );
  const [checkpointUsecase, setCheckpointUsecase] = useState<any>(null);
  const [messageToDisplay, setMessageToDisplay] = useState<any>(null);
  const [exceptionValidationData, setExceptionValidationData] = useState<{
    question: string;
    allowedRange: string;
    category: { _id: string; name: string };
  } | null>(null);
  const [missModalVisible, setMissModalVisible] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [activeTimeIndex, setActiveTimeIndex] = useState<{ checkpointIndex: number, timeIndex: number } | null>(null);
  const dummyLocations = [
    { id: '1', name: 'Checkpoint Alpha', client: 'Site A', location: 'Location A' },
    { id: '2', name: 'Checkpoint Bravo Checkpoint Bravo Checkpoint Bravo', client: 'Site B', location: 'Location B' },
    { id: '3', name: 'Checkpoint Charlie', client: 'Site C', location: 'Location C' },
    { id: '4', name: 'Checkpoint Delta', client: 'Site D', location: 'Location D' },
    { id: '5', name: 'Checkpoint Alpha', client: 'Site A', location: 'Location A' },
    { id: '6', name: 'Checkpoint Bravo', client: 'Site B', location: 'Location B' },
    { id: '7', name: 'Checkpoint Charlie', client: 'Site C', location: 'Location C' },
    { id: '8', name: 'Checkpoint Delta', client: 'Site D', location: 'Location D' },
    { id: '9', name: 'Checkpoint Alpha', client: 'Site A', location: 'Location A' },
    { id: '10', name: 'Checkpoint Bravo', client: 'Site B', location: 'Location B' },
    { id: '11', name: 'Checkpoint Charlie', client: 'Site C', location: 'Location C' },
    { id: '12', name: 'Checkpoint Delta', client: 'Site D', location: 'Location D' },
  ];
  const [timeData, setTimeData] = useState(
    checkpoints.map(() => [{ date: new Date(), showPicker: false }])
  );

  const scanIntervalRef = useRef(null); // To store the interval duration
  const variablesRef = useRef({});

  const [exceptionVerificationNo, setExceptionVerificationNo] = useState<{
    question: string;
    allowedRange: string;
    category: { _id: string; name: string };
  } | null>(null);

  const [shiftData, setShiftData] = useState({ shift: null, isUpcoming: false });

  // Simulate logTime
  // const [msgToDisplay, setMsgToDisplay] = useState<string | null>("This is a test message.."); // Simulate message
  // const [fixTime, setFixTime] = useState<string | null>("FixTime"); // Simulate message
  // const toggleSidebar = () => {
  //     setIsSidebarOpen(!isSidebarOpen);
  // };

  const [sidebarTranslateX] = useState(new Animated.Value(-windowWidth * 0.7));
  const [nfcScanningEnabled, setNfcScanningEnabled] = useState(true);
  const [tagId, setTagId] = useState<any>(null);

  const [triggerIntervalUpdate, setTriggerIntervalUpdate] = useState(false);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["70%", "90%"], []);

  const handleMissModalOpen = (shift, isUpcoming) => {
    setMissModalVisible(true);
    setShiftData({ shift, isUpcoming }); 
  };
  const handleMissModalClose = () => {
    setMissModalVisible(false);
  };
  const handleTimeChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || new Date();
    setShowPicker(Platform.OS === 'ios' ? true : false);
    if (activeTimeIndex && selectedDate) {
      const updatedData = [...timeData];
      updatedData[activeTimeIndex.checkpointIndex][activeTimeIndex.timeIndex].date = currentDate;
      setTimeData(updatedData);
      setSelectedTime(currentDate);
    }
  };
  const formatTime = (date?: Date) => {
    if (!date) return '';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  const handleAddTime = (checkpointIndex: number) => {
    const updatedData = [...timeData];
    updatedData[checkpointIndex].push({ date: new Date(), showPicker: false });
    setTimeData(updatedData);
  };
  const handleRemoveTime = (checkpointIndex: number, timeIndex: number) => {
    const updatedData = [...timeData];
    updatedData[checkpointIndex].splice(timeIndex, 1);
    setTimeData(updatedData);
  };
  const renderCheckpoint = ({ item, index }: { item: typeof checkpoints[0]; index: number }) => (
    <View style={styles.checkpointItem} key={index}>
      {/* First Row: Checkpoint Name, Add Button, and Time Input */}
      <View style={styles.firstRow}>
        {/* Checkpoint Name */}
        <Text style={styles.checkpointName}>{item.checkpointName}</Text>
        {/* Add New Time Button */}
        <TouchableOpacity style={styles.iconContainer} onPress={() => handleAddTime(index)}>
          <Icon name="pluscircleo" size={20} color="#000" />
        </TouchableOpacity>
        {/* Time Input Field for the First Row */}
        <TouchableOpacity
          style={styles.textInputTime}
          onPress={() => {
            setActiveTimeIndex({ checkpointIndex: index, timeIndex: 0 });
            // setShowPicker(true);
          }}
        >
          <TextInputMask
            type={'custom'}
            options={{
              mask: '99:99', // Time format mask
            }}
            value={formatTime(timeData[index][0]?.date)}
            onChangeText={(text) => {
              const [hours, minutes] = text.split(':');
              // Update the input field without affecting timeData if incomplete
              if (hours && minutes && hours.length === 2 && minutes.length === 2) {
                const updatedDate = new Date(timeData[index][0]?.date || new Date());
                updatedDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
                const updatedData = [...timeData];
                updatedData[index][0].date = updatedDate;
                setTimeData(updatedData);
              }
            }}
            style={styles.textInputText}
            placeholder="Select Time"
            keyboardType="numeric"
          />
        </TouchableOpacity>
      </View>
      {/* Additional Rows for Times */}
      <View style={styles.timeRowsContainer}>
        {timeData[index].slice(1).map((time, timeIndex) => (
          <View key={timeIndex + 1} style={styles.timeRow}>
            {/* Time Input Field */}
            <TouchableOpacity
              style={styles.textInputTime}
              onPress={() => {
                setActiveTimeIndex({ checkpointIndex: index, timeIndex: timeIndex + 1 });
                setShowPicker(true); // Open time picker for subsequent times
              }}
            >
              <TextInputMask
                type={'custom'}
                options={{
                  mask: '99:99', // Time format mask
                }}
                value={formatTime(time.date)}
                onChangeText={(text) => {
                  const [hours, minutes] = text.split(':');
                  const updatedDate = new Date();
                  updatedDate.setHours(parseInt(hours), parseInt(minutes));
                  const updatedData = [...timeData];
                  updatedData[index][timeIndex].date = updatedDate;
                  setTimeData(updatedData);
                }}
                style={styles.textInputText}
                placeholder="Select Time"
              />
            </TouchableOpacity>
            {/* Minus Icon to Remove Time */}
            <TouchableOpacity
              style={styles.iconContainer}
              onPress={() => handleRemoveTime(index, timeIndex + 1)}
            >
              <Icon name="minuscircleo" size={20} color="#FF0000" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      {/* DateTimePicker for Time Selection */}
      {showPicker && activeTimeIndex && (
        <DateTimePicker
          value={selectedTime || new Date()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleTimeChange} // Handle time change
        />
      )}
    </View>
  );

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleDismissModalPress = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop {...props} opacity={0.7} disappearsOnIndex={-1} />
    ),
    []
  );

  // const toggleSidebar = () => {
  //   // If the sidebar is open, close it
  //   if (isSidebarOpen) {
  //     // Define the target translation value to close the sidebar
  //     const toValue = -windowWidth * 0.7; // Adjust the sidebar width as needed

  //     // Update the sidebar position without animation
  //     sidebarTranslateX.setValue(toValue);

  //     // Update the state to indicate that the sidebar is closed
  //     setIsSidebarOpen(false);
  //   } else {
  //     // If the sidebar is closed, open it
  //     setIsSidebarOpen(true);

  //     // Define the target translation value to open the sidebar
  //     const toValue = 0; // Adjust the sidebar width as needed

  //     // Animate the sidebar translation
  //     Animated.timing(sidebarTranslateX, {
  //       toValue,
  //       duration: 300, // Adjust the duration as needed
  //       easing: Easing.linear,
  //       useNativeDriver: false,
  //     }).start();
  //   }
  // };

  const handleUnconfirmShift = (id: string) => {
    navigation.navigate("ShiftDetails", { id: id } as never);
  };
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

  function capitalizeFirstLetter(string: string): string {
    if (!string || typeof string !== "string") return ""; // Handle empty, undefined, or non-string values

    return string
      .split(" ") // Split the string into words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
      .join(" "); // Join the words back together with a space
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={globalStyles.item}
      onPress={() => {
        handleDismissModalPress(), navigation.navigate(item.screen);
      }}
    >
      <Text style={globalStyles.title}>{item.title}</Text>
    </TouchableOpacity>
  );

  const handleLogout = async () => {
    // await AsyncStorage.clear();
    // await AsyncStorage.removeItem('accessToken');
    const storedCookie = await getStoredCookie();
    const response = await axios.get(`${SERVER_URL_ROASTERING}/logout`, {
      withCredentials: true,
    });
    if (response.status === 200) {
      const accessCookie = await AsyncStorage.getItem("accessCookie");

      await Cookies.removeSessionCookies();
      AsyncStorage.removeItem("accessCookie");
      navigation.navigate("LoginPage" as never);
    }

    // console.log("response logout==>", response);
  };

  const handleViewProfile = async () => {
    navigation.navigate("ProfileDetailsUser" as never);
  };
  const getStoredCookie = async () => {
    try {
      const storedCookie = await AsyncStorage.getItem("accessCookie");
      if (storedCookie) {
        return JSON.parse(storedCookie);
      }
    } catch (error) {
      console.error("Error retrieving cookie from AsyncStorage:", error);
    }
    return null;
  };

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${SERVER_URL_ROASTERING}/me`, {
        withCredentials: true,
      });
      console.log("response me==>", response?.data);
      if (response?.status === 200) {
        setIsLoading(false);
        const data = response?.data;
        if (data?.user?.status === "active") {
          setData(data?.user);
          setImage(data?.user?.profilePhoto);
          setLoadingImage(false);
          AsyncStorage.setItem("user", JSON.stringify(data?.user));
          AsyncStorage.setItem("userId", data?.user?._id);
          fetchUpcomingShift(data?.user?._id);
        } else {
          handleLogout();
        }
      } else {
        console.error(
          "API request failed:",
          response?.status,
          response?.statusText
        );
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching admin data:", error);
    }
  }, []);

  const startRef = useRef(dayjs());
  const endRef = useRef(dayjs());

  dayjs.extend(weekOfYear);
  dayjs.extend(isoWeek);

  const getWeekRange = (week: any) => {
    const startOfWeek = week.startOf("isoWeek"); // Monday
    const endOfWeek = week.endOf("isoWeek"); // Sunday

    return {
      start: startOfWeek,
      end: endOfWeek,
    };
  };
  const { start, end } = getWeekRange(currentWeek);

  //fetch All shifts
  startRef.current = start;
  endRef.current = end;

  const fetchUpcomingShift = async (id: string) => {
    try {
      let userId = await AsyncStorage.getItem("userId");
      const response = await axios.get(
        `${SERVER_URL_ROASTERING}/get/upcomming/shift/${id}`,
        {
          withCredentials: true,
        }
      );
      console.log("response shift==>", response.data);

      if (response?.status === 200) {
        setIsLoading(false);
        const data = response?.data;
        setFooterRefreshKey((prev) => prev + 1);
        if (data?.message !== "No upcomming shift") {
          AsyncStorage.setItem("siteId", data?.shift?.siteId?._id);
          AsyncStorage.setItem("positionId", data?.shift?.positionId?._id);
          AsyncStorage.setItem("shiftStatus", data?.shift?.shiftStatus);
          setStartDate(data?.shift?.shiftStartDateTime);
          setEndDate(data?.shift?.shiftEndDateTime);
          const sortedUniforms = data?.shift?.positionId.uniform.sort(
            (a, b) => a.orderNo - b.orderNo
          );
          setUniformType(sortedUniforms);

          fetchShiftCount(userId, data?.shift?.siteId?._id);
          // handleClockIn()

          setUpcomingShift(data?.shift);
          AsyncStorage.setItem("shift", JSON.stringify(data?.shift));
          // checkShiftStatus(data?.shift);

          setFooterRefreshKey((prev) => prev + 1);
        } else {
          setUpcomingShift([]);
          setUniformType([]);
          setStartDate(null);
          setEndDate(null);
          AsyncStorage.removeItem("clockIn");
          fetchShiftCount(userId, data?.shift?.siteId?._id);
        }
        // Check if nextShift exists and store it in state
        if (data?.nextShift) {
          fetchShiftCount(userId, data?.shift?.siteId?._id);
          const sortedUniforms = data?.nextShift?.positionId.uniform.sort(
            (a, b) => a.orderNo - b.orderNo
          );
          setNextUniformType(sortedUniforms);
          setFollowingShift(data.nextShift);
          AsyncStorage.setItem("shift", JSON.stringify(data.nextShift));
          setFollowingStartDate(data.nextShift.shiftStartDateTime);
          setFollowingEndDate(data.nextShift.shiftEndDateTime);
          // Call checkShiftStatus for the next shift
          // checkShiftStatus(data.nextShift);
        } else {
          fetchShiftCount(userId, data?.shift?.siteId?._id);
          setUniformType([]);
          setFollowingShift([]);
          setFollowingStartDate(null);
          setFollowingEndDate(null);
        }
        setLoadingImage(false);
      } else {
        console.error(
          "API request failed:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching admin data:", error);
    }
  };
  const fetchShiftCount = async (id: string, siteId: string) => {
    try {
      let url = `${SERVER_URL_ROASTERING}/get/assigned/shifts/count/${id}?shiftsStartDate=${startRef.current.format(
        "YYYY-MM-DD"
      )}&shiftsEndDate=${endRef.current.format("YYYY-MM-DD")}`;

      // Append siteId to the URL if it's not null or empty
      if (siteId) {
        url += `&siteId=${siteId}`;
      }

      // Make the API call
      const response = await axios.get(url, {
        withCredentials: true,
      });
      setShiftCount(response?.data);
      AsyncStorage.setItem(
        "ScheduleCount",
        JSON.stringify(response?.data?.schedulesAndAttendanceShifts)
      );
      AsyncStorage.setItem(
        "UnconfirmCount",
        JSON.stringify(response?.data?.unconfirmedShifts)
      );
    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching admin data:", error);
    }
  };
  const clearSelectedWeek = async () => {
    try {
      await AsyncStorage.removeItem("selectedWeek");
      await AsyncStorage.removeItem("selectedUnconfirmedWeek");
      await AsyncStorage.removeItem("currentWeek");
    } catch (error) {
      console.error("Failed to clear selected week:", error);
    }
  };

  const fetchReportDetails = useCallback(async () => {
    try {
      let documentCount = 0;

      const response = await axios.get(`${SERVER_URL_ROASTERING}/get/button`, {
        withCredentials: true,
      });

      if (response?.data?.success) {
        // Extract all documents and count them
        const documents = response.data.button
          .filter(
            (item: any) =>
              Array.isArray(item.document) && item.document.length > 0
          )
          .flatMap((item: any) => {
            documentCount += item.document.length; // Add the number of documents
          });
      }
      setTotalDocuments(documentCount); // Update the total document count
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  }, []);

  // Call the API on component mount
  useEffect(() => {
    fetchReportDetails();
  }, [fetchReportDetails]);

  useFocusEffect(
    useCallback(() => {
      setCurrentWeek(dayjs());
      fetchData();
      clearSelectedWeek();
      // setActiveIcon(0);
      // Retrieve shift data from AsyncStorage
      // Retrieve shift data from AsyncStorage
      // const getShiftFromAsyncStorage = async () => {
      //   try {
      //     const storedShiftString = await AsyncStorage.getItem('ScanCheckpoint');
      //     const storedShift = storedShiftString ? JSON.parse(storedShiftString) : null;
      //     console.log("storedShift", storedShift);
      //     console.log("storedShift", storedShift._id);

      //     // Exit early if ScanCheckpoint is null
      //     if (!storedShift) {
      //       console.log('No ScanCheckpoint found, skipping clock-in...');
      //       return;
      //     }

      //     const currentShiftString = await AsyncStorage.getItem('shift');
      //     console.log("currentShiftString",currentShiftString);

      //     const currentShift = currentShiftString ? JSON.parse(currentShiftString) : null;
      //     console.log("currentShift", currentShift);
      //     console.log("currentShift", currentShift._id);

      //     const isClockInStarted = await AsyncStorage.getItem('isClockInStarted');

      //     // Proceed only if:
      //     // - No clock-in started, or
      //     // - Shifts are different
      //     if (
      //       isClockInStarted !== 'true' ||
      //       (currentShift && storedShift._id === currentShift._id)
      //     ) {
      //       console.log('Shift is different or clock-in not started, processing clock-in...');
      //       await handleClockInApi(currentShift, true);

      //       // Mark clock-in as started
      //       await AsyncStorage.setItem('isClockInStarted', 'true');
      //     } else {
      //       console.log('Same shift detected and clock-in already started, skipping clock-in...');
      //     }
      //   } catch (error) {
      //     console.error("Error retrieving shift from AsyncStorage:", error);
      //   }
      // };

      //   getShiftFromAsyncStorage();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData().then(() => {
      setIsRefreshing(false);
    });
  }, [fetchData]);

  useEffect(() => {
    // Initialize the socket.io connection
    const socket = io(SERVER_URL_ROASTERING_DOMAIN);
    // Handle socket.io events
    socket.on("connect", () => {
      console.log("Socket.io connection opened");
    });

    socket.on("publishShift", async (data) => {
      console.log("publishShift", data);

      if (data) {
        const userId = await AsyncStorage.getItem("userId");
        const siteId = await AsyncStorage.getItem("siteId");

        fetchUpcomingShift(userId);
        fetchShiftCount(userId, siteId);
      }
    });

    socket.on("editShift", async (data) => {
      if (data) {
        const userId = await AsyncStorage.getItem("userId");
        const siteId = await AsyncStorage.getItem("siteId");

        fetchUpcomingShift(userId);
        fetchShiftCount(userId, siteId);
      }
    });

    socket.on("punchIn", async (data) => {
      if (data) {
        const userId = await AsyncStorage.getItem("userId");
        const siteId = await AsyncStorage.getItem("siteId");

        fetchUpcomingShift(userId);
        fetchShiftCount(userId, siteId);
      }
    });

    socket.on("deleteShift", async (data) => {
      console.log("deleteShift", data);

      if (data) {
        const userId = await AsyncStorage.getItem("userId");
        const siteId = await AsyncStorage.getItem("siteId");

        fetchUpcomingShift(userId);
        fetchShiftCount(userId, siteId);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket.io connection closed");
    });

    // Clean up the socket.io connection when the component is unmounted
    return () => {
      socket.disconnect();
    };
  }, []);

  // Function to trigger the modal every 1 hour and 10 minutes

  const checkClockInStatus = useCallback(async () => {
    const clockInStatus = await AsyncStorage.getItem("clockIn");
    setIsClockedIn(clockInStatus === "true");
  }, []);
  useEffect(() => {
    checkClockInStatus();
  }, [isClockedIn]);

  // const handleClockIn = async (shift: any, isUpcoming: boolean) => {
  //   if (isUpcoming) setLoadingUpcoming(true);
  //   else setLoadingFollowing(true);

  //   try {
  //     let userId = await AsyncStorage.getItem("userId");
  //     const bodyData = {
  //       clockIn: true,
  //       clockInTime: moment().format("YYYY-MM-DDTHH:mm:ss[Z]"),
  //     };

  //     const response = await axios.put(
  //       `${SERVER_URL_ROASTERING}/clockin/clockout/mobile/${shift?._id}/${userId}`,
  //       JSON.stringify(bodyData),
  //       {
  //         withCredentials: true,
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     if (response?.data?.success) {
  //       fetchUpcomingShift(userId);
  //       Toast.show("Clocked in successfully!", Toast.SHORT);
  //       AsyncStorage.setItem("clockIn", "true");
  //       setIsClockedIn(true);
  //     } else {
  //       Toast.show(
  //         response?.data?.message || "An error occurred.",
  //         Toast.SHORT
  //       );
  //     }
  //   } catch (error: any) {
  //     if (error.response) {
  //       // API responded with a status code outside the range of 2xx
  //       console.error("Error response:", error.response);
  //       Toast.show(
  //         error.response.data?.message ||
  //           "Error during clock in. Please try again.",
  //         Toast.SHORT
  //       );
  //     } else if (error.request) {
  //       // Request was made but no response received
  //       console.error("Error request:", error.request);
  //       Toast.show("No response from server. Please try again.", Toast.SHORT);
  //     } else {
  //       // Something else happened
  //       console.error("Error during clock in:", error.message);
  //       Toast.show("Error during clock in. Please try again.", Toast.SHORT);
  //     }
  //   } finally {
  //     if (isUpcoming) setLoadingUpcoming(false);
  //     else setLoadingFollowing(false);
  //   }
  // };

  // Request NFC permission at runtime
  // const requestNfcPermission = async () => {
  //   if (Platform.OS === 'android') {
  //     try {
  //       const granted = await PermissionsAndroid.request(
  //         PermissionsAndroid.PERMISSIONS.NFC
  //       );
  //       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //         console.log('NFC permission granted');
  //       } else {
  //         console.log('NFC permission denied');
  //       }
  //     } catch (err) {
  //       console.warn('Permission request failed', err);
  //     }
  //   }
  // };

  // Call this function before initializing NFC
  const initNfc = async (shift: any, isUpcoming: boolean) => {
    // await requestNfcPermission();
    // Now initialize NFC
    // await NfcManager.start();
    handleNfcDiscovery(shift, isUpcoming);
  };
  const handleClockInApi = async (shift: any, isUpcoming: boolean) => {
    if (isUpcoming) setLoadingUpcoming(true);
    else setLoadingFollowing(true);

    try {
      let userId = await AsyncStorage.getItem("userId");

      const bodyData = {
        clockIn: true,
        clockInTime: moment().format("YYYY-MM-DDTHH:mm:ss[Z]"), // Local clock-in time
      };

      const response = await axios.put(
        `${SERVER_URL_ROASTERING}/clockin/clockout/mobile/${shift?._id}/${userId}`,
        JSON.stringify(bodyData),
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response?.data?.success) {
        // Extract logTime (if returned by the API) or use the local clock-in time
        // const responseLogTime =
        //   response?.data?.logTime || moment().format("HH:mm:ss");
        // setLogTime(responseLogTime); // Store the logTime

        fetchUpcomingShift(userId);
        Toast.show("Clocked in successfully!", Toast.SHORT);
        AsyncStorage.setItem("clockIn", "true");
        setIsClockedIn(true);
      } else {
        Toast.show(
          response?.data?.message || "An error occurred.",
          Toast.SHORT
        );
      }
    } catch (error: any) {
      if (error.response) {
        console.error("Error response:", error.response);
        Toast.show(
          error.response.data?.message ||
            "Error during clock in. Please try again.",
          Toast.SHORT
        );
      } else if (error.request) {
        console.error("Error request:", error.request);
        Toast.show("No response from server. Please try again.", Toast.SHORT);
      } else {
        console.error("Error during clock in:", error.message);
        Toast.show("Error during clock in. Please try again.", Toast.SHORT);
      }
    } finally {
      if (isUpcoming) setLoadingUpcoming(false);
      else setLoadingFollowing(false);
    }
  };
  const handleClockIn = async (shift: any, isUpcoming: boolean) => {
    // setModalVisible(true); // Show popup/modal
    console.log("shift?.positionId?._id", shift?.positionId?._id);
    
    const response = await axios.get(
      `${SERVER_URL_ROASTERING}/get/checkpoint/by/position?positionIds=${shift?.positionId?._id}`,
      {
        withCredentials: true,
      }
    );
    console.log("====================================");
    console.log(response.data);
    console.log("====================================");
    if (response?.data?.checkpoints?.length > 0) {
      setNfcScanningEnabled(true);
      await initNfc(shift, isUpcoming);
    } else {
      handleClockInApi(shift, isUpcoming);
    }
  };

  // useEffect(() => {
  //   let intervalId;
  //   console.log("Setting up interval with duration:", scanIntervalRef.current);

  //   if (scanIntervalRef.current) {
  //     intervalId = setInterval(() => {
  //       console.log(
  //         "Interval triggered with duration:",
  //         scanIntervalRef.current
  //       );

  //       // Use variables stored in `variablesRef`
  //       const { extraScanOptionId, messageToDisplay } = variablesRef.current;

  //       if (extraScanOptionId === NEXT_PUBLIC_SCAN_DISPLAY_MESSAGE) {
  //         setCheckpointUsecase("MessageToDisplay");
  //         setMessageToDisplay(messageToDisplay);
  //         setModalVisible(true);
  //       } else if (extraScanOptionId === NEXT_PUBLIC_SCAN_LOG_ONLY) {
  //         setCheckpointUsecase("LogTime");
  //         setModalVisible(true);
  //       }
  //     }, scanIntervalRef.current);
  //   }

  //   return () => {
  //     if (intervalId) {
  //       clearInterval(intervalId); // Cleanup on unmount or change
  //       console.log("Interval cleared");
  //     }
  //   };
  // }, [triggerIntervalUpdate]); // Depend on `triggerIntervalUpdate`

  // // Update `triggerIntervalUpdate` when scanIntervalRef changes
  // useEffect(() => {
  //   if (scanIntervalRef.current) {
  //     setTriggerIntervalUpdate((prev) => !prev); // Toggle to retrigger useEffect
  //   }
  // }, [scanIntervalRef.current]);

  // Handle NFC Discovery
  const handleNfcDiscovery = async (shift: any, isUpcoming: boolean) => {
    try {
     
      navigation.navigate("PositionDuties", { shift: shift } as never);
      handleClockInApi(shift, isUpcoming);
   
    } catch (ex: any) {
      console.warn("NFC Discovery Error:", ex.response.data.message);
      Alert.alert("NFC Error", ex.response.data.message);
      setTagId(null);
    } finally {
      NfcManager.cancelTechnologyRequest();
      setNfcScanningEnabled(false);
    }
  };

  const handleClockOutApi = async (shift: any, isUpcoming: any) => {
    try {
      // First, submit the missed checkpoints data if needed
      const formattedCheckpoints = checkpoints.map((checkpoint, index) => ({
        checkpointId: checkpoint._id,
        scanTimes: timeData[index].map((time) => moment(time.date).format("YYYY-MM-DDTHH:mm:ss[Z]")),
      }));
  
      console.log("Formatted Checkpoints:", formattedCheckpoints);
  
     
          const missedResponse = await axios.post(
            `${SERVER_URL_ROASTERING}/submit/missed/multiple`,
            { checkpoints: formattedCheckpoints }, // Pass formatted checkpoints
            {
              withCredentials: true,
              // headers: {
              //   "Content-Type": "application/json",
              // },
            }
          );
  
          if (!missedResponse?.data?.success) {
            Toast.show(missedResponse?.data?.message || "Failed to submit missed checkpoints.", Toast.SHORT);
            return; // Exit if submission fails
          }
  
      // Now proceed with the clock-out API call
      let userId = await AsyncStorage.getItem("userId");
      const bodyData = {
        clockOut: true,
        clockOutTime: moment().format("YYYY-MM-DDTHH:mm:ss[Z]"),
      };
  
      const clockOutResponse = await axios.put(
        `${SERVER_URL_ROASTERING}/clockin/clockout/mobile/${shift?._id}/${userId}`,
        JSON.stringify(bodyData),
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      if (clockOutResponse?.data?.success) {
        fetchUpcomingShift(userId);
        Toast.show("Clocked out successfully!", Toast.SHORT);
        handleMissModalClose()
        AsyncStorage.removeItem('storedCheckpoints')
        AsyncStorage.setItem("clockIn", "false");
        setIsClockedIn(false);
      } else {
        Toast.show(clockOutResponse?.data?.message || "An error occurred during clock out.", Toast.SHORT);
      }
    } catch (error: any) {
      if (error.response) {
        console.error("Error response:", error.response);
        Toast.show(error.response.data?.message || "Error during clock out. Please try again.", Toast.SHORT);
      } else if (error.request) {
        console.error("Error request:", error.request);
        Toast.show("No response from server. Please try again.", Toast.SHORT);
      } else {
        console.error("Error during clock out:", error.message);
        Toast.show("Error during clock out. Please try again.", Toast.SHORT);
      }
    } finally {
      if (isUpcoming) setLoadingUpcoming(false);
      else setLoadingFollowing(false);
    }
  };
  const handleClockOut = async (shift: any, isUpcoming: any) => {
    try {
      // Step 1: Check if any checkpoint exists in storage
      const storedCheckpoints = await AsyncStorage.getItem("storedCheckpoints");
      console.log("storedCheckpoints UserHome --->>>>", storedCheckpoints);
      
      if (storedCheckpoints) {
        const checkpoints = JSON.parse(storedCheckpoints);
  
        // If checkpoints are found, open the handleMissModalOpen modal
        if (checkpoints.length > 0) {
          if (isUpcoming) setLoadingUpcoming(false);
          else setLoadingFollowing(false);
  
          // Update timeData to match these checkpoints
          const updatedTimeData = checkpoints.map((checkpoint: any, index: number) => 
            timeData[index] || [{ date: new Date(), showPicker: false }]
          );
          setTimeData(updatedTimeData);
  
          setCheckpoints(checkpoints);
          handleMissModalOpen(shift, isUpcoming); // Open the modal for missing checkpoints
          return; // Exit the clock-out function if modal is opened
        } 
      }
  
      // If no checkpoints are found, proceed with the clock-out process
      handleClockOutApi(shift, isUpcoming);
  
      // Reset loading states
      if (isUpcoming) setLoadingUpcoming(false);
      else setLoadingFollowing(false);
  
      // Debugging logs
      console.log("Time Data during Clock-Out:", timeData);
    } catch (error) {
      console.error("Error during handleClockOut:", error);
    }
  };
  const [appVersion, setAppVersion] = useState("");
  const [backendVersion, setBackendVersion] = useState("");

  // const getAppVersion = async () => {
  //   await axios.get(`${SERVER_URL_ROASTERING}/get/versions`).then(response => {
  //     console.log('Backend Version:', response.data);
  //     setBackendVersion(response?.data?.version?.backendVersion);
  //   });
  // };

  // useEffect(() => {
  //   if (Platform.OS === 'android') {
  //     // For Android, fetch the version from the package.json
  //     import('../.././package.json').then(pkg => {
  //       setAppVersion(pkg.version);
  //     });
  //   } else {
  //     console.log('Not for IOS');
  //   }
  //   getAppVersion();
  // }, []);

  // useEffect(() => {
  //   // backendVersion.map((i: any) => {
  //   console.log('App Version:', appVersion);
  //   console.log('Backend Version:', backendVersion);

  //     if (appVersion !== backendVersion) {

  //       console.log(appVersion !== backendVersion);

  //       Alert.alert(
  //         'App Version Update',
  //         'Are you sure you want to update the app?',
  //         [
  //           {
  //             text: 'Update',
  //             onPress: () => {
  //               // Open the URL when the "Update" button is pressed
  //               // Linking.openURL(apkURL)
  //               //   .then(() => {
  //               //     // Handle success (e.g., the link was opened)
  //               //   })
  //               //   .catch(err => {
  //               //     console.error('Error opening URL:', err);
  //               //     // Handle any errors that occurred while trying to open the link
  //               //   });
  //             },
  //             style: 'default',
  //           },
  //           {
  //             text: 'Cancel',
  //             onPress: () => {},
  //             style: 'cancel',
  //           },
  //         ],
  //         {cancelable: false},
  //       );
  //     } else {
  //       console.log('else Version Matched', backendVersion);
  //       // console.log('apk url==>', i.apkURL);
  //       // const apkURL = i.apkURL;
  //     }
  //   // });
  // }, [backendVersion, appVersion]);

  useEffect(() => {
    if (Platform.OS === "android") {
      // For Android, fetch the version from the package.json
      import("../.././package.json").then((pkg) => {
        setAppVersion(pkg.version);
      });
    }
  }, []);

  // useEffect(() => {
  //   const fetchVersionsAndCompare = async () => {
  //     try {
  //       console.log('App Version:', appVersion);

  //       // Fetch the backend version from the API
  //       const response = await axios.get(
  //         `${SERVER_URL_ROASTERING}/get/versions`,
  //       );
  //       const backendVersionFromAPI = Platform.OS === 'ios' ? response?.data?.version?.iosVersion : response?.data?.version?.apkVersion;
  //       console.log('Backend Version:', backendVersionFromAPI);
  //       const playStoreUrl =
  //         'https://play.google.com/store/apps/details?id=com.activeworkforcepro.app';
  //       setBackendVersion(backendVersionFromAPI);

  //       // Compare the versions
  //       if (appVersion !== backendVersionFromAPI) {
  //         console.log('inside ', appVersion !== backendVersionFromAPI);

  //         // Continuously show the alert until the user updates
  //         Alert.alert(
  //           'App Version Update',
  //           'Your app version is outdated. You must update to continue using the app.',
  //           [
  //             {
  //               text: 'Update',
  //               onPress: () => {
  //                 // Open the URL when the "Update" button is pressed
  //                 Linking.openURL(playStoreUrl)
  //                   .then(() => {
  //                     // Handle success (e.g., the link was opened)
  //                   })
  //                   .catch(err => {
  //                     console.error('Error opening URL:', err);
  //                     // Handle any errors that occurred while trying to open the link
  //                   });
  //                 // You can also call fetchVersionsAndCompare again after some delay
  //                 // to keep checking until the app is updated.
  //               },
  //               style: 'default',
  //             },
  //           ],
  //           {cancelable: false}, // Disable dismissing the alert
  //         );
  //       } else {
  //         console.log('Version Matched', backendVersionFromAPI);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching backend version:', error);
  //     }
  //   };

  //   if (appVersion) {
  //     fetchVersionsAndCompare();
  //   }
  // }, [appVersion]);

  // Example function to convert local time to UTC ISO format
  const convertLocalToUTCISO = (localDate) => {
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const day = String(localDate.getDate()).padStart(2, "0");
    const hours = String(localDate.getHours()).padStart(2, "0");
    const minutes = String(localDate.getMinutes()).padStart(2, "0");
    const seconds = String(localDate.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
  };

  // useEffect(() => {
  const checkShiftStatus = (shift: any, min: number) => {
    const now = new Date();

    if (!shift || !shift.shiftStartDateTime || !shift.shiftEndDateTime) {
      console.log("No valid shift to check");
      return false;
    }

    const startShiftTime = new Date(shift.shiftStartDateTime);
    const endShiftTime = new Date(shift.shiftEndDateTime);

    if (isNaN(startShiftTime.getTime()) || isNaN(endShiftTime.getTime())) {
      console.error(
        "Invalid shift times:",
        shift.shiftStartDateTime,
        shift.shiftEndDateTime
      );
      return false;
    }

    const fifteenMinBefore = new Date(
      startShiftTime.getTime() - min * 60 * 1000
    );
    const convertedNow = convertLocalToUTCISO(now);

    // Check if current time is within valid clock-in range
    return (
      (convertedNow >= fifteenMinBefore.toISOString() ||
        convertedNow > startShiftTime.toISOString()) &&
      convertedNow < endShiftTime.toISOString()
    );
  };

  // Fetch min value and check shift status
  const fetchAndCheckShiftStatus = async () => {
    try {
      const response = await axios.get(SERVER_URL_ROASTERING + "/get/button", {
        withCredentials: true,
      });
  
      // Find the 'mobile' button object for min range
      const mobileMin = response.data.button.find(
        (item) => item.useFor === "mobile"
      );
  
      if (mobileMin) {
        setMin(mobileMin.range); // Set the mobile range in state
  
        if (upcomingShift) {
          setIsEnabled(checkShiftStatus(upcomingShift, mobileMin.range));
        }
  
        if (followingShift) {
          setIsFollowingEnabled(
            checkShiftStatus(followingShift, mobileMin.range)
          );
        }
  
        // Now, handle the missed-checkpoint logic based on the missedCheckpoint object
        const missedCheckpoint = response.data.button.find(
          (item) => item.name === "missed-checkpoint" && item.useFor === "mobile"
        );
  
        if (missedCheckpoint) {
          const rangeInMinutes = missedCheckpoint.range; // Time in minutes
          console.log("Missed Checkpoint Range:", rangeInMinutes);
  
          // Wait for the range time before proceeding
          setTimeout(async () => {
            console.log("Time elapsed. Proceeding with submission...");
  
            // Fetch stored checkpoints
            const storedCheckpoints = await AsyncStorage.getItem("storedCheckpoints");
            if (storedCheckpoints) {
              const checkpoints = JSON.parse(storedCheckpoints);
  
              // Iterate through checkpoints and submit each one
              for (const checkpoint of checkpoints) {
                const isSubmitting = await AsyncStorage.getItem("isSubmitting");
                if (isSubmitting !== 'true') { // Only submit if the flag is not set
                  await handleSubmit(checkpoint._id); // Call the handleSubmit function
                }
              }
            } else {
              console.log("No checkpoints found in storage.");
            }
          }, rangeInMinutes * 60 * 1000); // Convert minutes to milliseconds
        }
      }
    } catch (error) {
      console.error("Error fetching min data:", error);
    }
  };
  

  const handleSubmit = async (
    checkpointId: string,
    extraScanOptionId?: string,
    status?: string // Make status optional
  ) => {
    // Check if submission is already in progress by checking the flag in storage
    const isSubmitting = await AsyncStorage.getItem("isSubmitting");
    if (isSubmitting === 'true') return; // If submission is in progress, don't allow another submission
  
    await AsyncStorage.setItem("isSubmitting", "true"); // Set submitting flag in storage
  
    const formData = new FormData();
    formData.append("checkpointId", checkpointId);
  
    // Conditionally append extraScanOptionId if it's provided
    if (extraScanOptionId) {
      formData.append("extraScanOptions", extraScanOptionId);
    }
  
    // Conditionally append status if it's provided
    if (status) {
      formData.append("status", status);
    }
  
    try {
      const response = await axios.post(
        `${SERVER_URL_ROASTERING}/submit/checkpoint/data`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      console.log("Response submit", response.data);
  
      if (response.data.success) {
        setTagId(null); // Reset tagId or other state if submission is successful
      } else {
        Alert.alert("Error", response.data.message); // Handle error
      }
    } catch (error) {
      console.error("Error submitting data", error); // Handle fetch error
    } finally {
      await AsyncStorage.setItem("isSubmitting", "false"); // Reset the flag after submission
    }
  };
  

  // useEffect for fetching and setting up interval
  useEffect(() => {
    fetchAndCheckShiftStatus();

    const interval = setInterval(() => {
      fetchAndCheckShiftStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [upcomingShift, followingShift]);

  // Attendance conditions
  const isAttendanceEmpty =
    !upcomingShift?.attendance ||
    Object.keys(upcomingShift.attendance).length === 0;
  const hasStartTime = upcomingShift?.attendance?.startTime;
  const hasEndTime = upcomingShift?.attendance?.endTime;

  const isFollowingAttendanceEmpty =
    !followingShift?.attendance ||
    Object.keys(followingShift.attendance).length === 0;
  const hasFollowingStartTime = followingShift?.attendance?.startTime;
  const hasFollowingEndTime = followingShift?.attendance?.endTime;

  // Combine conditions for upcoming and following shifts
  const isCardEnabled =
    (!isAttendanceEmpty && hasStartTime && !hasEndTime) ||
    (!isFollowingAttendanceEmpty &&
      hasFollowingStartTime &&
      !hasFollowingEndTime);

  const handleActivityLog = () => {
    setModalVisible(false);
    navigation.navigate("SiteActivityLog" as never);
  };

  const handleIncidentReport = () => {
    setModalVisible(false);
    navigation.navigate("IncidentReport" as never);
  };

  const handleMaintenanceIssue = () => {
    setModalVisible(false);
    navigation.navigate("MaintenanceReport" as never);
  };

  return (
    <BottomSheetModalProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={"#3C4764"}
            />
          }
        >
          <View>
            <View style={globalStyles.overlayImageGlobal}>
              <View style={styles.logoContainer}>
                <Image
                  source={require("../../assets/images/awp_logo.png")}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>

              {/* <View style={styles.textContainer}> */}
              {/* <CustomText
              style={{fontSize: 25, fontWeight: 'bold', color: '#fff'}}>
              {' '}
              Dashboard
            </CustomText> */}
              {/* <TouchableOpacity
            style={styles.menuIconContainer}
            onPress={toggleSidebar}>
            <MaterialIcons
              name="menu-open"
              size={26}
              color="#FFFFFF"
              style={styles.menuIcon}
            />
          </TouchableOpacity> */}
              {/* </View> */}
            </View>
            {/* {isSidebarOpen && (
          <SidebarUser isOpen={isSidebarOpen} onClose={toggleSidebar} />
        )}
        {isSidebarOpen && (
          <Animated.View
            style={[
              styles.sidebarContainer,
              {
                transform: [{translateX: sidebarTranslateX}],
              },
            ]}>
            <SidebarUser isOpen={isSidebarOpen} onClose={toggleSidebar} />
          </Animated.View>
        )} */}

            <View style={globalStyles.whiteBox}>
              <View
                style={[
                  globalStyles.profileBlock,
                  {
                    backgroundColor: "transparent",
                    shadowColor: "none",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0,
                    shadowRadius: 0,
                    elevation: 0,
                  },
                ]}
              >
                {/* <View style={[globalStyles.profileImageContainer]}> */}
                {/* {loadingImage ? (
                <View style={globalStyles.loaderCircle}>
                  <ActivityIndicator size="large" color="#3C4764" />
                </View>
              ) : image ? (
                <Image
                  source={{uri: image + `?timestamp=${new Date().getTime()}`}}
                  resizeMode="contain"
                  style={globalStyles.profileImage}
                />
              ) : (
                <View style={globalStyles.initialsCircle}>
                  <Text style={globalStyles.initialsText}>
                    {capitalizeFirstLetter(data?.firstName?.charAt(0)) +
                      capitalizeFirstLetter(data?.lastName?.charAt(0))}
                  </Text>
                </View>
              )} */}

                <View
                  style={[
                    globalStyles.profileTextContainer,
                    {
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingHorizontal: 10,
                      alignItems: "center",
                    },
                  ]}
                >
                  <Text style={styles.helloText}>
                    Hello{" "}
                    <Text style={globalStyles.profileImageText}>
                      {capitalizeFirstLetter(data.firstName) +
                        " " +
                        capitalizeFirstLetter(data.lastName)}
                    </Text>
                  </Text>
                  {/* <Text
                  style={[
                    globalStyles.profileImageText1,
                    {flexShrink: 1, flexWrap: 'wrap', maxWidth: 300},
                  ]}>
                  {data?.email}
                </Text> */}
                  <View style={styles.buttonset}>
                    {/* <TouchableOpacity
                    onPress={handleViewProfile}
                    style={{
                      borderColor: 'red',
                      borderWidth: 1,
                      padding: 4,
                      borderRadius: 5,
                      marginRight: 10,
                    }}>
                    <Text style={styles.logout}>View Profile</Text>
                  </TouchableOpacity> */}
                    {image ? (
                      <TouchableOpacity onPress={handleViewProfile}>
                        <Image
                          source={{
                            uri: image + `?timestamp=${new Date().getTime()}`,
                          }}
                          // resizeMode="contain"
                          style={[
                            globalStyles.profileImage,
                            { height: 45, width: 45 },
                          ]}
                        />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={handleViewProfile}
                        style={[
                          globalStyles.initialsCircle,
                          { width: 45, height: 45 },
                        ]}
                      >
                        <Text style={globalStyles.initialsText}>
                          {capitalizeFirstLetter(data?.firstName?.charAt(0)) +
                            capitalizeFirstLetter(data?.lastName?.charAt(0))}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {/* <TouchableOpacity
                    onPress={handleLogout}
                    style={{
                      borderColor: 'red',
                      borderWidth: 1,
                      padding: 4,
                      borderRadius: 5,
                      marginRight: 10,
                    }}>
                    <Text style={styles.logout}>Logout</Text>
                  </TouchableOpacity> */}
                  </View>
                </View>
                {/* </View> */}
              </View>

              <View
                style={[globalStyles.centeredView, { width: "100%", flex: 0 }]}
              >
                {isLoading ? (
                  <View style={globalStyles.loaderCircle}>
                    <ActivityIndicator size="large" color="#3C4764" />
                  </View>
                ) : (
                  <View style={{ width: "100%" }}>
                    {upcomingShift && Object.keys(upcomingShift).length > 0 ? (
                      <TouchableOpacity
                        style={[
                          styles.card,
                          {
                            backgroundColor:
                              isAttendanceEmpty || (hasStartTime && hasEndTime)
                                ? "#FFF"
                                : "#d4fcd4",
                          },
                        ]}
                        onPress={() => handleUnconfirmShift(upcomingShift?._id)}
                      >
                        <View
                          style={[
                            globalStyles.headerContainer,
                            {
                              marginBottom: 10,
                              flexDirection: "row",
                              paddingVertical: 4,
                              justifyContent: "space-between",
                              alignItems: "center",
                            },
                          ]}
                        >
                          <Text style={globalStyles.headerText}>
                            {upcomingShift?.shiftStatus === "punchIn"
                              ? "SHIFT STATUS"
                              : "UPCOMING SHIFT"}
                          </Text>
                          {isEnabled &&
                          (isAttendanceEmpty ||
                            (hasStartTime && hasEndTime)) ? (
                            <TouchableOpacity
                              style={styles.clockButton}
                              onPress={() => handleClockIn(upcomingShift, true)} // Pass isUpcoming as true
                              disabled={loadingUpcoming}
                            >
                              {loadingUpcoming ? (
                                <ActivityIndicator size="small" color="#fff" />
                              ) : (
                                <>
                                  <Icon
                                    name="clockcircle"
                                    size={18}
                                    color="#fff"
                                  />
                                  <Text style={styles.clockButtonText}>
                                    Clock In
                                  </Text>
                                </>
                              )}
                            </TouchableOpacity>
                          ) : null}

                          {/* <Modal
                            transparent={true}
                            visible={isModalVisible}
                            animationType="fade"
                            onRequestClose={() => setModalVisible(false)}
                          >
                            <View style={styles.modalOverlay}>
                              <View style={styles.modalContents}>
                                <TouchableOpacity
                                  style={styles.closeIcons}
                                  onPress={() => setModalVisible(false)}
                                >
                                  <Icon
                                    name="close"
                                    size={24}
                                    color="#3C4764"
                                  />
                                </TouchableOpacity>

                                <Text style={styles.modalTitle}>
                                  Clock In Successful
                                </Text>

                                {logTime && (
                                  <Text style={styles.logTimeText}>
                                    Log Time: {logTime}
                                  </Text>
                                )}

                                <View style={styles.buttonsContainer}>
                                  <TouchableOpacity style={styles.button}>
                                    <Text style={styles.buttonText}>
                                      Activity Log
                                    </Text>
                                  </TouchableOpacity>

                                  <TouchableOpacity style={styles.button}>
                                    <Text style={styles.buttonText}>
                                      Incident Report
                                    </Text>
                                  </TouchableOpacity>

                                  <TouchableOpacity style={styles.button}>
                                    <Text style={styles.buttonText}>
                                      Maintenance Issue
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            </View>
                          </Modal> */}

                          {!isAttendanceEmpty && hasStartTime && !hasEndTime ? (
                            <TouchableOpacity
                              style={styles.clockButton}
                              onPress={() =>
                                handleClockOut(upcomingShift, true)
                              } // Pass isUpcoming as true
                              disabled={loadingUpcoming}
                            >
                              {loadingUpcoming ? (
                                <ActivityIndicator size="small" color="#fff" />
                              ) : (
                                <>
                                  <Icon
                                    name="clockcircle"
                                    size={18}
                                    color="#fff"
                                  />
                                  <Text style={styles.clockButtonText}>
                                    Clock Out
                                  </Text>
                                </>
                              )}
                            </TouchableOpacity>
                          ) : null}
                        </View>

                        <View style={styles.row}>
                          <Text style={styles.text}>Shift Date:</Text>
                          <Text style={styles.subText}>
                            {moment.utc(startDate).format("ddd, MMM Do YYYY")}
                          </Text>
                        </View>
                        <View style={styles.row}>
                          <Text style={styles.text}>Shift Time:</Text>
                          <Text style={styles.subText}>
                            {`${moment
                              .utc(startDate)
                              .format("HH:mm")} - ${moment
                              .utc(endDate)
                              .format("HH:mm")}`}
                          </Text>
                        </View>
                        <View style={styles.row}>
                          <Text style={styles.text}>Site Name:</Text>
                          <Text style={styles.subText}>
                            {capitalizeFirstLetter(
                              upcomingShift?.siteId?.siteName
                            )}
                          </Text>
                        </View>
                        <View style={styles.row}>
                          <Text style={styles.text}>Position:</Text>
                          <Text style={styles.subText}>
                            {capitalizeFirstLetter(
                              upcomingShift?.positionId?.postName
                            )}
                          </Text>
                        </View>
                        <View style={styles.row}>
                          <Text style={styles.text}>Site Address:</Text>
                          <Text style={styles.subText}>
                            {upcomingShift?.siteId?.address &&
                              `${upcomingShift?.siteId?.address}`}
                            {upcomingShift?.siteId?.city &&
                              `, ${upcomingShift?.siteId?.city}`}
                            {upcomingShift?.siteId?.state &&
                              `, ${upcomingShift?.siteId?.state}`}
                            {/* {upcomingShift?.siteId?.zipCode &&
                `, ${upcomingShift?.siteId?.zipCode}`}
              . */}
                          </Text>
                        </View>

                        {uniformType.length > 0 && (
                          <View style={styles.row}>
                            <Text style={styles.text}>Uniform Type:</Text>
                            <Text style={styles.subText}>
                              {uniformType
                                .map((uniform: any) =>
                                  capitalizeFirstLetter(uniform.uniformId.name)
                                )
                                .join(", ")}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.card,
                          { marginVertical: 10, padding: 15 },
                        ]}
                      >
                        <Text
                          style={[globalStyles.noDataText, { marginTop: 0 }]}
                        >
                          You don't have any upcoming shifts.
                        </Text>
                        <Text
                          style={[globalStyles.noDataText, { marginTop: 0 }]}
                        >
                          If you're available please contact your manager.
                        </Text>
                      </TouchableOpacity>
                    )}
                    {followingShift &&
                      Object.keys(followingShift).length > 0 && (
                        <TouchableOpacity
                          style={[
                            styles.card,
                            {
                              backgroundColor:
                                isFollowingAttendanceEmpty ||
                                (hasFollowingStartTime && hasFollowingEndTime)
                                  ? "#FFF"
                                  : "#d4fcd4",
                              top: 4,
                            },
                          ]}
                          onPress={() =>
                            handleUnconfirmShift(followingShift?._id)
                          }
                        >
                          <View
                            style={[
                              globalStyles.headerContainer,
                              {
                                marginBottom: 6,
                                flexDirection: "row",
                                paddingVertical: 4,
                                justifyContent: "space-between",
                                alignItems: "center",
                              },
                            ]}
                          >
                            <Text style={globalStyles.headerText}>
                              FOLLOWING UPCOMING SHIFT
                            </Text>
                            {isFollowingEnabled &&
                            (isFollowingAttendanceEmpty ||
                              (hasFollowingStartTime &&
                                hasFollowingEndTime)) ? (
                              <TouchableOpacity
                                style={styles.clockButton}
                                onPress={() =>
                                  handleClockIn(followingShift, false)
                                } // Pass isUpcoming as false
                                disabled={loadingFollowing}
                              >
                                {loadingFollowing ? (
                                  <ActivityIndicator
                                    size="small"
                                    color="#fff"
                                  />
                                ) : (
                                  <>
                                    <Icon
                                      name="clockcircle"
                                      size={18}
                                      color="#fff"
                                    />
                                    <Text style={styles.clockButtonText}>
                                      Clock In
                                    </Text>
                                  </>
                                )}
                              </TouchableOpacity>
                            ) : null}

                            {!isFollowingAttendanceEmpty &&
                            hasFollowingStartTime &&
                            !hasFollowingEndTime ? (
                              <TouchableOpacity
                                style={styles.clockButton}
                                onPress={() =>
                                  handleClockOut(followingShift, false)
                                } // Pass isUpcoming as false
                                disabled={loadingFollowing}
                              >
                                {loadingFollowing ? (
                                  <ActivityIndicator
                                    size="small"
                                    color="#fff"
                                  />
                                ) : (
                                  <>
                                    <Icon
                                      name="clockcircle"
                                      size={18}
                                      color="#fff"
                                    />
                                    <Text style={styles.clockButtonText}>
                                      Clock Out
                                    </Text>
                                  </>
                                )}
                              </TouchableOpacity>
                            ) : null}
                          </View>
                          <View style={styles.row}>
                            <Text style={styles.text}>Shift Date:</Text>
                            <Text style={styles.subText}>
                              {moment
                                .utc(followingStartDate)
                                .format("ddd, MMM Do YYYY")}
                            </Text>
                          </View>
                          <View style={styles.row}>
                            <Text style={styles.text}>Shift Time:</Text>
                            <Text style={styles.subText}>
                              {`${moment
                                .utc(followingStartDate)
                                .format("HH:mm")} - ${moment
                                .utc(followingEndDate)
                                .format("HH:mm")}`}
                            </Text>
                          </View>
                          <View style={styles.row}>
                            <Text style={styles.text}>Position:</Text>
                            <Text style={styles.subText}>
                              {capitalizeFirstLetter(
                                followingShift?.positionId?.postName
                              )}
                            </Text>
                          </View>
                          <View style={styles.row}>
                            <Text style={styles.text}>Site Name:</Text>
                            <Text style={styles.subText}>
                              {capitalizeFirstLetter(
                                followingShift?.siteId?.siteName
                              )}
                            </Text>
                          </View>
                          <View style={styles.row}>
                            <Text style={styles.text}>Site Address:</Text>
                            <Text style={styles.subText}>
                              {followingShift?.siteId?.address &&
                                `${followingShift?.siteId?.address}`}
                              {followingShift?.siteId?.city &&
                                `, ${followingShift?.siteId?.city}`}
                              {followingShift?.siteId?.state &&
                                `, ${followingShift?.siteId?.state}`}
                              {/* {followingShift?.siteId?.zipCode &&
                `, ${followingShift?.siteId?.zipCode}`} */}
                              {/* . */}
                            </Text>
                          </View>
                          {nextUniformType.length > 0 && (
                            <View style={styles.row}>
                              <Text style={styles.text}>Uniform Type:</Text>
                              <Text style={styles.subText}>
                                {nextUniformType
                                  .map((uniform: any) =>
                                    capitalizeFirstLetter(
                                      uniform.uniformId.name
                                    )
                                  )
                                  .join(", ")}
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      )}
                  </View>
                )}
              </View>

              <View style={[styles.iconRow]}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("ScheduleAndAttendance" as never)
                  }
                  style={[
                    styles.icon,
                    shiftCount?.schedulesAndAttendanceShifts > 0 && {
                      backgroundColor: "#D01E12", // Dark red background
                      shadowColor: "#ffbfbf", // Light red shadow
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.8,
                      shadowRadius: 6,
                      elevation: 8, // Android shadow
                    },
                  ]}
                >
                  <FontAwesome5
                    name="calendar-check"
                    size={35}
                    color={
                      shiftCount?.schedulesAndAttendanceShifts > 0
                        ? "#fff"
                        : "#D01E12"
                    }
                    style={styles.iconImage}
                  />
                  <Text
                    style={[
                      styles.iconText,
                      {
                        color:
                          shiftCount?.schedulesAndAttendanceShifts > 0
                            ? "#fff"
                            : "#000",
                        fontWeight: shiftCount?.schedulesAndAttendanceShifts
                          ? "bold"
                          : "normal",
                      },
                    ]}
                  >
                    Schedule & Attendance
                    <Text
                      style={[
                        styles.iconTextCount,
                        {
                          color:
                            shiftCount?.schedulesAndAttendanceShifts > 0
                              ? "#fff"
                              : "#D01E12",
                        },
                      ]}
                    >
                      {" "}
                      {`(${shiftCount?.schedulesAndAttendanceShifts || 0})`}
                    </Text>
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("UnconfirmedShifts" as never)
                  }
                  style={[
                    styles.icon,
                    shiftCount?.unconfirmedShifts > 0 && {
                      backgroundColor: "#D01E12", // Dark red background
                      shadowColor: "#ffbfbf", // Light red shadow
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.8,
                      shadowRadius: 6,
                      elevation: 8, // Android shadow
                    },
                  ]}
                >
                  <FontAwesome5
                    name="user-clock"
                    size={35}
                    color={
                      shiftCount?.unconfirmedShifts > 0 ? "#fff" : "#D01E12"
                    }
                    style={styles.iconImage}
                  />
                  <Text
                    style={[
                      styles.iconText,
                      {
                        color:
                          shiftCount?.unconfirmedShifts > 0 ? "#fff" : "#000",
                        fontWeight: shiftCount?.unconfirmedShifts
                          ? "bold"
                          : "normal",
                      },
                    ]}
                  >
                    Unconfirmed Shifts{" "}
                    <Text
                      style={[
                        styles.iconTextCount,
                        {
                          color:
                            shiftCount?.unconfirmedShifts > 0
                              ? "#fff"
                              : "#D01E12",
                        },
                      ]}
                    >
                      {`(${shiftCount?.unconfirmedShifts || 0})`}
                    </Text>
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  // disabled={!isCardEnabled} // Disable the card based on both upcoming and following shifts
                  onPress={() => navigation.navigate("Documents" as never)}
                  style={[
                    styles.icon,
                    // shiftCount?.documents > 0 && isCardEnabled
                    //   ?
                    {
                      backgroundColor: "#D01E12", // Dark red background
                      shadowColor: "#ffbfbf", // Light red shadow
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.8,
                      shadowRadius: 6,
                      elevation: 8, // Android shadow
                    },
                    // : {},
                  ]}
                >
                  <FontAwesome5
                    name="folder-open"
                    size={35}
                    color={
                      // shiftCount?.documents > 0 && isCardEnabled
                      //   ? "#fff"
                      //   : "#C6C6C6"
                      "#fff"
                    }
                    style={styles.iconImage}
                  />
                  <Text
                    style={[
                      styles.iconText,
                      {
                        color: "#fff",
                        // shiftCount?.documents > 0 && isCardEnabled
                        //   ? "#fff"
                        //   : "#C6C6C6",
                        fontWeight: "bold",
                        // shiftCount?.documents > 0 && isCardEnabled
                        //   ? "bold"
                        //   : "normal",
                      },
                    ]}
                  >
                    Documents {/* {isCardEnabled && ( */}
                    <Text
                      style={[
                        styles.iconTextCount,
                        {
                          color: "#fff",
                          // shiftCount?.documents > 0 && isCardEnabled
                          //   ? "#fff"
                          //   : "#D01E12",
                        },
                      ]}
                    >
                      {isClockedIn
                        ? `(${shiftCount?.documents + totalDocuments})`
                        : `(${totalDocuments})`}
                    </Text>
                    {/* )} */}
                  </Text>
                </TouchableOpacity>

                {/* <TouchableOpacity
              style={styles.icon}
              onPress={() => navigation.navigate('DeclinedShifts' as never)}>
              <Icon
                name="closecircle"
                size={40} // Adjust the size to your desired value
                color="#D01E12"
                style={styles.iconImage}
              />
              <Text style={styles.iconText}>
                Declined Shifts{' '}
                <Text
                  style={
                    styles.iconTextCount
                  }>{`(${shiftCount?.rejectedShifts})`}</Text>
              </Text>
            </TouchableOpacity> */}
              </View>
              <View style={styles.iconRow1}>
                <TouchableOpacity
                  disabled={!isCardEnabled} // Disable if attendance conditions aren't met
                  onPress={() => navigation.navigate("Reports" as never)}
                  style={styles.icon}
                >
                  <FontAwesome5
                    name="file-export"
                    size={35}
                    color={isCardEnabled ? "#D01E12" : "#C6C6C6"}
                    style={styles.iconImage}
                  />
                  <Text
                    style={[
                      styles.iconText,
                      {
                        color: isCardEnabled ? "#000" : "#C6C6C6",
                      },
                    ]}
                  >
                    My Reports
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={!isCardEnabled} // Disable if attendance conditions aren't met
                  onPress={handlePresentModalPress}
                  style={styles.icon}
                >
                  <Icon
                    name="areachart"
                    size={35}
                    color={isCardEnabled ? "#D01E12" : "#C6C6C6"}
                    style={styles.iconImage}
                  />
                  <Text
                    style={[
                      styles.iconText,
                      {
                        color: isCardEnabled ? "#000" : "#C6C6C6",
                      },
                    ]}
                  >
                    Submit a Report
                  </Text>
                </TouchableOpacity>
                {data?.role?.name !== "user" ? (
                  <TouchableOpacity
                    // Disabled condition can go here if needed
                    onPress={() => navigation.navigate("Checkpoints")}
                    style={styles.icon}
                  >
                    <MaterialIcons
                      name="my-location"
                      size={35}
                      color={"#D01E12"}
                      style={styles.iconImage}
                    />
                    <Text style={[styles.iconText]}>Checkpoints</Text>
                  </TouchableOpacity>
                ) : (
                  isClockedIn && ( // Show Position Duties only when isClockedIn is true
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("PositionDuties", {
                          shift: upcomingShift,
                        } as never)
                      }
                      style={styles.icon}
                    >
                      <MaterialCommunityIcons
                        name="human-male-board-poll"
                        size={35}
                        color={"#D01E12"}
                        style={styles.iconImage}
                      />
                      <Text style={[styles.iconText]}>Position Duties</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
              {data?.role?.name !== "user" && isClockedIn ? (
                <View style={styles.iconRow2}>
                  <TouchableOpacity
                    // disabled={!isCardEnabled} // Disable if attendance conditions aren't met
                      onPress={() =>
                        navigation.navigate("PositionDuties", {
                          shift: upcomingShift,
                        } as never)
                      }
                    style={styles.icon}
                  >
                    <MaterialCommunityIcons
                      name="human-male-board-poll"
                      size={35}
                      color={"#D01E12"}
                      style={styles.iconImage}
                    />
                    <Text style={[styles.iconText]}>Position Duties</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              <TouchableOpacity
                style={globalStyles.cancelButton}
                onPress={handleNfcDiscovery}
              >
                <Text style={globalStyles.cancelButtonText}>
                  Checkpoint Usecase
                </Text>
              </TouchableOpacity>
              <CustomNFCModal
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                checkPointUseCase={checkpointUsecase}
                onActivityLogPress={handleActivityLog}
                onIncidentReportPress={handleIncidentReport}
                onMaintenanceIssuePress={handleMaintenanceIssue}
                {...(messageToDisplay ? { messageToDisplay } : {})}
                {...(exceptionValidationData
                  ? { exceptionValidationData }
                  : {})}
              />
              <Modal
                animationType="slide"
                transparent={true}
                visible={missModalVisible}
                onRequestClose={handleMissModalClose}
              >
                <View style={styles.modalMissOverlay}>
                  <View style={styles.modalMissContent}>
                    {/* Header */}
                    <View style={styles.modalMissHeader}>
                      <Text style={styles.headerText}>You have missed following checkpoints</Text>
                      <TouchableOpacity onPress={handleMissModalClose}>
                        <Icon name="close" size={24} color="#000" />
                      </TouchableOpacity>
                    </View>
                    {/* Scrollable List */}
                    <FlatList
                      data={checkpoints}
                      keyExtractor={(item) => item.id}
                      renderItem={renderCheckpoint}
                      contentContainerStyle={styles.modalMissBody}
                    />
                    <View style={styles.buttonSubmit}>
                      <CustomButton
                        title="Check-out"
                        onPress={() => handleClockOutApi(shiftData.shift, shiftData.isUpcoming)}
                        color="#50C878"
                      />
                      {/* <Button
                        title="Submit"
                        color="#50C878"
                        onPress={() => Alert.alert('Clicked on submit')}
                      /> */}
                    </View>
                  </View>
                </View>
              </Modal>


              {/* <Modal
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
              animationType="fade">
              {Platform.OS === 'ios' ? (
                <Pressable
                  // style={globalStyles.modalBackground}
                  style={globalStyles.modalContainer}
                  onPress={() => setModalVisible(false)} // Close modal when tapping outside
                > */}
              {/* <View style={globalStyles.modalContainer}> */}
              {/* <View style={globalStyles.modalContentReport}>
                    <TouchableOpacity
                      style={globalStyles.closeButtonContact}
                      onPress={() => setModalVisible(false)}>
                      <MaterialIcons name="close" size={15} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={globalStyles.modalTitle}>Reports & Logs</Text>
                    <FlatList
                      data={DATA}
                      renderItem={renderItem}
                      keyExtractor={item => item.id}
                      contentContainerStyle={globalStyles.list}
                    />
                    <TouchableOpacity
                      style={globalStyles.cancelButton}
                      onPress={() => setModalVisible(false)}>
                      <Text style={globalStyles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View> */}
              {/* </View> */}
              {/* </Pressable>
              ) : (
                <TouchableOpacity
                  style={globalStyles.modalContainer}
                  activeOpacity={1}
                  onPressOut={() => setModalVisible(false)}>
                  <TouchableOpacity
                    style={globalStyles.modalContentReport}
                    activeOpacity={1}
                    onPress={() => { }}>
                    <TouchableOpacity
                      style={globalStyles.closeButtonContact}
                      onPress={() => setModalVisible(false)}>
                      <MaterialIcons name="close" size={15} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={globalStyles.modalTitle}>Reports & Logs</Text>
                    <FlatList
                      data={DATA}
                      renderItem={renderItem}
                      keyExtractor={item => item.id}
                      contentContainerStyle={globalStyles.list}
                    />
                    <TouchableOpacity
                      style={globalStyles.cancelButton}
                      onPress={() => setModalVisible(false)}>
                      <Text style={globalStyles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            </Modal> */}
              {/* Bottom Sheet */}
              <BottomSheetModal
                ref={bottomSheetModalRef}
                index={0}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                onDismiss={handleDismissModalPress}
              >
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    {/* Label */}
                    <Text style={styles.modalLabel}>Reports & Logs</Text>
                    {/* Close Icon */}
                    <Pressable
                      onPress={handleDismissModalPress}
                      style={styles.closeIcon}
                    >
                      <Ionicons name="close" size={28} color="grey" />
                    </Pressable>
                  </View>

                  {/* FlatList to Display Items */}
                  <FlatList
                    data={DATA}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                  />
                </View>
              </BottomSheetModal>
            </View>
          </View>
        </ScrollView>
        <FooterUser
          key={footerRefreshKey}
          activeIcon={activeIcon}
          setActiveIcon={setActiveIcon}
        />
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  gradient: {
    width: (windowWidth - 48) / 3,
    height: 120,
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    marginHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  sidebarContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: windowWidth, // Adjust the sidebar width as needed
    backgroundColor: "#fff", // Set your desired sidebar background color
    zIndex: 1, // Ensure the sidebar appears above other content
  },
  container: {
    flex: 1,
    backgroundColor: "#EDEFF4",
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  overlayImage: {
    ...StyleSheet.absoluteFillObject,
    // height: 300,
    width: "100%",
    backgroundColor: "#39445F",
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
  clockButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D01E12", // Transparent background for the outline button
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#D01E12", // Border color for the outline button
    elevation: 0, // Remove shadow effect for outline buttons
    shadowColor: "transparent", // No shadow color
    shadowOffset: { width: 0, height: 0 }, // No shadow offset
    shadowOpacity: 0, // No shadow opacity
    shadowRadius: 0, // No shadow radius
    right: 4,
  },
  clockButtonText: {
    marginLeft: 5,
    fontSize: 15,
    fontWeight: "bold",
    color: "#fff",
  },
  textContainer: {
    position: "absolute",
    top: 70,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    width: "100%",
    height: 100,
    flexDirection: "row",
  },
  titleText: {
    fontSize: 26,
    fontWeight: "500",
    textAlign: "center",
    color: "#FFFFFF",
    flex: 1,
  },
  menuIconContainer: {
    position: "absolute",
    right: 24,
    justifyContent: "center",
    alignItems: "center",
    width: 50,
    height: 50,
    top: 15,
  },

  menuIcon: {
    width: 24,
    height: 24,
  },
  helloText: {
    fontSize: 14,
    color: "#262D3F",
    textAlign: "center",
  },
  logout: {
    color: "red",
    fontWeight: "bold",
  },
  buttonset: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    // marginTop: 15,
  },
  checkout: {
    color: "green",
    fontWeight: "bold",
  },
  loaderCirclelogin: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 20,
    marginRight: 30,
  },

  cameraIcon: {
    position: "absolute",
    top: 0,
    right: 6,
    marginTop: 40,
    backgroundColor: "transparent",
  },
  cameraIcon1: {
    position: "absolute",
    top: 0,
    right: 6,
    marginTop: 40,
    backgroundColor: "transparent",
  },
  displayText: {
    fontSize: 16,
    color: "#000000",
    textAlign: "center",
    marginTop: 5,
    fontWeight: "400",
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: windowWidth,
    paddingHorizontal: 10,
    marginTop: 15,
    // top: 50
  },
  iconRow1: {
    flexDirection: "row",
    // justifyContent: 'center',
    alignItems: "center",
    width: windowWidth,
    paddingHorizontal: 10,
    paddingVertical: 10,
    // marginBottom: 50,
  },
  iconRow2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: windowWidth,
    paddingHorizontal: 10,
    marginBottom: 50,
  },

  icon: {
    width: (windowWidth - 45) / 3,
    height: 100,
    borderRadius: 8,
    backgroundColor: "white",
    marginHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: Platform.OS === "ios" ? 0.2 : 0.8,
    shadowRadius: 8,
    elevation: 6,
    padding: 10,
  },
  iconImage: {
    // width: 50,
    // height: 50,
    marginBottom: 8,
    textAlign: "center",
  },
  iconText: {
    fontSize: 12,
    color: "#262D3F",
    textAlign: "center",
    flexShrink: 1,
    // fontWeight: '600',
  },
  iconTextCount: {
    fontSize: 13,
    color: "#D01E12",
    textAlign: "center",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#FFF",
    // padding: 15,
    marginHorizontal: 15,
    borderRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
    // width: '100%',
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
    color: "#000000",
  },
  shiftTime: {
    fontSize: 14,
    marginBottom: 5,
    color: "#000000",
  },
  siteAddress: {
    fontSize: 14,
    // fontStyle: 'italic',
    marginBottom: 5,
    color: "#000000",
  },
  position: {
    fontSize: 14,
    color: "#000000",
  },
  cardTitle: {
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    paddingLeft: 15,
    paddingBottom: 6,
  },
  text: {
    width: 100,
    fontSize: 14,
    color: "#000",
    fontWeight: "bold",
    flexShrink: 0,
    // flex: 1
  },
  subText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "normal",
    flex: 1, // Take up remaining space
    flexWrap: "wrap",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3B4560",
  },
  closeIcon: {
    padding: 5,
  },
  list: {
    paddingBottom: 20, // Add padding if needed
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Transparent overlay
  },
  modalContents: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    elevation: 5, // Adds a shadow for Android
    position: "relative",
  },
  closeIcons: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
    backgroundColor: "#f1f1f1", // Light background color for the button
    borderRadius: 50,
  },
  modalMissBody: {
    flexGrow: 1, // Ensures that the FlatList grows to take available space
    padding: 15,
  },
  modalMissOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalMissContent: {
    width: '96%',
    maxHeight: '80%', // Use maxHeight to prevent it from growing beyond the screen height
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalMissHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  checkpointItem: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  firstRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // marginBottom: 10,
  },
  checkpointName: {
    fontSize: 14,
    color: '#000',
    flex: 1,
    flexWrap: 'wrap',
    marginRight: 10, // Space between name and the plus icon
  },
  timeRowsContainer: {
    flexDirection: 'column',
    width: '47%',
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  textInput: {
    flex: 1,
    height: 36,
    paddingHorizontal: 6,
    paddingVertical: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    marginLeft: 10,
    color: '#000',
    textAlign: 'center'
  },
  textInputTime: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 14,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    marginLeft: 10,
  },
  textInputText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#000',
  },
  iconContainer: {
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSubmit: {
    marginVertical: 10,
    marginHorizontal: 'auto',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: '40%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserHome;
