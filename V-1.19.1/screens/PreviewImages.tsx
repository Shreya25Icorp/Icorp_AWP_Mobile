import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import FooterUser from "../components/Footer/FooterUser";
import FeatherIcon from "react-native-vector-icons/Feather";
import Entypo from "react-native-vector-icons/Entypo";
import CustomText from "../components/CustomText";
import { globalStyles } from "../styles";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import axios from "axios";
import { SERVER_URL_ROASTERING } from "../Constant";

type RootStackParamList = {
  Preview: { images: any[]; _id: string }; // The parameters passed to the Preview screen
};

type PreviewScreenRouteProp = RouteProp<RootStackParamList, "Preview">;

const PreviewImages = () => {
  const route = useRoute<PreviewScreenRouteProp>();
  const { _id: checkpointId } = route.params;
  const checkpointName = route?.params?.checkpointName;

  const navigation = useNavigation();

  const [activeIcon, setActiveIcon] = useState<number>(1);
  const [imageLoading, setImageLoading] = useState<boolean[]>([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleLoadStart = (index: number) => {
    const updatedLoading = [...imageLoading];
    updatedLoading[index] = true;
    setImageLoading(updatedLoading);
  };

  // Function to handle image load end
  const handleLoadEnd = (index: number) => {
    const updatedLoading = [...imageLoading];
    updatedLoading[index] = false;
    setImageLoading(updatedLoading);
  };

  const getFileNameFromUrl = (url: string) => {
    // Decode the URL and extract the file name
    const decodedUrl = decodeURIComponent(url);
    const fileName = decodedUrl.split("/").pop();
    return fileName || "Unknown File";
  };

  const getFormattedFileName = (url: any) => {
    const fileName = getFileNameFromUrl(url);
    return fileName.replace(/\+/g, " ");
  };

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${SERVER_URL_ROASTERING}/get/checkpoint/doc/${checkpointId}`
      );
      setImages(response.data?.checkpointDocs?.pictures || []);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  }, [checkpointId]);

  useFocusEffect(
    useCallback(() => {
      fetchImages();
    }, [fetchImages])
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchImages().then(() => {
      setIsRefreshing(false);
    });
  }, [fetchImages]);

  return (
    <>
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
                <CustomText style={styles.titleText}>
                  {checkpointName + " Preview"}
                </CustomText>
              </View>
            </View>

            {loading ? (
              <View style={[globalStyles.centeredView, { flex: 0, top: 10 }]}>
                <View style={globalStyles.loaderCircle}>
                  <ActivityIndicator
                    size="small"
                    color="#3B4560"
                    style={globalStyles.loader}
                  />
                </View>
              </View>
            ) : images.length === 0 ? (
              <View style={globalStyles.emptyContainer}>
                <Entypo
                  name="images"
                  size={50} // Adjust the size to your desired value
                  color="#C6C6C6" // Set the desired color here
                // style={styles.iconImage}
                />
                <Text style={globalStyles.noDataText}>
                  There are no previews available right now. Check back later!
                </Text>
              </View>
            ) : (
              <View style={styles.gridContainer}>
                {images.map((item, index) => {
                  const formattedFileName = getFormattedFileName(item.url);

                  return (
                    <View style={styles.card} key={index}>
                      <TouchableOpacity
                        style={styles.cardContent}
                        onPress={() =>
                          navigation.navigate("ImageViewer", {
                            images: images.map((item) => item.url),
                            initialIndex: index,
                            checkpointName: checkpointName
                          })
                        }
                      >
                        {/* Loader and Image */}
                        {imageLoading[index] && (
                          <ActivityIndicator
                            style={styles.imageLoader}
                            size="small"
                            color="#D01E12"
                          />
                        )}
                        <Image
                          source={{ uri: item.url }}
                          style={styles.previewImage}
                          onLoadStart={() => handleLoadStart(index)}
                          onLoadEnd={() => handleLoadEnd(index)}
                        />
                        <Text style={styles.fileName}>{formattedFileName}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
        <FooterUser activeIcon={activeIcon} setActiveIcon={setActiveIcon} />
      </SafeAreaView>
    </>
  );
};

export default PreviewImages;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDEFF4",
  },
  scrollViewContent: {
    flexGrow: 1,
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
  backIconContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 30,
    paddingRight: 10,
    width: 50,
    height: 50,
  },
  backIcon: {
    width: 25,
    height: 25,
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
    paddingBottom: 200,
    // marginBottom: 20,
  },
  content: {
    // padding: 15,
    flex: 1,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 10,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 4,
    marginVertical: 5,
    width: "48%", // Adjust width for 2-column grid
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3, // For Android shadow
  },
  cardContent: {
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: "contain",
  },
  fileName: {
    color: "#3B4560",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 5,
  },
  imageLoader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -12,
    marginTop: -12,
    color: "#3C4764",
  },
  noImagesText: {
    textAlign: "center",
    fontSize: 16,
    color: "#333",
    marginTop: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
