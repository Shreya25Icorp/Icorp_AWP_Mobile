/* eslint-disable prettier/prettier */
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import CustomText from '../components/CustomText';
import FooterUser from '../components/Footer/FooterUser';
import { SERVER_URL_ROASTERING } from '../Constant';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions, Animated, Easing } from 'react-native';
import { globalStyles } from '../styles';
import SidebarUser from '../components/Sidebar/SidebarUser';
import { ActivityIndicator } from 'react-native-paper';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
const windowWidth = Dimensions.get('window').width;

const Documents = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const activeShift = route?.params?.activeShift;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [activeIcon, setActiveIcon] = useState<number>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [sidebarTranslateX] = useState(new Animated.Value(-windowWidth * 0.7));
  const [imageLoading, setImageLoading] = useState<{ [key: number]: boolean }>(
    {},
  );
  const defaultPDF = {
    document:
      'https://icorp-rostering.s3.ap-southeast-2.amazonaws.com/Position_doc/ICorp+Security+-+Serious+incidents+241127v3.pdf',
  };

  const handleLoadEnd = (index: any) => {
    setImageLoading(prev => ({
      ...prev,
      [index]: false, // Set to false when the image has loaded
    }));
  };
  const handleLoadStart = (index: any) => {
    setImageLoading(prev => ({
      ...prev,
      [index]: true, // Set to true when the image starts loading
    }));
  };

  const getFileNameFromUrl = (url: string) => {
    // Decode the URL and extract the file name
    const decodedUrl = decodeURIComponent(url);
    const fileName = decodedUrl.split('/').pop(); // Get the last part of the URL
    return fileName || 'Unknown File'; // Fallback in case of an empty string
  };

  // Usage in the formatted file name function
  const getFormattedFileName = (url: string) => {
    const fileName = getFileNameFromUrl(url);
    // Replace '+' with space in the file name
    return fileName.replace(/\+/g, ' ');
  };

  const fetchReportDetails = useCallback(async () => {
    try {
      setLoading(true);

      // Initialize an empty list for default documents
      const defaultData: any[] = [];

      const response = await axios.get(`${SERVER_URL_ROASTERING}/get/button`, {
        withCredentials: true,
      });

      if (response?.data?.success) {
        // Extract all document URLs
        const documents = response.data.button
          .filter((item: any) => Array.isArray(item.document) && item.document.length > 0)
          .flatMap((item: any) =>
            item.document.map((doc: string) => ({
              name: item.name, // Include name or other metadata if needed
              document: doc,
            }))
          );

        console.log(documents);

        defaultData.push(...documents); // Add them to the document list
      }

      if (activeShift) {
        const url = `${SERVER_URL_ROASTERING}/get/site/documents/user/${activeShift?.siteId?._id}`;

        const response = await axios.get(url, {
          withCredentials: true,
        });
        if (response?.data?.success === true) {
          const fetchedData = response?.data?.documents || [];
          setData([...defaultData, ...fetchedData]);
          return;
        }
      }

      // If user is not clocked in, show only default PDFs
      setData(defaultData);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchReportDetails();
    }, [fetchReportDetails]),
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchReportDetails().then(() => {
      setIsRefreshing(false);
    });
  }, [fetchReportDetails]);


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={"#3C4764"} />
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
                source={require('../assets/images/awp_logo.png')}
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
                onPress={() => navigation.goBack()}>
                <FeatherIcon
                  name="arrow-left"
                  size={22}
                  color="#000"
                  style={styles.backIcon}
                />
              </TouchableOpacity> */}
              <View style={styles.titleContainer}>
                <CustomText style={styles.titleText}>Site Documents</CustomText>
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
            ) : data.length === 0 ? (
              <View style={globalStyles.emptyContainer}>
                <FontAwesome5Icon
                  name="folder-open"
                  size={50} // Adjust the size to your desired value
                  color="#C6C6C6" // Set the desired color here
                // style={styles.iconImage}
                />
                <Text style={globalStyles.noDataText}>
                  There are no documents available right now. Check back later!
                </Text>
              </View>
            ) : (
              <View style={styles.gridContainer}>
                {data.map((item, index) => {
                  const formattedFileName = getFormattedFileName(item.document);
                  const isPDF = formattedFileName.endsWith('.pdf'); // Determine if the file is a PDF

                  return (
                    <View style={styles.card} key={index}>
                      <TouchableOpacity
                        style={styles.cardContent}
                        onPress={() =>
                          navigation.navigate('FileViewer', {
                            uri: item?.document,
                            type: isPDF ? 'pdf' : 'image',
                          })
                        }>
                        {/* Show loader only for the current image */}
                        {imageLoading[index] && (
                          <ActivityIndicator
                            style={globalStyles.imageLoader}
                            size="small"
                            color="#D01E12"
                          />
                        )}

                        {/* Show generated PDF thumbnail or actual image */}
                        {isPDF ? (
                          <Image
                            source={require('../assets/images/pdf.png')}
                            style={styles.previewImage}
                            onLoadStart={() => handleLoadStart(index)}
                            onLoadEnd={() => handleLoadEnd(index)}
                          />
                        ) : (
                          <Image
                            source={{ uri: item?.document }}
                            style={styles.previewImage}
                            onLoadStart={() => handleLoadStart(index)}
                            onLoadEnd={() => handleLoadEnd(index)}
                          />
                        )}

                        <Text style={styles.fileName}>{formattedFileName}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      <FooterUser activeIcon={activeIcon} setActiveIcon={setActiveIcon} />
    </SafeAreaView>
  );
};

export default Documents;

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
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
  },
  logoImage: {
    width: 200,
    height: 50,
  },
  textContainer: {
    // position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    // paddingHorizontal: 24,
    width: '100%',
    justifyContent: 'center',
    marginVertical: 10,
  },
  titleContainer: {
    flex: 1,
    // alignItems: 'center',
    marginRight: 30,
  },
  titleText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#000',
    fontWeight: 'bold',
    marginLeft: 30
  },
  backIcon: {
    width: 25,
    height: 25,
  },

  backIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 30,
    paddingRight: 10,
    width: 50,
    height: 50,
  },
  list: {
    paddingVertical: 10,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 16,
    color: '#000',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBubble: {
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  notificationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 4,
    marginVertical: 5,
    width: '48%', // Adjust width for 2-column grid
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3, // For Android shadow
  },
  cardContent: {
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  fileName: {
    color: '#3B4560',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
  nextIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
});
