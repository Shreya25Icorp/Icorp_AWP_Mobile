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
  FlatList,
  Platform,
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

interface Checkpoint {
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

const Checkpoints = () => {
  const navigation = useNavigation();
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
  const [searchQuery, setSearchQuery] = useState("");

  const scrollViewRef = useRef<ScrollView>(null);

  // Function to scroll to the top
  const scrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const [data, setData] = useState<Checkpoint[]>([]); // Typing data as an array of Checkpoint
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1); // Track current page
  const endReachedThreshold = Platform.OS === 'ios' ? 0.8 : 0.5;

  const fetchData = useCallback(
    async (page: number, limit: number) => {
      try {
        setIsLoading(true);

        const response = await axios.get(`${SERVER_URL_ROASTERING}/get/all/checkpoints`, {
          params: { page, limit, search: searchQuery },
        });

        const newData = response.data.checkpoints;

        // If the new data is less than the limit, set hasMore to false
        if (newData.length < limit) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        // Filter out duplicates based on _id before setting data
        setData((prevData) => {
          const uniqueData = [...prevData, ...newData].filter(
            (value, index, self) => index === self.findIndex((t) => t._id === value._id)
          );
          return uniqueData; // Update state with unique data
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery]
  );

  // Reset page and data when searchQuery changes
  useEffect(() => {
    setPage(1); // Reset page to 1 for new search
    setData([]); // Clear previous data
    setHasMore(true); // Reset hasMore flag
    fetchData(1, 8); // Fetch data for the new search query
  }, [searchQuery, fetchData]);

  // Use useFocusEffect to call fetchData when the screen is focused
  useEffect(() => {
    if (hasMore) {
      fetchData(page, 8); // Fetch data when page changes and there are more records
    }
  }, [page, hasMore, fetchData]);

  const loadMoreItems = () => {
    if (isLoading || !hasMore) return;
    setPage((prevPage) => prevPage + 1);
  };


  const renderItem = ({ item }: { item: Checkpoint }) => (
    <TouchableOpacity
      key={item._id}
      onPress={() =>
        navigation.navigate("ConfigureNFC", { id: item._id })
      }
    >
      <View style={styles.locationBlockContainer}>
        <View style={styles.mainLoc}>
          <MaterialIcons
            name="my-location"
            size={30}
            color="#3C4764"
            style={styles.locationBlock}
          />
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
                {item.location.name}
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
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );



  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       setIsLoading(true);

  //       let page = 1;
  //       let limit = 10;

  //       const response = await axios.get(
  //         `${SERVER_URL_ROASTERING}/get/all/checkpoints`,
  //         {
  //           params: { page, limit },
  //         }
  //       );
  //       setData(response.data.checkpoints);

  //     } catch (error: any) {
  //       console.error("Error fetching data:", error);
  //       setError(error); // Store the error for UI feedback
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, []);















  // useFocusEffect(
  //   useCallback(() => {
  //     const fetchData = async () => {
  //       try {
  //         setIsLoading(true);

  //         let page = 1;
  //         let limit = 10;

  //         const response = await axios.get(
  //           `${SERVER_URL_ROASTERING}/get/all/checkpoints`,
  //           {
  //             params: { page, limit },
  //           }
  //         );
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

  const dummyLocations = [
    {
      id: "1",
      name: "Checkpoint Alpha",
      client: "Site A",
      location: "Location A",
    },
    {
      id: "2",
      name: "Checkpoint Bravo",
      client: "Site B",
      location: "Location B",
    },
    {
      id: "3",
      name: "Checkpoint Charlie",
      client: "Site C",
      location: "Location C",
    },
    {
      id: "4",
      name: "Checkpoint Delta",
      client: "Site D",
      location: "Location D",
    },
    {
      id: "5",
      name: "Checkpoint Alpha",
      client: "Site A",
      location: "Location A",
    },
    {
      id: "6",
      name: "Checkpoint Bravo",
      client: "Site B",
      location: "Location B",
    },
    {
      id: "7",
      name: "Checkpoint Charlie",
      client: "Site C",
      location: "Location C",
    },
    {
      id: "8",
      name: "Checkpoint Delta",
      client: "Site D",
      location: "Location D",
    },
    {
      id: "9",
      name: "Checkpoint Alpha",
      client: "Site A",
      location: "Location A",
    },
    {
      id: "10",
      name: "Checkpoint Bravo",
      client: "Site B",
      location: "Location B",
    },
    {
      id: "11",
      name: "Checkpoint Charlie",
      client: "Site C",
      location: "Location C",
    },
    {
      id: "12",
      name: "Checkpoint Delta",
      client: "Site D",
      location: "Location D",
    },
  ];

  // console.log("shiftsPagination====>", shiftsPagination);


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

  function capitalizeFirstLetter(string: string): string {
    if (!string || typeof string !== "string") return "";

    return string
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function capitalizeAllLetter(string: string) {
    if (!string) return "";
    return string.toUpperCase();
  }

  return (
    <>

      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
        >
          <View>
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
                  <CustomText style={styles.titleText}>Checkpoints</CustomText>
                </View>
              </View>
              <View style={styles.personalInfocontainer}>
                <View style={styles.content}>
                  <View style={styles.searchContainer}>
                    <Icon
                      name="magnify"
                      size={20}
                      color="#3C4764"
                      style={styles.searchIcon}
                    />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search Checkpoints"
                      placeholderTextColor="#A0A0A0"
                      value={searchQuery}
                      onChangeText={(text) => setSearchQuery(text)}
                    />
                  </View>
                  {/* <FlatList
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    onEndReached={loadMoreItems}
                    onEndReachedThreshold={0.8} // Try adjusting the threshold value here
                    ListFooterComponent={
                      isLoading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                      ) : null
                    }
                    ListFooterComponentStyle={styles.footer}
                  /> */}
                  <FlatList
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    onEndReached={loadMoreItems}
                    onEndReachedThreshold={endReachedThreshold} // Use platform-specific threshold
                    ListFooterComponent={
                      isLoading ? <ActivityIndicator size="large" color="#0000ff" /> : null
                    }
                    ListFooterComponentStyle={styles.footer}
                  />
                  {!hasMore && (
                    <Text style={styles.noMoreRecordsText}>No more checkpoints found</Text>
                  )}

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
                  />
                  {!hasMore && (
                    <Text style={styles.noMoreRecordsText}>No more checkpoints found</Text>
                  )} */}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
        <FooterUser activeIcon={activeIcon} setActiveIcon={setActiveIcon} />
      </SafeAreaView>
    </>
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

export default Checkpoints;
