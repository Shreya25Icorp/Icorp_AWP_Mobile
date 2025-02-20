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
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { s as tw } from 'react-native-wind';
import Footer from '../components/Footer/Footer';
import Sidebar from '../components/Sidebar/Sidebar';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_URL, SERVER_URL_ROASTERING, SERVER_URL_ROASTERING_DOMAIN } from '../Constant';
import { io } from 'socket.io-client';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomText from '../components/CustomText';
import Ionicons from 'react-native-vector-icons/Ionicons';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import FooterUser from '../components/Footer/FooterUser';
import { globalStyles } from '../styles';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AntDesign from 'react-native-vector-icons/AntDesign';
import moment from 'moment';
import SidebarUser from '../components/Sidebar/SidebarUser';

const windowWidth = Dimensions.get('window').width;

const DeclinedShift = () => {
  const navigation = useNavigation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeIcon, setActiveIcon] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState([]);
  const [userData, setUserData] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(dayjs());

  const [sidebarTranslateX] = useState(new Animated.Value(-windowWidth * 0.7));
  const [declinedShift, setDeclinedShift] = useState<any>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [clickedPage, setClickedPage] = useState(1);

  const checkpointsPerPage = 10;
  const startIndex = (currentPage - 1) * checkpointsPerPage;
  const endIndex = startIndex + checkpointsPerPage;
  const shiftsPagination = declinedShift.slice(startIndex, endIndex);

  const totalPages = Math.ceil(declinedShift.length / checkpointsPerPage);
  const renderPaginationNumbers = () => {
    const paginationNumbers = [];

    if (totalPages > 1) {
      paginationNumbers.push(
        <TouchableOpacity
          key="prev"
          style={globalStyles.paginationNumber}
          onPress={() => {
            const newPage = Math.max(currentPage - 1, 1);
            setCurrentPage(newPage);
            setClickedPage(newPage);
          }}
          disabled={currentPage === 1}>
          <Text style={globalStyles.paginationNumberText}>&lt;</Text>
        </TouchableOpacity>,
      );

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
          }}>
          <Text
            style={[
              globalStyles.paginationNumberText,
              clickedPage === 1 && globalStyles.activePaginationNumberText,
            ]}>
            1
          </Text>
        </TouchableOpacity>,
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
            }}>
            <Text style={globalStyles.paginationNumberText}>...</Text>
          </TouchableOpacity>,
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
            }}>
            <Text
              style={[
                globalStyles.paginationNumberText,
                clickedPage === i && globalStyles.activePaginationNumberText,
              ]}>
              {i}
            </Text>
          </TouchableOpacity>,
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
            }}>
            <Text style={globalStyles.paginationNumberText}>...</Text>
          </TouchableOpacity>,
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
          }}>
          <Text
            style={[
              globalStyles.paginationNumberText,
              clickedPage === totalPages &&
              globalStyles.activePaginationNumberText,
            ]}>
            {totalPages}
          </Text>
        </TouchableOpacity>,
      );

      paginationNumbers.push(
        <TouchableOpacity
          key="next"
          style={globalStyles.paginationNumber}
          onPress={() => {
            const newPage = Math.min(currentPage + 1, totalPages);
            setCurrentPage(newPage);
            setClickedPage(newPage);
          }}
          disabled={currentPage === totalPages}>
          <Text style={globalStyles.paginationNumberText}>&gt;</Text>
        </TouchableOpacity>,
      );
    }

    return paginationNumbers;
  };

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

  const startRef = useRef(dayjs());
  const endRef = useRef(dayjs());

  dayjs.extend(weekOfYear);
  dayjs.extend(isoWeek);

  const getWeekRange = (week: any) => {
    const startOfWeek = week.startOf('isoWeek'); // Monday
    const endOfWeek = week.endOf('isoWeek'); // Sunday

    return {
      start: startOfWeek,
      end: endOfWeek,
    };
  };
  const { start, end } = getWeekRange(currentWeek);

  startRef.current = start;
  endRef.current = end;

  const fetchAllDeclinedShifts = useCallback(async () => {
    try {
      setIsLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.error('No userId found in AsyncStorage');
        return;
      }
      const url = `${SERVER_URL_ROASTERING}/get/assigned/shifts/${userId}?shiftsStartDate=${startRef.current.format(
        'YYYY-MM-DD',
      )}&shiftsEndDate=${endRef.current.format(
        'YYYY-MM-DD',
      )}&shiftStatus=rejected`;

      const response = await axios.get(url, {
        withCredentials: true,
      });
      console.log('Response assigned shift==>', response.data);

      if (response?.status === 200) {
        setDeclinedShift(response?.data?.shifts || []);
      } else {
        console.error(
          'API request failed:',
          response?.status,
          response?.statusText,
        );
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Use useEffect to call fetch function only on mount
  useFocusEffect(
    useCallback(() => {
      setCurrentWeek(dayjs());
      fetchAllDeclinedShifts();
    }, [fetchAllDeclinedShifts]),
  );

  useEffect(() => {
    // Initialize the socket.io connection
    const socket = io(SERVER_URL_ROASTERING_DOMAIN);
    // Handle socket.io events
    socket.on('connect', () => {
      console.log('Socket.io connection opened');
    });

    socket.on('publishShift', async data => {
      if (data) {
        fetchAllDeclinedShifts();
      }
    });

    socket.on('editShift', async data => {
      if (data) {
        fetchAllDeclinedShifts();
      }
    });

    socket.on('punchIn', async data => {
      if (data) {
        fetchAllDeclinedShifts();
      }
    });

    socket.on('deleteShift', async data => {
      if (data) {
        fetchAllDeclinedShifts();
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket.io connection closed');
    });

    // Clean up the socket.io connection when the component is unmounted
    return () => {
      socket.disconnect();
    };
  }, []);
  const goToNextWeek = () => {
    setCurrentWeek(currentWeek.add(1, 'week'));
    fetchAllDeclinedShifts();
  };

  function capitalizeFirstLetter(string: string) {
    if (!string || typeof string !== 'string') return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const goToPreviousWeek = () => {
    setCurrentWeek(currentWeek.subtract(1, 'week'));
    fetchAllDeclinedShifts();
  };

  function capitalizeAllLetter(string: string) {
    if (!string) return '';
    return string.toUpperCase();
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View>
          <Image
            source={require('../assets/images/overlay.png')}
            style={styles.overlayImage}
            resizeMode="cover"
          />
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
        </View>
        <TouchableOpacity
          style={globalStyles.menuIconContainer}
          onPress={toggleSidebar}>
          <MaterialIcons
            name="menu-open"
            size={26}
            color="#FFFFFF"
            style={globalStyles.menuIcon}
          />
        </TouchableOpacity>

        {isSidebarOpen && (
          <SidebarUser isOpen={isSidebarOpen} onClose={toggleSidebar} />
        )}
        {isSidebarOpen && (
          <Animated.View
            style={[
              globalStyles.sidebarContainer,
              {
                transform: [{ translateX: sidebarTranslateX }],
              },
            ]}>
            <SidebarUser isOpen={isSidebarOpen} onClose={toggleSidebar} />
          </Animated.View>
        )}

        <View style={styles.whiteBox}>
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
              <CustomText style={styles.titleText}>Declined Shift</CustomText>
            </View>
          </View>
          <View style={styles.dateContainer}>
            <View style={styles.buttonContainer}>
              <Ionicons
                name="arrow-back-circle"
                size={21}
                color="#3B4560"
                onPress={goToPreviousWeek}
              />
              <View style={styles.weekContent}>
                <Ionicons
                  name="calendar-outline"
                  size={22}
                  color="black"
                  onPress={goToPreviousWeek}
                />
                <CustomText style={styles.weekText}>{`${start.format(
                  'MMM DD',
                )} - ${end.format('MMM DD')}`}</CustomText>
              </View>
              <Ionicons
                name="arrow-forward-circle-sharp"
                size={21}
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
          ) : declinedShift.length === 0 ? (
            <View style={globalStyles.emptyContainer}>
              <AntDesign
                name="closecircle"
                size={60} // Adjust the size to your desired value
                color="#C6C6C6" // Set the desired color here
              // style={styles.iconImage}
              />
              <Text style={globalStyles.noDataText}>
                No shifts available at the moment!
              </Text>
            </View>
          ) : (
            <View>
              {shiftsPagination.map((item: any, index: number) => {
                return (
                  <TouchableOpacity style={styles.personalInfocontainer} key={index} onPress={() =>
                    navigation.navigate('ShiftDetails', {
                      id: item?._id,
                    } as never)
                  }>
                    <View style={styles.content}>
                      <View style={globalStyles.row}>
                        <Text style={globalStyles.text1}>Shift Date: </Text>
                        <Text style={globalStyles.subText}>
                          {moment(item?.shiftStartDateTime).format(
                            'ddd, MMM Do YYYY',
                          )}
                        </Text>
                      </View>
                      <View style={globalStyles.row}>
                        <Text style={globalStyles.text1}>Shift Time: </Text>
                        <Text style={globalStyles.subText}>
                          {`${moment
                            .utc(item?.shiftStartDateTime)
                            .format('HH:mm')} - ${moment
                              .utc(item?.shiftEndDateTime)
                              .format('HH:mm')}`}
                        </Text>
                      </View>

                      <View style={globalStyles.row}>
                        <Text style={[globalStyles.text1]}>Site:</Text>
                        <Text style={globalStyles.subText}>
                          {capitalizeFirstLetter(item?.siteId?.siteName)}
                        </Text>
                      </View>
                      <View style={globalStyles.row}>
                        <Text style={globalStyles.text1}>Site Address: </Text>
                        <Text style={globalStyles.subText}>
                          {item?.siteId?.address && `${item?.siteId?.address}`}
                          {item?.siteId?.city && `, ${item?.siteId?.city}`}
                          {item?.siteId?.state && `, ${item?.siteId?.state}`}

                        </Text>
                      </View>
                      {/* <View style={styles.row}>
                      <Text style={styles.text}>
                        Status:{' '}
                        <Text style={[styles.subText, {color: '#D01E12'}]}>
                        {capitalizeAllLetter(item?.shiftStatus)}
                        </Text>
                      </Text>
                    </View> */}
                    </View>

                    <View style={styles.expandIcon}>
                      <MaterialIcons
                        name="navigate-next"
                        size={26}
                        color="#3B4560"
                        onPress={() =>
                          navigation.navigate('ShiftDetails', {
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
                { backgroundColor: totalPages > 1 && shiftsPagination.length > 0 ? '#fff' : 'none' },
              ]}>
              {renderPaginationNumbers()}
            </View>
          )}
        </View>
      </ScrollView>
      <FooterUser activeIcon={activeIcon} setActiveIcon={setActiveIcon} />
    </View>
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
  },
  backIcon: {
    width: 25,
    height: 25,
  },
  whiteBox: {
    marginBottom: 120,
    top: 15,
    backgroundColor: '#EDEFF4',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#EDEFF4',
    elevation: 2,
    // flex: 1
    height: '100%',
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
    padding: 15,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  text: {
    width: 90,
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
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

export default DeclinedShift;
