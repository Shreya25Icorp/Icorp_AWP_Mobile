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
  SafeAreaView,
  RefreshControl,
  PanResponder,
} from "react-native";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URL_ROASTERING } from "../Constant";
import { io } from "socket.io-client";
import FeatherIcon from "react-native-vector-icons/Feather";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import CustomText from "../components/CustomText";
import Ionicons from "react-native-vector-icons/Ionicons";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isoWeek from "dayjs/plugin/isoWeek";
import FooterUser from "../components/Footer/FooterUser";
import { TextInput } from "react-native-gesture-handler";
import { globalStyles } from "../styles";
import moment from "moment";
import SidebarUser from "../components/Sidebar/SidebarUser";

const windowWidth = Dimensions.get("window").width;

const Reports = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { shift } = route.params;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeIcon, setActiveIcon] = useState<number>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState([]);
  const [userData, setUserData] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(dayjs());
  const [reportId, setReportId] = useState("");
  const [reportData, setReportData] = useState<any>([]);

  const [sidebarTranslateX] = useState(new Animated.Value(-windowWidth * 0.7));

  const [currentPage, setCurrentPage] = useState(1);
  const [clickedPage, setClickedPage] = useState(1);
  const [showPrev, setShowPrev] = useState(false);

  const toggleSidebar = () => {
    if (isSidebarOpen) {
      const toValue = -windowWidth * 0.7;

      sidebarTranslateX.setValue(toValue);
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
      const toValue = 0;

      Animated.timing(sidebarTranslateX, {
        toValue,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    }
  };

  dayjs.extend(weekOfYear);
  dayjs.extend(isoWeek);

  const startRef = useRef(dayjs());
  const endRef = useRef(dayjs());

  const getWeekRange = (week: any) => {
    const startOfWeek = week.startOf("isoWeek"); // Monday
    const endOfWeek = week.endOf("isoWeek"); // Sunday

    return {
      start: startOfWeek,
      end: endOfWeek,
    };
  };
  const { start, end } = getWeekRange(currentWeek);

  const scrollViewRef = useRef<ScrollView>(null);

  // Function to scroll to the top
  const scrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const checkpointsPerPage = 15;
  const startIndex = (currentPage - 1) * checkpointsPerPage;
  const endIndex = startIndex + checkpointsPerPage;
  const shiftsPagination = reportData.slice(startIndex, endIndex);

  const totalPages = Math.ceil(reportData.length / checkpointsPerPage);
  const renderPaginationNumbers = () => {
    const paginationNumbers = [];

    if (totalPages > 1) {
      if (showPrev) {
        paginationNumbers.push(
          <TouchableOpacity
            key="prev"
            style={globalStyles.paginationButton} // Previous button
            onPress={() => {
              const newPage = Math.max(currentPage - 1, 1);
              setCurrentPage(newPage);
              setClickedPage(newPage);
              if (newPage === 1) {
                setShowPrev(false); // Hide "Prev" when back to first page
              }
              scrollToTop();
            }}
          >
            <Text style={globalStyles.paginationButtonText}>PREV</Text>
          </TouchableOpacity>
        );
      }

      paginationNumbers.push(
        <TouchableOpacity
          key={1}
          style={[
            globalStyles.paginationNumber,
            clickedPage === 1 && globalStyles.activePaginationNumber,
          ]}
          onPress={() => {
            setCurrentPage(1);
            setClickedPage(1);
            setShowPrev(false); // Hide "Prev" when clicking the first page
            scrollToTop();
          }}
        >
          <Text
            style={[
              globalStyles.paginationNumberText,
              clickedPage === 1 && globalStyles.activePaginationNumberText,
            ]}
          >
            1
          </Text>
        </TouchableOpacity>
      );

      if (currentPage > 4) {
        paginationNumbers.push(
          <TouchableOpacity
            key="ellipsis-left"
            style={globalStyles.paginationNumber}
            onPress={() => {
              const newPage = Math.max(currentPage - 3, 2);
              setCurrentPage(newPage);
              setClickedPage(newPage);
              scrollToTop();
            }}
          >
            <Text style={globalStyles.paginationNumberText}>...</Text>
          </TouchableOpacity>
        );
      }

      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(currentPage + 1, totalPages - 1);
        i++
      ) {
        paginationNumbers.push(
          <TouchableOpacity
            key={i}
            style={[
              globalStyles.paginationNumber,
              clickedPage === i && globalStyles.activePaginationNumber,
            ]}
            onPress={() => {
              setCurrentPage(i);
              setClickedPage(i);
              setShowPrev(true); // Show "Prev" when navigating away from the first page
              scrollToTop();
            }}
          >
            <Text
              style={[
                globalStyles.paginationNumberText,
                clickedPage === i && globalStyles.activePaginationNumberText,
              ]}
            >
              {i}
            </Text>
          </TouchableOpacity>
        );
      }

      if (currentPage < totalPages - 3) {
        paginationNumbers.push(
          <TouchableOpacity
            key="ellipsis-right"
            style={globalStyles.paginationNumber}
            onPress={() => {
              const newPage = Math.min(currentPage + 3, totalPages - 1);
              setCurrentPage(newPage);
              setClickedPage(newPage);
              setShowPrev(true); // Show "Prev" when moving past the first few pages
              scrollToTop();
            }}
          >
            <Text style={globalStyles.paginationNumberText}>...</Text>
          </TouchableOpacity>
        );
      }

      paginationNumbers.push(
        <TouchableOpacity
          key={totalPages}
          style={[
            globalStyles.paginationNumber,
            clickedPage === totalPages && globalStyles.activePaginationNumber,
          ]}
          onPress={() => {
            setCurrentPage(totalPages);
            setClickedPage(totalPages);
            setShowPrev(true); // Show "Prev" when reaching the last page
            scrollToTop();
          }}
        >
          <Text
            style={[
              globalStyles.paginationNumberText,
              clickedPage === totalPages &&
              globalStyles.activePaginationNumberText,
            ]}
          >
            {totalPages}
          </Text>
        </TouchableOpacity>
      );

      paginationNumbers.push(
        <TouchableOpacity
          key="next"
          style={globalStyles.paginationButton} // Next button
          onPress={() => {
            const newPage = Math.min(currentPage + 1, totalPages);
            setCurrentPage(newPage);
            setClickedPage(newPage);
            setShowPrev(true); // Show "Prev" when "Next" is clicked
            scrollToTop();
          }}
          disabled={currentPage === totalPages}
        >
          <Text style={globalStyles.paginationButtonText}>NEXT</Text>
        </TouchableOpacity>
      );
    }

    return paginationNumbers;
  };

  const fetchAllReports = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const siteId = await AsyncStorage.getItem("siteId");

      if (!userId) {
        console.error("No userId found in AsyncStorage");
        return;
      }

      let allReports: any[] = [];
      const pageSize = 15;

      const params: Record<string, any> = {
        search: reportId || "",
        limit: pageSize,
        "siteId[0]": siteId,
      };

      if (!reportId) {
        params.reportFromDate = startRef.current.format("YYYY-MM-DD");
        params.reportToDate = endRef.current.format("YYYY-MM-DD");
      }

      const url = `${SERVER_URL_ROASTERING}/get/user/all/reports/${userId}`;
      setIsLoading(true);

      const initialResponse = await axios.get(url, {
        params: {
          ...params,
          page: 1,
        },
        withCredentials: true,
      });

      // console.log(`Reports Page 1 ==>`, initialResponse.data);

      if (initialResponse?.status !== 200) {
        console.error(
          "API request failed:",
          initialResponse?.status,
          initialResponse?.statusText
        );
        return;
      }

      const totalReports = initialResponse?.data?.total || 0;
      allReports = [...(initialResponse?.data?.reports || [])];

      // Calculate the total number of pages
      const totalPages = Math.ceil(totalReports / pageSize);

      // Prepare an array of promises for remaining pages
      const pageRequests = [];
      for (let page = 2; page <= totalPages; page++) {
        const pageRequest = axios.get(url, {
          params: {
            ...params,
            page, // Use the current page number
          },
          withCredentials: true,
        });
        pageRequests.push(pageRequest);
      }

      // Fetch all remaining pages concurrently
      const pageResponses = await Promise.all(pageRequests);
      pageResponses.forEach((response) => {
        if (response?.status === 200) {
          allReports = [...allReports, ...(response?.data?.reports || [])];
        }
      });

      setReportData(allReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setIsLoading(false);
    }
  }, [reportId]);

  // Function to load current week from AsyncStorage
  const loadCurrentWeekFromStorage = async () => {
    try {
      const storedWeek = await AsyncStorage.getItem("currentWeek");
      if (storedWeek) {
        setCurrentWeek(dayjs(storedWeek)); // Set the week from storage
      } else {
        setCurrentWeek(dayjs()); // Default to current week
      }
    } catch (error) {
      console.error("Error loading current week from AsyncStorage:", error);
      setCurrentWeek(dayjs()); // Fallback to current week on error
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCurrentWeekFromStorage();
    }, [])
  );

  // Separate useFocusEffect for fetching all reports
  useFocusEffect(
    useCallback(() => {
      fetchAllReports();
    }, [])
  );

  // onRefresh function to call both loadCurrentWeekFromStorage and fetchAllReports
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);

    // Call both functions and wait for them to finish
    Promise.all([loadCurrentWeekFromStorage(), fetchAllReports()])
      .then(() => {
        setIsRefreshing(false); // Stop refreshing once everything is done
      })
      .catch((error) => {
        console.error("Error during refresh:", error);
        setIsRefreshing(false); // Make sure to stop refreshing on error too
      });
  }, []);

  // useEffect(() => {
  //   const socket = io(SERVER_URL);

  //   socket.on('connect', () => {
  //     console.log('Socket.io connection opened');
  //   });

  //   socket.on('checkin', data => {
  //     if (data) {
  //       fetchAllReports();
  //     }
  //   });

  //   socket.on('checkout', data => {
  //     if (data) {
  //       fetchAllReports();
  //     }
  //   });

  //   socket.on('disconnect', () => {
  //     console.log('Socket.io connection closed');
  //   });

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

  const saveCurrentWeekToStorage = async (week) => {
    try {
      await AsyncStorage.setItem("currentWeek", week.format("YYYY-MM-DD"));
    } catch (error) {
      console.error("Error saving current week to AsyncStorage:", error);
    }
  };

  const goToNextWeek = () => {
    const nextWeek = currentWeek.add(1, "week");
    setCurrentWeek(nextWeek);
    saveCurrentWeekToStorage(nextWeek); // Save to AsyncStorage
    fetchAllReports();
    setCurrentPage(1);
    setClickedPage(1);
  };

  const goToPreviousWeek = () => {
    const previousWeek = currentWeek.subtract(1, "week");
    setCurrentWeek(previousWeek);
    saveCurrentWeekToStorage(previousWeek); // Save to AsyncStorage
    fetchAllReports();
    setCurrentPage(1);
    setClickedPage(1);
  };

  const showCurrentWeek = () => {
    const thisWeek = dayjs();
    setCurrentWeek(thisWeek);
    saveCurrentWeekToStorage(thisWeek);
    fetchAllReports();
    setCurrentPage(1);
    setClickedPage(1);
  };

  //fetch All shifts
  startRef.current = start;
  endRef.current = end;

  function capitalizeFirstLetter(string: string): string {
    if (!string || typeof string !== "string") return ""; // Handle empty, undefined, or non-string values

    return string
      .split(" ") // Split the string into words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
      .join(" "); // Join the words back together with a space
  }

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Ensure swipe is horizontal and ignore vertical movements
      return Math.abs(gestureState.dx) > 50 && Math.abs(gestureState.dy) < 10;
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dx > 50) {
        goToPreviousWeek(); // Swipe Right
      } else if (gestureState.dx < -50) {
        goToNextWeek(); // Swipe Left
      }
    },
  });


  return (
    <SafeAreaView style={styles.container}>
      <View {...panResponder.panHandlers} style={{ flex: 1 }}>
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
              onPress={() => navigation.navigate('UserHome' as never)}>
              <FeatherIcon
                name="arrow-left"
                size={22}
                color="#000"
                style={styles.backIcon}
              />
            </TouchableOpacity> */}
                <View style={styles.titleContainer}>
                  <CustomText style={styles.titleText}>Reports</CustomText>
                </View>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Report ID"
                  placeholderTextColor="#BFBBBB"
                  style={styles.input}
                  autoCapitalize="none"
                  onChangeText={(text) => {
                    setReportId(text);
                  }}
                // onFocus={handleFocusEmail}
                // onBlur={handleBlurEmail}
                />
              </View>
              <View style={styles.dateContainer}>
                <View style={styles.buttonContainer}>
                  <Ionicons
                    name="arrow-back-circle"
                    size={27}
                    color="#3B4560"
                    onPress={goToPreviousWeek}
                  />
                  <View style={styles.weekContent}>
                    <Ionicons
                      name="calendar-outline"
                      size={25}
                      color="black"
                      onPress={showCurrentWeek}
                    />
                    <CustomText style={styles.weekText}>{`${start.format(
                      "MMM DD"
                    )} - ${end.format("MMM DD")}`}</CustomText>
                  </View>
                  <Ionicons
                    name="arrow-forward-circle-sharp"
                    size={27}
                    color="#3B4560"
                    onPress={goToNextWeek}
                  />
                </View>
              </View>
              {isLoading ? (
                <View style={[globalStyles.centeredView, { flex: 0, top: 10 }]}>
                  <View style={globalStyles.loaderCircle}>
                    <ActivityIndicator
                      size="large"
                      color="#3B4560"
                      style={globalStyles.loader}
                    />
                  </View>
                </View>
              ) : reportData.length === 0 ? (
                <View style={globalStyles.emptyContainer}>
                  <FontAwesome5
                    name="file-export"
                    size={50} // Adjust the size to your desired value
                    color="#C6C6C6" // Set the desired color here
                  // style={styles.iconImage}
                  />
                  <Text style={globalStyles.noDataText}>
                    No Reports available at the moment!
                  </Text>
                </View>
              ) : (
                <View>
                  {shiftsPagination.map((item: any, index: number) => {
                    const backgroundColor =
                      index % 2 === 0 ? "#f0f0f0" : "#ffffff";
                    return (
                      <TouchableOpacity
                        style={styles.personalInfocontainer}
                        key={index}
                        onPress={() =>
                          navigation.navigate("ReportDetails", {
                            id: item?._id,
                            reportType: item?.report,
                          } as never)
                        }
                      >
                        <View style={styles.content}>
                          <View
                            style={[
                              globalStyles.headerContainer,
                              {
                                flexDirection: "row",
                                justifyContent: "space-between",
                                paddingVertical: 6,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                globalStyles.headerText,
                                { textAlign: "left", fontSize: 14, marginVertical: 4, },
                              ]}
                            >
                              {item?.report === "siteActivityLog"
                                ? "Activity Log"
                                : item?.report === "securityIncident"
                                  ? "Incident Report"
                                  : item?.report === "endOfShift"
                                    ? "Atmospherics Report"
                                    : "Maintenance Report"}
                            </Text>

                            <View style={[styles.expandIcon, { right: 5 }]}>
                              <TouchableOpacity
                                onPress={() =>
                                  navigation.navigate(
                                    item?.report === "siteActivityLog"
                                      ? "SiteActivityLog"
                                      : item?.report === "securityIncident"
                                        ? "IncidentReport"
                                        : item?.report === "endOfShift"
                                          ? "AtmosphericReport"
                                          : "MaintenanceReport",
                                    {
                                      reportType: item?.report,
                                      id: item?._id,
                                      status: item?.status,
                                      shift,
                                    }
                                  )
                                }
                                style={{
                                  ...(item?.status === "draft"
                                    ? {
                                      borderWidth: 1,
                                      borderColor: "orange",
                                      borderRadius: 5,
                                      paddingVertical: 4,
                                      paddingHorizontal: 10,
                                      alignSelf: "flex-start",
                                    }
                                    : {}),
                                  marginTop: 2,
                                  marginRight: 8,
                                }}
                              >
                                <Text
                                  style={{
                                    color:
                                      item?.status === "draft"
                                        ? "orange"
                                        : "black", // Orange color for draft status
                                    fontSize: 14,
                                    fontWeight: "bold",
                                    fontStyle: "italic",
                                  }}
                                >
                                  {item?.status === "draft" && "Draft"}
                                </Text>
                              </TouchableOpacity>

                              <MaterialIcons
                                name="navigate-next"
                                size={22}
                                color="#FFF"
                                onPress={() =>
                                  navigation.navigate("ReportDetails", {
                                    id: item?._id,
                                    reportType: item?.report,
                                  } as never)
                                }
                                style={{ marginVertical: 4 }}
                              />
                            </View>
                          </View>
                          <View style={globalStyles.table}>
                            {item?.report !== "endOfShift" && (
                              <View style={globalStyles.tablerow}>
                                <Text style={globalStyles.labelColumn}>
                                  Category:{" "}
                                </Text>
                                <Text style={globalStyles.valueColumn}>
                                  {capitalizeFirstLetter(
                                    item?.report === "siteActivityLog"
                                      ? item?.activityType?.name
                                      : item?.report === "securityIncident"
                                        ? item?.incidentCategory?.name
                                        : item?.maintenanceType?.name
                                  )}
                                </Text>
                              </View>
                            )}

                            {/* <View style={globalStyles.tablerow}>
                            <Text style={globalStyles.labelColumn}>
                              Category:{" "}
                            </Text>
                            <Text style={globalStyles.valueColumn}>
                              {capitalizeFirstLetter(
                                item?.report === "siteActivityLog"
                                  ? item?.activityType?.name
                                  : item?.report === "securityIncident"
                                  ? item?.incidentCategory?.name
                                  : item?.maintenanceType?.name
                              )}
                            </Text>
                          </View> */}
                            <View style={globalStyles.tablerow}>
                              <Text style={globalStyles.labelColumn}>
                                Report ID:
                              </Text>
                              <Text style={globalStyles.valueColumn}>
                                {item?.activityNumber}
                              </Text>
                            </View>
                            <View style={globalStyles.tablerow}>
                              <Text style={globalStyles.labelColumn}>
                                Submitted On:{" "}
                              </Text>
                              <Text
                                style={[
                                  globalStyles.valueColumn,
                                  { fontSize: 14 },
                                ]}
                              >
                                {moment(item?.createdAt).format(
                                  "ddd, MMM Do HH:mm"
                                )}
                              </Text>
                            </View>
                            <View style={globalStyles.tablerow}>
                              <Text style={globalStyles.labelColumn}>
                                Site Name:
                              </Text>
                              <Text style={[globalStyles.valueColumn]}>
                                {capitalizeFirstLetter(item?.site?.siteName)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
              {!isLoading && (
                <View
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
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
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
    marginTop: 10,
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
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: "#fff",
    elevation: 3,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ccc",
    top: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    // alignItems: 'center',
    marginHorizontal: 10,
  },
  content: {
    // padding: 15,
    flex: 1,
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
    // alignItems: "flex-end",
    justifyContent: "center",
    flexDirection: "row",
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
  },
  labelContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "transparent", // Background color can be transparent if not needed
  },
  labelText: {
    color: "#fff", // Text color
    padding: 5,
    borderRadius: 3,
    fontWeight: "bold",
    fontSize: 12,
  },
});

export default Reports;
