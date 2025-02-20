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
// import BackgroundTimer from 'react-native-background-timer';
const windowWidth = Dimensions.get("window").width;

const PositionDuties = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { shift } = route.params;
  const item = route.params?.item;
  console.log("shift",shift);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeIcon, setActiveIcon] = useState<number>(1);
  const [location, setLocation] = useState([]);
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
  const [checkpointUsecase, setCheckpointUsecase] = useState<any>(null);
  const [messageToDisplay, setMessageToDisplay] = useState<any>(null);
  const [exceptionValidationData, setExceptionValidationData] = useState<{
    question: string;
    allowedRange: string;
    category: { _id: string; name: string };
  } | null>(null);
  const activeTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const modalIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isNfcScanned, setIsNfcScanned] = useState(false);
  //   }
  // };

  const [currentPage, setCurrentPage] = useState(1);
  const [clickedPage, setClickedPage] = useState(1);
  const [showPrev, setShowPrev] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1); // Track current page

  const scrollViewRef = useRef<ScrollView>(null);

  // Function to scroll to the top
  const scrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  // useFocusEffect(
  //   useCallback(() => {
  //     const fetchData = async () => {
  //       try {
  //         setIsLoading(true);

  //         let page = 1;
  //         let limit = 10;

  //         const response = await axios.get(
  //           `${SERVER_URL_ROASTERING}/get/checkpoint/by/position?positionIds=${shift?.positionId?._id}`,
  //           {
  //             withCredentials: true,
  //           }
  //         );
  //         console.log("Response:", response.data.checkpoints);

  //         setData(response.data.checkpoints);
  //       } catch (error: any) {
  //         console.error("Error fetching data:", error);
  //         setError(error); // Store the error for UI feedback
  //       } finally {
  //         setIsLoading(false);
  //       }
  //     };

  //     fetchData();
  //   }, [])
  // );

  const fetchData = useCallback(
    async (page: number, limit: number) => {
      try {
        setIsLoading(true);

        const response = await axios.get(
          `${SERVER_URL_ROASTERING}/get/checkpoint/by/position?positionIds=${shift?.positionId?._id}`,
          {
            params: { page, limit, search: searchQuery },
          }
        );

        const newData = response.data.checkpoints;

        if (newData.length < limit) {
          setHasMore(false); // No more data to load
        } else {
          setHasMore(true); // More data available
        }

        // Filter out duplicates based on _id before setting data
        setData((prevData) => {
          const uniqueData = [...prevData, ...newData].filter(
            (value, index, self) =>
              index === self.findIndex((t) => t._id === value._id)
          );
          return uniqueData; // Update state with unique data
        });
        newData.forEach(async (checkpoint) => {
          // Checking if the checkpoint has already been scanned
          const storedCheckpoints = await AsyncStorage.getItem("storedCheckpoints");
          const storedData = storedCheckpoints ? JSON.parse(storedCheckpoints) : [];

          const isCheckpointStored = storedData.some(
            (cp) => cp._id === checkpoint._id
          );

          if (!isCheckpointStored) {
            // Save checkpoint if not already stored
            const updatedCheckpoints = [...storedData, checkpoint];
            await AsyncStorage.setItem(
              "storedCheckpoints",
              JSON.stringify(updatedCheckpoints)
            );
          }
          // const { checkpointMonitoringOptions, scanRequestInterval } = checkpoint;

          // if (
          //   checkpointMonitoringOptions &&
          //   checkpointMonitoringOptions._id ===
          //     NEXT_PUBLIC_MONITORING_OPTION_ID_INTRERWAL
          // ) {
          //   console.log("Found checkpoint with interval:", checkpoint);

          //   const interval = sanitizeScanInterval(
          //     scanRequestInterval || "1 minute"
          //   );

          //   if (interval) {
          //     console.log("Interval in milliseconds:", interval);
          //     await saveScanDataToStorage(interval, checkpoint);

          //     // Clear any existing timer for this checkpoint
          //     if (activeTimers.current[checkpoint._id]) {
          //       BackgroundTimer.clearInterval(activeTimers.current[checkpoint._id]);
          //     }

          //     // Set a repeating timer for the missed scan logic using BackgroundTimer
          //     const timerId = BackgroundTimer.setInterval(() => {
          //       console.log(`Missed scan logic for checkpoint ${checkpoint._id}`);
          //       handleSubmit(checkpoint._id, "", "missed");
          //     }, interval);

          //     // Store the timer ID for this checkpoint
          //     activeTimers.current[checkpoint._id] = timerId;
          //   } else {
          //     console.error("Invalid scan interval format.");
          //   }
          // }

        });
      } catch (error: any) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery] // Dependency on searchQuery to re-fetch when searchQuery changes
  );

  // Reset page and data when searchQuery changes
  useEffect(() => {
    setPage(1); // Reset page to 1 for new search
    setData([]); // Clear previous data
    setHasMore(true); // Reset hasMore flag
    fetchData(1, 8); // Fetch data for the new search query
  }, [searchQuery, fetchData]);

  // Use useFocusEffect to call fetchData when the screen is focused
  useFocusEffect(
    useCallback(() => {
      if (page === 1 || hasMore) {
        fetchData(page, 8); // Initially load data when screen is focused or when hasMore is true
      }
    }, [page, hasMore, fetchData, searchQuery])
  );

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
  };

  // Function to load more data when user reaches end of list
  const loadMoreItems = () => {
    if (isLoading || !hasMore) return; // Prevent loading if already loading or no more records
    setPage((prevPage) => prevPage + 1); // Increment page
  };

  const renderItem = ({ item }: { item: Checkpoint }) => (
    <TouchableOpacity key={item._id} onPress={() => handleNfcScan(item)}  style={styles.locationBlockContainer}>
        <View style={styles.mainLoc}>
          <MaterialIcons
            name="my-location"
            size={30}
            color="#3C4764"
            style={styles.locationBlock}
          />
          <View style={styles.locationText}>
            <Text style={styles.locationBlockText}>{capitalizeFirstLetter(item.checkpointName)}</Text>
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
                name="office-building-marker-outline"
                size={16}
                color="#3C4764"
                style={styles.locationIcon}
              />
              <Text style={styles.NumberGuardsText}>
                {item.siteId.siteName}
              </Text>
            </View>
            <View style={styles.locContainer}>
              <Icon
                name="cellphone-nfc"
                size={16}
                color="#3C4764"
                style={styles.locationIcon}
              />
              <Text style={styles.NumberGuardsText}>
                {item.checkpointMonitoringOptions._id ===
                  NEXT_PUBLIC_MONITORING_OPTION_ID_DO_NOT
                  ? "Random Scanned"
                  : item.checkpointMonitoringOptions._id ===
                    NEXT_PUBLIC_MONITORING_OPTION_ID_INTRERWAL ? `Regular Interval - [${item.scanRequestInterval}]` : 'Fix Time'}
              </Text>
            </View>
          </View>
        </View>
    </TouchableOpacity>
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

  // const initNfc = async () => {
  //   await NfcManager.start();
  //   handleNfcDiscovery();
  // };

  const handleNfcScan = (item: any) => {
    navigation.navigate("ConfigureNFC", {PositionDuties: 'PositionDuties', shift, item} as never);
  };

  useFocusEffect(
    useCallback(() => {
      const fetchTagId = async () => {
        const storedTagId = await AsyncStorage.getItem("tagId");
        if (storedTagId && item) {
          handleNfcDiscovery(storedTagId, item);
        }
      };
      fetchTagId();
    }, [item]) // Dependencies can be added here if needed
  );
  const handleNfcDiscovery = async (storedTagId, item) => {
    try {
      // const techs = [NfcTech.Ndef, NfcTech.NdefFormatable];
      // await NfcManager.requestTechnology(techs);
      // const tag = await NfcManager.getTag();
      if (storedTagId === item?.nfcTag[0]?.tagId) {
        // const tagId = tag.id;
        setTagId(storedTagId); // Save Tag ID
        console.log("storedTagId", storedTagId);
        
        // const response = await axios.get(`${SERVER_URL_ROASTERING}/nfc/checkpoint/04B30B12C17484`, {
        //   withCredentials: true,
        // });
        const response = await axios.get(`${SERVER_URL_ROASTERING}/nfc/checkpoint/${storedTagId}`, {  
          withCredentials: true,
        });
        const responseData = response?.data;

        if (responseData?.success && responseData?.checkpoint) {
          // setIsNfcScanned(true);
          console.log("====================================");
          console.log(
            "respinse checkpoint   ",
            responseData?.checkpoint?.checkpointId
          );
          console.log("====================================");
          const CheckPoint = responseData?.checkpoint;
          const checkpointMonitoringOptionId =
            responseData?.checkpoint?.checkpointId?.checkpointMonitoringOptions
              ?._id;
          const extraScanOptionId =
            responseData?.checkpoint?.checkpointId?.extraScanOptions?._id;
          const messageToDisplay =
            responseData?.checkpoint?.checkpointId?.messageToDisplay;

          // Validation: Check if siteId and positionId match
          const isSiteIdMatch =
            CheckPoint.checkpointId?.siteId?._id === shift.siteId?._id;
          const isPositionIdMatch = CheckPoint.checkpointId?.positionId?.some(
            (position: any) => position._id === shift.positionId?._id
          );

          if (!isSiteIdMatch) {
            Alert.alert(
              "Error",
              "NFC Tag does not match with this Site or Position."
            );
            await AsyncStorage.removeItem('tagId')
            return;
          }
          if (!isPositionIdMatch) {
            Alert.alert(
              "Error",
              "NFC Tag does not match with this Site or Position."
            );
            await AsyncStorage.removeItem('tagId')
            return;
          }
          console.log("id --- - - - - -",responseData?.checkpoint?.checkpointId._id);
          
          

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
                shift._id
              );
              await removeCheckpointFromStorage(responseData?.checkpoint?.checkpointId._id);
             await AsyncStorage.removeItem('tagId')
             
            } else if (extraScanOptionId === NEXT_PUBLIC_SCAN_DISPLAY_MESSAGE) {
              setCheckpointUsecase("MessageToDisplay");
              setMessageToDisplay(messageToDisplay);
              setModalVisible(true);
              handleSubmit(
                CheckPoint.checkpointId?._id,
                CheckPoint.checkpointId?.extraScanOptions?._id,
                shift._id
              );
              await removeCheckpointFromStorage(responseData?.checkpoint?.checkpointId._id);
             await AsyncStorage.removeItem('tagId')

              // } else if (
              //   extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION
              // ) {
              //   setCheckpointUsecase("Exception Verification");
              //   setExceptionValidationData(
              //     CheckPoint.exceptionVerificationValidateRange
              //   );
              //   setModalVisible(true);
              // } else if (
              //   extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_YES
              // ) {
              //   setCheckpointUsecase(
              //     "Exception Verification - Yes/No Question. (Yes is an Exception)"
              //   );
              //   setModalVisible(true);
              // } else if (
              //   extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_NO
              // ) {
              //   setCheckpointUsecase(
              //     "Exception Verification - Yes/No Question. (No is an Exception)"
              //   );
              //   setModalVisible(true);
              // } else if (
              //   extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_MULTI_QUESTION
              // ) {
              //   setCheckpointUsecase("Exception Multi-Question");
              //   setModalVisible(true);
            } else {
              setCheckpointUsecase("No matching scan option");
            }
          } else if (
            checkpointMonitoringOptionId ===
            NEXT_PUBLIC_MONITORING_OPTION_ID_INTRERWAL
          ) {
            //   const scanRequestInterval = CheckPoint.checkpointId?.scanRequestInterval || "1 minute";

            // // Parse and sanitize interval
            // const sanitizedInterval = scanRequestInterval.replace(" - ", " ").replace("-", " ");
            // const intervalParts = sanitizedInterval.split(" ");
            // const intervalValue = parseInt(intervalParts[0], 10);
            // const intervalUnit = intervalParts[1]?.toLowerCase();

            // const unitToMilliseconds = {
            //   second: 1000,
            //   seconds: 1000,
            //   minute: 60 * 1000,
            //   minutes: 60 * 1000,
            //   hour: 60 * 60 * 1000,
            //   hours: 60 * 60 * 1000,
            //   day: 24 * 60 * 60 * 1000,
            //   days: 24 * 60 * 60 * 1000,
            // };

            // if (!isNaN(intervalValue) && unitToMilliseconds[intervalUnit]) {
            //   const intervalInMilliseconds = intervalValue * unitToMilliseconds[intervalUnit];

            //   // Clear any existing interval
            //   if (modalIntervalRef.current) {
            //     clearInterval(modalIntervalRef.current);
            //   }

            //   // Set up a new interval
            //   modalIntervalRef.current = setInterval(() => {
            //     console.log("Showing modal due to interval:", scanRequestInterval);
            //     setModalVisible(true);
            //   }, intervalInMilliseconds);

            //   console.log("Modal interval set:", intervalInMilliseconds);
            // } else {
            //   console.error("Invalid scanRequestInterval format or unsupported unit:", scanRequestInterval);
            // }

            // Store variables in `variablesRef`
            // variablesRef.current = {
            //   checkpointMonitoringOptionId,
            //   extraScanOptionId,
            //   scanRequestInterval,
            //   messageToDisplay,
            // };

            // setTriggerIntervalUpdate((prev) => !prev);

            // Now check extraScanOptions ID
            if (extraScanOptionId === NEXT_PUBLIC_SCAN_LOG_ONLY) {
              setCheckpointUsecase("LogTime");
              setModalVisible(true);
              handleSubmit(
                CheckPoint.checkpointId?._id,
                CheckPoint.checkpointId?.extraScanOptions?._id
              );
            } else if (extraScanOptionId === NEXT_PUBLIC_SCAN_DISPLAY_MESSAGE) {
              setCheckpointUsecase("MessageToDisplay");
              setMessageToDisplay(messageToDisplay);
              setModalVisible(true);
              handleSubmit(
                CheckPoint.checkpointId?._id,
                CheckPoint.checkpointId?.extraScanOptions?._id
              );
            } else if (
              extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION
            ) {
              setCheckpointUsecase("Exception Verification");
              setModalVisible(true);
            } else if (
              extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_YES
            ) {
              setCheckpointUsecase(
                "Exception Verification - Yes/No Question. (Yes is an Exception)"
              );
              setModalVisible(true);
            } else if (
              extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_NO
            ) {
              setCheckpointUsecase(
                "Exception Verification - Yes/No Question. (No is an Exception)"
              );
              setModalVisible(true);
            } else if (
              extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_MULTI_QUESTION
            ) {
              setCheckpointUsecase("Exception Multi-Question");
              setModalVisible(true);
            } else {
              setCheckpointUsecase("No matching scan option");
              setModalVisible(true);
            }
          } else if (
            checkpointMonitoringOptionId ===
            NEXT_PUBLIC_MONITORING_OPTION_ID_FIXED
          ) {
            // Now check extraScanOptions ID
            // if (extraScanOptionId === NEXT_PUBLIC_SCAN_LOG_ONLY) {
            //   setCheckpointUsecase("LogTime");
            //   setModalVisible(true);
            //   handleSubmit(
            //     CheckPoint.checkpointId?._id,
            //     CheckPoint.checkpointId?.extraScanOptions?._id
            //   );
            // } else if (extraScanOptionId === NEXT_PUBLIC_SCAN_DISPLAY_MESSAGE) {
            //   setCheckpointUsecase("MessageToDisplay");
            //   setMessageToDisplay(messageToDisplay);
            //   setModalVisible(true);
            //   handleSubmit(
            //     CheckPoint.checkpointId?._id,
            //     CheckPoint.checkpointId?.extraScanOptions?._id
            //   );
            // } else if (
            //   extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION
            // ) {
            //   setCheckpointUsecase("Exception Verification");
            //   setModalVisible(true);
            // } else if (
            //   extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_YES
            // ) {
            //   setCheckpointUsecase(
            //     "Exception Verification - Yes/No Question. (Yes is an Exception)"
            //   );
            //   setModalVisible(true);
            // } else if (
            //   extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_NO
            // ) {
            //   setCheckpointUsecase(
            //     "Exception Verification - Yes/No Question. (No is an Exception)"
            //   );
            //   setModalVisible(true);
            // } else if (
            //   extraScanOptionId === NEXT_PUBLIC_SCAN_EXCEPTION_MULTI_QUESTION
            // ) {
            //   setCheckpointUsecase("Exception Multi-Question");
            //   setModalVisible(true);
            // } else {
            //   setCheckpointUsecase("No matching scan option");
            // }
          } else {
            console.log("inside else");

            setCheckpointUsecase("Monitoring option did not match");
          }
        } else {
          setCheckpointUsecase("Failed to fetch valid checkpoint data");
        }

      } else {
        Alert.alert("No NFC Tag", "Please scan a valid NFC tag.");
        setTagId(null);
      }
    } catch (ex: any) {
      console.warn("NFC Discovery Error:", ex.response.data.message);
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
      
      const storedCheckpoints = await AsyncStorage.getItem('storedCheckpoints');
  
      if (storedCheckpoints) {
        const checkpoints = JSON.parse(storedCheckpoints);
        console.log("Stored Checkpoints before removal:", checkpoints);
  
        // Remove the checkpoint with the given ID that has been scanned (scanned === true)
        const updatedCheckpoints = checkpoints.filter(
          (checkpoint: any) => !(checkpoint._id === checkpointId)
        );
  
        console.log("Updated Checkpoints after removal:", updatedCheckpoints);
  
        // Save the updated list of checkpoints back to AsyncStorage
        await AsyncStorage.setItem('storedCheckpoints', JSON.stringify(updatedCheckpoints));
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

  useEffect(() => {
    return () => {
      Object.values(activeTimers.current).forEach((timerId) =>
        BackgroundTimer.clearInterval(timerId)
      );
    };
  }, []);


  const handleSubmit = async (
    checkpointId: string,
    extraScanOptionId?: string,
    status?: string ,// Make status optional,
    shiftId?: string
  ) => {
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

    if(shiftId) {
      formData.append("shiftId", shiftId);
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

      console.log("====================================");
      console.log("Response submit", response.data);
      console.log("====================================");

      if (response.data.success) {
        setTagId(null); // Reset tagId or other state if submission is successful
      } else {
        Alert.alert("Error", response.data.message); // Handle error
      }
    } catch (error) {
      console.error("Error submitting data", error); // Handle fetch error
    }
  };

  const onClose = async () => {
    setModalVisible(false);
    navigation.goBack();
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
      // refreshControl={
      //   <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={"#3C4764"} />
      // }
      >
        <View>
          {/* <Image
            source={require('../assests/images/overlay.png')}
            style={styles.overlayImage}
            resizeMode="cover"
          /> */}
          <View style={globalStyles.overlayImageGlobal}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../assets/images/awp_logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>
          <View style={globalStyles.whiteBox}>
            <View style={styles.textContainer}>
              <TouchableOpacity
                style={styles.backIconContainer}
                onPress={() => navigation.navigate("UserHome" as never)}
              >
                <FeatherIcon
                  name="arrow-left"
                  size={22}
                  color="#000"
                  style={styles.backIcon}
                />
              </TouchableOpacity>
              <View style={styles.titleContainer}>
                <CustomText style={styles.titleText}>
                  Position Duties
                </CustomText>
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
                <FlatList
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
                />
                {/* {!hasMore && (
                  <Text style={styles.noMoreRecordsText}>
                    No more position duties found
                  </Text>
                )} */}
              </View>
              <CustomNFCModal
                visible={isModalVisible}
                onClose={() => onClose()}
                checkPointUseCase={checkpointUsecase}
                onActivityLogPress={handleActivityLog}
                onIncidentReportPress={handleIncidentReport}
                onMaintenanceIssuePress={handleMaintenanceIssue}
                {...(messageToDisplay ? { messageToDisplay } : {})}
                {...(exceptionValidationData
                  ? { exceptionValidationData }
                  : {})}
              />
            </View>
            {/* )} */}
            {/* {!isLoading && ( */}
            {/* <View
              style={[
                globalStyles.paginationContainer,
                {
                  backgroundColor:
                    totalPages > 1 && shiftsPagination.length > 0
                      ? "#fff"
                      : "none",
                },
              ]}
            >
              {renderPaginationNumbers()}
            </View> */}
            {/* )} */}
          </View>
        </View>
      </ScrollView>
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
  personalInfocontainer: {
    marginVertical: 10,
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
    paddingBottom: 10,
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DEF2D6",
    borderColor: "#118B50",
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 4,
    marginHorizontal: 16,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  mainLoc: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    width: "80%",
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
