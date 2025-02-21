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
  PanResponder,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
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

const windowWidth = Dimensions.get("window").width;

const Schedule_Attendance = () => {
  const navigation = useNavigation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeIcon, setActiveIcon] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState([]);
  const [userData, setUserData] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(dayjs());

  const [sidebarTranslateX] = useState(new Animated.Value(-windowWidth * 0.7));
  const [scheduleShift, setScheduleShift] = useState<any>([]);

  const [nextWeekShiftCount, setNextWeekShiftCount] = useState(0);
  const [prevWeekShiftCount, setPrevWeekShiftCount] = useState(0);
  const [isNextWeekSelected, setIsNextWeekSelected] = useState(false);
  const [currentWeekShiftCount, setCurrentWeekShiftCount] = useState(0);

  // const toggleSidebar = () => {
  //   if (isSidebarOpen) {
  //     const toValue = -windowWidth * 0.7; // Adjust the sidebar width as needed
  //     sidebarTranslateX.setValue(toValue);
  //     setIsSidebarOpen(false);
  //   } else {
  //     setIsSidebarOpen(true);
  //     const toValue = 0;

  //     Animated.timing(sidebarTranslateX, {
  //       toValue,
  //       duration: 300, // Adjust the duration as needed
  //       easing: Easing.linear,
  //       useNativeDriver: false,
  //     }).start();
  //   }
  // };

  const [currentPage, setCurrentPage] = useState(1);
  const [clickedPage, setClickedPage] = useState(1);
  const [showPrev, setShowPrev] = useState(false);

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
  const shiftsPagination = scheduleShift.slice(startIndex, endIndex);

  const totalPages = Math.ceil(scheduleShift.length / checkpointsPerPage);
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
            setShowPrev(false);
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
          style={globalStyles.paginationButton}
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

  const fetchAllScheduleShifts = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        console.error("No userId found in AsyncStorage");
        return;
      }

      setIsLoading(true);

      const shiftsStartDate = startRef.current.format("YYYY-MM-DD");
      const shiftsEndDate = endRef.current.format("YYYY-MM-DD");
      const url = `${SERVER_URL_ROASTERING}/get/assigned/shifts/${userId}`;
      const pageSize = 1;

      // Fetch the first page to get the total number of shifts
      const initialResponse = await axios.get(url, {
        params: {
          shiftsStartDate,
          shiftsEndDate,
          shiftStatus: "accepted,punchIn,completed",
          page: 1,
          limit: pageSize,
        },
        withCredentials: true,
      });

      if (initialResponse?.status !== 200) {
        console.error(
          "API request failed:",
          initialResponse?.status,
          initialResponse?.statusText
        );
        return;
      }

      const totalShifts = initialResponse?.data?.total || 0;
      const totalPages = Math.ceil(totalShifts / pageSize);
      let allShifts = initialResponse?.data?.shifts || [];

      setNextWeekShiftCount(initialResponse?.data?.nextWeekCount || 0);
      setCurrentWeekShiftCount(totalShifts);

      // Prepare an array of promises for remaining pages
      const pageRequests = [];
      for (let page = 2; page <= totalPages; page++) {
        const pageRequest = axios.get(url, {
          params: {
            shiftsStartDate,
            shiftsEndDate,
            shiftStatus: "accepted,punchIn,completed",
            page,
            limit: pageSize,
          },
          withCredentials: true,
        });
        pageRequests.push(pageRequest);
      }

      // Fetch all remaining pages concurrently
      const pageResponses = await Promise.all(pageRequests);
      pageResponses.forEach((response) => {
        if (response?.status === 200) {
          allShifts = [...allShifts, ...(response?.data?.shifts || [])];
        }
      });

      // Fetch previous week's shifts if not already set
      if (!prevWeekShiftCount) {
        const prevWeekStart = startRef.current.clone().subtract(7, "days");
        const prevWeekEnd = endRef.current.clone().subtract(7, "days");
        const prevWeekUrl = `${SERVER_URL_ROASTERING}/get/assigned/shifts/${userId}?shiftsStartDate=${prevWeekStart.format(
          "YYYY-MM-DD"
        )}&shiftsEndDate=${prevWeekEnd.format(
          "YYYY-MM-DD"
        )}&shiftStatus=accepted,punchIn,completed`;

        const prevWeekResponse = await axios.get(prevWeekUrl, {
          withCredentials: true,
        });

        if (prevWeekResponse?.status === 200) {
          const prevWeekShifts = prevWeekResponse?.data?.total || 0;
          setPrevWeekShiftCount(prevWeekShifts);
        }
      }

      if (isNextWeekSelected) {
        setPrevWeekShiftCount(currentWeekShiftCount);
      }

      setScheduleShift(allShifts);
    } catch (error) {
      console.error("Error fetching shifts:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const retrieveSelectedWeek = async () => {
    try {
      const savedWeek = await AsyncStorage.getItem("selectedWeek");
      if (savedWeek) {
        setCurrentWeek(dayjs(savedWeek)); // Set the saved week if available
      } else {
        setCurrentWeek(dayjs()); // Default to current week
      }
      // Call the fetch function for schedule shifts
      await fetchAllScheduleShifts();
    } catch (error) {
      console.error("Failed to retrieve selected week:", error);
    }
  };

  // onRefresh function to call retrieveSelectedWeek
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);

    retrieveSelectedWeek().finally(() => {
      setIsRefreshing(false); // Stop refreshing once the operation is done
    });
  }, []);

  // useFocusEffect to load data when the screen is focused
  useFocusEffect(
    useCallback(() => {
      retrieveSelectedWeek();
    }, [fetchAllScheduleShifts])
  );

  // useEffect(() => {
  //   // Initialize the socket.io connection
  //   const socket = io(SERVER_URL_ROASTERING_DOMAIN);
  //   // Handle socket.io events
  //   socket.on('connect', () => {
  //     console.log('Socket.io connection opened');
  //   });

  //   socket.on('publishShift', async data => {
  //     if (data) {
  //       fetchAllScheduleShifts();
  //     }
  //   });

  //   socket.on('editShift', async data => {
  //     if (data) {
  //       fetchAllScheduleShifts();
  //     }
  //   });

  //   socket.on('punchIn', async data => {
  //     if (data) {
  //       fetchAllScheduleShifts();
  //     }
  //   });

  //   socket.on('deleteShift', async data => {
  //     if (data) {
  //       fetchAllScheduleShifts();
  //     }
  //   });

  //   socket.on('disconnect', () => {
  //     console.log('Socket.io connection closed');
  //   });

  //   // Clean up the socket.io connection when the component is unmounted
  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

  const saveCurrentWeekToStorage = async (week) => {
    try {
      await AsyncStorage.setItem("selectedWeek", week.format("YYYY-MM-DD"));
    } catch (error) {
      console.error("Failed to save current week:", error);
    }
  };

  const goToNextWeek = () => {
    const nextWeek = currentWeek.add(1, "week");
    setCurrentWeek(nextWeek);
    setIsNextWeekSelected(true);
    setPrevWeekShiftCount(currentWeekShiftCount);

    // Reset current page to 1 when navigating to next week
    setCurrentPage(1);
    setClickedPage(1);

    saveCurrentWeekToStorage(nextWeek); // Save the selected week
    fetchAllScheduleShifts();
  };

  const goToPreviousWeek = () => {
    const previousWeek = currentWeek.subtract(1, "week");
    setCurrentWeek(previousWeek);
    setIsNextWeekSelected(false);
    setPrevWeekShiftCount(0);

    // Reset current page to 1 when navigating to previous week
    setCurrentPage(1);
    setClickedPage(1);

    saveCurrentWeekToStorage(previousWeek); // Save the selected week
    fetchAllScheduleShifts();
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

  function capitalizeAllLetter(string: string) {
    if (!string) return ""; // Handle empty or undefined strings
    return string.toUpperCase();
  }

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dx > 50) {
        goToPreviousWeek(); // Swipe Right - Previous Week
      } else if (gestureState.dx < -50) {
        goToNextWeek(); // Swipe Left - Next Week
      }
    },
  });



  return (
    <SafeAreaView style={styles.container} {...panResponder.panHandlers}>
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
                source={require("../assets/images/awp_logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <TouchableOpacity
                style={globalStyles.backArrow}
                onPress={() => navigation.goBack()}>
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
                  Schedule and Attendance
                </CustomText>
              </View>
            </View>

            <View style={styles.dateContainer}>
              <View style={styles.buttonContainer}>
                <View style={globalStyles.leftContainer}>
                  {prevWeekShiftCount > 0 && (
                    <IconwithText
                      next={goToPreviousWeek}
                      imgSource={require("../assets/images/prev.png")}
                      text={prevWeekShiftCount}
                      style={{ left: 5 }} // Adds some space between the counter and the arrow
                    />
                  )}
                  <Ionicons
                    name="arrow-back-circle"
                    size={31}
                    color="#3B4560"
                    onPress={goToPreviousWeek}
                  />
                </View>
                <View style={styles.weekContent}>
                  <Ionicons name="calendar-outline" size={25} color="black" />
                  <CustomText style={styles.weekText}>
                    {`${start.format("MMM DD")} - ${end.format("MMM DD")}`}
                  </CustomText>
                </View>

                {/* Right side: next week counter and arrow */}
                <View style={globalStyles.rightContainer}>
                  <Ionicons
                    name="arrow-forward-circle-sharp"
                    size={31}
                    color="#3B4560"
                    onPress={goToNextWeek}
                  />
                  {nextWeekShiftCount > 0 && (
                    <IconwithText
                      next={goToNextWeek}
                      imgSource={require("../assets/images/next.png")}
                      text={nextWeekShiftCount}
                      style={{ right: 5 }} // Adds some space between the arrow and the counter
                    />
                  )}
                </View>
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
            ) : scheduleShift.length === 0 ? (
              <View style={globalStyles.emptyContainer}>
                <FontAwesome5
                  name="calendar-check"
                  size={50}
                  color="#C6C6C6"
                />
                <Text style={globalStyles.noDataText}>
                  No shifts available at the moment!
                </Text>
              </View>
            ) : (
              <View>
                {shiftsPagination.map((item: any, index: number) => {
                  return (
                    <TouchableOpacity
                      style={[
                        styles.personalInfocontainer,
                        {
                          backgroundColor:
                            item.shiftStatus === 'completed'
                              ? '#DEF2D6'
                              : item.shiftStatus === 'accepted'
                                ? '#F3E5AB'
                                : '#DEF2D6',
                          borderColor:
                            item.shiftStatus === 'completed'
                              ? '#118B50'
                              : item.shiftStatus === 'accepted'
                                ? '#FFAA33'
                                : '#118B50',
                        },
                      ]}

                      key={index}
                      onPress={() =>
                        navigation.navigate("ShiftDetails", {
                          id: item?._id,
                        } as never)
                      }
                    >
                      <View style={styles.content}>
                        <View style={globalStyles.row}>
                          <Text style={globalStyles.text1}>Shift Date: </Text>
                          <Text style={globalStyles.subText}>
                            {moment
                              .utc(item?.shiftStartDateTime)
                              .format("ddd, MMM Do YYYY")}
                          </Text>
                        </View>

                        <View style={globalStyles.row}>
                          <Text style={globalStyles.text1}>Shift Time: </Text>
                          <Text style={globalStyles.subText}>
                            {`${moment
                              .utc(item?.shiftStartDateTime)
                              .format("HH:mm")} - ${moment
                                .utc(item?.shiftEndDateTime)
                                .format("HH:mm")}`}
                          </Text>
                        </View>

                        <View style={globalStyles.row}>
                          <Text style={globalStyles.text1}>Site Name: </Text>
                          <Text style={globalStyles.subText}>
                            {capitalizeFirstLetter(item?.siteId?.siteName)}
                          </Text>
                        </View>

                        <View style={globalStyles.row}>
                          <Text style={globalStyles.text1}>Position: </Text>
                          <Text style={globalStyles.subText}>
                            {capitalizeFirstLetter(item?.positionId?.postName)}
                          </Text>
                        </View>
                        {item?.positionId?.levelOfPay && !item?.positionId?.hiddenLevelOfPay && (
                          <View style={globalStyles.row}>
                            <Text style={globalStyles.text1}>Level of Pay: </Text>
                            <Text style={[globalStyles.subText]}>
                              {capitalizeFirstLetter(
                                item?.positionId?.levelOfPay?.name
                              )}
                            </Text>
                          </View>
                        )}
                        <View style={globalStyles.row}>
                          <Text style={globalStyles.text1}>Site Address: </Text>
                          <Text style={globalStyles.subText}>
                            {item?.siteId?.address &&
                              `${item?.siteId?.address}`}{" "}
                            {item?.siteId?.city && `, ${item?.siteId?.city}`}
                            {item?.siteId?.state && `, ${item?.siteId?.state}`}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.expandIcon}>
                        <MaterialIcons
                          name="navigate-next"
                          size={26}
                          color="#3B4560"
                          onPress={() =>
                            navigation.navigate("ShiftDetails", {
                              id: item?._id,
                            } as never)
                          }
                        />
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
    marginVertical: 10
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
    padding: 15,
    flex: 1,
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
    // marginLeft: 5, // Add some space between the text and the icon
    alignItems: "flex-end",
    justifyContent: "center",
  },
});

export default Schedule_Attendance;
