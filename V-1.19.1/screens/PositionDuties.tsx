/* eslint-disable prettier/prettier */
/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Animated,
  SafeAreaView,
  Easing,
  RefreshControl,
  TextInput,
  Alert,
  FlatList,
} from "react-native";
import {
  StackActions,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  SERVER_URL_ROASTERING,
  SERVER_URL_ROASTERING_DOMAIN,
} from "../Constant";
import { io } from "socket.io-client";
import FeatherIcon from "react-native-vector-icons/Feather";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import CustomText from "../components/CustomText";
import Ionicons from "react-native-vector-icons/Ionicons";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isoWeek from "dayjs/plugin/isoWeek";
import FooterUser from "../components/Footer/FooterUser";
import { globalStyles } from "../styles";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import moment from "moment";
import SidebarUser from "../components/Sidebar/SidebarUser";
import ShiftCount from "../components/CustomCounter";
import IconwithText from "../components/CustomCounter";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
import CustomNFCModal from "../components/CustomNFCModals/CustomNFCModals";
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
} from "../Constant";
import { showMessage } from "react-native-flash-message";
import BackgroundTimer from 'react-native-background-timer';
import Entypo from "react-native-vector-icons/Entypo";


const windowWidth = Dimensions.get("window").width;

interface Checkpoint {
  [x: string]: any;
  specialInstructions(arg0: string, specialInstructions: any): unknown;
  images: never[];
  fixTime: any;
  checkpointMonitoringOptions: any;
  scanRequestInterval: any;
  _id: string;
  checkpointName: string;
  location: {
    name: string;
  };
  subLocation?: {
    name: string;
  };
  siteId: {
    siteName: string;
  };
}


const PositionDuties = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { shift } = route.params;

  const item = route.params?.item;
  const scanTagId = route.params?.tagId;

  // console.log('item',item);


  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeIcon, setActiveIcon] = useState<number>(1);
  // const [location, setLocation] = useState([]);
  const [userData, setUserData] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(dayjs());

  const [sidebarTranslateX] = useState(new Animated.Value(-windowWidth * 0.7));
  const [scheduleShift, setScheduleShift] = useState<any>([]);

  const [nextWeekShiftCount, setNextWeekShiftCount] = useState(0);
  const [prevWeekShiftCount, setPrevWeekShiftCount] = useState(0);
  const [isNextWeekSelected, setIsNextWeekSelected] = useState(false);
  const [currentWeekShiftCount, setCurrentWeekShiftCount] = useState(0);
  const [tagId, setTagId] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false); // Modal visibility state
  // const [checkpointUsecase, setCheckpointUsecase] = useState(
  //   "Exception Verification"
  // );
  // const [checkpointUsecase, setCheckpointUsecase] = useState<any>(null);
  // const [messageToDisplay, setMessageToDisplay] = useState<any>(null);
  // const [exceptionValidationData, setExceptionValidationData] = useState<{
  //   question: string;
  //   allowedRange: string;
  //   category: { _id: string; name: string };
  // } | null>(null);

  const [checkpointUsecase, setCheckpointUsecase] = useState<any>(null);
  const [exceptionScanOption, setExceptionScanOption] = useState("");
  const [checkPointId, setCheckPointId] = useState("");
  const [location, setLocation] = useState("");
  const [subLocation, setSubLocation] = useState("");
  const [positionId, setPositionId] = useState("");
  // console.log('location--------subLocation-----------positionId-----------', location, subLocation, positionId);

  const [messageToDisplay, setMessageToDisplay] = useState<any>(null);
  const [exceptionValidationData, setExceptionValidationData] = useState<{
    _id: string;
    question: string;
    allowedRange: string;
    category: { _id: string; name: string };
  } | null>(null);
  const [exceptionVerificationNo, setExceptionVerificationNo] = useState<{
    _id: string;
    question: string;
    allowedRange: string;
    category: { _id: string; name: string };
  } | null>(null);
  const [exceptionVerificationYes, setExceptionVerificationYes] = useState<{
    _id: string;
    question: string;
    allowedRange: string;
    category: { _id: string; name: string };
  } | null>(null);
  const [exceptionMultiQuestion, setExceptionMultiQuestion] = useState();
  const activeTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const modalIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // console.log('exceptionValidationData-----------------exceptionValidationData-------------',exceptionValidationData);

  const [isNfcScanned, setIsNfcScanned] = useState(false);
  //   }
  // };

  const [currentPage, setCurrentPage] = useState(1);
  const [clickedPage, setClickedPage] = useState(1);
  const [showPrev, setShowPrev] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [siteName, setSiteName] = useState("");
  // const [mobMin, setMobMin] = useState();
  const [mobMin, setMobMin] = useState<number | null>(null);
  const [missMin, setMissMin] = useState<number | null>(null);
  const [missMinBuffer, setMissMinBuffer] = useState<number | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isFollowingEnabled, setIsFollowingEnabled] = useState(false);
  const [upcomingShift, setUpcomingShift] = useState<any>([]);
  const [followingShift, setFollowingShift] = useState<any>([]);
  const [missedScanTimeout, setMissedScanTimeout] = useState<NodeJS.Timeout | null>(null);

  const limit = 10;

  const variablesRef = useRef({
    checkpointMonitoringOptionId: null,
    extraScanOptionId: null,
    scanRequestInterval: null,
    messageToDisplay: null,
  });

  const [triggerIntervalUpdate, setTriggerIntervalUpdate] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  // console.log('min-----min -----', min);


  // Function to scroll to the top
  const scrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${SERVER_URL_ROASTERING}/get/checkpoint/by/position?positionIds=${shift?.positionId?._id}&shiftId=${shift?._id}`,
        {
          params: {
            page,
            limit,
            ...(searchQuery?.length > 0 && { search: searchQuery }),
          },
          withCredentials: true,
        }
      );

      const newData = response.data.checkpoints || [];
      // console.log("newData----", newData);

      // if (page === 1 && !siteName) {
      //   const firstSiteName = newData[0]?.siteId?.siteName;
      //   setSiteName(firstSiteName);
      // }
      const totalItems = response.data.total || 0;
      AsyncStorage.setItem("shiftCount", JSON.stringify(totalItems));
      // const allScannedValues = response.data.checkpoints.map((checkpoint: any) => checkpoint.scanned);
      // console.log("All scanned values:", allScannedValues);
      // Example: Check if all checkpoints are scanned (scanned > 0)
      // const allScanned = response.data.checkpoints.every((checkpoint: any) => checkpoint.scanned >= checkpoint.requiredScan);
      // console.log("Are all checkpoints scanned?", allScanned);
      // AsyncStorage.setItem("scannedCount", JSON.stringify(allScanned));
      setData((prevData) => (page === 1 ? newData : [...prevData, ...newData]));
      setHasMore(page * limit < totalItems);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchQuery, shift]);

  useFocusEffect(
    useCallback(() => {
      const initialize = async () => {
        if (route.params?.shift) {
          fetchData();
        }
        const shift = await AsyncStorage.getItem('shift');
        const shiftParse = JSON.parse(shift);
        if (shiftParse) {
          setSiteName(shiftParse.siteId.siteName);
        }
      };
      initialize();
    }, [fetchData, route.params?.shift])
  );

  useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [searchQuery]);

  const sanitizeScanInterval = (scanRequestInterval: string) => {
    const sanitizedInterval = scanRequestInterval
      .replace(" - ", " ")
      .replace("-", " ");
    const intervalParts = sanitizedInterval.split(" ");
    const intervalValue = parseInt(intervalParts[0], 10);
    const intervalUnit = intervalParts[1]?.toLowerCase();

    const unitToMilliseconds = {
      second: 1000,
      seconds: 1000,
      minute: 60 * 1000,
      minutes: 60 * 1000,
      hour: 60 * 60 * 1000,
      hours: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      weeks: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      months: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000,
      years: 365 * 24 * 60 * 60 * 1000,
    };

    if (!isNaN(intervalValue) && unitToMilliseconds[intervalUnit]) {
      return intervalValue * unitToMilliseconds[intervalUnit]; // Return interval in milliseconds
    }

    return null; // Invalid interval format
  };

  const saveScanDataToStorage = async (interval: number, checkpoint: any) => {
    const dataToStore = {
      scanInterval: interval,
      checkpointId: checkpoint._id,
      extraScanOptionId: checkpoint.extraScanOptions?._id,
      messageToDisplay: "Scan timeout alert",
    };

    try {
      await AsyncStorage.setItem("scanData", JSON.stringify(dataToStore));
      console.log("Data saved to AsyncStorage:", dataToStore);
    } catch (error) {
      console.error("Error saving data to AsyncStorage:", error);
    }
  }

  const convertLocalToUTCISO = (localDate: any) => {
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const day = String(localDate.getDate()).padStart(2, "0");
    const hours = String(localDate.getHours()).padStart(2, "0");
    const minutes = String(localDate.getMinutes()).padStart(2, "0");
    const seconds = String(localDate.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
  };

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

  // const fetchAndCheckShiftStatus = async () => {
  //   try {
  //     const response = await axios.get(SERVER_URL_ROASTERING + "/get/button", {
  //       withCredentials: true,
  //     });
  //     // Find the 'mobile' button object for min range
  //     const mobileMin = response.data.button.find(
  //       (item: any) => item.useFor === "notification-reminder-mobile"

  //     );
  //     console.log('mobileMin ----', mobileMin);

  //     if (mobileMin) {
  //       setMobMin(mobileMin.range);
  //       if (upcomingShift && mobileMin.range) {
  //         setIsEnabled(checkShiftStatus(upcomingShift, mobileMin.range));
  //       }
  //       if (followingShift && mobileMin.range) {
  //         setIsFollowingEnabled(
  //           checkShiftStatus(followingShift, mobileMin.range)
  //         );
  //       }
  //     }
  //   } catch (error: any) {
  //     console.error("Error fetching min data:", error.message);
  //     if (error.response) {
  //       console.error("Response data:", error.response.data);
  //       console.error("Response status:", error.response.status);
  //     }
  //   }
  // };

  // const fetchAndCheckShiftStatusMissed = async () => {
  //   try {
  //     const response = await axios.get(SERVER_URL_ROASTERING + "/get/button", {
  //       withCredentials: true,
  //     });
  //     // Find the 'mobile' button object for min range
  //     const missedMin = response.data.button.find(
  //       (item: any) => item.name === "missed-checkpoint"
  //     );
  //     console.log('missMin ----', missedMin);

  //     if (missedMin) {
  //       setMissMin(missedMin.range);
  //       if (upcomingShift && missedMin.range) {
  //         setIsEnabled(checkShiftStatus(upcomingShift, missedMin.range));
  //       }
  //       if (followingShift && missedMin.range) {
  //         setIsFollowingEnabled(
  //           checkShiftStatus(followingShift, missedMin.range)
  //         );
  //       }
  //     }
  //   } catch (error: any) {
  //     console.error("Error fetching min data:", error.message);
  //     if (error.response) {
  //       console.error("Response data:", error.response.data);
  //       console.error("Response status:", error.response.status);
  //     }
  //   }
  // };

  // const fetchAndCheckShiftStatusMissedBufferTime = async () => {
  //   try {
  //     const response = await axios.get(SERVER_URL_ROASTERING + "/get/button", {
  //       withCredentials: true,
  //     });
  //     // Find the 'mobile' button object for min range
  //     const Buffer = response.data.button.find(
  //       (item: any) => item.name === "missed-checkpoint"
  //     );
  //     console.log('missMin buffer ----', Buffer);

  //     if (Buffer) {
  //       setMissMinBuffer(Buffer.range);
  //       if (upcomingShift && Buffer.range) {
  //         setIsEnabled(checkShiftStatus(upcomingShift, Buffer.range));
  //       }
  //       if (followingShift && Buffer.range) {
  //         setIsFollowingEnabled(
  //           checkShiftStatus(followingShift, Buffer.range)
  //         );
  //       }
  //     }
  //   } catch (error: any) {
  //     console.error("Error fetching min data:", error.message);
  //     if (error.response) {
  //       console.error("Response data:", error.response.data);
  //       console.error("Response status:", error.response.status);
  //     }
  //   }
  // };


  // useEffect(() => {
  //   fetchAndCheckShiftStatus();


  //   const interval = setInterval(() => {
  //     fetchAndCheckShiftStatus();
  //   }, 30000);

  //   return () => clearInterval(interval);
  // }, [upcomingShift, followingShift]);


  // useEffect(() => {
  //   fetchAndCheckShiftStatusMissed();

  //   const interval = setInterval(() => {
  //     fetchAndCheckShiftStatusMissed();
  //   }, 30000);

  //   return () => clearInterval(interval);
  // }, [upcomingShift, followingShift]);

  // useEffect(() => {
  //   fetchAndCheckShiftStatusMissedBufferTime();

  //   const interval = setInterval(() => {
  //     fetchAndCheckShiftStatusMissedBufferTime();
  //   }, 30000);

  //   return () => clearInterval(interval);
  // }, [upcomingShift, followingShift]);


  // const handleSubmitMissed = async (
  //   shiftId: string,
  //   checkpointId: string,
  //   positionId: string
  // ) => {
  //   try {
  //     // Set up the request body
  //     const requestBody = {
  //       shiftId,
  //       checkpointId,
  //       positionId
  //     };
  //     console.log('requestBody---', requestBody);
  //     const apiUrl = `${SERVER_URL_ROASTERING}/checkpoint/scan/reminder`;
  //     const response = await axios.post(apiUrl, requestBody, {
  //       withCredentials: true,
  //     });
  //     console.log('response---response---response---', response.data);
  //     if (response.data.success) {
  //       console.log('Missed scan successfully submitted:-------------', response.data);
  //       // if (missedScanTimeout) {
  //       //   clearTimeout(missedScanTimeout);
  //       // }
  //       // const timeout = setTimeout(() => {
  //       //   handleSubmitMissedReminder(shiftId, checkpointId, positionId);
  //       // }, 10 * 60 * 1000);
  //       // setMissedScanTimeout(timeout);
  //     } else {
  //       console.error('Failed to submit missed scan:');
  //     }
  //   } catch (error) {
  //     // Handle error in API call
  //     console.error('Error submitting missed scan:', error);
  //   }
  // };

  // const handleSubmitMissed = async (
  //   shiftId: string,
  //   checkpointId: string,
  //   positionId: string
  // ) => {
  //   try {
  //     // Set up the request body
  //     const requestBody = {
  //       shiftId,
  //       checkpointId,
  //       positionId
  //     };
  //     console.log('requestBody---', requestBody);
  //     const apiUrl = `${SERVER_URL_ROASTERING}/checkpoint/scan/reminder`;
  //     const response = await axios.post(apiUrl, requestBody, {
  //       withCredentials: true,
  //     });
  //     console.log('response---response---response---', response.data);
  //     if (response.data.success) {
  //       console.log('Missed scan successfully submitted:-------------', response.data);
  //       // Clear the timeout once handleSubmitMissed is called
  //       if (missedScanTimeout) {
  //         clearTimeout(missedScanTimeout);
  //         setMissedScanTimeout(null); // Reset the timer state
  //       }
  //     } else {
  //       console.error('Failed to submit missed scan:');
  //     }
  //   } catch (error) {
  //     // Handle error in API call
  //     console.error('Error submitting missed scan:', error);
  //   }
  // };


  const handleSubmitMissed = async (
    shiftId: string,
    checkpointId: string,
    positionId: string,
    isNFCSuccess: boolean
  ) => {
    try {
      const requestBody = { shiftId, checkpointId, positionId };
      console.log("requestBody---", requestBody);
      const apiUrl = `${SERVER_URL_ROASTERING}/checkpoint/scan/reminder`;

      const response = await axios.post(apiUrl, requestBody, {
        withCredentials: true,
      });
      console.log("response---", response.data);

      if (response.data.success) {
        console.log("Missed scan successfully submitted.-------");

        // If NFC is not scanned (i.e., isNFCSuccess is false), schedule reminder after 5 minutes
        console.log('isNFCSuccess---', isNFCSuccess);

        if (!isNFCSuccess) {
          console.log("NFC scan not successful. Scheduling handleSubmitMissedReminder...");

          // Schedule handleSubmitMissedReminder after 5 minutes
          BackgroundTimer.setTimeout(() => {
            console.log("Calling handleSubmitMissedReminder...");
            handleSubmitMissedReminder(shiftId, checkpointId, positionId);

            // After 5 more minutes, if NFC is still not scanned, call handleSubmitMissedAPI
            BackgroundTimer.setTimeout(() => {
              console.log("5 minutes passed after handleSubmitMissedReminder. Calling handleSubmitMissedAPI...------------");
              handleSubmitMissedAPI(shiftId, checkpointId, positionId);
            }, missMin || 5 * 60 * 1000); // 5 more minutes for checking NFC scan status
          }, missMinBuffer || 5 * 60 * 1000); // 5 minutes for the first reminder
        }
      }
    } catch (error) {
      console.error("Error submitting missed scan:", error);
    }
  };

  const handleSubmitMissedReminder = async (
    shiftId: string,
    checkpointId: string,
    positionId: string
  ) => {
    try {
      // Set up the request body
      const requestBody = {
        shiftId,
        checkpointId,
        positionId
      };
      console.log('requestBody---', requestBody);
      const apiUrl = `${SERVER_URL_ROASTERING}/checkpoint/scan/missed`;
      const response = await axios.post(apiUrl, requestBody, {
        withCredentials: true,
      });
      console.log('response---response---response---', response.data);
      if (response.data.success) {
        console.log('handle Submit Missed Reminder successfully submitted:-------------', response.data);
        // Clear the timeout once handleSubmitMissed is called
        if (missedScanTimeout) {
          clearTimeout(missedScanTimeout);
          setMissedScanTimeout(null); // Reset the timer state
        }
      } else {
        console.error('Failed to submit missed scan:');
      }
    } catch (error) {
      // Handle error in API call
      console.error('Error submitting missed scan:', error);
    }
  };

  const handleSubmitMissedAPI = async (
    shiftId: string,
    checkpointId: string,
    positionId: string
  ) => {
    try {
      // Set up the request body
      const requestBody = {
        shiftId,
        checkpointId,
        positionId
      };
      console.log('requestBody---', requestBody);
      const apiUrl = `${SERVER_URL_ROASTERING}/store/missed/interval/data`;
      const response = await axios.post(apiUrl, requestBody, {
        withCredentials: true,
      });
      console.log('response---response---response---', response.data);
      if (response.data.success) {
        console.log('Missed scan api successfully submitted:------', response.data);
      } else {
        console.error('Failed to submit missed scan api:');
      }
    } catch (error) {
      // Handle error in API call
      console.error('Error submitting missed scan api:', error);
    }
  };


  // const handleSubmitMissed = async (
  //   shiftId: string,
  //   checkpointId: string,
  //   positionId: string,
  //   isNFCSuccess: boolean
  // ) => {
  //   try {
  //     const requestBody = { shiftId, checkpointId, positionId };
  //     console.log("requestBody---", requestBody);
  //     const apiUrl = `${SERVER_URL_ROASTERING}/checkpoint/scan/reminder`;

  //     const response = await axios.post(apiUrl, requestBody, {
  //       withCredentials: true,
  //     });
  //     console.log("response---", response.data);

  //     if (response.data.success) {
  //       console.log("Missed scan successfully submitted.-------");

  //       // If NFC is not scanned (i.e., isNFCSuccess is false), schedule reminder after 5 minutes
  //       console.log('isNFCSuccess---',isNFCSuccess);

  //       if (!isNFCSuccess) {
  //         console.log("NFC scan not successful. Scheduling handleSubmitMissedReminder...");

  //         BackgroundTimer.setTimeout(() => {
  //           console.log("Calling handleSubmitMissedReminder...");
  //           handleSubmitMissedReminder(shiftId, checkpointId, positionId);
  //         }, 5 * 60 * 1000); // 5 minutes
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error submitting missed scan:", error);
  //   }
  // };



  // const handleSubmitMissedReminder = async (
  //   shiftId: string,
  //   checkpointId: string,
  //   positionId: string
  // ) => {
  //   try {
  //     // Set up the request body
  //     const requestBody = {
  //       shiftId,
  //       checkpointId,
  //       positionId
  //     };
  //     console.log('requestBody---', requestBody);
  //     const apiUrl = `${SERVER_URL_ROASTERING}/checkpoint/scan/missed`;
  //     const response = await axios.post(apiUrl, requestBody, {
  //       withCredentials: true,
  //     });
  //     console.log('response---response---response---', response.data);
  //     if (response.data.success) {
  //       console.log('handle Submit Missed Reminder successfully submitted:-------------', response.data);
  //       // Clear the timeout once handleSubmitMissed is called
  //       if (missedScanTimeout) {
  //         clearTimeout(missedScanTimeout);
  //         setMissedScanTimeout(null); // Reset the timer state
  //       }
  //     } else {
  //       console.error('Failed to submit missed scan:');
  //     }
  //   } catch (error) {
  //     // Handle error in API call
  //     console.error('Error submitting missed scan:', error);
  //   }
  // };


  // // const handleSubmitMissed = async (
  // //   shiftId: string,
  // //   checkpointId: string,
  // //   positionId: string
  // // ) => {
  // //   try {
  // //     // Set up the request body
  // //     const requestBody = {
  // //       shiftId,
  // //       checkpointId,
  // //       positionId
  // //     };
  // //     console.log('requestBody---', requestBody);
  // //     const apiUrl = `${SERVER_URL_ROASTERING}/checkpoint/scan/reminder`;
  // //     const response = await axios.post(apiUrl, requestBody, {
  // //       withCredentials: true,
  // //     });
  // //     console.log('response---response---response---', response.data);

  // //     if (response.data.success) {
  // //       console.log('Missed scan successfully submitted:', response.data);

  // //       // Start the timeout for missed scan API after 5 minutes
  // //       if (missedScanTimeout) {
  // //         clearTimeout(missedScanTimeout);
  // //       }
  // //       const timeout = setTimeout(() => {
  // //         handleSubmitMissedAPI(shiftId, checkpointId, positionId);
  // //       }, 5 * 60 * 1000);
  // //       setMissedScanTimeout(timeout);
  // //     } else {
  // //       console.error('Failed to submit missed scan:');
  // //     }
  // //   } catch (error) {
  // //     console.error('Error submitting missed scan:', error);
  // //   }
  // // };

  // // const handleSubmitMissedAPI = async (
  // //   shiftId: string,
  // //   checkpointId: string,
  // //   positionId: string
  // // ) => {
  // //   try {
  // //     // Set up the request body
  // //     const requestBody = {
  // //       shiftId,
  // //       checkpointId,
  // //       positionId
  // //     };
  // //     console.log('requestBody---', requestBody);
  // //     const apiUrl = `${SERVER_URL_ROASTERING}/store/missed/interval/data`;
  // //     const response = await axios.post(apiUrl, requestBody, {
  // //       withCredentials: true,
  // //     });
  // //     console.log('response---response---response---', response.data);
  // //     if (response.data.success) {
  // //       console.log('Missed scan API successfully submitted:--------------------', response.data);
  // //     } else {
  // //       console.error('Failed to submit missed scan API:');
  // //     }
  // //   } catch (error) {
  // //     console.error('Error submitting missed scan API:', error);
  // //   }
  // // };


  // const handleSubmitMissedAPI = async (
  //   shiftId: string,
  //   checkpointId: string,
  //   positionId: string
  // ) => {
  //   try {
  //     // Set up the request body
  //     const requestBody = {
  //       shiftId,
  //       checkpointId,
  //       positionId
  //     };
  //     console.log('requestBody---', requestBody);
  //     const apiUrl = `${SERVER_URL_ROASTERING}/store/missed/interval/data`;
  //     const response = await axios.post(apiUrl, requestBody, {
  //       withCredentials: true,
  //     });
  //     console.log('response---response---response---', response.data);
  //     if (response.data.success) {
  //       console.log('Missed scan api successfully submitted:------', response.data);
  //     } else {
  //       console.error('Failed to submit missed scan api:');
  //     }
  //   } catch (error) {
  //     // Handle error in API call
  //     console.error('Error submitting missed scan api:', error);
  //   }
  // };





  // Function to load more data when user reaches end of list

  const loadMoreItems = () => {
    // if (isLoading || !hasMore) return;
    // setPage((prevPage) => prevPage + 1);
    if (!isLoading && hasMore) {
      setPage((prevPage) => prevPage + 1);
      console.log("====================================");
      console.log("page load more-->>", page);
      console.log("====================================");
    }
  };

  const onEndReached = () => {
    if (!isLoading && hasMore) {
      console.log("====================================");
      console.log("is load more called");
      console.log("====================================");
      loadMoreItems();
      // onEndReachedCalledDuringMomentum = true;
    }
  };

  const handlePreview = (item: Checkpoint) => {
    navigation.navigate("Preview", {
      images: item.images || [],
      _id: item._id,
      checkpointName: item?.checkpointName,
    });
  };

  // const formatTime = (timing: any) => {
  //   if (timing && Array.isArray(timing) && timing[0]) {
  //     // Assuming timing[0] is the desired time value
  //     const timeValue = timing[0];
  //     console.log('timeValue ---- ',timeValue);

  //     return moment(timeValue).format("hh:mm A"); // Format time (e.g., 02:30 PM)
  //   }
  //   return "N/A"; // Return a default value if timing is not available
  // };


  const renderItem = ({ item }: { item: Checkpoint }) => (
    // console.log('item.scanned *******************', item, item.scanned),
    <>
      <View
        style={[
          styles.locationBlockContainer,
          {
            backgroundColor:
              item.scanned === 0
                ? "#C1DADE"
                : item.scanned < item.requiredScan
                  ? "#FFDBBB"
                  : item.scanned === item.requiredScan
                    ? "#DEF2D6"
                    : "#DEF2D6",
          },
          {
            borderColor:
              item.scanned === 0
                ? "#12606D"
                : item.scanned < item.requiredScan
                  ? "#FFA500"
                  : item.scanned === item.requiredScan
                    ? "#118B50"
                    : "#118B50",
          },
        ]}
      >
        <View style={styles.mainLoc}>
          {/* First Row */}
          <View style={styles.firstRow}>
            <View style={styles.subloc1}>
              <View style={styles.locationText}>
                <Text style={styles.locationBlockText}>{item.checkpointName}</Text>
                <View style={styles.locContainer}>
                  <MaterialIcons
                    name="location-pin"
                    size={17}
                    color="#D01E12"
                    style={styles.locationIcon}
                  />
                  <Text style={styles.NumberGuardsText}>
                    {capitalizeFirstLetter(item.location.name)}
                    {item.subLocation && item.subLocation.name
                      ? `, ${capitalizeFirstLetter(item.subLocation.name)}`
                      : ""}
                  </Text>
                </View>
                <View style={styles.locContainer}>
                  <Icon
                    name="nfc-search-variant"
                    size={16}
                    color="#3C4764"
                    style={styles.locationIcon}
                  />
                  <Text style={styles.NumberGuardsText}>
                    {item.checkpointMonitoringOptions._id ===
                      NEXT_PUBLIC_MONITORING_OPTION_ID_DO_NOT
                      ? "Scanned Randomly"
                      : item.checkpointMonitoringOptions._id ===
                        NEXT_PUBLIC_MONITORING_OPTION_ID_INTRERWAL
                        ? `Regular Interval - [${item.scanRequestInterval}]`
                        : "Fix Time"}
                  </Text>
                </View>
                {item.specialInstructions ? (
                  <>
                    <View style={styles.locContainer}>
                      <Entypo
                        name="info-with-circle"
                        size={16}
                        color="#08CCE4"
                        style={styles.locationIcon}
                      />
                      <Text style={styles.NumberGuardsText}>
                        {item.specialInstructions}
                      </Text>
                    </View>
                  </>
                ) : null}

                <View style={styles.locContainer}>
                  <Icon
                    name="cellphone-nfc"
                    size={16}
                    color="#3C4764"
                    style={styles.locationIcon}
                  />
                  {/* <Text style={styles.NumberGuardsText}>
                    {`This checkpoint must be scanned at least ${item?.requiredScan} times. `}
                  </Text> */}
                  <Text style={styles.NumberGuardsText}>
                    {/* {`This checkpoint is required to be scanned at least ${item?.requiredScan} times during your shift today. `} */}
                    {`This checkpoint is required to be scanned at least ${item?.requiredScan} ${item?.requiredScan > 1 ? 'times' : 'time'} during your shift today.`}

                  </Text>
                </View>
              </View>
            </View>
          </View>
          {/* Second Row */}
          <View style={styles.buttonScannedContainer}>
            <View style={styles.PreviewContainer}>
              <TouchableOpacity
                style={styles.previewButton}
                onPress={() => handlePreview(item)}
              >
                <Text style={styles.buttonText}>Preview</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => handleNfcScan(item)}
            >
              <Text style={styles.buttonText}>Scan Checkpoint</Text>
            </TouchableOpacity>
            <View style={styles.ScanCheckpointContainer}>
              <Text style={styles.scanCheckpointText}>{`${item.scanned}/${item.requiredScan}`}</Text>
            </View>
          </View>
        </View>
      </View>

    </>
  );

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

  startRef.current = start;
  endRef.current = end;

  function capitalizeFirstLetter(string: string): string {
    if (!string || typeof string !== "string") return ""; // Handle empty, undefined, or non-string values

    return string
      .split(" ") // Split the string into words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
      .join(" "); // Join the words back together with a space
  }

  function capitalizeAllLetter(string: string) {
    if (!string) return ""; // Handle empty or undefined strings
    return string.toUpperCase();
  }

  // const handleActivityLog = () => {
  //   setModalVisible(false);
  //   navigation.navigate("SiteActivityLog" as never);
  // };

  // const handleIncidentReport = () => {
  //   setModalVisible(false);
  //   navigation.navigate("IncidentReport" as never);
  // };

  // const handleMaintenanceIssue = () => {
  //   setModalVisible(false);
  //   navigation.navigate("MaintenanceReport" as never);
  // };

  const handleActivityLog = () => {
    setModalVisible(false);
    const logData = {
      location,
      ...(subLocation ? { subLocation } : {}),
      shift: shift
    };
    navigation.navigate("SiteActivityLog" as never, logData);
  };

  const handleIncidentReport = () => {
    setModalVisible(false);
    const logData = {
      location,
      ...(subLocation ? { subLocation } : {}),
      shift: shift
    };
    navigation.navigate("IncidentReport" as never, logData);
  };


  const handleMaintenanceIssue = () => {
    setModalVisible(false);
    const logData = {
      location,
      ...(subLocation ? { subLocation } : {}),
      shift: shift
    };
    navigation.navigate("MaintenanceReport" as never, logData);
  };

  const handleAtmosphericsReport = () => {
    setModalVisible(false);
    const logData = {
      // location,
      // ...(subLocation ? { subLocation } : {}),
      shift: shift
    };
    navigation.navigate("AtmosphericReport" as never, logData);
  };



  // const handleNfcScan = async (item: any) => {
  //   console.log('---------------- scan -------------------------------------');

  //   // Store the item in AsyncStorage
  //   await AsyncStorage.setItem("scannedItem", JSON.stringify(item));

  //   // Navigate to the ConfigureNFC screen
  //   navigation.navigate("ConfigureNFC", {
  //     PositionDuties: "PositionDuties",
  //     shift,
  //     checkpointName: item?.checkpointName,
  //   } as never);

  //   // Clear the missed scan timeout since NFC scan occurred
  //   if (missedScanTimeout) {
  //     clearTimeout(missedScanTimeout);
  //     setMissedScanTimeout(null); // Reset the timer state
  //   }
  // };


  const handleNfcScan = async (item: any) => {
    try {
      // console.log(
      //   "---------------- scan started -------------------------------------"
      // );

      // Store the scanned item in AsyncStorage
      await AsyncStorage.setItem("scannedItem", JSON.stringify(item));
      // console.log("Scanned item stored successfully:", item);

      // Clear the missed scan timeout if NFC scan occurs
      if (missedScanTimeout) {
        clearTimeout(missedScanTimeout);
        setMissedScanTimeout(null); // Reset the timer 
      }

      // navigation.reset({
      //   index: 0,
      //   routes: [{ name: "ConfigureNFC", params: {  PositionDuties: "PositionDuties",
      //     shift,
      //     item,
      //     checkpointName: item?.checkpointName, } }],
      // });
      navigation.dispatch(
        StackActions.push("ConfigureNFC", {
          PositionDuties: "PositionDuties",
          shift,
          item,
          checkpointName: item?.checkpointName,
        })
      );
      // Navigate to the ConfigureNFC screen
      // navigation.navigate("ConfigureNFC", {
      //   PositionDuties: "PositionDuties",
      //   shift,
      //   item,
      //   checkpointName: item?.checkpointName,
      // } as never);
    } catch (error) {
      console.error("Error handling NFC scan:", error);
    }
  };

  // const handleNfcScan = async (item: any) => {
  //   try {
  //     console.log('---------------- scan started -------------------------------------');

  //     // Store the scanned item in AsyncStorage
  //     await AsyncStorage.setItem("scannedItem", JSON.stringify(item));
  //     console.log('Scanned item stored successfully:', item);

  //     // Navigate to the ConfigureNFC screen with necessary parameters
  //     navigation.navigate("ConfigureNFC", {
  //       PositionDuties: "PositionDuties",
  //       shift, // Include shift details
  //       checkpointName: item?.checkpointName, // Pass checkpoint name
  //     } as never);
  //     if (missedScanTimeout) {
  //       clearTimeout(missedScanTimeout);
  //       setMissedScanTimeout(null); // Reset the timer state
  //     }
  //   } catch (error) {
  //     console.error('Error handling NFC scan:', error);
  //   }
  // };


  const storeScannedCheckpoint = async (id: string) => {
    try {
      if (!id) {
        console.error("Invalid checkpoint ID", id);
        return;
      }

      console.log("Storing scanned checkpoint", { id });

      // Get existing data
      const storedData = await AsyncStorage.getItem('scannedCheckpoints');
      let scannedCheckpoints = {};

      if (storedData) {
        console.log("Existing stored data found:", storedData);
        scannedCheckpoints = JSON.parse(storedData);
      } else {
        console.log("No existing stored data, initializing new storage.");
      }

      scannedCheckpoints[id] = true; // Mark the checkpoint as scanned

      // Store updated data
      await AsyncStorage.setItem('scannedCheckpoints', JSON.stringify(scannedCheckpoints));
      console.log("Scanned checkpoint stored successfully", scannedCheckpoints);
    } catch (error) {
      console.error("Error storing scanned checkpoint", error);
    }
  };



  useFocusEffect(
    useCallback(() => {
      const fetchTagId = async () => {
        const storedTagId = await AsyncStorage.getItem("tagId");
        if (storedTagId) {
          handleNfcDiscovery(storedTagId);
        }
      };
      fetchTagId();
    }, [item]) // Dependencies can be added here if needed
  );



  const handleNfcDiscovery = async (storedTagId: any) => {
    console.log("scanTagId====>", storedTagId, scanTagId);
    try {
      // const techs = [NfcTech.Ndef, NfcTech.NdefFormatable];
      // await NfcManager.requestTechnology(techs);
      // const tag = await NfcManager.getTag();
      if (storedTagId === item?.nfcTag[0]?.tagId) {
        // if (storedTagId === scanTagId) {
        // console.log("inside condition",storedTagId === scanTagId );

        // const tagId = tag.id;
        setTagId(storedTagId); // Save Tag ID
        // const response = await axios.get(
        //   // `${SERVER_URL_ROASTERING}/nfc/checkpoint/04B50B12C17484`,
        //   `${SERVER_URL_ROASTERING}/nfc/checkpoint/04EC0B12C17484`,
        //   {
        //     withCredentials: true,
        //   }
        // );

        const response = await axios.get(`${SERVER_URL_ROASTERING}/nfc/checkpoint/${storedTagId}`, {
          withCredentials: true,
        });

        console.log("rESPONSE=================>", response?.data);

        const responseData = response?.data;
        if (responseData?.success && responseData?.checkpoint) {
          // console.log('responseData-----------responseData-------responseData-----------', responseData);

          // setIsNfcScanned(true);
          // console.log("====================================");
          // console.log(
          //   "response checkpoint   ",
          //   responseData?.checkpoint?.checkpointId
          // );
          // console.log("====================================");
          const CheckPoint = responseData?.checkpoint;
          console.log("====================================");
          console.log("CheckPoint", CheckPoint);
          console.log("====================================");
          console.log('shift -- shift ---', shift);


          const checkpointMonitoringOptionId =
            responseData?.checkpoint?.checkpointId?.checkpointMonitoringOptions
              ?._id;
          const extraScanOptionId =
            responseData?.checkpoint?.checkpointId?.extraScanOptions?._id;
          const messageToDisplay =
            responseData?.checkpoint?.checkpointId?.messageToDisplay;
          // Validation: Check if siteId and positionId match
          const isSiteIdMatch =
            CheckPoint.checkpointId?.siteId?._id === shift?.siteId ? shift.siteId?._id : shift?._id;
          const isPositionIdMatch = CheckPoint.checkpointId?.positionId?.some(
            (position: any) => position._id === shift.positionId?._id
          );
          console.log('isSiteIdMatch-- isPositionIdMatch --', isSiteIdMatch, isPositionIdMatch);

          setExceptionScanOption(
            responseData?.checkpoint?.checkpointId?.extraScanOptions?._id
          );
          setCheckPointId(responseData?.checkpoint?.checkpointId?._id);
          setLocation(responseData?.checkpoint?.checkpointId?.location?._id);
          // setPositionId(responseData?.checkpoint?.checkpointId?.positionId?._id);
          setSubLocation(
            responseData?.checkpoint?.checkpointId?.subLocation?._id
          );
          // Assuming responseData is already defined
          const positionIdFromShift = shift?.positionId?._id;
          console.log(' positionIdFromShift --- ', positionIdFromShift);

          let matchedPositionId = null;

          const positionIds = CheckPoint?.checkpointId?.positionId;
          console.log('positionIds ---- ', positionIds);

          const matchingPosition = positionIds?.find(
            (position: any) => position?._id === positionIdFromShift
          );
          if (matchingPosition) {
            matchedPositionId = matchingPosition._id;
          }
          console.log("matchingPosition", matchingPosition);

          // });
          if (matchedPositionId) {
            setPositionId(matchedPositionId);
            console.log("Position ID set:", matchedPositionId);
          } else {
            console.log("No matching position ID found.");
          }
          if (!isSiteIdMatch) {
            Alert.alert(
              "Error",
              "NFC Tag does not match with this Site or Position."
            );
            await AsyncStorage.removeItem("tagId");
            return;
          }
          if (!isPositionIdMatch) {
            Alert.alert(
              "Error",
              "NFC Tag does not match with this Site or Position."
            );
            await AsyncStorage.removeItem("tagId");
            return;
          }
          // console.log("id No exe --- - - - - -", CheckPoint?.checkpointId?.exceptionVerificationNo);
          // Check if monitoring option ID matches
          if (
            checkpointMonitoringOptionId ===
            NEXT_PUBLIC_MONITORING_OPTION_ID_DO_NOT
          ) {
            // Now check extraScanOptions ID
            if (extraScanOptionId === NEXT_PUBLIC_SCAN_LOG_ONLY) {
              setCheckpointUsecase("LogTime");
              setModalVisible(true);
              handleSubmit(
                CheckPoint.checkpointId?._id,
                CheckPoint.checkpointId?.extraScanOptions?._id,
                "",
                shift?._id,
                shift?.positionId?._id
              );
              // await removeCheckpointFromStorage(responseData?.checkpoint?.checkpointId._id);
              await AsyncStorage.removeItem("tagId");
            } else if (extraScanOptionId === NEXT_PUBLIC_SCAN_DISPLAY_MESSAGE) {
              setCheckpointUsecase("MessageToDisplay");
              setMessageToDisplay(messageToDisplay);
              setModalVisible(true);
              handleSubmit(
                CheckPoint.checkpointId?._id,
                CheckPoint.checkpointId?.extraScanOptions?._id,
                "",
                shift?._id,
                shift?.positionId?._id
              );
              // await removeCheckpointFromStorage(responseData?.checkpoint?.checkpointId._id);
              await AsyncStorage.removeItem("tagId");
            } else if (
              extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION
            ) {
              if (
                CheckPoint?.checkpointId?.exceptionVerificationValidateRange
              ) {
                console.log("Exception Verification detected.");
                setCheckpointUsecase("Exception Verification");
                setModalVisible(true);
                setExceptionValidationData({
                  ...CheckPoint.checkpointId
                    ?.exceptionVerificationValidateRange,
                  extraScanOptionId,
                });
                await AsyncStorage.removeItem("tagId");
              } else {
                console.warn("No Exception Verification.");
                setModalVisible(false);
                await AsyncStorage.removeItem("tagId");
              }
            } else if (
              extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_YES
            ) {
              if (CheckPoint?.checkpointId?.exceptionVerificationYes) {
                console.log(
                  "Exception Verification - Yes/No Question. (Yes is an Exception)"
                );
                setCheckpointUsecase(
                  "Exception Verification - Yes/No Question. (Yes is an Exception)"
                );
                setModalVisible(true);
                setExceptionVerificationYes({
                  ...CheckPoint.checkpointId?.exceptionVerificationYes,
                  extraScanOptionId,
                });
                await AsyncStorage.removeItem("tagId");
              } else {
                console.log(
                  "No exceptionVerification yes  found for this checkpoint."
                );
                setModalVisible(false);
                await AsyncStorage.removeItem("tagId");
              }
            } else if (
              extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_NO
            ) {
              if (CheckPoint?.checkpointId?.exceptionVerificationNo) {
                console.log("Exception Verification detected.");
                setCheckpointUsecase(
                  "Exception Verification - Yes/No Question. (No is an Exception)"
                );
                setModalVisible(true);
                setExceptionVerificationNo({
                  ...CheckPoint.checkpointId?.exceptionVerificationNo,
                  extraScanOptionId,
                });
                await AsyncStorage.removeItem("tagId");
              } else {
                console.log(
                  "No exceptionVerificationNo found for this checkpoint----."
                );
                setModalVisible(false);
                await AsyncStorage.removeItem("tagId");
              }
            }
            // else if (extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_MULTI_QUESTION) {
            //   if (CheckPoint?.checkpointId?.exceptionMultiQuestion?.questions?.length > 0) {
            //     console.log('Exception Multi-Question detected.');
            //     setCheckpointUsecase('Exception Multi-Question');
            //     setModalVisible(true);
            //     // setExceptionMultiQuestion(CheckPoint.checkpointId?.exceptionMultiQuestion);
            //     setExceptionMultiQuestion({
            //       ...CheckPoint.checkpointId?.exceptionMultiQuestion,
            //       extraScanOptionId, // Add extraScanOptionId to the exceptionMultiQuestion object
            //     });
            //   }
            //    else {
            //     console.warn('No exceptionMultiQuestion found for this checkpoint.');
            //     setModalVisible(false);
            //   }
            //   // setCheckpointUsecase('Exception Multi-Question');
            //   // setModalVisible(true);
            // }
            else {
              setCheckpointUsecase("No matching scan option");
            }
          }
          // else if (
          //   checkpointMonitoringOptionId ===
          //   NEXT_PUBLIC_MONITORING_OPTION_ID_INTRERWAL
          // ) {

          //   // Now check extraScanOptions ID
          //   if (extraScanOptionId === NEXT_PUBLIC_SCAN_LOG_ONLY) {
          //     setCheckpointUsecase("LogTime");
          //     setModalVisible(true);
          //     handleSubmit(
          //       CheckPoint.checkpointId?._id,
          //       CheckPoint.checkpointId?.extraScanOptions?._id,
          //       "",
          //       shift?._id,
          //       shift?.positionId?._id
          //     );
          //     await AsyncStorage.removeItem("tagId");

          //   } else if (extraScanOptionId === NEXT_PUBLIC_SCAN_DISPLAY_MESSAGE) {
          //     setCheckpointUsecase("MessageToDisplay");
          //     setMessageToDisplay(messageToDisplay);
          //     setModalVisible(true);
          //     handleSubmit(
          //       CheckPoint.checkpointId?._id,
          //       CheckPoint.checkpointId?.extraScanOptions?._id,
          //       "",
          //       shift?._id,
          //       shift?.positionId?._id
          //     );
          //     await AsyncStorage.removeItem("tagId");

          //   } else if (
          //     extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION
          //   ) {
          //     setCheckpointUsecase("Exception Verification");
          //     setModalVisible(true);

          //   } else if (
          //     extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_YES
          //   ) {
          //     setCheckpointUsecase(
          //       "Exception Verification - Yes/No Question. (Yes is an Exception)"
          //     );
          //     setModalVisible(true);
          //   } else if (
          //     extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_NO
          //   ) {
          //     setCheckpointUsecase(
          //       "Exception Verification - Yes/No Question. (No is an Exception)"
          //     );
          //     setModalVisible(true);
          //   } else if (
          //     extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_MULTI_QUESTION
          //   ) {
          //     setCheckpointUsecase("Exception Multi-Question");
          //     setModalVisible(true);
          //   } else {
          //     setCheckpointUsecase("No matching scan option");
          //     setModalVisible(true);
          //   }
          // }
          // else if (
          //   checkpointMonitoringOptionId ===
          //   NEXT_PUBLIC_MONITORING_OPTION_ID_FIXED
          // ) {
          //   // Now check extraScanOptions ID
          //   console.log('extraScanOptionId === NEXT_PUBLIC_SCAN_LOG_ONLY ----- fix time ----- notification scan ------ ', extraScanOptionId === NEXT_PUBLIC_SCAN_LOG_ONLY);

          //   if (extraScanOptionId === NEXT_PUBLIC_SCAN_LOG_ONLY) {
          //     console.log("FixTime--------------------", CheckPoint?.checkpointId?.fixTime);
          //     await storeScannedCheckpoint(CheckPoint?.checkpointId?._id);
          //     setCheckpointUsecase("LogTime");
          //     setModalVisible(true);
          //     handleSubmit(
          //       CheckPoint.checkpointId?._id,
          //       CheckPoint.checkpointId?.extraScanOptions?._id,
          //       "",
          //       shift?._id,
          //       shift?.positionId?._id
          //     );
          //   } else if (extraScanOptionId === NEXT_PUBLIC_SCAN_DISPLAY_MESSAGE) {
          //     await storeScannedCheckpoint(CheckPoint?.checkpointId?._id);
          //     setCheckpointUsecase("MessageToDisplay");
          //     setMessageToDisplay(messageToDisplay);
          //     setModalVisible(true);
          //     handleSubmit(
          //       CheckPoint.checkpointId?._id,
          //       CheckPoint.checkpointId?.extraScanOptions?._id,
          //       "",
          //       shift?._id,
          //       shift?.positionId?._id
          //     );
          //   } else if (
          //     extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION
          //   ) {
          //     setCheckpointUsecase("Exception Verification");
          //     setModalVisible(true);
          //   } else if (
          //     extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_YES
          //   ) {
          //     setCheckpointUsecase(
          //       "Exception Verification - Yes/No Question. (Yes is an Exception)"
          //     );
          //     setModalVisible(true);
          //   } else if (
          //     extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_NO
          //   ) {
          //     setCheckpointUsecase(
          //       "Exception Verification - Yes/No Question. (No is an Exception)"
          //     );
          //     setModalVisible(true);
          //   }
          //   //  else if (
          //   //   extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_MULTI_QUESTION
          //   // ) {
          //   //   setCheckpointUsecase("Exception Multi-Question");
          //   //   setModalVisible(true);
          //   // } else {
          //   //   setCheckpointUsecase("No matching scan option");
          //   // }
          // }
          else {
            console.log("inside else");
            setCheckpointUsecase("Monitoring option did not match");
          }
        } else {
          setCheckpointUsecase("Failed to fetch valid checkpoint data");
        }
      } else if (storedTagId === scanTagId) {
        // if (storedTagId === scanTagId) {
        console.log("inside condition", storedTagId === scanTagId);

        // const tagId = tag.id;
        setTagId(storedTagId); // Save Tag ID
        // const response = await axios.get(
        //   // `${SERVER_URL_ROASTERING}/nfc/checkpoint/04B50B12C17484`,
        //   `${SERVER_URL_ROASTERING}/nfc/checkpoint/04EC0B12C17484`,
        //   {
        //     withCredentials: true,
        //   }
        // );

        const response = await axios.get(`${SERVER_URL_ROASTERING}/nfc/checkpoint/${storedTagId}`, {
          withCredentials: true,
        });

        console.log("rESPONSE=================>", response?.data);

        const responseData = response?.data;
        if (responseData?.success && responseData?.checkpoint) {
          // console.log('responseData-----------responseData-------responseData-----------', responseData);

          // setIsNfcScanned(true);
          // console.log("====================================");
          // console.log(
          //   "response checkpoint   ",
          //   responseData?.checkpoint?.checkpointId
          // );
          // console.log("====================================");
          const CheckPoint = responseData?.checkpoint;
          console.log("====================================");
          console.log("CheckPoint", CheckPoint);
          console.log("====================================");
          console.log('shift -- shift ---', shift);


          const checkpointMonitoringOptionId =
            responseData?.checkpoint?.checkpointId?.checkpointMonitoringOptions
              ?._id;
          const extraScanOptionId =
            responseData?.checkpoint?.checkpointId?.extraScanOptions?._id;
          const messageToDisplay =
            responseData?.checkpoint?.checkpointId?.messageToDisplay;
          // Validation: Check if siteId and positionId match
          const isSiteIdMatch =
            CheckPoint.checkpointId?.siteId?._id === shift?.siteId ? shift.siteId?._id : shift?._id;
          const isPositionIdMatch = CheckPoint.checkpointId?.positionId?.some(
            (position: any) => position._id === shift.positionId?._id
          );
          console.log('isSiteIdMatch-- isPositionIdMatch --', isSiteIdMatch, isPositionIdMatch);

          setExceptionScanOption(
            responseData?.checkpoint?.checkpointId?.extraScanOptions?._id
          );
          setCheckPointId(responseData?.checkpoint?.checkpointId?._id);
          setLocation(responseData?.checkpoint?.checkpointId?.location?._id);
          // setPositionId(responseData?.checkpoint?.checkpointId?.positionId?._id);
          setSubLocation(
            responseData?.checkpoint?.checkpointId?.subLocation?._id
          );
          // Assuming responseData is already defined
          const positionIdFromShift = shift?.positionId?._id;
          console.log(' positionIdFromShift --- ', positionIdFromShift);

          let matchedPositionId = null;

          const positionIds = CheckPoint?.checkpointId?.positionId;
          console.log('positionIds ---- ', positionIds);

          const matchingPosition = positionIds?.find(
            (position: any) => position?._id === positionIdFromShift
          );
          if (matchingPosition) {
            matchedPositionId = matchingPosition._id;
          }
          console.log("matchingPosition", matchingPosition);

          // });
          if (matchedPositionId) {
            setPositionId(matchedPositionId);
            console.log("Position ID set:", matchedPositionId);
          } else {
            console.log("No matching position ID found.");
          }
          if (!isSiteIdMatch) {
            Alert.alert(
              "Error",
              "NFC Tag does not match with this Site or Position."
            );
            await AsyncStorage.removeItem("tagId");
            return;
          }
          if (!isPositionIdMatch) {
            Alert.alert(
              "Error",
              "NFC Tag does not match with this Site or Position."
            );
            await AsyncStorage.removeItem("tagId");
            return;
          }
          // console.log("id No exe --- - - - - -", CheckPoint?.checkpointId?.exceptionVerificationNo);
          // Check if monitoring option ID matches
          if (
            checkpointMonitoringOptionId ===
            NEXT_PUBLIC_MONITORING_OPTION_ID_DO_NOT
          ) {
            // Now check extraScanOptions ID
            if (extraScanOptionId === NEXT_PUBLIC_SCAN_LOG_ONLY) {
              setCheckpointUsecase("LogTime");
              setModalVisible(true);
              handleSubmit(
                CheckPoint.checkpointId?._id,
                CheckPoint.checkpointId?.extraScanOptions?._id,
                "",
                shift?._id,
                shift?.positionId?._id
              );
              // await removeCheckpointFromStorage(responseData?.checkpoint?.checkpointId._id);
              await AsyncStorage.removeItem("tagId");
            } else if (extraScanOptionId === NEXT_PUBLIC_SCAN_DISPLAY_MESSAGE) {
              setCheckpointUsecase("MessageToDisplay");
              setMessageToDisplay(messageToDisplay);
              setModalVisible(true);
              handleSubmit(
                CheckPoint.checkpointId?._id,
                CheckPoint.checkpointId?.extraScanOptions?._id,
                "",
                shift?._id,
                shift?.positionId?._id
              );
              // await removeCheckpointFromStorage(responseData?.checkpoint?.checkpointId._id);
              await AsyncStorage.removeItem("tagId");
            } else if (
              extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION
            ) {
              if (
                CheckPoint?.checkpointId?.exceptionVerificationValidateRange
              ) {
                console.log("Exception Verification detected.");
                setCheckpointUsecase("Exception Verification");
                setModalVisible(true);
                setExceptionValidationData({
                  ...CheckPoint.checkpointId
                    ?.exceptionVerificationValidateRange,
                  extraScanOptionId,
                });
                await AsyncStorage.removeItem("tagId");
              } else {
                console.warn("No Exception Verification.");
                setModalVisible(false);
                await AsyncStorage.removeItem("tagId");
              }
            } else if (
              extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_YES
            ) {
              if (CheckPoint?.checkpointId?.exceptionVerificationYes) {
                console.log(
                  "Exception Verification - Yes/No Question. (Yes is an Exception)"
                );
                setCheckpointUsecase(
                  "Exception Verification - Yes/No Question. (Yes is an Exception)"
                );
                setModalVisible(true);
                setExceptionVerificationYes({
                  ...CheckPoint.checkpointId?.exceptionVerificationYes,
                  extraScanOptionId,
                });
                await AsyncStorage.removeItem("tagId");
              } else {
                console.log(
                  "No exceptionVerification yes  found for this checkpoint."
                );
                setModalVisible(false);
                await AsyncStorage.removeItem("tagId");
              }
            } else if (
              extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_NO
            ) {
              if (CheckPoint?.checkpointId?.exceptionVerificationNo) {
                console.log("Exception Verification detected.");
                setCheckpointUsecase(
                  "Exception Verification - Yes/No Question. (No is an Exception)"
                );
                setModalVisible(true);
                setExceptionVerificationNo({
                  ...CheckPoint.checkpointId?.exceptionVerificationNo,
                  extraScanOptionId,
                });
                await AsyncStorage.removeItem("tagId");
              } else {
                console.log(
                  "No exceptionVerificationNo found for this checkpoint----."
                );
                setModalVisible(false);
                await AsyncStorage.removeItem("tagId");
              }
            }
            // else if (extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_MULTI_QUESTION) {
            //   if (CheckPoint?.checkpointId?.exceptionMultiQuestion?.questions?.length > 0) {
            //     console.log('Exception Multi-Question detected.');
            //     setCheckpointUsecase('Exception Multi-Question');
            //     setModalVisible(true);
            //     // setExceptionMultiQuestion(CheckPoint.checkpointId?.exceptionMultiQuestion);
            //     setExceptionMultiQuestion({
            //       ...CheckPoint.checkpointId?.exceptionMultiQuestion,
            //       extraScanOptionId, // Add extraScanOptionId to the exceptionMultiQuestion object
            //     });
            //   }
            //    else {
            //     console.warn('No exceptionMultiQuestion found for this checkpoint.');
            //     setModalVisible(false);
            //   }
            //   // setCheckpointUsecase('Exception Multi-Question');
            //   // setModalVisible(true);
            // }
            else {
              setCheckpointUsecase("No matching scan option");
            }
          }
          // else if (
          //   checkpointMonitoringOptionId ===
          //   NEXT_PUBLIC_MONITORING_OPTION_ID_INTRERWAL
          // ) {

          //   // Now check extraScanOptions ID
          //   if (extraScanOptionId === NEXT_PUBLIC_SCAN_LOG_ONLY) {
          //     setCheckpointUsecase("LogTime");
          //     setModalVisible(true);
          //     handleSubmit(
          //       CheckPoint.checkpointId?._id,
          //       CheckPoint.checkpointId?.extraScanOptions?._id,
          //       "",
          //       shift?._id,
          //       shift?.positionId?._id
          //     );
          //     await AsyncStorage.removeItem("tagId");

          //   } else if (extraScanOptionId === NEXT_PUBLIC_SCAN_DISPLAY_MESSAGE) {
          //     setCheckpointUsecase("MessageToDisplay");
          //     setMessageToDisplay(messageToDisplay);
          //     setModalVisible(true);
          //     handleSubmit(
          //       CheckPoint.checkpointId?._id,
          //       CheckPoint.checkpointId?.extraScanOptions?._id,
          //       "",
          //       shift?._id,
          //       shift?.positionId?._id
          //     );
          //     await AsyncStorage.removeItem("tagId");

          //   } else if (
          //     extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION
          //   ) {
          //     setCheckpointUsecase("Exception Verification");
          //     setModalVisible(true);

          //   } else if (
          //     extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_YES
          //   ) {
          //     setCheckpointUsecase(
          //       "Exception Verification - Yes/No Question. (Yes is an Exception)"
          //     );
          //     setModalVisible(true);
          //   } else if (
          //     extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_NO
          //   ) {
          //     setCheckpointUsecase(
          //       "Exception Verification - Yes/No Question. (No is an Exception)"
          //     );
          //     setModalVisible(true);
          //   } else if (
          //     extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_MULTI_QUESTION
          //   ) {
          //     setCheckpointUsecase("Exception Multi-Question");
          //     setModalVisible(true);
          //   } else {
          //     setCheckpointUsecase("No matching scan option");
          //     setModalVisible(true);
          //   }
          // }
          // else if (
          //   checkpointMonitoringOptionId ===
          //   NEXT_PUBLIC_MONITORING_OPTION_ID_FIXED
          // ) {
          //   // Now check extraScanOptions ID
          //   console.log('extraScanOptionId === NEXT_PUBLIC_SCAN_LOG_ONLY ----- fix time ----- notification scan ------ ', extraScanOptionId === NEXT_PUBLIC_SCAN_LOG_ONLY);

          //   if (extraScanOptionId === NEXT_PUBLIC_SCAN_LOG_ONLY) {
          //     console.log("FixTime--------------------", CheckPoint?.checkpointId?.fixTime);
          //     await storeScannedCheckpoint(CheckPoint?.checkpointId?._id);
          //     setCheckpointUsecase("LogTime");
          //     setModalVisible(true);
          //     handleSubmit(
          //       CheckPoint.checkpointId?._id,
          //       CheckPoint.checkpointId?.extraScanOptions?._id,
          //       "",
          //       shift?._id,
          //       shift?.positionId?._id
          //     );
          //   } else if (extraScanOptionId === NEXT_PUBLIC_SCAN_DISPLAY_MESSAGE) {
          //     await storeScannedCheckpoint(CheckPoint?.checkpointId?._id);
          //     setCheckpointUsecase("MessageToDisplay");
          //     setMessageToDisplay(messageToDisplay);
          //     setModalVisible(true);
          //     handleSubmit(
          //       CheckPoint.checkpointId?._id,
          //       CheckPoint.checkpointId?.extraScanOptions?._id,
          //       "",
          //       shift?._id,
          //       shift?.positionId?._id
          //     );
          //   } else if (
          //     extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION
          //   ) {
          //     setCheckpointUsecase("Exception Verification");
          //     setModalVisible(true);
          //   } else if (
          //     extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_YES
          //   ) {
          //     setCheckpointUsecase(
          //       "Exception Verification - Yes/No Question. (Yes is an Exception)"
          //     );
          //     setModalVisible(true);
          //   } else if (
          //     extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_NO
          //   ) {
          //     setCheckpointUsecase(
          //       "Exception Verification - Yes/No Question. (No is an Exception)"
          //     );
          //     setModalVisible(true);
          //   }
          //   //  else if (
          //   //   extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_MULTI_QUESTION
          //   // ) {
          //   //   setCheckpointUsecase("Exception Multi-Question");
          //   //   setModalVisible(true);
          //   // } else {
          //   //   setCheckpointUsecase("No matching scan option");
          //   // }
          // }
          else {
            console.log("inside else");
            setCheckpointUsecase("Monitoring option did not match");
          }
        } else {
          setCheckpointUsecase("Failed to fetch valid checkpoint data");
        }
      } else {
        Alert.alert("Wrong NFC Tag", "Please scan a valid NFC tag.");
        setTagId(null);
        AsyncStorage.removeItem("tagId");
      }
    } catch (ex: any) {
      // console.warn("NFC Discovery Error:", ex.response.data.message);
      Alert.alert("NFC Error", ex.response.data.message);
      setTagId(null);
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  };

  const removeCheckpointFromStorage = async (checkpointId: string) => {
    try {
      // Fetch existing checkpoints from AsyncStorage
      console.log("checkpointId---", checkpointId);

      const storedCheckpoints = await AsyncStorage.getItem("storedCheckpoints");

      if (storedCheckpoints) {
        const checkpoints = JSON.parse(storedCheckpoints);
        console.log("Stored Checkpoints before removal:", checkpoints);

        // Remove the checkpoint with the given ID that has been scanned (scanned === true)
        const updatedCheckpoints = checkpoints.filter(
          (checkpoint: any) => !(checkpoint._id === checkpointId)
        );

        console.log("Updated Checkpoints after removal:", updatedCheckpoints);

        // Save the updated list of checkpoints back to AsyncStorage
        await AsyncStorage.setItem(
          "storedCheckpoints",
          JSON.stringify(updatedCheckpoints)
        );
        console.log(`Checkpoint ${checkpointId} removed from storage.`);
      } else {
        console.log("No checkpoints found in storage.");
      }
    } catch (error) {
      console.error("Error removing checkpoint from storage:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (modalIntervalRef.current) {
        clearInterval(modalIntervalRef.current);
      }
    };
  }, []);

  const handleSubmit = async (
    checkpointId: string,
    extraScanOptionId?: string,
    status?: string, // Make status optional
    shiftId?: string,
    positionId?: string,
    data?: any
  ) => {
    // console.log("shiftId:", data);
    // if (!data || data.length === 0) {
    //   console.warn('Invalid data provided for submission:', data);
    //   return;
    // }

    const formData = new FormData();

    formData.append("checkpointId", checkpointId);

    console.log(
      "formData-----------formData----------------formData",
      formData
    );

    if (extraScanOptionId) {
      formData.append("extraScanOptions", extraScanOptionId);
    }

    if (data) {
      formData.append(`answers[0][questionId]`, data.questionId);
      formData.append(`answers[0][answer]`, data.answer);
    }
    if (status) {
      formData.append("status", status);
    }
    if (shiftId) {
      formData.append("shiftId", shiftId);
    }
    if (positionId) {
      formData.append("positionId[0]", positionId);
    }

    const reportedDates = new Date();
    const formattedReportedDate =
      new Date(
        reportedDates.getTime() - reportedDates.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split(".")[0] + ".912Z";

    formData.append("scannedAt", formattedReportedDate);

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

      console.log("====================================");
      console.log("Response submit", response.data);
      console.log("====================================");

      if (response.data.success) {
        setTagId(null);
        AsyncStorage.removeItem('tagId')
        fetchData();
        console.log('tag id --------------------------------- ', scanTagId);

      } else {
        Alert.alert("Error", response.data.message); // Handle error
      }
    } catch (error) {
      console.error("Error submitting data-----------------", error); // Handle fetch error
    }
  };

  const onClose = async () => {
    setModalVisible(false);
    navigation.goBack();
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={globalStyles.overlayImageGlobal}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/awp_logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={globalStyles.backArrow}
            onPress={() => navigation.navigate('UserHome' as never)}>
            <FeatherIcon
              name="chevron-left"
              size={26}
              color="#FFFFFF"
              style={globalStyles.menuIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={globalStyles.whiteBox}>
        <View style={styles.textContainer}>
          {/* <TouchableOpacity
            style={styles.backIconContainer}
            onPress={() => navigation.navigate("UserHome" as never)}
          >
            <FeatherIcon
              name="arrow-left"
              size={22}
              color="#000"
              style={styles.backIcon}
            />
          </TouchableOpacity> */}
          <View style={styles.titleContainer}>
            <CustomText style={styles.titleText}>{siteName}</CustomText>
          </View>
        </View>

        <View style={styles.personalInfocontainer}>
          <View style={styles.content}>
            <View style={globalStyles.searchContainer}>
              <Icon
                name="magnify"
                size={20}
                color="#3C4764"
                style={globalStyles.searchIcon}
              />
              <TextInput
                style={globalStyles.searchInput} // Add focus style
                placeholder="Search Position Duties"
                placeholderTextColor={"#A0A0A0"} // Change placeholder color on focus
                value={searchQuery}
                onChangeText={(text) => setSearchQuery(text)}
              />
              {/* Clear Icon */}
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  style={globalStyles.clearIconContainer}
                >
                  <Icon name="close-circle" size={20} color="#ccc" />
                </TouchableOpacity>
              )}
            </View>
            {/* <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={(item) => item._id}
              onEndReached={loadMoreItems}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isLoading ? (
                  <ActivityIndicator size="large" color="#0000ff" />
                ) : null
              }
              ListFooterComponentStyle={styles.footer}
            /> */}
            {data?.length !== 0 && (
              <View>
                <Text style={styles.titleTextWrapper}>
                  You required to scan all below checkpoints during your shifts
                  today:
                </Text>
              </View>
            )}
            <FlatList
              contentContainerStyle={{ flexGrow: 1 }}
              data={data}
              renderItem={renderItem}
              keyExtractor={(item) => item._id}
              onEndReached={onEndReached}
              onEndReachedThreshold={0.1}
              ListFooterComponent={
                isLoading ? (
                  <ActivityIndicator size="large" color="#3C4764" />
                ) : null
              }
            />
            {data?.length === 0 && (
              <Text style={styles.noMoreRecordsText}>
                No more position duties found
              </Text>
            )}
          </View>

          <CustomNFCModal
            checkPointId={checkPointId}
            exceptionScanOption={exceptionScanOption}
            location={location}
            subLocation={subLocation} // Pass subLocation or empty string if undefined
            positionId={positionId}
            visible={isModalVisible}
            onClose={() => setModalVisible(false)}
            checkPointUseCase={checkpointUsecase}
            onActivityLogPress={handleActivityLog}
            onIncidentReportPress={handleIncidentReport}
            onMaintenanceIssuePress={handleMaintenanceIssue}
            onAtmosphericsReportPress={handleAtmosphericsReport}
            {...(messageToDisplay ? { messageToDisplay } : {})}
            {...(exceptionValidationData ? { exceptionValidationData } : {})}
            {...(exceptionVerificationNo ? { exceptionVerificationNo } : {})}
            {...(exceptionVerificationYes ? { exceptionVerificationYes } : {})}
            exceptionMultiQuestion={exceptionMultiQuestion}
            onFormSubmit={(formData) =>
              handleSubmit(

                checkPointId,
                exceptionScanOption,
                "",
                // subLocation,
                shift._id,
                positionId,
                { questionId: formData.questionId, answer: formData.answer }
              )
            }
          />
        </View>
      </View>
      <FooterUser activeIcon={activeIcon} setActiveIcon={setActiveIcon} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  footer: {
    paddingVertical: 10,
  },
  noMoreRecordsText: {
    textAlign: "center",
    color: "gray",
    paddingVertical: 10,
  },
  whiteBackground: {
    backgroundColor: "#FFFFFF",
    top: -15,
    marginHorizontal: 8,
    borderRadius: 10,
  },
  whiteMargin: {
    marginTop: 15,
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
    marginVertical: 12,
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
  titleTextWrapper: {
    fontSize: 14,
    textAlign: "left",
    color: "#585959",
    fontWeight: "600",
    marginHorizontal: 20,
    lineHeight: 22,
    paddingVertical: 5,
    overflow: "hidden",
  },
  backIcon: {
    width: 25,
    height: 25,
  },
  dateContainer: {
    // flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // top: 50,
  },
  buttonContainer: {
    flexDirection: "row",
  },
  weekText: {
    fontSize: 16,
    color: "#000",
    left: 5,
  },
  weekContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  backIconContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 30,
    paddingRight: 10,
    width: 50,
    height: 50,
  },
  // personalInfocontainer: {
  //   marginVertical: 10,
  //   borderRadius: 5,
  //   backgroundColor: "#fff",
  //   elevation: 3,
  //   overflow: "hidden",
  //   borderWidth: 1,
  //   borderColor: "#ccc",
  //   // top: 20,
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   // alignItems: 'center',
  //   marginHorizontal: 10,
  //   paddingBottom: 10,
  // },
  personalInfocontainer: {
    // marginVertical: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    elevation: 3,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ccc",
    // top: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    // alignItems: 'center',
    marginHorizontal: 10,
    paddingBottom: 270,
    // marginBottom: 20,
  },
  content: {
    // padding: 15,
    flex: 1,
  },
  // button: {
  //   borderWidth: 1,
  //   borderColor: '#D01E12', // Change color as needed
  //   borderRadius: 10,
  //   paddingVertical: 10,
  //   paddingHorizontal: 10,
  //   backgroundColor: 'transparent',
  //   alignItems: 'center',
  //   flexDirection: 'row',
  // },
  // btnText: {
  //   fontSize: 14,
  //   color: '#D01E12',
  //   textAlign: 'center',
  // },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#D3D3D3",
    paddingHorizontal: 10,
    height: 34,
    width: "90%",
    alignSelf: "center",
    marginBottom: 15,
    marginTop: 15,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#333",
    fontSize: 12,
  },
  locationBlockContainer: {
    flexDirection: "column",
    backgroundColor: "#DEF2D6",
    borderColor: "#118B50",
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 4,
    marginHorizontal: 10,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  mainLoc: {
    flexDirection: "column",
  },
  firstRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignContent: 'center'
  },
  subloc1: {
    flexDirection: "column",
    width: "77%",
  },
  PreviewContainer: {
    justifyContent: "center",
    alignItems: "center",
    alignContent: 'center',
    paddingLeft: 25
  },
  ScanCheckpointContainer: {
    justifyContent: "center",
    alignItems: "center",
    alignContent: 'center',
    right: 0
  },
  scanCheckpointText: {
    fontWeight: 'bold',
    textAlign: 'right',
    fontSize: 18,
    marginLeft: 30,
    color: '#3C4764'
  },
  buttonScannedContainer: {
    flexDirection: "row",
    marginTop: 8, // Space between rows
    // width: "100%",
    // justifyContent: "center",
    gap: 4
  },
  scanButton: {
    backgroundColor: "#3C4764",
    padding: 10,
    borderRadius: 5,
  },
  previewButton: {
    backgroundColor: "#D01E12",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  locationBlock: {
    width: 50,
    height: 50,
    // marginRight: 16,
    marginLeft: 5,
    top: 5,
  },
  locationText: {
    flexDirection: "column",
    justifyContent: "center",
  },
  locationBlockText: {
    fontSize: 15,
    color: "#3C4764",
    fontWeight: "600",
    // marginBottom: 8,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  label: {
    fontSize: 14,
    color: "#3C4764",
    fontWeight: "500",
    marginRight: 4,
    backgroundColor: "#F0F4F8",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  labelText: {
    fontSize: 14,
    color: "#3C4764",
    fontWeight: "400",
  },
  NumberGuardsText: {
    fontSize: 13,
    color: "#3C4764",
    fontWeight: "400",
    flexWrap: "wrap",
    // width: "80%",
  },
  arrowIcon: {
    fontSize: 20,
    paddingHorizontal: 10,
    color: "#3B4560",
    fontWeight: "bold",
  },
  checkpointText: {
    fontSize: 10,
    color: "#808EB3",
    fontWeight: "400",
  },
  locationIcon: {
    marginRight: 8, // Adds space between the icon and the text
  },
  locContainer: {
    flexDirection: "row",
    marginTop: 2,
  },
});

export default PositionDuties;
