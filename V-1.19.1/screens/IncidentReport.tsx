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
  Easing,
  Alert,
  Platform,
  SafeAreaView,
  RefreshControl,
  Keyboard,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { s as tw } from "react-native-wind";
import Footer from "../components/Footer/Footer";
import Sidebar from "../components/Sidebar/Sidebar";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  NEXT_PUBLIC_ARMED_ID,
  NEXT_PUBLIC_BAG_CHECK_ID,
  NEXT_PUBLIC_BUNNING_ID,
  NEXT_PUBLIC_DAMAGE_ID,
  NEXT_PUBLIC_SUSPICIOUS_ID,
  NEXT_PUBLIC_THEFT_ID,
  SERVER_URL_ROASTERING,
} from "../Constant";
import { io } from "socket.io-client";
import FeatherIcon from "react-native-vector-icons/Feather";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import CustomText from "../components/CustomText";
import Ionicons from "react-native-vector-icons/Ionicons";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isoWeek from "dayjs/plugin/isoWeek";
import FooterUser from "../components/Footer/FooterUser";
import DateTimePicker from "@react-native-community/datetimepicker";
import ModalDateTimePicker from "react-native-modal-datetime-picker";
import DropDownPicker from "react-native-dropdown-picker";
import Divider from "../components/CustomDivider";
import ImagePicker from "react-native-image-crop-picker";
import DocumentPicker from "react-native-document-picker";
import { PERMISSIONS, check, RESULTS, request } from "react-native-permissions";
import ImageUploader from "../components/CustomImageUploader/ImageUploader";
import CustomDialogPicker from "../components/CustomDailogPicker/CustomDailogPicker";
import {
  TextInput,
  HelperText,
  Button,
  Dialog,
  Portal,
  RadioButton,
  Checkbox,
  Switch,
} from "react-native-paper";
import SiteActivity from "./SiteActivityLog";
import moment from "moment";
import { stat } from "react-native-fs";
import RNFS from "react-native-fs";
import Toast from "react-native-simple-toast";
import SignatureCapture from "react-native-signature-capture";
import { TouchableHighlight } from "react-native-gesture-handler";
import ThankYouModal from "../components/CustomThankYouModal/CustomThankYouModal";
import { globalStyles } from "../styles";
import SidebarUser from "../components/Sidebar/SidebarUser";
import { launchImageLibrary } from "react-native-image-picker";
import CustomBottomSheet from "../components/CustomBottomSheet/CustomBottomSheet";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import CustomTextArea from "../components/CustomTextArea/CustomTextArea";

const windowWidth = Dimensions.get("window").width;

const IncidentReport = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // const { shift } = route.params;
  const { shift, reportType, id, status, location, subLocation } = route.params;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeIcon, setActiveIcon] = useState<number>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [clickedPage, setClickedPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Activity Log");

  const [visible, setVisible] = React.useState(false);
  const [imageRange, setImageRange] = React.useState("");
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isIOSDatePickerVisible, setIOSDatePickerVisible] = useState(false);
  const [isIOSTimePickerVisible, setIOSTimePickerVisible] = useState(false);

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());

  const [active, setActive] = useState(null);
  const [reportFields, setReportFields] = useState([]);

  const [incidentCategories, setIncidentCategories] = useState([]);
  const [incidentTypes, setIncidentTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [subLocations, setSubLocations] = useState([]);

  const [description, setDescription] = useState("");
  const [otherLocation, setOtherLocation] = useState("");

  const [imageUris, setImageUris] = useState([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);

  const [selectedValue, setSelectedValue] = useState("");
  const [selectedValueType, setSelectedValueType] = useState("");
  const [selectedValueLocation, setSelectedValueLocation] = useState("");
  const [selectedValueSubLocation, setSelectedValueSubLocation] = useState("");
  const [severityLevel, setSeverityLevel] = useState("");
  const [reportedDate, setReportedDate] = useState(
    dayjs().format("DD/MM/YYYY")
  );
  const [reportedTime, setReportedTime] = useState(dayjs().format("h:mm A"));

  const [dateError, setDateError] = useState(false);
  const [timeError, setTimeError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);

  const [priorityError, setPriorityError] = useState(false);

  const [locationError, setLocationError] = useState(false);
  const [otherLocationError, setOtherLocationError] = useState(false);
  const [incidentCategoryError, setIncidentCategoryError] = useState(false);
  const [signatureUri, setSignatureUri] = useState(null);
  const [isSignatureSaved, setIsSignatureSaved] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const signatureRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryPriority, setSearchQueryPriority] = useState("");

  const [searchQueryType, setSearchQueryType] = useState("");
  const [searchQueryLocation, setSearchQueryLocation] = useState("");
  const [searchQuerySubLocation, setSearchQuerySubLocation] = useState("");

  const [ReportDetails, setReportDetails] = useState<any>([]);
  const [outcome, setOutcome] = useState("");

  const [searchQueryBagCheck, setSearchQueryBagCheck] = useState("");

  const [isLoadingMore, setIsLoadingMore] = useState(true);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [page, setPage] = useState(1);

  //police assistance
  const [policeAssistance, setPoliceAssistance] = useState("no");
  const [policeAttended, setPoliceAttended] = useState("no");
  const [policeArrestMade, setPoliceArrestMade] = useState("no");

  //emergency services
  const [emergencyServices, setEmergencyServices] = useState("no");
  const [emergencyServicesDetails, setEmergencyServicesDetails] = useState("");
  const [emergencyServicesDetailsError, setEmergencyServicesDetailsError] =
    useState(false);
  const [whichemergencyServiceschecked, setWhichemergencyServicesChecked] =
    useState({
      ambulance: false,
      fireBrigade: false,
    });
  const [checkboxError, setCheckboxError] = useState(false);
  const [ParamedicsInvolved, setParamedicsInvolved] = useState("no");

  //suspect/offender
  const [SuspectOffender, setSuspectOffender] = useState("no");
  const [GenderofOffender, setGenderofOffender] = useState([
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Transgender", value: "Transgender" },
    { label: "Other", value: "Other" },
  ]);
  const [selectedGender, setSelectedGender] = useState("");
  const [OffenderGenderError, setOffenderGenderError] = useState(false);
  const [race, setRace] = useState([
    { label: "Caucasian", value: "Caucasian" },
    { label: "Asian", value: "Asian" },
    { label: "African", value: "African" },
    { label: "Middle Eastern", value: "Middle Eastern" },
    { label: "Southern European", value: "Southern European" },
    { label: "Indigenous Australian", value: "Indigenous Australian" },
    { label: "Other", value: "Other" },
  ]);

  const [selectedRace, setSelectedRace] = useState("");
  const [describeOffenderRaceError, setdescribeOffenderRaceError] =
    useState(false);
  const [otherRace, setOtherRace] = useState("");
  const [otherRaceError, setOtherRaceError] = useState(false);
  const [describeOffender, setdescribeOffender] = useState("");
  const [describeOffenderError, setdescribeOffenderError] = useState(false);
  const [offenderStaffMember, setOffenderStaffMember] = useState("no");
  const [offenderSeen, setOffenderSeen] = useState("no");
  const [witness, setWitness] = useState("no");
  const [witnessType, setWitnessType] = useState([
    {
      label: "Other ICORP Security Officer",
      value: "Other ICORP Security Officer",
    },
    { label: "Victim", value: "Victim" },
    { label: "Staff", value: "Staff" },
    { label: "Member Of Public", value: "Member Of Public" },
    { label: "Shopping Center Security", value: "Shopping Center Security" },
    { label: "Other", value: "Other" },
  ]);
  const [selectedwitnessType, setSelectedWitnessType] = useState("");
  const [selectedwitnessTypeError, setselectedwitnessTypeError] =
    useState(false);
  const [otherWitnessType, setOtherWitnessType] = useState("");
  const [otherWitnessTypeError, setotherWitnessTypeError] = useState(false);

  const [witnessDetails, setWitnessDetails] = useState("");
  const [witnessDetailsError, setWitnessDetailsError] = useState(false);

  const [selectedValueCompletedBag, setSelectedValueCompletedBag] =
    useState("");
  const [bagError, setBagError] = useState(false);

  const [completedBag, setCompletedBag] = useState([]);
  const [notCompletedBag, setNotCompletedBag] = useState([]);

  const [wasTheft, setWasTheft] = useState("no");
  const [foundEmptyPackaging, setFoundEmptyPackaging] = useState("yes");
  const [descriptionOfProperty, setDescriptionOfProperty] = useState("");
  const [valueRecovered, setValueRecovered] = useState("");
  const [valueLost, setValueLost] = useState("");
  const [errorRecovered, setErrorRecovered] = useState(false);
  const [errorLost, setErrorLost] = useState(false);

  const [damageDescriptionOfProperty, setDamageDescriptionOfProperty] =
    useState("");
  const [suspiciousFoundEmptyPackaging, setSuspiciousFoundEmptyPackaging] =
    useState("yes");
  const [armed, setArmed] = useState(false);
  const [weaponTypes, setWeaponTypes] = useState([]);
  const [selectedWeapons, setSelectedWeapons] = useState([]);
  const [otherWeapon, setOtherWeapon] = useState("");

  // const [isInjuredActive, setIsInjuredActive] = useState(false);
  const [injured, setnjured] = useState("no");
  const [selectedInjured, setSelectedInjured] = useState([]);
  const [injuredData, setInjuredData] = useState([]);
  const [otherInjured, setOtherInjured] = useState("");
  const [injuredError, setInjuredError] = useState(false);

  const [medicalAttention, setMedicalAttention] = useState([]);
  const [selectedMedicalAttention, setSelectedMedicalAttention] = useState([]);

  const [reportToClient, setReportToClient] = useState("no");
  const [clientName, setClientName] = useState("");
  const [clientNameError, setClientNameError] = useState(false);

  const [isSignatureBase64, setIsSignatureBase64] = useState(false);

  const [sidebarTranslateX] = useState(new Animated.Value(-windowWidth * 0.7));

  const bunningId = NEXT_PUBLIC_BUNNING_ID;
  const bagCheckId = NEXT_PUBLIC_BAG_CHECK_ID;
  const theftId = NEXT_PUBLIC_THEFT_ID;
  const armedId = NEXT_PUBLIC_ARMED_ID;
  const damageId = NEXT_PUBLIC_DAMAGE_ID;
  const suspiciousId = NEXT_PUBLIC_SUSPICIOUS_ID;

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          if (status === "draft") {
            const url = `${SERVER_URL_ROASTERING}/get/security/incident/report/${id}`;
            const response = await axios.get(url, { withCredentials: true });

            if (response?.status === 200) {
              // console.log(
              //   "Report Details injured:",
              //   response?.data.securityIncident.bagReceiptCheckDetails
              // );
              // console.log("Report Details:", response?.data.securityIncident);

              // console.log("Pictures:", response?.data.maintenanceIssue.pictures);

              // Extract and format date & time
              const IncidentReport = response?.data?.securityIncident;
              const reportedAt = IncidentReport?.reportedAt;
              const activityType = IncidentReport?.incidentCategory;
              const subType = IncidentReport?.typeOfIncidentCategory;

              const severityLevel = IncidentReport?.severityLevel;
              const location = IncidentReport?.location;
              const subLocation = IncidentReport?.subLocation;
              const otherLocation = IncidentReport?.otherLocation;
              const Details = IncidentReport?.detailsOfIncident;
              const outCome = IncidentReport?.outCome;
              const PoliceAssitance = IncidentReport?.policeAssistance;
              const policeAttended = IncidentReport?.policeAttended;
              const arrestMade = IncidentReport?.arrestMade;
              const emergencyServices = IncidentReport?.emergencyServices;
              const whichEmergencyServices =
                IncidentReport?.whichEmergencyServices;
              const emergencyServiceDetails =
                IncidentReport?.emergencyServiceDetails;
              const paramedicsInvolved = IncidentReport?.paramedicsInvolved;
              const suspectOrOffender = IncidentReport?.suspectOrOffender;
              const suspectOrOffenderDetails =
                IncidentReport?.suspectOrOffenderDetails;
              const witness = IncidentReport?.witness;
              const witnessDetails = IncidentReport?.witnessDetails;
              const dutyManager = IncidentReport?.dutyManager;
              const dutyManagerDetails = IncidentReport?.dutyManagerDetails;
              const anyoneInjured = IncidentReport?.anyoneInjured;
              const anyoneInjuredDetails = IncidentReport?.anyoneInjuredDetails;
              const bagReceiptCheck = IncidentReport?.bagReceiptCheck;
              const bagReceiptCheckDetails =
                IncidentReport?.bagReceiptCheckDetails;
              const wasThereTheft = IncidentReport?.wasThereTheft;
              const wasThereTheftDetails = IncidentReport?.wasThereTheftDetails;
              const damageVandalism = IncidentReport?.damageVandalism;
              const damageVandalismDetails =
                IncidentReport?.damageVandalismDetails;
              const suspiciousBehaviour = IncidentReport?.suspiciousBehaviour;
              const suspiciousBehaviourDetails =
                IncidentReport?.suspiciousBehaviourDetails;

              if (reportedAt) {
                setReportedDate(moment.utc(reportedAt).format("DD/MM/YYYY")); // Ensures UTC date
                setReportedTime(moment.utc(reportedAt).format("hh:mm A")); // Ensures UTC time
              }
              if (activityType?._id) {
                setSelectedValue(activityType._id);
                setActive(activityType._id);
                if (activityType?._id === armedId) {
                  setArmed(true);
                  setSuspectOffender("yes");
                } else {
                  setArmed(false);
                }
              }
              if (subType?._id) {
                setSelectedValueType(subType._id);
              }
              if (severityLevel) {
                setSeverityLevel(severityLevel);
              }
              if (location?._id) {
                setSelectedValueLocation(location._id);
              }
              if (subLocation?._id) {
                setSelectedValueSubLocation(subLocation._id);
                setSubLocations((prev: any) => {
                  const exists = prev.some(
                    (subloc: any) => subloc.value === subLocation._id
                  );
                  if (!exists) {
                    return [
                      ...prev,
                      {
                        label: capitalizeFirstLetter(subLocation.name),
                        value: subLocation._id,
                      },
                    ];
                  }
                  return prev;
                });
              }
              if (otherLocation) {
                setOtherLocation(otherLocation);
              }
              if (Details) {
                setDescription(Details);
              }
              if (outCome) {
                setOutcome(outCome);
              }
              if (PoliceAssitance) {
                setPoliceAssistance(PoliceAssitance ? "yes" : "no");
              }
              if (policeAttended) {
                setPoliceAttended(policeAttended ? "yes" : "no");
              }
              if (arrestMade) {
                setPoliceArrestMade(arrestMade ? "yes" : "no");
              }
              if (emergencyServices) {
                setEmergencyServices(emergencyServices ? "yes" : "no");
                if (whichEmergencyServices) {
                  setWhichemergencyServicesChecked({
                    ambulance: whichEmergencyServices.ambulance || false,
                    fireBrigade: whichEmergencyServices.fireBrigade || false,
                  });
                }
              }
              if (emergencyServiceDetails) {
                setEmergencyServicesDetails(emergencyServiceDetails);
              }
              if (paramedicsInvolved) {
                setParamedicsInvolved(paramedicsInvolved ? "yes" : "no");
              }
              if (suspectOrOffender) {
                setSuspectOffender(suspectOrOffender ? "yes" : "no");
                if (suspectOrOffenderDetails) {
                  setSelectedGender(suspectOrOffenderDetails?.gender);
                  setSelectedRace(suspectOrOffenderDetails?.raceAppearance);
                  if (
                    suspectOrOffenderDetails?.raceAppearance !== undefined &&
                    suspectOrOffenderDetails?.raceAppearance !== ""
                  ) {
                    const raceValue = race.find(
                      (option) =>
                        option.label ===
                        suspectOrOffenderDetails?.raceAppearance
                    );
                    const raceOther = race.find(
                      (option) => option.label === "Other"
                    );

                    // console.log("raceValue", raceValue);
                    // console.log("raceOther", raceOther);

                    if (raceValue) {
                      // If race exists in the list, select it
                      setSelectedRace(raceValue.label);
                      setOtherRace(""); // Clear Other input
                    } else {
                      // If no match is found, set "Other" as selected type and store the unmatched race in the Other text box
                      if (raceOther) {
                        setSelectedRace("Other");
                        setOtherRace(suspectOrOffenderDetails?.raceAppearance);
                      } else {
                        // If "Other" option is also missing, reset everything
                        setSelectedRace(null);
                        setOtherRace("");
                      }
                    }
                  } else {
                    setSelectedRace(null);
                    setOtherRace("");
                  }

                  setdescribeOffender(suspectOrOffenderDetails?.description);
                  setOffenderStaffMember(
                    suspectOrOffenderDetails?.staffMember ? "yes" : "no"
                  );
                  setOffenderSeen(
                    suspectOrOffenderDetails?.offenderSeen ? "yes" : "no"
                  );
                  if (suspectOrOffenderDetails?.typeOfWeapon) {
                    const { weapon, otherWeapon } =
                      suspectOrOffenderDetails.typeOfWeapon;

                    // Extract _id values for selected weapons
                    const weaponIds = weapon?.map((item) => item._id) || [];
                    setSelectedWeapons(weaponIds);

                    // If "Other" weapon is provided, add it to selection
                    if (otherWeapon) {
                      setSelectedWeapons((prev) => [...prev, "other"]);
                      setOtherWeapon(otherWeapon);
                    }
                  }
                }
              }
              if (witness) {
                setWitness(witness ? "yes" : "no");

                if (witnessDetails) {
                  // const { witnessType, nameOrEmailOrPhone } = witnessDetails;

                  // Store witness details (name, email, phone)
                  setWitnessDetails(witnessDetails?.nameOrEmailOrPhone);

                  if (
                    witnessDetails?.witnessType !== undefined &&
                    witnessDetails?.witnessType !== ""
                  ) {
                    const witnessTypeValue = witnessType.find(
                      (option) => option.label === witnessDetails?.witnessType
                    );
                    const witnessTypeOther = witnessType.find(
                      (option) => option.label === "Other"
                    );

                    // console.log("witnessTypeValue", witnessTypeValue);
                    // console.log("witnessTypeOther", witnessTypeOther);

                    if (witnessTypeValue) {
                      setSelectedWitnessType(witnessTypeValue.label);
                      setOtherWitnessType("");

                      if (witnessTypeValue.label === "Other") {
                        // setwitnessTypeOption(true);
                        setOtherWitnessType(witnessDetails?.witnessType);
                      }
                    } else if (witnessTypeOther) {
                      setSelectedWitnessType("Other");
                      setOtherWitnessType(witnessDetails?.witnessType);
                    } else {
                      setSelectedWitnessType(null);
                      setOtherWitnessType("");
                    }
                  } else {
                    setSelectedWitnessType(null);
                    setOtherWitnessType("");
                  }
                }
              }
              if (dutyManager) {
                setReportToClient(dutyManager ? "yes" : "no");
                setClientName(dutyManagerDetails?.dutyManagerName);
              }
              if (anyoneInjured) {
                setnjured(anyoneInjured ? "yes" : "no");
                if (anyoneInjuredDetails) {
                  const { whoWasInjured, medicalAttentionProvided } =
                    anyoneInjuredDetails;

                  // Extract _id values for selected injuries
                  const injuredIds =
                    whoWasInjured?.injured?.map((item) => item._id) || [];
                  setSelectedInjured(injuredIds);

                  // Set "Other" injured if exists
                  if (whoWasInjured?.otherInjured) {
                    setSelectedInjured((prev) => [...prev, "other"]);
                    setOtherInjured(whoWasInjured.otherInjured);
                  }

                  // Extract _id values for medical attention
                  const medicalAttentionIds =
                    medicalAttentionProvided?.map((item) => item._id) || [];
                  setSelectedMedicalAttention(medicalAttentionIds);
                }
              }
              if (bagReceiptCheck) {
                if (bagReceiptCheckDetails) {
                  setSelectedValueCompletedBag(
                    bagReceiptCheckDetails?.noCompleted?._id
                  );
                  setWasTheft(
                    bagReceiptCheckDetails?.wasThereTheft ? "yes" : "no"
                  );
                  setFoundEmptyPackaging(
                    bagReceiptCheckDetails?.wasThereTheftDetails
                      ?.findEmptyPackaging || "no"
                  );
                  setDescriptionOfProperty(
                    bagReceiptCheckDetails?.wasThereTheftDetails
                      ?.descriptionOfProperty || ""
                  );
                  setValueRecovered(
                    bagReceiptCheckDetails?.wasThereTheftDetails?.propertyRecovered?.toString() ||
                    "0"
                  );
                  setValueLost(
                    bagReceiptCheckDetails?.wasThereTheftDetails?.propertyLost?.toString() ||
                    "0"
                  );
                }
              }
              if (wasThereTheft) {
                if (wasThereTheftDetails) {
                  setFoundEmptyPackaging(
                    wasThereTheftDetails?.findEmptyPackaging || "no"
                  );
                  setDescriptionOfProperty(
                    wasThereTheftDetails?.descriptionOfProperty || ""
                  );
                  setValueRecovered(
                    wasThereTheftDetails?.propertyRecovered?.toString() || "0"
                  );
                  setValueLost(
                    wasThereTheftDetails?.propertyLost?.toString() || "0"
                  );
                }
              }
              if (damageVandalism) {
                if (damageVandalismDetails) {
                  setDamageDescriptionOfProperty(
                    damageVandalismDetails?.descriptionOfProperty
                  );
                }
              }
              if (suspiciousBehaviour) {
                if (suspiciousBehaviourDetails) {
                  setSuspiciousFoundEmptyPackaging(
                    suspiciousBehaviourDetails?.findEmptyPackaging || "no"
                  );
                }
              }

              if (IncidentReport?.pictures) {
                setImageUris(
                  IncidentReport.pictures.map((pic: any) => ({
                    _id: pic._id,
                    url: pic.url,
                  }))
                );
              }
              if (IncidentReport?.signature) {
                setSignatureUri(IncidentReport.signature);
                setIsSignatureSaved(true);
                setIsSignatureBase64(false); // New signature is base64
              }
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false); // Stop loader
        }
      };

      fetchData();
    }, [status, id]) // Re-run when status or id changes
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        let page = 1; // Start with the first page
        let allData = []; // Array to store all fetched data
        let totalCount = 0; // Total number of items

        const fetchPage = async (page) => {
          const params = {
            page: page,
            limit: 10, // Limit per request
            report: "securityIncident",
          };

          let header = [];
          let subHeader = [];

          if (active === bagCheckId) {
            header = ["BagReceiptCheck", "AnyoneInjured"];
            subHeader = [
              "BagReceiptCheckNo.completed",
              "BagReceiptCheckNo.ofCustomersNotPaid?",
              "WhoWasInjured",
              "MedicalAttentionProvided",
            ];
          } else if (active === armedId) {
            header = ["SuspectOrOffender", "AnyoneInjured"];
            subHeader = [
              "TypeOfWeapon",
              "WhoWasInjured",
              "MedicalAttentionProvided",
            ];
          } else {
            header = ["AnyoneInjured"];
            subHeader = ["WhoWasInjured", "MedicalAttentionProvided"];
          }

          if (header.length) {
            header.forEach((value, index) => {
              params[`header[${index}]`] = value;
            });
          }

          if (subHeader.length) {
            subHeader.forEach((value, index) => {
              params[`subHeader[${index}]`] = value;
            });
          }

          const url = `${SERVER_URL_ROASTERING}/get/all/report/fields`;

          const response = await axios.get(url, {
            params: params,
            withCredentials: true,
          });

          if (response?.status === 200) {
            const data = response?.data?.reportFields || [];
            totalCount = response?.data?.total || 0; // Update total count if available

            allData = [...allData, ...data]; // Append new data

            if (allData.length < totalCount) {
              // Fetch next page if there's more data to fetch
              await fetchPage(page + 1);
            } else {
              // Once all data is fetched, set the state
              setReportFields(allData);
            }
          } else {
            console.error(
              "API request failed:",
              response?.status,
              response?.statusText
            );
          }
        };

        await fetchPage(page); // Start fetching pages
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [active]);

  const renderWeaponRow = (weaponTypes) => {
    const rows = [];
    for (let i = 0; i < weaponTypes.length; i += 2) {
      rows.push(weaponTypes.slice(i, i + 2)); // Create rows of 2
    }
    return rows;
  };

  const renderInjuredRow = (injuredData) => {
    const rows = [];
    for (let i = 0; i < injuredData.length; i += 2) {
      rows.push(injuredData.slice(i, i + 2)); // Create rows of 2
    }
    return rows;
  };

  useEffect(() => {
    if (reportFields && reportFields?.length > 0) {
      const filterBagReceiptChecksCompleted = reportFields.filter(
        (item) =>
          item.header === "BagReceiptCheck" &&
          item.subHeader === "BagReceiptCheckNo.completed"
      );
      // Transform the data into the label-value structure
      const transformedCompletedBag = filterBagReceiptChecksCompleted.map(
        (item) => ({
          label: item.lableValue, // Use lableValue as the label
          value: item._id, // Use _id as the value
        })
      );

      setCompletedBag(transformedCompletedBag);
      // console.log(filterBagReceiptChecksCompleted);

      const filterBagChecksNonPayingCustomers = reportFields.filter(
        (item) =>
          item.header === "BagReceiptCheck" &&
          item.subHeader === "BagReceiptCheckNo.ofCustomersNotPaid?"
      );
      setNotCompletedBag(filterBagChecksNonPayingCustomers);
      // console.log(filterBagChecksNonPayingCustomers);

      const filterWeaponTypes = reportFields.filter(
        (item) =>
          item.header === "SuspectOrOffender" &&
          item.subHeader === "TypeOfWeapon"
      );

      const extendedWeaponTypes = [
        ...filterWeaponTypes,
        {
          _id: "other",
          lableValue: "Other",
        },
      ];
      // console.log("weapons", extendedWeaponTypes);

      setWeaponTypes(extendedWeaponTypes);

      const filterInjuredData = reportFields.filter(
        (item) =>
          item.header === "AnyoneInjured" && item.subHeader === "WhoWasInjured"
      );

      const extendedInjuredData = [
        ...filterInjuredData,
        {
          _id: "other",
          lableValue: "Other",
        },
      ];

      setInjuredData(extendedInjuredData);

      const filterMedicalAttention = reportFields.filter(
        (item) =>
          item.header === "AnyoneInjured" &&
          item.subHeader === "MedicalAttentionProvided"
      );
      // console.log("filterMedicalAttention", filterMedicalAttention);

      setMedicalAttention(filterMedicalAttention);
    }
  }, [reportFields]);

  const handleCheckboxChangeDynamicFeilds = (
    item,
    selectedItems,
    setSelectedItems
  ) => {
    if (item === "other") {
      // Match the `_id` value for "Other"
      setSelectedItems((prev) => {
        if (prev.includes("other")) {
          // Remove "other" if it's already selected
          return prev.filter((i) => i !== "other");
        } else {
          // Add "other" if it's not selected
          return [...prev, "other"];
        }
      });
    } else {
      // For other types, toggle selection as usual
      setSelectedItems((prev) => {
        if (prev.includes(item)) {
          return prev.filter((i) => i !== item);
        } else {
          return [...prev, item];
        }
      });
    }
  };

  const onWeaponCheckboxPress = (weapon: string) => {
    handleCheckboxChangeDynamicFeilds(
      weapon,
      selectedWeapons,
      setSelectedWeapons
    );
  };

  const onInjuredCheckboxPress = (injured: string) => {
    handleCheckboxChangeDynamicFeilds(
      injured,
      selectedInjured,
      setSelectedInjured
    );
  };

  const handleCheckboxChange = (option: string | number) => {
    setWhichemergencyServicesChecked((prevState) => ({
      ...prevState,
      [option]: !prevState[option],
    }));
  };
  const validateCheckbox = () => {
    const { ambulance, fireBrigade } = whichemergencyServiceschecked;
    if (!ambulance && !fireBrigade) {
      setCheckboxError(true);
      return false;
    }
    setCheckboxError(false);
    return true;
  };

  // const toggleSidebar = () => {
  //   if (isSidebarOpen) {
  //     const toValue = -windowWidth * 0.7;

  //     sidebarTranslateX.setValue(toValue);

  //     setIsSidebarOpen(false);
  //   } else {
  //     setIsSidebarOpen(true);

  //     const toValue = 0;

  //     Animated.timing(sidebarTranslateX, {
  //       toValue,
  //       duration: 300,
  //       easing: Easing.linear,
  //       useNativeDriver: false,
  //     }).start();
  //   }
  // };
  const handleSearchQueryBag = (query: any) => {
    setSearchQueryBagCheck(query);
  };

  const handleSearchQueryChange = (query: any) => {
    setSearchQuery(query);
  };
  const handleSearchQueryType = (query: any) => {
    setSearchQueryType(query);
  };
  const handleSearchQueryLocation = (query: any) => {
    setSearchQueryLocation(query);
  };

  const handleSearchQuerySubLocation = (query: any) => {
    setSearchQuerySubLocation(query);
  };

  const hideDialog = () => setVisible(false);

  const handleDescriptionChange = (text: any) => {
    setDescription(text);
    setDescriptionError(text.trim() === "");
  };

  const handleLocationChange = (locationValue: any) => {
    setSelectedValueLocation(locationValue);
    setLocationError(locationValue.trim() === "");

    if (locationValue === "other") {
      // Clear sub-locations if "Other" is selected
      setSubLocations([]);
      return;
    }

    // Find the selected location and update sub-locations
    const selectedLocation = locations.find(
      (location) => location.value === locationValue
    );

    if (selectedLocation) {
      setSubLocations(
        selectedLocation.subLocations.map((sub: any) => ({
          label: capitalizeFirstLetter(sub.name),
          value: sub._id,
        }))
      );
    } else {
      setSubLocations([]); // Clear sub-locations if no location is selected
    }
  };

  const handleSubLocationChange = (text: any) => {
    setSelectedValueSubLocation(text);
    // setLocationError(text.trim() === '');
  };

  const handleOtherLocationChange = (text: any) => {
    setOtherLocation(text);
    setOtherLocationError(text.trim() === "");
  };

  const handleEmergencyServicesDetailsChange = (text: any) => {
    setEmergencyServicesDetails(text);
    setEmergencyServicesDetailsError(text.trim() === "");
  };

  const handleOutcomeChange = (text: any) => {
    setOutcome(text);
  };

  const handleGenderChange = (text: any) => {
    setSelectedGender(text);
    setOffenderGenderError(text.trim() === "");
  };

  const handleResetGender = () => {
    setSelectedGender("");
  };

  const handleRaceChange = (text: any) => {
    setSelectedRace(text);
    setdescribeOffenderRaceError(text.trim() === "");
  };
  const handleResetRace = () => {
    setSelectedRace("");
  };

  const handleOtherRaceChange = (text: any) => {
    setOtherRace(text);
    setOtherRaceError(text.trim() === "");
  };
  const handleDescribeOffenderChange = (text: any) => {
    setdescribeOffender(text);
    setdescribeOffenderError(text.trim() === "");
  };

  const handleWitnessTypeChange = (text: any) => {
    setSelectedWitnessType(text);
    setselectedwitnessTypeError(text.trim() === "");
  };
  const handleResetWitnessType = () => {
    setSelectedWitnessType("");
  };
  const handleOtherWintessChange = (text: any) => {
    setOtherWitnessType(text);
    setotherWitnessTypeError(text.trim() === "");
  };

  const handleWitnessDetailsChange = (text: any) => {
    setWitnessDetails(text);
    setWitnessDetailsError(text.trim() === "");
  };

  const openModal = () => setModalVisible(true);
  const closeModal = () => {
    setModalVisible(false);
    navigation.navigate('UserHome' as never);
  };

  const saveSign = () => {
    if (signatureRef.current) {
      signatureRef.current.saveImage();
    }
  };

  // Method to reset the signature
  const resetSign = () => {
    if (signatureRef.current) {
      signatureRef.current.resetImage();
      setIsSignatureBase64(false);
    }
    setSignatureUri(null);
    setIsSignatureSaved(false);
    setHasDrawn(false); // Reset drawing state
  };

  const onSaveEvent = (result) => {
    if (result.encoded) {
      setSignatureUri(result.encoded);
      setIsSignatureSaved(true); // ✅ User has saved signature
      setHasDrawn(false); // ✅ Reset hasDrawn because it's now saved
      setIsSignatureBase64(true);
    }
  };

  const handleDrawEvent = () => {
    // console.log("ffdfd");

    setHasDrawn(true); // ✅ User has drawn something
  };

  const toggleOverlay = () => {
    setOverlayVisible(!overlayVisible);
  };

  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === "android") {
      if (event.type === "set") {
        const currentDate = selectedDate || date;
        setShowDatePicker(false);
        setDate(currentDate);
        setReportedDate(dayjs(currentDate).format("DD/MM/YYYY"));
      } else {
        setShowDatePicker(false);
      }
    }
  };

  const onChangeTime = (event, selectedTime) => {
    if (Platform.OS === "android") {
      if (event.type === "set") {
        const currentTime = selectedTime || time;
        setShowTimePicker(false);
        setTime(currentTime);
        setReportedTime(dayjs(currentTime).format("h:mm A"));
      } else {
        setShowTimePicker(false);
      }
    }
  };

  const showIOSDatePicker = () => {
    setIOSDatePickerVisible(true);
  };
  const hideIOSDatePicker = () => setIOSDatePickerVisible(false);

  const showIOSTimePicker = () => setIOSTimePickerVisible(true);
  const hideIOSTimePicker = () => setIOSTimePickerVisible(false);

  const handleIOSDateConfirm = (selectedDate) => {
    hideIOSDatePicker();
    const currentDate = selectedDate || date;
    setDate(currentDate);
    setReportedDate(dayjs(currentDate).format("DD/MM/YYYY"));
  };

  const handleIOSTimeConfirm = (selectedTime) => {
    hideIOSTimePicker();
    const currentTime = selectedTime || time;
    setTime(currentTime);
    setReportedTime(dayjs(currentTime).format("h:mm A"));
  };
  const MAX_IMAGES = 10;
  const MAX_SIZE_MB = 17;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  // const handleImagePicker = async () => {
  //   try {
  //     // Check and request camera permission
  //     const cameraPermissionStatus = await check(PERMISSIONS.ANDROID.CAMERA);

  //     if (cameraPermissionStatus !== RESULTS.GRANTED) {
  //       const requestResult = await request(PERMISSIONS.ANDROID.CAMERA);
  //       if (requestResult === RESULTS.GRANTED) {
  //         console.log("Camera permission granted");
  //       } else {
  //         console.log("Camera permission denied");
  //         return; // Early exit if permission is denied
  //       }
  //     } else {
  //       console.log("Camera permission already granted");
  //     }

  //     // Start capturing images
  //     let capturing = true;
  //     while (capturing) {
  //       if (imageUris.length >= MAX_IMAGES) {
  //         Alert.alert(
  //           "Limit Exceeded",
  //           `You can only capture up to ${MAX_IMAGES} images.`
  //         );
  //         return;
  //       }

  //       const image = await ImagePicker.openCamera({
  //         cropping: false,
  //         includeBase64: false,
  //         compressImageQuality: 0.5,
  //       });

  //       if (image && image.path) {
  //         // Calculate the total size of existing images
  //         const existingSize = await imageUris.reduce(
  //           async (sumPromise, img) => {
  //             const sum = await sumPromise;
  //             try {
  //               const size = await getImageSize(img.url); // Ensure we are using img.url here
  //               return sum + size;
  //             } catch (error) {
  //               console.log(
  //                 "Error getting image size for existing image:",
  //                 error
  //               );
  //               return sum; // Fallback if size retrieval fails
  //             }
  //           },
  //           Promise.resolve(0)
  //         );

  //         // Get the size of the new captured image
  //         const imageSize = await getImageSize(image.path);

  //         // Calculate the total size including the new image
  //         const totalSize = existingSize + imageSize;

  //         // Check if the total size exceeds the maximum allowed size
  //         if (totalSize > MAX_SIZE_BYTES) {
  //           Alert.alert(
  //             "Size Limit Exceeded",
  //             `The total size of selected images should not exceed ${MAX_SIZE_MB}MB.`
  //           );
  //           return;
  //         }

  //         // Update the state with the new image (stored as { _id: null, url: image.path })
  //         setImageUris((prevUris) => [
  //           ...prevUris,
  //           { _id: null, url: image.path }, // Storing as an object
  //         ]);
  //       }
  //       capturing = false; // Exit the loop after capturing one image
  //     }
  //   } catch (error) {
  //     console.log("ImagePicker Error:", error);
  //   }
  // };

  const getImageSize = async (path: any) => {
    try {
      const fileStats = await stat(path);
      return fileStats.size; // Size in bytes
    } catch (error) {
      console.log("Error getting image size:", error);
      return 0;
    }
  };

  // const openGallery = async () => {
  //   try {
  //     const currentImageCount = imageUris.length;
  //     // If the number of existing images is already 10, prevent further selection
  //     if (currentImageCount >= MAX_IMAGES) {
  //       Alert.alert(
  //         "Limit Exceeded",
  //         `You can only select up to ${MAX_IMAGES} images.`
  //       );
  //       return;
  //     }

  //     // Pick images from the gallery
  //     const result = await launchImageLibrary({
  //       mediaType: "photo",
  //       selectionLimit: MAX_IMAGES - currentImageCount, // Set max number of selectable images
  //     });

  //     if (result.didCancel) {
  //       console.log("User cancelled image picker");
  //       return;
  //     }

  //     if (result.errorCode) {
  //       console.log("ImagePicker Error:", result.errorMessage);
  //       return;
  //     }

  //     // Combine existing URIs with new URIs
  //     const newImages = result.assets.map((asset) => ({
  //       _id: null, // No ID for newly picked images
  //       url: asset.uri,
  //     }));
  //     const combinedUris = [...imageUris, ...newImages];

  //     // Check if the total number of images exceeds MAX_IMAGES
  //     if (combinedUris.length > MAX_IMAGES) {
  //       Alert.alert(
  //         "Image Limit Exceeded",
  //         `You can only select up to ${MAX_IMAGES} images.`
  //       );
  //       return;
  //     }

  //     // Calculate the size of new images
  //     const newImageSizes = await Promise.all(
  //       result.assets.map(async (asset) => {
  //         try {
  //           return await getImageSize(asset.uri);
  //         } catch (error) {
  //           console.log("Error getting image size for new image:", error);
  //           return 0;
  //         }
  //       })
  //     );
  //     const totalNewSize = newImageSizes.reduce((sum, size) => sum + size, 0);

  //     // Calculate the total size of existing images
  //     const existingSize = await imageUris.reduce(async (sumPromise, uri) => {
  //       const sum = await sumPromise;
  //       try {
  //         const size = await getImageSize(uri);
  //         return sum + size;
  //       } catch (error) {
  //         console.log("Error getting image size for existing image:", error);
  //         return sum;
  //       }
  //     }, Promise.resolve(0));

  //     // Check if the total size of all images exceeds MAX_SIZE_BYTES
  //     if (totalNewSize + existingSize > MAX_SIZE_BYTES) {
  //       Alert.alert(
  //         "Size Limit Exceeded",
  //         `The total size of selected images should not exceed ${MAX_SIZE_MB}MB.`
  //       );
  //       return;
  //     }

  //     // Update state with the valid images
  //     setImageUris((prevUris) => [...prevUris, ...newImages]);
  //   } catch (err) {
  //     console.log("ImagePicker Error:", err);
  //   }
  // };


  const openGallery = async () => {
    try {
      const currentImageCount = imageUris.length;
      // If the number of existing images is already 10, prevent further selection
      if (currentImageCount >= MAX_IMAGES) {
        Alert.alert(
          "Limit Exceeded",
          `You can only select up to ${MAX_IMAGES} images.`
        );
        return;
      }
      // Pick images from the gallery
      const result = await launchImageLibrary({
        mediaType: "photo",
        selectionLimit: MAX_IMAGES - currentImageCount, // Set max number of selectable images
      });
      if (result.didCancel) {
        console.log("User cancelled image picker");
        return;
      }
      if (result.errorCode) {
        console.log("ImagePicker Error:", result.errorMessage);
        return;
      }
      // Combine existing URIs with new URIs
      const newImages = result.assets.map((asset) => ({
        _id: null, // No ID for newly picked images
        url: asset.uri,
      }));
      const combinedUris = [...imageUris, ...newImages];
      // Check if the total number of images exceeds MAX_IMAGES
      if (combinedUris.length > MAX_IMAGES) {
        Alert.alert(
          "Image Limit Exceeded",
          `You can only select up to ${MAX_IMAGES} images.`
        );
        return;
      }
      // Calculate the size of new images
      const newImageSizes = await Promise.all(
        result.assets.map(async (asset) => {
          try {
            return await getImageSize(asset.uri);
          } catch (error) {
            console.log("Error getting image size for new image:", error);
            return 0;
          }
        })
      );
      const totalNewSize = newImageSizes.reduce((sum, size) => sum + size, 0);
      // Calculate the total size of existing images
      const existingSize = await imageUris.reduce(async (sumPromise, uri) => {
        const sum = await sumPromise;
        try {
          const size = await getImageSize(uri);
          return sum + size;
        } catch (error) {
          console.log("Error getting image size for existing image:", error);
          return sum;
        }
      }, Promise.resolve(0));
      // Check if the total size of all images exceeds MAX_SIZE_BYTES
      if (totalNewSize + existingSize > MAX_SIZE_BYTES) {
        Alert.alert(
          "Size Limit Exceeded",
          `The total size of selected images should not exceed ${MAX_SIZE_MB}MB.`
        );
        return;
      }
      // Update state with the valid images
      setImageUris((prevUris) => [...prevUris, ...newImages]);
    } catch (err) {
      console.log("ImagePicker Error:", err);
    }
  };
  const handleImagePicker = async () => {
    try {
      // Determine the correct permission based on the platform
      const cameraPermissionStatus = await check(PERMISSIONS.ANDROID.CAMERA);
      if (cameraPermissionStatus !== RESULTS.GRANTED) {
        const requestResult = await request(PERMISSIONS.ANDROID.CAMERA);
        if (requestResult === RESULTS.GRANTED) {
          console.log("Camera permission granted");
        } else {
          console.log("Camera permission denied");
        }
      } else {
        console.log("Camera permission already granted");
      }
      // Ensure imageUris is always an array to prevent crashes
      if (!Array.isArray(imageUris)) {
        console.log("imageUris is not an array, resetting to an empty array.");
        setImageUris([]);
      }
      // Check if maximum image limit is reached
      if (imageUris.length >= MAX_IMAGES) {
        Alert.alert("Limit Exceeded", `You can only capture up to ${MAX_IMAGES} images.`);
        return;
      }
      // Capture image from camera
      const image = await ImagePicker.openCamera({
        cropping: false,
        includeBase64: false,
        compressImageQuality: 0.5,
      });
      if (image && image.path) {
        // Calculate total size of existing images safely
        let existingSize = 0;
        for (const img of imageUris) {
          try {
            const size = await getImageSize(img.url || img); // Support both object & string cases
            existingSize += size;
          } catch (error) {
            console.log("Error getting image size for existing image:", error);
          }
        }
        // Get the size of the new captured image
        const imageSize = await getImageSize(image.path);
        // Validate total size limit
        if (existingSize + imageSize > MAX_SIZE_BYTES) {
          Alert.alert("Size Limit Exceeded", `Total image size cannot exceed ${MAX_SIZE_MB}MB.`);
          return;
        }
        // Generate unique ID for the new image
        // const imageId = new Date().getTime().toString();
        // Update state with the new image
        setImageUris((prevUris) => [
          ...prevUris,
          { _id: null, url: image.path }, // Store as an object with _id and url
        ]);
      }
    } catch (error) {
      console.log("ImagePicker Error:", error);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImageUris((prevUris) => {
      const updatedUris = [...prevUris];
      const removedImage = updatedUris[indexToRemove]; // Capture before removal
      updatedUris.splice(indexToRemove, 1); // Remove image

      // console.log("Updated imageUris:", updatedUris);
      // console.log("Removed Image:", removedImage);

      // If the removed image is from API, store its `_id`
      if (removedImage?.url.startsWith("https://icorp-rostering.s3")) {
        setRemovedImages((prevRemoved) => {
          const newRemoved = [...prevRemoved, removedImage._id]; // Store only ID
          // console.log("Updated removedImages:", newRemoved);
          return newRemoved;
        });
      }

      return updatedUris; // Ensure correct state update
    });

    // Calculate size for local images only (not API images)
    setTimeout(() => {
      setImageUris((prevUris) => {
        const newImages = prevUris
          .filter(
            (img) =>
              img.url && !img.url.startsWith("https://icorp-rostering.s3")
          )
          .map((img) => img.url); // Extract URLs for size check

        if (newImages.length > 0) {
          calculateTotalSize(newImages)
            .then((totalSize) => {
              if (totalSize > MAX_SIZE_BYTES) {
                Alert.alert(
                  "Size Limit Exceeded",
                  `The total size of images should not exceed ${MAX_SIZE_MB}MB.`
                );
              }
            })
            .catch((err) => console.log("Error calculating total size:", err));
        }

        return prevUris;
      });
    }, 100);
  };

  const calculateTotalSize = async (uris: string[]): Promise<number> => {
    // Calculate the total size of the images
    const sizes = await Promise.all(uris.map((uri) => getImageSize(uri)));
    return sizes.reduce((sum, size) => sum + size, 0);
  };

  function capitalizeFirstLetter(string: string): string {
    if (!string || typeof string !== "string") return ""; // Handle empty, undefined, or non-string values

    return string
      .split(" ") // Split the string into words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
      .join(" "); // Join the words back together with a space
  }

  const fetchIncidentCategory = useCallback(async () => {
    try {
      setIsLoading(true);
      const siteId = await AsyncStorage.getItem("siteId");
      const url = `${SERVER_URL_ROASTERING}/get/check/types?report=securityIncident&siteId=${siteId}`;

      const response = await axios.get(url, {
        withCredentials: true,
      });
      // console.log("response", response?.data);

      if (response?.status === 200) {
        const data = response?.data?.types || [];
        const subtypesData = response?.data?.subTypes || [];

        // Transform categories and subtypes
        const transformedCategories = data.map((item: any) => ({
          label: capitalizeFirstLetter(item.name),
          value: item._id,
          severityLevel: item.severityLevel,
          subtypes:
            subtypesData
              .filter((sub: any) => sub.incidentCategory === item._id)
              .map((sub: any) => ({
                label: capitalizeFirstLetter(sub.name),
                value: sub._id,
                severityLevel: sub.severityLevel,
              })) || [],
        }));

        setIncidentCategories(transformedCategories);
      } else {
        console.error(
          "API request failed:",
          response?.status,
          response?.statusText
        );
      }
    } catch (error) {
      console.error("Error fetching incident categories:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchIncidentType = useCallback(
    async (IncidentCategoryId: string) => {
      // console.log("IncidentCategoryId==>", IncidentCategoryId);

      try {
        setIsLoading(true);

        let page = 1; // Start with the first page
        let allData: any[] = []; // Array to store all fetched data
        let totalCount = 0; // Total number of items

        const fetchPage = async (page: number) => {
          const params = {
            search: searchQueryType,
            limit: 10,
            page: page, // Add page number to the params
            sortName: "acc",
          };
          const payload = {
            incidentCategoryId: [IncidentCategoryId],
          };
          const url = `${SERVER_URL_ROASTERING}/get/type/of/incident/category/incident/category/wise`;

          const response = await axios.post(url, payload, {
            params: params,
            withCredentials: true,
          });

          if (response?.status === 200) {
            // console.log("response==>", response.data);

            const data = response?.data?.typeOfIncidentCategories || [];
            totalCount = response?.data?.total || 0; // Update total count if available

            allData = [...allData, ...data]; // Append new data

            if (allData.length < totalCount) {
              // Fetch next page if there's more data to fetch
              await fetchPage(page + 1);
            } else {
              // Process all data once all pages are fetched
              const transformedCategories = allData.map((item: any) => ({
                label: capitalizeFirstLetter(item.name),
                value: item._id,
                severityLevel: item.severityLevel,
              }));
              setIncidentTypes(transformedCategories);
            }
          } else {
            console.error(
              "API request failed:",
              response?.status,
              response?.statusText
            );
          }
        };

        await fetchPage(page); // Start fetching pages
      } catch (error) {
        console.error("Error fetching shifts:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [searchQueryType]
  );

  const fetchLocation = useCallback(async () => {
    try {
      setIsLoading(true);
      const siteId = await AsyncStorage.getItem("siteId");
      const limit = 10;
      let allLocations: {
        label: string;
        value: string;
        subLocations?: any[];
      }[] = [];

      // First API call to get total count & first page of locations
      const initialParams = {
        search: searchQueryLocation,
        limit: limit,
        page: 1,
      };
      const url = `${SERVER_URL_ROASTERING}/get/location/site/wise/${shift.siteId._id}`;

      const initialResponse = await axios.get(url, {
        params: initialParams,
        withCredentials: true,
      });

      // console.log("Initial Location Response:", initialResponse.data);

      if (initialResponse?.status !== 200) {
        console.error(
          "API request failed:",
          initialResponse?.status,
          initialResponse?.statusText
        );
        return;
      }

      // Extract total count and first set of locations
      const totalCount = initialResponse?.data?.total || 0;
      allLocations = initialResponse?.data?.locations.map((item: any) => ({
        label: capitalizeFirstLetter(item.name),
        value: item._id,
        subLocations: item.subLocations || [],
      }));

      // Calculate total pages
      const totalPages = Math.ceil(totalCount / limit);

      // Fetch remaining pages concurrently
      const pageRequests = [];
      for (let page = 2; page <= totalPages; page++) {
        const pageRequest = axios.get(url, {
          params: { ...initialParams, page },
          withCredentials: true,
        });
        pageRequests.push(pageRequest);
      }

      // Wait for all requests to complete
      const pageResponses = await Promise.all(pageRequests);
      pageResponses.forEach((response) => {
        if (response?.status === 200) {
          const transformedLocations = response?.data?.locations.map(
            (item: any) => ({
              label: capitalizeFirstLetter(item.name),
              value: item._id,
              subLocations: item.subLocations || [],
            })
          );
          allLocations = [...allLocations, ...transformedLocations];
        }
      });

      // ✅ If locations exist, add "Other" (only once)
      if (
        allLocations.length > 0 &&
        !allLocations.some((loc) => loc.value === "other")
      ) {
        allLocations.push({ label: "Other", value: "other" });
      }

      // ✅ If no locations exist, only show "Other"
      if (allLocations.length === 0) {
        allLocations = [{ label: "Other", value: "other" }];
      }

      setLocations(allLocations);
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQueryLocation]);

  useFocusEffect(
    useCallback(() => {
      if (location) {
        setSelectedValueLocation(location);
      }
      if (subLocation) {
        // console.log(":drawing_pin: Received SubLocation ID:", subLocation);
        setSelectedValueSubLocation(subLocation);
        if (subLocations.length > 0) {
          const matchedSubLocation = subLocations.find(
            (sub: any) => sub.value === subLocation
          );
          if (matchedSubLocation) {
            setSubLocations((prev: any) => {
              const exists = prev.some(
                (subloc: any) => subloc.value === subLocation
              );
              if (!exists) {
                return [
                  ...prev,
                  {
                    label: capitalizeFirstLetter(matchedSubLocation.label),
                    value: subLocation,
                  },
                ];
              }
              return prev;
            });
          } else {
            console.log(
              ":warning: SubLocation ID not found in list:",
              subLocation
            );
          }
        } else {
          console.log(
            ":warning: subLocations array is empty, cannot find SubLocation."
          );
        }
      }
    }, [])
  );
  // Fetch locations when component mounts
  // useEffect(() => {
  //   fetchLocation();
  // }, []);
  // Ensure subLocations is updated when a new location is selected
  useEffect(() => {
    if (selectedValueLocation) {
      const selectedLoc = locations.find(
        (loc: any) => loc.value === selectedValueLocation
      );
      // console.log("selectedLoc:", selectedLoc);
      if (selectedLoc?.subLocations) {
        const formattedSubLocations = selectedLoc.subLocations.map(
          (sub: any) => ({
            label: capitalizeFirstLetter(sub.name),
            value: sub._id,
          })
        );
        setSubLocations(formattedSubLocations);
        if (selectedValueSubLocation) {
          const isSubLocationValid = formattedSubLocations.some(
            (sub: any) => sub.value === selectedValueSubLocation
          );
          if (!isSubLocationValid) {
            setSelectedValueSubLocation(""); // Reset if not found
          }
        }
      }
    }
  }, [selectedValueLocation, locations]);

  useEffect(() => {
    if (selectedValue) {
      const selectedCategory = incidentCategories.find(
        (loc: any) => loc.value === selectedValue
      );
      console.log("selectedCategory:", selectedCategory);
      if (selectedCategory?.subtypes) {
        const formattedSubTypes = selectedCategory.subtypes.map(
          (sub: any) => ({
            label: capitalizeFirstLetter(sub.label),
            value: sub._id,
          })
        );
        setIncidentTypes(formattedSubTypes);
        if (selectedValueType) {
          const isSubTypeValid = formattedSubTypes.some(
            (sub: any) => sub.value === selectedValueType
          );
          if (!isSubTypeValid) {
            setSelectedValueType(""); // Reset if not found
          }
        }
      }
    }
  }, [selectedValue, incidentCategories]);

  useFocusEffect(
    useCallback(() => {
      fetchIncidentCategory();
      fetchLocation();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);

    Promise.all([fetchIncidentCategory(), fetchLocation()])
      .then(() => {
        setIsRefreshing(false);
      })
      .catch((error) => {
        console.error("Error refreshing data:", error);
        setIsRefreshing(false);
      });
  }, [fetchIncidentCategory, fetchLocation]);

  function capitalizeAllLetter(string: string) {
    if (!string) return ""; // Handle empty or undefined strings
    return string.toUpperCase();
  }

  const handleSubmit = async (isDraft: boolean) => {
    try {
      let isValid = true;

      if (!reportedDate.trim()) {
        setDateError(true);
        isValid = false;
      } else {
        setDateError(false);
      }

      if (!reportedTime.trim()) {
        setTimeError(true);
        isValid = false;
      } else {
        setTimeError(false);
      }

      if (!selectedValue.trim()) {
        setIncidentCategoryError(true);
        isValid = false;
      } else {
        setIncidentCategoryError(false);
      }
      if (severityLevel.trim() === "") {
        setPriorityError(true);
        isValid = false;
      } else {
        setPriorityError(false);
      }

      // If NOT a draft, perform full validation
      if (!isDraft) {
        if (!selectedValueLocation.trim()) {
          setLocationError(true);
          isValid = false;
        } else {
          setLocationError(false);
        }

        if (!description.trim()) {
          setDescriptionError(true);
          isValid = false;
        } else {
          setDescriptionError(false);
        }

        if (selectedValueLocation === "other" && otherLocation.trim() === "") {
          setOtherLocationError(true);
          isValid = false;
        } else {
          setOtherLocationError(false);
        }

        if (injured === "yes" && selectedInjured.length === 0) {
          setInjuredError(true);
          isValid = false;
        } else {
          setInjuredError(false);
        }

        if (active === bagCheckId && selectedValueCompletedBag.length === 0) {
          setBagError(true);
          isValid = false;
        } else {
          setBagError(false);
        }

        if (wasTheft === "yes") {
          if (valueRecovered.trim() === "") {
            setErrorRecovered(true);
            isValid = false;
          } else {
            setErrorRecovered(false);
          }

          if (valueLost.trim() === "") {
            setErrorLost(true);
            isValid = false;
          } else {
            setErrorLost(false);
          }
        }

        if (reportToClient === "yes" && !clientName.trim()) {
          setClientNameError(true);
          isValid = false;
        } else {
          setClientNameError(false);
        }
      }
      // if (
      //   emergencyServices === 'yes' &&
      //   emergencyServicesDetails.trim() === ''
      // ) {
      //   setEmergencyServicesDetailsError(true);
      //   isValid = false;
      // } else {
      //   setEmergencyServicesDetailsError(false);
      // }

      // if (emergencyServices === 'yes' && !validateCheckbox()) {
      //   isValid = false;
      // }

      // if (SuspectOffender === 'yes') {
      //   if (selectedGender.trim() === '') {
      //     setOffenderGenderError(true);
      //     isValid = false;
      //   } else {
      //     setOffenderGenderError(false);
      //   }

      //   if (selectedRace.trim() === '') {
      //     setdescribeOffenderRaceError(true);
      //     isValid = false;
      //   } else {
      //     setdescribeOffenderRaceError(false);
      //   }

      //   if (selectedRace === 'Other' && otherRace.trim() === '') {
      //     setOtherRaceError(true);
      //     isValid = false;
      //   } else {
      //     setOtherRaceError(false);
      //   }

      //   if (describeOffender.trim() === '') {
      //     setdescribeOffenderError(true);
      //     isValid = false;
      //   } else {
      //     setdescribeOffenderError(false);
      //   }
      // }

      // if (witness === 'yes') {
      //   if (selectedwitnessType.trim() === '') {
      //     setselectedwitnessTypeError(true);
      //     isValid = false;
      //   } else {
      //     setselectedwitnessTypeError(false);
      //   }

      //   // Validate 'Other Witness Type' if the selected type requires further details
      //   if (otherWitnessType === 'Other' && otherWitnessType.trim() === '') {
      //     setotherWitnessTypeError(true);
      //     isValid = false;
      //   } else {
      //     setotherWitnessTypeError(false);
      //   }

      //   // Validate 'Witness Details'
      //   if (witnessDetails.trim() === '') {
      //     setWitnessDetailsError(true);
      //     isValid = false;
      //   } else {
      //     setWitnessDetailsError(false);
      //   }
      // }

      // if (reportedDate.trim() === "") setDateError(true);
      // if (reportedTime.trim() === "") setTimeError(true);
      // if (selectedValue.trim() === "") setIncidentCategoryError(true);
      // if (selectedValueLocation.trim() === "") setLocationError(true);
      // if (description.trim() === "") setDescriptionError(true);

      if (
        isValid
        // && reportedDate &&
        // reportedTime &&
        // selectedValue &&
        // selectedValueLocation &&
        // description
      ) {
        setIsLoading(true);
        const apiUrl =
          status === "draft"
            ? `${SERVER_URL_ROASTERING}/update/user/security/incident/report/${id}`
            : `${SERVER_URL_ROASTERING}/create/user/security/incident/report`;
        const siteId = await AsyncStorage.getItem("siteId");
        const userId = await AsyncStorage.getItem("userId");
        const positionId = await AsyncStorage.getItem("positionId");

        const combinedDateTime = moment(
          `${reportedDate} ${reportedTime}`,
          "DD/MM/YYYY hh:mm A"
        ).toISOString();

        let formattedReportedDate = null;
        if (combinedDateTime) {
          const dates = new Date(combinedDateTime);

          formattedReportedDate = new Date(
            dates.getTime() - dates.getTimezoneOffset() * 60000
          )
            .toISOString()
            .replace("Z", "912Z");

          // console.log(formattedReportedDate);
        } else {
          console.error(
            "Invalid date or time:",
            `${reportedDate} ${reportedTime}`
          );
        }

        const formData = new FormData();
        formData.append("site", shift.siteId._id);
        formData.append("incidentCategory", selectedValue);
        if (selectedValueType !== "") {
          formData.append("typeOfIncidentCategory", selectedValueType);
        }
        formData.append("severityLevel", severityLevel);
        if (selectedValueLocation && selectedValueLocation !== "other") {
          formData.append("location", selectedValueLocation);
          if (selectedValueSubLocation) {
            formData.append("subLocation", selectedValueSubLocation);
          }
        }
        if (otherLocation) {
          formData.append("otherLocation", otherLocation);
        }
        if (description) {
          formData.append("detailsOfIncident", description);
        }


        if (status === "draft") {
          formData.append("removeLocation", selectedValueLocation ? false : true);
          formData.append("removeSubLocation", selectedValueSubLocation ? false : true)
        }
        // formData.append("detailsOfIncident", description);
        formData.append("outCome", outcome ? outcome : "N/A");
        formData.append("reportedAt", formattedReportedDate);
        formData.append("users[0]", userId);
        formData.append("position", shift.positionId._id);
        formData.append(
          "policeAssistance",
          policeAssistance === "yes" ? true : false
        );
        if (policeAssistance === "yes") {
          formData.append(
            "policeAttended",
            policeAttended === "yes" ? true : false
          );
          formData.append(
            "arrestMade",
            policeArrestMade === "yes" ? true : false
          );
        }
        formData.append(
          "emergencyServices",
          emergencyServices === "yes" ? true : false
        );
        if (emergencyServices === "yes") {
          formData.append("emergencyServiceDetails", emergencyServicesDetails);
          formData.append(
            "whichEmergencyServices[ambulance]",
            whichemergencyServiceschecked.ambulance === true ? true : false
          );
          formData.append(
            "whichEmergencyServices[fireBrigade]",
            whichemergencyServiceschecked.fireBrigade === true ? true : false
          );
        }
        formData.append(
          "paramedicsInvolved",
          ParamedicsInvolved === "yes" ? true : false
        );
        formData.append(
          "suspectOrOffender",
          SuspectOffender === "yes" ? true : false
        );
        if (SuspectOffender === "yes") {
          formData.append("suspectOrOffenderDetails[gender]", selectedGender);
          if (selectedRace === "Other" && otherRace.trim() !== "") {
            formData.append(
              "suspectOrOffenderDetails[raceAppearance]",
              otherRace
            );
          } else {
            formData.append(
              "suspectOrOffenderDetails[raceAppearance]",
              selectedRace
            );
          }
          formData.append(
            "suspectOrOffenderDetails[description]",
            describeOffender
          );
          formData.append(
            "suspectOrOffenderDetails[staffMember]",
            offenderStaffMember === "yes" ? true : false
          );
          formData.append(
            "suspectOrOffenderDetails[offenderSeen]",
            offenderSeen === "yes" ? true : false
          );
        }
        formData.append(
          "bagReceiptCheck",
          active === bagCheckId ? true : false
        ); // Bag check is active

        // Append Bag Receipt Check if active is bagCheckId
        if (active === bagCheckId) {
          if (selectedValueCompletedBag) {
            formData.append(
              "bagReceiptCheckDetails[noCompleted]",
              selectedValueCompletedBag
            );
          }

          formData.append(
            "bagReceiptCheckDetails[wasThereTheft]",
            wasTheft === "yes" ? true : false
          );

          if (wasTheft === "yes") {
            formData.append(
              "bagReceiptCheckDetails[wasThereTheftDetails][findEmptyPackaging]",
              foundEmptyPackaging
            );
            if (descriptionOfProperty)
              formData.append(
                "bagReceiptCheckDetails[wasThereTheftDetails][descriptionOfProperty]",
                descriptionOfProperty
              );
            if (valueRecovered)
              formData.append(
                "bagReceiptCheckDetails[wasThereTheftDetails][propertyRecovered]",
                valueRecovered
              );
            if (valueLost)
              formData.append(
                "bagReceiptCheckDetails[wasThereTheftDetails][propertyLost]",
                valueLost
              );
          }
        }
        formData.append("wasThereTheft", active === theftId ? true : false); // Theft is active

        // Append Theft data if active is theftId
        if (active === theftId) {
          if (foundEmptyPackaging) {
            formData.append(
              "wasThereTheftDetails[findEmptyPackaging]",
              foundEmptyPackaging
            );
          }

          if (descriptionOfProperty) {
            formData.append(
              "wasThereTheftDetails[descriptionOfProperty]",
              descriptionOfProperty
            );
          }

          if (valueRecovered) {
            formData.append(
              "wasThereTheftDetails[propertyRecovered]",
              valueRecovered
            );
          }

          if (valueLost) {
            formData.append("wasThereTheftDetails[propertyLost]", valueLost);
          }
        }

        if (armed && selectedWeapons.length > 0) {
          let weaponIndex = 0;

          selectedWeapons.forEach((weapon) => {
            if (weapon === "other") {
              // Handle the "Other" weapon case
              if (otherWeapon) {
                formData.append(
                  "suspectOrOffenderDetails[typeOfWeapon][otherWeapon]",
                  otherWeapon
                );
              } else {
                formData.append(
                  "suspectOrOffenderDetails[typeOfWeapon][otherWeapon]",
                  ""
                );
              }
            } else {
              // Append selected weapon types
              formData.append(
                `suspectOrOffenderDetails[typeOfWeapon][weapon][${weaponIndex}]`,
                weapon
              );
              weaponIndex++;
            }
          });
        }

        // Append damageVandalism
        formData.append("damageVandalism", active === damageId ? true : false);

        // Append descriptionOfProperty if damageVandalism is true
        if (active === damageId && damageDescriptionOfProperty) {
          formData.append(
            "damageVandalismDetails[descriptionOfProperty]",
            damageDescriptionOfProperty
          );
        }

        // Append suspiciousBehaviour
        formData.append(
          "suspiciousBehaviour",
          active === suspiciousId ? true : false
        );

        // Append findEmptyPackaging if suspiciousBehaviour is true
        if (active === suspiciousId && suspiciousFoundEmptyPackaging) {
          formData.append(
            "suspiciousBehaviourDetails[findEmptyPackaging]",
            suspiciousFoundEmptyPackaging
          );
        }

        formData.append("witness", witness === "yes" ? true : false);
        if (witness === "yes") {
          if (
            selectedwitnessType === "Other" &&
            otherWitnessType.trim() !== ""
          ) {
            formData.append("witnessDetails[witnessType]", otherWitnessType);
          } else {
            formData.append("witnessDetails[witnessType]", selectedwitnessType);
          }
          formData.append("witnessDetails[nameOrEmailOrPhone]", witnessDetails);
        }

        // Append overall injury flag
        formData.append("anyoneInjured", injured === "yes" ? true : false);

        if (injured === "yes") {
          // Append who was injured
          if (selectedInjured.length > 0) {
            let injuredIndex = 0;

            selectedInjured.forEach((injury) => {
              if (injury === "other") {
                // Handle the "Other" case
                if (otherInjured) {
                  // If 'Other' is selected and a value exists, append it
                  formData.append(
                    "anyoneInjuredDetails[whoWasInjured][otherInjured]",
                    otherInjured
                  );
                } else {
                  // If 'Other' is selected but no value exists, send an empty string
                  formData.append(
                    "anyoneInjuredDetails[whoWasInjured][otherInjured]",
                    ""
                  );
                }
              } else {
                // Append selected injuries (other than "Other")
                formData.append(
                  `anyoneInjuredDetails[whoWasInjured][injured][${injuredIndex}]`,
                  injury
                );
                injuredIndex++;
              }
            });
          } else {
            // Ensure 'otherInjured' is handled even if 'selectedInjured' is empty
            if (otherInjured) {
              formData.append(
                "anyoneInjuredDetails[whoWasInjured][otherInjured]",
                otherInjured
              );
            }
          }

          // Append medical attention provided
          if (selectedMedicalAttention.length > 0) {
            selectedMedicalAttention.forEach((selectedId, index) => {
              // Append each selected medical field to formData using the field's ID
              formData.append(
                `anyoneInjuredDetails[medicalAttentionProvided][${index}]`,
                selectedId
              );
            });
          }
        }
        // Append Reported to Client flag
        formData.append("dutyManager", reportToClient === "yes" ? true : false);

        // Append Client Name if reported to client is "yes"
        if (reportToClient === "yes" && clientName) {
          formData.append("dutyManagerDetails[dutyManagerName]", clientName);
        }

        if (status === "draft") {

          if (selectedValueType) {
            formData.append("removeTypeOfIncidentCategory", false);
          }
          // console.log("removedImages", removedImages);
          // console.log("imageUris", imageUris);

          if (removedImages.length > 0) {
            removedImages.forEach((imageId, index) => {
              formData.append(`removePictures[${index}]`, imageId);
            });
          }
        }

        const newImages = imageUris.filter((img) => !img._id); // Ignore API images
        newImages.forEach((img, index) => {
          formData.append("pictures", {
            uri: img.url,
            name: `image_${index}.png`,
            type: "image/png",
          });
        });

        if (status === "draft") {
          if (signatureUri && isSignatureBase64) {
            let signaturePath =
              Platform.OS === "android"
                ? `${RNFS.DocumentDirectoryPath}/signature.png`
                : `${RNFS.TemporaryDirectoryPath}/signature.png`;
            await RNFS.writeFile(signaturePath, signatureUri, "base64");
            formData.append("signature", {
              uri: `file://${signaturePath}`,
              name: "signature.png",
              type: "image/png",
            });
            // Ensure removeSignature is false if a new signature is provided
            formData.append("removeSignature", false);
          } else if (!isSignatureBase64 && !signatureUri) {
            // If no base64 signature is provided, ensure removeSignature is false
            formData.append("removeSignature", true);
          }
        } else {
          if (signatureUri && isSignatureBase64) {
            let signaturePath =
              Platform.OS === "android"
                ? `${RNFS.DocumentDirectoryPath}/signature.png`
                : `${RNFS.TemporaryDirectoryPath}/signature.png`;
            await RNFS.writeFile(signaturePath, signatureUri, "base64");
            formData.append("signature", {
              uri: `file://${signaturePath}`,
              name: "signature.png",
              type: "image/png",
            });
          }
        }




        formData.append("draft", isDraft);
        // console.log("Form Data==>", formData);

        const response = await axios({
          method: status === "draft" ? "PUT" : "POST",
          url: apiUrl,
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        });
        // console.log("response", response?.data);

        if (response?.data && response?.data?.success === true) {
          setReportDetails(response?.data?.reportDetails);
          // Toast.show(response?.data?.message, Toast.SHORT);
          setIsLoading(false);
          setDescription("");
          setOtherLocation("");
          setImageUris([]);
          setSignatureUri(null);
          setSelectedValue("");
          setSelectedValueType("");
          setSelectedValueLocation("");
          setSeverityLevel("");
          setReportedDate(dayjs().format("DD/MM/YYYY"));
          setReportedTime(dayjs().format("h:mm A"));
          setIsSignatureSaved(false);
          setPoliceAssistance("no");
          setPoliceAttended("no");
          setPoliceArrestMade("no");
          setEmergencyServices("no");
          setEmergencyServicesDetails("");
          setWhichemergencyServicesChecked({
            ambulance: false,
            fireBrigade: false,
          });
          setParamedicsInvolved("no");
          setSuspectOffender("no");
          setSelectedGender("");
          setSelectedRace("");
          setOtherRace("");
          setdescribeOffender("");
          setOffenderStaffMember("no");
          setOffenderSeen("no");
          setWitness("no");
          setSelectedWitnessType("");
          setOtherWitnessType("");
          setWitnessDetails("");

          if (isDraft === true) {
            navigation.navigate("UserHome" as never);
          } else {
            openModal();
          }
        } else {
          Toast.show("something went wrong", Toast.SHORT);
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const handleChangeActivityCategory = async (
    value: string,
    severityLevel: string
  ) => {
    // console.log(value);

    if (value !== "") {
      // Find the selected category based on the value
      const selectedCategory = incidentCategories.find(
        (item) => item.value === value
      );

      setSelectedValue(value);
      setIncidentCategoryError(value.trim() === "");
      setSeverityLevel(severityLevel);
      setPriorityError(severityLevel.trim() === "");

      // Dynamically update incident types based on selected category
      if (selectedCategory?.subtypes?.length) {
        setIncidentTypes(selectedCategory.subtypes);
      } else {
        setIncidentTypes([]);
      }

      setActive(value);

      // Special logic for specific categories
      if (value === armedId) {
        setArmed(true);
        setSuspectOffender("yes");
      } else {
        setArmed(false);
      }

      if (value !== bagCheckId) {
        setWasTheft("no");
      }
    } else {
      // Reset values if no category is selected
      setIncidentTypes([]);
      setArmed(false);
      setActive(null);
      setSuspectOffender(""); // Clear suspect offender if needed
      setWasTheft("no"); // Reset theft value
    }
  };

  const handleChangeActivityType = async (
    value: string,
    severityLevel: string
  ) => {
    if (value !== "") {
      setSelectedValueType(value);
      setSeverityLevel(severityLevel);
    }
  };

  const handleChangeCompletedBag = (value) => {
    setSelectedValueCompletedBag(value);
    setBagError(false); // Reset error on valid selection
  };

  const handleResetCompletedBag = () => {
    setSelectedValueCompletedBag(null);
    setBagError(true);
  };

  const handleReset = () => {
    setSelectedValue("");
    setSeverityLevel("");
    setIncidentTypes([]);
    setArmed(false);
    setActive(null);
    setWasTheft("no");
  };

  const handleResetPriority = () => {
    setSeverityLevel("");
    // setActivityTypes([]);
  };

  const handleResetActivityType = () => {
    setSelectedValueType("");
  };
  const handleResetLocation = () => {
    setSelectedValueLocation("");
    setSubLocations([]);
  };
  const isIOS = Platform.OS === "ios";

  const CustomCheckbox = ({ checked, onPress }) => {
    return (
      <TouchableOpacity onPress={onPress} style={styles.customCheckbox}>
        {checked ? (
          <MaterialIcons name="check-box" size={24} color="#2E9E4A" />
        ) : (
          <MaterialIcons
            name="check-box-outline-blank"
            size={24}
            color="#726f7b"
          />
        )}
      </TouchableOpacity>
    );
  };

  // Group fields by subHeader
  const groupBySubHeader = (fields) => {
    return fields.reduce((grouped, field) => {
      if (!grouped[field.subHeader]) {
        grouped[field.subHeader] = [];
      }
      grouped[field.subHeader].push(field);
      return grouped;
    }, {});
  };

  const groupedFields = groupBySubHeader(reportFields);

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
          onScrollBeginDrag={Keyboard.dismiss}
        >
          <View>
            {/* <Image
            source={require('../assets/images/overlay.png')}
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
                <TouchableOpacity
                  style={globalStyles.backArrow}
                  onPress={() => navigation.navigate("UserHome" as never)}
                >
                  <FeatherIcon
                    name="chevron-left"
                    size={26}
                    color="#FFFFFF"
                    style={globalStyles.menuIcon}
                  />
                </TouchableOpacity>
              </View>
              {/* <TouchableOpacity
            style={globalStyles.menuIconContainer}
            onPress={toggleSidebar}>
            <MaterialIcons
              name="menu-open"
              size={26}
              color="#FFFFFF"
              style={globalStyles.menuIcon}
            />
          </TouchableOpacity> */}
            </View>
            {/* {isSidebarOpen && (
          <SidebarUser isOpen={isSidebarOpen} onClose={toggleSidebar} />
        )}
        {isSidebarOpen && (
          <Animated.View
            style={[
              globalStyles.sidebarContainer,
              {
                transform: [{translateX: sidebarTranslateX}],
              },
            ]}>
            <SidebarUser isOpen={isSidebarOpen} onClose={toggleSidebar} />
          </Animated.View>
        )} */}
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
                    Incident Report
                  </CustomText>
                </View>
              </View>

              {isLoading ? (
                <View style={globalStyles.loaderContainer}>
                  <ActivityIndicator size="large" color="#FFF" />
                </View>
              ) : (
                <View style={styles.formContainer}>
                  <View
                    style={[styles.row, { justifyContent: "space-between" }]}
                  >
                    <View style={[styles.inputGroup, { width: "49%" }]}>
                      <Text style={styles.label}>
                        Reported Date <Text style={styles.required}>*</Text>
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          Platform.OS === "ios"
                            ? showIOSDatePicker()
                            : setShowDatePicker(true);
                        }}
                      >
                        <View pointerEvents="none">
                          <TextInput
                            mode="outlined"
                            outlineColor={reportedDate ? "#2E9E4A" : "#BFBBBB"}
                            style={styles.textInput}
                            placeholder="DD/MM/YYYY"
                            placeholderTextColor="#BFBBBB"
                            value={reportedDate}
                            editable={false}
                            error={dateError}
                          />
                        </View>
                      </TouchableOpacity>
                      {dateError && (
                        <HelperText type="error" visible={dateError}>
                          Reported Date is required.
                        </HelperText>
                      )}
                    </View>

                    {/* Time Input */}
                    <View style={[styles.inputGroup, { width: "49%" }]}>
                      <Text style={styles.label}>
                        Reported Time <Text style={styles.required}>*</Text>
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          Platform.OS === "ios"
                            ? showIOSTimePicker()
                            : setShowTimePicker(true);
                        }}
                      >
                        <View pointerEvents="none">
                          <TextInput
                            mode="outlined"
                            outlineColor={reportedTime ? "#2E9E4A" : "#BFBBBB"}
                            style={styles.textInput}
                            placeholder="HH:MM AM/PM"
                            placeholderTextColor="#BFBBBB"
                            value={reportedTime}
                            editable={false}
                            error={timeError}
                            onBlur={() =>
                              setTimeError(reportedTime.trim() === "")
                            }
                          />
                        </View>
                      </TouchableOpacity>
                      {timeError && (
                        <HelperText type="error" visible={timeError}>
                          Reported Time is required.
                        </HelperText>
                      )}
                    </View>

                    {/* Android DateTimePicker */}
                    {Platform.OS === "android" && showDatePicker && (
                      <DateTimePicker
                        value={date}
                        mode="date"
                        display="spinner"
                        onChange={onChangeDate}
                      />
                    )}

                    {Platform.OS === "android" && showTimePicker && (
                      <DateTimePicker
                        value={time}
                        mode="time"
                        display="spinner"
                        onChange={onChangeTime}
                        // is24Hour={true}
                        themeVariant="dark"
                      />
                    )}

                    {/* iOS Modal DateTimePicker */}
                    {Platform.OS === "ios" && (
                      <>
                        <ModalDateTimePicker
                          isVisible={isIOSDatePickerVisible}
                          display="spinner"
                          mode="date"
                          onConfirm={handleIOSDateConfirm}
                          onCancel={hideIOSDatePicker}
                        />
                        <ModalDateTimePicker
                          isVisible={isIOSTimePickerVisible}
                          date={time}
                          display="spinner"
                          mode="time"
                          onConfirm={handleIOSTimeConfirm}
                          onCancel={hideIOSTimePicker}
                        // is24Hour={true}
                        />
                      </>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <CustomBottomSheet
                      label={
                        <Text>
                          Incident Category{" "}
                          <Text style={styles.required}>*</Text>
                        </Text>
                      }
                      labelBottomsheet="Incident Category"
                      items={incidentCategories}
                      searchText={"Search for Incident Category..."}
                      isRequired={true}
                      onValueChange={(value) => {
                        const selectedItem = incidentCategories.find(
                          (item) => item.value === value
                        );
                        if (selectedItem) {
                          handleChangeActivityCategory(
                            value,
                            selectedItem.severityLevel
                          );
                        } else {
                          setIncidentTypes([]);
                        }
                      }}
                      selectedValue={selectedValue}
                      handleReset={handleReset}
                      searchQuery={searchQuery}
                      onSearchQueryChange={handleSearchQueryChange}
                    />
                    {incidentCategoryError && (
                      <HelperText type="error" visible={incidentCategoryError}>
                        Incident Category is required.
                      </HelperText>
                    )}
                  </View>

                  {incidentTypes.length > 0 && (
                    <View style={styles.inputGroup}>
                      <CustomBottomSheet
                        label="Incident Type"
                        labelBottomsheet="Incident Type"
                        items={incidentTypes} // Use the extracted subtypes list
                        isRequired={false}
                        searchText="Search for Incident Type..."
                        onValueChange={(value) => {
                          const selectedSubtype = incidentTypes.find(
                            (item: any) => item.value === value
                          );
                          if (selectedSubtype) {
                            handleChangeActivityType(
                              value,
                              selectedSubtype.severityLevel // Optionally pass parent category
                            );
                          }
                        }}
                        selectedValue={selectedValueType}
                        handleReset={handleResetActivityType}
                        searchQuery={searchQueryType}
                        onSearchQueryChange={handleSearchQueryType}
                      />
                    </View>
                  )}

                  <View style={styles.inputGroup}>
                    <CustomBottomSheet
                      label={
                        <Text>
                          Priority <Text style={styles.required}>*</Text>
                        </Text>
                      }
                      labelBottomsheet="Priority"
                      items={[
                        { label: "High Priority", value: "High Priority" },
                        { label: "N/A", value: "N/A" },
                      ]}
                      searchText="Search for Priority..."
                      isRequired={true}
                      onValueChange={(value) => {
                        if (value !== "") {
                          setSeverityLevel(value);
                          setPriorityError(value.trim() === "");
                          // fetchActivityType(value);
                        }
                      }}
                      selectedValue={severityLevel} // Replace with your state variable for the selected priority
                      handleReset={handleResetPriority} // Define a reset function if needed
                      searchQuery={searchQueryPriority} // If you want to add search functionality
                      onSearchQueryChange={setSearchQueryPriority} // Set search query state
                    />
                    {priorityError && (
                      <HelperText type="error" visible={priorityError}>
                        Priority is required.
                      </HelperText>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <CustomBottomSheet
                      label={
                        <Text>
                          Location <Text style={styles.required}>*</Text>
                        </Text>
                      }
                      labelBottomsheet="Location"
                      items={locations}
                      isRequired={true}
                      searchText={"Search for Location..."}
                      onValueChange={handleLocationChange}
                      selectedValue={selectedValueLocation}
                      handleReset={handleResetLocation}
                      searchQuery={searchQueryLocation}
                      onSearchQueryChange={handleSearchQueryLocation}
                    />
                    {locationError && (
                      <HelperText type="error" visible={locationError}>
                        Location is required.
                      </HelperText>
                    )}
                  </View>
                  {subLocations.length > 0 && (
                    <View style={styles.inputGroup}>
                      <CustomBottomSheet
                        label={<Text>Sub Location</Text>}
                        labelBottomsheet="Sub Location"
                        items={subLocations}
                        searchText={"Search for Sub Location..."}
                        isRequired={true}
                        onValueChange={handleSubLocationChange}
                        selectedValue={selectedValueSubLocation}
                        handleReset={() => setSelectedValueSubLocation("")}
                        searchQuery={searchQuerySubLocation}
                        onSearchQueryChange={handleSearchQuerySubLocation}
                      />
                    </View>
                  )}

                  {selectedValueLocation === "other" && (
                    <View style={styles.inputGroup}>
                      <TextInput
                        mode="outlined"
                        outlineColor={otherLocation ? "#2E9E4A" : "#BFBBBB"}
                        activeOutlineColor={"#2E9E4A"}
                        style={styles.textInput}
                        label={
                          <Text>
                            Other Location{" "}
                            <Text style={styles.required}>*</Text>
                          </Text>
                        }
                        placeholder="Other Location"
                        placeholderTextColor="#BFBBBB"
                        value={otherLocation}
                        onChangeText={handleOtherLocationChange}
                        onBlur={() =>
                          setOtherLocationError(otherLocation.trim() === "")
                        }
                        error={otherLocationError}
                      />
                      {otherLocationError && (
                        <HelperText type="error" visible={otherLocationError}>
                          Other Location is required.
                        </HelperText>
                      )}
                    </View>
                  )}

                  <View style={{ marginTop: 14 }}>
                    <CustomTextArea
                      label="Details of Incident"
                      placeholder="Enter Details of Incident"
                      value={description}
                      onChangeText={handleDescriptionChange}
                      onBlur={() =>
                        setDescriptionError(description.trim() === "")
                      }
                      isRequired={true}
                      error={descriptionError}
                    />
                  </View>
                  <CustomTextArea
                    label="Outcome"
                    placeholder="N/A"
                    value={outcome}
                    onChangeText={handleOutcomeChange}
                    // onBlur={() => setOutcomeError(outcome.trim() === '')} // if needed
                    isRequired={false} // if Outcome is optional
                  // error={outcomeError} // add an error state if needed
                  />
                  {active === bagCheckId && (
                    <View>
                      <View style={styles.inputGroup}>
                        <CustomBottomSheet
                          label={
                            <Text>
                              How many Bag/Receipt checks - did you complete?{" "}
                              <Text style={styles.required}>*</Text>
                            </Text>
                          }
                          labelBottomsheet="Completed Bag Checks"
                          items={completedBag} // Bind the filtered response here
                          searchText={"Search for Completed Bag Checks..."}
                          isRequired={true}
                          onValueChange={(value) =>
                            handleChangeCompletedBag(value)
                          }
                          selectedValue={selectedValueCompletedBag}
                          handleReset={handleResetCompletedBag}
                          searchQuery={searchQueryBagCheck}
                          onSearchQueryChange={handleSearchQueryBag}
                        />
                        {bagError && (
                          <HelperText type="error" visible={bagError}>
                            This field is required.
                          </HelperText>
                        )}
                      </View>
                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Was there a Theft</Text>
                        <View style={styles.radioGroup}>
                          {isIOS ? (
                            <View style={styles.switchContainer}>
                              <Text style={styles.switchLabel}>No</Text>
                              <Switch
                                value={wasTheft === "yes"}
                                onValueChange={(value) =>
                                  setWasTheft(value ? "yes" : "no")
                                }
                                thumbColor={
                                  wasTheft === "yes" ? "#fff" : "#fff"
                                } // Custom color for the thumb
                                trackColor={{
                                  false: "#3C4764",
                                  true: "#2E9E4A",
                                }} // Custom color for the track
                              />
                              <Text style={styles.switchLabel}>Yes</Text>
                            </View>
                          ) : (
                            <>
                              <RadioButton
                                value="no"
                                status={
                                  wasTheft === "no" ? "checked" : "unchecked"
                                }
                                onPress={() => setWasTheft("no")}
                                color="#2E9E4A"
                                uncheckedColor="#3C4764"
                              />
                              <Text style={styles.radioLabel}>No</Text>
                              <RadioButton
                                value="yes"
                                status={
                                  wasTheft === "yes" ? "checked" : "unchecked"
                                }
                                onPress={() => setWasTheft("yes")}
                                color="#2E9E4A"
                                uncheckedColor="#3C4764"
                              />
                              <Text style={styles.radioLabel}>Yes</Text>
                            </>
                          )}
                        </View>
                      </View>

                      {/* Conditionally render the next question only if "Yes" is selected for 'wasTheft' */}
                    </View>
                  )}

                  {wasTheft === "yes" && (
                    <View>
                      <Text style={styles.label}>
                        Did you find empty packaging or wrappers ?
                      </Text>

                      <View style={styles.radioGroup}>
                        {isIOS ? (
                          <View style={styles.switchContainer}>
                            <Text style={styles.switchLabel}>No</Text>
                            <Switch
                              value={foundEmptyPackaging === "yes"}
                              onValueChange={(value) => {
                                setFoundEmptyPackaging(value ? "yes" : "no");
                              }}
                              thumbColor={
                                foundEmptyPackaging === "yes" ? "#fff" : "#fff"
                              } // Custom color for the thumb
                              trackColor={{
                                false: "#3C4764",
                                true: "#2E9E4A",
                              }} // Custom color for the track
                            />
                            <Text style={styles.switchLabel}>Yes</Text>
                            <Switch
                              value={foundEmptyPackaging === "notApplicable"}
                              onValueChange={(value) => {
                                setFoundEmptyPackaging(
                                  value ? "notApplicable" : "no"
                                );
                              }}
                              thumbColor={
                                foundEmptyPackaging === "notApplicable"
                                  ? "#fff"
                                  : "#fff"
                              }
                              trackColor={{
                                false: "#3C4764",
                                true: "#F1A531",
                              }} // Custom color for the track (for Not Applicable)
                            />
                            <Text style={styles.switchLabel}>
                              Not Applicable
                            </Text>
                          </View>
                        ) : (
                          <>
                            <RadioButton
                              value="no"
                              status={
                                foundEmptyPackaging === "no"
                                  ? "checked"
                                  : "unchecked"
                              }
                              onPress={() => setFoundEmptyPackaging("no")}
                              color="#2E9E4A"
                              uncheckedColor="#3C4764"
                            />
                            <Text style={styles.radioLabel}>No</Text>
                            <RadioButton
                              value="yes"
                              status={
                                foundEmptyPackaging === "yes"
                                  ? "checked"
                                  : "unchecked"
                              }
                              onPress={() => setFoundEmptyPackaging("yes")}
                              color="#2E9E4A"
                              uncheckedColor="#3C4764"
                            />
                            <Text style={styles.radioLabel}>Yes</Text>
                            <RadioButton
                              value="notApplicable"
                              status={
                                foundEmptyPackaging === "notApplicable"
                                  ? "checked"
                                  : "unchecked"
                              }
                              onPress={() =>
                                setFoundEmptyPackaging("notApplicable")
                              }
                              color="#F1A531"
                              uncheckedColor="#3C4764"
                            />
                            <Text style={styles.radioLabel}>
                              Not Applicable
                            </Text>
                          </>
                        )}
                      </View>

                      <View style={styles.inputGroup}>
                        <TextInput
                          mode="outlined"
                          outlineColor={
                            descriptionOfProperty ? "#2E9E4A" : "#BFBBBB"
                          }
                          activeOutlineColor={"#2E9E4A"}
                          style={styles.textInput}
                          label={<Text>Description of Property</Text>}
                          placeholder="Enter description"
                          value={descriptionOfProperty}
                          onChangeText={(text) =>
                            setDescriptionOfProperty(text)
                          }
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <TextInput
                          mode="outlined"
                          outlineColor={valueRecovered ? "#2E9E4A" : "#BFBBBB"}
                          activeOutlineColor={"#2E9E4A"}
                          style={styles.textInput}
                          label={
                            <Text>
                              Value of Property Recovered (prevented theft){" "}
                              <Text style={styles.required}>*</Text>
                            </Text>
                          }
                          placeholder="Enter value"
                          keyboardType="numeric"
                          value={valueRecovered}
                          onChangeText={(text) => setValueRecovered(text)}
                        />
                        <Text style={styles.subText}>Enter 0 if none</Text>
                        {errorRecovered && (
                          <HelperText type="error" visible={errorRecovered}>
                            This field is required.
                          </HelperText>
                        )}
                      </View>

                      <View style={styles.inputGroup}>
                        <TextInput
                          mode="outlined"
                          outlineColor={valueLost ? "#2E9E4A" : "#BFBBBB"}
                          activeOutlineColor={"#2E9E4A"}
                          style={styles.textInput}
                          label={
                            <Text>
                              Value of Property Lost (theft, taken from store){" "}
                              <Text style={styles.required}>*</Text>
                            </Text>
                          }
                          placeholder="Enter value"
                          keyboardType="numeric"
                          value={valueLost}
                          onChangeText={(text) => setValueLost(text)}
                        />
                        <Text style={styles.subText}>Enter 0 if none</Text>
                        {errorLost && (
                          <HelperText type="error" visible={errorLost}>
                            This field is required.
                          </HelperText>
                        )}
                      </View>
                    </View>
                  )}

                  {active === theftId && (
                    <View>
                      <Text style={styles.label}>
                        Did you find empty packaging or wrappers ?
                      </Text>

                      <View style={styles.radioGroup}>
                        {isIOS ? (
                          <View style={styles.switchContainer}>
                            <Text style={styles.switchLabel}>No</Text>
                            <Switch
                              value={foundEmptyPackaging === "yes"}
                              onValueChange={(value) => {
                                setFoundEmptyPackaging(value ? "yes" : "no");
                              }}
                              thumbColor={
                                foundEmptyPackaging === "yes" ? "#fff" : "#fff"
                              } // Custom color for the thumb
                              trackColor={{
                                false: "#3C4764",
                                true: "#2E9E4A",
                              }} // Custom color for the track
                            />
                            <Text style={styles.switchLabel}>Yes</Text>
                            <Switch
                              value={foundEmptyPackaging === "notApplicable"}
                              onValueChange={(value) => {
                                setFoundEmptyPackaging(
                                  value ? "notApplicable" : "no"
                                );
                              }}
                              thumbColor={
                                foundEmptyPackaging === "notApplicable"
                                  ? "#fff"
                                  : "#fff"
                              }
                              trackColor={{
                                false: "#3C4764",
                                true: "#F1A531",
                              }} // Custom color for the track (for Not Applicable)
                            />
                            <Text style={styles.switchLabel}>
                              Not Applicable
                            </Text>
                          </View>
                        ) : (
                          <>
                            <RadioButton
                              value="no"
                              status={
                                foundEmptyPackaging === "no"
                                  ? "checked"
                                  : "unchecked"
                              }
                              onPress={() => setFoundEmptyPackaging("no")}
                              color="#2E9E4A"
                              uncheckedColor="#3C4764"
                            />
                            <Text style={styles.radioLabel}>No</Text>
                            <RadioButton
                              value="yes"
                              status={
                                foundEmptyPackaging === "yes"
                                  ? "checked"
                                  : "unchecked"
                              }
                              onPress={() => setFoundEmptyPackaging("yes")}
                              color="#2E9E4A"
                              uncheckedColor="#3C4764"
                            />
                            <Text style={styles.radioLabel}>Yes</Text>
                            <RadioButton
                              value="notApplicable"
                              status={
                                foundEmptyPackaging === "notApplicable"
                                  ? "checked"
                                  : "unchecked"
                              }
                              onPress={() =>
                                setFoundEmptyPackaging("notApplicable")
                              }
                              color="#F1A531"
                              uncheckedColor="#3C4764"
                            />
                            <Text style={styles.radioLabel}>
                              Not Applicable
                            </Text>
                          </>
                        )}
                      </View>

                      <View style={styles.inputGroup}>
                        <TextInput
                          mode="outlined"
                          outlineColor={
                            descriptionOfProperty ? "#2E9E4A" : "#BFBBBB"
                          }
                          activeOutlineColor={"#2E9E4A"}
                          style={styles.textInput}
                          label={<Text>Description of Property</Text>}
                          placeholder="Enter description"
                          value={descriptionOfProperty}
                          onChangeText={(text) =>
                            setDescriptionOfProperty(text)
                          }
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <TextInput
                          mode="outlined"
                          outlineColor={valueRecovered ? "#2E9E4A" : "#BFBBBB"}
                          activeOutlineColor={"#2E9E4A"}
                          style={styles.textInput}
                          label={
                            <Text>
                              Value of Property Recovered (prevented theft){" "}
                              <Text style={styles.required}>*</Text>
                            </Text>
                          }
                          placeholder="Enter value"
                          keyboardType="numeric"
                          value={valueRecovered}
                          onChangeText={(text) => setValueRecovered(text)}
                        />
                        <Text style={styles.subText}>Enter 0 if none</Text>
                        {errorRecovered && (
                          <HelperText type="error" visible={errorRecovered}>
                            This field is required.
                          </HelperText>
                        )}
                      </View>

                      <View style={styles.inputGroup}>
                        <TextInput
                          mode="outlined"
                          outlineColor={valueLost ? "#2E9E4A" : "#BFBBBB"}
                          activeOutlineColor={"#2E9E4A"}
                          style={styles.textInput}
                          label={
                            <Text>
                              Value of Property Lost (theft, taken from store){" "}
                              <Text style={styles.required}>*</Text>
                            </Text>
                          }
                          placeholder="Enter value"
                          keyboardType="numeric"
                          value={valueLost}
                          onChangeText={(text) => setValueLost(text)}
                        />
                        <Text style={styles.subText}>Enter 0 if none</Text>
                        {errorLost && (
                          <HelperText type="error" visible={errorLost}>
                            This field is required.
                          </HelperText>
                        )}
                      </View>
                    </View>
                  )}

                  {active === damageId && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Description of Property</Text>
                      <TextInput
                        mode="outlined"
                        outlineColor={
                          damageDescriptionOfProperty ? "#2E9E4A" : "#BFBBBB"
                        }
                        activeOutlineColor={"#2E9E4A"}
                        style={styles.textInput}
                        placeholder="Enter description"
                        value={damageDescriptionOfProperty}
                        onChangeText={(text) =>
                          setDamageDescriptionOfProperty(text)
                        }
                      />
                    </View>
                  )}

                  {active === suspiciousId && (
                    <View>
                      <Text style={styles.label}>
                        Did you find empty packaging or wrappers ?
                      </Text>
                      <View style={styles.radioGroup}>
                        {isIOS ? (
                          <View style={styles.switchContainer}>
                            <Text style={styles.switchLabel}>No</Text>
                            <Switch
                              value={suspiciousFoundEmptyPackaging === "yes"}
                              onValueChange={(value) => {
                                setSuspiciousFoundEmptyPackaging(
                                  value ? "yes" : "no"
                                );
                              }}
                              thumbColor={
                                suspiciousFoundEmptyPackaging === "yes"
                                  ? "#fff"
                                  : "#fff"
                              } // Custom color for the thumb
                              trackColor={{
                                false: "#3C4764",
                                true: "#2E9E4A",
                              }} // Custom color for the track
                            />
                            <Text style={styles.switchLabel}>Yes</Text>
                            <Switch
                              value={
                                suspiciousFoundEmptyPackaging ===
                                "notApplicable"
                              }
                              onValueChange={(value) => {
                                setSuspiciousFoundEmptyPackaging(
                                  value ? "notApplicable" : "no"
                                );
                              }}
                              thumbColor={
                                suspiciousFoundEmptyPackaging ===
                                  "notApplicable"
                                  ? "#fff"
                                  : "#fff"
                              }
                              trackColor={{
                                false: "#3C4764",
                                true: "#F1A531",
                              }} // Custom color for the track (for Not Applicable)
                            />
                            <Text style={styles.switchLabel}>
                              Not Applicable
                            </Text>
                          </View>
                        ) : (
                          <>
                            <RadioButton
                              value="no"
                              status={
                                suspiciousFoundEmptyPackaging === "no"
                                  ? "checked"
                                  : "unchecked"
                              }
                              onPress={() =>
                                setSuspiciousFoundEmptyPackaging("no")
                              }
                              color="#2E9E4A"
                              uncheckedColor="#3C4764"
                            />
                            <Text style={styles.radioLabel}>No</Text>
                            <RadioButton
                              value="yes"
                              status={
                                suspiciousFoundEmptyPackaging === "yes"
                                  ? "checked"
                                  : "unchecked"
                              }
                              onPress={() =>
                                setSuspiciousFoundEmptyPackaging("yes")
                              }
                              color="#2E9E4A"
                              uncheckedColor="#3C4764"
                            />
                            <Text style={styles.radioLabel}>Yes</Text>
                            <RadioButton
                              value="notApplicable"
                              status={
                                suspiciousFoundEmptyPackaging ===
                                  "notApplicable"
                                  ? "checked"
                                  : "unchecked"
                              }
                              onPress={() =>
                                setSuspiciousFoundEmptyPackaging(
                                  "notApplicable"
                                )
                              }
                              color="#F1A531"
                              uncheckedColor="#3C4764"
                            />
                            <Text style={styles.radioLabel}>
                              Not Applicable
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Police Assistance Requested
                    </Text>
                    <View style={styles.radioGroup}>
                      {isIOS ? (
                        <View style={styles.switchContainer}>
                          <Text style={styles.switchLabel}>No</Text>
                          <Switch
                            value={policeAssistance === "yes"}
                            onValueChange={(value) =>
                              setPoliceAssistance(value ? "yes" : "no")
                            }
                            thumbColor={
                              policeAssistance === "yes" ? "#fff" : "#fff"
                            } // Custom color for the thumb
                            trackColor={{ false: "#3C4764", true: "#2E9E4A" }} // Custom color for the track
                          />
                          <Text style={styles.switchLabel}>Yes</Text>
                        </View>
                      ) : (
                        <>
                          <RadioButton
                            value="no"
                            status={
                              policeAssistance === "no"
                                ? "checked"
                                : "unchecked"
                            }
                            onPress={() => setPoliceAssistance("no")}
                            color="#2E9E4A"
                            uncheckedColor="#3C4764"
                          />
                          <Text style={styles.radioLabel}>No</Text>
                          <RadioButton
                            value="yes"
                            status={
                              policeAssistance === "yes"
                                ? "checked"
                                : "unchecked"
                            }
                            onPress={() => setPoliceAssistance("yes")}
                            color="#2E9E4A"
                            uncheckedColor="#3C4764"
                          />
                          <Text style={styles.radioLabel}>Yes</Text>
                        </>
                      )}
                    </View>
                  </View>

                  {policeAssistance === "yes" && (
                    <View style={globalStyles.outlineContainer}>
                      <View style={{ flexDirection: "row" }}>
                        <View style={[styles.inputGroup, { width: "50%" }]}>
                          <Text style={styles.label}>Police Attended</Text>
                          {isIOS ? (
                            <View style={styles.switchContainer}>
                              <Text style={styles.switchLabel}>No</Text>
                              <Switch
                                value={policeAttended === "yes"}
                                onValueChange={(value) =>
                                  setPoliceAttended(value ? "yes" : "no")
                                }
                                thumbColor={
                                  policeAttended === "yes" ? "#fff" : "#fff"
                                } // Custom color for the thumb
                                trackColor={{
                                  false: "#3C4764",
                                  true: "#2E9E4A",
                                }} // Custom color for the track
                              />
                              <Text style={styles.switchLabel}>Yes</Text>
                            </View>
                          ) : (
                            <>
                              <View style={styles.radioGroup}>
                                <RadioButton
                                  value="no"
                                  status={
                                    policeAttended === "no"
                                      ? "checked"
                                      : "unchecked"
                                  }
                                  onPress={() => setPoliceAttended("no")}
                                  color="#2E9E4A"
                                  uncheckedColor="#3C4764"
                                />
                                <Text style={styles.radioLabel}>No</Text>
                                <RadioButton
                                  value="yes"
                                  status={
                                    policeAttended === "yes"
                                      ? "checked"
                                      : "unchecked"
                                  }
                                  onPress={() => setPoliceAttended("yes")}
                                  color="#2E9E4A"
                                  uncheckedColor="#3C4764"
                                />
                                <Text style={styles.radioLabel}>Yes</Text>
                              </View>
                            </>
                          )}
                        </View>

                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>Arrest Made</Text>
                          {isIOS ? (
                            <View style={styles.switchContainer}>
                              <Text style={styles.switchLabel}>No</Text>
                              <Switch
                                value={policeArrestMade === "yes"}
                                onValueChange={(value) =>
                                  setPoliceArrestMade(value ? "yes" : "no")
                                }
                                thumbColor={
                                  policeArrestMade === "yes" ? "#fff" : "#fff"
                                } // Custom color for the thumb
                                trackColor={{
                                  false: "#3C4764",
                                  true: "#2E9E4A",
                                }} // Custom color for the track
                              />
                              <Text style={styles.switchLabel}>Yes</Text>
                            </View>
                          ) : (
                            <>
                              <View style={styles.radioGroup}>
                                <RadioButton
                                  value="no"
                                  status={
                                    policeArrestMade === "no"
                                      ? "checked"
                                      : "unchecked"
                                  }
                                  onPress={() => setPoliceArrestMade("no")}
                                  color="#2E9E4A"
                                  uncheckedColor="#3C4764"
                                />
                                <Text style={styles.radioLabel}>No</Text>
                                <RadioButton
                                  value="yes"
                                  status={
                                    policeArrestMade === "yes"
                                      ? "checked"
                                      : "unchecked"
                                  }
                                  color="#2E9E4A"
                                  uncheckedColor="#3C4764"
                                  onPress={() => setPoliceArrestMade("yes")}
                                />
                                <Text style={styles.radioLabel}>Yes</Text>
                              </View>
                            </>
                          )}
                        </View>
                      </View>
                    </View>
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Emergency Services on site</Text>
                    {isIOS ? (
                      <View style={styles.switchContainer}>
                        <Text style={styles.switchLabel}>No</Text>
                        <Switch
                          value={emergencyServices === "yes"}
                          onValueChange={(value) =>
                            setEmergencyServices(value ? "yes" : "no")
                          }
                          thumbColor={
                            emergencyServices === "yes" ? "#fff" : "#fff"
                          } // Custom color for the thumb
                          trackColor={{ false: "#3C4764", true: "#2E9E4A" }} // Custom color for the track
                        />
                        <Text style={styles.switchLabel}>Yes</Text>
                      </View>
                    ) : (
                      <>
                        <View style={styles.radioGroup}>
                          <RadioButton
                            value="no"
                            status={
                              emergencyServices === "no"
                                ? "checked"
                                : "unchecked"
                            }
                            onPress={() => setEmergencyServices("no")}
                            color="#2E9E4A"
                            uncheckedColor="#3C4764"
                          />
                          <Text style={styles.radioLabel}>No</Text>
                          <RadioButton
                            value="yes"
                            status={
                              emergencyServices === "yes"
                                ? "checked"
                                : "unchecked"
                            }
                            onPress={() => setEmergencyServices("yes")}
                            color="#2E9E4A"
                            uncheckedColor="#3C4764"
                          />
                          <Text style={styles.radioLabel}>Yes</Text>
                        </View>
                      </>
                    )}
                  </View>

                  {emergencyServices === "yes" && (
                    <View style={globalStyles.outlineContainer}>
                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                          Which Emergency Services
                        </Text>
                        <View style={{ flexDirection: "row" }}>
                          <View style={styles.checkboxContainer}>
                            {Platform.OS === "ios" ? (
                              <CustomCheckbox
                                checked={
                                  whichemergencyServiceschecked.ambulance
                                }
                                onPress={() =>
                                  handleCheckboxChange("ambulance")
                                }
                              />
                            ) : (
                              <Checkbox
                                status={
                                  whichemergencyServiceschecked.ambulance
                                    ? "checked"
                                    : "unchecked"
                                }
                                onPress={() =>
                                  handleCheckboxChange("ambulance")
                                }
                                color="#2E9E4A"
                              />
                            )}
                            <Text
                              style={[
                                styles.label,
                                { fontWeight: "400", marginBottom: 0, top: 6 },
                              ]}
                            >
                              Ambulance
                            </Text>
                          </View>

                          <View style={styles.checkboxContainer}>
                            {Platform.OS === "ios" ? (
                              <CustomCheckbox
                                checked={
                                  whichemergencyServiceschecked.fireBrigade
                                }
                                onPress={() =>
                                  handleCheckboxChange("fireBrigade")
                                }
                              />
                            ) : (
                              <Checkbox
                                status={
                                  whichemergencyServiceschecked.fireBrigade
                                    ? "checked"
                                    : "unchecked"
                                }
                                onPress={() =>
                                  handleCheckboxChange("fireBrigade")
                                }
                                color="#2E9E4A"
                              />
                            )}
                            <Text
                              style={[
                                styles.label,
                                { fontWeight: "400", marginBottom: 0, top: 6 },
                              ]}
                            >
                              Fire Brigade
                            </Text>
                          </View>
                        </View>
                        {/* {checkboxError  && (
                      <HelperText
                        style={{bottom: 10}}
                        type="error"
                        visible={checkboxError}>
                        Please select at least one emergency service.
                      </HelperText>
                    )} */}
                        <CustomTextArea
                          label="Emergency Services Details, Station & Names"
                          placeholder="Emergency Services Details, Station & Names"
                          value={emergencyServicesDetails}
                          onChangeText={handleEmergencyServicesDetailsChange}
                          // onBlur={() => setOutcomeError(outcome.trim() === '')} // if needed
                          isRequired={false} // if Outcome is optional
                        // error={outcomeError} // add an error state if needed
                        />

                        {/* not required field */}
                        {/* <View style={styles.inputGroup}>
                        <TextInput
                          mode="outlined"
                          outlineColor={
                            emergencyServicesDetails ? "#2E9E4A" : "#BFBBBB"
                          }
                          activeOutlineColor={"#2E9E4A"}
                          style={[
                            styles.textAreaDesc,
                            {
                              height: Platform.OS === "ios" ? 120 : 0,
                              textAlignVertical:
                                Platform.OS === "ios" ? "top" : "auto",
                            },
                          ]}
                          label={
                            <Text>
                              Emergency Services Details, Station and Names
                              <Text style={styles.required}> *</Text>
                            </Text>
                          }
                          placeholder="Emergency Services Details, Station and Names"
                          multiline
                          numberOfLines={6}
                          placeholderTextColor="#BFBBBB"
                          value={emergencyServicesDetails}
                          onChangeText={handleEmergencyServicesDetailsChange}
                          onBlur={() =>
                            setEmergencyServicesDetailsError(
                              emergencyServicesDetails.trim() === '',
                            )
                          }
                          error={emergencyServicesDetailsError}
                        />
                        {emergencyServicesDetailsError && (
                      <HelperText
                        type="error"
                        visible={emergencyServicesDetailsError}>
                        Emergency Services Details, Station and Names is
                        required.
                      </HelperText>
                    )}
                      </View> */}
                      </View>
                    </View>
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Paramedics Involved</Text>
                    {isIOS ? (
                      <View style={styles.switchContainer}>
                        <Text style={styles.switchLabel}>No</Text>
                        <Switch
                          value={ParamedicsInvolved === "yes"}
                          onValueChange={(value) =>
                            setParamedicsInvolved(value ? "yes" : "no")
                          }
                          thumbColor={
                            ParamedicsInvolved === "yes" ? "#fff" : "#fff"
                          } // Custom color for the thumb
                          trackColor={{ false: "#3C4764", true: "#2E9E4A" }} // Custom color for the track
                        />
                        <Text style={styles.switchLabel}>Yes</Text>
                      </View>
                    ) : (
                      <>
                        <View style={styles.radioGroup}>
                          <RadioButton
                            value="no"
                            status={
                              ParamedicsInvolved === "no"
                                ? "checked"
                                : "unchecked"
                            }
                            onPress={() => setParamedicsInvolved("no")}
                            color="#2E9E4A"
                            uncheckedColor="#3C4764"
                          />
                          <Text style={styles.radioLabel}>No</Text>
                          <RadioButton
                            value="yes"
                            status={
                              ParamedicsInvolved === "yes"
                                ? "checked"
                                : "unchecked"
                            }
                            onPress={() => setParamedicsInvolved("yes")}
                            color="#2E9E4A"
                            uncheckedColor="#3C4764"
                          />
                          <Text style={styles.radioLabel}>Yes</Text>
                        </View>
                      </>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Suspect / Offender</Text>
                    {isIOS ? (
                      <View style={styles.switchContainer}>
                        <Text style={styles.switchLabel}>No</Text>
                        <Switch
                          value={SuspectOffender === "yes"}
                          onValueChange={(value) =>
                            setSuspectOffender(value ? "yes" : "no")
                          }
                          thumbColor={
                            SuspectOffender === "yes" ? "#fff" : "#fff"
                          } // Custom color for the thumb
                          trackColor={{ false: "#3C4764", true: "#2E9E4A" }} // Custom color for the track
                        />
                        <Text style={styles.switchLabel}>Yes</Text>
                      </View>
                    ) : (
                      <>
                        <View style={styles.radioGroup}>
                          <RadioButton
                            value="no"
                            status={
                              SuspectOffender === "no" ? "checked" : "unchecked"
                            }
                            onPress={() => setSuspectOffender("no")}
                            color="#2E9E4A"
                            uncheckedColor="#3C4764"
                          />
                          <Text style={styles.radioLabel}>No</Text>
                          <RadioButton
                            value="yes"
                            status={
                              SuspectOffender === "yes"
                                ? "checked"
                                : "unchecked"
                            }
                            onPress={() => setSuspectOffender("yes")}
                            color="#2E9E4A"
                            uncheckedColor="#3C4764"
                          />
                          <Text style={styles.radioLabel}>Yes</Text>
                        </View>
                      </>
                    )}
                  </View>

                  {SuspectOffender === "yes" && (
                    <View style={globalStyles.outlineContainer}>
                      <View>
                        <View style={styles.inputGroup}>
                          <CustomBottomSheet
                            label={
                              <Text>
                                Gender of Offender{" "}
                                {/* <Text style={styles.required}>*</Text> */}
                              </Text>
                            }
                            labelBottomsheet="Gender of Offender"
                            items={GenderofOffender}
                            isRequired={true}
                            //  searchText={' Gender of Offender'}
                            onValueChange={handleGenderChange}
                            selectedValue={selectedGender}
                            handleReset={handleResetGender}
                            searchQuery={""}
                            onSearchQueryChange={() => { }}
                          />
                          {/* {OffenderGenderError && (
                      <HelperText type="error" visible={OffenderGenderError}>
                        Gender of Offender is required.
                      </HelperText>
                    )} */}
                        </View>
                        <View style={styles.inputGroup}>
                          <CustomBottomSheet
                            label={
                              <Text>
                                Race
                                {/* <Text style={styles.required}>*</Text> */}
                              </Text>
                            }
                            labelBottomsheet="Race"
                            items={race}
                            isRequired={true}
                            //  searchText={' Gender of Offender'}
                            onValueChange={handleRaceChange}
                            selectedValue={selectedRace}
                            handleReset={handleResetRace}
                            searchQuery={""}
                            onSearchQueryChange={() => { }}
                          />
                          {/* {describeOffenderRaceError && (
                      <HelperText
                        type="error"
                        visible={describeOffenderRaceError}>
                        Race is required.
                      </HelperText>
                    )} */}
                        </View>
                        {selectedRace === "Other" && (
                          <View style={styles.inputGroup}>
                            <TextInput
                              mode="outlined"
                              outlineColor={otherRace ? "#2E9E4A" : "#BFBBBB"}
                              activeOutlineColor={"#2E9E4A"}
                              style={styles.textInput}
                              label={
                                <Text>
                                  Other Race
                                  {/* <Text style={styles.required}> *</Text> */}
                                </Text>
                              }
                              placeholder="Other Race"
                              placeholderTextColor="#BFBBBB"
                              value={otherRace}
                              onChangeText={handleOtherRaceChange}
                            // onBlur={() =>
                            //   setOtherRaceError(otherRace.trim() === '')
                            // }
                            // error={otherRaceError}
                            />
                            {/* {otherRaceError && (
                        <HelperText type="error" visible={otherRaceError}>
                          Other Race is required.
                        </HelperText>
                      )} */}
                          </View>
                        )}

                        <View style={{ marginTop: 14 }}>
                          <CustomTextArea
                            label="Describe Offender, Age & Appearance"
                            placeholder="Describe Offender, Age & Appearance"
                            value={describeOffender}
                            onChangeText={handleDescribeOffenderChange}
                            // onBlur={() => setOutcomeError(outcome.trim() === '')} // if needed
                            isRequired={false} // if Outcome is optional
                          // error={outcomeError} // add an error state if needed
                          />
                        </View>

                        {/* <View style={styles.inputGroup}>
                        <TextInput
                          mode="outlined"
                          outlineColor={
                            describeOffender ? "#2E9E4A" : "#BFBBBB"
                          }
                          activeOutlineColor={"#2E9E4A"}
                          style={[
                            styles.textAreaDesc,
                            {
                              height: Platform.OS === "ios" ? 120 : 0,
                              textAlignVertical:
                                Platform.OS === "ios" ? "top" : "auto",
                            },
                          ]}
                          label={
                            <Text>
                              Describe Offender, Age and Appearance
                              <Text style={styles.required}> *</Text>
                            </Text>
                          }
                          multiline
                          numberOfLines={6}
                          placeholder="Describe Offender, Age and Appearance"
                          placeholderTextColor="#BFBBBB"
                          value={describeOffender}
                          onChangeText={handleDescribeOffenderChange}
                          onBlur={() =>
                            setdescribeOffenderError(describeOffender.trim() === '')
                          }
                          error={describeOffenderError}
                        />
                        {describeOffenderError && (
                      <HelperText type="error" visible={describeOffenderError}>
                        Describe Offender, Age and Appearance is required.
                      </HelperText>
                    )}
                      </View> */}

                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>
                            Was the offender a staff member ?
                          </Text>
                          {isIOS ? (
                            <View style={styles.switchContainer}>
                              <Text style={styles.switchLabel}>No</Text>
                              <Switch
                                value={offenderStaffMember === "yes"}
                                onValueChange={(value) =>
                                  setOffenderStaffMember(value ? "yes" : "no")
                                }
                                thumbColor={
                                  offenderStaffMember === "yes"
                                    ? "#fff"
                                    : "#fff"
                                } // Custom color for the thumb
                                trackColor={{
                                  false: "#3C4764",
                                  true: "#2E9E4A",
                                }} // Custom color for the track
                              />
                              <Text style={styles.switchLabel}>Yes</Text>
                            </View>
                          ) : (
                            <>
                              <View style={styles.radioGroup}>
                                <RadioButton
                                  value="no"
                                  status={
                                    offenderStaffMember === "no"
                                      ? "checked"
                                      : "unchecked"
                                  }
                                  onPress={() => setOffenderStaffMember("no")}
                                  color="#2E9E4A"
                                  uncheckedColor="#3C4764"
                                />
                                <Text style={styles.radioLabel}>No</Text>
                                <RadioButton
                                  value="yes"
                                  status={
                                    offenderStaffMember === "yes"
                                      ? "checked"
                                      : "unchecked"
                                  }
                                  onPress={() => setOffenderStaffMember("yes")}
                                  color="#2E9E4A"
                                  uncheckedColor="#3C4764"
                                />
                                <Text style={styles.radioLabel}>Yes</Text>
                              </View>
                            </>
                          )}
                        </View>
                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>
                            Was the offender seen ?
                          </Text>
                          {isIOS ? (
                            <View style={styles.switchContainer}>
                              <Text style={styles.switchLabel}>No</Text>
                              <Switch
                                value={offenderSeen === "yes"}
                                onValueChange={(value) =>
                                  setOffenderSeen(value ? "yes" : "no")
                                }
                                thumbColor={
                                  offenderSeen === "yes" ? "#fff" : "#fff"
                                } // Custom color for the thumb
                                trackColor={{
                                  false: "#3C4764",
                                  true: "#2E9E4A",
                                }} // Custom color for the track
                              />
                              <Text style={styles.switchLabel}>Yes</Text>
                            </View>
                          ) : (
                            <>
                              <View style={styles.radioGroup}>
                                <RadioButton
                                  value="no"
                                  status={
                                    offenderSeen === "no"
                                      ? "checked"
                                      : "unchecked"
                                  }
                                  onPress={() => setOffenderSeen("no")}
                                  color="#2E9E4A"
                                  uncheckedColor="#3C4764"
                                />
                                <Text style={styles.radioLabel}>No</Text>
                                <RadioButton
                                  value="yes"
                                  status={
                                    offenderSeen === "yes"
                                      ? "checked"
                                      : "unchecked"
                                  }
                                  onPress={() => setOffenderSeen("yes")}
                                  color="#2E9E4A"
                                  uncheckedColor="#3C4764"
                                />
                                <Text style={styles.radioLabel}>Yes</Text>
                              </View>
                            </>
                          )}
                        </View>

                        {armed && (
                          <View>
                            <Text style={styles.label}>Type of Weapon:</Text>
                            {renderWeaponRow(weaponTypes).map(
                              (row, rowIndex) => (
                                <View
                                  key={rowIndex}
                                  style={styles.rowContainer}
                                >
                                  {row.map((weapon) => (
                                    <View
                                      key={weapon._id}
                                      style={styles.itemContainer}
                                    >
                                      <CustomCheckbox
                                        checked={selectedWeapons.includes(
                                          weapon._id
                                        )}
                                        onPress={() =>
                                          onWeaponCheckboxPress(weapon._id)
                                        }
                                      />
                                      <Text
                                        style={[
                                          styles.weaponText,
                                          selectedWeapons.includes(
                                            weapon._id
                                          ) && styles.checkedText,
                                        ]}
                                      >
                                        {weapon.lableValue}
                                      </Text>
                                    </View>
                                  ))}
                                </View>
                              )
                            )}

                            {selectedWeapons.includes("other") && (
                              <View style={styles.inputGroup}>
                                <TextInput
                                  mode="outlined"
                                  outlineColor={
                                    otherWeapon ? "#2E9E4A" : "#BFBBBB"
                                  }
                                  activeOutlineColor={"#2E9E4A"}
                                  style={styles.textInput}
                                  label="Other Weapon"
                                  placeholder="Specify Other Weapon"
                                  placeholderTextColor="#BFBBBB"
                                  value={otherWeapon}
                                  onChangeText={setOtherWeapon} // Update the 'Other Weapon' field
                                />
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Witness</Text>
                    {isIOS ? (
                      <View style={styles.switchContainer}>
                        <Text style={styles.switchLabel}>No</Text>
                        <Switch
                          value={witness === "yes"}
                          onValueChange={(value) =>
                            setWitness(value ? "yes" : "no")
                          }
                          thumbColor={witness === "yes" ? "#fff" : "#fff"} // Custom color for the thumb
                          trackColor={{ false: "#3C4764", true: "#2E9E4A" }} // Custom color for the track
                        />
                        <Text style={styles.switchLabel}>Yes</Text>
                      </View>
                    ) : (
                      <>
                        <View style={styles.radioGroup}>
                          <RadioButton
                            value="no"
                            status={witness === "no" ? "checked" : "unchecked"}
                            onPress={() => setWitness("no")}
                            color="#2E9E4A"
                            uncheckedColor="#3C4764"
                          />
                          <Text style={styles.radioLabel}>No</Text>
                          <RadioButton
                            value="yes"
                            status={witness === "yes" ? "checked" : "unchecked"}
                            onPress={() => setWitness("yes")}
                            color="#2E9E4A"
                            uncheckedColor="#3C4764"
                          />
                          <Text style={styles.radioLabel}>Yes</Text>
                        </View>
                      </>
                    )}
                  </View>
                  {witness === "yes" && (
                    <View style={globalStyles.outlineContainer}>
                      <View>
                        <View style={styles.inputGroup}>
                          <CustomBottomSheet
                            label={
                              <Text>
                                Witness Type
                                {/* <Text style={styles.required}>*</Text> */}
                              </Text>
                            }
                            labelBottomsheet="Witness Type"
                            items={witnessType}
                            isRequired={true}
                            //  searchText={' Gender of Offender'}
                            onValueChange={handleWitnessTypeChange}
                            selectedValue={selectedwitnessType}
                            handleReset={handleResetWitnessType}
                            searchQuery={""}
                            onSearchQueryChange={() => { }}
                          />
                          {/* {selectedwitnessTypeError && (
                      <HelperText
                        type="error"
                        visible={selectedwitnessTypeError}>
                        Witness Type is required.
                      </HelperText>
                    )} */}
                        </View>
                        {selectedwitnessType === "Other" && (
                          <View style={styles.inputGroup}>
                            <TextInput
                              mode="outlined"
                              outlineColor={
                                otherWitnessType ? "#2E9E4A" : "#BFBBBB"
                              }
                              activeOutlineColor={"#2E9E4A"}
                              style={styles.textInput}
                              label={
                                <Text>
                                  Other Witness Type
                                  {/* <Text style={styles.required}> *</Text> */}
                                </Text>
                              }
                              placeholder="Name of Witness"
                              placeholderTextColor="#BFBBBB"
                              value={otherWitnessType}
                              onChangeText={handleOtherWintessChange}
                            // onBlur={() =>
                            //   setotherWitnessTypeError(
                            //     otherWitnessType.trim() === '',
                            //   )
                            // }
                            // error={otherWitnessTypeError}
                            />
                            {/* {otherWitnessTypeError && (
                        <HelperText
                          type="error"
                          visible={otherWitnessTypeError}>
                          Other Witness is required.
                        </HelperText>
                      )} */}
                          </View>
                        )}

                        <View style={{ marginTop: 14 }}>
                          <CustomTextArea
                            label="Name, Email, Phone number"
                            placeholder="Name, Email, Phone number"
                            value={witnessDetails}
                            onChangeText={handleWitnessDetailsChange}
                            // onBlur={() => setOutcomeError(outcome.trim() === '')} // if needed
                            isRequired={false} // if Outcome is optional
                          // error={outcomeError} // add an error state if needed
                          />
                        </View>

                        {/* <View style={styles.inputGroup}>
                        <TextInput
                          mode="outlined"
                          outlineColor={witnessDetails ? "#2E9E4A" : "#BFBBBB"}
                          activeOutlineColor={"#2E9E4A"}
                          style={[
                            styles.textAreaDesc,
                            {
                              height: Platform.OS === "ios" ? 120 : 0,
                              textAlignVertical:
                                Platform.OS === "ios" ? "top" : "auto",
                            },
                          ]}
                          multiline
                          numberOfLines={6}
                          label={
                            <Text>
                              Name, Email, Phone number
                              <Text style={styles.required}> *</Text>
                            </Text>
                          }
                          placeholder="Name, Email, Phone number"
                          placeholderTextColor="#BFBBBB"
                          value={witnessDetails}
                          onChangeText={handleWitnessDetailsChange}
                          onBlur={() =>
                            setWitnessDetailsError(witnessDetails.trim() === '')
                          }
                          error={witnessDetailsError}
                        />
                        {witnessDetailsError && (
                      <HelperText type="error" visible={witnessDetailsError}>
                        Name, Email, Phone number is required.
                      </HelperText>
                    )}
                      </View> */}
                      </View>
                    </View>
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Anyone Injured ?</Text>
                    {isIOS ? (
                      <View style={styles.switchContainer}>
                        <Text style={styles.switchLabel}>No</Text>
                        <Switch
                          value={injured === "yes"}
                          onValueChange={(value) =>
                            setnjured(value ? "yes" : "no")
                          }
                          thumbColor={injured === "yes" ? "#fff" : "#fff"} // Custom color for the thumb
                          trackColor={{ false: "#3C4764", true: "#2E9E4A" }} // Custom color for the track
                        />
                        <Text style={styles.switchLabel}>Yes</Text>
                      </View>
                    ) : (
                      <>
                        <View style={styles.radioGroup}>
                          <RadioButton
                            value="no"
                            status={injured === "no" ? "checked" : "unchecked"}
                            onPress={() => setnjured("no")}
                            color="#2E9E4A"
                            uncheckedColor="#3C4764"
                          />
                          <Text style={styles.radioLabel}>No</Text>
                          <RadioButton
                            value="yes"
                            status={injured === "yes" ? "checked" : "unchecked"}
                            onPress={() => setnjured("yes")}
                            color="#2E9E4A"
                            uncheckedColor="#3C4764"
                          />
                          <Text style={styles.radioLabel}>Yes</Text>
                        </View>
                      </>
                    )}
                  </View>

                  {injured === "yes" && (
                    <View style={globalStyles.outlineContainer}>
                      <View>
                        <Text style={styles.label}>
                          Who was injured (select all that apply)?{" "}
                          <Text style={styles.required}>*</Text>
                        </Text>
                        {renderInjuredRow(injuredData).map((row, rowIndex) => (
                          <View key={rowIndex} style={styles.rowContainer}>
                            {row.map((field) => (
                              <View
                                key={field._id}
                                style={styles.itemContainer}
                              >
                                <CustomCheckbox
                                  checked={selectedInjured.includes(field._id)}
                                  onPress={() =>
                                    handleCheckboxChangeDynamicFeilds(
                                      field._id,
                                      selectedInjured,
                                      setSelectedInjured
                                    )
                                  }
                                />
                                <Text
                                  style={[
                                    styles.weaponText,
                                    selectedInjured.includes(field._id) &&
                                    styles.checkedText,
                                  ]}
                                >
                                  {field.lableValue}
                                </Text>
                              </View>
                            ))}
                          </View>
                        ))}

                        {selectedInjured.includes("other") && (
                          <View style={styles.inputGroup}>
                            <TextInput
                              mode="outlined"
                              outlineColor={
                                otherInjured ? "#2E9E4A" : "#BFBBBB"
                              }
                              activeOutlineColor={"#2E9E4A"}
                              style={styles.textInput}
                              label="Other"
                              placeholder="Other"
                              placeholderTextColor="#BFBBBB"
                              value={otherInjured}
                              onChangeText={setOtherInjured}
                            />
                          </View>
                        )}
                        {/* Display validation error */}
                        {injuredError ? (
                          <HelperText type="error" visible={injuredError}>
                            Please select at least one option.
                          </HelperText>
                        ) : null}

                        {/* Medical Attention Section */}
                        <Text style={styles.label}>
                          Medical Attention Provided
                        </Text>
                        {/* {renderInjuredRow(medicalAttention).map(
                          (row, rowIndex) => (
                            <View key={rowIndex} style={styles.rowContainer}>
                              {row.map((field) => (
                                <View
                                  key={field._id}
                                  style={styles.itemContainer}
                                >
                                  <CustomCheckbox
                                    checked={selectedMedicalAttention.includes(
                                      field._id
                                    )}
                                    onPress={() =>
                                      handleCheckboxChangeDynamicFeilds(
                                        field._id,
                                        selectedMedicalAttention,
                                        setSelectedMedicalAttention
                                      )
                                    }
                                  />
                                  <Text
                                    style={[
                                      styles.weaponText,
                                      selectedMedicalAttention.includes(
                                        field._id
                                      ) && styles.checkedText,
                                    ]}
                                  >
                                    {field.lableValue}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          )
                        )} */}
                        <View style={styles.columnContainer}>
                          {medicalAttention.map((field) => (
                            <View
                              key={field._id}
                              style={[styles.itemContainer, { width: "90%" }]}
                            >
                              <CustomCheckbox
                                checked={selectedMedicalAttention.includes(
                                  field._id
                                )}
                                onPress={() =>
                                  handleCheckboxChangeDynamicFeilds(
                                    field._id,
                                    selectedMedicalAttention,
                                    setSelectedMedicalAttention
                                  )
                                }
                              />
                              <Text
                                style={[
                                  styles.weaponText,
                                  selectedMedicalAttention.includes(
                                    field._id
                                  ) && styles.checkedText,
                                ]}
                              >
                                {field.lableValue}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Reported to Client</Text>
                    {isIOS ? (
                      <View style={styles.switchContainer}>
                        <Text style={styles.switchLabel}>No</Text>
                        <Switch
                          value={reportToClient === "yes"}
                          onValueChange={(value) =>
                            setReportToClient(value ? "yes" : "no")
                          }
                          thumbColor={
                            reportToClient === "yes" ? "#fff" : "#fff"
                          } // Custom color for the thumb
                          trackColor={{ false: "#3C4764", true: "#2E9E4A" }} // Custom color for the track
                        />
                        <Text style={styles.switchLabel}>Yes</Text>
                      </View>
                    ) : (
                      <>
                        <View style={styles.radioGroup}>
                          <RadioButton
                            value="no"
                            status={
                              reportToClient === "no" ? "checked" : "unchecked"
                            }
                            onPress={() => setReportToClient("no")}
                            color="#2E9E4A"
                            uncheckedColor="#3C4764"
                          />
                          <Text style={styles.radioLabel}>No</Text>
                          <RadioButton
                            value="yes"
                            status={
                              reportToClient === "yes" ? "checked" : "unchecked"
                            }
                            onPress={() => setReportToClient("yes")}
                            color="#2E9E4A"
                            uncheckedColor="#3C4764"
                          />
                          <Text style={styles.radioLabel}>Yes</Text>
                        </View>
                      </>
                    )}
                    {reportToClient === "yes" && (
                      <View style={globalStyles.outlineContainer}>
                        <View style={styles.inputGroup}>
                          <TextInput
                            mode="outlined"
                            outlineColor={clientName ? "#2E9E4A" : "#BFBBBB"}
                            activeOutlineColor={"#2E9E4A"}
                            style={styles.textInput}
                            label={
                              <Text>
                                Client Name
                                <Text style={styles.required}>*</Text>
                              </Text>
                            }
                            placeholder="Client Name"
                            placeholderTextColor="#BFBBBB"
                            value={clientName}
                            onChangeText={setClientName}
                          />
                          {clientNameError && (
                            <HelperText type="error" visible={clientNameError}>
                              Client Name is required.
                            </HelperText>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                  <View style={[styles.inputGroup]}>
                    <Text style={styles.label}>
                      Please upload photos below (10 Files Max - 17MB Max)
                    </Text>
                    <ImageUploader
                      imageUris={imageUris}
                      removeImage={removeImage}
                      toggleOverlay={toggleOverlay}
                    />
                  </View>

                  <View style={styles.signatureContainer}>
                    <Text style={styles.label}>
                      I hereby declare that the information provided is true and
                      correct
                    </Text>
                    {isSignatureSaved ? (
                      <Image
                        source={{
                          uri: isSignatureBase64
                            ? `data:image/png;base64,${signatureUri}`
                            : signatureUri,
                        }}
                        style={[{ flex: 1 }, styles.signatureImage]}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={styles.signatureView}>
                        <SignatureCapture
                          style={[{ flex: 1 }, styles.signature]}
                          ref={signatureRef}
                          onSaveEvent={onSaveEvent}
                          onDragEvent={handleDrawEvent}
                          saveImageFileInExtStorage={false}
                          showNativeButtons={false}
                          showTitleLabel={false}
                          minStrokeWidth={4}
                          maxStrokeWidth={4}
                          viewMode={"portrait"}
                        />
                      </View>
                    )}
                    {isSignatureSaved ? (
                      <View
                        style={{
                          flex: 1,
                          flexDirection: "row",
                          justifyContent: "center",
                        }}
                      >
                        <TouchableHighlight
                          style={[
                            styles.buttonStyle,
                            { backgroundColor: "#04B2D9" },
                          ]}
                          onPress={() => {
                            resetSign();
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <FontAwesome
                              name="pencil"
                              size={16}
                              color="#fff"
                              style={{ marginRight: 5 }}
                            />
                            <Text style={{ color: "#fff", fontWeight: "500" }}>
                              Re-Sign
                            </Text>
                          </View>
                        </TouchableHighlight>
                      </View>
                    ) : hasDrawn ? (
                      <View
                        style={{
                          flex: 1,
                          flexDirection: "row",
                          justifyContent: "center",
                        }}
                      >
                        <TouchableHighlight
                          style={[styles.buttonStyle]}
                          onPress={() => {
                            saveSign();
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <FontAwesome
                              name="save"
                              size={16}
                              color="#fff"
                              style={{ marginRight: 5 }}
                            />
                            <Text style={{ color: "#fff", fontWeight: "500" }}>
                              Save
                            </Text>
                          </View>
                        </TouchableHighlight>
                        <TouchableHighlight
                          style={[
                            styles.buttonStyle,
                            { backgroundColor: "#BC4749" },
                          ]}
                          onPress={() => {
                            resetSign();
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <FontAwesome
                              name="times"
                              size={16}
                              color="#fff"
                              style={{ marginRight: 5 }}
                            />
                            <Text style={{ color: "#fff", fontWeight: "500" }}>
                              Clear
                            </Text>
                          </View>
                        </TouchableHighlight>
                      </View>
                    ) : null}
                  </View>
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <ThankYouModal
                      isVisible={modalVisible}
                      activityNo={ReportDetails?.activityNumber}
                      activityType={ReportDetails?.incidentCategory?.name}
                      reportType="Incident"
                      location={ReportDetails?.location}
                      reportedAt={moment
                        .utc(ReportDetails?.reportedAt)
                        .format("YYYY-MM-DD HH:mm A")}
                      subActivityType={
                        ReportDetails?.typeOfIncidentCategory?.name
                      }
                      onClose={closeModal}
                    />
                  </View>

                  <View style={{ top: 10, marginBottom: 10 }}>
                    <TouchableOpacity
                      style={[
                        styles.button,
                        {
                          flex: 1,
                          backgroundColor: hasDrawn ? "lightgrey" : "#50C878",
                        },
                      ]}
                      onPress={() => handleSubmit(false)}
                      disabled={hasDrawn} // Disable when no signature is saved
                    >
                      <Text style={[styles.btnText, { color: "#FFF" }]}>
                        SUBMIT
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.button,
                        {
                          flex: 1,
                          backgroundColor: hasDrawn ? "lightgrey" : "#FFB74A",
                          marginTop: 10,
                        },
                      ]}
                      onPress={() => handleSubmit(true)}
                      disabled={hasDrawn}
                    >
                      <Text style={[styles.btnText, { color: "#FFF" }]}>
                        SAVE AS DRAFT
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.button,
                        { flex: 1, backgroundColor: "#DE3163", marginTop: 10 },
                      ]}
                      onPress={() => navigation.goBack()}
                      disabled={isLoading ? true : false}
                    >
                      <Text style={styles.btnText}>CANCEL</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
        <FooterUser activeIcon={activeIcon} setActiveIcon={setActiveIcon} />
        {overlayVisible && (
          <>
            <TouchableOpacity
              style={styles.overlayImageContainer}
              onPress={toggleOverlay}
            >
              <Image
                source={require("../assets/manager/overlayProfile.png")}
                style={styles.overlayProfileImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <View style={styles.bottomOverlayImageContainer}>
              <Image
                source={require("../assets/images/homebottom.png")}
                style={[styles.bottomImage, { width: windowWidth * 1 }]}
                resizeMode="contain"
              />

              <View style={styles.overlayTextContainer}>
                <Text style={styles.overlayText}>Upload Image</Text>
                <View style={styles.horizontalLine} />
                <TouchableOpacity
                  onPress={() => {
                    openGallery();
                    toggleOverlay();
                  }}
                >
                  <Text style={styles.overlayTextFilter}>
                    Import from gallery
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    handleImagePicker();
                    toggleOverlay();
                  }}
                >
                  <Text style={styles.overlayTextFilter}>Take a picture</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
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
  recentActivitiesBlock: {
    borderRadius: 20,
    marginVertical: 10,
    marginBottom: 100,
  },
  textContainer: {
    // position: 'absolute',
    flexDirection: "row",
    alignItems: "center",
    // paddingHorizontal: 24,
    width: "100%",
    justifyContent: "center",
    marginTop: 10,
  },
  titleContainer: {
    flex: 1,
    // alignItems: 'center',
    // marginRight: 30,
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
  backIconContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 30,
    paddingRight: 10,
    width: 50,
    height: 50,
  },
  personalInfocontainer: {
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: "#fff",
    elevation: 3,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ccc",
    top: 20,
    flexDirection: "row",
    marginHorizontal: 10,
  },
  content: {
    padding: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "center",
  },
  text: {
    fontSize: 14,
    color: "#000",
    fontWeight: "bold",
    // flex: 1
  },
  subText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "normal",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BFBBBB",
    borderRadius: 5,
    paddingHorizontal: 10,
    margin: 10,
    // width: '95%',
  },
  input: {
    flex: 1,
    color: "#000",
    // padding: 10,
    borderColor: "#BFBBBB",
    borderWidth: 1,
    borderRadius: 8,
  },

  tabContainer: {
    flexDirection: "row",
    // flexWrap: 'wrap',
    justifyContent: "flex-start",
    padding: 10,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 5,
    // backgroundColor: '#E0E0E0',
    borderColor: "#383D35",
    borderWidth: 2,
    marginVertical: 5,
    marginRight: 5,
  },
  activeTab: {
    backgroundColor: "#4CAF50",
    borderColor: "transparent",
  },
  tabText: {
    color: "#000",
    fontSize: 13,
  },
  tabTextActive: {
    color: "#FFF",
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 15,
    color: "#4F4F4F",
    paddingHorizontal: 10,
  },
  inputGroup: {
    marginVertical: 6,
  },
  label: {
    marginBottom: 5,
    fontWeight: "bold",
    color: "#252724",
    flexDirection: "row",
  },
  required: {
    color: "red",
  },
  textArea: {
    height: 100,
  },
  pickerContainer: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
    marginBottom: 20,
  },
  picker: {
    width: "100%",
    height: "100%",
    color: "#000",
    backgroundColor: "transparent", // If you want a transparent background
  },
  itemStyle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000", // Text color for items
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "center",
    margin: 10,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: "#B0BEC5",
    marginHorizontal: 5,
  },
  submitButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: "#1E88E5",
  },
  buttonText: {
    color: "#FFF",
  },
  dropdownContainer: {
    width: "100%", // Full width
    position: "relative",
    zIndex: 1,
  },
  dropdown: {
    width: "100%", // Full width
    padding: 10,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
    paddingRight: 40, // Space for the icon
    color: "#000",
  },
  dropdownText: {
    fontSize: 14,
    color: "#000",
  },
  dropdownDropdown: {
    width: "100%", // Full width
    borderColor: "#000",
    borderRadius: 5,
    color: "#000",
  },
  dropdownIcon: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -12 }],
  },
  button: {
    // borderWidth: 1,
    // borderColor: '#313F63', // Change color as needed
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "transparent",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  btnText: {
    fontSize: 15,
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  timePickerContainer: {
    height: 300, // Adjust this value to your desired height
    justifyContent: "center",
    width: "100%",
  },
  overlayImageContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  overlayProfileImage: {
    width: "100%",
    height: "100%",
  },

  overlayTextContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    marginVertical: 40,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  overlayText: {
    fontSize: 20,
    marginHorizontal: 30,
    fontWeight: "bold",
    color: "#262D3F",
  },
  overlayTextFilter: {
    marginTop: 20,
    fontSize: 16,
    marginHorizontal: 30,
    fontWeight: "400",
    color: "#3C4764",
  },
  horizontalLine: {
    borderBottomWidth: 1,
    borderColor: "#B6BED3",
    width: "100%",
    marginTop: 20,
  },
  bottomOverlayImageContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
  },
  bottomImage: {
    height: 363,
  },
  textInput: {
    backgroundColor: "#fff",
    height: 45,
  },
  textAreaDesc: {
    // height: 150, // Explicit height to ensure visibility of multiple lines
    textAlignVertical: "top",
    backgroundColor: "#fff",
  },
  signature: {
    flex: 1,
    height: 200,
    borderColor: "#000",
    borderWidth: 5,
  },
  buttonStyle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 15,
    backgroundColor: "#50C878", // Fresh green color
    borderRadius: 8, // Rounded corners
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Adds shadow for Android
  },
  signatureView: {
    borderColor: "#000",
    borderWidth: 1,
  },
  signatureImage: {
    width: "100%",
    height: 200,
  },
  radioGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioLabel: {
    marginRight: 10,
    color: "#000",
  },
  checkboxContainer: {
    flexDirection: "row",
    marginBottom: 8,
    width: "40%",
  },
  checkboxWrapper: {
    // padding: 5, // Add padding to make the checkbox more touchable
    borderRadius: 5, // Optional: add border radius for a smoother look
    borderWidth: 1, // Optional: add a border for better visibility
    borderColor: "grey", // Border color
    // width: 30,
    // height: 30
  },
  customCheckbox: {
    width: 25,
    height: 25,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  radioButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "50%",
  },
  switchLabel: {
    fontSize: 16,
    marginHorizontal: 16,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Space between checkboxes
    // marginBottom: 10, // Space between rows
  },
  columnContainer: {
    flexDirection: "column", // Ensure a single column layout
    alignItems: "flex-start", // Align items to the start
    gap: 5, // Optional spacing between items
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    width: "48%", // Make sure each checkbox occupies half the width
  },
  weaponText: {
    marginLeft: 5,
    fontSize: 13,
    color: "#000",
  },
  checkedText: {
    // textDecorationLine: "line-through",
    color: "#888", // Example: Change color when checked
  },
});

export default IncidentReport;
