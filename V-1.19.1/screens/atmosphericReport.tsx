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
    RefreshControl,
    TouchableWithoutFeedback,
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
import { SERVER_URL_ROASTERING } from "../Constant";
import { io } from "socket.io-client";
import FeatherIcon from "react-native-vector-icons/Feather";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
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
    Checkbox,
    RadioButton,
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
import { SafeAreaView } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import CustomBottomSheet from "../components/CustomBottomSheet/CustomBottomSheet";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import CustomTextArea from "../components/CustomTextArea/CustomTextArea";
import { Controller, useForm } from "react-hook-form";
import { NEXT_PUBLIC_END_OF_SHIFT_CATEGORY_ID } from "../Constant";
const windowWidth = Dimensions.get("window").width;

interface ButtonOption {
    id: number;
    label: string;
    color: "primary" | "info" | "warning";
    buttonText?: string;
}

const AtmosphericReport = () => {
    const navigation = useNavigation();

    const {
        handleSubmit,
        control,
        reset,
        watch,
        trigger,
        setError,
        formState: { errors, touchedFields, isValid },
        getValues,
        setValue,
        clearErrors,
    } = useForm({
        mode: "onChange",
        defaultValues: {
            reportedDate: null,
            initiatedBy: "",
            siteName: null,

            shiftDate: null,
            shiftStartDateTime: null,
            shiftEndDateTime: null,

            visibleOptions: 0,
            frustrationOne: {},
            frustrationTwo: {},

            visibleOptionsShouting: 0,
            shoutingOne: {},
            shoutingTwo: {},

            visibleOptionsVerbal: 0,
            verbalThreatsOne: {},
            verbalThreatsTwo: {},

            visibleOptionsPushing: 0,
            pushingShovingOne: {},
            pushingShovingTwo: {},

            visibleOptionsAssaultpunch: 0,
            assaultPunchKickSlapOne: {},
            assaultPunchKickSlapTwo: {},

            visibleOptionsAssault: 0,
            assaultWeaponInvolvedOne: {},
            assaultWeaponInvolvedTwo: {},

            assaultTypeOfWeaponOne: {},
            assaultTypeOfWeaponTwo: {},
            otherWeapon: "",

            assaultWeaponProducedType: {
                One: "",
                Two: "",
            },
        },

        mode: "onTouched",
        reValidateMode: "onChange",
    });

    const route = useRoute();
    // const { shift } = route.params;
    const { shift, reportType, id, status, location, subLocation } = route.params;
    // console.log(shift);

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeIcon, setActiveIcon] = useState<number>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [clickedPage, setClickedPage] = useState(1);
    //   const [activeTab, setActiveTab] = useState("Activity Log");

    const [visible, setVisible] = React.useState(false);
    const [imageRange, setImageRange] = React.useState("");
    const [overlayVisible, setOverlayVisible] = useState(false);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePickerReported, setShowTimePickerReported] = useState(false);
    const [showTimePickerShiftStart, setShowTimePickerShiftStart] =
        useState(false);
    const [showTimePickerShiftEnd, setShowTimePickerShiftEnd] = useState(false);
    const [showTimePickerShiftDate, setShowTimePickerShiftDate] = useState(false);

    const [isIOSDatePickerVisible, setIOSDatePickerVisible] = useState(false);
    const [isIOSTimePickerVisible, setIOSTimePickerVisible] = useState(false);

    const [date, setDate] = useState(new Date());

    const [activityCategories, setActivityCategories] = useState([]);
    const [activityTypes, setActivityTypes] = useState([]);
    const [locations, setLocations] = useState([]);
    const [subLocations, setSubLocations] = useState([]);
    const [otherLocation, setOtherLocation] = useState("");

    const [description, setDescription] = useState("");
    const [outcome, setOutcome] = useState("");

    const [imageUris, setImageUris] = useState([]);

    const [selectedValue, setSelectedValue] = useState("");
    const [siteName, setSiteName] = useState(shift?.siteId?.siteName);

    const [selectedValueType, setSelectedValueType] = useState("");
    const [selectedValueLocation, setSelectedValueLocation] = useState("");
    const [selectedValueSubLocation, setSelectedValueSubLocation] = useState("");
    const [severityLevel, setSeverityLevel] = useState("");
    const [reportedDate, setReportedDate] = useState(
        dayjs().format("DD/MM/YYYY")
    );
    const [shiftDate, setShiftDate] = useState(dayjs().format("DD/MM/YYYY"));
    const [reportedTime, setReportedTime] = useState(dayjs().format("h:mm A"));
    // const [shiftStartTime, setShiftStartTime] = useState(dayjs().format("h:mm A"));
    const [shiftStartDateTime, sethiftStartDateTime] = useState(
        dayjs().format("h:mm A")
    );
    const [shiftEndTime, setShiftEndTime] = useState(dayjs().format("h:mm A"));

    const [dateError, setDateError] = useState(false);
    const [timeError, setTimeError] = useState(false);
    const [descriptionError, setDescriptionError] = useState(false);
    const [outcomeError, setOutcomeError] = useState(false);
    const [priorityError, setPriorityError] = useState(false);
    const [locationError, setLocationError] = useState(false);
    const [otherLocationError, setOtherLocationError] = useState(false);
    const [activityCategoryError, setActivityCategoryError] = useState(false);

    const [signatureUri, setSignatureUri] = useState(null);
    const [isSignatureSaved, setIsSignatureSaved] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const signatureRef = useRef(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchQueryPriority, setSearchQueryPriority] = useState("");
    const [searchQueryType, setSearchQueryType] = useState("");
    const [searchQueryLocation, setSearchQueryLocation] = useState("");
    const [searchQuerySubLocation, setSearchQuerySubLocation] = useState("");

    const [ReportDetails, setReportDetails] = useState<any>([]);

    const [sidebarTranslateX] = useState(new Animated.Value(-windowWidth * 0.7));
    const [isFocused, setIsFocused] = useState(false);
    const [active, setActive] = useState(null);
    const [reportFields, setReportFields] = useState([]);

    // console.log('reportFields  -----  ------   reportFields -----   ------ ', reportFields);

    const [visibleOptions, setVisibleOptions] = useState(0);
    const [visibleOptionsShouting, setVisibleOptionsShouting] = useState(0);
    const [visibleOptionsVerbal, setVisibleOptionsVerbal] = useState(0);
    const [visibleOptionsPushing, setVisibleOptionsPushing] = useState(0);
    const [visibleOptionsAssaultpunch, setVisibleOptionsAssaultpunch] =
        useState(0);
    const [visibleOptionsAssault, setVisibleOptionsAssault] = useState(0);

    const [frustrationOne, setFrustrationOne] = useState([]);
    const [frustrationTwo, setFrustrationTwo] = useState([]);
    const [shoutingOne, setShoutingOne] = useState([]);
    const [shoutingTwo, setShoutingTwo] = useState([]);
    const [verbalThreatsOne, setVerbalThreatsOne] = useState([]);
    const [verbalThreatsTwo, setVerbalThreatsTwo] = useState([]);
    const [pushingShovingOne, setPushingShovingOne] = useState([]);
    const [pushingShovingTwo, setPushingShovingTwo] = useState([]);
    const [assaultPunchKickSlapOne, setAssaultPunchKickSlapOne] = useState([]);
    const [assaultPunchKickSlapTwo, setAssaultPunchKickSlapTwo] = useState([]);
    const [assaultWeaponInvolvedOne, setAssaultWeaponInvolvedOne] = useState([]);
    const [assaultWeaponInvolvedTwo, setAssaultWeaponInvolvedTwo] = useState([]);
    const [assaultTypeOfWeaponOne, setAssaultTypeOfWeaponOne] = useState([]);
    const [assaultTypeOfWeaponTwo, setAssaultTypeOfWeaponTwo] = useState([]);
    const [assaultWeaponProducedTypeOne, setAssaultWeaponProducedTypeOne] =
        useState([]);
    const [assaultWeaponProducedTypeTwo, setAssaultWeaponProducedTypeTwo] =
        useState([]);
    const [otherWeapon, setOtherWeapon] = useState(false);
    const [selectedData, setSelectedData] = useState({});
    const [summaryOfIncident, setSummaryOfIncident] = useState("");

    const [atmosphreicReportById, setAtmosphreicReportById] = useState(null);

    const [startTimeError, setStartTimeError] = useState("");
    const [endTimeError, setEndTimeError] = useState("");

    // console.log('frustrationTwo ---- ', frustrationTwo);

    const buttonOptions: ButtonOption[] = [
        { id: 0, label: "Incidents Occurred", color: "primary" },
        { id: 1, label: "Incidents Occurred", color: "info" },
        { id: 2, label: "Incidents Occurred", color: "warning", buttonText: "2+" },
    ];

    const buttonColors: Record<"primary" | "info" | "warning", string> = {
        primary: "#BC131F",
        info: "#00CFE8",
        warning: "#FF9F43",
    };

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                try {
                    setIsLoading(true);
                    if (status === "draft") {
                        const url = `${SERVER_URL_ROASTERING}/get/end/of/shift/report/${id}`;
                        const response = await axios.get(url, { withCredentials: true });

                        if (response?.status === 200) {
                            setAtmosphreicReportById(response?.data);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching data:", error);
                } finally {
                    setIsLoading(false); // Stop loader
                }
            };

            fetchData();
        }, [setValue]) // Re-run when status or id changes
    );

    useEffect(() => {
        if (atmosphreicReportById?.endOfShift) {
            // console.log("atmosphreicReportById:", atmosphreicReportById);

            const { endOfShift } = atmosphreicReportById;
            const {
                reportedAt,
                shiftStartDateTime,
                shiftEndDateTime,
                summaryOfIncident,
            } = endOfShift;
            // console.log("reported at ------------------- ", reportedAt);

            if (reportedAt) {
                setReportedDate(moment.utc(reportedAt).format("DD/MM/YYYY")); // Ensures UTC date
                setReportedTime(moment.utc(reportedAt).format("hh:mm A"));
            }

            if (shiftStartDateTime) {
                sethiftStartDateTime(moment.utc(shiftStartDateTime).format("h:mm A"));
                setShiftDate(moment.utc(shiftStartDateTime).format("DD/MM/YYYY"));
            }

            if (shiftEndDateTime) {
                setShiftEndTime(moment.utc(shiftEndDateTime).format("h:mm A"));
            }
            if (summaryOfIncident) {
                setSummaryOfIncident(summaryOfIncident);
            }
        }
    }, [atmosphreicReportById]);

    useEffect(() => {
        if (atmosphreicReportById && atmosphreicReportById?.endOfShift) {
            const {
                frustrationStressImpatience,
                shouting,
                verbalThreats,
                pushingShoving,
                assaultPunchKickSlap,
                assaultWeaponInvolved,
            } = atmosphreicReportById?.endOfShift;

            if (frustrationStressImpatience) {
                const { one, twoPlus, zero, oneIncidents, twoPlusIncidents } =
                    frustrationStressImpatience;

                setSelectedData((prev) => ({
                    ...prev,
                    frustration: [],
                }));

                if (one) {
                    setVisibleOptions(1);

                    if (oneIncidents?.directedToWards) {
                        oneIncidents.directedToWards.forEach((item) => {
                            setValue(`frustrationOne.${item._id}`, true);

                            handleCheckboxChange(
                                "frustration",
                                item.lableValue,
                                true // Add this value
                            );
                        });
                    }
                } else if (twoPlus) {
                    setVisibleOptions(2);

                    if (twoPlusIncidents?.directedToWards) {
                        twoPlusIncidents.directedToWards.forEach((item) => {
                            setValue(`frustrationTwo.${item._id}`, true);

                            handleCheckboxChange(
                                "frustration",
                                item.lableValue,
                                true // Add this value
                            );
                        });
                    }
                } else if (zero) {
                    setVisibleOptions(0);
                    setValue("frustrationOne", {});
                    setValue("frustrationTwo", {});
                } else {
                    setVisibleOptions(0);
                    setValue("frustrationOne", {});
                    setValue("frustrationTwo", {});
                }
            }

            if (shouting) {
                const { one, twoPlus, zero, oneIncidents, twoPlusIncidents } = shouting;

                setSelectedData((prev) => ({
                    ...prev,
                    shouting: [],
                }));

                if (one) {
                    setVisibleOptionsShouting(1);

                    if (oneIncidents?.directedToWards) {
                        oneIncidents.directedToWards.forEach((item) => {
                            setValue(`shoutingOne.${item._id}`, true);

                            handleCheckboxChange(
                                "shouting",
                                item.lableValue,
                                true // Add this value
                            );
                        });
                    }
                } else if (twoPlus) {
                    setVisibleOptionsShouting(2);

                    if (twoPlusIncidents?.directedToWards) {
                        twoPlusIncidents.directedToWards.forEach((item) => {
                            setValue(`shoutingTwo.${item._id}`, true);

                            handleCheckboxChange(
                                "shouting",
                                item.lableValue,
                                true // Add this value
                            );
                        });
                    }
                } else if (zero) {
                    setVisibleOptionsShouting(0);
                    setValue("shoutingOne", {});
                    setValue("shoutingTwo", {});
                } else {
                    setVisibleOptionsShouting(0);
                    setValue("shoutingOne", {});
                    setValue("shoutingTwo", {});
                }
            }

            if (verbalThreats) {
                const { one, twoPlus, zero, oneIncidents, twoPlusIncidents } =
                    verbalThreats;

                setSelectedData((prev) => ({
                    ...prev,
                    verbal: [],
                }));

                if (one) {
                    setVisibleOptionsVerbal(1);

                    if (oneIncidents?.directedToWards) {
                        oneIncidents.directedToWards.forEach((item) => {
                            setValue(`verbalThreatsOne.${item._id}`, true);

                            handleCheckboxChange(
                                "verbal",
                                item.lableValue,
                                true // Add this value
                            );
                        });
                    }
                } else if (twoPlus) {
                    setVisibleOptionsVerbal(2);

                    if (twoPlusIncidents?.directedToWards) {
                        twoPlusIncidents.directedToWards.forEach((item) => {
                            setValue(`verbalThreatsTwo.${item._id}`, true);

                            handleCheckboxChange(
                                "verbal",
                                item.lableValue,
                                true // Add this value
                            );
                        });
                    }
                } else if (zero) {
                    setVisibleOptionsVerbal(0);
                    setValue("verbalThreatsOne", {});
                    setValue("verbalThreatsTwo", {});
                } else {
                    setVisibleOptionsVerbal(0);
                    setValue("verbalThreatsOne", {});
                    setValue("verbalThreatsTwo", {});
                }
            }

            if (pushingShoving) {
                const { one, twoPlus, zero, oneIncidents, twoPlusIncidents } =
                    pushingShoving;

                setSelectedData((prev) => ({
                    ...prev,
                    pushing: [],
                }));

                if (one) {
                    setVisibleOptionsPushing(1);

                    if (oneIncidents?.directedToWards) {
                        oneIncidents.directedToWards.forEach((item) => {
                            setValue(`pushingShovingOne.${item._id}`, true);

                            handleCheckboxChange(
                                "pushing",
                                item.lableValue,
                                true // Add this value
                            );
                        });
                    }
                } else if (twoPlus) {
                    setVisibleOptionsPushing(2);

                    if (twoPlusIncidents?.directedToWards) {
                        twoPlusIncidents.directedToWards.forEach((item) => {
                            setValue(`pushingShovingTwo.${item._id}`, true);

                            handleCheckboxChange(
                                "pushing",
                                item.lableValue,
                                true // Add this value
                            );
                        });
                    }
                } else if (zero) {
                    setVisibleOptionsPushing(0);
                    setValue("pushingShovingOne", {});
                    setValue("pushingShovingTwo", {});
                } else {
                    setVisibleOptionsPushing(0);
                    setValue("pushingShovingOne", {});
                    setValue("pushingShovingTwo", {});
                }
            }

            if (assaultPunchKickSlap) {
                const { one, twoPlus, zero, oneIncidents, twoPlusIncidents } =
                    assaultPunchKickSlap;

                setSelectedData((prev) => ({
                    ...prev,
                    assaultPunch: [],
                }));

                if (one) {
                    setVisibleOptionsAssaultpunch(1);

                    if (oneIncidents?.directedToWards) {
                        oneIncidents.directedToWards.forEach((item) => {
                            setValue(`assaultPunchKickSlapOne.${item._id}`, true);

                            handleCheckboxChange(
                                "assaultPunch",
                                item.lableValue,
                                true // Add this value
                            );
                        });
                    }
                } else if (twoPlus) {
                    setVisibleOptionsAssaultpunch(2);

                    if (twoPlusIncidents?.directedToWards) {
                        twoPlusIncidents.directedToWards.forEach((item) => {
                            setValue(`assaultPunchKickSlapTwo.${item._id}`, true);

                            handleCheckboxChange(
                                "assaultPunch",
                                item.lableValue,
                                true // Add this value
                            );
                        });
                    }
                } else if (zero) {
                    setVisibleOptionsAssaultpunch(0);
                    setValue("assaultPunchKickSlapOne", {});
                    setValue("assaultPunchKickSlapTwo", {});
                } else {
                    setVisibleOptionsAssaultpunch(0);
                    setValue("assaultPunchKickSlapOne", {});
                    setValue("assaultPunchKickSlapTwo", {});
                }
            }

            if (assaultWeaponInvolved) {
                const { one, twoPlus, zero, oneIncidents, twoPlusIncidents } =
                    assaultWeaponInvolved;

                setSelectedData((prev) => ({
                    ...prev,
                    assaultWeapon: [],
                    assaultTypeOfWeapon: [],
                }));

                if (one) {
                    setVisibleOptionsAssault(1);

                    if (oneIncidents?.directedToWards) {
                        oneIncidents.directedToWards.forEach((item) => {
                            setValue(`assaultWeaponInvolvedOne.${item._id}`, true);

                            handleCheckboxChange(
                                "assaultWeapon",
                                item.lableValue,
                                true // Add this value
                            );
                        });
                    }

                    if (oneIncidents?.typeOfWeapon) {
                        if (oneIncidents?.typeOfWeapon?.weapon) {
                            oneIncidents?.typeOfWeapon?.weapon.forEach((item) => {
                                setValue(`assaultTypeOfWeaponOne.${item._id}`, true);

                                handleCheckboxChange(
                                    "assaultTypeOfWeapon",
                                    item.lableValue,
                                    true // Add this value
                                );
                            });
                        }

                        if (
                            oneIncidents?.typeOfWeapon?.otherWeapon &&
                            oneIncidents?.typeOfWeapon?.otherWeapon !== ""
                        ) {
                            setValue(`assaultTypeOfWeaponOne.other`, true);
                            setOtherWeapon(true);
                            setValue("otherWeapon", oneIncidents?.typeOfWeapon?.otherWeapon);

                            setSelectedData((prev) => ({
                                ...prev,
                                assaultTypeOfWeapon: [
                                    ...(prev.assaultTypeOfWeapon || []),
                                    "Other",
                                ],
                            }));
                        } else if (oneIncidents?.typeOfWeapon?.otherWeapon === "") {
                            setValue(`assaultTypeOfWeaponOne.other`, true);
                            setOtherWeapon(true);
                            setValue("otherWeapon", oneIncidents?.typeOfWeapon?.otherWeapon);

                            setSelectedData((prev) => ({
                                ...prev,
                                assaultTypeOfWeapon: [
                                    ...(prev.assaultTypeOfWeapon || []),
                                    "Other",
                                ],
                            }));
                        } else {
                            setValue(`assaultTypeOfWeaponOne.other`, false);
                            setOtherWeapon(false);
                            setValue("otherWeapon", "");
                        }
                    }

                    if (oneIncidents?.weaponProducedType) {
                        setValue(
                            `assaultWeaponProducedType.One`,
                            oneIncidents.weaponProducedType._id
                        );

                        setSelectedData((prev) => ({
                            ...prev,
                            assaultWeaponProducedType: {
                                name: "assaultWeaponProducedType",
                                value: oneIncidents.weaponProducedType.lableValue, // Set the selected label value
                            },
                        }));
                    }
                } else if (twoPlus) {
                    setVisibleOptionsAssault(2);

                    if (twoPlusIncidents?.directedToWards) {
                        twoPlusIncidents.directedToWards.forEach((item) => {
                            setValue(`assaultWeaponInvolvedTwo.${item._id}`, true);

                            handleCheckboxChange(
                                "assaultWeapon",
                                item.lableValue,
                                true // Add this value
                            );
                        });
                    }

                    if (twoPlusIncidents?.typeOfWeapon) {
                        if (twoPlusIncidents?.typeOfWeapon?.weapon) {
                            twoPlusIncidents?.typeOfWeapon?.weapon.forEach((item) => {
                                setValue(`assaultTypeOfWeaponTwo.${item._id}`, true);

                                handleCheckboxChange(
                                    "assaultTypeOfWeapon",
                                    item.lableValue,
                                    true // Add this value
                                );
                            });
                        }

                        if (
                            twoPlusIncidents?.typeOfWeapon?.otherWeapon &&
                            twoPlusIncidents?.typeOfWeapon?.otherWeapon !== ""
                        ) {
                            setValue(`assaultTypeOfWeaponTwo.other`, true);
                            setOtherWeapon(true);
                            setValue(
                                "otherWeapon",
                                twoPlusIncidents?.typeOfWeapon?.otherWeapon
                            );
                        } else if (twoPlusIncidents?.typeOfWeapon?.otherWeapon === "") {
                            setValue(`assaultTypeOfWeaponTwo.other`, true);
                            setOtherWeapon(true);
                            setValue(
                                "otherWeapon",
                                twoPlusIncidents?.typeOfWeapon?.otherWeapon
                            );
                        } else {
                            setValue(`assaultTypeOfWeaponTwo.other`, false);
                            setOtherWeapon(false);
                            setValue("otherWeapon", "");
                        }
                    }

                    if (twoPlusIncidents?.weaponProducedType) {
                        setValue(
                            `assaultWeaponProducedType.Two`,
                            twoPlusIncidents.weaponProducedType._id
                        );

                        setSelectedData((prev) => ({
                            ...prev,
                            assaultWeaponProducedType: {
                                name: "assaultWeaponProducedType",
                                value: twoPlusIncidents.weaponProducedType.lableValue, // Set the selected label value
                            },
                        }));
                    }
                } else if (zero) {
                    setVisibleOptionsAssault(0);
                    setValue("assaultWeaponInvolvedOne", {});
                    setValue("assaultWeaponInvolvedTwo", {});

                    setValue("assaultTypeOfWeaponOne", {});
                    setValue("assaultTypeOfWeaponTwo", {});

                    setValue(`assaultTypeOfWeaponOne.other`, false);
                    setOtherWeapon(false);
                    setValue("otherWeapon", "");

                    setValue(`assaultWeaponProducedType.One`, {});
                    setValue(`assaultWeaponProducedType.Two`, {});
                } else {
                    setVisibleOptionsAssault(0);
                    setValue("assaultWeaponInvolvedOne", {});
                    setValue("assaultWeaponInvolvedTwo", {});

                    setValue("assaultTypeOfWeaponOne", {});
                    setValue("assaultTypeOfWeaponTwo", {});

                    setValue(`assaultTypeOfWeaponOne.other`, false);
                    setOtherWeapon(false);
                    setValue("otherWeapon", "");

                    setValue(`assaultWeaponProducedType.One`, {});
                    setValue(`assaultWeaponProducedType.Two`, {});
                }
            }
        }
    }, [atmosphreicReportById, setValue]);
    // useEffect(() => {
    //     // Pre-fill assaultWeaponProducedType based on selected visibility option
    //     if (visibleOptionsAssault === 1 && atmosphreicReportById?.endOfShift?.assaultWeaponInvolved?.oneIncidents?.weaponProducedType) {
    //         const oneWeaponProducedType = atmosphreicReportById.endOfShift.assaultWeaponInvolved.oneIncidents.weaponProducedType.lableValue;
    //         setValue("assaultWeaponProducedType.One", oneWeaponProducedType); // Set value directly
    //     } else if (visibleOptionsAssault === 2 && atmosphreicReportById?.endOfShift?.assaultWeaponInvolved?.twoPlusIncidents?.weaponProducedType) {
    //         const twoWeaponProducedType = atmosphreicReportById.endOfShift.assaultWeaponInvolved.twoPlusIncidents.weaponProducedType.lableValue;
    //         setValue("assaultWeaponProducedType.Two", twoWeaponProducedType); // Set value directly
    //     }
    // }, [visibleOptionsAssault, setValue, atmosphreicReportById]);

    useEffect(() => {
        if (status !== "draft") {
            setValue("reportedDate", dayjs());
            setValue("shiftDate", dayjs());
            setValue("shiftStartDateTime", dayjs());
            setValue("shiftEndDateTime", dayjs());
        }
    }, [setValue]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                let page = 1; // Start with the first page
                let allData: string | any[] | ((prevState: never[]) => never[]) = []; // Array to store all fetched data
                let totalCount = 0; // Total number of items

                const fetchPage = async (page: number) => {
                    const params = {
                        page: page,
                        limit: 10, // Limit per request
                        report: "endOfShift",
                    };

                    let header: any[] = [];
                    let subHeader: any[] = [];

                    if (visibleOptions === 1) {
                        header = ["FrustrationStressImpatience"];
                        subHeader = ["FrustrationStressImpatience-directedTowards(One)"];
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

                    // console.log('response ------- ', response.data.reportFields);

                    if (response?.status === 200) {
                        const data = response?.data?.reportFields || [];
                        totalCount = response?.data?.total || 0; // Update total count if available

                        allData = [...allData, ...data];

                        // console.log('allData ---- ', data);

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

    useEffect(() => {
        if (reportFields && reportFields?.length > 0) {
            const filterFrustrationOne = reportFields?.filter(
                (item: any) =>
                    item.header === "FrustrationStressImpatience" &&
                    item.subHeader === "FrustrationStressImpatience-directedTowards(One)"
            );
            // console.log('filterFrustrationOne ---- ', filterFrustrationOne);

            setFrustrationOne(filterFrustrationOne);

            const filterFrustrationTwo = reportFields?.filter(
                (item: any) =>
                    item.header === "FrustrationStressImpatience" &&
                    item.subHeader ===
                    "FrustrationStressImpatience-directedTowards(Two-plus)"
            );
            setFrustrationTwo(filterFrustrationTwo);

            const filterShoutingOne = reportFields?.filter(
                (item: any) =>
                    item.header === "Shouting" &&
                    item.subHeader === "Shouting-directedToWards(One)"
            );
            setShoutingOne(filterShoutingOne);

            const filterShoutingTwo = reportFields?.filter(
                (item: any) =>
                    item.header === "Shouting" &&
                    item.subHeader === "Shouting-directedToWards(Two-plus)"
            );
            setShoutingTwo(filterShoutingTwo);

            const filterVerbalThreatsOne = reportFields?.filter(
                (item: any) =>
                    item.header === "VerbalThreats" &&
                    item.subHeader === "VerbalThreats-directedToWards(One)"
            );
            setVerbalThreatsOne(filterVerbalThreatsOne);

            const filterVerbalThreatsTwo = reportFields?.filter(
                (item: any) =>
                    item.header === "VerbalThreats" &&
                    item.subHeader === "VerbalThreats-directedToWards(Two-plus)"
            );
            setVerbalThreatsTwo(filterVerbalThreatsTwo);

            const filterPushingShovingOne = reportFields?.filter(
                (item: any) =>
                    item.header === "PushingShoving" &&
                    item.subHeader === "PushingShoving-directedToWards(One)"
            );
            setPushingShovingOne(filterPushingShovingOne);

            const filterPushingShovingTwo = reportFields?.filter(
                (item: any) =>
                    item.header === "PushingShoving" &&
                    item.subHeader === "PushingShoving-directedToWards(Two-plus)"
            );
            setPushingShovingTwo(filterPushingShovingTwo);

            const filterAssaultPunchKickSlapOne = reportFields?.filter(
                (item: any) =>
                    item.header === "Assault-punchKickSlap" &&
                    item.subHeader === "Assault-punchKickSlap-directedToWards(One)"
            );
            setAssaultPunchKickSlapOne(filterAssaultPunchKickSlapOne);

            const filterAssaultPunchKickSlapTwo = reportFields?.filter(
                (item: any) =>
                    item.header === "Assault-punchKickSlap" &&
                    item.subHeader === "Assault-punchKickSlap-directedToWards(Two-plus)"
            );
            setAssaultPunchKickSlapTwo(filterAssaultPunchKickSlapTwo);

            const filterAssaultWeaponInvolvedOne = reportFields?.filter(
                (item: any) =>
                    item.header === "Assault-weaponInvolved" &&
                    item.subHeader === "Assault-weaponInvolved-directedToWards(One)"
            );
            setAssaultWeaponInvolvedOne(filterAssaultWeaponInvolvedOne);

            const filterAssaultWeaponInvolvedTwo = reportFields?.filter(
                (item: any) =>
                    item.header === "Assault-weaponInvolved" &&
                    item.subHeader === "Assault-weaponInvolved-directedToWards(Two-plus)"
            );
            setAssaultWeaponInvolvedTwo(filterAssaultWeaponInvolvedTwo);

            const filterAssaultTypeOfWeaponOne = reportFields?.filter(
                (item: any) =>
                    item.header === "Assault-weaponInvolved" &&
                    item.subHeader === "TypeOfWeapon(One)"
            );
            const extendedWeaponTypesOne = [
                ...filterAssaultTypeOfWeaponOne,
                {
                    _id: "other",
                    lableValue: "Other",
                },
            ];

            setAssaultTypeOfWeaponOne(extendedWeaponTypesOne);

            const filterAssaultTypeOfWeaponTwo = reportFields?.filter(
                (item: any) =>
                    item.header === "Assault-weaponInvolved" &&
                    item.subHeader === "TypeOfWeapon(Two-plus)"
            );
            const extendedWeaponTypesTwo = [
                ...filterAssaultTypeOfWeaponTwo,
                {
                    _id: "other",
                    lableValue: "Other",
                },
            ];
            setAssaultTypeOfWeaponTwo(extendedWeaponTypesTwo);

            const filterAssaultWeaponProducedTypeOne = reportFields?.filter(
                (item: any) =>
                    item.header === "Assault-weaponInvolved" &&
                    item.subHeader === "Assault-WeaponProducedType(One)"
            );
            setAssaultWeaponProducedTypeOne(filterAssaultWeaponProducedTypeOne);

            const filterAssaultWeaponProducedTypeTwo = reportFields?.filter(
                (item: any) =>
                    item.header === "Assault-weaponInvolved" &&
                    item.subHeader === "Assault-WeaponProducedType(Two-plus)"
            );
            setAssaultWeaponProducedTypeTwo(filterAssaultWeaponProducedTypeTwo);
        }
    }, [reportFields]);

    // useEffect(() => {
    //     // Set default value for the radio buttons once the data is loaded
    //     if (assaultWeaponProducedTypeOne?.length > 0) {
    //         setValue(`assaultWeaponProducedType.${visibleOptionsAssault === 1 ? 'One' : 'Two'}`, (visibleOptionsAssault === 1 ? assaultWeaponProducedTypeOne : assaultWeaponProducedTypeTwo)?.[0]?._id || "");
    //         if (visibleOptionsAssault !== 0) {
    //             setSelectedData((prev) => ({
    //                 ...prev,
    //                 assaultWeaponProducedType: {
    //                     name: "assaultWeaponProducedType",
    //                     value: visibleOptionsAssault === 1 ? assaultWeaponProducedTypeOne[0].lableValue : visibleOptionsAssault === 2 ? assaultWeaponProducedTypeTwo[0].lableValue : ''
    //                 },
    //             }));
    //         }
    //         else {
    //             setSelectedData((prev) =>
    //                 Object.entries(prev)
    //                     .filter(([key]) => (key !== "assaultWeaponProducedType"))
    //                     .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
    //             );
    //         }
    //     }
    // }, [visibleOptionsAssault]);
    useEffect(() => {
        // if (status !== "draft") {
        if (assaultWeaponProducedTypeOne?.length > 0) {
            setValue(
                `assaultWeaponProducedType.${visibleOptionsAssault === 1 ? "One" : "Two"
                }`,
                (visibleOptionsAssault === 1
                    ? assaultWeaponProducedTypeOne
                    : assaultWeaponProducedTypeTwo)?.[0]?._id || ""
            );
            if (visibleOptionsAssault !== 0) {
                setSelectedData((prev) => ({
                    ...prev,
                    assaultWeaponProducedType: {
                        name: "assaultWeaponProducedType",
                        value:
                            visibleOptionsAssault === 1
                                ? assaultWeaponProducedTypeOne[0].lableValue
                                : visibleOptionsAssault === 2
                                    ? assaultWeaponProducedTypeTwo[0].lableValue
                                    : "",
                    },
                }));
            } else {
                setSelectedData((prev) =>
                    Object.entries(prev)
                        .filter(([key]) => key !== "assaultWeaponProducedType")
                        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
                );
            }
        }
        // }
        // Set default value for the radio buttons once the data is loaded
    }, [visibleOptionsAssault]);

    const handleButtonClick = (incidentType: any) => {
        setVisibleOptions(incidentType);

        setValue("frustrationOne", {});
        setValue("frustrationTwo", {});

        clearErrors("frustrationOne");
        clearErrors("frustrationTwo");

        // Reset selectedData properly
        setSelectedData((prev) =>
            Object.entries(prev)
                .filter(
                    ([key]) =>
                        !key.startsWith("frustrationOne") &&
                        !key.startsWith("frustrationTwo")
                )
                .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
        );

        // console.log("Updated selectedData after button click:", selectedData);
    };

    const handleButtonClickShouting = (incidentType: any) => {
        setVisibleOptionsShouting(incidentType);

        setValue("shoutingOne", {});
        setValue("shoutingTwo", {});

        clearErrors("shoutingOne");
        clearErrors("shoutingTwo");

        setSelectedData((prev) =>
            Object.entries(prev)
                .filter(
                    ([key]) =>
                        !key.startsWith("shoutingOne") && !key.startsWith("shoutingTwo")
                )
                .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
        );

        // setSelectedData((prev) =>
        //     Object.entries(prev)
        //         .filter(([key]) => key !== "shouting")
        //         .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
        // );
    };

    const handleButtonClickVerbal = (incidentType: any) => {
        setVisibleOptionsVerbal(incidentType);

        setValue("verbalThreatsOne", {});
        setValue("verbalThreatsTwo", {});

        clearErrors("verbalThreatsOne");
        clearErrors("verbalThreatsTwo");

        setSelectedData((prev) =>
            Object.entries(prev)
                .filter(([key]) => key !== "verbal")
                .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
        );
    };

    const handleButtonClickPushing = (incidentType: any) => {
        setVisibleOptionsPushing(incidentType);

        setValue("pushingShovingOne", {});
        setValue("pushingShovingTwo", {});

        clearErrors("pushingShovingOne");
        clearErrors("pushingShovingTwo");

        setSelectedData((prev) =>
            Object.entries(prev)
                .filter(([key]) => key !== "pushing")
                .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
        );
    };

    const handleButtonClickAssaultpunch = (incidentType: any) => {
        setVisibleOptionsAssaultpunch(incidentType);

        setValue("assaultPunchKickSlapOne", {});
        setValue("assaultPunchKickSlapTwo", {});

        clearErrors("assaultPunchKickSlapOne");
        clearErrors("assaultPunchKickSlapTwo");

        setSelectedData((prev) =>
            Object.entries(prev)
                .filter(([key]) => key !== "assaultPunch")
                .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
        );
    };

    const handleButtonClickAssault = (incidentType: any) => {
        // Set the visible option for the selected assault type
        setVisibleOptionsAssault(incidentType);

        // Clear "other weapon" field
        setValue("otherWeapon", "");
        setOtherWeapon(false);

        setValue("assaultWeaponInvolvedOne", {});
        setValue("assaultTypeOfWeaponOne", {});

        setValue("assaultWeaponInvolvedTwo", {});
        setValue("assaultTypeOfWeaponTwo", {});

        setValue("assaultTypeOfWeaponOne.other", false);
        setValue("assaultTypeOfWeaponTwo.other", false);

        setValue("assaultWeaponProducedType.One", null);
        setValue("assaultWeaponProducedType.Two", null);

        clearErrors(`assaultWeaponInvolvedOne`);
        clearErrors(`assaultWeaponInvolvedTwo`);

        clearErrors(`assaultTypeOfWeaponOne`);
        clearErrors(`assaultTypeOfWeaponTwo`);

        clearErrors(`assaultWeaponProducedType.One`);
        clearErrors(`assaultWeaponProducedType.Two`);

        setSelectedData((prev) =>
            Object.entries(prev)
                .filter(
                    ([key]) =>
                        key !== "assaultWeapon" &&
                        key !== "assaultTypeOfWeapon" &&
                        key !== "assaultWeaponProducedType"
                )
                .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
        );
    };

    const endOfShiftCategoryId = NEXT_PUBLIC_END_OF_SHIFT_CATEGORY_ID;

    const onSubmit = async (data: any, isDraft: any) => {
        // console.log(
        //     " -------------------- submit data -------------------- ",
        //     data
        // );
        // Manually trigger validation
        const isValid = await trigger();
        if (!isValid) {
            console.log("Validation failed");
            return;
        }

        console.log("Form is valid, proceeding...");
        //  clearErrors();
        if (data) {
            const frustrationOneSelected = Object.keys(data.frustrationOne).filter(
                (key) => data.frustrationOne[key] === true
            );
            // console.log("frustrationOneSelected ---", frustrationOneSelected);

            const frustrationTwoSelected = Object.keys(data.frustrationTwo).filter(
                (key) => data.frustrationTwo[key] === true
            );
            // console.log("frustrationTwoSelected", frustrationTwoSelected);

            const shoutingOneSelected = Object.keys(data.shoutingOne).filter(
                (key) => data.shoutingOne[key] === true
            );

            const shoutingTwoSelected = Object.keys(data.shoutingTwo).filter(
                (key) => data.shoutingTwo[key] === true
            );

            const verbalThreatsOneSelected = Object.keys(
                data.verbalThreatsOne
            ).filter((key) => data.verbalThreatsOne[key] === true);

            const verbalThreatsTwoSelected = Object.keys(
                data.verbalThreatsTwo
            ).filter((key) => data.verbalThreatsTwo[key] === true);

            const pushingShovingOneSelected = Object.keys(
                data.pushingShovingOne
            ).filter((key) => data.pushingShovingOne[key] === true);

            const pushingShovingTwoSelected = Object.keys(
                data.pushingShovingTwo
            ).filter((key) => data.pushingShovingTwo[key] === true);

            const assaultPunchKickSlapOneSelected = Object.keys(
                data.assaultPunchKickSlapOne
            ).filter((key) => data.assaultPunchKickSlapOne[key] === true);

            const assaultPunchKickSlapTwoSelected = Object.keys(
                data.assaultPunchKickSlapTwo
            ).filter((key) => data.assaultPunchKickSlapTwo[key] === true);

            const assaultWeaponInvolvedOneSelected = Object.keys(
                data.assaultWeaponInvolvedOne || {}
            ).filter((key) => data.assaultWeaponInvolvedOne[key] === true);
            // console.log(
            //     "assaultWeaponInvolvedOneSelected",
            //     assaultWeaponInvolvedOneSelected
            // );

            const assaultWeaponInvolvedTwoSelected = Object.keys(
                data.assaultWeaponInvolvedTwo || {}
            ).filter((key) => data.assaultWeaponInvolvedTwo[key] === true);
            // console.log(
            //     "assaultWeaponInvolvedTwoSelected",
            //     assaultWeaponInvolvedTwoSelected
            // );

            const assaultTypeOfWeaponOneSelected = Object.keys(
                data.assaultTypeOfWeaponOne || {}
            ).filter((key) => data.assaultTypeOfWeaponOne[key] === true);
            // console.log(
            //     "assaultTypeOfWeaponOneSelected",
            //     assaultTypeOfWeaponOneSelected
            // );

            const assaultTypeOfWeaponTwoSelected = Object.keys(
                data.assaultTypeOfWeaponTwo || {}
            ).filter((key) => data.assaultTypeOfWeaponTwo[key] === true);
            // console.log(
            //     "assaultTypeOfWeaponTwoSelected",
            //     assaultTypeOfWeaponTwoSelected
            // );

            const assaultTypeOfWeaponOne = data.assaultTypeOfWeaponOne || [];
            const assaultTypeOfWeaponTwo = data.assaultTypeOfWeaponTwo || [];

            // Extract weapon IDs from assaultTypeOfWeaponOne and assaultTypeOfWeaponTwo
            const weaponOne = Object.keys(assaultTypeOfWeaponOne).filter(
                (key) => assaultTypeOfWeaponOne[key] === true && key !== "other"
            );
            const weaponTwo = Object.keys(assaultTypeOfWeaponTwo).filter(
                (key) => assaultTypeOfWeaponTwo[key] === true && key !== "other"
            );

            const assaultWeaponProducedTypeOne =
                data.assaultWeaponProducedType?.One || {};
            const assaultWeaponProducedTypeTwo =
                data.assaultWeaponProducedType?.Two || {};

            const startTimeValidation = validateEndTime(
                shiftEndTime,
                shiftStartDateTime
            );
            if (startTimeValidation !== true) {
                setEndTimeError(startTimeValidation); // Set error message if validation fails
                return; // Stop further execution if there's an error
            }
            // Validate End Time
            const endTimeValidation = validateEndTime(
                shiftEndTime,
                shiftStartDateTime
            );
            if (endTimeValidation !== true) {
                setEndTimeError(endTimeValidation); // Set error message if validation fails
                return; // Stop further execution if there's an error
            }

            if (isDraft === false) {
                if (visibleOptions === 1 && frustrationOneSelected.length === 0) {
                    setError("frustrationOne", {
                        type: "manual",
                        message: "Please select at least one option for frustration one.",
                    });
                    return;
                } else if (
                    visibleOptions === 2 &&
                    frustrationTwoSelected.length === 0
                ) {
                    setError("frustrationTwo", {
                        type: "manual",
                        message: "Please select at least one option for frustration two.",
                    });
                    return;
                }

                if (visibleOptionsShouting === 1 && shoutingOneSelected.length === 0) {
                    setError("shoutingOne", {
                        type: "manual",
                        message: "Please select at least one option for shouting one.",
                    });
                    return;
                } else if (
                    visibleOptionsShouting === 2 &&
                    shoutingTwoSelected.length === 0
                ) {
                    setError("shoutingTwo", {
                        type: "manual",
                        message: "Please select at least one option for shouting two.",
                    });
                    return;
                }

                if (
                    visibleOptionsVerbal === 1 &&
                    verbalThreatsOneSelected.length === 0
                ) {
                    setError("verbalThreatsOne", {
                        type: "manual",
                        message:
                            "Please select at least one option for verbal threats one.",
                    });
                    return;
                } else if (
                    visibleOptionsVerbal === 2 &&
                    verbalThreatsTwoSelected.length === 0
                ) {
                    setError("verbalThreatsTwo", {
                        type: "manual",
                        message:
                            "Please select at least one option for verbal threats two.",
                    });
                    return;
                }

                if (
                    visibleOptionsPushing === 1 &&
                    pushingShovingOneSelected.length === 0
                ) {
                    setError("pushingShovingOne", {
                        type: "manual",
                        message:
                            "Please select at least one option for pushing shoving one.",
                    });
                    return;
                } else if (
                    visibleOptionsPushing === 2 &&
                    pushingShovingTwoSelected.length === 0
                ) {
                    setError("pushingShovingTwo", {
                        type: "manual",
                        message:
                            "Please select at least one option for pushing shoving two.",
                    });
                    return;
                }

                if (
                    visibleOptionsAssaultpunch === 1 &&
                    assaultPunchKickSlapOneSelected.length === 0
                ) {
                    setError("assaultPunchKickSlapOne", {
                        type: "manual",
                        message:
                            "Please select at least one option for assault punch kick slap one.",
                    });
                    return;
                } else if (
                    visibleOptionsAssaultpunch === 2 &&
                    assaultPunchKickSlapTwoSelected.length === 0
                ) {
                    setError("assaultPunchKickSlapTwo", {
                        type: "manual",
                        message:
                            "Please select at least one option for assault punch kick slap two.",
                    });
                    return;
                }

                if (
                    visibleOptionsAssault === 1 &&
                    assaultWeaponInvolvedOneSelected.length === 0
                ) {
                    setError("assaultWeaponInvolvedOne", {
                        type: "manual",
                        message:
                            "Please select at least one option for weapon involvement (One).",
                    });
                    return;
                } else if (
                    visibleOptionsAssault === 2 &&
                    assaultWeaponInvolvedTwoSelected.length === 0
                ) {
                    setError("assaultWeaponInvolvedTwo", {
                        type: "manual",
                        message:
                            "Please select at least one option for weapon involvement (Two).",
                    });
                    return;
                }

                // Error validation for Type of Weapon
                if (
                    visibleOptionsAssault === 1 &&
                    assaultTypeOfWeaponOneSelected.length === 0
                ) {
                    setError("assaultTypeOfWeaponOne", {
                        type: "manual",
                        message: "Please select at least one weapon type for (One).",
                    });
                    return;
                } else if (
                    visibleOptionsAssault === 2 &&
                    assaultTypeOfWeaponTwoSelected.length === 0
                ) {
                    setError("assaultTypeOfWeaponTwo", {
                        type: "manual",
                        message: "Please select at least one weapon type for (Two).",
                    });
                    return;
                }

                // Error validation for Weapon Produced Type
                if (visibleOptionsAssault === 1 && !assaultWeaponProducedTypeOne) {
                    setError("assaultWeaponProducedType.One", {
                        type: "manual",
                        message: "Please select a weapon produced type for (One).",
                    });
                    return;
                } else if (
                    visibleOptionsAssault === 2 &&
                    !assaultWeaponProducedTypeTwo
                ) {
                    setError("assaultWeaponProducedType.Two", {
                        type: "manual",
                        message: "Please select a weapon produced type for (Two).",
                    });
                    return;
                }
            }

            const formattedShiftStartDateTime = moment(
                `${shiftDate} ${shiftStartDateTime}`,
                "DD/MM/YYYY h:mm A"
            ).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

            const formattedShiftEndDateTime = moment(
                `${shiftDate} ${shiftEndTime}`,
                "DD/MM/YYYY h:mm A"
            ).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

            const formattedReportedAt = moment(
                `${reportedDate} ${reportedTime}`,
                "DD/MM/YYYY h:mm A"
            ).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

            let finalOutcome;
            if (selectedData) {
                const outcomeTexts = [];

                // Handle Frustration
                const frustrationValues = selectedData.frustration || [];
                const frustrationCount =
                    visibleOptions === 1 ? 1 : visibleOptions >= 2 ? "2+" : 0;
                if (frustrationCount === 0) {
                    // outcomeTexts.push("Frustration / stress / impatience : 0");
                } else {
                    const frustrationDirectedTowards = frustrationValues.join(", ");
                    const value =
                        frustrationDirectedTowards &&
                        `\nDirected towards: ${frustrationDirectedTowards}`;

                    outcomeTexts.push(
                        `Frustration / stress / impatience : ${frustrationCount} ${value}`
                    );
                    // console.log("frustrationCount --- ", value);
                }

                // Handle Shouting
                const shoutingValues = selectedData.shouting || [];
                const shoutingCount =
                    visibleOptionsShouting === 1
                        ? 1
                        : visibleOptionsShouting >= 2
                            ? "2+"
                            : 0;
                if (shoutingCount === 0) {
                    // outcomeTexts.push("Shouting : 0");
                } else {
                    const shoutingDirectedTowards = shoutingValues.join(", ");
                    const value =
                        shoutingDirectedTowards &&
                        `\nDirected towards: ${shoutingDirectedTowards}`;
                    outcomeTexts.push(`Shouting : ${shoutingCount} ${value}`);
                }

                // Handle verbal
                const verbalValues = selectedData.verbal || [];
                const verbalCount =
                    visibleOptionsVerbal === 1 ? 1 : visibleOptionsVerbal >= 2 ? "2+" : 0;
                if (verbalCount === 0) {
                    // outcomeTexts.push("Verbal threats : 0");
                } else {
                    const verbalDirectedTowards = verbalValues.join(", ");
                    const value =
                        verbalDirectedTowards &&
                        `\nDirected towards: ${verbalDirectedTowards}`;
                    outcomeTexts.push(`Verbal threats : ${verbalCount} ${value}`);
                }

                // Handle Pushing
                const pushingValues = selectedData.pushing || [];
                const pushingCount =
                    visibleOptionsPushing === 1
                        ? 1
                        : visibleOptionsPushing >= 2
                            ? "2+"
                            : 0;
                if (pushingCount === 0) {
                    // outcomeTexts.push("Pushing / shoving : 0");
                } else {
                    const pushingDirectedTowards = pushingValues.join(", ");
                    const value =
                        pushingDirectedTowards &&
                        `\nDirected towards: ${pushingDirectedTowards}`;
                    outcomeTexts.push(`Pushing / shoving : ${pushingCount} ${value}`);
                }

                // Handle assaultPunch
                const assaultPunchValues = selectedData.assaultPunch || [];
                const assaultPunchCount =
                    visibleOptionsAssaultpunch === 1
                        ? 1
                        : visibleOptionsAssaultpunch >= 2
                            ? "2+"
                            : 0;
                if (assaultPunchCount === 0) {
                    // outcomeTexts.push("Assault - punch / kick / slap : 0");
                } else {
                    const assaultPunchDirectedTowards = assaultPunchValues.join(", ");
                    const value =
                        assaultPunchDirectedTowards &&
                        `\nDirected towards: ${assaultPunchDirectedTowards}`;
                    outcomeTexts.push(
                        `Assault - punch / kick / slap : ${assaultPunchCount} ${value}`
                    );
                }

                // Handle assaultWeapon
                const assaultWeaponValues = selectedData.assaultWeapon || [];
                const assaultTypeOfWeaponValues =
                    selectedData.assaultTypeOfWeapon || [];

                const otherWeapon = data.otherWeapon || "";
                const updatedAssaultTypeOfWeaponValues = assaultTypeOfWeaponValues.map(
                    (type) => (type === "Other" && otherWeapon ? otherWeapon : type)
                );

                const assaultWeaponProducedTypeValues =
                    selectedData.assaultWeaponProducedType?.value || null;

                // console.log(
                //     "assaultWeaponProducedTypeValues",
                //     assaultWeaponProducedTypeValues
                // );

                const assaultWeaponCount =
                    visibleOptionsAssault === 1
                        ? 1
                        : visibleOptionsAssault >= 2
                            ? "2+"
                            : 0;
                if (assaultWeaponCount === 0) {
                    // outcomeTexts.push("Assault - weapon involved : 0");
                } else {
                    const assaultWeaponDirectedTowards = assaultWeaponValues.join(", ");
                    const assautTypeOfWeapon =
                        updatedAssaultTypeOfWeaponValues.join(", ");
                    const value = `${assaultWeaponDirectedTowards &&
                        `\nDirected towards: ${assaultWeaponDirectedTowards}`
                        } ${assautTypeOfWeapon && `\nType of Weapon: ${assautTypeOfWeapon}`
                        } ${assaultWeaponProducedTypeValues &&
                        `\nAssault - Weapon Produced Type: ${assaultWeaponProducedTypeValues}`
                        }`;
                    outcomeTexts.push(
                        `Assault - weapon involved : ${assaultWeaponCount} ${value}`
                    );
                }

                finalOutcome = outcomeTexts.join("\n\n");
            }

            const shiftDataTime = `Shift Date & Time: ${shiftDate}, ${shiftStartDateTime} - ${shiftEndTime}`;

            const incidentDetails = summaryOfIncident && `\n\n${summaryOfIncident}`;
            const formattedDiscription = `${shiftDataTime} ${incidentDetails}`;

            const userId = await AsyncStorage.getItem("userId");
            setIsLoading(true);
            const bodyData = {
                site: shift.siteId?._id,
                shiftCategory: endOfShiftCategoryId,
                severityLevel: "High Priority",
                users: userId || "",
                reportedAt: formattedReportedAt,
                outCome: finalOutcome,
                description: formattedDiscription,
                draft: isDraft,

                shiftStartDateTime: formattedShiftStartDateTime,
                shiftEndDateTime: formattedShiftEndDateTime,

                frustrationStressImpatience: {
                    zero: visibleOptions === 0 || false,
                    one: visibleOptions === 1 || false,
                    oneIncidents: {
                        directedToWards: frustrationOneSelected,
                    },
                    twoPlus: visibleOptions === 2 || false,
                    twoPlusIncidents: {
                        directedToWards: frustrationTwoSelected,
                    },
                },
                shouting: {
                    zero: visibleOptionsShouting === 0 || false,
                    one: visibleOptionsShouting === 1 || false,
                    oneIncidents: {
                        directedToWards: shoutingOneSelected,
                    },
                    twoPlus: visibleOptionsShouting === 2 || false,
                    twoPlusIncidents: {
                        directedToWards: shoutingTwoSelected,
                    },
                },
                verbalThreats: {
                    zero: visibleOptionsVerbal === 0 || false,
                    one: visibleOptionsVerbal === 1 || false,
                    oneIncidents: {
                        directedToWards: verbalThreatsOneSelected,
                    },
                    twoPlus: visibleOptionsVerbal === 2 || false,
                    twoPlusIncidents: {
                        directedToWards: verbalThreatsTwoSelected,
                    },
                },
                pushingShoving: {
                    zero: visibleOptionsPushing === 0 || false,
                    one: visibleOptionsPushing === 1 || false,
                    oneIncidents: {
                        directedToWards: pushingShovingOneSelected,
                    },
                    twoPlus: visibleOptionsPushing === 2 || false,
                    twoPlusIncidents: {
                        directedToWards: pushingShovingTwoSelected,
                    },
                },
                assaultPunchKickSlap: {
                    zero: visibleOptionsAssaultpunch === 0 || false,
                    one: visibleOptionsAssaultpunch === 1 || false,
                    oneIncidents: {
                        directedToWards: assaultPunchKickSlapOneSelected,
                    },
                    twoPlus: visibleOptionsAssaultpunch === 2 || false,
                    twoPlusIncidents: {
                        directedToWards: assaultPunchKickSlapTwoSelected,
                    },
                },
                assaultWeaponInvolved: {
                    zero: visibleOptionsAssault === 0 || false,
                    one: visibleOptionsAssault === 1 || false,
                    oneIncidents: {
                        directedToWards:
                            visibleOptionsAssault === 1
                                ? assaultWeaponInvolvedOneSelected
                                : [],
                        typeOfWeapon: {
                            weapon: weaponOne,
                            ...(visibleOptionsAssault === 1 &&
                                (otherWeapon || assaultTypeOfWeaponOne?.other === true) && {
                                otherWeapon: data.otherWeapon || "",
                            }), // Include the value for otherWeapon
                        },
                        ...(assaultWeaponProducedTypeOne !== null &&
                            visibleOptionsAssault === 1 && {
                            weaponProducedType: assaultWeaponProducedTypeOne,
                        }),
                    },
                    twoPlus: visibleOptionsAssault === 2 || false,
                    twoPlusIncidents: {
                        directedToWards:
                            visibleOptionsAssault === 2
                                ? assaultWeaponInvolvedTwoSelected
                                : [],
                        typeOfWeapon: {
                            weapon: weaponTwo,
                            ...(visibleOptionsAssault === 2 &&
                                (otherWeapon || assaultTypeOfWeaponTwo?.other === true) && {
                                otherWeapon: data.otherWeapon || "",
                            }), // Include the value for otherWeapon
                        },
                        ...(assaultWeaponProducedTypeTwo !== null &&
                            visibleOptionsAssault === 2 && {
                            weaponProducedType: assaultWeaponProducedTypeTwo,
                        }),
                    },
                },
                summaryOfIncident: summaryOfIncident || "",
            };

            // Loop through "directedToWards" inside "oneIncidents"

            // console.log("bodyData", bodyData);
            const apiUrl =
                status === "draft"
                    ? `${SERVER_URL_ROASTERING}/update/user/end/of/shift/report/${id}`
                    : `${SERVER_URL_ROASTERING}/create/user/end/of/shift/report`;
            const response = await axios({
                method: status === "draft" ? "PUT" : "POST",
                url: apiUrl,
                data: bodyData,
                // headers: {
                //   "Content-Type": "multipart/form-data",
                // },
                withCredentials: true,
            });
            // console.log("response", response?.data);

            if (response && response?.data?.success === true) {
                // toast.success(response.message);
                setIsLoading(false);
                setReportDetails(response?.data?.reportDetails);
                setVisibleOptions(0);
                setVisibleOptionsShouting(0);
                setVisibleOptionsVerbal(0);
                setVisibleOptionsPushing(0);
                setVisibleOptionsAssaultpunch(0);
                setVisibleOptionsAssault(0);

                setError("");
                reset();

                setValue("reportedDate", dayjs());
                setValue("shiftDate", dayjs());
                setValue("shiftStartDateTime", dayjs());
                setValue("shiftEndDateTime", dayjs());

                if (isDraft === true) {
                    navigation.navigate("UserHome");
                } else {
                    openModal();
                }
            } else {
                setIsLoading(false);
                Toast.show("something went wrong", Toast.SHORT);
            }
        }
    };
    const handleSummaryofIncidentChange = (text: any) => {
        setSummaryOfIncident(text);
    };

    // const handleCheckboxChange = (fieldKey: string, itemId: string, isChecked: boolean) => {
    //     setSelectedData((prev) => {
    //         const newData = { ...prev };

    //         // If selecting a frustrationOne checkbox, clear frustrationTwo
    //         if (fieldKey.startsWith("frustrationOne")) {
    //             delete newData.frustrationTwo;
    //         }
    //         // If selecting a frustrationTwo checkbox, clear frustrationOne
    //         else if (fieldKey.startsWith("frustrationTwo")) {
    //             delete newData.frustrationOne;
    //         } else if (fieldKey.startsWith("shoutingOne")) {
    //             delete newData.shoutingTwo;
    //         } else if (fieldKey.startsWith("shoutingTwo")) {
    //             delete newData.shoutingOne;
    //         }

    //         if (isChecked) {
    //             newData[fieldKey] = { ...newData[fieldKey], [itemId]: true };
    //             console.log('newData -------', newData);

    //         } else {
    //             delete newData[fieldKey][itemId];

    //             if (Object.keys(newData[fieldKey]).length === 0) {
    //                 delete newData[fieldKey];
    //             }
    //         }

    //         return newData;
    //     });

    //     console.log("Updated selectedData after checkbox change:", selectedData);
    // };

    const CustomCheckbox = ({ checked, onPress }) => {
        return (
            <TouchableOpacity onPress={onPress} style={styles.customCheckbox}>
                {checked ? (
                    <MaterialIcons name="check-box" size={24} color="#BC131F" />
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

    const [selectedOption, setSelectedOption] = useState(null);

    const handleSelect = (option) => {
        setSelectedOption(option);
    };

    const CustomRadioButton = ({ selected, onPress }) => {
        return (
            <TouchableOpacity onPress={onPress} style={{ marginRight: 10 }}>
                {selected ? (
                    <MaterialIcons
                        name="radio-button-checked"
                        size={24}
                        color="#BC131F"
                    />
                ) : (
                    <MaterialIcons
                        name="radio-button-unchecked"
                        size={24}
                        color="#726f7b"
                    />
                )}
            </TouchableOpacity>
        );
    };

    const handleCheckboxChange = (
        fieldName: string,
        labelValue: string,
        isChecked: boolean
    ) => {
        setSelectedData((prev: any) => {
            const updatedField = prev[fieldName] || [];

            // If checked, add value; if unchecked, remove value
            const newState = isChecked
                ? { ...prev, [fieldName]: [...updatedField, labelValue] } // Add item
                : {
                    ...prev,
                    [fieldName]: updatedField.filter(
                        (item: any) => item !== labelValue
                    ), // Remove item
                };

            // If the array becomes empty after removal, delete the field completely
            if (!newState[fieldName].length) {
                delete newState[fieldName];
            }

            // console.log("Checkbox Updated State:", newState);
            return { ...newState }; // Ensure React detects state change
        });
    };

    const validateEndTime = (value, startTime) => {
        if (!value) return "Time is required";
        // Directly compare the time strings without parsing them into dayjs objects
        // console.log(value); // Debugging
        // console.log(startTime); // Debugging
        // Check if the time strings are in the correct format (optional, but good practice)
        const timePattern = /^(1[0-2]|0?[1-9]):([0-5]?[0-9])\s([APap][Mm])$/;
        if (!timePattern.test(value)) return "Invalid Time format";
        if (!timePattern.test(startTime)) return "Invalid Start Time format";
        // Show error if both times are the same
        if (value === startTime) {
            return "End time cannot be the same as start time";
        }
        // Show error if end time is before start time
        const [endHours, endMinutes, endPeriod] = value.split(/[:\s]/);
        const [startHours, startMinutes, startPeriod] = startTime.split(/[:\s]/);
        // Convert to 24-hour format for comparison
        const endTimeInMinutes =
            ((parseInt(endHours) % 12) +
                (endPeriod.toUpperCase() === "PM" ? 12 : 0)) *
            60 +
            parseInt(endMinutes);
        const startTimeInMinutes =
            ((parseInt(startHours) % 12) +
                (startPeriod.toUpperCase() === "PM" ? 12 : 0)) *
            60 +
            parseInt(startMinutes);
        console.log(endTimeInMinutes < startTimeInMinutes);
        if (endTimeInMinutes < startTimeInMinutes)
            return "End time cannot be before start time";
        // Show error if shift is less than 1 minute
        if (endTimeInMinutes - startTimeInMinutes < 1)
            return "Shift must be at least 1 minute long";
        return true; // Valid time
    };

    const openModal = () => setModalVisible(true);
    const closeModal = () => {
        setModalVisible(false);
        navigation.navigate('UserHome' as never);
    };

    const onChangeDate = (event, selectedDate) => {
        if (Platform.OS === "android") {
            if (event.type === "set") {
                const currentDate = selectedDate;
                setShowDatePicker(false);
                setReportedDate(dayjs(currentDate).format("DD/MM/YYYY"));
            } else {
                setShowDatePicker(false);
            }
        }
    };

    const onIosChangeDate = (selectedDate: any) => {
        if (selectedDate) {
            setReportedDate(dayjs(selectedDate).format("DD/MM/YYYY"));
        }
        setShowDatePicker(false);
    };

    const onChangeShiftDate = (event, selectedDate) => {
        if (Platform.OS === "android") {
            if (event.type === "set") {
                const currentDate = selectedDate;
                setShowTimePickerShiftDate(false);
                setShiftDate(dayjs(currentDate).format("DD/MM/YYYY"));
            } else {
                setShowTimePickerShiftDate(false);
            }
        }
    };

    const onIosChangeShiftDate = (selectedDate) => {
        if (selectedDate) {
            setShiftDate(dayjs(selectedDate).format("DD/MM/YYYY"));
        }
        setShowTimePickerShiftDate(false);
    };

    const onChangeTime = (event, selectedTime) => {
        if (Platform.OS === "android") {
            if (event.type === "set") {
                const currentTime = selectedTime;
                setShowTimePickerReported(false);
                setReportedTime(dayjs(currentTime).format("h:mm A"));
            } else {
                setShowTimePickerReported(false);
            }
        }
    };

    const onIosChangeTime = (selectedTime) => {
        if (selectedTime) {
            setReportedTime(dayjs(selectedTime).format("h:mm A"));
        }
        setShowTimePickerReported(false);
    };

    //   const onChangeShiftStartTime = (event, selectedShiftStartDateTime) => {
    //     if (Platform.OS === "android") {
    //       if (event.type === "set") {
    //         const currentTime = selectedShiftStartDateTime;
    //         setShowTimePickerShiftStart(false);
    //         sethiftStartDateTime(dayjs(currentTime).format("h:mm A"));
    //       } else {
    //         setShowTimePickerShiftStart(false);
    //       }
    //     }
    //   };

    const onChangeShiftStartTime = (
        event: any,
        selectedShiftStartDateTime: any
    ) => {
        if (Platform.OS === "android" || Platform.OS === "ios") {
            if (event.type === "set") {
                const formattedTime = dayjs(selectedShiftStartDateTime).format(
                    "h:mm A"
                );
                sethiftStartDateTime(formattedTime);
                setShowTimePickerShiftStart(false);
                setStartTimeError(""); // Clear previous error

                // Revalidate End Time after Start Time change
                if (shiftEndTime) {
                    const endTimeValidation = validateEndTime(
                        shiftEndTime,
                        formattedTime
                    );
                    setEndTimeError(endTimeValidation === true ? "" : endTimeValidation); // Update error state
                }
            } else {
                setShowTimePickerShiftStart(false);
            }
        }
    };

    //   const onChangeShiftStartTime = (event, selectedShiftStartDateTime) => {
    //     if (Platform.OS === "android") {
    //       if (event.type === "set") {
    //         const formattedTime = dayjs(selectedShiftStartDateTime).format(
    //           "h:mm A"
    //         );
    //         sethiftStartDateTime(formattedTime);
    //         setShowTimePickerShiftStart(false);
    //         setStartTimeError(""); // Clear previous error
    //         // Revalidate End Time after Start Time change
    //         if (shiftEndTime) {
    //           const endTimeValidation = validateEndTime(
    //             shiftEndTime,
    //             formattedTime
    //           );
    //           setEndTimeError(endTimeValidation === true ? "" : endTimeValidation); // Update error state
    //         }
    //       } else {
    //         setShowTimePickerShiftStart(false);
    //       }
    //     }
    //   };

    const onIosChangeShiftStartTime = (selectedShiftStartDateTime: any) => {
        if (selectedShiftStartDateTime) {
            const formattedTime = dayjs(selectedShiftStartDateTime).format("h:mm A");
            sethiftStartDateTime(formattedTime);
            setStartTimeError(""); // Clear previous error
            setShowTimePickerShiftStart(false);

            // Revalidate End Time after Start Time change
            if (shiftEndTime) {
                const endTimeValidation = validateEndTime(shiftEndTime, formattedTime);
                setEndTimeError(endTimeValidation === true ? "" : endTimeValidation); // Update error state
            }
        }
        setShowTimePickerShiftStart(false);
    };

    //   const onChangeShiftEndTime = (event, selectedShiftEndTime) => {
    //     if (Platform.OS === "android") {
    //       if (event.type === "set") {
    //         const currentTime = selectedShiftEndTime;
    //         setShowTimePickerShiftEnd(false);
    //         setShiftEndTime(dayjs(currentTime).format("h:mm A"));
    //       } else {
    //         setShowTimePickerShiftEnd(false);
    //       }
    //     }
    //   };

    const onChangeShiftEndTime = (event: any, selectedShiftEndTime: any) => {
        if (Platform.OS === "android") {
            if (event.type === "set") {
                const formattedTime = dayjs(selectedShiftEndTime).format("h:mm A");
                setShiftEndTime(formattedTime);
                setShowTimePickerShiftEnd(false);
                setEndTimeError(""); // Clear previous error
                // Revalidate End Time after changing End Time
                if (shiftStartDateTime) {
                    const endTimeValidation = validateEndTime(
                        formattedTime,
                        shiftStartDateTime
                    );
                    setEndTimeError(endTimeValidation === true ? "" : endTimeValidation); // Update error state
                }
            } else {
                setShowTimePickerShiftEnd(false);
            }
        } else if (Platform.OS === "ios") {
            // For iOS, we directly handle the selected time in the onConfirm callback
            const formattedTime = dayjs(selectedShiftEndTime).format("h:mm A");
            setShiftEndTime(formattedTime);
            setShowTimePickerShiftEnd(false);
            setEndTimeError(""); // Clear previous error

            // Revalidate End Time after changing End Time
            if (shiftStartDateTime) {
                const endTimeValidation = validateEndTime(
                    formattedTime,
                    shiftStartDateTime
                );
                setEndTimeError(endTimeValidation === true ? "" : endTimeValidation); // Update error state
            }
        }
    };

    // const onChangeShiftEndTime = (event, selectedShiftEndTime) => {
    //     if (Platform.OS === "android") {
    //         if (event.type === "set") {
    //             const formattedTime = dayjs(selectedShiftEndTime).format("h:mm A");
    //             setShiftEndTime(formattedTime);
    //             setShowTimePickerShiftEnd(false);
    //             setEndTimeError(""); // Clear previous error
    //             // Revalidate End Time after changing End Time
    //             if (shiftStartDateTime) {
    //                 const endTimeValidation = validateEndTime(formattedTime, shiftStartDateTime);
    //                 setEndTimeError(endTimeValidation === true ? "" : endTimeValidation); // Update error state
    //             }
    //         } else {
    //             setShowTimePickerShiftEnd(false);
    //         }
    //     }
    // };

    const onIosChangeShiftEndTime = (selectedShiftEndTime: any) => {
        if (selectedShiftEndTime) {
            const formattedTime = dayjs(selectedShiftEndTime).format("h:mm A");
            setShiftEndTime(formattedTime);
            setShowTimePickerShiftEnd(false);
            setEndTimeError(""); // Clear previous error
            // Revalidate End Time after changing End Time
            if (shiftStartDateTime) {
                const endTimeValidation = validateEndTime(
                    formattedTime,
                    shiftStartDateTime
                );
                setEndTimeError(endTimeValidation === true ? "" : endTimeValidation);
            }
            setShowTimePickerShiftEnd(false);
        }
    };

    // console.log('shift start time && shift end time ---- ', shiftStartTime, shiftEndTime);

    const showIOSDatePicker = () => {
        setIOSDatePickerVisible(true);
    };
    const hideIOSDatePicker = () => setIOSDatePickerVisible(false);

    const showIOSTimePicker = () => setIOSTimePickerVisible(true);
    const hideIOSTimePicker = () => setIOSTimePickerVisible(false);

    const handleIOSDateConfirm = (selectedDate: Date) => {
        hideIOSDatePicker();
        const currentDate = selectedDate || date;
        setDate(currentDate);
        setReportedDate(dayjs(currentDate).format("DD/MM/YYYY"));
    };

    const handleIOSTimeConfirm = (selectedTime: Date) => {
        hideIOSTimePicker();
        const currentTime = selectedTime;
        setReportedTime(dayjs(currentTime).format("h:mm A"));
    };

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

    return (
        <BottomSheetModalProvider>
            <SafeAreaView style={styles.container}>
                <ScrollView
                    contentContainerStyle={styles.scrollViewContent}
                    onScrollBeginDrag={Keyboard.dismiss}
                >
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
                        </View>
                        <View style={globalStyles.whiteBox}>
                            <View style={styles.textContainer}>
                                <View style={styles.titleContainer}>
                                    <CustomText style={styles.titleText}>
                                        Atmospherics Report
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
                                        style={[
                                            styles.row,
                                            { justifyContent: "space-between", marginBottom: 8 },
                                        ]}
                                    >
                                        <View style={{ width: "49%" }}>
                                            <Text style={{ fontSize: 14, color: '#000' }}>
                                                Reported Date <Text style={{ color: "red" }}>*</Text>
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    Platform.OS === "ios"
                                                        ? setShowDatePicker(true)
                                                        : setShowDatePicker(true);
                                                }}
                                            >
                                                <View pointerEvents="none">
                                                    <TextInput
                                                        mode="outlined"
                                                        outlineColor={reportedDate ? "#2E9E4A" : "#BFBBBB"}
                                                        style={{ height: 40 }}
                                                        placeholder="DD/MM/YYYY"
                                                        placeholderTextColor="#000"
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
                                        <View style={{ width: "49%" }}>
                                            <Text style={{ fontSize: 14, color: '#000' }}>
                                                Reported Time <Text style={{ color: "red" }}>*</Text>
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    Platform.OS === "ios"
                                                        ? setShowTimePickerReported(true)
                                                        : setShowTimePickerReported(true);
                                                }}
                                            >
                                                <View pointerEvents="none">
                                                    <TextInput
                                                        mode="outlined"
                                                        outlineColor={reportedTime ? "#2E9E4A" : "#BFBBBB"}
                                                        style={{ height: 40 }}
                                                        placeholder="HH:MM AM/PM"
                                                        placeholderTextColor="#000"
                                                        value={reportedTime}
                                                        editable={false}
                                                        error={timeError}
                                                    />
                                                </View>
                                            </TouchableOpacity>
                                            {timeError && (
                                                <HelperText type="error" visible={timeError}>
                                                    Reported Time is required.
                                                </HelperText>
                                            )}
                                        </View>
                                    </View>

                                    <View
                                        style={[
                                            styles.row,
                                            {
                                                justifyContent: "space-between",
                                                marginTop: 8,
                                                marginBottom: 10,
                                            },
                                        ]}
                                    >
                                        <View style={{ width: "49%" }}>
                                            <Text style={{ fontSize: 14, color: '#000' }}>
                                                Actual Shift Start Time{" "}
                                                <Text style={{ color: "red" }}>*</Text>
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    Platform.OS === "ios"
                                                        ? setShowTimePickerShiftStart(true)
                                                        : setShowTimePickerShiftStart(true);
                                                }}
                                            >
                                                <View pointerEvents="none">
                                                    <TextInput
                                                        mode="outlined"
                                                        outlineColor={
                                                            shiftStartDateTime ? "#2E9E4A" : "#BFBBBB"
                                                        }
                                                        style={{ height: 40 }}
                                                        placeholder="HH:MM AM/PM"
                                                        placeholderTextColor="#000"
                                                        value={shiftStartDateTime}
                                                        editable={false}
                                                        error={timeError}
                                                    />
                                                </View>
                                            </TouchableOpacity>
                                            {startTimeError ? (
                                                <HelperText type="error">{startTimeError}</HelperText>
                                            ) : null}
                                        </View>

                                        {/* Time Input */}
                                        <View style={{ width: "49%" }}>
                                            <Text style={{ fontSize: 14, color: '#000' }}>
                                                Actual Shift End Time{" "}
                                                <Text style={{ color: "red" }}>*</Text>
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    Platform.OS === "ios"
                                                        ? setShowTimePickerShiftEnd(true)
                                                        : setShowTimePickerShiftEnd(true);
                                                }}
                                            >
                                                <View pointerEvents="none">
                                                    <TextInput
                                                        mode="outlined"
                                                        outlineColor={shiftEndTime ? "#2E9E4A" : "#BFBBBB"}
                                                        style={{ height: 40 }}
                                                        placeholder="HH:MM AM/PM"
                                                        placeholderTextColor="#000"
                                                        value={shiftEndTime}
                                                        editable={false}
                                                        error={timeError}
                                                    />
                                                </View>
                                            </TouchableOpacity>
                                            {endTimeError ? (
                                                <HelperText type="error">{endTimeError}</HelperText>
                                            ) : null}
                                        </View>
                                        {/* Android DateTimePicker */}
                                        {Platform.OS === "android" && showDatePicker && (
                                            <DateTimePicker
                                                value={date}
                                                mode="date"
                                                display="spinner"
                                                onChange={onChangeDate}
                                                themeVariant="dark"
                                            />
                                        )}
                                        {Platform.OS === "android" && showTimePickerShiftDate && (
                                            <DateTimePicker
                                                value={date}
                                                mode="date"
                                                display="spinner"
                                                onChange={onChangeShiftDate}
                                                themeVariant="dark"
                                            />
                                        )}
                                        {Platform.OS === "android" && showTimePickerReported && (
                                            <DateTimePicker
                                                value={date}
                                                mode="time"
                                                display="spinner"
                                                onChange={onChangeTime}
                                                themeVariant="dark"
                                            />
                                        )}

                                        {Platform.OS === "android" && showTimePickerShiftStart && (
                                            <DateTimePicker
                                                value={date}
                                                mode="time"
                                                display="spinner"
                                                onChange={onChangeShiftStartTime}
                                                themeVariant="dark"
                                            />
                                        )}

                                        {Platform.OS === "android" && showTimePickerShiftEnd && (
                                            <DateTimePicker
                                                value={date}
                                                mode="time"
                                                display="spinner"
                                                onChange={onChangeShiftEndTime}
                                                themeVariant="dark"
                                            />
                                        )}

                                        {/* iOS Modal DateTimePicker */}
                                        {Platform.OS === "ios" && (
                                            <>
                                                {/* Date Picker */}
                                                {/* <ModalDateTimePicker
                          isVisible={showDatePicker}
                          display="spinner"
                          mode="date"
                          onConfirm={onChangeDate}
                          onCancel={() => setShowDatePicker(false)}
                        /> */}
                                                <ModalDateTimePicker
                                                    isVisible={showDatePicker}
                                                    display="spinner"
                                                    mode="date"
                                                    onConfirm={onIosChangeDate} // Works for both iOS & Android
                                                    onCancel={() => setShowDatePicker(false)} // Closes picker on cancel
                                                />

                                                {/* <ModalDateTimePicker
                          isVisible={showTimePickerShiftDate}
                          display="spinner"
                          mode="date"
                          onConfirm={onChangeShiftDate}
                          onCancel={() => setShowTimePickerShiftDate(false)}
                        /> */}

                                                <ModalDateTimePicker
                                                    isVisible={showTimePickerShiftDate}
                                                    display="spinner"
                                                    mode="date"
                                                    onConfirm={onIosChangeShiftDate} // Works for both iOS & Android
                                                    onCancel={() => setShowTimePickerShiftDate(false)} // Closes picker on cancel
                                                />

                                                {/* Time Pickers */}
                                                {/* <ModalDateTimePicker
                          isVisible={showTimePickerReported}
                          date={date}
                          display="spinner"
                          mode="time"
                          onConfirm={onChangeTime}
                          onCancel={() => setShowTimePickerReported(false)}
                        /> */}
                                                <ModalDateTimePicker
                                                    isVisible={showTimePickerReported}
                                                    date={date}
                                                    display="spinner"
                                                    mode="time"
                                                    onConfirm={onIosChangeTime} // Works for both iOS & Android
                                                    onCancel={() => setShowTimePickerReported(false)} // Closes picker on cancel
                                                />

                                                <ModalDateTimePicker
                                                    isVisible={showTimePickerShiftStart}
                                                    date={date}
                                                    display="spinner"
                                                    mode="time"
                                                    onConfirm={onIosChangeShiftStartTime} // Calls the function when time is selected
                                                    onCancel={() => setShowTimePickerShiftStart(false)} // Hides the picker on cancel
                                                />

                                                <ModalDateTimePicker
                                                    isVisible={showTimePickerShiftEnd}
                                                    date={date}
                                                    display="spinner"
                                                    mode="time"
                                                    onConfirm={onIosChangeShiftEndTime} // Works for both iOS & Android
                                                    onCancel={() => setShowTimePickerShiftEnd(false)} // Closes picker on cancel
                                                />
                                            </>
                                        )}
                                    </View>

                                    <View
                                        style={[
                                            styles.row,
                                            { justifyContent: "space-between", marginVertical: 8 },
                                        ]}
                                    >
                                        <View style={{ width: "49%" }}>
                                            <Text style={{ fontSize: 14, color: '#000' }}>
                                                Shift Date <Text style={{ color: "red" }}>*</Text>
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    Platform.OS === "ios"
                                                        ? setShowTimePickerShiftDate(true)
                                                        : setShowTimePickerShiftDate(true);
                                                }}
                                            >
                                                <View pointerEvents="none">
                                                    <TextInput
                                                        mode="outlined"
                                                        outlineColor={shiftDate ? "#2E9E4A" : "#BFBBBB"}
                                                        style={{ height: 40 }}
                                                        placeholder="DD/MM/YYYY"
                                                        placeholderTextColor="#000"
                                                        value={shiftDate}
                                                        editable={false}
                                                        error={dateError}
                                                    />
                                                </View>
                                            </TouchableOpacity>
                                            {dateError && (
                                                <HelperText type="error" visible={dateError}>
                                                    Shift Date is required.
                                                </HelperText>
                                            )}
                                        </View>

                                        {/* <View style={{ width: "49%" }}>
                                            <Text style={{ fontSize: 14, color: '#000' }}>
                                                Site Name <Text style={{ color: "red" }}>*</Text>
                                            </Text>
                                            <TextInput
                                                mode="outlined"
                                                outlineColor={siteName ? "#2E9E4A" : "#BFBBBB"}
                                                activeOutlineColor={"#2E9E4A"}
                                                placeholder="Site Name"
                                                style={{ height: 40 }}
                                                placeholderTextColor="#BFBBBB"
                                                value={siteName} // This value will be bound to the state for site name
                                                onChangeText={(value) => setSiteName(value)} // Update the state when the user types
                                                disabled
                                            />
                                            {siteName === "" && (
                                                <HelperText type="error" visible={siteName === ""}>
                                                    Site Name is required.
                                                </HelperText>
                                            )}
                                        </View> */}
                                    </View>
                                    <View style={styles.mainFormContainer}>
                                        <Text style={styles.subTitleText}>
                                            Please provide an overview of the site atmosphere and
                                            incident levels during your shift.
                                        </Text>

                                        {/* Frustration / Stress / Impatience */}
                                        <View style={styles.sectionTitleContainer}>
                                            <MaterialCommunityIcons
                                                name="arrow-right-thin"
                                                size={24}
                                                color="#000"
                                                style={globalStyles.menuIcon}
                                            />
                                            <Text style={styles.sectionTitle}>
                                                Frustration / Stress / Impatience
                                            </Text>
                                        </View>
                                        <View style={styles.buttonGroup}>
                                            {buttonOptions.map(({ id, label, color, buttonText }) => (
                                                <View key={id} style={styles.buttonContainer}>
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.squareButton,
                                                            {
                                                                borderColor:
                                                                    visibleOptions === id
                                                                        ? buttonColors[color]
                                                                        : `${buttonColors[color]}80`,
                                                                backgroundColor:
                                                                    visibleOptions === id
                                                                        ? buttonColors[color]
                                                                        : "transparent",
                                                            },
                                                        ]}
                                                        onPress={() => handleButtonClick(id)}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.buttonText,
                                                                {
                                                                    color:
                                                                        visibleOptions === id
                                                                            ? "#fff"
                                                                            : buttonColors[color],
                                                                },
                                                            ]}
                                                        >
                                                            {buttonText || id}
                                                        </Text>
                                                    </TouchableOpacity>
                                                    <Text style={styles.labelText}>
                                                        {label.split(" ")[0]} {"\n"} {label.split(" ")[1]}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>

                                        {visibleOptions !== 0 && (
                                            <View style={styles.checkboxContainer}>
                                                <Text style={styles.checkboxTitle}>
                                                    Frustration / stress / impatience - directed towards:
                                                    <Text style={styles.required}> *</Text>
                                                </Text>

                                                {visibleOptions === 1 ? (
                                                    <>
                                                        {frustrationOne.map((option) => (
                                                            <Controller
                                                                key={option._id}
                                                                name={`frustrationOne.${option._id}`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <View style={styles.checkboxRow}>
                                                                        {Platform.OS === "ios" ? (
                                                                            <>
                                                                                <CustomCheckbox
                                                                                    checked={field.value}
                                                                                    onPress={() => {
                                                                                        field.onChange(!field.value);
                                                                                        handleCheckboxChange(
                                                                                            `frustrationOne.${option._id}`,
                                                                                            option.lableValue,
                                                                                            !field.value
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Checkbox
                                                                                    status={
                                                                                        field.value
                                                                                            ? "checked"
                                                                                            : "unchecked"
                                                                                    }
                                                                                    onPress={() => {
                                                                                        field.onChange(!field.value);
                                                                                        handleCheckboxChange(
                                                                                            `frustrationOne.${option._id}`,
                                                                                            option.lableValue,
                                                                                            !field.value
                                                                                        );
                                                                                    }}
                                                                                    color="#BC131F"
                                                                                />
                                                                            </>
                                                                        )}
                                                                        <Text style={styles.checkboxLabel}>
                                                                            {option.lableValue}
                                                                        </Text>
                                                                    </View>
                                                                )}
                                                            />
                                                        ))}
                                                        {errors.frustrationOne && (
                                                            <Text style={styles.errorText}>
                                                                {errors.frustrationOne.message}
                                                            </Text>
                                                        )}
                                                    </>
                                                ) : visibleOptions === 2 ? (
                                                    <>
                                                        {frustrationTwo.map((option) => (
                                                            <Controller
                                                                key={option._id}
                                                                name={`frustrationTwo.${option._id}`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <View style={styles.checkboxRow}>
                                                                        {Platform.OS === "ios" ? (
                                                                            <>
                                                                                <CustomCheckbox
                                                                                    checked={field.value}
                                                                                    onPress={() => {
                                                                                        field.onChange(!field.value);
                                                                                        handleCheckboxChange(
                                                                                            `frustrationTwo.${option._id}`,
                                                                                            option.lableValue,
                                                                                            !field.value
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Checkbox
                                                                                    status={
                                                                                        field.value
                                                                                            ? "checked"
                                                                                            : "unchecked"
                                                                                    }
                                                                                    onPress={() => {
                                                                                        field.onChange(!field.value);
                                                                                        handleCheckboxChange(
                                                                                            `frustrationTwo.${option._id}`,
                                                                                            option.lableValue,
                                                                                            !field.value
                                                                                        );
                                                                                    }}
                                                                                    color="#BC131F"
                                                                                />
                                                                            </>
                                                                        )}

                                                                        <Text style={styles.checkboxLabel}>
                                                                            {option.lableValue}
                                                                        </Text>
                                                                    </View>
                                                                )}
                                                            />
                                                        ))}
                                                        {errors.frustrationTwo && (
                                                            <Text style={styles.errorText}>
                                                                {errors.frustrationTwo.message}
                                                            </Text>
                                                        )}
                                                    </>
                                                ) : null}
                                            </View>
                                        )}

                                        {/* Shouting */}
                                        <View style={styles.sectionTitleContainer}>
                                            <MaterialCommunityIcons
                                                name="arrow-right-thin"
                                                size={24}
                                                color="#000"
                                                style={globalStyles.menuIcon}
                                            />
                                            <Text style={styles.sectionTitle}>Shouting</Text>
                                        </View>
                                        <View style={styles.buttonGroup}>
                                            {buttonOptions.map(({ id, label, color, buttonText }) => (
                                                <View key={id} style={styles.buttonContainer}>
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.squareButton,
                                                            {
                                                                borderColor:
                                                                    visibleOptionsShouting === id
                                                                        ? buttonColors[color]
                                                                        : `${buttonColors[color]}80`,
                                                                backgroundColor:
                                                                    visibleOptionsShouting === id
                                                                        ? buttonColors[color]
                                                                        : "transparent",
                                                            },
                                                        ]}
                                                        onPress={() => handleButtonClickShouting(id)}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.buttonText,
                                                                {
                                                                    color:
                                                                        visibleOptionsShouting === id
                                                                            ? "#fff"
                                                                            : buttonColors[color],
                                                                },
                                                            ]}
                                                        >
                                                            {buttonText || id}
                                                        </Text>
                                                    </TouchableOpacity>
                                                    <Text style={styles.labelText}>
                                                        {label.split(" ")[0]} {"\n"} {label.split(" ")[1]}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>

                                        {visibleOptionsShouting !== 0 && (
                                            <View style={styles.checkboxContainer}>
                                                <Text style={styles.checkboxTitle}>
                                                    Shouting - directed towards:
                                                    <Text style={styles.required}> *</Text>
                                                </Text>

                                                {visibleOptionsShouting === 1 ? (
                                                    <>
                                                        {shoutingOne.map((option) => (
                                                            <Controller
                                                                key={option._id}
                                                                name={`shoutingOne.${option._id}`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <View style={styles.checkboxRow}>
                                                                        {Platform.OS === "ios" ? (
                                                                            <>
                                                                                <CustomCheckbox
                                                                                    checked={field.value}
                                                                                    onPress={() => {
                                                                                        field.onChange(!field.value);
                                                                                        handleCheckboxChange(
                                                                                            `shoutingOne.${option._id}`,
                                                                                            option.lableValue,
                                                                                            !field.value
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Checkbox
                                                                                    status={
                                                                                        field.value
                                                                                            ? "checked"
                                                                                            : "unchecked"
                                                                                    }
                                                                                    onPress={() => {
                                                                                        field.onChange(!field.value);
                                                                                        handleCheckboxChange(
                                                                                            `shoutingOne.${option._id}`,
                                                                                            option.lableValue,
                                                                                            !field.value
                                                                                        );
                                                                                    }}
                                                                                    color="#BC131F"
                                                                                />
                                                                            </>
                                                                        )}
                                                                        <Text style={styles.checkboxLabel}>
                                                                            {option.lableValue}
                                                                        </Text>
                                                                    </View>
                                                                )}
                                                            />
                                                        ))}
                                                        {errors.shoutingOne && (
                                                            <Text style={styles.errorText}>
                                                                {errors.shoutingOne.message}
                                                            </Text>
                                                        )}
                                                    </>
                                                ) : visibleOptionsShouting === 2 ? (
                                                    <>
                                                        {shoutingTwo.map((option) => (
                                                            <Controller
                                                                key={option._id}
                                                                name={`shoutingTwo.${option._id}`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <View style={styles.checkboxRow}>
                                                                        {Platform.OS === "ios" ? (
                                                                            <>
                                                                                <CustomCheckbox
                                                                                    checked={field.value}
                                                                                    onPress={() => {
                                                                                        field.onChange(!field.value);
                                                                                        handleCheckboxChange(
                                                                                            `shoutingTwo.${option._id}`,
                                                                                            option.lableValue,
                                                                                            !field.value
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Checkbox
                                                                                    status={
                                                                                        field.value
                                                                                            ? "checked"
                                                                                            : "unchecked"
                                                                                    }
                                                                                    onPress={() => {
                                                                                        field.onChange(!field.value);
                                                                                        handleCheckboxChange(
                                                                                            `shoutingTwo.${option._id}`,
                                                                                            option.lableValue,
                                                                                            !field.value
                                                                                        );
                                                                                    }}
                                                                                    color="#BC131F"
                                                                                />
                                                                            </>
                                                                        )}
                                                                        <Text style={styles.checkboxLabel}>
                                                                            {option.lableValue}
                                                                        </Text>
                                                                    </View>
                                                                )}
                                                            />
                                                        ))}
                                                        {errors.shoutingTwo && (
                                                            <Text style={styles.errorText}>
                                                                {errors.shoutingTwo.message}
                                                            </Text>
                                                        )}
                                                    </>
                                                ) : null}
                                            </View>
                                        )}

                                        {/* Verbal threats */}
                                        <View style={styles.sectionTitleContainer}>
                                            <MaterialCommunityIcons
                                                name="arrow-right-thin"
                                                size={24}
                                                color="#000"
                                                style={globalStyles.menuIcon}
                                            />
                                            <Text style={styles.sectionTitle}>Verbal threats</Text>
                                        </View>
                                        <View style={styles.buttonGroup}>
                                            {buttonOptions.map(({ id, label, color, buttonText }) => (
                                                <View key={id} style={styles.buttonContainer}>
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.squareButton,
                                                            {
                                                                borderColor:
                                                                    visibleOptionsVerbal === id
                                                                        ? buttonColors[color]
                                                                        : `${buttonColors[color]}80`,
                                                                backgroundColor:
                                                                    visibleOptionsVerbal === id
                                                                        ? buttonColors[color]
                                                                        : "transparent",
                                                            },
                                                        ]}
                                                        onPress={() => handleButtonClickVerbal(id)}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.buttonText,
                                                                {
                                                                    color:
                                                                        visibleOptionsVerbal === id
                                                                            ? "#fff"
                                                                            : buttonColors[color],
                                                                },
                                                            ]}
                                                        >
                                                            {buttonText || id}
                                                        </Text>
                                                    </TouchableOpacity>
                                                    <Text style={styles.labelText}>
                                                        {label.split(" ")[0]} {"\n"} {label.split(" ")[1]}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>

                                        {visibleOptionsVerbal !== 0 && (
                                            <View style={styles.checkboxContainer}>
                                                <Text style={styles.checkboxTitle}>
                                                    Verbal Threats - directed towards:
                                                    <Text style={styles.required}> *</Text>
                                                </Text>

                                                {visibleOptionsVerbal === 1 ? (
                                                    <>
                                                        {verbalThreatsOne.map((option) => (
                                                            <Controller
                                                                key={option._id}
                                                                name={`verbalThreatsOne.${option._id}`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <View style={styles.checkboxRow}>
                                                                        {Platform.OS === "ios" ? (
                                                                            <>
                                                                                <CustomCheckbox
                                                                                    checked={field.value}
                                                                                    onPress={() => {
                                                                                        field.onChange(!field.value);
                                                                                        handleCheckboxChange(
                                                                                            `verbalThreatsOne.${option._id}`,
                                                                                            option.lableValue,
                                                                                            !field.value
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Checkbox
                                                                                    status={
                                                                                        field.value
                                                                                            ? "checked"
                                                                                            : "unchecked"
                                                                                    }
                                                                                    onPress={() => {
                                                                                        field.onChange(!field.value);
                                                                                        handleCheckboxChange(
                                                                                            `verbalThreatsOne.${option._id}`,
                                                                                            option.lableValue,
                                                                                            !field.value
                                                                                        );
                                                                                    }}
                                                                                    color="#BC131F"
                                                                                />
                                                                            </>
                                                                        )}
                                                                        <Text style={styles.checkboxLabel}>
                                                                            {option.lableValue}
                                                                        </Text>
                                                                    </View>
                                                                )}
                                                            />
                                                        ))}
                                                        {errors.verbalThreatsOne && (
                                                            <Text style={styles.errorText}>
                                                                {errors.verbalThreatsOne.message}
                                                            </Text>
                                                        )}
                                                    </>
                                                ) : visibleOptionsVerbal === 2 ? (
                                                    <>
                                                        {verbalThreatsTwo.map((option) => (
                                                            <Controller
                                                                key={option._id}
                                                                name={`verbalThreatsTwo.${option._id}`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <View style={styles.checkboxRow}>
                                                                        {Platform.OS === "ios" ? (
                                                                            <>
                                                                                <CustomCheckbox
                                                                                    checked={field.value}
                                                                                    onPress={() => {
                                                                                        field.onChange(!field.value);
                                                                                        handleCheckboxChange(
                                                                                            `verbalThreatsTwo.${option._id}`,
                                                                                            option.lableValue,
                                                                                            !field.value
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Checkbox
                                                                                    status={
                                                                                        field.value
                                                                                            ? "checked"
                                                                                            : "unchecked"
                                                                                    }
                                                                                    onPress={() => {
                                                                                        field.onChange(!field.value);
                                                                                        handleCheckboxChange(
                                                                                            `verbalThreatsTwo.${option._id}`,
                                                                                            option.lableValue,
                                                                                            !field.value
                                                                                        );
                                                                                    }}
                                                                                    color="#BC131F"
                                                                                />
                                                                            </>
                                                                        )}
                                                                        <Text style={styles.checkboxLabel}>
                                                                            {option.lableValue}
                                                                        </Text>
                                                                    </View>
                                                                )}
                                                            />
                                                        ))}
                                                        {errors.verbalThreatsTwo && (
                                                            <Text style={styles.errorText}>
                                                                {errors.verbalThreatsTwo.message}
                                                            </Text>
                                                        )}
                                                    </>
                                                ) : null}
                                            </View>
                                        )}

                                        {/* Pushing / shoving threats start */}
                                        <View style={styles.sectionTitleContainer}>
                                            <MaterialCommunityIcons
                                                name="arrow-right-thin"
                                                size={24}
                                                color="#000"
                                                style={globalStyles.menuIcon}
                                            />
                                            <Text style={styles.sectionTitle}>Pushing / shoving</Text>
                                        </View>
                                        <View style={styles.buttonGroup}>
                                            {buttonOptions.map(({ id, label, color, buttonText }) => (
                                                <View key={id} style={styles.buttonContainer}>
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.squareButton,
                                                            {
                                                                borderColor:
                                                                    visibleOptionsPushing === id
                                                                        ? buttonColors[color]
                                                                        : `${buttonColors[color]}80`,
                                                                backgroundColor:
                                                                    visibleOptionsPushing === id
                                                                        ? buttonColors[color]
                                                                        : "transparent",
                                                            },
                                                        ]}
                                                        onPress={() => handleButtonClickPushing(id)}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.buttonText,
                                                                {
                                                                    color:
                                                                        visibleOptionsPushing === id
                                                                            ? "#fff"
                                                                            : buttonColors[color],
                                                                },
                                                            ]}
                                                        >
                                                            {buttonText || id}
                                                        </Text>
                                                    </TouchableOpacity>
                                                    <Text style={styles.labelText}>
                                                        {label.split(" ")[0]} {"\n"} {label.split(" ")[1]}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>

                                        {visibleOptionsPushing !== 0 && (
                                            <View style={styles.checkboxContainer}>
                                                <Text style={styles.checkboxTitle}>
                                                    Pushing / shoving - directed towards:
                                                    <Text style={styles.required}> *</Text>
                                                </Text>

                                                {visibleOptionsPushing === 1 ? (
                                                    <>
                                                        {pushingShovingOne.map((option) => (
                                                            <Controller
                                                                key={option._id}
                                                                name={`pushingShovingOne.${option._id}`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <View style={styles.checkboxRow}>
                                                                        {Platform.OS === "ios" ? (
                                                                            <>
                                                                                <CustomCheckbox
                                                                                    checked={field.value}
                                                                                    onPress={() => {
                                                                                        field.onChange(!field.value);
                                                                                        handleCheckboxChange(
                                                                                            `pushingShovingOne.${option._id}`,
                                                                                            option.lableValue,
                                                                                            !field.value
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Checkbox
                                                                                    status={
                                                                                        field.value
                                                                                            ? "checked"
                                                                                            : "unchecked"
                                                                                    }
                                                                                    onPress={() => {
                                                                                        field.onChange(!field.value);
                                                                                        handleCheckboxChange(
                                                                                            `pushingShovingOne.${option._id}`,
                                                                                            option.lableValue,
                                                                                            !field.value
                                                                                        );
                                                                                    }}
                                                                                    color="#BC131F"
                                                                                />
                                                                            </>
                                                                        )}
                                                                        <Text style={styles.checkboxLabel}>
                                                                            {option.lableValue}
                                                                        </Text>
                                                                    </View>
                                                                )}
                                                            />
                                                        ))}
                                                        {errors.pushingShovingOne && (
                                                            <Text style={styles.errorText}>
                                                                {errors.pushingShovingOne.message}
                                                            </Text>
                                                        )}
                                                    </>
                                                ) : visibleOptionsPushing === 2 ? (
                                                    <>
                                                        {pushingShovingTwo.map((option) => (
                                                            <Controller
                                                                key={option._id}
                                                                name={`pushingShovingTwo.${option._id}`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <View style={styles.checkboxRow}>
                                                                        {Platform.OS === "ios" ? (
                                                                            <>
                                                                                <CustomCheckbox
                                                                                    checked={field.value}
                                                                                    onPress={() => {
                                                                                        field.onChange(!field.value);
                                                                                        handleCheckboxChange(
                                                                                            `pushingShovingTwo.${option._id}`,
                                                                                            option.lableValue,
                                                                                            !field.value
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Checkbox
                                                                                    status={
                                                                                        field.value
                                                                                            ? "checked"
                                                                                            : "unchecked"
                                                                                    }
                                                                                    onPress={() => {
                                                                                        field.onChange(!field.value);
                                                                                        handleCheckboxChange(
                                                                                            `pushingShovingTwo.${option._id}`,
                                                                                            option.lableValue,
                                                                                            !field.value
                                                                                        );
                                                                                    }}
                                                                                    color="#BC131F"
                                                                                />
                                                                            </>
                                                                        )}
                                                                        <Text style={styles.checkboxLabel}>
                                                                            {option.lableValue}
                                                                        </Text>
                                                                    </View>
                                                                )}
                                                            />
                                                        ))}
                                                        {errors.pushingShovingTwo && (
                                                            <Text style={styles.errorText}>
                                                                {errors.pushingShovingTwo.message}
                                                            </Text>
                                                        )}
                                                    </>
                                                ) : null}
                                            </View>
                                        )}

                                        {/* Assault - punch / kick / slap start */}
                                        <View style={styles.sectionTitleContainer}>
                                            <MaterialCommunityIcons
                                                name="arrow-right-thin"
                                                size={24}
                                                color="#000"
                                                style={globalStyles.menuIcon}
                                            />
                                            <Text style={styles.sectionTitle}>
                                                Assault - punch / kick / slap
                                            </Text>
                                        </View>
                                        <View style={styles.buttonGroup}>
                                            {buttonOptions.map(({ id, label, color, buttonText }) => (
                                                <View key={id} style={styles.buttonContainer}>
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.squareButton,
                                                            {
                                                                borderColor:
                                                                    visibleOptionsAssaultpunch === id
                                                                        ? buttonColors[color]
                                                                        : `${buttonColors[color]}80`,
                                                                backgroundColor:
                                                                    visibleOptionsAssaultpunch === id
                                                                        ? buttonColors[color]
                                                                        : "transparent",
                                                            },
                                                        ]}
                                                        onPress={() => handleButtonClickAssaultpunch(id)}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.buttonText,
                                                                {
                                                                    color:
                                                                        visibleOptionsAssaultpunch === id
                                                                            ? "#fff"
                                                                            : buttonColors[color],
                                                                },
                                                            ]}
                                                        >
                                                            {buttonText || id}
                                                        </Text>
                                                    </TouchableOpacity>
                                                    <Text style={styles.labelText}>
                                                        {label.split(" ")[0]} {"\n"} {label.split(" ")[1]}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>

                                        {visibleOptionsAssaultpunch !== 0 && (
                                            <View style={styles.checkboxContainer}>
                                                <Text style={styles.checkboxTitle}>
                                                    Assault - punch / kick / slap - directed towards:
                                                    <Text style={styles.required}> *</Text>
                                                </Text>

                                                {visibleOptionsAssaultpunch === 1 ? (
                                                    <>
                                                        {assaultPunchKickSlapOne.map((option) => (
                                                            <Controller
                                                                key={option._id}
                                                                name={`assaultPunchKickSlapOne.${option._id}`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <View style={styles.checkboxRow}>
                                                                        {Platform.OS === "ios" ? (
                                                                            <>
                                                                                <CustomCheckbox
                                                                                    checked={field.value}
                                                                                    onPress={() => {
                                                                                        field.onChange(!field.value);
                                                                                        handleCheckboxChange(
                                                                                            `assaultPunchKickSlapOne.${option._id}`,
                                                                                            option.lableValue,
                                                                                            !field.value
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Checkbox
                                                                                    status={
                                                                                        field.value
                                                                                            ? "checked"
                                                                                            : "unchecked"
                                                                                    }
                                                                                    onPress={() => {
                                                                                        field.onChange(!field.value);
                                                                                        handleCheckboxChange(
                                                                                            `assaultPunchKickSlapOne.${option._id}`,
                                                                                            option.lableValue,
                                                                                            !field.value
                                                                                        );
                                                                                    }}
                                                                                    color="#BC131F"
                                                                                />
                                                                            </>
                                                                        )}
                                                                        <Text style={styles.checkboxLabel}>
                                                                            {option.lableValue}
                                                                        </Text>
                                                                    </View>
                                                                )}
                                                            />
                                                        ))}
                                                        {errors.assaultPunchKickSlapOne && (
                                                            <Text style={styles.errorText}>
                                                                {errors.assaultPunchKickSlapOne.message}
                                                            </Text>
                                                        )}
                                                    </>
                                                ) : visibleOptionsAssaultpunch === 2 ? (
                                                    <>
                                                        {assaultPunchKickSlapTwo.map((option) => (
                                                            <Controller
                                                                key={option._id}
                                                                name={`assaultPunchKickSlapTwo.${option._id}`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <View style={styles.checkboxRow}>
                                                                        {Platform.OS === "ios" ? (
                                                                            <>
                                                                                <CustomCheckbox
                                                                                    checked={field.value}
                                                                                    onPress={() => {
                                                                                        field.onChange(!field.value);
                                                                                        handleCheckboxChange(
                                                                                            `assaultPunchKickSlapTwo.${option._id}`,
                                                                                            option.lableValue,
                                                                                            !field.value
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Checkbox
                                                                                    status={
                                                                                        field.value
                                                                                            ? "checked"
                                                                                            : "unchecked"
                                                                                    }
                                                                                    onPress={() => {
                                                                                        field.onChange(!field.value);
                                                                                        handleCheckboxChange(
                                                                                            `assaultPunchKickSlapTwo.${option._id}`,
                                                                                            option.lableValue,
                                                                                            !field.value
                                                                                        );
                                                                                    }}
                                                                                    color="#BC131F"
                                                                                />
                                                                            </>
                                                                        )}
                                                                        <Text style={styles.checkboxLabel}>
                                                                            {option.lableValue}
                                                                        </Text>
                                                                    </View>
                                                                )}
                                                            />
                                                        ))}
                                                        {errors.assaultPunchKickSlapTwo && (
                                                            <Text style={styles.errorText}>
                                                                {errors.assaultPunchKickSlapTwo.message}
                                                            </Text>
                                                        )}
                                                    </>
                                                ) : null}
                                            </View>
                                        )}

                                        {/* Assault - weapon involved start */}
                                        <View style={styles.sectionTitleContainer}>
                                            <MaterialCommunityIcons
                                                name="arrow-right-thin"
                                                size={24}
                                                color="#000"
                                                style={globalStyles.menuIcon}
                                            />
                                            <Text style={styles.sectionTitle}>
                                                Assault - weapon involved
                                            </Text>
                                        </View>
                                        <View style={styles.buttonGroup}>
                                            {buttonOptions.map(({ id, label, color, buttonText }) => (
                                                <View key={id} style={styles.buttonContainer}>
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.squareButton,
                                                            {
                                                                borderColor:
                                                                    visibleOptionsAssault === id
                                                                        ? buttonColors[color]
                                                                        : `${buttonColors[color]}80`,
                                                                backgroundColor:
                                                                    visibleOptionsAssault === id
                                                                        ? buttonColors[color]
                                                                        : "transparent",
                                                            },
                                                        ]}
                                                        onPress={() => handleButtonClickAssault(id)}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.buttonText,
                                                                {
                                                                    color:
                                                                        visibleOptionsAssault === id
                                                                            ? "#fff"
                                                                            : buttonColors[color],
                                                                },
                                                            ]}
                                                        >
                                                            {buttonText || id}
                                                        </Text>
                                                    </TouchableOpacity>
                                                    <Text style={styles.labelText}>
                                                        {label.split(" ")[0]} {"\n"} {label.split(" ")[1]}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>

                                        {visibleOptionsAssault !== 0 && (
                                            <View style={styles.checkboxContainer}>
                                                <Text style={styles.checkboxTitle}>
                                                    Assault - Weapon Involved - Directed Towards:
                                                    <Text style={styles.required}> *</Text>
                                                </Text>

                                                {visibleOptionsAssault === 1 ? (
                                                    <>
                                                        {assaultWeaponInvolvedOne.map((option) => (
                                                            <Controller
                                                                key={option._id}
                                                                name={`assaultWeaponInvolvedOne.${option._id}`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <View style={styles.checkboxRow}>
                                                                        {Platform.OS === "ios" ? (
                                                                            <>
                                                                                <CustomCheckbox
                                                                                    checked={field.value}
                                                                                    onPress={() => {
                                                                                        field.onChange(!field.value);
                                                                                        handleCheckboxChange(
                                                                                            `assaultWeaponInvolvedOne`,
                                                                                            option.lableValue,
                                                                                            !field.value
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Checkbox
                                                                                    status={
                                                                                        field.value
                                                                                            ? "checked"
                                                                                            : "unchecked"
                                                                                    }
                                                                                    onPress={() => {
                                                                                        field.onChange(!field.value);
                                                                                        handleCheckboxChange(
                                                                                            `assaultWeaponInvolvedOne`,
                                                                                            option.lableValue,
                                                                                            !field.value
                                                                                        );
                                                                                    }}
                                                                                    color="#BC131F"
                                                                                />
                                                                            </>
                                                                        )}
                                                                        <Text style={styles.checkboxLabel}>
                                                                            {option.lableValue}
                                                                        </Text>
                                                                    </View>
                                                                )}
                                                            />
                                                        ))}
                                                        {errors.assaultWeaponInvolvedOne && (
                                                            <Text style={styles.errorText}>
                                                                {errors.assaultWeaponInvolvedOne.message}
                                                            </Text>
                                                        )}

                                                        <Text style={styles.checkboxTitle}>
                                                            Type of Weapon:
                                                            <Text style={styles.required}> *</Text>
                                                        </Text>
                                                        {assaultTypeOfWeaponOne.map((option) => (
                                                            <Controller
                                                                key={option._id}
                                                                name={`assaultTypeOfWeaponOne.${option._id}`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <View style={styles.checkboxRow}>
                                                                        {Platform.OS === "ios" ? (
                                                                            <>
                                                                                <CustomCheckbox
                                                                                    checked={field.value}
                                                                                    onPress={() => {
                                                                                        field.onChange(!field.value);
                                                                                        if (option.lableValue === "Other") {
                                                                                            setOtherWeapon(!field.value);
                                                                                            setValue("otherWeapon", "");
                                                                                        }
                                                                                        handleCheckboxChange(
                                                                                            `assaultTypeOfWeaponOne`,
                                                                                            option.lableValue,
                                                                                            !field.value
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Checkbox
                                                                                    status={
                                                                                        field.value
                                                                                            ? "checked"
                                                                                            : "unchecked"
                                                                                    }
                                                                                    onPress={() => {
                                                                                        field.onChange(!field.value);
                                                                                        if (option.lableValue === "Other") {
                                                                                            setOtherWeapon(!field.value);
                                                                                            setValue("otherWeapon", "");
                                                                                        }
                                                                                        handleCheckboxChange(
                                                                                            `assaultTypeOfWeaponOne`,
                                                                                            option.lableValue,
                                                                                            !field.value
                                                                                        );
                                                                                    }}
                                                                                    color="#BC131F"
                                                                                />
                                                                            </>
                                                                        )}
                                                                        <Text style={styles.checkboxLabel}>
                                                                            {option.lableValue}
                                                                        </Text>
                                                                    </View>
                                                                )}
                                                            />
                                                        ))}
                                                        {errors.assaultTypeOfWeaponOne && (
                                                            <Text style={styles.errorText}>
                                                                {errors.assaultTypeOfWeaponOne.message}
                                                            </Text>
                                                        )}

                                                        {otherWeapon && (
                                                            <>
                                                                <Controller
                                                                    name="otherWeapon"
                                                                    control={control}
                                                                    rules={{ required: "This field is required" }}
                                                                    render={({ field }) => (
                                                                        <TextInput
                                                                            mode="outlined"
                                                                            outlineColor={
                                                                                otherWeapon ? "#2E9E4A" : "#BFBBBB"
                                                                            }
                                                                            activeOutlineColor={"#2E9E4A"}
                                                                            placeholder="Other Weapon"
                                                                            style={styles.textInput}
                                                                            placeholderTextColor="#BFBBBB"
                                                                            onChangeText={(value) =>
                                                                                field.onChange(value)
                                                                            }
                                                                            value={field.value || ""}
                                                                        />
                                                                    )}
                                                                />
                                                            </>
                                                        )}

                                                        <Text style={styles.checkboxTitle}>
                                                            Assault - Weapon Produced Type:
                                                            <Text style={styles.required}> *</Text>
                                                        </Text>

                                                        <Controller
                                                            name="assaultWeaponProducedType.One"
                                                            control={control}
                                                            render={({ field }) => (
                                                                <View>
                                                                    {assaultWeaponProducedTypeOne.map(
                                                                        (option) => (
                                                                            <View
                                                                                key={option._id}
                                                                                style={styles.checkboxRow}
                                                                            >
                                                                                {Platform.OS === "ios" ? (
                                                                                    <CustomRadioButton
                                                                                        selected={
                                                                                            field.value === option._id
                                                                                        } // Compare field value with option ID
                                                                                        onPress={() => {
                                                                                            field.onChange(option._id); // Update form value

                                                                                            // Find the selected option and update label value
                                                                                            const selectedOption =
                                                                                                assaultWeaponProducedTypeOne.find(
                                                                                                    (opt) =>
                                                                                                        opt._id === option._id
                                                                                                );

                                                                                            setSelectedData((prev) => ({
                                                                                                ...prev,
                                                                                                assaultWeaponProducedType: {
                                                                                                    name: "assaultWeaponProducedType.One",
                                                                                                    value: selectedOption
                                                                                                        ? selectedOption.lableValue
                                                                                                        : "",
                                                                                                },
                                                                                            }));
                                                                                        }}
                                                                                    />
                                                                                ) : (
                                                                                    <RadioButton.Group
                                                                                        onValueChange={(value) => {
                                                                                            field.onChange(value);

                                                                                            const selectedOption =
                                                                                                assaultWeaponProducedTypeOne.find(
                                                                                                    (opt) => opt._id === value
                                                                                                );

                                                                                            setSelectedData((prev) => ({
                                                                                                ...prev,
                                                                                                assaultWeaponProducedType: {
                                                                                                    name: "assaultWeaponProducedType.One",
                                                                                                    value: selectedOption
                                                                                                        ? selectedOption.lableValue
                                                                                                        : "",
                                                                                                },
                                                                                            }));
                                                                                        }}
                                                                                        value={field.value || ""}
                                                                                    >
                                                                                        <RadioButton
                                                                                            value={option._id}
                                                                                            color="#BC131F"
                                                                                        />
                                                                                    </RadioButton.Group>
                                                                                )}
                                                                                <Text style={styles.radioLabel}>
                                                                                    {option.lableValue}
                                                                                </Text>
                                                                            </View>
                                                                        )
                                                                    )}
                                                                </View>
                                                            )}
                                                        />
                                                    </>
                                                ) : visibleOptionsAssault === 2 ? (
                                                    <>
                                                        {assaultWeaponInvolvedTwo.map((option) => (
                                                            <Controller
                                                                key={option._id}
                                                                name={`assaultWeaponInvolvedTwo.${option._id}`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <View style={styles.checkboxRow}>
                                                                        {Platform.OS === "ios" ? (
                                                                            <>
                                                                                <CustomCheckbox
                                                                                    checked={field.value}
                                                                                    onPress={() => {
                                                                                        field.onChange(!field.value);
                                                                                        handleCheckboxChange(
                                                                                            `assaultWeaponInvolvedTwo`,
                                                                                            option.lableValue,
                                                                                            !field.value
                                                                                        );
                                                                                    }}
                                                                                    col
                                                                                />
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Checkbox
                                                                                    status={
                                                                                        field.value
                                                                                            ? "checked"
                                                                                            : "unchecked"
                                                                                    }
                                                                                    onPress={() => {
                                                                                        field.onChange(!field.value);
                                                                                        handleCheckboxChange(
                                                                                            `assaultWeaponInvolvedTwo`,
                                                                                            option.lableValue,
                                                                                            !field.value
                                                                                        );
                                                                                    }}
                                                                                    color="#BC131F"
                                                                                />
                                                                            </>
                                                                        )}
                                                                        <Text style={styles.checkboxLabel}>
                                                                            {option.lableValue}
                                                                        </Text>
                                                                    </View>
                                                                )}
                                                            />
                                                        ))}
                                                        {errors.assaultWeaponInvolvedTwo && (
                                                            <Text style={styles.errorText}>
                                                                {errors.assaultWeaponInvolvedTwo.message}
                                                            </Text>
                                                        )}

                                                        <Text style={styles.checkboxTitle}>
                                                            Type of Weapon:
                                                            <Text style={styles.required}> *</Text>
                                                        </Text>
                                                        {assaultTypeOfWeaponTwo.map((option) => (
                                                            <Controller
                                                                key={option._id}
                                                                name={`assaultTypeOfWeaponTwo.${option._id}`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <View style={styles.checkboxRow}>
                                                                        {Platform.OS === "ios" ? (
                                                                            <>
                                                                                <CustomCheckbox
                                                                                    checked={field.value}
                                                                                    onPress={() => {
                                                                                        field.onChange(!field.value);
                                                                                        if (option.lableValue === "Other") {
                                                                                            setOtherWeapon(!field.value); // This sets the state to indicate "Other" was selected
                                                                                            setValue("otherWeapon", ""); // Reset the otherWeapon value when checked
                                                                                        }
                                                                                        handleCheckboxChange(
                                                                                            `assaultTypeOfWeaponTwo`,
                                                                                            option.lableValue,
                                                                                            !field.value
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Checkbox
                                                                                    status={
                                                                                        field.value
                                                                                            ? "checked"
                                                                                            : "unchecked"
                                                                                    }
                                                                                    onPress={() => {
                                                                                        field.onChange(!field.value);
                                                                                        if (option.lableValue === "Other") {
                                                                                            setOtherWeapon(!field.value); // This sets the state to indicate "Other" was selected
                                                                                            setValue("otherWeapon", ""); // Reset the otherWeapon value when checked
                                                                                        }
                                                                                        handleCheckboxChange(
                                                                                            `assaultTypeOfWeaponTwo`,
                                                                                            option.lableValue,
                                                                                            !field.value
                                                                                        );
                                                                                    }}
                                                                                    color="#BC131F"
                                                                                />
                                                                            </>
                                                                        )}
                                                                        <Text style={styles.checkboxLabel}>
                                                                            {option.lableValue}
                                                                        </Text>
                                                                    </View>
                                                                )}
                                                            />
                                                        ))}
                                                        {errors.assaultTypeOfWeaponTwo && (
                                                            <Text style={styles.errorText}>
                                                                {errors.assaultTypeOfWeaponTwo.message}
                                                            </Text>
                                                        )}

                                                        {otherWeapon && (
                                                            <>
                                                                <Controller
                                                                    name="otherWeapon"
                                                                    control={control}
                                                                    rules={{ required: "This field is required" }}
                                                                    render={({ field }) => (
                                                                        <TextInput
                                                                            mode="outlined"
                                                                            outlineColor={
                                                                                otherWeapon ? "#2E9E4A" : "#BFBBBB"
                                                                            }
                                                                            activeOutlineColor={"#2E9E4A"}
                                                                            placeholder="Other Weapon"
                                                                            style={styles.textInput}
                                                                            placeholderTextColor="#BFBBBB"
                                                                            onChangeText={(value) =>
                                                                                field.onChange(value)
                                                                            }
                                                                            value={field.value || ""}
                                                                        />
                                                                    )}
                                                                />
                                                            </>
                                                        )}

                                                        <Text style={styles.checkboxTitle}>
                                                            Assault - Weapon Produced Type:
                                                            <Text style={styles.required}> *</Text>
                                                        </Text>
                                                        <Controller
                                                            name="assaultWeaponProducedType.Two"
                                                            control={control}
                                                            render={({ field }) => (
                                                                <View>
                                                                    {assaultWeaponProducedTypeTwo.map(
                                                                        (option) => (
                                                                            <View
                                                                                key={option._id}
                                                                                style={styles.checkboxRow}
                                                                            >
                                                                                {Platform.OS === "ios" ? (
                                                                                    <CustomRadioButton
                                                                                        selected={
                                                                                            field.value === option._id
                                                                                        } // Compare field value with option ID
                                                                                        onPress={() => {
                                                                                            field.onChange(option._id); // Update form value

                                                                                            // Find the selected option and update label value
                                                                                            const selectedOption =
                                                                                                assaultWeaponProducedTypeTwo.find(
                                                                                                    (opt) =>
                                                                                                        opt._id === option._id
                                                                                                );

                                                                                            setSelectedData((prev) => ({
                                                                                                ...prev,
                                                                                                assaultWeaponProducedType: {
                                                                                                    name: "assaultWeaponProducedType.Two",
                                                                                                    value: selectedOption
                                                                                                        ? selectedOption.lableValue
                                                                                                        : "",
                                                                                                },
                                                                                            }));
                                                                                        }}
                                                                                    />
                                                                                ) : (
                                                                                    <RadioButton.Group
                                                                                        onValueChange={(value) => {
                                                                                            field.onChange(value);

                                                                                            const selectedOption =
                                                                                                assaultWeaponProducedTypeTwo.find(
                                                                                                    (opt) => opt._id === value
                                                                                                );

                                                                                            setSelectedData((prev) => ({
                                                                                                ...prev,
                                                                                                assaultWeaponProducedType: {
                                                                                                    name: "assaultWeaponProducedType.Two",
                                                                                                    value: selectedOption
                                                                                                        ? selectedOption.lableValue
                                                                                                        : "",
                                                                                                },
                                                                                            }));
                                                                                        }}
                                                                                        value={field.value || ""}
                                                                                    >
                                                                                        <RadioButton
                                                                                            value={option._id}
                                                                                            color="#BC131F"
                                                                                        />
                                                                                    </RadioButton.Group>
                                                                                )}
                                                                                <Text style={styles.radioLabel}>
                                                                                    {option.lableValue}
                                                                                </Text>
                                                                            </View>
                                                                        )
                                                                    )}
                                                                </View>
                                                            )}
                                                        />
                                                    </>
                                                ) : null}
                                            </View>
                                        )}

                                        <View style={styles.summaryOfIncident}>
                                            <CustomTextArea
                                                label="Summary of incident(s)"
                                                placeholder="Please also complete an Incident Report for Incidents, requests to move on, bag checks etc"
                                                value={summaryOfIncident}
                                                onChangeText={handleSummaryofIncidentChange}
                                                isRequired={false}
                                            />
                                        </View>
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
                                            // activityType={ReportDetails?.activityType?.name}
                                            reportType={"EndofShift"}
                                            // location={ReportDetails?.location}
                                            reportedAt={moment
                                                .utc(ReportDetails?.reportedAt)
                                                .format("YYYY-MM-DD HH:mm A")}
                                            // subActivityType={ReportDetails?.subActivityType?.name}
                                            onClose={closeModal}
                                        />
                                    </View>

                                    <View style={{ top: 10, marginBottom: 10, display: "flex" }}>
                                        <TouchableOpacity
                                            style={[styles.button, { backgroundColor: "#50C878" }]}
                                            onPress={async () => {
                                                const formData = getValues(); // Get current form data
                                                const isValid = await trigger(); // Force validation

                                                // console.log("Validation result:", isValid, "Form Data:", formData);

                                                onSubmit(formData, false); // ✅ Call `onSubmit` even if errors exist
                                            }}
                                        >
                                            <Text style={[styles.btnText, { color: "#FFF" }]}>
                                                SUBMIT
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.button,
                                                { backgroundColor: "#FF9F43", marginTop: 10 },
                                            ]}
                                            onPress={async () => {
                                                const formData = getValues(); // Get current form data
                                                const isValid = await trigger(); // Force validation

                                                // console.log("Validation result:", isValid, "Form Data:", formData);

                                                onSubmit(formData, true); // ✅ Call `onSubmit` even if errors exist
                                            }}
                                            disabled={isLoading ? true : false}
                                        >
                                            <Text style={styles.btnText}>SAVE AS DRAFT</Text>
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
        marginLeft: 20,
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
        // marginBottom: 4,
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
        padding: 10,
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
        // top: 15,
        borderWidth: 1,
        borderColor: "#C5C5C5",
        borderRadius: 8,
        padding: 15,
        marginHorizontal: 10,
        backgroundColor: "#FFF",
    },
    // sectionTitle: {
    //     fontSize: 16,
    //     fontWeight: "500",
    //     marginBottom: 15,
    //     color: "#4F4F4F",
    //     paddingHorizontal: 10,
    // },
    inputGroup: {
        marginBottom: 15,
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
    // buttonGroup: {
    //     flexDirection: "row",
    //     justifyContent: "center",
    //     margin: 10,
    // },
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
    // buttonText: {
    //     color: "#FFF",
    // },
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
        height: 35,
        margin: 10,
        fontSize: 14,
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
        padding: 5,
        paddingHorizontal: 10,
        backgroundColor: "#eeeeee",
        margin: 10,
    },
    signatureView: {
        borderColor: "#000",
        borderWidth: 1,
    },
    signatureImage: {
        width: "100%",
        height: 200,
    },
    mainFormContainer: {
        borderTopWidth: 1,
        borderTopColor: "#ccc",
    },
    subTitleText: {
        marginVertical: 10,
        color: '#726F7B'
    },
    sectionTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "400",
        color: "#000",
        marginBottom: 10,
        marginLeft: 2,
        marginTop: 6,
    },
    buttonGroup: {
        flexDirection: "row",
        gap: 20,
        flexWrap: "wrap",
        marginBottom: 10,
        marginLeft: 20,
    },
    buttonContainer: {
        alignItems: "center",
        maxWidth: 65,
    },
    squareButton: {
        width: 36,
        height: 36,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 4,
    },
    labelText: {
        textAlign: "center",
        fontSize: 14,
        color: "#333",
        marginTop: 4,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    incidentText: {
        marginTop: 5,
        fontSize: 12,
        fontWeight: "400",
        textAlign: "center",
        flexWrap: "wrap",
        color: "#000",
    },
    checkboxContainer: {
        marginVertical: 4,
        marginHorizontal: "auto",
        borderWidth: 1,
        borderRadius: 4,
        borderColor: "#726F7B",
    },
    checkboxTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 5,
        color: "#5D5A68",
        paddingHorizontal: 6,
        paddingTop: 6,
    },
    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 2,
        paddingHorizontal: 6,
    },
    checkboxLabel: {
        fontSize: 14,
        color: "#726F7B",
    },
    errorText: {
        color: "red",
        fontSize: 12,
        marginTop: 5,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
    },
    summaryOfIncident: {
        marginTop: 14,
    },
    customCheckbox: {
        width: 25,
        height: 25,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
    },
    customRadioButton: {
        width: 25,
        height: 25,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
    },
    radioLabel: {
        fontSize: 14,
        color: '#726F7B'
    },
});

export default AtmosphericReport;
