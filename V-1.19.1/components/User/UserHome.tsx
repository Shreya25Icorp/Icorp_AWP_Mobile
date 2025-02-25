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
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  Vibration,
  NativeModules,
} from "react-native";
import {
  StackActions,
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

import DateTimePicker from "@react-native-community/datetimepicker";
import { TextInputMask } from "react-native-masked-text";
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import BackgroundTimer from "react-native-background-timer";
import { check, PERMISSIONS, request, RESULTS } from "react-native-permissions";
import EncryptedStorage from "react-native-encrypted-storage";
import { activateKeepAwake, deactivateKeepAwake } from '@sayem314/react-native-keep-awake';


const windowWidth = Dimensions.get("window").width;

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  color: string;
  isLoading: boolean;
}

const CustomButton = ({ title, onPress, color, isLoading }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: color || "#50C878",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <Text style={{ color: "#ffffff", fontSize: 16 }}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

interface RadioButtonProps {
  selected: boolean;
  onPress: () => void;
  label: string;
}

interface CheckboxButtonProps {
  selected: boolean;
  onPress: () => void;
  label: string;
}

interface Checkpoint {
  checkpointId?: { _id: string };
  _id: string;
  questionId?: string;
}


const DATA = [
  { id: "1", title: "Activity Log", screen: "SiteActivityLog" },
  { id: "2", title: "Incident Report", screen: "IncidentReport" },
  { id: "3", title: "Maintenance Issue", screen: "MaintenanceReport" },
  { id: "4", title: "Atmospherics Report", screen: "AtmosphericReport" }
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
  const [data, setData] = useState<any>([]);
  const [upcomingShift, setUpcomingShift] = useState<any>([]);
  const [shiftPosition, setShiftPosition] = useState<any>([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [startDateData, setStartDateData] = useState(null);
  const [endDateData, setEndDateData] = useState(null);

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
  const [autoMissedEntryId, setAutoMissedEntryId] = useState([]);
  // for pop-up logtime
  const [isModalVisible, setModalVisible] = useState(false);
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
  const [activeTimeIndex, setActiveTimeIndex] = useState<{
    checkpointIndex: number;
    timeIndex: number;
  } | null>(null);
  const [isLoadingClockOut, setIsLoadingClockOut] = useState(false);
  const [timeData, setTimeData] = useState(
    checkpoints.map(() => [{ date: null, showPicker: false }])
  );
  const [error, setError] = useState("");
  const [timeErrors, setTimeErrors] = useState<{ [key: number]: string }>({});
  const [positionDutiesCount, setPositionDutiesCount] = useState(0);
  const [reasons, setReasons] = useState<string[]>([]);
  const [answer, setAnswer] = useState<string[]>([]);
  const [timeReasons, setTimeReasons] = useState<string[][]>([]);
  const [timeAnswers, setTimeAnswers] = useState<string[][]>([]);
  const [appVersion, setAppVersion] = useState("");
  const [backendVersion, setBackendVersion] = useState("");
  const [isVisible, setIsVisible] = useState(Array(checkpoints.length).fill(true));
  const [selectedCheckpoints, setSelectedCheckpoints] = useState(Array(checkpoints.length).fill(false));

  const scanIntervalRef = useRef(null);
  const variablesRef = useRef({});

  const [exceptionVerificationNo, setExceptionVerificationNo] = useState<{
    question: string;
    allowedRange: string;
    category: { _id: string; name: string };
  } | null>(null);

  const [shiftData, setShiftData] = useState({
    shift: null,
    isUpcoming: false,
  });

  const [shiftStartRange, setShiftStartRange] = useState<number | null>(null);
  const [randomCheckpointRange, setRandomCheckpointRange] = useState<
    number | null
  >(null);
  const [missedOpportunityRange, setMissedOpportunityRange] = useState<
    number | null
  >(null);
  const [sidebarTranslateX] = useState(new Animated.Value(-windowWidth * 0.7));
  const [nfcScanningEnabled, setNfcScanningEnabled] = useState(true);
  const [tagId, setTagId] = useState<any>(null);
  const [triggerIntervalUpdate, setTriggerIntervalUpdate] = useState(false);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["50%", "90%"], []);
  const [validTemperature, setValidTemperature] = useState<boolean>(true);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [extraScanOptions, setExtraScanOptions] = useState("")

  const [finalFCMToken, setFinalFCMToken] = useState("")

  const handleMissModalOpen = (shift: any, isUpcoming: any,) => {
    console.log("Opening missed modal with autoMissedEntryId:", autoMissedEntryId);
    setMissModalVisible(true);
    setShiftData({ shift, isUpcoming });
  };

  const handleMissModalClose = () => {
    setMissModalVisible(false);
    setTimeData([]);
    setReasons([]);
    setTimeReasons([]);
    setActiveTimeIndex(null);
    setTimeErrors([]);
    setAnswer([]);
    setTimeAnswers([]);
    setIsVisible([]);
    setSelectedCheckpoints([]);
  };

  const handleTimeChange = (event: any, selectedDate: Date | undefined) => {
    if (selectedDate) {
      const currentDate = selectedDate;
      setShowPicker(false); // Close picker on selection
      if (activeTimeIndex) {
        const updatedData = [...timeData];
        updatedData[activeTimeIndex.checkpointIndex][activeTimeIndex.timeIndex].date = currentDate;
        setTimeData(updatedData);
        setSelectedTime(currentDate);
        // Remove the error for this specific time field
        const updatedErrors = { ...timeErrors };
        delete updatedErrors[`${activeTimeIndex.checkpointIndex}-${activeTimeIndex.timeIndex}`];
        setTimeErrors(updatedErrors);
      }
    }
  };

  const formatTime = (date?: Date) => {
    if (!date) return "";
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatIosTime = (date?: Date) => {
    if (!date) return "";
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleAddTime = (checkpointIndex: number) => {
    const updatedData = [...timeData];
    updatedData[checkpointIndex].push({ date: null, showPicker: false });
    setTimeData(updatedData);
  };


  const handleRemoveTimeAndReason = (
    checkpointIndex: number,
    timeIndex: number
  ) => {
    if (!Array.isArray(timeData)) {
      console.error("timeData is not an array");
      return;
    }
    const updatedTimeData = [...timeData];
    if (
      checkpointIndex < 0 ||
      checkpointIndex >= updatedTimeData.length ||
      timeIndex < 0 ||
      timeIndex >= updatedTimeData[checkpointIndex]?.length
    ) {
      console.error("Invalid indices for timeData");
      return;
    }
    updatedTimeData[checkpointIndex] = updatedTimeData[checkpointIndex].filter(
      (_, idx) => idx !== timeIndex
    );
    setTimeData(updatedTimeData);
    const updatedReasons = [...reasons];
    if (Array.isArray(updatedReasons[checkpointIndex])) {
      updatedReasons[checkpointIndex] = updatedReasons[checkpointIndex].filter(
        (_, idx) => idx !== timeIndex
      );
    }
    setReasons(updatedReasons);
    const updatedTimeReasons = [...timeReasons];
    if (Array.isArray(updatedTimeReasons[checkpointIndex])) {
      updatedTimeReasons[checkpointIndex] = updatedTimeReasons[
        checkpointIndex
      ].filter((_, idx) => idx !== timeIndex);
    }
    setTimeReasons(updatedTimeReasons);
    // Remove corresponding time-specific answer
    const updatedTimeAnswers = [...timeAnswers];
    if (Array.isArray(updatedTimeAnswers[checkpointIndex])) {
      updatedTimeAnswers[checkpointIndex] = updatedTimeAnswers[checkpointIndex].filter(
        (_, idx) => idx !== timeIndex
      );
    }
    setTimeAnswers(updatedTimeAnswers);
    // Remove the error for this specific time field
    const updatedErrors = { ...timeErrors };
    delete updatedErrors[`${checkpointIndex}-${timeIndex + 1}`];
    setTimeErrors(updatedErrors);
  };

  const [reasonError, setReasonError] = useState({});

  const handleReasonChange = (
    checkpointIndex: number,
    timeIndex: number | null,
    text: string
  ) => {
    if (timeIndex === null) {
      // Main reason update
      setReasons((prev) => {
        const updatedReasons = [...prev];
        updatedReasons[checkpointIndex] = text;
        return updatedReasons;
      });

      // **Validation**: If checkbox is selected and reason is empty, show an error
      if (selectedCheckpoints[checkpointIndex] && text.trim() === "") {
        setReasonError((prevErrors) => ({
          ...prevErrors,
          [checkpointIndex]: "Reason is required",
        }));
      } else {
        // Remove error if reason is provided
        setReasonError((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[checkpointIndex];
          return newErrors;
        });
      }
    } else {
      // Time-specific reason update
      setTimeReasons((prev) => {
        const updatedTimeReasons = [...prev];
        if (!updatedTimeReasons[checkpointIndex]) {
          updatedTimeReasons[checkpointIndex] = [];
        }
        updatedTimeReasons[checkpointIndex][timeIndex] = text;
        return updatedTimeReasons;
      });
    }
  };

  const handleIosReasonChange = (
    checkpointIndex: number,
    timeIndex: number | null,
    text: string
  ) => {
    if (timeIndex === null) {
      // Main reason update
      setReasons((prev) => {
        const updatedReasons = [...prev];
        updatedReasons[checkpointIndex] = text; // Update reason for the specific checkpoint
        return updatedReasons;
      });

      if (!text.trim() && selectedCheckpoints[checkpointIndex]) {
        setReasonError((prevErrors) => ({
          ...prevErrors,
          [checkpointIndex]: "Reason is required", // Set error message if reason is blank
        }));
      } else {
        // If the reason is provided, clear the error message
        setReasonError((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[checkpointIndex]; // Remove error if reason is provided
          return newErrors;
        });
      }
    } else {
      // Time-specific reason update
      setTimeReasons((prev) => {
        const updatedTimeReasons = [...prev];
        if (!updatedTimeReasons[checkpointIndex]) {
          updatedTimeReasons[checkpointIndex] = [];
        }
        updatedTimeReasons[checkpointIndex][timeIndex] = text;
        return updatedTimeReasons;
      });
    }
  };

  const validateReasons = () => {
    const missing = reasons.some((reason, index) => {
      // Check if the checkpoint is selected and visible, and if reason is missing or blank
      return selectedCheckpoints[index] && isVisible[index] && (!reason || reason.trim() === "");
    });

    if (missing) {
      // Show a Toast message if reasons are missing
      Toast.show("Please enter reasons for all selected checkpoints.", Toast.SHORT);
      return false;
    }

    return true;
  };

  const validateTimeFields = () => {
    const errors: { [key: string]: string } = {};
    timeData.forEach((checkpoint, checkpointIndex) => {
      // Check if the first time entry is missing
      if (!checkpoint[0]?.date) {
        errors[`${checkpointIndex}-0`] = Platform.OS === 'android' ? 'Please enter time' : 'Please select time';
      }
      // Check if all additional time entries are valid
      checkpoint.slice(1).forEach((time, timeIndex) => {
        if (!time.date) {
          errors[`${checkpointIndex}-${timeIndex + 1}`] = Platform.OS === 'android' ? 'Please enter time' : 'Please select time';
        }
      });
    });
    // If there are errors, return them, otherwise return null
    if (Object.keys(errors).length > 0) {
      setTimeErrors(errors);
      return false; // Validation failed
    }
    return true; // Validation passed
  };



  const RadioButton: React.FC<RadioButtonProps> = ({ selected, onPress, label }) => {
    const borderColor = label === "Yes" && selected ? "#50C878" : label === "No" && selected ? "#DE3163" : "#C0C0C0";
    const selectedColor = label === "Yes" && selected ? "#50C878" : label === "No" && selected ? "#DE3163" : "transparent";
    return (
      <TouchableOpacity onPress={onPress} style={styles.radioButtonContainer}>
        <View style={[styles.radioButton, { borderColor: borderColor }]}>
          {selected && <View style={[styles.radioButtonSelected, { backgroundColor: selectedColor }]} />}
        </View>
        <Text style={styles.radioButtonLabel}>{label}</Text>
      </TouchableOpacity>
    );
  };


  const CheckboxButton: React.FC<CheckboxButtonProps> = ({ selected, onPress, label }) => {
    const borderColor = label === "I did not patrol this Checkpoint" && selected ? "#50C878" : label === "No" && selected ? "#DE3163" : "#C0C0C0";
    const backgroundColor = selected ? (label === "I did not patrol this Checkpoint" ? "#50C878" : label === "No" ? "#DE3163" : "#C0C0C0") : "transparent";

    return (
      <TouchableOpacity onPress={onPress} style={styles.checkboxContainer}>
        <View style={[styles.checkbox, { borderColor, backgroundColor }]}>
          {selected && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    );
  };


  // const handleCheckboxPress = (index: number) => {
  //   setSelectedCheckpoints((prev) => {
  //     const newSelected = { ...prev, [index]: !prev[index] };

  //     // Set isVisible based on selection state
  //     setIsVisible((prevVisible) => ({
  //       ...prevVisible,
  //       [index]: !newSelected[index],
  //     }));

  //     if (newSelected[index]) {
  //       const currentLocalTime = new Date();
  //       const currentUtcTime = new Date(Date.UTC(
  //         currentLocalTime.getFullYear(),
  //         currentLocalTime.getMonth(),
  //         currentLocalTime.getDate(),
  //         currentLocalTime.getHours(),
  //         currentLocalTime.getMinutes(),
  //         0, 0
  //       ));
  //       console.log('Current UTC Time:', currentUtcTime);

  //       // Update timeData with the current UTC time
  //       setTimeData((prevTimeData) => {
  //         const updatedData = [...prevTimeData];
  //         if (!updatedData[index]) updatedData[index] = [{}];
  //         updatedData[index][0] = { date: currentUtcTime };
  //         return updatedData;
  //       });
  //     } else {
  //       // If checkbox is deselected, reset time (set to blank or null)
  //       setTimeData((prevTimeData) => {
  //         const updatedData = [...prevTimeData];
  //         updatedData[index] = [{}];  // Reset to blank or null
  //         return updatedData;
  //       });
  //     }

  //     return newSelected;
  //   });

  //   // Update answer state
  //   setAnswer((prevAnswers) => ({
  //     ...prevAnswers,
  //     [index]: prevAnswers[index] !== undefined ? prevAnswers : { ...prevAnswers, [index]: "" },
  //   }));
  // };


  const handleCheckboxPress = (index: number) => {
    setSelectedCheckpoints((prev) => {
      const newSelected = { ...prev, [index]: !prev[index] };

      // Set visibility based on selection
      setIsVisible((prevVisible) => ({
        ...prevVisible,
        [index]: !newSelected[index],
      }));

      setTimeData((prevTimeData) => {
        const updatedData = [...prevTimeData];

        if (!updatedData[index]) updatedData[index] = [{}];

        if (newSelected[index] && !updatedData[index][0]?.date) {
          // If selected and no manual time, use the current UTC time
          const currentUtcTime = new Date(Date.UTC(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate(),
            new Date().getHours(),
            new Date().getMinutes(),
            0, 0
          ));
          updatedData[index][0] = { date: currentUtcTime };
        }

        return updatedData;
      });

      return newSelected;
    });
  };


  const handleAnswerChange = (
    checkpointIndex: number,
    timeIndex: number | null,
    text: string,
    allowedRange: string
  ) => {
    const numericValue = parseFloat(text);

    if (timeIndex === null) {
      setAnswer((prevAnswers = {}) => ({
        ...prevAnswers,
        [checkpointIndex]: text, // Store text directly
      }));
    } else {
      setTimeAnswers((prevTimeAnswers = {}) => ({
        ...prevTimeAnswers,
        [checkpointIndex]: {
          ...(prevTimeAnswers[checkpointIndex] || {}), // Ensure existing checkpoint data
          [timeIndex]: text,
        },
      }));
    }

    // Validate number against allowed range
    if (!isNaN(numericValue)) {
      if (typeof allowedRange === "string" && allowedRange.includes("-")) {
        const [min, max] = allowedRange.split("-").map((val) => parseFloat(val.trim()));
        setValidTemperature(numericValue >= min && numericValue <= max);
      } else {
        setValidTemperature(false);
      }
    } else {
      setValidTemperature(false);
    }
  };

  useEffect(() => {
    // Reset the selection to "No" if the item changes and matches the condition
    if (
      extraScanOptions === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_YES
    ) {
      setSelectedOption("No");
    }
  }, [extraScanOptions]);

  useEffect(() => {
    // Reset the selection to "No" if the item changes and matches the condition
    if (
      extraScanOptions === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_NO
    ) {
      setSelectedOption("Yes");
    }
  }, [extraScanOptions]);


  const handleSelection = (option: string, checkpointIndex: number, timeIndex: number | null) => {
    if (timeIndex === null) {
      // Update main answer for the checkpoint
      setAnswer((prevAnswers = {}) => {
        return {
          ...prevAnswers,
          [checkpointIndex]: option, // Store answer directly
        };
      });
    } else {
      // Update "Add more time" answer in timeAnswers state
      setTimeAnswers((prevTimeAnswers = {}) => {
        return {
          ...prevTimeAnswers,
          [checkpointIndex]: {
            ...(prevTimeAnswers[checkpointIndex] || {}), // Ensure existing checkpoint data
            [timeIndex]: option, // Store answer for the specific time index
          },
        };
      });
    }
  };


  const renderCheckpoint = (props: { item: typeof checkpoints[0]; index: number }) => {



    setExtraScanOptions(props.item?.extraScanOptions?._id);

    const errorMessage = timeErrors[`${props.index}-0`];

    // Error handling for "Add more time" fields
    const getTimeFieldError = (checkpointIndex: number, timeIndex: number) => {
      return timeErrors[`${checkpointIndex}-${timeIndex}`];
    };
    if (Platform.OS === "ios") {
      return (
        <View style={styles.checkpointItem} key={props.index}>
          <View style={styles.firstRow}>
            <Text style={styles.checkpointName}>
              {props.item?.checkpointId
                ? props.item?.checkpointId?.checkpointName
                : props.item.checkpointName}
            </Text>
            <TouchableOpacity
              style={styles.textInputTime}
              onPress={() => {
                setActiveTimeIndex({
                  checkpointIndex: props.index,
                  timeIndex: 0,
                });
                setShowPicker(true); // Show picker for this input
              }}
            >
              <Text style={styles.textInputText}>
                {timeData[props.index]?.[0]?.date
                  ? formatIosTime(
                    timeData[props.index][0].date,
                    timeData[props.index][0]?.isUtc
                  )
                  : "Select Time"}
              </Text>
            </TouchableOpacity>
          </View>
          <View>
            {showPicker &&
              activeTimeIndex?.checkpointIndex === props.index &&
              activeTimeIndex?.timeIndex !== undefined && (
                <>
                  <ModalDateTimePicker
                    isVisible={showPicker}
                    mode="time"
                    is24Hour={true}
                    display="spinner"
                    onConfirm={(selectedDate) => {
                      confirmTime(selectedDate); // Pass the selected time directly to confirmTime
                      setShowPicker(false); // Close the modal
                    }}
                    onCancel={() => setShowPicker(false)} // Close on cancel
                    date={new Date()} // Default to current time if no selected time
                  />
                </>
              )}
          </View>

          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
          <View style={styles.checkboxContainer}>
            <CheckboxButton
              selected={selectedCheckpoints[props.index] || false}
              onPress={() => handleCheckboxPress(props.index, "True")}
              label="I did not patrol this Checkpoint"
            />
          </View>
          <View style={styles.reasonRow}>
            <TextInput
              style={styles.reasonInput}
              placeholder="Enter reason for not scanning"
              placeholderTextColor={"#333"}
              value={reasons[props.index] || ""} // Use the value of reason from the state
              onChangeText={(text) => {
                handleIosReasonChange(props.index, null, text); // Update reason when changed
                console.log(
                  `Reason for index ${props.index}: ${text ? text : "null"}`
                ); // Log the input value
              }}
            />
            {/* Show the plus icon only when the checkbox is NOT selected */}
          </View>
          {/* Show the error message for the specific checkpoint */}
          {selectedCheckpoints[props.index] && !reasons[props.index] && (
            <Text style={styles.reasonErrorText}>Reason is required</Text>
          )}

          {!selectedCheckpoints[props.index] && (
            <>
              {props.item?.extraScanOptions?._id ===
                NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION && (
                  <View style={{ marginTop: 8 }}>
                    <View style={styles.reasonRow}>
                      <Text style={styles.reasonLabel}>Question:</Text>
                      <Text style={styles.questionText}>
                        {props.item?.exceptionVerificationValidateRange
                          ?.question || "No question provided"}
                      </Text>
                    </View>
                    <View style={styles.reasonRow}>
                      <TextInput
                        style={styles.reasonInput}
                        placeholder="Answer:"
                        placeholderTextColor={"#333"}
                        keyboardType="numeric"
                        value={answer[props.index] || ""}
                        onChangeText={(text) => {
                          const allowedRange =
                            props.item?.exceptionVerificationValidateRange
                              ?.allowedRange || "";
                          handleAnswerChange(
                            props.index,
                            null,
                            text,
                            allowedRange
                          );
                        }}
                      />
                    </View>
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                  </View>
                )}

              {props.item?.extraScanOptions?._id ===
                NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_YES && (
                  <View style={{ marginTop: 8 }}>
                    <View style={styles.reasonRow}>
                      <Text style={styles.reasonLabel}>Question:</Text>
                      <Text style={styles.questionText}>
                        {props.item?.exceptionVerificationYes?.question}
                      </Text>
                    </View>
                    <View style={styles.reasonRow}>
                      <View style={styles.buttonsContainer}>
                        <RadioButton
                          label="Yes"
                          selected={answer[props.index] === "Yes"}
                          onPress={() =>
                            handleSelection("Yes", props.index, null)
                          }
                        />
                        <RadioButton
                          label="No"
                          selected={answer[props.index] === "No"}
                          onPress={() => handleSelection("No", props.index, null)}
                        />
                      </View>
                      {error[props.index] && (
                        <Text style={{ color: "red" }}>
                          This field is required.
                        </Text>
                      )}
                    </View>
                  </View>
                )}

              {props.item?.extraScanOptions?._id ===
                NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_NO && (
                  <View style={{ marginTop: 8 }}>
                    <View style={styles.reasonRow}>
                      <Text style={styles.reasonLabel}>Question:</Text>
                      <Text style={styles.questionText}>
                        {props.item?.exceptionVerificationNo?.question}
                      </Text>
                    </View>
                    <View style={styles.reasonRow}>
                      <View style={styles.buttonsContainer}>
                        <RadioButton
                          label="Yes"
                          selected={answer[props.index] === "Yes"}
                          onPress={() =>
                            handleSelection("Yes", props.index, null)
                          }
                        />
                        <RadioButton
                          label="No"
                          selected={answer[props.index] === "No"}
                          onPress={() => handleSelection("No", props.index, null)}
                        />
                      </View>
                      {error[props.index] && (
                        <Text style={{ color: "red" }}>
                          This field is required.
                        </Text>
                      )}
                    </View>
                  </View>
                )}
            </>
          )}
          <View style={styles.timeRowsContainer}>
            {timeData[props.index].slice(1).map((time, timeIndex) => (
              <React.Fragment key={timeIndex + 1}>
                <TouchableOpacity
                  style={styles.fullWidthMinusButton}
                  onPress={() =>
                    handleRemoveTimeAndReason(props.index, timeIndex)
                  }
                >
                  <Icon name="minus" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.timeRow}>
                  <Text style={styles.addMoreTimeText}>Add more time: </Text>
                  <TouchableOpacity
                    style={styles.textInputTime}
                    onPress={() => {
                      setActiveTimeIndex({
                        checkpointIndex: props.index,
                        timeIndex: timeIndex + 1,
                      });
                      setShowPicker(true);
                    }}
                  >
                    <Text style={styles.textInputText}>
                      {time.date ? formatIosTime(time.date) : "Select Time"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {getTimeFieldError(props.index, timeIndex + 1) && (
                  <Text style={styles.errorText}>
                    {getTimeFieldError(props.index, timeIndex + 1)}
                  </Text>
                )}
                <View style={styles.reasonRowsContainer}>
                  <View style={styles.timeRow}>
                    <TextInput
                      style={styles.reasonInput}
                      placeholder="Enter reason for not scanning"
                      placeholderTextColor={"#333"}
                      value={timeReasons[props.index]?.[timeIndex] || ""}
                      onChangeText={(text) =>
                        handleIosReasonChange(props.index, timeIndex, text)
                      }
                    />
                  </View>
                </View>
                <View>
                  {props.item?.extraScanOptions?._id === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION && (
                    <View>
                      <View style={styles.reasonRow}>
                        <Text style={styles.reasonLabel}>Question:</Text>
                        <Text style={styles.questionText}>
                          {props.item?.exceptionVerificationValidateRange
                            ?.question || "No question provided"}
                        </Text>
                      </View>
                      <View style={styles.reasonRow}>
                        <TextInput
                          style={styles.reasonInput}
                          placeholder="Answer:"
                          placeholderTextColor={"#333"}
                          keyboardType="numeric"
                          value={String(
                            timeAnswers[props.index]?.[timeIndex] || ""
                          )}
                          onChangeText={(text) => {
                            const allowedRange =
                              props.item?.exceptionVerificationValidateRange
                                ?.allowedRange || "";
                            handleAnswerChange(
                              props.index,
                              timeIndex,
                              text,
                              allowedRange
                            );
                          }}
                        />
                      </View>
                      {error ? (
                        <Text style={styles.errorText}>{error}</Text>
                      ) : null}
                    </View>
                  )}
                </View>
                {props.item?.extraScanOptions?._id === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_YES && (
                  <View>
                    <View style={styles.reasonRow}>
                      <Text style={styles.reasonLabel}>Question:</Text>
                      <Text style={styles.questionText}>
                        {props.item?.exceptionVerificationYes?.question}
                      </Text>
                    </View>
                    <View style={styles.reasonRow}>
                      <View style={styles.buttonsContainer}>
                        <RadioButton
                          label="Yes"
                          selected={
                            timeAnswers[props.index]?.[timeIndex] === "Yes"
                          }
                          onPress={() =>
                            handleSelection("Yes", props.index, timeIndex)
                          }
                        />
                        <RadioButton
                          label="No"
                          selected={
                            timeAnswers[props.index]?.[timeIndex] === "No"
                          }
                          onPress={() =>
                            handleSelection("No", props.index, timeIndex)
                          }
                        />
                      </View>
                    </View>
                  </View>
                )}
                {props.item?.extraScanOptions?._id === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_NO && (
                  <View>
                    <View style={styles.reasonRow}>
                      <Text style={styles.reasonLabel}>Question:</Text>
                      <Text style={styles.questionText}>
                        {props.item?.exceptionVerificationNo?.question}
                      </Text>
                    </View>
                    <View style={styles.reasonRow}>
                      <View style={styles.buttonsContainer}>
                        <RadioButton
                          label="Yes"
                          selected={
                            timeAnswers[props.index]?.[timeIndex] === "Yes"
                          }
                          onPress={() =>
                            handleSelection("Yes", props.index, timeIndex)
                          }
                        />
                        <RadioButton
                          label="No"
                          selected={
                            timeAnswers[props.index]?.[timeIndex] === "No"
                          }
                          onPress={() =>
                            handleSelection("No", props.index, timeIndex)
                          }
                        />
                      </View>
                    </View>
                  </View>
                )}
              </React.Fragment>
            ))}
          </View>
          {!selectedCheckpoints[props.index] && (
            <>
              <View style={{ marginTop: 5 }}>
                <TouchableOpacity
                  style={styles.fullWidthButton}
                  onPress={() => handleAddTime(props.index)}
                >
                  <Icon name="plus" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      );
    } else {
      return (
        <View style={styles.checkpointItem} key={props.index}>
          <View style={styles.firstRow}>
            <Text style={styles.checkpointName}>
              {props.item?.checkpointId ? props.item?.checkpointId?.checkpointName : props.item.checkpointName}
            </Text>
            <TouchableOpacity
              style={styles.textInputTime}
              onPress={() => {
                setActiveTimeIndex({
                  checkpointIndex: props.index,
                  timeIndex: 0,
                });
              }}
            >
              <TextInputMask
                type={"custom"}
                options={{
                  mask: "99:99",
                }}
                value={formatTime(timeData[props.index][0]?.date)}
                onChangeText={(text) => {
                  if (!text || text.length !== 5) return;

                  const [hours, minutes] = text.split(":");

                  // Validate hours and minutes
                  if (hours && minutes) {
                    const parsedHours = parseInt(hours, 10);
                    const parsedMinutes = parseInt(minutes, 10);

                    // Ensure hours and minutes are within valid range
                    if (parsedHours >= 0 && parsedHours <= 23 && parsedMinutes >= 0 && parsedMinutes <= 59) {
                      const updatedDate = new Date(timeData[props.index][0]?.date || new Date());
                      updatedDate.setUTCHours(parsedHours, parsedMinutes, 0, 0);

                      // Ensure startDateData and endDateData are valid strings
                      const [startHours, startMinutes] = (startDateData || "00:00").split(":");
                      const [endHours, endMinutes] = (endDateData || "23:59").split(":");

                      const parsedStartDate = new Date();
                      const parsedEndDate = new Date();

                      parsedStartDate.setUTCHours(parseInt(startHours, 10), parseInt(startMinutes, 10), 0, 0);
                      parsedEndDate.setUTCHours(parseInt(endHours, 10), parseInt(endMinutes, 10), 59, 999);

                      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
                        console.log("Invalid startDate or endDate", startDateData, endDateData);
                        return;
                      }

                      const updatedTime = updatedDate.getTime();
                      const startTime = parsedStartDate.getTime();
                      const endTime = parsedEndDate.getTime();

                      if (updatedTime < startTime || updatedTime > endTime) {
                        setTimeErrors((prevErrors) => ({
                          ...prevErrors,
                          [`${props.index}-0`]: "Time must be within the shift duration!",
                        }));
                        return;
                      }

                      const updatedData = [...timeData];
                      updatedData[props.index][0].date = updatedDate;
                      setTimeData(updatedData);

                      const updatedErrors = { ...timeErrors };
                      delete updatedErrors[`${props.index}-0`];
                      setTimeErrors(updatedErrors);
                    } else {
                      console.log("Invalid time format: hours or minutes out of range");
                    }
                  } else {
                    console.log("Invalid time format");
                  }
                }}
                style={styles.textInputText}
                placeholderTextColor="#5D5A68"
                placeholder="Enter Time"
                keyboardType="numeric"
              />
            </TouchableOpacity>

          </View>
          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
          <View style={styles.checkboxContainer}>
            <CheckboxButton
              selected={selectedCheckpoints[props.index] || false}
              onPress={() => handleCheckboxPress(props.index, "True")}
              label="I did not patrol this Checkpoint"
            />
          </View>
          <View style={styles.reasonRow}>
            <TextInput
              style={styles.reasonInput}
              placeholder="Enter reason for not scanning"
              placeholderTextColor={'#333'}
              value={reasons[props.index] || ""}  // Use the value of reason from the state
              onChangeText={(text) => {
                handleReasonChange(props.index, null, text);  // Update reason when changed
                console.log(`Reason for index ${props.index}: ${text ? text : 'null'}`);  // Log the input value
              }}
            />


          </View>

          {/* Show the error message for the specific checkpoint */}
          {selectedCheckpoints[props.index] && !reasons[props.index] && (
            <Text style={styles.reasonErrorText}>Reason is required</Text>
          )}


          {!selectedCheckpoints[props.index] && (
            <>
              {props.item?.extraScanOptions?._id === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION && (
                <View style={{ marginTop: 8 }} >
                  <View style={styles.reasonRow}>
                    <Text style={styles.reasonLabel}>Question:</Text>
                    <Text style={styles.questionText}>
                      {props.item?.exceptionVerificationValidateRange?.question || "No question provided"}
                    </Text>
                  </View>
                  <View style={styles.reasonRow}>
                    <TextInput
                      style={styles.reasonInput}
                      placeholder="Answer:"
                      placeholderTextColor={"#333"}
                      keyboardType="numeric"
                      value={answer[props.index] || ""}
                      onChangeText={(text) => {
                        const allowedRange = props.item?.exceptionVerificationValidateRange?.allowedRange || "";
                        handleAnswerChange(props.index, null, text, allowedRange);
                      }}
                    />
                  </View>
                  {error ? <Text style={styles.errorText}>{error}</Text> : null}
                </View>
              )}

              {props.item?.extraScanOptions?._id === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_YES && (
                <View style={{ marginTop: 8 }} >
                  <View style={styles.reasonRow}>
                    <Text style={styles.reasonLabel}>Question:</Text>
                    <Text style={styles.questionText}>
                      {props.item?.exceptionVerificationYes?.question}
                    </Text>
                  </View>
                  <View style={styles.reasonRow}>
                    <View style={styles.buttonsContainer}>
                      <RadioButton
                        label="Yes"
                        selected={answer[props.index] === "Yes"}
                        onPress={() => handleSelection("Yes", props.index, null)}
                      />
                      <RadioButton
                        label="No"
                        selected={answer[props.index] === "No"}
                        onPress={() => handleSelection("No", props.index, null)}
                      />
                    </View>
                    {error[props.index] && <Text style={{ color: "red" }}>This field is required.</Text>}
                  </View>
                </View>
              )}

              {props.item?.extraScanOptions?._id === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_NO && (
                <View style={{ marginTop: 8 }} >
                  <View style={styles.reasonRow}>
                    <Text style={styles.reasonLabel}>Question:</Text>
                    <Text style={styles.questionText}>
                      {props.item?.exceptionVerificationNo?.question}
                    </Text>
                  </View>
                  <View style={styles.reasonRow}>
                    <View style={styles.buttonsContainer}>
                      <RadioButton
                        label="Yes"
                        selected={answer[props.index] === "Yes"}
                        onPress={() => handleSelection("Yes", props.index, null)}
                      />
                      <RadioButton
                        label="No"
                        selected={answer[props.index] === "No"}
                        onPress={() => handleSelection("No", props.index, null)}
                      />
                    </View>
                    {error[props.index] && <Text style={{ color: "red" }}>This field is required.</Text>}
                  </View>
                </View>
              )}
            </>
          )}


          <View style={styles.timeRowsContainer}>
            {timeData[props.index].slice(1).map((time, timeIndex) => (
              <React.Fragment key={timeIndex + 1}>
                <TouchableOpacity
                  style={styles.fullWidthMinusButton}
                  onPress={() =>
                    handleRemoveTimeAndReason(props.index, timeIndex)
                  }
                >
                  <Icon name="minus" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.timeRow}>
                  <Text style={styles.addMoreTimeText}>Add more time: </Text>
                  <TouchableOpacity
                    style={styles.textInputTime}
                    onPress={() => {
                      setActiveTimeIndex({
                        checkpointIndex: props.index,
                        timeIndex: timeIndex + 1,
                      });
                      setShowPicker(true);
                    }}
                  >

                    <TextInputMask
                      type={"custom"}
                      options={{
                        mask: "99:99",
                      }}
                      value={formatTime(time.date) || ""}
                      onChangeText={(text) => {
                        if (!text || text.length !== 5) return;

                        const [hours, minutes] = text.split(":");

                        if (hours && minutes && hours.length === 2 && minutes.length === 2) {
                          const updatedDate = new Date(time.date || new Date());
                          updatedDate.setUTCHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

                          // ✅ Ensure startDateData and endDateData are defined
                          const defaultStartTime = "00:00";
                          const defaultEndTime = "23:59";

                          const safeStartDateData = startDateData || defaultStartTime;
                          const safeEndDateData = endDateData || defaultEndTime;

                          // ✅ Validate startDateData & endDateData before splitting
                          if (!safeStartDateData.includes(":") || !safeEndDateData.includes(":")) {
                            console.log("Invalid startDateData or endDateData:", safeStartDateData, safeEndDateData);
                            return;
                          }

                          const [startHours, startMinutes] = safeStartDateData.split(":");
                          const [endHours, endMinutes] = safeEndDateData.split(":");

                          const parsedStartDate = new Date();
                          const parsedEndDate = new Date();

                          parsedStartDate.setUTCHours(parseInt(startHours, 10), parseInt(startMinutes, 10), 0, 0);
                          parsedEndDate.setUTCHours(parseInt(endHours, 10), parseInt(endMinutes, 10), 59, 999);

                          if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
                            console.log("Invalid parsed startDate or endDate", safeStartDateData, safeEndDateData);
                            return;
                          }

                          const updatedTime = updatedDate.getTime();
                          const startTime = parsedStartDate.getTime();
                          const endTime = parsedEndDate.getTime();

                          if (updatedTime === startTime || updatedTime === endTime) {
                            setTimeErrors((prevErrors) => ({
                              ...prevErrors,
                              [`${props.index}-${timeIndex + 1}`]: "Time cannot be the same as start or end time!",
                            }));
                            return;
                          }

                          if (updatedTime < startTime || updatedTime > endTime) {
                            setTimeErrors((prevErrors) => ({
                              ...prevErrors,
                              [`${props.index}-${timeIndex + 1}`]: "Time must be within the shift duration!",
                            }));
                            return;
                          }

                          const formattedUpdatedTime = updatedDate.toISOString().substr(11, 5);

                          const isTimeDuplicate = timeData[props.index].slice(1).some((existingTime) => {
                            const existingTimeUTC = new Date(existingTime.date).toISOString().substr(11, 5);
                            return existingTimeUTC === formattedUpdatedTime;
                          });

                          if (isTimeDuplicate) {
                            setTimeErrors((prevErrors) => ({
                              ...prevErrors,
                              [`${props.index}-${timeIndex + 1}`]: "This time is already entered!",
                            }));
                            return;
                          }

                          const updatedData = [...timeData];
                          updatedData[props.index][timeIndex + 1].date = updatedDate;

                          setTimeData(updatedData);

                          const updatedErrors = { ...timeErrors };
                          delete updatedErrors[`${props.index}-${timeIndex + 1}`];
                          setTimeErrors(updatedErrors);
                        }
                      }}
                      style={styles.textInputText}
                      placeholderTextColor="#5D5A68"
                      placeholder="Enter Time"
                      keyboardType="numeric"
                    />
                  </TouchableOpacity>

                </View>
                {/* Error message for the "Add more time" field */}
                {getTimeFieldError(props.index, timeIndex) && (
                  <Text style={styles.errorText}>{getTimeFieldError(props.index, timeIndex)}</Text>
                )}
                <View style={styles.reasonRowsContainer}>
                  <View key={timeIndex + 1} style={styles.timeRow}>
                    {/* <Text style={styles.reasonLabel}>Reason:</Text> */}
                    <TextInput
                      style={styles.reasonInput}
                      placeholder="Enter reason for not scanning"
                      placeholderTextColor="#5D5A68"
                      value={timeReasons[props.index]?.[timeIndex] || ""}
                      onChangeText={(text) =>
                        handleReasonChange(props.index, timeIndex, text) // Time-specific reason
                      }
                    />

                  </View>
                </View>
                <View>
                  {props.item?.extraScanOptions?._id === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION && (
                    <View>
                      <View style={styles.reasonRow}>
                        <Text style={styles.reasonLabel}>Question:</Text>
                        <Text style={styles.questionText}>
                          {props.item?.exceptionVerificationValidateRange?.question || "No question provided"}
                        </Text>
                      </View>
                      <View style={styles.reasonRow}>
                        <TextInput
                          style={styles.reasonInput}
                          placeholder="Answer:"
                          placeholderTextColor="#5D5A68"
                          keyboardType="numeric"
                          value={String(timeAnswers[props.index]?.[timeIndex] || "")}
                          onChangeText={(text) => {
                            const allowedRange = props.item?.exceptionVerificationValidateRange?.allowedRange || "";
                            handleAnswerChange(props.index, timeIndex, text, allowedRange);
                          }}
                        />

                        {/* <TextInput
                          style={styles.reasonInput}
                          placeholder="Answer:"
                          placeholderTextColor={"#333"}
                          keyboardType="numeric"
                          value={timeAnswers[props.index]?.[timeIndex] || ""}
                          onChangeText={(text) => {
                            const allowedRange = props.item?.exceptionVerificationValidateRange?.allowedRange || "";
                            handleAnswerChange(props.index, timeIndex, text, allowedRange);
                          }}
                        /> */}
                      </View>
                      {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    </View>
                  )}
                </View>
                {props.item?.extraScanOptions?._id === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_YES && (
                  <View>
                    <View style={styles.reasonRow}>
                      <Text style={styles.reasonLabel}>Question:</Text>
                      <Text style={styles.questionText}>
                        {props.item?.exceptionVerificationYes?.question}
                      </Text>
                    </View>
                    <View style={styles.reasonRow}>
                      <View style={styles.buttonsContainer}>
                        <RadioButton
                          label="Yes"
                          selected={timeAnswers[props.index]?.[timeIndex] === "Yes"}
                          onPress={() => handleSelection("Yes", props.index, timeIndex)}
                        />
                        <RadioButton
                          label="No"
                          selected={timeAnswers[props.index]?.[timeIndex] === "No"}
                          onPress={() => handleSelection("No", props.index, timeIndex)}
                        />
                      </View>
                      {error[props.index] && <Text style={{ color: "red" }}>This field is required.</Text>}
                    </View>
                  </View>
                )}

                {props.item?.extraScanOptions?._id ===
                  NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_NO && (
                    <View>
                      <View style={styles.reasonRow}>
                        <Text style={styles.reasonLabel}>Question:</Text>
                        <Text style={styles.questionText}>
                          {props.item?.exceptionVerificationNo?.question}
                        </Text>
                      </View>
                      <View style={styles.reasonRow}>
                        <View style={styles.buttonsContainer}>
                          <RadioButton
                            label="Yes"
                            selected={timeAnswers[props.index]?.[timeIndex] === "Yes"}
                            onPress={() => handleSelection("Yes", props.index, timeIndex)}
                          />
                          <RadioButton
                            label="No"
                            selected={timeAnswers[props.index]?.[timeIndex] === "No"}
                            onPress={() => handleSelection("No", props.index, timeIndex)}
                          />
                        </View>
                        {error[props.index] && <Text style={{ color: "red" }}>This field is required.</Text>}
                      </View>
                    </View>
                  )}
              </React.Fragment>
            ))}
          </View>
          {!selectedCheckpoints[props.index] && (
            <>
              <View style={{ marginTop: 5 }}>
                <TouchableOpacity
                  style={styles.fullWidthButton}
                  onPress={() => handleAddTime(props.index)}
                >
                  <Icon name="plus" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      );
    }
  };

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleDismissModalPress = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} opacity={0.7} disappearsOnIndex={-1} />
    ),
    []
  );

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

  // const renderItem = ({ item }) => (
  //   <TouchableOpacity
  //     style={globalStyles.item}
  //     onPress={() => {
  //       handleDismissModalPress(), navigation.navigate(item.screen);
  //     }}
  //   >
  //     <Text style={globalStyles.title}>{item.title}</Text>
  //   </TouchableOpacity>
  // );

  const renderItem = ({ item }) => {
    const activeShift =
      (!isAttendanceEmpty && hasStartTime && !hasEndTime)
        ? upcomingShift
        : (!isFollowingAttendanceEmpty && hasFollowingStartTime && !hasFollowingEndTime)
          ? followingShift
          : null;
    return (
      <TouchableOpacity
        style={globalStyles.item}
        onPress={() => {
          handleDismissModalPress();
          navigation.navigate(item.screen, { shift: activeShift });
        }}
      >
        <Text style={globalStyles.title}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  const handleLogout = async () => {
    try {
      const response = await axios.get(
        `${SERVER_URL_ROASTERING}/logout/mobile`,
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        await Cookies.removeSessionCookies();
        await AsyncStorage.removeItem("accessCookie");
        await AsyncStorage.removeItem("fcmTokenStored");
        await AsyncStorage.removeItem('userId')
        // Check if 'mpinLastSession' exists before removing it
        const mpinSession = await EncryptedStorage.getItem("mpinLastSession");
        if (mpinSession) {
          try {
            await EncryptedStorage.removeItem("mpinLastSession");
            console.log("MPIN session cleared successfully.");
          } catch (encryptedError) {
            console.error(
              "Error removing mpinLastSession from EncryptedStorage:",
              encryptedError
            );
          }
        } else {
          console.log("mpinLastSession does not exist, skipping removal.");
        }
        navigation.navigate("LoginPage" as never);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
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

  const fetchShiftCount = async (id: string, siteId: string) => {

    try {
      if (id) {
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
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching admin data:", error);
    }
  };


  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${SERVER_URL_ROASTERING}/me`, {
        withCredentials: true,
      });

      if (response?.status === 200) {
        setIsLoading(false);
        const data = response?.data;
        const currentSession = moment.utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
        if (data?.user?.status === "active" && data.user?.exAt > currentSession) {
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
      if (response?.status === 200) {
        const data = response?.data;
        if (data?.message !== "No upcomming shift") {
          AsyncStorage.setItem("siteId", data?.shift?.siteId?._id);
          AsyncStorage.setItem("positionId", data?.shift?.positionId?._id);
          AsyncStorage.setItem("shiftStatus", data?.shift?.shiftStatus);
          setStartDate(data?.shift?.shiftStartDateTime);
          setEndDate(data?.shift?.shiftEndDateTime);
          const sortedUniforms = data?.shift?.positionId.uniform.sort(
            (a: any, b: any) => a.orderNo - b.orderNo
          );
          setUniformType(sortedUniforms);
          fetchShiftCount(userId, data?.shift?.siteId?._id);
          setUpcomingShift(data?.shift);
          await AsyncStorage.setItem("shift", JSON.stringify(data?.shift));
        } else {
          setUpcomingShift([]);
          setUniformType([]);
          setStartDate(null);
          setEndDate(null);
          AsyncStorage.removeItem("clockIn");
          AsyncStorage.removeItem("shiftStartTime");
          AsyncStorage.removeItem("shiftEndTime");
          AsyncStorage.removeItem("shiftPosition");
          AsyncStorage.removeItem("shiftCount");
          setIsClockedIn(false);
          fetchShiftCount(userId, data?.shift?.siteId?._id);
        }
        if (data?.nextShift) {
          fetchShiftCount(userId, data?.shift?.siteId?._id);
          const sortedUniforms = data?.nextShift?.positionId.uniform.sort(
            (a: any, b: any) => a.orderNo - b.orderNo
          );
          setNextUniformType(sortedUniforms);
          setFollowingShift(data.nextShift);
          AsyncStorage.setItem("shift", JSON.stringify(data.nextShift));
          setFollowingStartDate(data.nextShift.shiftStartDateTime);
          setFollowingEndDate(data.nextShift.shiftEndDateTime);
        } else {
          fetchShiftCount(userId, data?.shift?.siteId?._id);
          setNextUniformType([]);
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


  // const fetchShiftCount = async (id: string, siteId: string) => {

  //   setTimeout(async () => {
  //     try {
  //       let url = `${SERVER_URL_ROASTERING}/get/assigned/shifts/count/${id}?shiftsStartDate=${startRef.current.format(
  //         "YYYY-MM-DD"
  //       )}&shiftsEndDate=${endRef.current.format("YYYY-MM-DD")}`;

  //       // Append siteId to the URL if it's not null or empty
  //       if (siteId) {
  //         url += `&siteId=${siteId}`;
  //       }

  //       // Make the API call
  //       const response = await axios.get(url, {
  //         withCredentials: true,
  //       });

  //       setShiftCount(response?.data);
  //       AsyncStorage.setItem(
  //         "ScheduleCount",
  //         JSON.stringify(response?.data?.schedulesAndAttendanceShifts)
  //       );
  //       AsyncStorage.setItem(
  //         "UnconfirmCount",
  //         JSON.stringify(response?.data?.unconfirmedShifts)
  //       );
  //     } catch (error) {
  //       setIsLoading(false);
  //       console.error("Error fetching admin data:", error);
  //     }
  //   }, 30000);
  // };

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
    }, [])
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData().then(() => {
      setIsRefreshing(false);
    });
  }, [fetchData]);

  // useEffect(() => {
  //   // Initialize the socket.io connection
  //   const socket = io(SERVER_URL_ROASTERING_DOMAIN);
  //   // Handle socket.io events
  //   socket.on("connect", () => {
  //     // console.log("Socket.io connection opened");
  //   });

  //   socket.on("publishShift", async (data) => {
  //     // console.log("publishShift", data);

  //     if (data) {
  //       const userId = await AsyncStorage.getItem("userId");
  //       const siteId = await AsyncStorage.getItem("siteId");

  //       fetchUpcomingShift(userId);
  //       fetchShiftCount(userId, siteId);
  //     }
  //   });

  //   socket.on("editShift", async (data) => {
  //     if (data) {
  //       const userId = await AsyncStorage.getItem("userId");
  //       const siteId = await AsyncStorage.getItem("siteId");

  //       fetchUpcomingShift(userId);
  //       fetchShiftCount(userId, siteId);
  //     }
  //   });

  //   socket.on("punchIn", async (data) => {
  //     if (data) {
  //       const userId = await AsyncStorage.getItem("userId");
  //       const siteId = await AsyncStorage.getItem("siteId");

  //       fetchUpcomingShift(userId);
  //       fetchShiftCount(userId, siteId);
  //     }
  //   });

  //   socket.on("deleteShift", async (data) => {
  //     console.log("deleteShift", data);

  //     if (data) {
  //       const userId = await AsyncStorage.getItem("userId");
  //       const siteId = await AsyncStorage.getItem("siteId");

  //       fetchUpcomingShift(userId);
  //       fetchShiftCount(userId, siteId);
  //     }
  //   });

  //   socket.on("disconnect", () => {
  //     // console.log("Socket.io connection closed");
  //   });

  //   // Clean up the socket.io connection when the component is unmounted
  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

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
        if (userId) {
          fetchUpcomingShift(userId);
        }
        if (userId && siteId) {
          fetchShiftCount(userId, siteId);
        }
      }
    });
    socket.on("punchIn", async (data) => {
      if (data) {
        const userId = await AsyncStorage.getItem("userId");
        const siteId = await AsyncStorage.getItem("siteId");
        if (userId) {
          fetchUpcomingShift(userId);
        }
        if (userId && siteId) {
          fetchShiftCount(userId, siteId);
        }
      }
    });
    socket.on("deleteShift", async (data) => {
      console.log("deleteShift", data);
      if (data) {
        const userId = await AsyncStorage.getItem("userId");
        const siteId = await AsyncStorage.getItem("siteId");
        if (userId) {
          fetchUpcomingShift(userId);
        }
        if (userId && siteId) {
          fetchShiftCount(userId, siteId);
        }
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
    // const shiftPosition = await AsyncStorage.getItem("shiftPosition");
    // setShiftPosition(JSON.parse(shiftPosition));
    // const shiftCount = await AsyncStorage.getItem("shiftCount");
    // setPositionDutiesCount(JSON.parse(shiftCount));
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkClockInStatus();
    }, [isClockedIn])
  );


  // Call this function before initializing NFC
  const initNfc = async (shift: any, isUpcoming: boolean) => {
    handleNfcDiscovery(shift, isUpcoming);
  };



  let notificationTimerId: any = null;

  const sendNotification = async (url: string) => {
    try {
      const response = await axios.post(url);
      if (response?.data?.success) {
        console.log(`Notification sent successfully: ${url}`);
      } else {
        console.error(`Failed to send notification: ${url}`, response?.data?.message);
      }
    } catch (error: any) {
      console.error(`Error sending notification: ${url}`, error?.response?.data?.message || error?.message);
    }
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
        AsyncStorage.setItem("shift", JSON.stringify(shift));
        setIsClockedIn(true);
        if (positionDutiesCount > 0) {
          navigation.navigate("PositionDuties", { shift: shift } as never);
        }
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
    // console.log("shift?.positionId?._id", shift?.positionId?._id);
    // const response = await axios.get(
    //   `${SERVER_URL_ROASTERING}/get/checkpoint/by/position?positionIds=${shift?.positionId?._id}`,
    //   {
    //     withCredentials: true,
    //   }
    // );
    // // console.log("====================================");
    // // console.log("checkpoint position", response.data);
    // // console.log("====================================");
    // if (response?.data?.checkpoints?.length > 0) {
    //   setNfcScanningEnabled(true);
    //   setPositionDutiesCount(response?.data?.total);
    //   setShiftPosition(shift);
    //   AsyncStorage.setItem("shiftPosition", JSON.stringify(shift));
    //   AsyncStorage.setItem("shiftCount", JSON.stringify(response?.data?.total));
    //   await initNfc(shift, isUpcoming);
    // } else {
    handleClockInApi(shift, isUpcoming);
    // }
  };





  const handleCheckpointScan = async (shift: any) => {
    // const shiftPosition =
    // navigation.navigate("ConfigureNFC", {
    //   PositionDuties: "UserHome",
    //   shift,
    //   // item,
    //   // checkpointName: item?.checkpointName,
    // } as never);
    // navigation.reset({
    //   index: 0,
    //   routes: [{ name: "ConfigureNFC", params: {  PositionDuties: "UserHome",
    //     shift, } }],
    // });
    navigation.dispatch(
      StackActions.push("ConfigureNFC", { PositionDuties: "UserHome", shift })
    );
  }

  const handleNfcDiscovery = async (shift: any, isUpcoming: boolean) => {
    console.log('isUpcoming -------------------------------------------------------------------------------', isUpcoming);

    try {
      await handleClockInApi(shift, isUpcoming);
      navigation.navigate("PositionDuties", { shift: shift } as never);
    } catch (ex: any) {
      Alert.alert("NFC Error", ex.response.data.message);
      setTagId(null);
    } finally {
      NfcManager.cancelTechnologyRequest();
      setNfcScanningEnabled(false);
    }
  };

  const handleClockOutApi = async (shift: any, isUpcoming: any) => {
    if (isUpcoming) setLoadingUpcoming(true);
    else setLoadingFollowing(true);
    try {

      if (!validateReasons()) {
        Toast.show("Please enter reasons for all selected checkpoints.", Toast.SHORT);
        console.log("Validation failed: Missing reasons.");
        return; // Stop execution if reasons are missing
      }

      if (!validateTimeFields()) {

        return;
      }
      setIsLoadingClockOut(true);
      // console.log("checkpointssss", checkpoints);
      if (checkpoints.length > 0) {

        const validatedCheckpoints = checkpoints.map((checkpoint, index) => {
          const checkpointAnswer = answer[index];

          // Ensure the checkpoint is always included with isVisible: true
          const isCheckpointVisible = isVisible[index] ?? true;

          // Process the checkpoint if it's visible
          const checkpointPositionIds = Array.isArray(checkpoint?.positionId)
            ? checkpoint.positionId.map((pos) => pos._id)
            : [checkpoint?.positionId?._id];

          const matchedPositionId = checkpointPositionIds.find(
            (id: any) => id === shift?.positionId?._id
          );

          if (!matchedPositionId) {
            console.log(`No matched position ID for checkpoint ${index + 1}. Skipping...`);
            return { ...checkpoint, answer: checkpointAnswer, isVisible: true };
          }

          // Function to submit an incident report (only if visible)
          const submitIncidentReport = async (category: any, question: any) => {
            if (!isCheckpointVisible) {
              console.log(`Skipping Incident Report for checkpoint ${index + 1} (not visible).`);
              return;
            }
            try {
              let incidentData = new FormData();
              incidentData.append("checkpointId", checkpoint._id);
              incidentData.append("position", matchedPositionId);
              incidentData.append("location", checkpoint.location?._id);

              if (checkpoint?.subLocation?._id) {
                incidentData.append("subLocation", checkpoint.subLocation._id);
              }

              incidentData.append("incidentCategory", category);
              incidentData.append(
                "detailsOfIncident",
                `Question = ${question}\nAnswer = ${checkpointAnswer}`
              );

              const reportedDate = new Date();
              const formattedReportedDate =
                new Date(reportedDate.getTime() - reportedDate.getTimezoneOffset() * 60000)
                  .toISOString()
                  .split(".")[0] + ".912Z";

              incidentData.append("reportedAt", formattedReportedDate);

              console.log("🚨 Final IncidentData before API call:", JSON.stringify(incidentData, null, 2));

              const response = await axios.post(
                `${SERVER_URL_ROASTERING}/create/nfc/security/incident/report`,
                incidentData,
                {
                  withCredentials: true,
                  headers: { "Content-Type": "multipart/form-data" },
                }
              );

              console.log("✅ Incident report submitted:", response.data);
            } catch (error: any) {
              console.error("❌ Error submitting incident report:", error.response?.data || error);
            }
          };

          // Handle exceptions only if the checkpoint is visible
          if (isCheckpointVisible) {
            if (checkpoint?.extraScanOptions?._id === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION) {
              const allowedRange = checkpoint?.exceptionVerificationValidateRange?.allowedRange;
              if (allowedRange && typeof allowedRange === "string" && allowedRange.includes("-")) {
                const [min, max] = allowedRange.split("-").map((val) => parseFloat(val.trim()));
                if (!isNaN(min) && !isNaN(max) && checkpointAnswer) {
                  const numericValue = parseFloat(checkpointAnswer);
                  if (numericValue < min || numericValue > max) {
                    console.log(`Out-of-range answer detected at checkpoint ${index + 1}`);
                    submitIncidentReport(
                      checkpoint?.exceptionVerificationValidateRange?.category,
                      checkpoint?.exceptionVerificationValidateRange?.question
                    );
                  }
                }
              }
            }

            if (
              checkpoint?.extraScanOptions?._id === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_YES &&
              checkpointAnswer === "Yes"
            ) {
              console.log(`'Yes' answer detected for Exception at checkpoint ${index + 1}`);
              submitIncidentReport(
                checkpoint?.exceptionVerificationYes?.category,
                checkpoint?.exceptionVerificationYes?.question
              );
            }

            if (
              checkpoint?.extraScanOptions?._id === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_NO &&
              checkpointAnswer === "No"
            ) {
              console.log(`'No' answer detected for Exception at checkpoint ${index + 1}`);
              submitIncidentReport(
                checkpoint?.exceptionVerificationNo?.category,
                checkpoint?.exceptionVerificationNo?.question
              );
            }

            if (!checkpoint?.extraScanOptions?._id && checkpointAnswer === "No") {
              console.log(`'No' answer detected with no exception at checkpoint ${index + 1}`);
              submitIncidentReport("General Exception Report", "General Checkpoint Issue");
            }
          }

          return { ...checkpoint, answer: checkpointAnswer, isVisible: true };
        });

        console.log("Validated Checkpoints:", validatedCheckpoints);
        console.log("ansers: ", answer);

        if (validatedCheckpoints.length > 0) {
          const formattedCheckpoints = {
            shiftId: shift._id,
            checkpoints: validatedCheckpoints.map((checkpoint, index) => {
              const checkpointAnswerId =
                checkpoint?.extraScanOptions?._id === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_NO
                  ? checkpoint?.exceptionVerificationNo?._id
                  : checkpoint?.extraScanOptions?._id === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION_YES
                    ? checkpoint?.exceptionVerificationYes?._id
                    : checkpoint?.extraScanOptions?._id === NEXT_PUBLIC_SCAN_EXCEPTION_VERIFICATION
                      ? checkpoint?.exceptionVerificationValidateRange?._id
                      : null;

              const mainAnswers = answer[index]
                ? [[{ questionId: checkpointAnswerId, answer: String(answer[index]) }]]
                : [];

              const timeSpecificAnswers =
                Array.isArray(timeAnswers[index])
                  ? timeAnswers[index].map((ans) => [
                    {
                      questionId: checkpointAnswerId,
                      answer: String(ans),
                    },
                  ])
                  : Object.values(timeAnswers[index] || {}).map((ans) => [
                    {
                      questionId: checkpointAnswerId,
                      answer: String(ans),
                    },
                  ]);


              return {
                checkpointId: checkpoint?._id,
                scanTimes: timeData[index].map((time) =>
                  moment.utc(time.date).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
                ),
                reasons: [reasons[index] || "", ...(timeReasons[index] || []).map((reason) => reason || "")],
                answers: [...mainAnswers, ...timeSpecificAnswers],
                isVisible: isVisible[index] ?? true,
              };
            }),
            positionId: [shift?.positionId?._id],
          };
          const checkpoint = formattedCheckpoints.checkpoints[0];

          // Check if scanTimes exists and log it
          if (checkpoint && checkpoint.scanTimes) {
            console.log('Scan Times:', checkpoint.scanTimes);

            // Example: Checking if scanTimes has any entries
            if (checkpoint.scanTimes.length > 0) {
              // console.log('There are scan times:', checkpoint.scanTimes);
              // console.log('__________________________________________________________________');

            } else {
              console.log('No scan times available.');
            }
          } else {
            console.log('No scan times available for this checkpoint.');
          }

          const response = await axios.post(
            `${SERVER_URL_ROASTERING}/submit/missed/multiple`,
            formattedCheckpoints,
            { withCredentials: true }
          );
          if (!response?.data?.success) {
            Toast.show("Failed to submit validated checkpoints.", Toast.SHORT);
            return;
          }
        } else {
          console.log("No validated checkpoints found.");
        }
      }
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
          headers: { "Content-Type": "application/json" },
        }
      );
      if (clockOutResponse?.data?.success) {
        fetchUpcomingShift(userId);
        Toast.show("Clocked out successfully!", Toast.SHORT);
        handleMissModalClose(); // Close modal after successful clock-out
        // Clear relevant async storage items
        AsyncStorage.removeItem("storedCheckpoints");
        AsyncStorage.removeItem("isSubmitting");
        AsyncStorage.setItem("clockIn", "false");
        // AsyncStorage.removeItem("shiftPosition");
        // AsyncStorage.removeItem("shiftCount");
        AsyncStorage.removeItem('scannedCount')
        setIsClockedIn(false);
        setPositionDutiesCount(0);
        // const response = await axios.get(
        //   `${SERVER_URL_ROASTERING}/get/checkpoint/by/position?positionIds=${shift?.positionId?._id}&shiftId=${shift?._id}`,
        //   {
        //     withCredentials: true,
        //   }
        // );
        // if (response?.data?.checkpoints?.length > 0) {
        //   const allScanned = response.data.checkpoints.every((checkpoint: any) => checkpoint.scanned > 0);
        //   console.log("Are all checkpoints scanned clockout?", allScanned);
        //   AsyncStorage.setItem("scannedCount", JSON.stringify(allScanned));
        // }
        setCheckpoints([]);
        setTimeAnswers([]);
        setAnswer([]);
        setIsVisible([]);
        setSelectedCheckpoints([]);
        setReasonError([]);
      } else {
        Toast.show("An error occurred during clock-out.", Toast.SHORT);
      }
    } catch (error) {
      console.log("Error during clock-out:", error);
      Toast.show("Error during clock-out. Please try again.", Toast.SHORT);
      throw error;
    } finally {
      setIsLoadingClockOut(false);
      if (isUpcoming) setLoadingUpcoming(false);
      else setLoadingFollowing(false);
    }
  };

  const handleClockOut = async (shift: any, isUpcoming: any) => {
    try {
      const getMissedCheckpoints = await axios.get(
        `${SERVER_URL_ROASTERING}/get/missed/checkpoint/user/required/scan/${shift?._id}`,
        { withCredentials: true }
      );

      console.log("getMissedCheckpoints?.data-----", getMissedCheckpoints?.data);

      const { missedCheckpoints = [], autoMissedEntry = [] } = getMissedCheckpoints?.data || {};

      if (missedCheckpoints.length > 0) {
        missedCheckpoints.forEach((checkpoint: any, index: number) => {
          const { requiredScan, scanCount } = checkpoint;
          const missedEntriesCount = Math.max(requiredScan - scanCount, 0);

          console.log(`Checkpoint ${index + 1}:`, checkpoint?.checkpointName);
          console.log(`Missed Entries Needed: ${missedEntriesCount}`);

          if (Array.isArray(checkpoint?.positionId)) {
            checkpoint.positionId.forEach((position: any, posIndex: number) => {
              console.log(`Position ${posIndex + 1}:`, position?._id, position?.postName || "No Name");
            });
          }
        });
      } else {
        console.log("No missed checkpoints found.");
      }

      if (missedCheckpoints.length > 0 || autoMissedEntry.length > 0) {
        // if (isUpcoming) setLoadingUpcoming(false);
        // else setLoadingFollowing(false);

        const safeTimeData = timeData || [];

        const expandedMissedCheckpoints = missedCheckpoints.flatMap((checkpoint: any, index: number) => {
          const { requiredScan, scanCount } = checkpoint;
          const missedEntriesCount = Math.max(requiredScan - scanCount, 0);
          return Array(missedEntriesCount)
            .fill(checkpoint)
            .map((item, itemIndex) => ({
              ...item,
              key: `${item._id}-${index}-${itemIndex}`,
            }));
        });

        const updatedTimeData = expandedMissedCheckpoints.map(
          (_: any, index: number) => safeTimeData[index] || [{ date: null, showPicker: false }]
        );

        if (expandedMissedCheckpoints.length > 0) {
          console.log("Total Missed Entries:", expandedMissedCheckpoints.length);
          setTimeData(updatedTimeData);
          setCheckpoints(expandedMissedCheckpoints);
        } else if (autoMissedEntry.length > 0) {
          console.log("Auto Missed Entries Count:", autoMissedEntry.length);
          setTimeData(updatedTimeData);
          setCheckpoints(autoMissedEntry);
        }

        const autoMissedEntryId = autoMissedEntry?.[0]?._id || null;
        setAutoMissedEntryId(autoMissedEntryId);
        console.log("Auto Missed Entry ID:", autoMissedEntryId);

        handleMissModalOpen(shift, isUpcoming);
        return;
      }

      console.log("No missed checkpoints or auto-missed entries. Proceeding with clock-out.");
      handleClockOutApi(shift, isUpcoming);

      // if (isUpcoming) setLoadingUpcoming(false);
      // else setLoadingFollowing(false);
    } catch (error) {
      console.error("Error during handleClockOut:", error);
      throw error;
    }
  };


  useEffect(() => {
    if (Platform.OS === "android") {
      // For Android, fetch the version from the package.json
      import("../.././package.json").then((pkg) => {
        setAppVersion(pkg.version);
      });
    }
  }, []);

  const convertLocalToUTCISO = (localDate: any) => {
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

  const fetchAndCheckShiftStatus = async () => {
    try {
      const response = await axios.get(SERVER_URL_ROASTERING + "/get/button", {
        withCredentials: true,
      });

      // Find the 'mobile' button object for min range
      const mobileMin = response.data.button.find(
        (item: any) => item.useFor === "mobile"
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
      }
    } catch (error: any) {
      console.error("Error fetching min data:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
    }
  };

  const handleSubmit = async (
    checkpointId: string,
    extraScanOptionId?: string,
    status?: string // Make status optional
  ) => {
    // Check if submission is already in progress by checking the flag in storage
    const isSubmitting = await AsyncStorage.getItem("isSubmitting");
    if (isSubmitting === "true") return;

    await AsyncStorage.setItem("isSubmitting", "true");

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
        setTagId(null);
      } else {
        Alert.alert("Error", response.data.message);
      }
    } catch (error) {
      console.error("Error submitting data", error);
    } finally {
      await AsyncStorage.setItem("isSubmitting", "false");
    }
  };

  // // Call this function once the shift data is available
  // useEffect(() => {
  //   const initializeShiftStatus = async () => {
  //     await fetchAndCheckShiftStatus();
  //   };

  //   initializeShiftStatus();
  // }, [upcomingShift, followingShift]);

  // useEffect(() => {
  //   let interval;

  //   const checkLoginStatusAndFetch = async () => {
  //     const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");

  //     if (isLoggedIn === "true") {
  //       fetchAndCheckShiftStatus(); // Initial fetch

  //       interval = setInterval(async () => {
  //         const stillLoggedIn = await AsyncStorage.getItem("isLoggedIn");
  //         if (stillLoggedIn === "true") {
  //           fetchAndCheckShiftStatus();
  //           console.log("-------------- login --------------");
  //         } else {
  //           console.log("-------------- logout --------------");
  //           clearInterval(interval);
  //         }
  //       }, 30000);
  //     }
  //   };

  //   checkLoginStatusAndFetch();

  //   // Cleanup function to clear interval
  //   return () => {
  //     if (interval) clearInterval(interval);
  //   };
  // }, [upcomingShift, followingShift]);

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

  const activeShift =
    !isAttendanceEmpty && hasStartTime && !hasEndTime
      ? upcomingShift
      : !isFollowingAttendanceEmpty &&
        hasFollowingStartTime &&
        !hasFollowingEndTime
        ? followingShift
        : null;
  // console.log("activeShift:", activeShift);
  const getPositionDuties = useCallback(async () => {
    if (activeShift) {
      const response = await axios.get(
        `${SERVER_URL_ROASTERING}/get/checkpoint/by/position?positionIds=${activeShift?.positionId?._id}`,
        {
          withCredentials: true,
        }
      );
      // console.log("====================================");
      // console.log("checkpoint position", response.data);
      // console.log("====================================");
      if (response?.data?.success === true) {
        setNfcScanningEnabled(true);
        setPositionDutiesCount(response?.data?.total);
        setShiftPosition(activeShift);
        // AsyncStorage.setItem("shiftPosition", JSON.stringify(shift));
        // AsyncStorage.setItem("shiftCount", JSON.stringify(response?.data?.total));
      }
    }
  }, [activeShift]);
  useFocusEffect(
    useCallback(() => {
      getPositionDuties();
    }, [activeShift])
  );

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

  const handleReportNavigate = () => {
    const activeShift =
      (!isAttendanceEmpty && hasStartTime && !hasEndTime)
        ? upcomingShift
        : (!isFollowingAttendanceEmpty && hasFollowingStartTime && !hasFollowingEndTime)
          ? followingShift
          : null;
    navigation.navigate("Reports", { shift: activeShift } as never)
  }

  const requestAndroidNotificationPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      // console.log("Android Notification Permission:", granted);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Notification permission denied.");
      }
    }
  };

  // const vibrateStrongly = () => {
  //   Vibration.vibrate([500, 1000, 500, 1000, 500], true);
  //   setTimeout(() => Vibration.cancel(), 2000);
  // };

  // const checkBatteryOptimization = async () => {
  //   if (Platform.OS === 'android') {
  //     const status = await check(PERMISSIONS.ANDROID.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
  //     if (status !== RESULTS.GRANTED) {
  //       await request(PERMISSIONS.ANDROID.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
  //     }
  //   }
  // };

  // // Call this once when the app starts
  // useEffect(() => {
  //   checkBatteryOptimization();
  // }, []);

  const { WakeLockModule } = NativeModules;



  useEffect(() => {

    requestAndroidNotificationPermission();
    // Request permission for notifications
    const requestUserPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    };

    requestUserPermission();
    const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground notification:', remoteMessage);

      const { title, body } = remoteMessage.notification || {};

      if (title && body) {
        setTimeout(() => {
          console.log('-==============================-===================');

          WakeLockModule.acquireWakeLock();
        }, 0);
        Vibration.vibrate(500);
        PushNotification.localNotification({
          channelId: 'activeworkforcepro',
          title,
          message: body,
          playSound: true,
          // soundName: 'custom_sound.mp3',
          soundName: 'default',
          smallIcon: '@mipmap/awp_logo',
          largeIcon: '@mipmap/awp_logo',
          subText: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          bigText: body,
          userInfo: remoteMessage.data,
          vibrate: true,
          vibration: 500,
          priority: 'max',
          importance: 'max',
          visibility: 'public',
          allowWhileIdle: true,
          onlyAlertOnce: true,
        });
      } else {
        console.log('Notification data is incomplete:', remoteMessage.notification);
      }
    });

    // Handle notification clicks
    PushNotification.configure({
      onNotification: async function (notification) {
        console.log('Notification clicked:', notification);

        const notificationData = notification?.data;
        console.log(' *** **** notificationData *** ****', notificationData);


        if (notificationData) {
          try {
            const shiftJSON = await AsyncStorage.getItem("shift");
            const shift = JSON.parse(shiftJSON);

            console.log('Parsed Shift Object:', activeShift);

            // Navigate to the desired screen
            if (navigation) {
              // navigation.navigate("PositionDuties", { shift: shift } as never);
              navigation.navigate('PositionDuties', { shift: activeShift });
            }
          } catch (error) {
            console.error('Error parsing notification data:', error);
          }
        } else {
          console.log('Notification data is missing or incorrectly formatted:', notification?.data);
        }

        // Call finish() for Android
        if (notification.finish) {
          notification.finish('backgroundFetchResultNoData'); // Corrected for iOS only
        }
      },

      // Android-specific setup
      requestPermissions: Platform.OS === 'ios',
    });

    // Handle background notifications
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      setTimeout(() => {
        console.log('-=-===--=--==-=-=--==-=-=-=--==-=-=-=-=-');

        WakeLockModule.acquireWakeLock();
      }, 500);
      // PushNotification.localNotification({
      //   channelId: 'activeworkforcepro',
      //   title: remoteMessage.notification?.title,
      //   message: remoteMessage.notification?.body,
      //   playSound: true,
      //   soundName: 'default',
      //   smallIcon: '@mipmap/awp_logo',
      //   largeIcon: '@mipmap/awp_logo',
      //   vibrate: true,
      //   vibration: 500,
      //   priority: 'high',
      //   importance: 'high',
      //   visibility: 'public',
      //   allowWhileIdle: true,
      // });
      console.log('Background notification:', remoteMessage);
      Vibration.vibrate(500);
    });

    // Handle app opened by clicking a notification
    const unsubscribeOnNotificationOpenedApp = messaging().onNotificationOpenedApp(async (remoteMessage) => {
      console.log('Notification caused app to open from background:', remoteMessage);
      const shiftJSON = await AsyncStorage.getItem("shift");
      const shift = JSON.parse(shiftJSON);
      console.log(' ****** shift ******* ', activeShift);


      if (remoteMessage?.data) {
        const notificationData = remoteMessage?.data;
        if (notificationData) {
          console.log('Parsed Shift Object:', activeShift);

          if (navigation) {
            // navigation.navigate("PositionDuties", { shift: shift } as never);
            navigation.navigate('PositionDuties', { shift: activeShift });
          }
        }
      }
    });

    // Handle app opened from a terminated state
    const checkInitialNotification = async () => {
      const remoteMessage = await messaging().getInitialNotification();

      if (remoteMessage) {
        const notificationData = remoteMessage?.data;

        if (notificationData) {
          console.log('Parsed Shift Object:', activeShift);

          if (navigation) {
            // navigation.navigate("PositionDuties", { shift: shift } as never);
            navigation.navigate('PositionDuties', { shift: activeShift });
          }
        }
      }
    };

    checkInitialNotification();

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnNotificationOpenedApp();
      WakeLockModule.releaseWakeLock();
    };
  }, [navigation, activeShift]);

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
            </View>
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
                <View
                  style={[
                    globalStyles.profileTextContainer,
                    {
                      flexDirection: "row",
                      justifyContent: "space-between",
                      // paddingHorizontal: 10,
                      alignItems: "center",
                    },
                  ]}
                >
                  <View>
                    <Text style={styles.helloText}>
                      Hello{" "}
                      <Text style={globalStyles.UserImageText}>
                        {capitalizeFirstLetter(data.firstName) +
                          " " +
                          capitalizeFirstLetter(data.lastName)}
                      </Text>
                    </Text>
                  </View>
                  <View style={styles.buttonset}>
                    {image ? (
                      <TouchableOpacity onPress={handleViewProfile}>
                        <Image
                          source={{
                            uri: image + `?timestamp=${new Date().getTime()}`,
                          }}
                          // resizeMode="contain"
                          style={[
                            globalStyles.profileImage,
                            // { height: 50, width: 50 },
                          ]}
                        />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={handleViewProfile}
                        style={[
                          globalStyles.initialsCircle,
                          // { width: 50, height: 50 },
                        ]}
                      >
                        <Text style={globalStyles.initialsText}>
                          {capitalizeFirstLetter(data?.firstName?.charAt(0)) +
                            capitalizeFirstLetter(data?.lastName?.charAt(0))}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                {isCardEnabled ?
                  <View>
                    {positionDutiesCount > 0 && <TouchableOpacity
                      style={styles.ScanButton}
                      onPress={() => handleCheckpointScan(upcomingShift)}
                      disabled={loadingUpcoming}
                    >
                      <MaterialCommunityIcons
                        name="cellphone-nfc"
                        size={20}
                        color="#fff" />
                      <Text style={styles.scanButtonText}>Scan Checkpoint</Text>
                    </TouchableOpacity>}
                  </View>
                  : null
                }


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
                          {!isAttendanceEmpty && hasStartTime && !hasEndTime ? (
                            <>
                              {/* {positionDutiesCount > 0 && 
                              <TouchableOpacity
                                style={styles.ScanButton}
                                onPress={() => handleCheckpointScan(upcomingShift)}
                                disabled={loadingUpcoming}
                              >
                                <MaterialCommunityIcons
                                  name="cellphone-nfc"
                                  size={18}
                                  color="#fff" />
                                <Text style={styles.clockButtonText}>Scan</Text>
                              </TouchableOpacity>
                              } */}
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
                            </>
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
                        {upcomingShift?.positionId?.levelOfPay && !upcomingShift?.positionId?.hiddenLevelOfPay && (
                          <View style={styles.row}>
                            <Text style={styles.text}>Level of Pay:</Text>
                            <Text style={styles.subText}>
                              {capitalizeFirstLetter(upcomingShift?.positionId?.levelOfPay?.name)}
                            </Text>
                          </View>
                        )}
                        <View style={styles.row}>
                          <Text style={styles.text}>Site Address:</Text>
                          <Text style={styles.subText}>
                            {upcomingShift?.siteId?.address &&
                              `${upcomingShift?.siteId?.address}`}
                            {upcomingShift?.siteId?.city &&
                              `, ${upcomingShift?.siteId?.city}`}
                            {upcomingShift?.siteId?.state &&
                              `, ${upcomingShift?.siteId?.state}`}
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
                              <>
                                {/* {positionDutiesCount > 0 && <TouchableOpacity
                                  style={styles.ScanButton}
                                  onPress={() => handleCheckpointScan(followingShift)}
                                  disabled={loadingUpcoming}
                                >
                                  <MaterialCommunityIcons
                                    name="cellphone-nfc"
                                    size={18}
                                    color="#fff" />
                                  <Text style={styles.clockButtonText}>Scan</Text>
                                </TouchableOpacity>} */}
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
                              </>
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
                          {followingShift?.positionId?.levelOfPay && !followingShift?.positionId?.hiddenLevelOfPay && (
                            <View style={styles.row}>
                              <Text style={styles.text}>Level of Pay:</Text>
                              <Text style={styles.subText}>
                                {capitalizeFirstLetter(
                                  followingShift?.positionId?.levelOfPay?.name
                                )}
                              </Text>
                            </View>
                          )}
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
                  onPress={() => navigation.navigate("Documents", { activeShift } as never)}
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
                      {isCardEnabled
                        ? `(${shiftCount?.documents + totalDocuments})`
                        : `(${totalDocuments})`}
                    </Text>
                    {/* )} */}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.iconRow1}>
                <TouchableOpacity
                  disabled={!isCardEnabled} // Disable if attendance conditions aren't met
                  onPress={() => handleReportNavigate()}
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
                {data?.nfcConfiguration === true ? (
                  <TouchableOpacity
                    // Disabled condition can go here if needed
                    onPress={() => navigation.navigate("SiteList")}
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
                  isCardEnabled && ( // Show Position Duties only when isClockedIn is true
                    <TouchableOpacity
                      // disabled={!isCardEnabled} // Disable if attendance conditions aren't met
                      onPress={() =>
                        navigation.navigate("PositionDuties", {
                          shift: shiftPosition,
                        } as never)
                      }
                      style={[
                        styles.icon,
                        positionDutiesCount > 0 && {
                          backgroundColor: "#D01E12", // Dark red background
                          shadowColor: "#FFBFBF", // Light red shadow
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.8,
                          shadowRadius: 6,
                          elevation: 8, // Android shadow
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="human-male-board-poll"
                        size={35}
                        color={positionDutiesCount > 0 ? "#fff" : "#D01E12"}
                        style={styles.iconImage}
                      />
                      <Text
                        style={[
                          styles.iconText,
                          {
                            color: positionDutiesCount > 0 ? "#fff" : "#000",
                            fontWeight: positionDutiesCount ? "bold" : "normal",
                          },
                        ]}
                      >
                        Position Duties{" "}
                        <Text
                          style={[
                            styles.iconTextCount,
                            {
                              color:
                                positionDutiesCount > 0 ? "#fff" : "#D01E12",
                            },
                          ]}
                        >
                          {`(${positionDutiesCount || 0})`}
                        </Text>{" "}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
              {data?.nfcConfiguration === true &&
                isCardEnabled ?
                (
                  <View style={styles.iconRow2}>
                    <TouchableOpacity
                      // disabled={!isCardEnabled} // Disable if attendance conditions aren't met
                      onPress={() =>
                        navigation.navigate("PositionDuties", {
                          shift: shiftPosition,
                        } as never)
                      }
                      style={[
                        styles.icon,
                        positionDutiesCount > 0 && {
                          backgroundColor: "#D01E12", // Dark red background
                          shadowColor: "#FFBFBF", // Light red shadow
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.8,
                          shadowRadius: 6,
                          elevation: 8, // Android shadow
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="human-male-board-poll"
                        size={35}
                        color={positionDutiesCount > 0 ? "#fff" : "#D01E12"}
                        style={styles.iconImage}
                      />
                      <Text
                        style={[
                          styles.iconText,
                          {
                            color: positionDutiesCount > 0 ? "#fff" : "#000",
                            fontWeight: positionDutiesCount ? "bold" : "normal",
                          },
                        ]}
                      >
                        Position Duties{" "}
                        <Text
                          style={[
                            styles.iconTextCount,
                            {
                              color: positionDutiesCount > 0 ? "#fff" : "#D01E12",
                            },
                          ]}
                        >
                          {`(${positionDutiesCount || 0})`}
                        </Text>{" "}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
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
                <KeyboardAvoidingView
                  behavior={Platform.OS === "ios" ? "padding" : "height"}
                  style={styles.modalMissOverlay}
                >
                  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalMissContent}>
                      <View style={styles.modalMissHeaderContent}>
                        <View style={styles.modalMissHeader}>
                          <Text style={styles.headerText}>
                            You have missed the below checkpoints
                          </Text>
                          {/* <Text style={styles.headerText}>
                            You required to scan all below checkpoints during your shifts today
                          </Text> */}
                          <TouchableOpacity onPress={handleMissModalClose} style={{ marginLeft: 6 }}>
                            <Icon name="close" size={24} color="#000" />
                          </TouchableOpacity>
                        </View>
                        {/* <Text style={styles.subHeaderText}>Before you clock out, please add the estimated time you patrolled the below checkpoints so we can record the time accordingly:</Text> */}
                        <Text style={styles.subHeaderText}>
                          Before clocking out, log the patrol times for the missed checkpoints. If you didn’t patrol them, select “I did not patrol this checkpoint” and state the reason.
                        </Text>
                      </View>

                      <ScrollView
                        contentContainerStyle={styles.modalMissBody}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                      >
                        <FlatList
                          data={checkpoints}
                          keyExtractor={(item: any) => item.key}
                          renderItem={renderCheckpoint}
                          keyboardShouldPersistTaps="handled"
                        />
                      </ScrollView>

                      <View style={styles.buttonSubmit}>
                        <CustomButton
                          title="Clock Out"
                          onPress={() => handleClockOutApi(shiftData.shift, shiftData.isUpcoming)}
                          color="#50C878"
                          isLoading={isLoadingClockOut}
                        />
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
              </Modal>
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
                    <Text style={styles.modalLabel}>Reports & Logs</Text>
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
    width: windowWidth,
    backgroundColor: "#fff",
    zIndex: 1,
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
    backgroundColor: "#D01E12",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#D01E12",
    elevation: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    right: 4,
  },
  ScanButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D01E12",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#D01E12",
    elevation: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    // width: '52%',
    marginVertical: 4,
    // right: 0,
    // marginLeft: 50,
  },
  clockButtonText: {
    marginLeft: 5,
    fontSize: 15,
    fontWeight: "bold",
    color: "#fff",
  },
  scanButtonText: {
    marginLeft: 5,
    marginRight: 4,
    fontSize: 16,
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
    fontSize: 16,
    color: "#262D3F",
    // textAlign: "center",
    marginTop: 10,
    marginBottom: 3,
    marginLeft: 5
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
    fontSize: 20,
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
    backgroundColor: "#f1f1f1",
    borderRadius: 50,
  },
  modalMissBody: {
    flexGrow: 1,
    padding: 15,
  },
  modalMissOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalMissHeaderContent: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    padding: 15,
  },
  modalMissContent: {
    width: "96%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
  },
  modalMissHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,

  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  subHeaderText: {
    fontSize: 14,
    marginTop: 4,
    paddingHorizontal: 6,
    color: '#000'
  },
  checkpointItem: {
    marginBottom: 15,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  firstRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // marginBottom: 10,
  },
  checkpointName: {
    fontSize: 14,
    color: "#000",
    flex: 1,
    flexWrap: "wrap",
    marginRight: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkmark: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  label: {
    marginHorizontal: 0,
    color: '#555',
  },
  timeRowsContainer: {
    flexDirection: "column",
    // justifyContent: 'space-between',
    // width: '47%',
    // alignSelf: 'flex-end',
    marginTop: 10,
  },
  addMoreTimeText: {
    fontSize: 14,
    color: "#555",
    // marginBottom: 4,
    flex: 1,
    flexWrap: "wrap",
    fontWeight: 'bold'
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  textInput: {
    flex: 1,
    height: 36,
    paddingHorizontal: 6,
    paddingVertical: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    marginLeft: 10,
    color: "#000",
    textAlign: "center",
  },
  textInputTime: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 14,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    marginLeft: 10,
  },
  textInputText: {
    fontSize: 14,
    textAlign: "center",
    color: "#000",
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 10,
    marginRight: 10,
    textAlign: 'right'
  },
  reasonErrorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 2,
    marginLeft: 10,
    marginRight: 48,
    // textAlign: 'right'
  },
  iconContainer: {
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSubmit: {
    marginVertical: 10,
    marginHorizontal: "auto",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    width: "40%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  reasonRowsContainer: {
    flexDirection: "column",
    // justifyContent: 'space-between',
    // width: '47%',
    // alignSelf: 'flex-end',
    marginTop: 10,
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    // marginVertical: 6,
  },
  reasonLabel: {
    fontSize: 14,
    color: "#555",
    // marginBottom: 4,
    // flex: 1,
    flexWrap: "wrap",
  },
  reasonText: {
    fontSize: 14,
    color: "#555",
  },
  reasonInput: {
    flex: 1,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 14,
    marginLeft: 4,
    color: '#000'
  },
  questionText: {
    flex: 1,
    // height: 40,
    paddingHorizontal: 10,
    fontSize: 14,
    marginLeft: 4,
    color: '#000'
  },
  buttonsContainer: {
    marginTop: 5,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    width: '100%'
  },
  radioButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  radioButtonLabel: {
    fontSize: 16,
    color: "#000",
  },
  fullWidthButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#23527C",
    padding: 2,
    borderRadius: 5,
    width: "100%", // Makes the button full width
    marginBottom: 8
  },
  fullWidthMinusButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF0000",
    padding: 2,
    borderRadius: 5,
    width: "100%", // Makes the button full width
    marginBottom: 10
  },
});

export default UserHome;
