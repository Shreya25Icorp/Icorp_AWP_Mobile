/* eslint-disable prettier/prettier */
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  RefreshControl,
  TextInput,
  FlatList,
} from "react-native";
import FeatherIcon from "react-native-vector-icons/Feather";
import CustomText from "../components/CustomText";
import FooterUser from "../components/Footer/FooterUser";
import { SERVER_URL_ROASTERING } from "../Constant";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dimensions, Animated, Easing } from "react-native";
import { globalStyles } from "../styles";
import SidebarUser from "../components/Sidebar/SidebarUser";
import { ActivityIndicator } from "react-native-paper";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const windowWidth = Dimensions.get("window").width;

const SiteList = () => {
  const navigation = useNavigation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [activeIcon, setActiveIcon] = useState<number>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [sidebarTranslateX] = useState(new Animated.Value(-windowWidth * 0.7));
  const [imageLoading, setImageLoading] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [isPressed, setIsPressed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1); // Page state for pagination
  const [hasMore, setHasMore] = useState(true); // Check if more data is available
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const limit = 10;

  const handleLoadEnd = (index) => {
    setImageLoading((prev) => ({
      ...prev,
      [index]: false,
    }));
  };
  const handleLoadStart = (index) => {
    setImageLoading((prev) => ({
      ...prev,
      [index]: true,
    }));
  };

  const getFileNameFromUrl = (url: string) => {
    const decodedUrl = decodeURIComponent(url);
    const fileName = decodedUrl.split("/").pop();
    return fileName || "Unknown File";
  };

  const getFormattedFileName = (url: string) => {
    const fileName = getFileNameFromUrl(url);
    return fileName.replace(/\+/g, " ");
  };

  // const fetchReportDetails = async () => {
  //   if (isLoading || !hasMore) return;

  //   setIsLoading(true);

  //   try {
  //     const response = await axios.get(
  //       `${SERVER_URL_ROASTERING}/get/sites/checkpoints`,
  //       {
  //         params: {
  //           page,
  //           limit: 10, // Set the limit of items per page
  //           search: searchQuery,
  //         },
  //         withCredentials: true,
  //       }
  //     );

  //     const newSites = response.data?.sites || [];
  //     const totalItems = response.data?.total || 0;

  //     setData((prevData) =>
  //       page === 1 ? newSites : [...prevData, ...newSites]
  //     );
  //     setHasMore(page * 10 < totalItems);
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const fetchReportDetails = useCallback(async () => {
    console.log("search----", searchQuery);
    setIsLoading(true);
    try {
      console.log("Try====>");
      const response = await axios.get(`${SERVER_URL_ROASTERING}/get/sites/checkpoints`, {
        params: {
          page,
          limit,
          ...(searchQuery?.length > 0 && { search: searchQuery }),
        },
        withCredentials: true,
      });
      const newData = response.data.sites || [];
      const totalItems = response.data.total || 0;
      setData((prevData) => (page === 1 ? newData : [...prevData, ...newData]));
      setHasMore(page * limit < totalItems);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchQuery]);


  // Fetch data on page load and when `page` or `searchQuery` changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      fetchReportDetails();
    }, [fetchReportDetails])
  );
  const loadMoreItems = () => {
    if (!isLoading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const onEndReached = () => {
    if (!isLoading && hasMore) {
      loadMoreItems();
    }
  };

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchReportDetails().then(() => {
      setIsRefreshing(false);
    });
  }, [fetchReportDetails]);

  function capitalizeFirstLetter(string: string): string {
    if (!string || typeof string !== "string") return ""; // Handle empty, undefined, or non-string values

    return string
      .split(" ") // Split the string into words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
      .join(" "); // Join the words back together with a space
  }

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.card, isPressed ? styles.cardPressed : styles.cardDefault]}
      onPress={() =>
        navigation.navigate("SitePINScreen", {
          siteId: item,
        })
      }
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      key={index}
    >
      <View style={[styles.cardContent]}>
        <View style={styles.imageContainer}>
          {imageLoading[index] && (
            <ActivityIndicator
              style={styles.imageLoader}
              size="small"
              color="#D01E12"
            />
          )}
          <Image
            source={
              item?.logo
                ? { uri: item.logo }
                : require("../assets/images/site.jpeg") // Default image
            }
            style={styles.previewImage}
            onLoadStart={() => handleLoadStart(index)}
            onLoadEnd={() => handleLoadEnd(index)}
          />
        </View>
        <View style={styles.siteInfoContainer}>
          <View style={styles.siteInfo}>
            <View style={styles.row}>
              <AntDesign
                name="earth"
                size={16}
                color="#12606D"
                style={styles.icon}
              />
              <Text
                style={[styles.fileName, { fontWeight: "bold", fontSize: 14 }]}
              >
                {item.siteName}
              </Text>
            </View>
            {item.address || item.city || item.state ? (
              <View style={styles.row}>
                <MaterialIcons
                  name="location-pin"
                  size={16}
                  color="#D01E12"
                  style={styles.icon}
                />
                <Text style={[styles.fileName, { color: "#333" }]}>
                  {item.address ? `${item.address}, ` : ""}
                  {item.city ? `${item.city}, ` : ""}
                  {item.state ? item.state : ""}
                </Text>
              </View>
            ) : null}
          </View>
          <MaterialIcons
            name="keyboard-arrow-right"
            size={24}
            color="#000"
            style={styles.arrowIcon}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
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
            <CustomText style={styles.titleText}>Sites / Locations</CustomText>
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
                placeholder="Search Sites"
                placeholderTextColor={"#A0A0A0"}
                value={searchQuery}
                onChangeText={(text) => setSearchQuery(text)}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  style={globalStyles.clearIconContainer}
                >
                  <Icon name="close-circle" size={20} color="#ccc" />
                </TouchableOpacity>
              )}
            </View>
            <FlatList
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
            {data?.length === 0 && (
              <Text style={styles.noMoreRecordsText}>No more sites found</Text>
            )}
          </View>
        </View>
      </View>
      <FooterUser activeIcon={activeIcon} setActiveIcon={setActiveIcon} />
    </SafeAreaView>
  );
};

export default SiteList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  personalInfocontainer: {
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
    paddingBottom: 250,
  },
  content: {
    // padding: 15,
    flex: 1,
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

  backIconContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 30,
    paddingRight: 10,
    width: 50,
    height: 50,
  },
  list: {
    paddingVertical: 10,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 16,
    color: "#000",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationBubble: {
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  notificationText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  screenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#C1DADE",
    borderColor: "#12606D",
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
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F0F0F0",
    overflow: "hidden",
    marginRight: 12, // Space between image and text
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  siteInfoContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  siteInfo: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    width: "92%",
    // flex: 1,
    // flexWrap: "wrap",
  },
  icon: {
    marginRight: 8,
    textAlignVertical: "top",
  },
  fileName: {
    fontSize: 13,
    color: "#12606D",
  },
  arrowIcon: {
    marginLeft: 8,
  },
  cardDefault: {
    backgroundColor: "#C1DADE", // Default background color
  },
  cardPressed: {
    backgroundColor: "#C1DADE", // Background color on press
  },
  imageLoader: {
    position: "absolute", // Overlay loader on top of the image
    zIndex: 1, // Ensure the loader is above the image
  },
  noMoreRecordsText: {
    textAlign: "center",
    color: "gray",
    paddingVertical: 10,
  },
});
