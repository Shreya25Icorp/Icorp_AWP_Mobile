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
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  NEXT_PUBLIC_MONITORING_OPTION_ID_DO_NOT,
  NEXT_PUBLIC_MONITORING_OPTION_ID_INTRERWAL,
  SERVER_URL_ROASTERING,
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
import InfiniteScroll from "react-infinite-scroll-component";

const windowWidth = Dimensions.get("window").width;

interface Checkpoint {
  checkpointMonitoringOptions: any;
  scanRequestInterval: any;
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

function capitalizeFirstLetter(string: string): string {
  if (!string || typeof string !== "string") return "";

  return string
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const Checkpoints = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { siteId } = route.params;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeIcon, setActiveIcon] = useState<number>(1);

  const [sidebarTranslateX] = useState(new Animated.Value(-windowWidth * 0.7));
  const [showPrev, setShowPrev] = useState(false);
  const [searchQuery, setSearchQuery] = useState<any>("");

  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const [data, setData] = useState<Checkpoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchData = useCallback(async () => {
    console.log("search----", searchQuery);
    setIsLoading(true);

    try {
      console.log("Try====>");

      const response = await axios.get(`${SERVER_URL_ROASTERING}/get/all/checkpoints`, {
        params: {
          page,
          limit,
          siteId: siteId._id,
          ...(searchQuery?.length > 0 && { search: searchQuery }),
        },
        withCredentials: true,
      });

      const newData = response.data.checkpoints || [];
      const totalItems = response.data.total || 0;

      setData((prevData) => (page === 1 ? newData : [...prevData, ...newData]));
      setHasMore(page * limit < totalItems);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, siteId, searchQuery]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // useEffect(() => {
  //   if (searchQuery?.length === 0 || searchQuery?.length > 2) {
  //     fetchData();
  //   }
  // }, [page, searchQuery]);



  const loadMoreItems = () => {
    if (!isLoading && hasMore) {
      setPage((prevPage) => prevPage + 1);
      console.log('====================================');
      console.log("page load more-->>", page);
      console.log('====================================');
    }
  };

  const onEndReached = () => {
    if (!isLoading && hasMore) {
      console.log('====================================');
      console.log("is load more called",);
      console.log('====================================');
      loadMoreItems();
    }
  };


  const renderItem = ({ item }: { item: Checkpoint }) => (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("ConfigureNFC", {
          id: item._id,
          checkpointName: item?.checkpointName,
        });
      }}
      key={item._id}
      style={styles.locationBlockContainer}
    >
      <View style={styles.mainLoc}>
        <MaterialIcons
          name="my-location"
          size={30}
          color="#3C4764"
          style={styles.locationBlock}
        />
        <View style={styles.locationText}>
          <Text style={styles.locationBlockText}>
            {(item.checkpointName)}
          </Text>
          <View style={styles.locContainer}>
            <MaterialIcons
              name="location-pin"
              size={17}
              color="#D01E12"
              style={styles.locationIcon}
            />
            <Text style={styles.NumberGuardsText}>
              {(item.location.name)}
              {item.subLocation && item.subLocation.name
                ? `, ${(item.subLocation.name)}`
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
            <Text style={styles.NumberGuardsText}>{item.siteId.siteName}</Text>
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
                ? "Scanned Randomly"
                : item.checkpointMonitoringOptions._id ===
                  NEXT_PUBLIC_MONITORING_OPTION_ID_INTRERWAL
                  ? `Regular Interval - [${item.scanRequestInterval}]`
                  : "Fix Time"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // function capitalizeFirstLetter(string: string): string {
  //   if (!string || typeof string !== "string") return "";

  //   return string
  //     .split(" ")
  //     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  //     .join(" ");
  // }

  function capitalizeAllLetter(string: string) {
    if (!string) return "";
    return string.toUpperCase();
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={"#3C4764"}
            />
          }
        > */}
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
          {/* <TouchableOpacity
            style={styles.backIconContainer}
            onPress={() => navigation.navigate("SiteList" as never)}
          >
            <FeatherIcon
              name="arrow-left"
              size={22}
              color="#000"
              style={styles.backIcon}
            />
          </TouchableOpacity> */}
          <View style={styles.titleContainer}>
            <CustomText style={styles.titleText}>Checkpoints</CustomText>
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
                style={globalStyles.searchInput}
                placeholder="Search Checkpoints"
                placeholderTextColor={"#A0A0A0"}
                value={searchQuery}
                onChangeText={(text) => setSearchQuery(text)}
              />
              {/* Clear Icon */}
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    console.log("SearchQuery remove====");
                    setSearchQuery("")
                  }}
                  style={globalStyles.clearIconContainer}
                >
                  <Icon name="close-circle" size={20} color="#ccc" />
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              contentContainerStyle={{ flexGrow: 1, }}
              data={data}
              renderItem={renderItem}
              keyExtractor={(item) => item._id}
              onEndReached={onEndReached}
              onEndReachedThreshold={0.1}
              ListFooterComponent={
                isLoading ? (
                  <ActivityIndicator size="large" color="#3C4764" />
                ) : null
              }
            />
            {/* </View> */}


            {data?.length === 0 && (
              <Text style={styles.noMoreRecordsText}>
                No more checkpoints found
              </Text>
            )}
          </View>
        </View>
      </View>
      {/* </ScrollView> */}
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
    // marginVertical: 10,
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
    paddingBottom: 270,
    // marginBottom: 20,
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
  // searchContainer: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   justifyContent: "center",
  //   backgroundColor: "#FFFFFF",
  //   borderRadius: 50,
  //   borderWidth: 1,
  //   borderColor: "#D3D3D3",
  //   padding: 8,
  //   // height: 34,
  //   width: "90%",
  //   alignSelf: "center",
  //   marginBottom: 15,
  //   marginTop: 15,
  // },

  // searchIcon: {
  //   marginRight: 8,
  // },
  // searchInput: {
  //   flex: 1,
  //   color: "#333",
  //   fontSize: 12,
  // },
  locationBlockContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DEF2D6",
    borderColor: "#118B50",
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 4,
    marginHorizontal: 10,
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
