/* eslint-disable prettier/prettier */
/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  Modal,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { s as tw } from 'react-native-wind';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import SidebarUser from '../components/Sidebar/SidebarUser';
import FooterUser from '../components/Footer/FooterUser';
import axios from 'axios';
import { SERVER_URL_ROASTERING } from '../Constant';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import dayjs from 'dayjs';
import CustomText from '../components/CustomText';
import Divider from '../components/CustomDivider';
import moment from 'moment';
import { globalStyles } from '../styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-simple-toast';

const windowWidth = Dimensions.get('window').width;

const ShiftDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeIcon, setActiveIcon] = useState<number>(null);
  const [loadingImage, setLoadingImage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [overlayVisible, setOverlayVisible] = useState(false);
  const [data, setData] = useState<any>([]);
  const [positionDoc, setPositionDoc] = useState<any>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalId, setModalId] = useState('');
  const [selectedButton, setSelectedButton] = useState<string | null>(null);
  const [uniformType, setUniformType] = useState<any>([]);

  const windowWidth = Dimensions.get('window').width;

  const [sidebarTranslateX] = useState(new Animated.Value(-windowWidth * 0.7));

  function capitalizeFirstLetter(string: string): string {
    if (!string || typeof string !== 'string') return ''; // Handle empty, undefined, or non-string values

    return string
      .split(' ') // Split the string into words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
      .join(' '); // Join the words back together with a space
  }

  function capitalizeAllLetter(string: string) {
    if (!string) return ''; // Handle empty or undefined strings
    return string.toUpperCase();
  }

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

  const fetchShiftDetails = useCallback(async () => {
    try {
      setLoading(true);
      const url = `${SERVER_URL_ROASTERING}/get/shift/${id}`;

      const response = await axios.get(url, {
        withCredentials: true,
      });
      if (response?.status === 200) {
        // console.log('Shift Details:', response?.data.shift);
        // console.log("docss",response?.data?.positionDocument?.positionDocuments);


        setData(response?.data?.shift || []);

        const sortedUniforms = response?.data?.shift?.positionId.uniform.sort(
          (a, b) => a.orderNo - b.orderNo,
        );
        setUniformType(sortedUniforms);

        setPositionDoc(response?.data?.positionDocument?.positionDocuments);
        if (response?.data?.shift?.siteId?.clientName) {
          // getJobTitle(response?.data?.shift?.siteId?.clientName);
        }
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePress = async (button: any, id: string) => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      const apiUrl = `${SERVER_URL_ROASTERING}/accept/reject/shift/${id}/${userId}`;
      const payload = {
        accept: button === 'accept' ? true : false,
        reject: button === 'reject' ? true : false,
      };
      const response = await axios.put(apiUrl, payload);
      if (response?.status === 200) {
        Toast.show(response?.data?.message, Toast.SHORT);
        setLoading(false);
        fetchShiftDetails();
      }
    } catch (error) {
      throw error;
    }
  };

  const handleButtonPress = (button: string, id: string) => {
    setSelectedButton(button);
    setModalId(id);
    setModalVisible(true);
  };

  const handleYesPress = (id: string) => {
    setModalVisible(false);
    if (selectedButton) {
      handlePress(selectedButton, id);
    }
  };

  const handleNoPress = (id: string) => {
    setModalVisible(false);
  };

  // Use useEffect to call fetch function only on mount
  useFocusEffect(
    useCallback(() => {
      fetchShiftDetails();
    }, [fetchShiftDetails]),
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchShiftDetails().then(() => {
      setIsRefreshing(false);
    });
  }, [fetchShiftDetails]);

  const handleCall = async (mobileNumber: number) => {
    try {
      const url = `tel:${mobileNumber}`;
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log('Phone call not supported');
      }
    } catch (error) {
      console.error('Error opening phone call:', error);
    }
  };

  const handleMail = async (email: any) => {
    try {
      const url = `mailto:${email}`;
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log('Mail not supported');
      }
    } catch (error) {
      console.error('Error opening email:', error);
    }
  };

  const openMaps = (address: any, city: any, state: any) => {
    const fullAddress = encodeURIComponent(
      `${address}, ${city}, ${state}, Australia`,
    );
    const url = `https://www.google.com/maps/search/?api=1&query=${fullAddress}`;
    Linking.openURL(url);
  };

  const getFileNameFromUrl = (url: string) => {
    if (!url) {
      // Return a default or fallback value if url is undefined or empty
      return 'Unknown File';
    }

    // Extract file name with extension from the URL
    const fileName = url.split('/').pop(); // Get the last part of the URL
    return fileName || 'Unknown File'; // Fallback in case of an empty string
  };

  // Usage in the formatted file name function
  const getFormattedFileName = (url: string) => {
    console.log(url);

    const fileName = getFileNameFromUrl(url);
    return fileName; // Return the exact file name
  };



  const screenHeight = Dimensions.get('window').height;

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
                <CustomText style={styles.titleText}>Shift Details</CustomText>
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
                  <View style={globalStyles.table}>
                    <View
                      style={[
                        globalStyles.tablerow,
                        { backgroundColor: '#f0f0f0' },
                      ]}>
                      <Text style={globalStyles.labelColumn}>Shift Date: </Text>
                      <Text style={globalStyles.valueColumn}>
                        {moment.utc(data?.shiftEndDateTime).format(
                          'ddd, MMM Do YYYY',
                        )}
                      </Text>
                    </View>

                    <View style={globalStyles.tablerow}>
                      <Text style={globalStyles.labelColumn}>Shift Time: </Text>
                      <Text style={globalStyles.valueColumn}>
                        {`${moment
                          .utc(data?.shiftStartDateTime)
                          .format('HH:mm')} - ${moment
                            .utc(data?.shiftEndDateTime)
                            .format('HH:mm')}`}
                      </Text>
                    </View>

                    <View
                      style={[
                        globalStyles.tablerow,
                        { backgroundColor: '#f0f0f0' },
                      ]}>
                      <Text style={[globalStyles.labelColumn]}>
                        Site Name:{' '}
                      </Text>
                      <Text style={globalStyles.valueColumn}>
                        {capitalizeFirstLetter(data?.siteId?.siteName)}
                      </Text>
                    </View>
                    {/* <View style={globalStyles.tablerow}>
                  <Text style={globalStyles.labelColumn}>Site Address: </Text>
                  <Text style={globalStyles.valueColumn}>
                    {data?.siteId?.address && `${data?.siteId?.address}`}
                    {data?.siteId?.city && `, ${data?.siteId?.city}`}
                  </Text>
                </View> */}
                    <View style={[globalStyles.tablerow]}>
                      <Text style={globalStyles.labelColumn}>Status: </Text>
                      <Text
                        style={[
                          globalStyles.valueColumn,
                          {
                            color:
                              data?.shiftStatus === 'pending'
                                ? '#8B4000'
                                : data?.shiftStatus === 'accepted'
                                  ? '#14B524'
                                  : data?.shiftStatus === 'punchIn'
                                    ? '#14B524' :
                                    data?.shiftStatus === 'completed'
                                      ? '#228B22'
                                      : '#D01E12',
                          },
                        ]}>
                        {data?.shiftStatus === 'punchIn'
                          ? 'PUNCHED IN'
                          : data?.shiftStatus === 'rejected'
                            ? 'DECLINED'
                            : capitalizeAllLetter(data?.shiftStatus)}
                      </Text>
                    </View>
                    <View
                      style={[
                        globalStyles.tablerow,
                        { backgroundColor: '#f0f0f0' },
                      ]}>
                      <Text style={globalStyles.labelColumn}>
                        Punched In On:{' '}
                      </Text>
                      <Text style={globalStyles.valueColumn}>
                        {`${moment
                          .utc(data?.attendance?.startTime)
                          .format('ddd, MMM Do YYYY HH:mm')}`}
                      </Text>
                    </View>
                    {data?.attendance?.endTime && (
                      <View style={globalStyles.tablerow}>
                        <Text style={globalStyles.labelColumn}>
                          Punched Out On:{' '}
                        </Text>
                        <Text style={globalStyles.valueColumn}>
                          {`${moment
                            .utc(data?.attendance?.endTime)
                            .format('ddd, MMM Do YYYY HH:mm')}`}
                        </Text>
                      </View>
                    )}

                    <View style={[globalStyles.tablerow]}>
                      <Text style={globalStyles.labelColumn}>Position: </Text>
                      <Text style={[globalStyles.valueColumn]}>
                        {capitalizeFirstLetter(data?.positionId?.postName)}
                      </Text>
                    </View>
                    {data?.positionId?.levelOfPay && !data?.positionId?.hiddenLevelOfPay &&
                      <View style={[globalStyles.tablerow]}>
                        <Text style={globalStyles.labelColumn}>Level of Pay: </Text>
                        <Text style={[globalStyles.valueColumn]}>
                          {capitalizeFirstLetter(data?.positionId?.levelOfPay.name)}
                        </Text>
                      </View>
                    }

                    {uniformType.length > 0 && <View style={[
                      globalStyles.tablerow,
                      { backgroundColor: '#f0f0f0' },
                    ]}>
                      <Text style={globalStyles.labelColumn}>
                        Uniform Type:{' '}
                      </Text>
                      <Text style={[globalStyles.valueColumn]}>
                        {uniformType
                          .map((uniform: any) =>
                            capitalizeFirstLetter(uniform.uniformId.name),
                          )
                          .join(', ')}
                      </Text>
                    </View>}
                    {data?.shiftStatus === 'pending' && (
                      <View style={[styles.row, { paddingTop: 15, left: 10 }]}>
                        <TouchableOpacity
                          style={[styles.button]}
                          onPress={() => handlePress('accept', id)}>
                          <MaterialIcons
                            name="check"
                            size={20}
                            color={'#D01E12'}
                          />
                          <Text style={[styles.btnText]}>Accept</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.button,
                            styles.activeButton,
                            { left: 10 },
                          ]}
                          onPress={() => handleButtonPress('reject', id)}>
                          <MaterialIcons
                            name="close"
                            size={20}
                            color={'#FFF'}
                          />
                          <Text style={[styles.activeBtnText]}>Decline</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  {/* <Divider /> */}
                  {data?.positionId?.scheduleMemo && (
                    <View style={styles.subView}>
                      <Text
                        style={[
                          styles.text,
                          { fontWeight: 'bold', fontSize: 16 },
                        ]}>
                        Notes
                      </Text>
                      <Text style={styles.subText}>
                        {data?.positionId?.scheduleMemo}
                      </Text>
                    </View>
                  )}

                  {data?.positionId?.scheduleMemo && <Divider />}

                  <View>
                    <TouchableOpacity
                      style={globalStyles.tablerow}
                      onPress={() =>
                        openMaps(
                          data?.siteId?.address,
                          data?.siteId?.city,
                          data?.siteId?.state,
                        )
                      }>
                      <Text style={globalStyles.labelColumn}>
                        Site Address:{' '}
                      </Text>
                      <Text style={globalStyles.valueColumn}>
                        {data?.siteId?.address && `${data?.siteId?.address}`}
                        {data?.siteId?.city && `, ${data?.siteId?.city}`}
                        {data?.siteId?.state && `, ${data?.siteId?.state}`}
                      </Text>
                    </TouchableOpacity>
                    <View style={globalStyles.tablerow}>
                      <Text
                        style={[
                          globalStyles.labelColumn,
                          { fontWeight: 'bold', fontSize: 16 },
                        ]}>
                        Open in Maps
                      </Text>
                      <FontAwesome5
                        name="map-marker-alt"
                        size={20}
                        color="#D01E12"
                        style={[globalStyles.valueColumn, { color: '#D01E12' }]}
                        onPress={() =>
                          openMaps(
                            data?.siteId?.address,
                            data?.siteId?.city,
                            data?.siteId?.state,
                          )
                        }
                      />
                    </View>
                    {/* <View style={styles.row}>
                        <Text style={styles.text}>
                          Country: <Text style={styles.subText}>Australia</Text>
                        </Text>
                      </View> */}
                  </View>

                  {/* {(data?.siteId?.clientName ||
                    data?.siteId?.jobTitle ||
                    data?.siteId?.email ||
                    data?.siteId?.phone ||
                    data?.siteId?.phoneOther) && (
                      <View style={styles.subView}>
                        <Text
                          style={[
                            styles.text,
                            { fontWeight: 'bold', fontSize: 16, width: '100%' },
                          ]}>
                          Site Contacts
                        </Text>

                        {(data?.siteId?.clientName || data?.siteId?.jobTitle) && (
                          <View style={[globalStyles.row, { paddingTop: 10 }]}>
                            <FontAwesome5
                              name="user-alt"
                              size={18}
                              color="black"
                            />
                            <Text
                              style={[globalStyles.subText, styles.contactText]}>
                              {data?.siteId?.clientName &&
                                capitalizeFirstLetter(data?.siteId?.clientName)}
                              {data?.siteId?.clientName && data?.siteId?.jobTitle
                                ? ' ('
                                : ''}
                              {data?.siteId?.jobTitle &&
                                capitalizeFirstLetter(data?.siteId?.jobTitle)}
                              {data?.siteId?.clientName && data?.siteId?.jobTitle
                                ? ')'
                                : ''}
                            </Text>
                          </View>
                        )}

                        {data?.siteId?.email && (
                          <TouchableOpacity
                            style={globalStyles.row}
                            onPress={() => handleMail(data?.siteId?.email)}>
                            <MaterialIcons name="email" size={18} color="black" />
                            <Text
                              style={[globalStyles.subText, styles.contactText]}>
                              {data?.siteId?.email}
                            </Text>
                          </TouchableOpacity>
                        )}

                        <View style={[globalStyles.row]}>
                          {data?.siteId?.phone && (
                            <TouchableOpacity
                              style={[globalStyles.row]}
                              onPress={() => handleCall(data?.siteId?.phone)}>
                              <MaterialIcons
                                name="phone"
                                size={18}
                                color="black"
                              />
                              <Text
                                style={[
                                  globalStyles.subText,
                                  styles.contactText,
                                ]}>
                                {data?.siteId?.phone}
                              </Text>
                            </TouchableOpacity>
                          )}

                          {data?.siteId?.phoneOther && (
                            <TouchableOpacity
                              style={[globalStyles.row]}
                              onPress={() =>
                                handleCall(data?.siteId?.phoneOther)
                              }>
                              <MaterialIcons
                                name="phone"
                                size={20}
                                color="black"
                                style={{ marginLeft: 20 }}
                              />
                              <Text
                                style={[
                                  globalStyles.subText,
                                  styles.contactText,
                                ]}>
                                {data?.siteId?.phoneOther}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    )} */}

                  {positionDoc.length > 0 && (
                    <View style={[styles.subView, { top: -10 }]}>
                      {(data?.siteId?.clientName ||
                        data?.siteId?.jobTitle ||
                        data?.siteId?.email ||
                        data?.siteId?.phone ||
                        data?.siteId?.phoneOther) && <Divider />}
                      <Text
                        style={[
                          styles.text,
                          {
                            fontWeight: 'bold',
                            fontSize: 16,
                            width: 'auto',
                            paddingTop: 10,
                          },
                        ]}>
                        Position Documents
                      </Text>
                      {positionDoc.map((item: any, index: number) => {
                        const formattedFileName = getFormattedFileName(item.url);
                        return (
                          <TouchableOpacity
                            style={{ paddingTop: 10, flexDirection: 'row' }}
                            key={index}
                            onPress={() =>
                              navigation.navigate('FileViewer', {
                                uri: item?.url,
                                type: getFileNameFromUrl(item?.url) === 'pdf' ? 'pdf' : 'image',
                              })
                            }
                          >
                            <Entypo name="attachment" size={16} color="#3B4560" />
                            <Text
                              style={[
                                styles.subText,
                                {
                                  color: '#3B4560',
                                  textDecorationLine: 'underline',
                                  marginLeft: 5,
                                  fontSize: 16,
                                },
                              ]}
                            >
                              {formattedFileName}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
                <Modal
                  animationType="fade"
                  transparent={true}
                  visible={modalVisible}
                  onRequestClose={() => {
                    setModalVisible(!modalVisible);
                  }}>
                  <View style={globalStyles.modalOverlay}>
                    <View style={globalStyles.modalContent}>
                      <Text style={globalStyles.modalText}>
                        Are you sure you want to{' '}
                        <Text style={{ fontWeight: 'bold' }}>
                          {selectedButton}
                        </Text>{' '}
                        this shift?
                      </Text>
                      <View style={globalStyles.modalButtons}>
                        <TouchableOpacity
                          style={globalStyles.modalButton}
                          onPress={() => handleNoPress(modalId)}>
                          <Text style={globalStyles.modalButtonText}>No</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={globalStyles.modalButton}
                          onPress={() => handleYesPress(modalId)}>
                          <Text style={globalStyles.modalButtonText}>Yes</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>
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
    backgroundColor: '#FFFFFF',
    top: -15,
    marginHorizontal: 8,
    borderRadius: 10,
  },
  whiteMargin: {
    marginTop: 15,
  },
  container: {
    flex: 1,
    backgroundColor: '#EDEFF4',
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
  recentActivitiesBlock: {
    borderRadius: 20,
    marginVertical: 10,
    marginBottom: 100,
  },
  textContainer: {
    // position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    // paddingHorizontal: 24,
    width: '100%',
    justifyContent: 'center',
    marginTop: 10,
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
  dateContainer: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // top: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  weekText: {
    fontSize: 14,
    color: '#000',
    left: 5,
  },
  weekContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  backIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 30,
    paddingRight: 10,
    width: 50,
    height: 50,
  },
  personalInfocontainer: {
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: '#fff',
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
    top: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems: 'center',
    marginHorizontal: 10,
  },
  content: {
    // padding: 15,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  text: {
    width: 100,
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
    flexShrink: 0,
    // flex: 1
  },
  subText: {
    fontSize: 14,
    color: '#000',
    fontWeight: 'normal',
    flex: 1, // Take up remaining space
    flexWrap: 'wrap',
  },
  button: {
    borderWidth: 1,
    borderColor: '#D01E12', // Change color as needed
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
    flexDirection: 'row',
  },
  btnText: {
    fontSize: 14,
    color: '#D01E12',
    textAlign: 'center',
  },
  activeButton: {
    backgroundColor: '#D01E12',
  },
  activeBtnText: {
    color: '#fff',
  },
  expandIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    right: 30,
  },
  mapView: {
    flexDirection: 'row',
  },
  contactText: {
    marginLeft: 10,
  },
  subView: {
    padding: 10,
  },
});

export default ShiftDetails;
