/* eslint-disable prettier/prettier */
/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  ScrollView,
  Animated,
  Easing,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { s as tw } from "react-native-wind";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootState } from "../store";
import SidebarUser from "../components/Sidebar/SidebarUser";
import FooterUser from "../components/Footer/FooterUser";
import Toast from "react-native-simple-toast";
import ImagePicker from "react-native-image-crop-picker";
import DocumentPicker from "react-native-document-picker";
import { PERMISSIONS, check, RESULTS, request } from "react-native-permissions";
import axios from "axios";
import { SERVER_URL_ROASTERING } from "../Constant";
import FeatherIcon from "react-native-vector-icons/Feather";
import Icon from "react-native-vector-icons/FontAwesome";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Entypo from "react-native-vector-icons/Entypo";
import { globalStyles } from "../styles";
import { launchImageLibrary } from "react-native-image-picker";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";

const windowWidth = Dimensions.get("window").width;

const ProfileDetailsUser = () => {
  const navigation = useNavigation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeIcon, setActiveIcon] = useState<number>(null);
  const [loadingImage, setLoadingImage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [overlayVisible, setOverlayVisible] = useState(false);
  const [profileImage, setProfileImage] = useState<any>(null);
  const [data, setData] = useState<any>([]);
  const [image, setImage] = useState(null);

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["35%"], []);

  const windowWidth = Dimensions.get("window").width;

  const toggleOverlay = () => {
    setOverlayVisible(!overlayVisible);
  };
  // Open Bottom Sheet
  const openBottomSheet = () => {
    bottomSheetRef.current?.present();
  };

  // Close Bottom Sheet
  const closeBottomSheet = () => {
    bottomSheetRef.current?.dismiss();
  };
  const renderBackdrop = useCallback(
    (props:any) => (
      <BottomSheetBackdrop {...props} opacity={0.7} disappearsOnIndex={-1} />
    ),
    []
  );
  const [sidebarTranslateX] = useState(new Animated.Value(-windowWidth * 0.7));

  function capitalizeFirstLetter(string: string): string {
    if (!string || typeof string !== "string") return ""; // Handle empty, undefined, or non-string values

    return string
      .split(" ") // Split the string into words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
      .join(" "); // Join the words back together with a space
  }


  const handleImagePicker = async () => {
    try {
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

      const image = await ImagePicker.openCamera({
        cropping: false,
        includeBase64: false,
        compressImageQuality: 0.5,
      });

      if (image && image.path) {
        setProfileImage(image.path);
        await updateProfileImageGallery(image.path); // Upload image
        closeBottomSheet();
      }
    } catch (error) {
      console.log("ImagePicker Error:", error);
    }
  };

  const handleRemovePicture = async () => {
    try {
      await removeProfileImage();
      closeBottomSheet();
    } catch (error) {
      console.error("Error removing picture:", error);
    }
  };

  const removeProfileImage = async () => {
    try {
      setLoadingImage(true);
      const response = await axios.put(
        `${SERVER_URL_ROASTERING}/upload/user/photo/${data?._id}`,
        { isRemove: true },
        { withCredentials: true }
      );
      console.log("Success:", response.data);
      Toast.show("Profile Remove Successfully!", Toast.SHORT);
      fetchData();
    } catch (error) {
      console.error("Request failed:", error);
    } finally {
      setLoadingImage(false);
    }
  };

  // const removeProfileImage = async () => {
  //   setLoadingImage(true);
  //   const formData = new FormData();

  //   formData.append('isRemove', true);

  //   await axios
  //     .put(
  //       `${SERVER_URL_ROASTERING}/upload/user/photo/${data?._id}`,
  //       formData,
  //       {
  //         withCredentials: true,
  //       },
  //     )
  //     .then(res => {
  //       Toast.show('Profile Remove Successfully!', Toast.SHORT);
  //       fetchData();
  //     });

  //   setLoadingImage(false);
  // };

  const openGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: "photo", // You can choose between 'photo', 'video', or 'mixed'
      });

      if (result && result.assets && result.assets[0].uri) {
        await updateProfileImageGallery(result.assets[0].uri); // Upload image
        closeBottomSheet(); // Update the gallery with the selected image URI
      }
    } catch (error) {
      console.log("Error opening gallery:", error);
    }
  };

  const updateProfileImageGallery = async (imagePath: any) => {
    try {
      setLoadingImage(true);
      const formData = new FormData();
      const imageFile = {
        uri: imagePath,
        name: "image.png",
        type: "image/png",
      };
      formData.append("document", imageFile);

      console.log("formData====>", formData);

      await axios
        .put(
          `${SERVER_URL_ROASTERING}/upload/user/photo/${data?._id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data", // This should be set automatically by FormData
            },
            withCredentials: true,
          }
        )
        .then((res) => {
          console.log("res===>", res);
          fetchData();
        });

      setLoadingImage(false);
    } catch (error) {
      Toast.show("Image size must be less than or equal to 2MB!", Toast.LONG);
      setLoadingImage(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${SERVER_URL_ROASTERING}/me`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        const data = response.data;
        setData(data.user);
        setImage(data.user.profilePhoto);
        setLoading(false);
      } else {
        console.error(
          "API request failed:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  const handleCall = async (mobileNumber: number) => {
    try {
      const url = `tel:${mobileNumber}`;
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log("Phone call not supported");
      }
    } catch (error) {
      console.error("Error opening phone call:", error);
    }
  };

  const handleMail = async (email: any) => {
    try {
      const url = `mailto:${email}`;
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log("Mail not supported");
      }
    } catch (error) {
      console.error("Error opening email:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData().then(() => {
      setIsRefreshing(false);
    });
  }, [fetchData]);

  return (
    <BottomSheetModalProvider>
      <SafeAreaView style={tw`flex-1`}>
        {/* <View style={styles.container}> */}
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.overlayContainer}>
            <View style={globalStyles.overlayImageGlobal}>
              <View style={styles.logoContainer}>
                <Image
                  source={require("../assets/images/awp_logo.png")}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <TouchableOpacity
                  style={globalStyles.backArrow}
                  onPress={() => navigation.goBack()}
                >
                  <FeatherIcon
                    name="chevron-left"
                    size={26}
                    color="#FFFFFF"
                    style={globalStyles.menuIcon}
                  />
                </TouchableOpacity>
              </View>

              <View style={globalStyles.whiteBox}>
                <View style={styles.profileBlock}>
                  <View style={styles.profileImageWrapper}>
                    <Image
                      source={require("../assets/manager/profileImageBlock.png")}
                      resizeMode="contain"
                      style={styles.profileImageBlockContainer}
                    />
                    <View style={styles.profileImageContainer}>
                      {loadingImage ? (
                        <View
                          style={[
                            globalStyles.centeredView,
                            { flex: 0, top: 10 },
                          ]}
                        >
                          <View style={globalStyles.loaderCircle}>
                            <ActivityIndicator
                              size="large"
                              color="#3B4560"
                              style={globalStyles.loader}
                            />
                          </View>
                        </View>
                      ) : image ? (
                        <>
                          <View>
                            <Image
                              source={{
                                uri:
                                  image + `?timestamp=${new Date().getTime()}`,
                              }}
                              // resizeMode="contain"
                              style={styles.profileImage}
                            />
                            <TouchableOpacity
                              style={styles.cameraIcon}
                              onPress={openBottomSheet}
                            >
                              <Icon
                                name="camera"
                                type="font-awesome"
                                size={18}
                                color="#000"
                              />
                            </TouchableOpacity>
                          </View>
                        </>
                      ) : (
                        <View>
                          <View style={styles.initialsCircle}>
                            <Text style={styles.initialsText}>
                              {capitalizeFirstLetter(
                                data?.firstName?.charAt(0)
                              ) +
                                capitalizeFirstLetter(
                                  data?.lastName?.charAt(0)
                                )}
                            </Text>
                          </View>

                          <TouchableOpacity
                            style={styles.cameraIcon}
                            onPress={openBottomSheet}
                          >
                            <Icon
                              name="camera"
                              type="font-awesome"
                              size={18}
                              color="#000"
                            />
                          </TouchableOpacity>
                        </View>
                      )}
                      <TouchableOpacity onPress={openBottomSheet}>
                        <Text style={styles.changeText}>
                          Change Profile Photo
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.personalInfocontainer}>
                    <View style={styles.header}>
                      <Text style={styles.headerText}>
                        Personal Information
                      </Text>
                    </View>
                    {loading ? (
                      <ActivityIndicator
                        size="large"
                        color="#3C4764"
                        style={{ padding: 10 }}
                      />
                    ) : (
                      <View style={styles.content}>
                        {(data?.firstName ||
                          data?.lastName ||
                          data?.employeeId ||
                          data?.email ||
                          data?.gender ||
                          data?.jobTitle?.name ||
                          data?.mobileNumber ||
                          data?.othermobileNumber ||
                          data?.address ||
                          data?.addressLine ||
                          data?.city ||
                          data?.state ||
                          data?.zipCode) && (
                            <View>
                              {/* Name */}
                              {(data?.firstName || data?.lastName) && (
                                <View style={styles.row}>
                                  <FontAwesome5
                                    name="user-alt"
                                    size={20}
                                    color="black"
                                    style={styles.icon}
                                  />
                                  <Text style={styles.text}>
                                    {data?.firstName &&
                                      capitalizeFirstLetter(data?.firstName)}
                                    {data?.firstName && data?.lastName ? " " : ""}
                                    {data?.lastName &&
                                      capitalizeFirstLetter(data?.lastName)}
                                    {data?.employeeId && (
                                      <Text style={{ fontWeight: "bold" }}>
                                        {" "}
                                        (#{data.employeeId})
                                      </Text>
                                    )}
                                  </Text>
                                </View>
                              )}

                              {/* Email */}
                              {data?.email && (
                                <TouchableOpacity
                                  style={styles.row}
                                  onPress={() => handleMail(data?.email)}
                                >
                                  <MaterialIcons
                                    name="email"
                                    size={20}
                                    color="black"
                                    style={styles.icon}
                                  />
                                  <Text style={styles.text}>{data?.email}</Text>
                                </TouchableOpacity>
                              )}

                              {/* Gender */}
                              {data?.gender && (
                                <View style={styles.row}>
                                  <FontAwesome5
                                    name="male"
                                    size={25}
                                    color="black"
                                    style={styles.icon}
                                  />
                                  <Text style={styles.text}>{data?.gender}</Text>
                                </View>
                              )}

                              {/* Job Title */}
                              {data?.jobTitle?.name && (
                                <View style={styles.row}>
                                  <FontAwesome5
                                    name="user-tie"
                                    size={20}
                                    color="black"
                                    style={styles.icon}
                                  />
                                  <Text style={styles.text}>
                                    {capitalizeFirstLetter(data?.jobTitle?.name)}
                                  </Text>
                                </View>
                              )}

                              {/* Mobile Number */}
                              {(data?.mobileNumber ||
                                data?.othermobileNumber) && (
                                  <View style={styles.row}>
                                    {data?.mobileNumber && (
                                      <TouchableOpacity
                                        style={[styles.row]}
                                        onPress={() =>
                                          handleCall(data?.mobileNumber)
                                        }
                                      >
                                        <MaterialIcons
                                          name="phone"
                                          size={20}
                                          color="black"
                                          style={styles.icon}
                                        />
                                        <Text style={styles.text}>
                                          {data?.mobileNumber}
                                        </Text>
                                      </TouchableOpacity>
                                    )}
                                    {data?.othermobileNumber && (
                                      <TouchableOpacity
                                        style={[styles.row, { top: 5 }]}
                                        onPress={() =>
                                          handleCall(data?.othermobileNumber)
                                        }
                                      >
                                        <MaterialIcons
                                          name="phone"
                                          size={20}
                                          color="black"
                                          style={styles.icon}
                                        />
                                        <Text style={styles.text}>
                                          {data?.othermobileNumber}
                                        </Text>
                                      </TouchableOpacity>
                                    )}
                                  </View>
                                )}

                              {/* Address */}
                              {(data?.address ||
                                data?.addressLine ||
                                data?.city ||
                                data?.state ||
                                data?.zipCode) && (
                                  <View style={[styles.row, { bottom: 10 }]}>
                                    <Entypo
                                      name="location-pin"
                                      size={20}
                                      color="black"
                                      style={styles.icon}
                                    />
                                    <Text style={styles.text}>
                                      {data?.address && `${data?.address}`}
                                      {data?.address &&
                                        (data?.addressLine ||
                                          data?.city ||
                                          data?.state ||
                                          data?.zipCode)
                                        ? ", "
                                        : ""}
                                      {data?.addressLine && `${data?.addressLine}`}
                                      {data?.addressLine &&
                                        (data?.city || data?.state || data?.zipCode)
                                        ? ", "
                                        : ""}
                                      {data?.city && `${data?.city}`}
                                      {data?.city && (data?.state || data?.zipCode)
                                        ? ", "
                                        : ""}
                                      {data?.state && `${data?.state}`}
                                      {data?.state && data?.zipCode ? ", " : ""}
                                      {data?.zipCode && `${data?.zipCode}`}
                                    </Text>
                                  </View>
                                )}
                            </View>
                          )}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
        <FooterUser activeIcon={activeIcon} setActiveIcon={setActiveIcon} />

        {/* Bottom Sheet Modal */}
        <BottomSheetModal
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          backdropComponent={renderBackdrop}
          enablePanDownToClose={true}
          onDismiss={closeBottomSheet}
        >
          <View style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>Change Profile Picture</Text>
            <View style={styles.horizontalLine} />

            <TouchableOpacity onPress={openGallery}>
              <Text style={styles.sheetOption}>Import from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleImagePicker}>
              <Text style={styles.sheetOption}>Take a Picture</Text>
            </TouchableOpacity>

            {/* Show "Remove Picture" only if an image is uploaded */}
            {image && (
              <TouchableOpacity onPress={handleRemovePicture}>
                <Text style={styles.sheetOptionRemove}>
                  Remove Picture
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </BottomSheetModal>

        {/* {overlayVisible && (
        <>
          <TouchableOpacity
            style={styles.overlayImageContainer}
            onPress={toggleOverlay}>
            <Image
              source={require('../assets/manager/overlayProfile.png')}
              style={styles.overlayProfileImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <View style={styles.bottomOverlayImageContainer}>
            <Image
              source={require('../assets/images/homebottom.png')}
              style={[styles.bottomImage, { width: windowWidth * 1 }]}
              resizeMode="contain"
            />

            <View style={styles.overlayTextContainer}>
              <Text style={styles.overlayText}>Change Profile Picture</Text>
              <View style={styles.horizontalLine} />
              <TouchableOpacity
                onPress={() => {
                  openGallery();
                  toggleOverlay();
                }}>
                <Text style={styles.overlayTextFilter}>
                  Import from gallery
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  handleImagePicker();
                  toggleOverlay();
                }}>
                <Text style={styles.overlayTextFilter}>Take a picture</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleRemovePicture();
                  toggleOverlay(); // Close the overlay
                }}>
                <Text style={styles.overlayTextRemove}>Remove picture</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )} */}
        {/* </View> */}
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
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
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  overlayImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  bottomOverlayImageContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    width: windowWidth * 1,
  },
  bottomImage: {
    height: 363,
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
    position: "absolute",
    top: 70,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    width: "100%",
    height: 100,
    justifyContent: "space-between",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    marginRight: 30,
  },
  titleText: {
    fontSize: 26,
    fontWeight: "500",
    textAlign: "center",
    color: "#FFFFFF",
  },
  changeText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#3C4764",
    textAlign: "center",
    marginTop: 6,
    width: "100%",
    right: 30,
  },
  cameraIcon: {
    position: "absolute",
    top: 40,
    right: 0,
    marginTop: 60,
    backgroundColor: "#EFEFEF",
    borderRadius: 50,
    padding: 5,
  },
  changeProfile: {
    fontSize: 16,
    fontWeight: "500",
    color: "#3C4764",
  },
  backIconContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 10,
    width: 50,
    height: 50,
  },
  backIcon: {
    width: 25,
    height: 25,
  },
  menuIconContainer: {
    position: "absolute",
    right: 24,
    justifyContent: "center",
    alignItems: "center",
    width: 50,
    height: 50,
  },
  menuIcon: {
    width: 24,
    height: 24,
  },
  profileBlock: {
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  profileImageBlockContainer: {
    marginTop: 20,
    position: "relative",
    maxWidth: "97%",
    alignItems: "center",
    justifyContent: "center",
  },
  profileImageBlock: {
    width: 100,
    height: 100,
    position: "relative",
  },
  profileImageWrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  profileImageContainer: {
    position: "absolute",
    alignItems: "flex-start",
    justifyContent: "center",
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 75,
    marginTop: 50,
  },
  initialsCircle: {
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: "#262D3F",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  initialsText: {
    fontSize: 36,
    color: "white",
    fontWeight: "bold",
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
  overlayTextRemove: {
    marginTop: 20,
    fontSize: 16,
    marginHorizontal: 30,
    fontWeight: "400",
    color: "#D01E12",
  },
  horizontalLine: {
    borderBottomWidth: 1,
    borderColor: "#B6BED3",
    width: "100%",
    marginTop: 20,
  },
  changeprofilephoto: {
    display: "flex",
    justifyContent: "flex-start",
  },
  personalInfocontainer: {
    margin: 2,
    borderRadius: 10,
    backgroundColor: "#f0f4f8",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  header: {
    backgroundColor: "#3d3f5e",
    padding: 10,
  },
  headerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
  },
  text: {
    marginLeft: 10,
    fontSize: 16,
    color: "#3C4764",
    // flex: 1
  },
  icon: {
    width: 30,
  },
  sheetContent: {
    padding: 20,
    alignItems: "center",
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: '#000'
  },
  sheetOption: {
    fontSize: 16,
    paddingVertical: 10,
    color: "#007AFF",
  },
  sheetOptionRemove: {
    fontSize: 16,
    paddingVertical: 10,
    color: "red",
  },
});

export default ProfileDetailsUser;
