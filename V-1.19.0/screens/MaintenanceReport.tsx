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
import { SERVER_URL_ROASTERING } from "../Constant";
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

const MaintenanceReport = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // const { shift } = route.params;
  const { shift, reportType, id, status, location, subLocation } = route.params;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeIcon, setActiveIcon] = useState<number>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [visible, setVisible] = React.useState(false);
  const [imageRange, setImageRange] = React.useState("");
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isIOSDatePickerVisible, setIOSDatePickerVisible] = useState(false);
  const [isIOSTimePickerVisible, setIOSTimePickerVisible] = useState(false);

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());

  const [maintenanceCategories, setMaintenanceCategories] = useState([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [subLocations, setSubLocations] = useState([]);
  const [otherLocation, setOtherLocation] = useState("");

  const [description, setDescription] = useState("");
  const [outcome, setOutcome] = useState("");
  const [reportedTo, setReportedTo] = useState("");

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
  const [priorityError, setPriorityError] = useState(false);
  const [descriptionError, setDescriptionError] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [otherLocationError, setOtherLocationError] = useState(false);
  const [maintenanceCategoryError, setMaintenanceCategoryError] =
    useState(false);
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

  const toggleSidebar = () => {
    // If the sidebar is open, close it
    if (isSidebarOpen) {
      const toValue = -windowWidth * 0.7;
      sidebarTranslateX.setValue(toValue);

      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
      const toValue = 0;
      Animated.timing(sidebarTranslateX, {
        toValue,
        duration: 300, // Adjust the duration as needed
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    }
  };
  const hideDialog = () => setVisible(false);

  const handleDescriptionChange = (text: any) => {
    setDescription(text);
    setDescriptionError(text.trim() === "");
  };
  const handleReportedTo = (text: any) => {
    setReportedTo(text);
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
    }
    setIsSignatureSaved(false);
    setSignatureUri(null);
  };

  const onSaveEvent = (result: any) => {
    if (result.encoded) {
      setSignatureUri(result.encoded); // Save the base64 encoded image
      setIsSignatureSaved(true);
    }
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
  //             console.log('img -----------------------------', img);

  //             const sum = await sumPromise;
  //             try {
  //               const size = await getImageSize(img.url); // Ensure we are using img.url here
  //               return sum + size;
  //             } catch (error) {
  //               console.log("Error getting image size for existing image:", error);
  //               return sum; // Fallback if size retrieval fails
  //             }
  //           },
  //           Promise.resolve(0)
  //         );

  //         // Get the size of the new captured image
  //         console.log('image.path ------------------------- ', image.path);
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

  // const removeImage = (indexToRemove: any) => {
  //   setImageUris((prevUris) => {
  //     const updatedUris = prevUris.filter(
  //       (_, index) => index !== indexToRemove
  //     );

  //     // Recalculate the total size of the remaining images
  //     calculateTotalSize(updatedUris)
  //       .then((totalSize) => {
  //         if (totalSize > MAX_SIZE_BYTES) {
  //           Alert.alert(
  //             "Size Limit Exceeded",
  //             `The total size of images should not exceed ${MAX_SIZE_MB}MB.`
  //           );
  //         }
  //       })
  //       .catch((err) => {
  //         console.log("Error calculating total size:", err);
  //       });

  //     return updatedUris;
  //   });
  // };

  const removeImage = (indexToRemove: number) => {
    setImageUris((prevUris) => {
      const updatedUris = [...prevUris];
      const removedImage = updatedUris[indexToRemove]; // Capture before removal
      updatedUris.splice(indexToRemove, 1); // Remove image

      console.log("Updated imageUris:", updatedUris);
      console.log("Removed Image:", removedImage);

      // If the removed image is from API, store its `_id`
      if (removedImage?.url.startsWith("https://icorp-rostering.s3")) {
        setRemovedImages((prevRemoved) => {
          const newRemoved = [...prevRemoved, removedImage._id]; // Store only ID
          console.log("Updated removedImages:", newRemoved);
          return newRemoved;
        });
      }

      return updatedUris; // Ensure correct state update
    });

    // Calculate size for local images only (not API images)
    setTimeout(() => {
      setImageUris((prevUris) => {
        const newImages = prevUris
          .filter((img) => img.url && !img.url.startsWith("https://icorp-rostering.s3"))
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

  const fetchMaintenanceCategory = useCallback(async () => {
    try {
      setIsLoading(true);
      const siteId = await AsyncStorage.getItem("siteId");
      const url = `${SERVER_URL_ROASTERING}/get/check/types?report=maintenanceIssue&siteId=${siteId}`;

      const response = await axios.get(url, {
        withCredentials: true,
      });

      if (response?.status === 200) {
        const types = response?.data?.types || []; // Fetch the 'types' array
        // console.log(types);

        // Transform the 'types' array to bind 'maintenanceType'
        const transformedCategories = types.map((item: any) => ({
          label: capitalizeFirstLetter(item.name),
          value: item._id,
          severityLevel: item.severityLevel,
        }));

        setMaintenanceCategories(transformedCategories); // Bind to state
      } else {
        console.error(
          "API request failed:",
          response?.status,
          response?.statusText
        );
      }
    } catch (error) {
      console.error("Error fetching maintenance types:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMaintenanceType = useCallback(
    async (MaintenanceCategoryId: string) => {
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
          };
          const payload = {
            maintenanceTypeId: [MaintenanceCategoryId],
          };

          const url = `${SERVER_URL_ROASTERING}/get/sub/maintenance/type/maintenance/type/wise`;

          const response = await axios.post(url, payload, {
            params: params,
            withCredentials: true,
          });

          if (response?.status === 200) {
            // console.log("response==>", response.data);

            const data = response?.data?.subMaintenanceTypes || [];
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
              setMaintenanceTypes(transformedCategories);
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

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          if (status === "draft") {
            const url = `${SERVER_URL_ROASTERING}/get/maintenance/issue/${id}`;
            const response = await axios.get(url, { withCredentials: true });

            if (response?.status === 200) {
              // console.log("Report Details:", response?.data);
              // console.log("Pictures:", response?.data.maintenanceIssue.pictures);


              // Extract and format date & time
              const MaintenanceReport = response?.data?.maintenanceIssue;
              const reportedAt = MaintenanceReport?.reportedAt;
              const activityType = MaintenanceReport?.maintenanceType;
              const severityLevel = MaintenanceReport?.severityLevel;
              const location = MaintenanceReport?.location;
              const subLocation = MaintenanceReport?.subLocation;
              const otherLocation = MaintenanceReport?.otherLocation;
              const Details = MaintenanceReport?.comment;
              const reportedTo = MaintenanceReport?.reportedTo;

              if (reportedAt) {
                setReportedDate(moment.utc(reportedAt).format("DD/MM/YYYY")); // Ensures UTC date
                setReportedTime(moment.utc(reportedAt).format("hh:mm A")); // Ensures UTC time
              }
              if (activityType?._id) {
                setSelectedValue(activityType._id);
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
              if (reportedTo) {
                setReportedTo(reportedTo);
              }
              if (MaintenanceReport?.pictures) {
                setImageUris(MaintenanceReport.pictures.map((pic: any) => ({
                  _id: pic._id,
                  url: pic.url
                })));
              }
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
        finally {
          setIsLoading(false); // Stop loader
        }
      };

      fetchData();
    }, [status, id]) // Re-run when status or id changes
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
      const url = `${SERVER_URL_ROASTERING}/get/location/site/wise/${siteId}`;

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
      fetchMaintenanceCategory();
      fetchLocation();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      if (location) {
        setSelectedValueLocation(location);
      }

      if (subLocation) {
        console.log("📌 Received SubLocation ID:", subLocation);

        setSelectedValueSubLocation(subLocation);

        if (subLocations.length > 0) {
          const matchedSubLocation = subLocations.find((sub: any) => sub.value === subLocation);

          if (matchedSubLocation) {
            setSubLocations((prev: any) => {
              const exists = prev.some((subloc: any) => subloc.value === subLocation);
              if (!exists) {
                return [...prev, { label: capitalizeFirstLetter(matchedSubLocation.label), value: subLocation }];
              }
              return prev;
            });
          } else {
            console.log("⚠️ SubLocation ID not found in list:", subLocation);
          }
        } else {
          console.log("⚠️ subLocations array is empty, cannot find SubLocation.");
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
      const selectedLoc = locations.find((loc: any) => loc.value === selectedValueLocation);
      console.log("selectedLoc:", selectedLoc);

      if (selectedLoc?.subLocations) {
        const formattedSubLocations = selectedLoc.subLocations.map((sub: any) => ({
          label: capitalizeFirstLetter(sub.name),
          value: sub._id,
        }));
        setSubLocations(formattedSubLocations);

        if (selectedValueSubLocation) {
          const isSubLocationValid = formattedSubLocations.some((sub: any) => sub.value === selectedValueSubLocation);
          if (!isSubLocationValid) {
            setSelectedValueSubLocation(""); // Reset if not found
          }
        }
      }
    }
  }, [selectedValueLocation, locations]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchMaintenanceCategory().then(() => {
      setIsRefreshing(false);
    });
  }, [fetchMaintenanceCategory]);

  // useEffect(() => {
  //   const socket = io(SERVER_URL);

  //   socket.on('connect', () => {
  //     console.log('Socket.io connection opened');
  //   });

  //   socket.on('checkin', data => {
  //     if (data) {
  //       fetchAllClients();
  //     }
  //   });

  //   socket.on('checkout', data => {
  //     if (data) {
  //       fetchAllClients();
  //     }
  //   });

  //   socket.on('disconnect', () => {
  //     console.log('Socket.io connection closed');
  //   });

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

  function capitalizeAllLetter(string: string) {
    if (!string) return ""; // Handle empty or undefined strings
    return string.toUpperCase();
  }

  const handleChangeMaintenanceCategory = async (
    value: string,
    severityLevel: string
  ) => {
    if (value !== "") {
      setSelectedValue(value);
      setMaintenanceCategoryError(value.trim() === "");
      setSeverityLevel(severityLevel);
      setPriorityError(severityLevel.trim() === "");
      // fetchMaintenanceType(value);
    } else {
      setMaintenanceTypes([]);
    }
  };

  const handleChangeMaintenanceType = async (
    value: string,
    severityLevel: string
  ) => {
    if (value !== "") {
      setSelectedValueType(value);
      setSeverityLevel(severityLevel);
    }
  };

  const handleReset = () => {
    setSelectedValue("");
    setSeverityLevel("");
    setMaintenanceTypes([]);
  };

  const handleResetPriority = () => {
    setSeverityLevel("");
    // setActivityTypes([]);
  };

  const handleResetMaintenanceType = () => {
    setSelectedValueType("");
  };

  const handleResetLocation = () => {
    setSelectedValueLocation("");
    setSubLocations([]);
  };


  const handleSubmit = async (isDraft: boolean) => {
    try {
      let isValid = true;
      // Always validate these fields (common for both draft and submit)
      if (reportedDate.trim() === "") {
        setDateError(true);
        isValid = false;
      } else {
        setDateError(false);
      }
      if (reportedTime.trim() === "") {
        setTimeError(true);
        isValid = false;
      } else {
        setTimeError(false);
      }
      if (selectedValue.trim() === "") {
        setMaintenanceCategoryError(true);
        isValid = false;
      } else {
        setMaintenanceCategoryError(false);
      }
      if (severityLevel.trim() === "") {
        setPriorityError(true);
        isValid = false;
      } else {
        setPriorityError(false);
      }
      // If submitting, validate additional fields
      if (!isDraft) {
        if (selectedValueLocation.trim() === "") {
          setLocationError(true);
          isValid = false;
        } else {
          setLocationError(false);
        }
        if (description.trim() === "") {
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
      }
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
            ? `${SERVER_URL_ROASTERING}/update/user/maintenance/issue/${id}`
            : `${SERVER_URL_ROASTERING}/create/user/maintenance/issue`;
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
        formData.append("maintenanceType", selectedValue);
        // if (selectedValueType !== '') {
        //   formData.append('subMaintenanceType', selectedValueType);
        // }
        formData.append("severityLevel", severityLevel);
        // if (!isDraft || status === "draft") {
        //   if (selectedValueLocation !== "other") {
        //     formData.append("location", selectedValueLocation || ""); // Ensure it is appended even if null/undefined
        //     if (selectedValueSubLocation !== "") {
        //       formData.append("subLocation", selectedValueSubLocation || "");
        //     }
        //   }
        //   formData.append("otherLocation", otherLocation || "");
        //   formData.append("comment", description || "");
        // }
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
          formData.append("comment", description);
        }
        if (status === "draft") {
          formData.append("removeLocation", selectedValueLocation ? false : true);
          formData.append("removeSubLocation", selectedValueSubLocation ? false : true)
        }
        if (reportedTo !== "") {
          formData.append("reportedTo", reportedTo);
        }
        formData.append("reportedAt", formattedReportedDate);
        formData.append("users[0]", userId);
        formData.append("position", shift.positionId._id);
        formData.append("draft", isDraft);
        if (status === "draft") {
          // console.log("removedImages", removedImages);
          // console.log("imageUris", imageUris);
          if (removedImages.length > 0) {
            removedImages.forEach((imageId, index) => {
              formData.append(`removePictures[${index}]`, imageId);
            });
          }
        }
        // if (imageUris.length > 0) {
        //   const createImageFiles = (uris: any) => {
        //     return uris.map((uri: any, index: number) => {
        //       return {
        //         uri: uri,
        //         name: `image_${index}.png`, // Generate a unique name for each image
        //         type: "image/png", // Assuming PNG format; adjust if needed
        //       };
        //     });
        //   };
        //   const imageFiles = createImageFiles(imageUris);
        //   imageFiles.forEach((file: any) => {
        //     formData.append("pictures", {
        //       uri: file.uri,
        //       name: file.name,
        //       type: file.type,
        //     });
        //   });
        // }
        // Only send newly selected images from the device
        const newImages = imageUris.filter(img => !img._id); // Ignore API images
        newImages.forEach((img, index) => {
          formData.append("pictures", {
            uri: img.url,
            name: `image_${index}.png`,
            type: "image/png",
          });
        });
        console.log('Form Data==>', formData);
        // Save the base64 string as an image file if signatureUri exists
        // let signaturePath = '';
        // if (signatureUri) {
        //   signaturePath =
        //     Platform.OS === 'android'
        //       ? `${RNFS.DocumentDirectoryPath}/signature.png`
        //       : `${RNFS.TemporaryDirectoryPath}/signature.png`;
        //   await RNFS.writeFile(signaturePath, signatureUri, 'base64');
        //   // Append the signature image file to the FormData
        //   formData.append('signature', {
        //     uri: `file://${signaturePath}`, // Ensure the correct URI format for iOS
        //     name: 'signature.png',
        //     type: 'image/png',
        //   });
        // }
        const response = await axios({
          method: status === "draft" ? "PUT" : "POST",
          url: apiUrl,
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        });
        console.log('response', response?.data);
        if (response?.data && response?.data?.success === true) {
          setReportDetails(response?.data?.reportDetails);
          // Toast.show(response?.data?.message, Toast.SHORT);
          setIsLoading(false);
          setDescription("");
          setOtherLocation("");
          setImageUris([]);
          setSignatureUri(null);
          setSelectedValue("");
          setMaintenanceTypes([]);
          setSelectedValueType("");
          setSelectedValueLocation("");
          setSelectedValueSubLocation("");
          setSeverityLevel("");
          setReportedDate(dayjs().format("DD/MM/YYYY"));
          setReportedTime(dayjs().format("h:mm A"));
          setIsSignatureSaved(false);
          if (isDraft === true) {
            navigation.navigate("UserHome");
          } else {
            openModal();
          }
        } else {
          Toast.show(response?.data?.message, Toast.SHORT);
        }
      }
    } catch (error) {
      Toast.show(error?.response?.data?.message, Toast.SHORT);
      throw error;
    }
  };

  // const handleSubmit = async (isDraft: boolean) => {
  //   try {
  //     let isValid = true;

  //     // Always validate these fields (common for both draft and submit)
  //     if (reportedDate.trim() === "") {
  //       setDateError(true);
  //       isValid = false;
  //     } else {
  //       setDateError(false);
  //     }

  //     if (reportedTime.trim() === "") {
  //       setTimeError(true);
  //       isValid = false;
  //     } else {
  //       setTimeError(false);
  //     }

  //     if (selectedValue.trim() === "") {
  //       setMaintenanceCategoryError(true);
  //       isValid = false;
  //     } else {
  //       setMaintenanceCategoryError(false);
  //     }
  //     if (severityLevel.trim() === "") {
  //       setPriorityError(true);
  //       isValid = false;
  //     } else {
  //       setPriorityError(false);
  //     }
  //     // If submitting, validate additional fields
  //     if (!isDraft) {
  //       if (selectedValueLocation.trim() === "") {
  //         setLocationError(true);
  //         isValid = false;
  //       } else {
  //         setLocationError(false);
  //       }

  //       if (description.trim() === "") {
  //         setDescriptionError(true);
  //         isValid = false;
  //       } else {
  //         setDescriptionError(false);
  //       }

  //       if (selectedValueLocation === "other" && otherLocation.trim() === "") {
  //         setOtherLocationError(true);
  //         isValid = false;
  //       } else {
  //         setOtherLocationError(false);
  //       }
  //     }
  //     if (
  //       isValid
  //       // && reportedDate &&
  //       // reportedTime &&
  //       // selectedValue &&
  //       // selectedValueLocation &&
  //       // description
  //     ) {
  //       setIsLoading(true);
  //       const apiUrl =
  //         status === "draft"
  //           ? `${SERVER_URL_ROASTERING}/update/user/maintenance/issue/${id}`
  //           : `${SERVER_URL_ROASTERING}/create/user/maintenance/issue`;

  //       const siteId = await AsyncStorage.getItem("siteId");
  //       const userId = await AsyncStorage.getItem("userId");
  //       const positionId = await AsyncStorage.getItem("positionId");

  //       const combinedDateTime = moment(
  //         `${reportedDate} ${reportedTime}`,
  //         "DD/MM/YYYY hh:mm A"
  //       ).toISOString();

  //       let formattedReportedDate = null;
  //       if (combinedDateTime) {
  //         const dates = new Date(combinedDateTime);

  //         formattedReportedDate = new Date(
  //           dates.getTime() - dates.getTimezoneOffset() * 60000
  //         )
  //           .toISOString()
  //           .replace("Z", "912Z");

  //         // console.log(formattedReportedDate);
  //       } else {
  //         console.error(
  //           "Invalid date or time:",
  //           `${reportedDate} ${reportedTime}`
  //         );
  //       }

  //       const formData = new FormData();
  //       formData.append("site", shift.siteId._id);
  //       formData.append("maintenanceType", selectedValue);
  //       // if (selectedValueType !== '') {
  //       //   formData.append('subMaintenanceType', selectedValueType);
  //       // }
  //       formData.append("severityLevel", severityLevel);
  //       // if (selectedValueLocation !== "other") {
  //       //   formData.append("location", selectedValueLocation);
  //       //   if (selectedValueSubLocation !== "") {
  //       //     formData.append("subLocation", selectedValueSubLocation);
  //       //   }
  //       // }
  //       // // formData.append('location', selectedValueLocation);
  //       // formData.append("otherLocation", otherLocation);
  //       // formData.append("comment", description);
  //       if (!isDraft || status === "draft") {
  //         if (selectedValueLocation !== "other") {
  //           formData.append("location", selectedValueLocation || ""); // Ensure it is appended even if null/undefined
  //           if (selectedValueSubLocation !== "") {
  //             formData.append("subLocation", selectedValueSubLocation || "");
  //           }
  //         }
  //         formData.append("otherLocation", otherLocation || "");
  //         formData.append("comment", description || "");
  //       }
  //       if (status === "draft") {
  //         if (selectedValueLocation) {
  //           formData.append("removeLocation", selectedValueLocation ? false : true);
  //         }
  //         if (selectedValueSubLocation) {
  //           formData.append("removeSubLocation", selectedValueSubLocation ? false : true)
  //         }
  //       }

  //       if (reportedTo !== "") {
  //         formData.append("reportedTo", reportedTo);
  //       }
  //       formData.append("reportedAt", formattedReportedDate);
  //       formData.append("users[0]", userId);
  //       formData.append("position", shift.positionId._id);
  //       formData.append("draft", isDraft);
  //       if (status === "draft") {
  //         // console.log("removedImages", removedImages);
  //         // console.log("imageUris", imageUris);

  //         if (removedImages.length > 0) {
  //           removedImages.forEach((imageId, index) => {
  //             formData.append(`removePictures[${index}]`, imageId);
  //           });
  //         }
  //       }

  //       // if (imageUris.length > 0) {
  //       //   const createImageFiles = (uris: any) => {
  //       //     return uris.map((uri: any, index: number) => {
  //       //       return {
  //       //         uri: uri,
  //       //         name: `image_${index}.png`, // Generate a unique name for each image
  //       //         type: "image/png", // Assuming PNG format; adjust if needed
  //       //       };
  //       //     });
  //       //   };
  //       //   const imageFiles = createImageFiles(imageUris);
  //       //   imageFiles.forEach((file: any) => {
  //       //     formData.append("pictures", {
  //       //       uri: file.uri,
  //       //       name: file.name,
  //       //       type: file.type,
  //       //     });
  //       //   });
  //       // }
  //       // Only send newly selected images from the device
  //       const newImages = imageUris.filter(img => !img._id); // Ignore API images

  //       newImages.forEach((img, index) => {
  //         formData.append("pictures", {
  //           uri: img.url,
  //           name: `image_${index}.png`,
  //           type: "image/png",
  //         });
  //       });
  //       console.log('newImages -------------------- ', newImages);

  //       console.log('Form Data==>', formData);

  //       const picturesEntry = formData._parts.find(([key]) => key === "pictures");

  //       if (picturesEntry) {
  //         console.log('Pictures Data==>', picturesEntry[1]); // This will log the pictures array or object inside
  //       } else {
  //         console.log('No pictures found in FormData');
  //       }

  //       // Save the base64 string as an image file if signatureUri exists
  //       // let signaturePath = '';
  //       // if (signatureUri) {
  //       //   signaturePath =
  //       //     Platform.OS === 'android'
  //       //       ? `${RNFS.DocumentDirectoryPath}/signature.png`
  //       //       : `${RNFS.TemporaryDirectoryPath}/signature.png`;

  //       //   await RNFS.writeFile(signaturePath, signatureUri, 'base64');

  //       //   // Append the signature image file to the FormData
  //       //   formData.append('signature', {
  //       //     uri: `file://${signaturePath}`, // Ensure the correct URI format for iOS
  //       //     name: 'signature.png',
  //       //     type: 'image/png',
  //       //   });
  //       // }

  //       const response = await axios({
  //         method: status === "draft" ? "PUT" : "POST",
  //         url: apiUrl,
  //         data: formData,
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //         withCredentials: true,
  //       });
  //       console.log('response', response?.data);

  //       if (response?.data && response?.data?.success === true) {
  //         setReportDetails(response?.data?.reportDetails);
  //         // Toast.show(response?.data?.message, Toast.SHORT);
  //         setIsLoading(false);
  //         setDescription("");
  //         setOtherLocation("");
  //         setImageUris([]);
  //         setSignatureUri(null);
  //         setSelectedValue("");
  //         setMaintenanceTypes([]);
  //         setSelectedValueType("");
  //         setSelectedValueLocation("");
  //         setSelectedValueSubLocation("");
  //         setSeverityLevel("");
  //         setReportedDate(dayjs().format("DD/MM/YYYY"));
  //         setReportedTime(dayjs().format("h:mm A"));
  //         setIsSignatureSaved(false);

  //         if (isDraft === true) {
  //           navigation.navigate("UserHome");
  //         } else {
  //           openModal();
  //         }
  //       } else {
  //         Toast.show(response?.data?.message, Toast.SHORT);
  //       }
  //     }
  //   } catch (error) {
  //     Toast.show(error?.response?.data?.message, Toast.SHORT);
  //     throw error;
  //   }
  // };

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
                  onPress={() => navigation.navigate('UserHome' as never)}>
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
                    Maintenance Issue
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
                        // is24Hour={false}
                        // locale="en_GB"
                        />
                      </>
                    )}
                  </View>
                  <View style={styles.inputGroup}>
                    {/* <Text style={styles.label}>
                      Category <Text style={styles.required}>*</Text>
                    </Text> */}
                    <CustomBottomSheet
                      label={
                        <Text>
                          Maintenance Category{" "}
                          <Text style={styles.required}>*</Text>
                        </Text>
                      }
                      labelBottomsheet="Maintenance Category"
                      items={maintenanceCategories}
                      searchText={"Search for Maintenance Category..."}
                      isRequired={true}
                      onValueChange={(value) => {
                        const selectedItem = maintenanceCategories.find(
                          (item: any) => item.value === value
                        );
                        if (selectedItem) {
                          handleChangeMaintenanceCategory(
                            value,
                            selectedItem.severityLevel
                          );
                        } else {
                          setMaintenanceTypes([]);
                        }
                      }}
                      selectedValue={selectedValue}
                      handleReset={handleReset}
                      searchQuery={searchQuery}
                      onSearchQueryChange={handleSearchQueryChange}
                    />
                    {maintenanceCategoryError && (
                      <HelperText
                        type="error"
                        visible={maintenanceCategoryError}
                      >
                        Maintenance Category is required.
                      </HelperText>
                    )}
                  </View>
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

                  {/* {maintenanceTypes.length > 0 && (
              <View style={styles.inputGroup}>
                <CustomDialogPicker
                  label="Maintenance Type"
                  items={maintenanceTypes}
                  isRequired={false}
                  searchText={'Search for Maintenance Type...'}
                  onValueChange={value => {
                    const selectedItem = maintenanceTypes.find(
                      (item: any) => item.value === value,
                    );
                    if (selectedItem) {
                      handleChangeMaintenanceType(
                        value,
                        selectedItem.severityLevel,
                      );
                    }
                  }}
                  selectedValue={selectedValueType}
                  handleReset={handleResetMaintenanceType}
                  searchQuery={searchQueryType}
                  onSearchQueryChange={handleSearchQueryType}
                />
              </View>
            )} */}

                  <View style={styles.inputGroup}>
                    <CustomBottomSheet
                      label={
                        <Text>
                          Location <Text style={styles.required}>*</Text>
                        </Text>
                      }
                      labelBottomsheet="Location"
                      items={locations}
                      searchText={"Search for Location..."}
                      isRequired={true}
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

                  <CustomTextArea
                    label="Description"
                    placeholder="Enter Description"
                    value={description}
                    onChangeText={handleDescriptionChange}
                    // onBlur={() =>
                    //   setDescriptionError(description.trim() === "")
                    // }
                    isRequired={true}
                    error={descriptionError}
                  />

                  <CustomTextArea
                    label="Outcome"
                    placeholder="N/A"
                    value={reportedTo}
                    onChangeText={handleReportedTo}
                    // onBlur={() => setOutcomeError(outcome.trim() === '')} // if needed
                    isRequired={false} // if Outcome is optional
                  // error={outcomeError} // add an error state if needed
                  />
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

                  {/* <View style={styles.signatureContainer}>
              <Text style={styles.label}>Please sign below :</Text>
              {isSignatureSaved ? (
                <Image
                  source={{uri: `data:image/png;base64,${signatureUri}`}}
                  style={[{flex: 1}, styles.signatureImage]}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.signatureView}>
                  <SignatureCapture
                    style={[{flex: 1}, styles.signature]}
                    ref={signatureRef}
                    onSaveEvent={onSaveEvent}
                    saveImageFileInExtStorage={false}
                    showNativeButtons={false}
                    showTitleLabel={false}
                    minStrokeWidth={4}
                    maxStrokeWidth={4}
                    viewMode={'portrait'}
                  />
                </View>
              )}
              {isSignatureSaved ? (
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}>
                  <TouchableHighlight
                    style={styles.buttonStyle}
                    onPress={() => {
                      resetSign();
                    }}>
                    <Text style={{color: 'black'}}>Re-Sign</Text>
                  </TouchableHighlight>
                </View>
              ) : (
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}>
                  <TouchableHighlight
                    style={styles.buttonStyle}
                    onPress={() => {
                      saveSign();
                    }}>
                    <Text style={{color: 'black'}}>Save</Text>
                  </TouchableHighlight>
                  <TouchableHighlight
                    style={styles.buttonStyle}
                    onPress={() => {
                      resetSign();
                    }}>
                    <Text style={{color: 'black'}}>Clear</Text>
                  </TouchableHighlight>
                </View>
              )}
            </View> */}
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
                      activityType={ReportDetails?.maintenanceType?.name}
                      reportType="Maintenance"
                      location={ReportDetails?.location}
                      reportedAt={moment
                        .utc(ReportDetails?.reportedAt)
                        .format("YYYY-MM-DD HH:mm A")}
                      subActivityType={ReportDetails?.subMaintenanceType?.name}
                      onClose={closeModal}
                    />
                  </View>

                  <View style={{ top: 10, marginBottom: 10 }}>
                    <TouchableOpacity
                      style={[
                        styles.button,
                        { flex: 1, backgroundColor: "#50C878" },
                      ]}
                      onPress={() => handleSubmit(false)}
                    >
                      <Text style={[styles.btnText, { color: "#FFF" }]}>
                        SUBMIT
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.button,
                        { flex: 1, backgroundColor: "#FFB74A", marginTop: 10 },
                      ]}
                      onPress={() => handleSubmit(true)}
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

                  {/* <CustomBottomSheet
              sheetRef={sheetRef}
              onClose={handleCloseSheet}
              onOptionSelect={handleOptionSelect}
              options={options}
            /> */}
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
    height: 50,
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
});

export default MaintenanceReport;
