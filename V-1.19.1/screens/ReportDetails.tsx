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
  Dimensions,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Animated,
  Easing,
  RefreshControl,
} from "react-native";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { s as tw } from "react-native-wind";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import FooterUser from "../components/Footer/FooterUser";
import axios from "axios";
import { SERVER_URL, SERVER_URL_ROASTERING } from "../Constant";
import FeatherIcon from "react-native-vector-icons/Feather";
import dayjs from "dayjs";
import CustomText from "../components/CustomText";
import { globalStyles } from "../styles";
import moment from "moment";
import FastImage from "react-native-fast-image";
import { SafeAreaView } from "react-native";
import {
  NEXT_PUBLIC_ARMED_ID,
  NEXT_PUBLIC_BAG_CHECK_ID,
  NEXT_PUBLIC_DAMAGE_ID,
  NEXT_PUBLIC_SUSPICIOUS_ID,
  NEXT_PUBLIC_THEFT_ID,
} from "../Constant";

const windowWidth = Dimensions.get("window").width;

const ReportDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id, reportType } = route.params as {
    id: string;
    reportType: string;
  };

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeIcon, setActiveIcon] = useState<number>(null);
  const [loadingImage, setLoadingImage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [overlayVisible, setOverlayVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [data, setData] = useState<any>([]);
  const [image, setImage] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(dayjs());
  const [activeButton, setActiveButton] = useState(null);

  const [imageLoading, setImageLoading] = useState<{ [key: number]: boolean }>(
    {}
  );

  const windowWidth = Dimensions.get("window").width;

  const bagCheckId = NEXT_PUBLIC_BAG_CHECK_ID;
  const theftId = NEXT_PUBLIC_THEFT_ID;
  const armedId = NEXT_PUBLIC_ARMED_ID;
  const damageId = NEXT_PUBLIC_DAMAGE_ID;
  const suspiciousId = NEXT_PUBLIC_SUSPICIOUS_ID;

  const toggleOverlay = () => {
    setOverlayVisible(!overlayVisible);
  };

  const [sidebarTranslateX] = useState(new Animated.Value(-windowWidth * 0.7));

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

  console.log("data ---------- data ------------- ", data);
  console.log("frustrationStressImpatience", data?.frustrationStressImpatience);
  console.log(
    "frustrationStressImpatience",
    JSON.stringify(data?.frustrationStressImpatience, null, 2)
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

  // const toggleSidebar = () => {
  //   setIsSidebarOpen(!isSidebarOpen);
  // };

  // week function

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

  const fetchReportDetails = useCallback(async () => {
    try {
      setLoading(true);
      let url = "";
      if (reportType === "siteActivityLog") {
        url = `${SERVER_URL_ROASTERING}/get/site/activity/log/${id}`;
      } else if (reportType === "securityIncident") {
        url = `${SERVER_URL_ROASTERING}/get/security/incident/report/${id}`;
      } else if (reportType === "endOfShift") {
        url = `${SERVER_URL_ROASTERING}/get/end/of/shift/report/${id}`;
      } else {
        url = `${SERVER_URL_ROASTERING}/get/maintenance/issue/${id}`;
      }

      const response = await axios.get(url, {
        withCredentials: true,
      });
      if (response?.status === 200) {
        console.log("Report Details:", response?.data);

        setData(
          reportType === "siteActivityLog"
            ? response?.data?.siteActivityLog
            : reportType === "securityIncident"
              ? response?.data?.securityIncident
              : reportType === "endOfShift"
                ? response?.data?.endOfShift
                : response?.data?.maintenanceIssue || []
        );

        if (data?.pictures) {
          // Initialize loading state based on the number of pictures
          setLoading(data?.pictures.map(() => true));
        }
      }
    } catch (error) {
      console.error("Error fetching shifts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLoadEnd = (index) => {
    setImageLoading((prev) => ({
      ...prev,
      [index]: false, // Set to false when the image has loaded
    }));
  };
  const handleLoadStart = (index) => {
    setImageLoading((prev) => ({
      ...prev,
      [index]: true, // Set to true when the image starts loading
    }));
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.imageContainer}>
      {imageLoading[index] && (
        <ActivityIndicator
          style={globalStyles.imageLoader}
          size="large"
          color="#D01E12"
        />
      )}
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("FileViewer", {
            uri: item?.url,
            type: "image",
          })
        }
      >
        <FastImage
          style={styles.image}
          source={{
            uri: item?.url,
            // priority: FastImage.priority.high,
          }}
          resizeMode={FastImage.resizeMode.contain}
          onLoadStart={() => handleLoadStart(index)}
          onLoadEnd={() => handleLoadEnd(index)}
        />
      </TouchableOpacity>
    </View>
  );

  useFocusEffect(
    useCallback(() => {
      fetchReportDetails();
    }, [fetchReportDetails])
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchReportDetails().then(() => {
      setIsRefreshing(false);
    });
  }, [fetchReportDetails]);

  const openMaps = () => {
    const address = encodeURIComponent(
      "123 Eagle Street, Melbourne, Victoria, Australia"
    );
    const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
    Linking.openURL(url);
  };

  const screenHeight = Dimensions.get("window").height;

  return (
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
                  {reportType === "siteActivityLog"
                    ? "Activity Log Report Details"
                    : reportType === "securityIncident"
                      ? "Security Incident Report Details"
                      : reportType === "endOfShift"
                        ? "Atmospherics Report Details"
                        : "Maintenance Report Details"}
                </CustomText>
              </View>
            </View>
            {/* 
        <View style={styles.whiteBackground}>
          <View style={styles.whiteMargin}> */}
            {loading ? (
              <View style={[globalStyles.centeredView, { flex: 0, top: 10 }]}>
                <View style={globalStyles.loaderCircle}>
                  <ActivityIndicator
                    size="large"
                    color="#3B4560"
                    style={globalStyles.loader}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.personalInfocontainer}>
                <View style={styles.content}>
                  <View style={globalStyles.headerContainer}>
                    <Text style={globalStyles.headerText}>
                      {capitalizeFirstLetter(
                        reportType === "siteActivityLog"
                          ? data?.activityType?.name
                          : reportType === "securityIncident"
                            ? data?.incidentCategory?.name
                            : data?.maintenanceType?.name
                      )}
                    </Text>
                  </View>
                  <View style={globalStyles.table}>
                    <View style={[globalStyles.tablerow, {}]}>
                      <Text style={globalStyles.labelColumn}>Report ID </Text>
                      <Text style={globalStyles.valueColumn}>
                        {data?.activityNumber}
                      </Text>
                    </View>

                    <View style={[globalStyles.tablerow]}>
                      <Text style={globalStyles.labelColumn}>Site Name </Text>
                      <Text style={globalStyles.valueColumn}>
                        {capitalizeFirstLetter(data?.site?.siteName)}
                      </Text>
                    </View>

                    {data?.position?.postName && (
                      <View style={[globalStyles.tablerow, {}]}>
                        <Text style={globalStyles.labelColumn}>Position </Text>
                        <Text style={globalStyles.valueColumn}>
                          {capitalizeFirstLetter(data?.position?.postName)}
                        </Text>
                      </View>
                    )}

                    {reportType !== "endOfShift" && (
                      <View style={[globalStyles.tablerow]}>
                        <Text style={globalStyles.labelColumn}>Category </Text>
                        <Text style={globalStyles.valueColumn}>
                          {capitalizeFirstLetter(
                            reportType === "siteActivityLog"
                              ? data?.activityType?.name
                              : reportType === "securityIncident"
                                ? data?.incidentCategory?.name
                                : data?.maintenanceType?.name
                          )}
                        </Text>
                      </View>
                    )}

                    {/* <View style={[globalStyles.tablerow]}>
                      <Text style={globalStyles.labelColumn}>Category </Text>
                      <Text style={globalStyles.valueColumn}>
                        {capitalizeFirstLetter(
                          reportType === "siteActivityLog"
                            ? data?.activityType?.name
                            : reportType === "securityIncident"
                            ? data?.incidentCategory?.name
                            : data?.maintenanceType?.name
                        )}
                      </Text>
                    </View> */}

                    {reportType !== "endOfShift" && (
                      <View style={[globalStyles.tablerow, {}]}>
                        <Text style={globalStyles.labelColumn}>Priority </Text>
                        <Text style={globalStyles.valueColumn}>
                          {capitalizeFirstLetter(
                            reportType === "siteActivityLog"
                              ? data?.activityType?.severityLevel
                              : reportType === "securityIncident"
                                ? data?.severityLevel
                                : data?.maintenanceType?.severityLevel
                          )}
                        </Text>
                      </View>
                    )}

                    {reportType === "endOfShift" && (
                      <>
                        {data?.summaryOfIncident && (
                          <>
                            <View style={[globalStyles.tablerow, {}]}>
                              <Text style={globalStyles.labelColumn}>
                                Summary Of Incident{" "}
                              </Text>
                              <Text style={globalStyles.valueColumn}>
                                {capitalizeFirstLetter(data?.summaryOfIncident)}
                              </Text>
                            </View>
                          </>
                        )}
                        <View style={[globalStyles.tablerow, {}]}>
                          <Text style={globalStyles.labelColumn}>
                            Shift Date & Time{" "}
                          </Text>
                          <Text style={globalStyles.valueColumn}>
                            {moment
                              .utc(data?.shiftStartDateTime)
                              .format("DD/MM/YYYY, HH:mm")}{" "}
                            -{" "}
                            {moment.utc(data?.shiftEndDateTime).format("HH:mm")}
                          </Text>
                        </View>
                        {(data?.frustrationStressImpatience?.one ||
                          data?.frustrationStressImpatience?.twoPlus) && (
                            <View style={[globalStyles.tablerow]}>
                              <Text style={globalStyles.labelColumn}>
                                Frustration / Stress / Impatience
                              </Text>
                              <Text style={globalStyles.valueColumn}>
                                <Text style={{ fontWeight: "bold" }}>
                                  {data?.frustrationStressImpatience?.twoPlus
                                    ? "2+ Incidents Occurred"
                                    : "1 Incident Occurred"}
                                </Text>
                                {"\n"}
                                {"\n"}
                                <Text style={{ fontWeight: "bold" }}>
                                  Frustration / Stress / Impatience - Directed
                                  Towards:
                                </Text>{" "}
                                {data?.frustrationStressImpatience?.twoPlus
                                  ? data?.frustrationStressImpatience?.twoPlusIncidents?.directedToWards
                                    ?.map((item: any) => item.lableValue)
                                    .join(", ")
                                  : data?.frustrationStressImpatience?.oneIncidents?.directedToWards
                                    ?.map((item: any) => item.lableValue)
                                    .join(", ")}
                              </Text>
                            </View>
                          )}

                        {(data?.shouting?.one || data?.shouting?.twoPlus) && (
                          <View style={[globalStyles.tablerow]}>
                            <Text style={globalStyles.labelColumn}>
                              Shouting
                            </Text>
                            <Text style={globalStyles.valueColumn}>
                              <Text style={{ fontWeight: "bold" }}>
                                {data?.shouting?.twoPlus
                                  ? "2+ Incidents Occurred"
                                  : "1 Incident Occurred"}
                              </Text>
                              {"\n"}
                              {"\n"}
                              <Text style={{ fontWeight: "bold" }}>
                                Shouting - Directed Towards:
                              </Text>{" "}
                              {data?.shouting?.twoPlus
                                ? data?.shouting?.twoPlusIncidents?.directedToWards
                                  ?.map((item: any) => item.lableValue)
                                  .join(", ")
                                : data?.shouting?.oneIncidents?.directedToWards
                                  ?.map((item: any) => item.lableValue)
                                  .join(", ")}
                            </Text>
                          </View>
                        )}

                        {(data?.verbalThreats?.one ||
                          data?.verbalThreats?.twoPlus) && (
                            <View style={[globalStyles.tablerow]}>
                              <Text style={globalStyles.labelColumn}>
                                Verbal Threats
                              </Text>
                              <Text style={globalStyles.valueColumn}>
                                <Text style={{ fontWeight: "bold" }}>
                                  {data?.verbalThreats?.twoPlus
                                    ? "2+ Incidents Occurred"
                                    : "1 Incident Occurred"}
                                </Text>
                                {"\n"}
                                {"\n"}
                                <Text style={{ fontWeight: "bold" }}>
                                  Verbal Threats - Directed Towards:
                                </Text>{" "}
                                {data?.verbalThreats?.twoPlus
                                  ? data?.verbalThreats?.twoPlusIncidents?.directedToWards
                                    ?.map((item: any) => item.lableValue)
                                    .join(", ")
                                  : data?.verbalThreats?.oneIncidents?.directedToWards
                                    ?.map((item: any) => item.lableValue)
                                    .join(", ")}
                              </Text>
                            </View>
                          )}

                        {(data?.pushingShoving?.one ||
                          data?.pushingShoving?.twoPlus) && (
                            <View style={[globalStyles.tablerow]}>
                              <Text style={globalStyles.labelColumn}>
                                Pushing / Shoving
                              </Text>
                              <Text style={globalStyles.valueColumn}>
                                <Text style={{ fontWeight: "bold" }}>
                                  {data?.pushingShoving?.twoPlus
                                    ? "2+ Incidents Occurred"
                                    : "1 Incident Occurred"}
                                </Text>
                                {"\n"}
                                {"\n"}
                                <Text style={{ fontWeight: "bold" }}>
                                  Pushing / Shoving - Directed Towards:
                                </Text>{" "}
                                {data?.pushingShoving?.twoPlus
                                  ? data?.pushingShoving?.twoPlusIncidents?.directedToWards
                                    ?.map((item: any) => item.lableValue)
                                    .join(", ")
                                  : data?.pushingShoving?.oneIncidents?.directedToWards
                                    ?.map((item: any) => item.lableValue)
                                    .join(", ")}
                              </Text>
                            </View>
                          )}

                        {(data?.assaultPunchKickSlap?.one ||
                          data?.assaultPunchKickSlap?.twoPlus) && (
                            <View style={[globalStyles.tablerow]}>
                              <Text style={globalStyles.labelColumn}>
                                Assault - Punch / Kick / Slap
                              </Text>
                              <Text style={globalStyles.valueColumn}>
                                <Text style={{ fontWeight: "bold" }}>
                                  {data?.assaultPunchKickSlap?.twoPlus
                                    ? "2+ Incidents Occurred"
                                    : "1 Incident Occurred"}
                                </Text>
                                {"\n"}
                                {"\n"}
                                <Text style={{ fontWeight: "bold" }}>
                                  Assault - Punch / Kick / Slap - Directed
                                  Towards:
                                </Text>{" "}
                                {data?.assaultPunchKickSlap?.twoPlus
                                  ? data?.assaultPunchKickSlap?.twoPlusIncidents?.directedToWards
                                    ?.map((item: any) => item.lableValue)
                                    .join(", ")
                                  : data?.assaultPunchKickSlap?.oneIncidents?.directedToWards
                                    ?.map((item: any) => item.lableValue)
                                    .join(", ")}
                              </Text>
                            </View>
                          )}

                        {(data?.assaultWeaponInvolved?.one ||
                          data?.assaultWeaponInvolved?.twoPlus) && (
                            <View style={[globalStyles.tablerow]}>
                              <Text style={globalStyles.labelColumn}>
                                Assault - Weapon Involved
                              </Text>
                              <Text style={globalStyles.valueColumn}>
                                <Text style={{ fontWeight: "bold" }}>
                                  {data?.assaultWeaponInvolved?.twoPlus
                                    ? "2+ Incidents Occurred"
                                    : "1 Incident Occurred"}
                                </Text>
                                {"\n"}
                                {"\n"}
                                <Text style={{ fontWeight: "bold" }}>
                                  Assault - Weapon Involved - Directed Towards:
                                </Text>{" "}
                                {Array.isArray(
                                  data?.assaultWeaponInvolved?.twoPlusIncidents
                                    ?.directedToWards
                                ) && data?.assaultWeaponInvolved?.twoPlus
                                  ? data?.assaultWeaponInvolved?.twoPlusIncidents?.directedToWards
                                    .map((item: any) => item.lableValue)
                                    .join(", ")
                                  : Array.isArray(
                                    data?.assaultWeaponInvolved?.oneIncidents
                                      ?.directedToWards
                                  ) &&
                                  data?.assaultWeaponInvolved?.oneIncidents?.directedToWards
                                    .map((item: any) => item.lableValue)
                                    .join(", ")}
                                {"\n"}
                                {"\n"}
                                <Text style={{ fontWeight: "bold" }}>
                                  Type of Weapon:
                                </Text>{" "}
                                {data?.assaultWeaponInvolved?.twoPlus
                                  ? [
                                    ...(data?.assaultWeaponInvolved?.twoPlusIncidents?.typeOfWeapon?.weapon?.map(
                                      (item: any) => item.lableValue
                                    ) || []),
                                    data?.assaultWeaponInvolved
                                      ?.twoPlusIncidents?.typeOfWeapon
                                      ?.otherWeapon,
                                  ]
                                    .filter(Boolean)
                                    .join(", ")
                                  : [
                                    ...(data?.assaultWeaponInvolved?.oneIncidents?.typeOfWeapon?.weapon?.map(
                                      (item: any) => item.lableValue
                                    ) || []),
                                    data?.assaultWeaponInvolved?.oneIncidents
                                      ?.typeOfWeapon?.otherWeapon,
                                  ]
                                    .filter(Boolean)
                                    .join(", ")}
                                {"\n"}
                                {"\n"}
                                <Text style={{ fontWeight: "bold" }}>
                                  Assault - Weapon Produced Type:
                                </Text>{" "}
                                {data?.assaultWeaponInvolved?.twoPlus
                                  ? data?.assaultWeaponInvolved?.twoPlusIncidents
                                    ?.weaponProducedType?.lableValue
                                  : data?.assaultWeaponInvolved?.oneIncidents
                                    ?.weaponProducedType?.lableValue}
                              </Text>
                            </View>
                          )}
                      </>
                    )}

                    {reportType === "securityIncident" && (
                      <View>
                        <View style={[globalStyles.tablerow]}>
                          <Text style={globalStyles.labelColumn}>
                            Sub Type{" "}
                          </Text>
                          <Text style={globalStyles.valueColumn}>
                            {capitalizeFirstLetter(
                              reportType === "siteActivityLog"
                                ? data?.activityType?.name || "-"
                                : reportType === "securityIncident"
                                  ? data?.typeOfIncidentCategory?.name || "-"
                                  : data?.subMaintenanceType?.name || "-"
                            )}
                          </Text>
                        </View>

                        {data?.location ? (
                          <View style={[globalStyles.tablerow]}>
                            <Text style={globalStyles.labelColumn}>
                              Location
                            </Text>
                            <Text style={globalStyles.valueColumn}>
                              {data?.location?.name}
                              {data?.subLocation?.name
                                ? `, ${data?.subLocation?.name}`
                                : ""}
                            </Text>
                          </View>
                        ) : (
                          <View style={[globalStyles.tablerow]}>
                            <Text style={globalStyles.labelColumn}>
                              Other Location:{" "}
                            </Text>
                            <Text style={globalStyles.valueColumn}>
                              {data?.otherLocation}
                            </Text>
                          </View>
                        )}

                        <View style={[globalStyles.tablerow]}>
                          <Text style={globalStyles.labelColumn}>
                            Details of Incident
                          </Text>
                          <Text style={globalStyles.valueColumn}>
                            {data?.detailsOfIncident}
                          </Text>
                        </View>

                        <View style={[globalStyles.tablerow]}>
                          <Text style={globalStyles.labelColumn}>Outcome </Text>
                          <Text style={globalStyles.valueColumn}>
                            {capitalizeFirstLetter(data?.outCome)}
                          </Text>
                        </View>

                        <View style={[globalStyles.tablerow]}>
                          <Text style={globalStyles.labelColumn}>
                            Police Assistance Requested{" "}
                          </Text>
                          <Text style={globalStyles.valueColumn}>
                            {capitalizeFirstLetter(
                              data?.policeAssistance &&
                                data?.policeAttended &&
                                data?.arrestMade
                                ? "Yes - Police Attended, Arrest made"
                                : data?.policeAssistance &&
                                  !data?.policeAttended &&
                                  !data?.arrestMade
                                  ? "Yes - Police did not attend, No arrest made"
                                  : data?.policeAssistance &&
                                    !data?.policeAttended &&
                                    data?.arrestMade
                                    ? "Yes - Police did not attend, Arrest made"
                                    : data?.policeAssistance &&
                                      data?.policeAttended &&
                                      !data?.arrestMade
                                      ? "Yes - Police Attended, No arrest made"
                                      : "No"
                            )}
                          </Text>
                        </View>
                        <View style={[globalStyles.tablerow]}>
                          <Text style={globalStyles.labelColumn}>
                            Emergency Services on Site{" "}
                          </Text>
                          <Text style={globalStyles.valueColumn}>
                            {/* {
                            data?.emergencyServices
                              ? [
                                  data?.whichEmergencyServices?.ambulance
                                    ? 'Ambulance'
                                    : null,
                                  data?.whichEmergencyServices?.fireBrigade
                                    ? 'Fire Brigade'
                                    : null,
                                  data?.emergencyServiceDetails,
                                ]
                                  .filter(Boolean)
                                  .join(', ')
                              : 'No'
                          } */}
                            {data?.emergencyServices
                              ? data?.whichEmergencyServices?.ambulance ||
                                data?.whichEmergencyServices?.fireBrigade ||
                                data?.emergencyServiceDetails
                                ? [
                                  data?.whichEmergencyServices?.ambulance
                                    ? "Ambulance"
                                    : null,
                                  data?.whichEmergencyServices?.fireBrigade
                                    ? "Fire Brigade"
                                    : null,
                                  data?.emergencyServiceDetails,
                                ]
                                  .filter(Boolean)
                                  .join(", ")
                                : "Yes"
                              : "No"}
                          </Text>
                        </View>
                        <View style={[globalStyles.tablerow]}>
                          <Text style={globalStyles.labelColumn}>
                            Paramedics Involved{" "}
                          </Text>
                          <Text style={globalStyles.valueColumn}>
                            {capitalizeFirstLetter(
                              data?.paramedicsInvolved ? "Yes" : "No"
                            )}
                          </Text>
                        </View>
                        <View>
                          <View style={{ flexDirection: "row" }}>
                            <Text style={globalStyles.labelColumn}>
                              Suspect / Offender{" "}
                            </Text>
                            <Text style={globalStyles.valueColumn}>
                              {capitalizeFirstLetter(
                                data?.suspectOrOffender ? "Yes" : "No"
                              )}
                            </Text>
                          </View>

                          {data?.suspectOrOffender && (
                            <View>
                              {data?.suspectOrOffenderDetails?.staffMember !==
                                undefined && (
                                  <View style={{ flexDirection: "row" }}>
                                    <Text
                                      style={[
                                        globalStyles.labelColumn,
                                        globalStyles.labelColumnIncident,
                                      ]}
                                    >
                                      Was the offender a staff member?{" "}
                                    </Text>
                                    <Text style={globalStyles.valueColumn}>
                                      {data?.suspectOrOffenderDetails.staffMember
                                        ? "Yes"
                                        : "No"}
                                    </Text>
                                  </View>
                                )}

                              {data?.suspectOrOffenderDetails?.offenderSeen !==
                                undefined && (
                                  <View style={{ flexDirection: "row" }}>
                                    <Text
                                      style={[
                                        globalStyles.labelColumn,
                                        globalStyles.labelColumnIncident,
                                      ]}
                                    >
                                      Was the offender seen?{" "}
                                    </Text>
                                    <Text style={globalStyles.valueColumn}>
                                      {data?.suspectOrOffenderDetails.offenderSeen
                                        ? "Yes"
                                        : "No"}
                                    </Text>
                                  </View>
                                )}

                              {data?.suspectOrOffenderDetails?.gender && (
                                <View style={{ flexDirection: "row" }}>
                                  <Text
                                    style={[
                                      globalStyles.labelColumn,
                                      globalStyles.labelColumnIncident,
                                    ]}
                                  >
                                    Gender of offender:{" "}
                                  </Text>
                                  <Text style={globalStyles.valueColumn}>
                                    {capitalizeFirstLetter(
                                      data?.suspectOrOffenderDetails.gender
                                    )}
                                  </Text>
                                </View>
                              )}

                              {data?.suspectOrOffenderDetails
                                ?.raceAppearance && (
                                  <View style={{ flexDirection: "row" }}>
                                    <Text
                                      style={[
                                        globalStyles.labelColumn,
                                        globalStyles.labelColumnIncident,
                                      ]}
                                    >
                                      Race Appearance:{" "}
                                    </Text>
                                    <Text style={globalStyles.valueColumn}>
                                      {capitalizeFirstLetter(
                                        data?.suspectOrOffenderDetails
                                          .raceAppearance
                                      )}
                                    </Text>
                                  </View>
                                )}

                              {data?.suspectOrOffenderDetails?.description && (
                                <View style={{ flexDirection: "row" }}>
                                  <Text
                                    style={[
                                      globalStyles.labelColumn,
                                      globalStyles.labelColumnIncident,
                                    ]}
                                  >
                                    Describe Offender, age and appearance:{" "}
                                  </Text>
                                  <Text style={globalStyles.valueColumn}>
                                    {data?.suspectOrOffenderDetails.description}
                                  </Text>
                                </View>
                              )}
                              {/* {categoryId === armedId && ( */}
                              <>
                                {(data?.suspectOrOffenderDetails?.typeOfWeapon
                                  ?.weapon?.length > 0 ||
                                  data?.suspectOrOffenderDetails?.typeOfWeapon
                                    ?.otherWeapon) && (
                                    <View style={{ flexDirection: "row" }}>
                                      <Text
                                        style={[
                                          globalStyles.labelColumn,
                                          globalStyles.labelColumnIncident,
                                        ]}
                                      >
                                        Type of Weapon
                                      </Text>
                                      <Text style={globalStyles.valueColumn}>
                                        {[
                                          ...(
                                            data?.suspectOrOffenderDetails
                                              ?.typeOfWeapon?.weapon || []
                                          ).map((item) => item.lableValue),
                                          data?.suspectOrOffenderDetails
                                            ?.typeOfWeapon?.otherWeapon,
                                        ]
                                          .filter(Boolean)
                                          .join(", ")}
                                      </Text>
                                    </View>
                                  )}
                              </>
                              {/* )} */}
                            </View>
                          )}
                        </View>

                        <View style={[globalStyles.tablerow]}></View>

                        <View style={[globalStyles.tablerow]}>
                          <Text style={globalStyles.labelColumn}>Witness </Text>
                          <Text style={globalStyles.valueColumn}>
                            {data?.witness
                              ? data?.witnessDetails?.witnessType ||
                                data?.witnessDetails?.nameOrEmailOrPhone
                                ? [
                                  capitalizeFirstLetter(
                                    data?.witnessDetails?.witnessType
                                  ),
                                  data?.witnessDetails?.nameOrEmailOrPhone,
                                ]
                                  .filter(Boolean)
                                  .join(", ")
                                : "Yes"
                              : "No"}
                          </Text>
                        </View>

                        <View>
                          {data?.incidentCategory?._id === bagCheckId && (
                            <>
                              {/* Bag / Receipt Check */}
                              <View style={{ flexDirection: "row" }}>
                                <Text style={globalStyles.labelColumn}>
                                  Bag / Receipt Check
                                </Text>
                                <Text style={globalStyles.valueColumn}>
                                  {capitalizeFirstLetter(
                                    data?.bagReceiptCheck ? "Yes" : "No"
                                  )}
                                </Text>
                              </View>

                              {data?.bagReceiptCheck && (
                                <View>
                                  {/* Bag/Receipt checks - no.completed */}
                                  <View style={{ flexDirection: "row" }}>
                                    <Text
                                      style={[
                                        globalStyles.labelColumn,
                                        globalStyles.labelColumnIncident,
                                      ]}
                                    >
                                      Bag/Receipt checks - no.completed:{" "}
                                    </Text>
                                    <Text style={globalStyles.valueColumn}>
                                      {data?.bagReceiptCheckDetails?.noCompleted
                                        ?.lableValue || "N/A"}
                                    </Text>
                                  </View>

                                  {/* Was there a Theft */}
                                  <View style={{ flexDirection: "row" }}>
                                    <Text
                                      style={[
                                        globalStyles.labelColumn,
                                        globalStyles.labelColumnIncident,
                                      ]}
                                    >
                                      Was there a Theft:{" "}
                                    </Text>
                                    <Text style={globalStyles.valueColumn}>
                                      {data?.bagReceiptCheckDetails
                                        ?.wasThereTheft
                                        ? "Yes"
                                        : "No"}
                                    </Text>
                                  </View>

                                  {data?.bagReceiptCheckDetails
                                    ?.wasThereTheft && (
                                      <View>
                                        {/* Did you find empty packaging or wrappers */}
                                        <View style={{ flexDirection: "row" }}>
                                          <Text
                                            style={[
                                              globalStyles.labelColumn,
                                              globalStyles.labelColumnIncident,
                                            ]}
                                          >
                                            Did you find empty packaging or
                                            wrappers?:{" "}
                                          </Text>
                                          <Text style={globalStyles.valueColumn}>
                                            {data?.bagReceiptCheckDetails
                                              ?.wasThereTheftDetails
                                              ?.findEmptyPackaging ===
                                              "notApplicable"
                                              ? "Not Applicable"
                                              : capitalizeFirstLetter(
                                                data?.bagReceiptCheckDetails
                                                  ?.wasThereTheftDetails
                                                  ?.findEmptyPackaging
                                              )}
                                          </Text>
                                        </View>

                                        {/* Description of Property */}
                                        {data?.bagReceiptCheckDetails
                                          ?.wasThereTheftDetails
                                          ?.descriptionOfProperty && (
                                            <View style={{ flexDirection: "row" }}>
                                              <Text
                                                style={[
                                                  globalStyles.labelColumn,
                                                  globalStyles.labelColumnIncident,
                                                ]}
                                              >
                                                Description of Property:{" "}
                                              </Text>
                                              <Text
                                                style={globalStyles.valueColumn}
                                              >
                                                {capitalizeFirstLetter(
                                                  data?.bagReceiptCheckDetails
                                                    ?.wasThereTheftDetails
                                                    ?.descriptionOfProperty
                                                )}
                                              </Text>
                                            </View>
                                          )}

                                        {/* Property Recovered */}
                                        {data?.bagReceiptCheckDetails
                                          ?.wasThereTheftDetails
                                          ?.propertyRecovered && (
                                            <View style={{ flexDirection: "row" }}>
                                              <Text
                                                style={[
                                                  globalStyles.labelColumn,
                                                  globalStyles.labelColumnIncident,
                                                ]}
                                              >
                                                Value of Property Recovered:{" "}
                                              </Text>
                                              <Text
                                                style={globalStyles.valueColumn}
                                              >
                                                {capitalizeFirstLetter(
                                                  data?.bagReceiptCheckDetails
                                                    ?.wasThereTheftDetails
                                                    ?.propertyRecovered
                                                )}
                                              </Text>
                                            </View>
                                          )}

                                        {/* Property Lost */}
                                        {data?.bagReceiptCheckDetails
                                          ?.wasThereTheftDetails
                                          ?.propertyLost && (
                                            <View style={{ flexDirection: "row" }}>
                                              <Text
                                                style={[
                                                  globalStyles.labelColumn,
                                                  globalStyles.labelColumnIncident,
                                                ]}
                                              >
                                                Value of Property Lost:{" "}
                                              </Text>
                                              <Text
                                                style={globalStyles.valueColumn}
                                              >
                                                {capitalizeFirstLetter(
                                                  data?.bagReceiptCheckDetails
                                                    ?.wasThereTheftDetails
                                                    ?.propertyLost
                                                )}
                                              </Text>
                                            </View>
                                          )}
                                      </View>
                                    )}
                                </View>
                              )}
                              <View style={globalStyles.tablerow}></View>
                            </>
                          )}
                        </View>

                        <View>
                          {data?.incidentCategory?._id === damageId && (
                            <>
                              <View style={{ flexDirection: "row" }}>
                                <Text style={[globalStyles.labelColumn]}>
                                  Damage / Vandalism
                                </Text>
                                <Text style={globalStyles.valueColumn}>
                                  {capitalizeFirstLetter(
                                    data?.damageVandalism ? "" : "No"
                                  )}
                                </Text>
                              </View>
                              {data?.damageVandalism && (
                                <>
                                  {data?.damageVandalismDetails
                                    ?.descriptionOfProperty && (
                                      <View
                                        style={{
                                          flexDirection: "row",
                                          marginTop: 10,
                                        }}
                                      >
                                        <Text
                                          style={[
                                            globalStyles.labelColumn,
                                            globalStyles.labelColumnIncident,
                                            ,
                                          ]}
                                        >
                                          Description of Property:{" "}
                                        </Text>
                                        <Text style={globalStyles.valueColumn}>
                                          {
                                            data?.damageVandalismDetails
                                              ?.descriptionOfProperty
                                          }
                                        </Text>
                                      </View>
                                    )}
                                </>
                              )}
                              <View style={globalStyles.tablerow}></View>
                            </>
                          )}

                          {data?.incidentCategory?._id === suspiciousId && (
                            <>
                              <View style={{ flexDirection: "row" }}>
                                <Text style={[globalStyles.labelColumn]}>
                                  Suspicious Behaviour
                                </Text>
                                <Text style={globalStyles.valueColumn}>
                                  {capitalizeFirstLetter(
                                    data?.suspiciousBehaviour ? "" : "No"
                                  )}
                                </Text>
                              </View>
                              {data?.suspiciousBehaviour && (
                                <>
                                  {data?.suspiciousBehaviourDetails
                                    ?.findEmptyPackaging && (
                                      <View
                                        style={{
                                          flexDirection: "row",
                                          marginTop: 10,
                                        }}
                                      >
                                        <Text
                                          style={[
                                            globalStyles.labelColumn,
                                            globalStyles.labelColumnIncident,
                                          ]}
                                        >
                                          Did you find empty packaging or
                                          wrappers?:{" "}
                                        </Text>
                                        <Text style={globalStyles.valueColumn}>
                                          {capitalizeFirstLetter(
                                            data?.suspiciousBehaviourDetails
                                              ?.findEmptyPackaging ===
                                              "notApplicable"
                                              ? "Not Applicable"
                                              : data?.suspiciousBehaviourDetails
                                                ?.findEmptyPackaging
                                          )}
                                        </Text>
                                      </View>
                                    )}
                                </>
                              )}
                              <View style={globalStyles.tablerow}></View>
                            </>
                          )}
                        </View>

                        <View style={[globalStyles.tablerow]}>
                          <Text style={globalStyles.labelColumn}>
                            Anyone Injured ?
                          </Text>
                          <Text style={globalStyles.valueColumn}>
                            {data?.anyoneInjured ? "Yes" : "No"}
                          </Text>
                        </View>

                        {data?.anyoneInjured && (
                          <>
                            {/* Who Was Injured */}
                            {(data?.anyoneInjuredDetails?.whoWasInjured?.injured
                              ?.length > 0 ||
                              data?.anyoneInjuredDetails?.whoWasInjured
                                ?.otherInjured) && (
                                <View style={[globalStyles.tablerow]}>
                                  <Text style={globalStyles.labelColumn}>
                                    Who Was Injured ?
                                  </Text>
                                  <Text style={globalStyles.valueColumn}>
                                    {[
                                      ...data.anyoneInjuredDetails.whoWasInjured.injured.map(
                                        (item) => item.lableValue
                                      ),
                                      data.anyoneInjuredDetails.whoWasInjured
                                        .otherInjured,
                                    ]
                                      .filter(Boolean)
                                      .join(", ")}
                                  </Text>
                                </View>
                              )}

                            {/* Medical Attention Provided */}
                            {data?.anyoneInjuredDetails
                              ?.medicalAttentionProvided?.length > 0 && (
                                <View style={[globalStyles.tablerow]}>
                                  <Text style={globalStyles.labelColumn}>
                                    Medical Attention Provided:
                                  </Text>
                                  <Text style={globalStyles.valueColumn}>
                                    {data.anyoneInjuredDetails.medicalAttentionProvided
                                      .map((item) => item.lableValue)
                                      .filter(Boolean)
                                      .join(", ")}
                                  </Text>
                                </View>
                              )}
                          </>
                        )}

                        <View style={[globalStyles.tablerow]}>
                          <Text style={globalStyles.labelColumn}>
                            Reported to Client
                          </Text>
                          <Text style={globalStyles.valueColumn}>
                            {data?.dutyManager
                              ? data?.dutyManagerDetails?.dutyManagerName
                                ? // If `dutyManagerName` exists, display the client's name
                                `Yes - Client name: ${capitalizeFirstLetter(
                                  data?.dutyManagerDetails?.dutyManagerName
                                )}`
                                : "Yes"
                              : "No"}
                          </Text>
                        </View>
                      </View>
                    )}
                    {/* <View style={[globalStyles.tablerow]} ></View> */}
                    {reportType === "siteActivityLog" && (
                      <>
                        {data?.location ? (
                          <View style={[globalStyles.tablerow]}>
                            <Text style={globalStyles.labelColumn}>
                              Location
                            </Text>
                            <Text style={globalStyles.valueColumn}>
                              {data?.location?.name}
                              {data?.subLocation?.name
                                ? `, ${data?.subLocation?.name}`
                                : ""}
                            </Text>
                          </View>
                        ) : data?.otherLocation ? ( // Check if otherLocation exists
                          <View style={[globalStyles.tablerow]}>
                            <Text style={globalStyles.labelColumn}>
                              Other Location:{" "}
                            </Text>
                            <Text style={globalStyles.valueColumn}>
                              {data?.otherLocation}
                            </Text>
                          </View>
                        ) : null}
                        {data?.comment &&
                          <View style={[globalStyles.tablerow]}>
                            <Text style={globalStyles.labelColumn}>
                              Description
                            </Text>
                            <Text style={globalStyles.valueColumn}>
                              {data?.comment}
                            </Text>
                          </View>}
                      </>
                    )}

                    {reportType === "maintenanceIssue" && (
                      <>
                        {data?.location ? (
                          <View style={[globalStyles.tablerow]}>
                            <Text style={globalStyles.labelColumn}>
                              Location
                            </Text>
                            <Text style={globalStyles.valueColumn}>
                              {data?.location?.name}
                              {data?.subLocation?.name
                                ? `, ${data?.subLocation?.name}`
                                : ""}
                            </Text>
                          </View>
                        ) : data?.otherLocation ? ( // Check if otherLocation exists
                          <View style={[globalStyles.tablerow]}>
                            <Text style={globalStyles.labelColumn}>
                              Other Location:{" "}
                            </Text>
                            <Text style={globalStyles.valueColumn}>
                              {data?.otherLocation}
                            </Text>
                          </View>
                        ) : null}
                        {data?.comment &&
                          <View style={[globalStyles.tablerow]}>
                            <Text style={globalStyles.labelColumn}>
                              Description
                            </Text>
                            <Text style={globalStyles.valueColumn}>
                              {data?.comment}
                            </Text>
                          </View>}
                      </>
                    )}

                    {reportType === "siteActivityLog"
                      ? data?.outCome && (
                        <View style={[globalStyles.tablerow]}>
                          <Text style={globalStyles.labelColumn}>
                            Outcome{" "}
                          </Text>
                          <Text style={globalStyles.valueColumn}>
                            {capitalizeFirstLetter(data?.outCome)}
                          </Text>
                        </View>
                      )
                      : reportType === "maintenanceIssue"
                        ? data?.reportedTo && (
                          <View style={[globalStyles.tablerow]}>
                            <Text style={globalStyles.labelColumn}>
                              Outcome{" "}
                            </Text>
                            {/* Check if data?.reportedTo is not empty or undefined */}
                            <Text style={globalStyles.valueColumn}>
                              {capitalizeFirstLetter(data?.reportedTo)}
                            </Text>
                          </View>
                        )
                        : null}

                    {/* {reportType !== "endOfShift" && ( */}
                    <View style={[globalStyles.tablerow]}>
                      <Text style={globalStyles.labelColumn}>
                        Reported On{" "}
                      </Text>
                      <Text style={globalStyles.valueColumn}>
                        {moment
                          .utc(data?.reportedAt)
                          .format("ddd, MMM Do HH:mm")}
                      </Text>
                    </View>
                    {/* )} */}

                    {/* {reportType !== "endOfShift" && ( */}
                    <View style={[globalStyles.tablerow]}>
                      <Text style={globalStyles.labelColumn}>
                        Submitted On{" "}
                      </Text>
                      <Text style={globalStyles.valueColumn}>
                        {moment(data?.createdAt).format("ddd, MMM Do HH:mm")}
                      </Text>
                    </View>
                    {/* )} */}
                  </View>
                  {data.pictures?.length > 0 && (
                    <FlatList
                      data={data.pictures}
                      renderItem={renderItem}
                      keyExtractor={(item, index) =>
                        item.id ? item.id.toString() : index.toString()
                      } // Ensure unique keys
                      numColumns={1} // Example: adjust as needed
                    />
                  )}
                </View>
              </View>
            )}

            {/* <View style={styles.paginationContainer}>
                                  {renderPaginationNumbers()}
                              </View> */}
          </View>
        </View>
      </ScrollView>
      <FooterUser activeIcon={activeIcon} setActiveIcon={setActiveIcon} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    paddingTop: 15,
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
    marginVertical: 10,
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
    marginLeft: 30,
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
    fontSize: 14,
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
  },
  content: {
    // padding: 15,
    flex: 1,
  },
  // row: {
  //   flexDirection: 'row',
  //   alignItems: 'flex-start',
  //   flexWrap: 'wrap',
  //   paddingLeft: 15,
  //   paddingBottom: 6,

  // },
  text: {
    width: 90,
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
  button: {
    borderWidth: 1,
    borderColor: "#D01E12", // Change color as needed
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "transparent",
    alignItems: "center",
    flexDirection: "row",
  },
  btnText: {
    fontSize: 14,
    color: "#D01E12",
    textAlign: "center",
  },
  activeButton: {
    backgroundColor: "#D01E12",
  },
  activeBtnText: {
    color: "#fff",
  },
  expandIcon: {
    justifyContent: "center",
    alignItems: "center",
    right: 30,
  },
  mapView: {
    flexDirection: "row",
  },
  contactText: {
    marginLeft: 10,
  },
  imageContainer: {
    position: "relative",
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 10,
    borderRadius: 6,
  },
});

export default ReportDetails;
