/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
/* eslint-disable quotes */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  BackHandler,
  Alert,
  Platform,
  Linking,
  Animated,
  Easing,
  SafeAreaView,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
  Pressable,
  PermissionsAndroid
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useSelector } from 'react-redux';
import store, { RootState } from '../../store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io, { Socket } from 'socket.io-client';
import axios from 'axios';
import Toast from 'react-native-simple-toast';
import SidebarUser from '../Sidebar/SidebarUser';
import FooterUser from '../Footer/FooterUser';
import {
  SERVER_URL_ROASTERING,
  SERVER_URL_ROASTERING_DOMAIN,
} from '../../Constant';
import ReactNativeRestart from 'react-native-restart';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Cookies from '@react-native-cookies/cookies';
import CustomText from '../CustomText';
// import dayjs from 'dayjs';
// import utc from 'dayjs/plugin/utc';
// import timezone from 'dayjs/plugin/timezone';
// import advancedFormat from 'dayjs/plugin/advancedFormat';
import moment from 'moment';
// import 'moment-timezone';
import { globalStyles } from '../../styles';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import { FlatList } from 'react-native-gesture-handler';
import Geolocation from 'react-native-geolocation-service';

// import { getCookieHeader } from '../../Constant';
const windowWidth = Dimensions.get('window').width;

// dayjs.extend(advancedFormat);
// dayjs.extend(utc);
// dayjs.extend(timezone);

const DATA = [
  { id: '1', title: 'Activity Log', screen: 'SiteActivityLog' },
  { id: '2', title: 'Incident Report', screen: 'IncidentReport' },
  { id: '3', title: 'Maintenance Issue', screen: 'MaintenanceReport' },
];

const UserHome = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();

  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeIcon, setActiveIcon] = useState<number>(0);
  const [loadingImage, setLoadingImage] = useState(false);

  const [loadingUpcoming, setLoadingUpcoming] = useState<boolean>(false);
  const [loadingFollowing, setLoadingFollowing] = useState<boolean>(false);

  //fetch states
  const [data, setData] = useState<any>([]);
  const [upcomingShift, setUpcomingShift] = useState<any>([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [followingStartDate, setFollowingStartDate] = useState(null);
  const [followingEndDate, setFollowingEndDate] = useState(null);

  const [followingShift, setFollowingShift] = useState<any>([]);
  const [uniformType, setUniformType] = useState<any>([]);
  const [nextUniformType, setNextUniformType] = useState<any>([]);

  const [shiftCount, setShiftCount] = useState<any>([]);

  const [image, setImage] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(dayjs());

  const [modalVisible, setModalVisible] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isFollowingEnabled, setIsFollowingEnabled] = useState(false);
  const [min, setMin] = useState(null);
  const [footerRefreshKey, setFooterRefreshKey] = useState(0);
  const [locationMeters, setLocationMeters] = useState(100)
  const [locationPermission, setLocationPermission] = useState(false);
  const [isAtLocation, setIsAtLocation] = useState(false);
  const [wasAtLocation, setWasAtLocation] = useState(false);
  const [wasFollowingAtLocation, setWasFollowingAtLocation] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isFollowingClockedIn, setIsFollowingClockedIn] = useState(false);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);

  // const toggleSidebar = () => {
  //     setIsSidebarOpen(!isSidebarOpen);
  // };

  const [sidebarTranslateX] = useState(new Animated.Value(-windowWidth * 0.7));

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

  const handleClockInOut = async (shiftId: string, isClockIn: boolean) => {
    try {
      if (isClockIn) {
        handleClockIn(shiftId, isClockIn); // Call your Clock In function
      } else {
        handleClockOut(shiftId, isClockIn); // Call your Clock Out function
      }
    } catch (error) {
      console.log('Error getting location:', error);
    }
  };

  const handleUnconfirmShift = (id: string) => {
    navigation.navigate('ShiftDetails', { id: id } as never);
  };
  useFocusEffect(
    React.useCallback(() => {
      const handleBackPress = () => {
        Alert.alert(
          'Confirm Exit',
          'Do you really wish to close the application?',
          [
            {
              text: 'No',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            {
              text: 'Yes',
              onPress: () => BackHandler.exitApp(),
            },
          ],
          { cancelable: false },
        );
        return true; // Prevents the default back action
      };
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackPress,
      );
      return () => {
        backHandler.remove();
      };
    }, []),
  );

  function capitalizeFirstLetter(string: string): string {
    if (!string || typeof string !== 'string') return ''; // Handle empty, undefined, or non-string values

    return string
      .split(' ') // Split the string into words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
      .join(' '); // Join the words back together with a space
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={globalStyles.item}
      onPress={() => {
        setModalVisible(false);
        navigation.navigate(item.screen);
      }}>
      <Text style={globalStyles.title}>{item.title}</Text>
    </TouchableOpacity>
  );

  const handleLogout = async () => {
    // await AsyncStorage.clear();
    // await AsyncStorage.removeItem('accessToken');
    const response = await axios.get(`${SERVER_URL_ROASTERING}/logout`, {
      withCredentials: true,
    });
    if (response.status === 200) {
      await Cookies.removeSessionCookies();
      AsyncStorage.removeItem('accessCookie');
      navigation.navigate('LoginPage' as never);
    }

    // console.log("response logout==>", response);
  };

  const handleViewProfile = async () => {
    navigation.navigate('ProfileDetailsUser' as never);
  };

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${SERVER_URL_ROASTERING}/me`, {
        withCredentials: true,
      });
      console.log('response me==>', response?.data);
      if (response?.status === 200) {
        setIsLoading(false);
        const data = response?.data;
        if (data?.user?.status === 'active') {
          setData(data?.user);
          setImage(data?.user?.profilePhoto);
          setLoadingImage(false);
          AsyncStorage.setItem('user', JSON.stringify(data?.user));
          AsyncStorage.setItem('userId', data?.user?._id);
          fetchUpcomingShift(data?.user?._id);
        } else {
          handleLogout();
        }
      } else {
        console.error(
          'API request failed:',
          response?.status,
          response?.statusText,
        );
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching admin data:', error);
    }
  }, []);

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

  //fetch All shifts
  startRef.current = start;
  endRef.current = end;

  const fetchUpcomingShift = async (id: string) => {
    try {
      let userId = await AsyncStorage.getItem('userId');
      const response = await axios.get(
        `${SERVER_URL_ROASTERING}/get/upcomming/shift/${id}`,
        {
          withCredentials: true,
        },
      );
      console.log('response shift==>', response.data);

      if (response?.status === 200) {
        setIsLoading(false);
        const data = response?.data;
        setFooterRefreshKey(prev => prev + 1);
        if (data?.message !== 'No upcomming shift') {
          AsyncStorage.setItem('siteId', data?.shift?.siteId?._id);
          AsyncStorage.setItem('positionId', data?.shift?.positionId?._id);
          AsyncStorage.setItem('shiftStatus', data?.shift?.shiftStatus);
          fetchShiftCount(userId, data?.shift?.siteId?._id);
          setUpcomingShift(data?.shift);
          checkShiftStatus(data?.shift);
          const sortedUniforms = data?.shift?.positionId.uniform.sort(
            (a, b) => a.orderNo - b.orderNo,
          );
          setUniformType(sortedUniforms);
          setStartDate(data?.shift?.shiftStartDateTime);
          setEndDate(data?.shift?.shiftEndDateTime);
          setFooterRefreshKey(prev => prev + 1);
        } else {
          fetchShiftCount(userId, data?.shift?.siteId?._id);
          setUpcomingShift([]);
          setUniformType([]);
          setStartDate(null);
          setEndDate(null);
        }
        // Check if nextShift exists and store it in state
        if (data?.nextShift) {
          fetchShiftCount(userId, data?.shift?.siteId?._id);
          const sortedUniforms = data?.nextShift?.positionId.uniform.sort(
            (a, b) => a.orderNo - b.orderNo,
          );
          setNextUniformType(sortedUniforms);
          setFollowingShift(data.nextShift);
          setFollowingStartDate(data.nextShift.shiftStartDateTime);
          setFollowingEndDate(data.nextShift.shiftEndDateTime);
          // Call checkShiftStatus for the next shift
          checkShiftStatus(data.nextShift);
        } else {
          fetchShiftCount(userId, data?.shift?.siteId?._id);
          setUniformType([]);
          setFollowingShift([]);
          setFollowingStartDate(null);
          setFollowingEndDate(null);
        }
        setLoadingImage(false);
      } else {
        console.error(
          'API request failed:',
          response.status,
          response.statusText,
        );
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching admin data:', error);
    }
  };
  const fetchShiftCount = async (id: string, siteId: string) => {
    try {
      let url = `${SERVER_URL_ROASTERING}/get/assigned/shifts/count/${id}?shiftsStartDate=${startRef.current.format(
        'YYYY-MM-DD',
      )}&shiftsEndDate=${endRef.current.format('YYYY-MM-DD')}`;

      // Append siteId to the URL if it's not null or empty
      if (siteId) {
        url += `&siteId=${siteId}`;
      }

      // Make the API call
      const response = await axios.get(url, {
        withCredentials: true,
      });
      console.log('response count==>', response);
      setShiftCount(response?.data);
      AsyncStorage.setItem(
        'ScheduleCount',
        JSON.stringify(response?.data?.schedulesAndAttendanceShifts),
      );
      AsyncStorage.setItem(
        'UnconfirmCount',
        JSON.stringify(response?.data?.unconfirmedShifts),
      );
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching admin data:', error);
    }
  };
  const clearSelectedWeek = async () => {
    try {
      await AsyncStorage.removeItem('selectedWeek');
      await AsyncStorage.removeItem('selectedUnconfirmedWeek');
      await AsyncStorage.removeItem('currentWeek');

    } catch (error) {
      console.error('Failed to clear selected week:', error);
    }
  };

  const fetchMin = async () => {
    try {
      const response = await axios.get(SERVER_URL_ROASTERING + '/get/button');

      // Handle the response and set the min state
      // console.log('min', response.data); // Example: log the data
      const mobileMin = response.data.button.find(
        item => item.useFor === 'mobile',
      );

      console.log('====================================');
      console.log("min", mobileMin);
      console.log('====================================');

      if (mobileMin) {
        setMin(mobileMin.range); // Set the min state with the range for mobile
      }
    } catch (error) {
      console.error('Error fetching min data:', error);
    }
  };


  useFocusEffect(
    useCallback(() => {
      setCurrentWeek(dayjs());
      fetchData();
      fetchMin();
      clearSelectedWeek();
      // setActiveIcon(0);
    }, []),
  );

  useEffect(() => {
    // Initialize the socket.io connection
    const socket = io(SERVER_URL_ROASTERING_DOMAIN);
    // Handle socket.io events
    socket.on('connect', () => {
      console.log('Socket.io connection opened');
    });

    socket.on('publishShift', async data => {
      console.log('publishShift', data);

      if (data) {
        const userId = await AsyncStorage.getItem('userId');
        const siteId = await AsyncStorage.getItem('siteId');

        fetchUpcomingShift(userId);
        fetchShiftCount(userId, siteId);
      }
    });

    socket.on('editShift', async data => {
      if (data) {
        const userId = await AsyncStorage.getItem('userId');
        const siteId = await AsyncStorage.getItem('siteId');

        fetchUpcomingShift(userId);
        fetchShiftCount(userId, siteId);
      }
    });

    socket.on('punchIn', async data => {
      if (data) {
        const userId = await AsyncStorage.getItem('userId');
        const siteId = await AsyncStorage.getItem('siteId');

        fetchUpcomingShift(userId);
        fetchShiftCount(userId, siteId);
      }
    });

    socket.on('deleteShift', async data => {
      console.log('deleteShift', data);

      if (data) {
        const userId = await AsyncStorage.getItem('userId');
        const siteId = await AsyncStorage.getItem('siteId');

        fetchUpcomingShift(userId);
        fetchShiftCount(userId, siteId);
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

  const handleClockIn = async (shiftId: any, isUpcoming: boolean) => {
    if (isUpcoming) setLoadingUpcoming(true);
    else setLoadingFollowing(true);

    try {
      let userId = await AsyncStorage.getItem('userId');
      const bodyData = {
        clockIn: true,
        clockInTime: moment().format('YYYY-MM-DDTHH:mm:ss[Z]'),
      };

      console.log('====================================');
      console.log(bodyData);
      console.log('====================================');

      const response = await axios.put(
        `${SERVER_URL_ROASTERING}/clockin/clockout/${shiftId}/${userId}`,
        JSON.stringify(bodyData),
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response?.data?.success) {
        fetchUpcomingShift(userId);
        Toast.show('Clocked in successfully!', Toast.SHORT);
      } else {
        Toast.show(
          response?.data?.message || 'An error occurred.',
          Toast.SHORT,
        );
      }
    } catch (error: any) {
      if (error.response) {
        // API responded with a status code outside the range of 2xx
        console.error('Error response:', error.response);
        Toast.show(
          error.response.data?.message ||
          'Error during clock in. Please try again.',
          Toast.SHORT,
        );
      } else if (error.request) {
        // Request was made but no response received
        console.error('Error request:', error.request);
        Toast.show('No response from server. Please try again.', Toast.SHORT);
      } else {
        // Something else happened
        console.error('Error during clock in:', error.message);
        Toast.show('Error during clock in. Please try again.', Toast.SHORT);
      }
    } finally {
      if (isUpcoming) setLoadingUpcoming(false);
      else setLoadingFollowing(false);
    }
  };

  const handleClockOut = async (shiftId: any, isUpcoming: boolean) => {
    if (isUpcoming) setLoadingUpcoming(true);
    else setLoadingFollowing(true);

    try {
      let userId = await AsyncStorage.getItem('userId');
      const bodyData = {
        clockOut: true,
        clockOutTime: moment().format('YYYY-MM-DDTHH:mm:ss[Z]'),
      };

      const response = await axios.put(
        `${SERVER_URL_ROASTERING}/clockin/clockout/${shiftId}/${userId}`,
        JSON.stringify(bodyData),
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response?.data?.success) {
        fetchUpcomingShift(userId);
        Toast.show('Clocked out successfully!', Toast.SHORT);
      } else {
        Toast.show(
          response?.data?.message || 'An error occurred.',
          Toast.SHORT,
        );
      }
    } catch (error: any) {
      if (error.response) {
        // API responded with a status code outside the range of 2xx
        console.error('Error response:', error.response);
        Toast.show(
          error.response.data?.message ||
          'Error during clock out. Please try again.',
          Toast.SHORT,
        );
      } else if (error.request) {
        // Request was made but no response received
        console.error('Error request:', error.request);
        Toast.show('No response from server. Please try again.', Toast.SHORT);
      } else {
        // Something else happened
        console.error('Error during clock out:', error.message);
        Toast.show('Error during clock out. Please try again.', Toast.SHORT);
      }
    } finally {
      if (isUpcoming) setLoadingUpcoming(false);
      else setLoadingFollowing(false);
    }
  };
  // const getAppVersion = async () => {
  //   await axios.get(`${SERVER_URL_ROASTERING}/get/versions`).then(response => {
  //     console.log('Backend Version:', response.data);
  //     setBackendVersion(response?.data?.version?.backendVersion);
  //   });
  // };

  // useEffect(() => {
  //   if (Platform.OS === 'android') {
  //     // For Android, fetch the version from the package.json
  //     import('../.././package.json').then(pkg => {
  //       setAppVersion(pkg.version);
  //     });
  //   } else {
  //     console.log('Not for IOS');
  //   }
  //   getAppVersion();
  // }, []);

  // useEffect(() => {
  //   // backendVersion.map((i: any) => {
  //   console.log('App Version:', appVersion);
  //   console.log('Backend Version:', backendVersion);

  //     if (appVersion !== backendVersion) {

  //       console.log(appVersion !== backendVersion);

  //       Alert.alert(
  //         'App Version Update',
  //         'Are you sure you want to update the app?',
  //         [
  //           {
  //             text: 'Update',
  //             onPress: () => {
  //               // Open the URL when the "Update" button is pressed
  //               // Linking.openURL(apkURL)
  //               //   .then(() => {
  //               //     // Handle success (e.g., the link was opened)
  //               //   })
  //               //   .catch(err => {
  //               //     console.error('Error opening URL:', err);
  //               //     // Handle any errors that occurred while trying to open the link
  //               //   });
  //             },
  //             style: 'default',
  //           },
  //           {
  //             text: 'Cancel',
  //             onPress: () => {},
  //             style: 'cancel',
  //           },
  //         ],
  //         {cancelable: false},
  //       );
  //     } else {
  //       console.log('else Version Matched', backendVersion);
  //       // console.log('apk url==>', i.apkURL);
  //       // const apkURL = i.apkURL;
  //     }
  //   // });
  // }, [backendVersion, appVersion]);

  const checkLocation = (position) => {
    const { latitude, longitude } = position.coords;
    const distance = getDistance(
      { latitude, longitude },
      STATIC_LOCATION // Adjust this based on the shift's actual location
    );
  
    console.log(`Distance from the site: ${distance} meters`);
    console.log('====================================');
    console.log("upcomingShift", upcomingShift);
    console.log('====================================');
    console.log("distance", distance);
    console.log('====================================');
  
    if (distance < locationMeters) {
      // User is at the shift location
      setIsAtLocation(true);
  
      // For upcoming shift
      if (!wasAtLocation && upcomingShift) {
        const isAttendanceEmpty =
          !upcomingShift?.attendance || Object.keys(upcomingShift.attendance).length === 0;
        const hasStartTime = upcomingShift?.attendance?.startTime;
        
        // Clock in if the user isn't already clocked in and has no start time
        if (!isClockedIn && isAttendanceEmpty || (hasStartTime && hasEndTime)) {
          console.log('====================================');
          console.log("inside wasAtLocation", !isClockedIn);
          console.log('====================================');
          handleClockInOut(upcomingShift?._id, true); // Automatically clock in
          setIsClockedIn(true); // Update state to indicate clock-in
        }
        setWasAtLocation(true); // Update the state to indicate the user is now at the location
      }
  
      // For following shift
      if (!wasFollowingAtLocation && followingShift) {
        const isFollowingAttendanceEmpty =
          !followingShift?.attendance || Object.keys(followingShift.attendance).length === 0;
        const hasFollowingStartTime = followingShift?.attendance?.startTime;
        
        if (!isFollowingClockedIn && isFollowingAttendanceEmpty || (hasFollowingStartTime && hasFollowingEndTime)) {
          console.log("inside following ", !isFollowingClockedIn);
          handleClockInOut(followingShift?._id, true); // Automatically clock in
          setIsFollowingClockedIn(true); // Update state to indicate clock-in
        }
        setWasFollowingAtLocation(true); // Update the state for the following shift location
      }
    } else {
      // User is not at the location
      setIsAtLocation(false);
  
      // Clock out for upcoming shift if they leave the location
      if (wasAtLocation && upcomingShift) {
        const hasEndTime = upcomingShift?.attendance?.endTime;
  
        // Only clock out if the user hasn't already clocked out
        if (!hasEndTime) {
          console.log('====================================');
          console.log("wasAtLocation", wasAtLocation);
          console.log('====================================');
          handleClockInOut(upcomingShift?._id, false); // Automatically clock out
          setIsClockedIn(false); // Update state to indicate clock-out
        }
        setWasAtLocation(false); // Reset the location state
      }
  
      // Clock out for following shift if they leave the location
      if (wasFollowingAtLocation && followingShift) {
        const hasFollowingEndTime = followingShift?.attendance?.endTime;
  
        // Only clock out if the user hasn't already clocked out
        if (!hasFollowingEndTime) {
          console.log('====================================');
          console.log("wasFollowingAtLocation", wasFollowingAtLocation);
          console.log('====================================');
          handleClockInOut(followingShift?._id, false); // Automatically clock out
          setIsFollowingClockedIn(false); // Update state to indicate clock-out
        }
        setWasFollowingAtLocation(false); // Reset the following shift location state
      }
    }
  };

  const getDistance = (coords1, coords2) => {
    const rad = x => (x * Math.PI) / 180;

    const R = 6371; // Radius of Earth in km
    const dLat = rad(coords2.latitude - coords1.latitude);
    const dLon = rad(coords2.longitude - coords1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rad(coords1.latitude)) * Math.cos(rad(coords2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c * 1000; // Distance in meters
  };

  const startLocationUpdates = () => {
  if (locationPermission) {
    // Watch for location changes
    Geolocation.watchPosition(
      position => checkLocation(position), // Pass the position to checkLocation
      error => Alert.alert(error.message),
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Minimum change (in meters) required to trigger an update
        interval: 20000, // Update every 20 seconds
        fastestInterval: 5000 // Fastest interval for location updates
      }
    );
  }
};
  // Check if location services are enabled (e.g., GPS)
  const checkIfLocationEnabled = async () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setIsLocationEnabled(true); // Location is enabled
      },
      (error) => {
        if (error.code === 1) {
          setLocationPermission(false); // Permission denied
        } else if (error.code === 2) {
          setIsLocationEnabled(false); // Location services are off
          Alert.alert(
            'Location Services Disabled',
            'Please enable location services to use the app.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => Linking.openSettings(), // Open location settings
              },
            ],
          );
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Effect to check permissions and location status
  useEffect(() => {
    checkPermissionStatus();
  }, []);

  useEffect(() => {
    if (locationPermission) {
      checkIfLocationEnabled(); // Check if location services are enabled when permission is granted
    }
  }, [locationPermission]);

  useEffect(() => {
    if (isLocationEnabled) {
      startLocationUpdates(); // Start location updates if permission and location services are enabled
    }
  }, [isLocationEnabled]);

  // Always check permission and re-request if denied when the component mounts
  const requestLocationPermission = async () => {
    try {
      // Always request the permission (even if it was previously denied)
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message:
            'This app requires access to your location to verify your proximity to the work site for accurate clock-in and clock-out functionality.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setLocationPermission(true); // Permission granted
      } else {
        setLocationPermission(false); // Permission denied
        Alert.alert(
          'Location Permission Denied',
          'This app requires access to your location to verify your proximity for clock-in and clock-out. Please enable location permission in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(), // Open device settings
            },
          ],
        );
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // Function to always request location permission
  const checkPermissionStatus = async () => {
    const status = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (!status) {
      // If permission is not granted, request it again
      requestLocationPermission();
    } else {
      setLocationPermission(true); // Permission is already granted
    }
  };

  // Check the permission and start requesting location updates
  useEffect(() => {
    if (isFocused) {
      checkPermissionStatus();
    }
  }, [isFocused]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      // For Android, fetch the version from the package.json
      import('../.././package.json').then(pkg => {
        setAppVersion(pkg.version);
      });
    }
  }, []);

  // useEffect(() => {
  //   const fetchVersionsAndCompare = async () => {
  //     try {
  //       console.log('App Version:', appVersion);

  //       // Fetch the backend version from the API
  //       const response = await axios.get(
  //         `${SERVER_URL_ROASTERING}/get/versions`,
  //       );
  //       const backendVersionFromAPI = Platform.OS === 'ios' ? response?.data?.version?.iosVersion : response?.data?.version?.apkVersion;
  //       console.log('Backend Version:', backendVersionFromAPI);
  //       const playStoreUrl =
  //         'https://play.google.com/store/apps/details?id=com.activeworkforcepro.app';
  //       setBackendVersion(backendVersionFromAPI);

  //       // Compare the versions
  //       if (appVersion !== backendVersionFromAPI) {
  //         console.log('inside ', appVersion !== backendVersionFromAPI);

  //         // Continuously show the alert until the user updates
  //         Alert.alert(
  //           'App Version Update',
  //           'Your app version is outdated. You must update to continue using the app.',
  //           [
  //             {
  //               text: 'Update',
  //               onPress: () => {
  //                 // Open the URL when the "Update" button is pressed
  //                 Linking.openURL(playStoreUrl)
  //                   .then(() => {
  //                     // Handle success (e.g., the link was opened)
  //                   })
  //                   .catch(err => {
  //                     console.error('Error opening URL:', err);
  //                     // Handle any errors that occurred while trying to open the link
  //                   });
  //                 // You can also call fetchVersionsAndCompare again after some delay
  //                 // to keep checking until the app is updated.
  //               },
  //               style: 'default',
  //             },
  //           ],
  //           { cancelable: false }, // Disable dismissing the alert
  //         );
  //       } else {
  //         console.log('Version Matched', backendVersionFromAPI);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching backend version:', error);
  //     }
  //   };

  //   if (appVersion) {
  //     fetchVersionsAndCompare();
  //   }
  // }, [appVersion]);

  // Example function to convert local time to UTC ISO format
  const convertLocalToUTCISO = localDate => {
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');
    const seconds = String(localDate.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
  };

  // useEffect(() => {
  const checkShiftStatus = (shift: any) => {
    const now = new Date(); // Current time

    // Ensure the shift is valid
    if (!shift || !shift.shiftStartDateTime || !shift.shiftEndDateTime) {
      console.log('No valid shift to check');
      return false; // Exit if there's no valid shift
    }

    const startShiftTime = new Date(shift.shiftStartDateTime); // Shift start time
    const endShiftTime = new Date(shift.shiftEndDateTime); // Shift end time

    // Check if the start time is valid
    if (isNaN(startShiftTime.getTime()) || isNaN(endShiftTime.getTime())) {
      console.error(
        'Invalid shift times:',
        shift.shiftStartDateTime,
        shift.shiftEndDateTime,
      );
      return false;
    }

    const fifteenMinBefore = new Date(
      startShiftTime.getTime() - min * 60 * 1000,
    ); // Adjust time based on your min value

    // Convert current time to UTC ISO format
    const convertedNow = convertLocalToUTCISO(now);

    const isEnabled =
      (convertedNow >= fifteenMinBefore.toISOString() ||
        convertedNow > startShiftTime.toISOString()) &&
      convertedNow < endShiftTime.toISOString(); // Ensure current time is before end time

    return isEnabled; // Return the final enabled state
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (upcomingShift) {
        const upcomingIsEnabled = checkShiftStatus(upcomingShift);
        setIsEnabled(prev => prev || upcomingIsEnabled);
      }

      if (followingShift) {
        const followingIsEnabled = checkShiftStatus(followingShift);
        setIsFollowingEnabled(followingIsEnabled); // Update following shift button state
      }
    }, 30000); // Call every 10 seconds

    return () => clearInterval(interval); // Clean up interval on unmount
  }, [upcomingShift, followingShift]);

  // Check immediately on mount and when upcomingShift changes
  // checkShiftStatus();

  // Set an interval to check every minute (60000 ms)
  // const intervalId = setInterval(checkShiftStatus, 60000);

  // Clean up the interval on unmount
  // return () => clearInterval(intervalId);
  // }, [upcomingShift]);

  // Attendance conditions
  const isAttendanceEmpty =
    !upcomingShift?.attendance ||
    Object.keys(upcomingShift.attendance).length === 0;
  const hasStartTime = upcomingShift?.attendance?.startTime;
  const hasEndTime = upcomingShift?.attendance?.endTime;

  const isFollowingAttendanceEmpty =
    !followingShift?.attendance ||
    Object.keys(followingShift.attendance).length === 0;
  const hasFollowingStartTime = followingShift?.attendance?.startTime;
  const hasFollowingEndTime = followingShift?.attendance?.endTime;

  const isCardEnabled =
    (!isAttendanceEmpty && hasStartTime && !hasEndTime) ||
    (!isFollowingAttendanceEmpty && hasFollowingStartTime && !hasFollowingEndTime);

  const STATIC_LOCATION = {
    latitude: 21.186375065150123, // Example static location (e.g., office or shift location)
    longitude: 72.79392933558209, // Example longitude
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View>
          <View style={globalStyles.overlayImageGlobal}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/awp_logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            {/* <View style={styles.textContainer}> */}
            {/* <CustomText
              style={{fontSize: 25, fontWeight: 'bold', color: '#fff'}}>
              {' '}
              Dashboard
            </CustomText> */}
            {/* <TouchableOpacity
            style={styles.menuIconContainer}
            onPress={toggleSidebar}>
            <MaterialIcons
              name="menu-open"
              size={26}
              color="#FFFFFF"
              style={styles.menuIcon}
            />
          </TouchableOpacity> */}
            {/* </View> */}
          </View>
          {/* {isSidebarOpen && (
          <SidebarUser isOpen={isSidebarOpen} onClose={toggleSidebar} />
        )}
        {isSidebarOpen && (
          <Animated.View
            style={[
              styles.sidebarContainer,
              {
                transform: [{translateX: sidebarTranslateX}],
              },
            ]}>
            <SidebarUser isOpen={isSidebarOpen} onClose={toggleSidebar} />
          </Animated.View>
        )} */}

          <View style={globalStyles.whiteBox}>
            <View
              style={[
                globalStyles.profileBlock,
                {
                  backgroundColor: 'transparent',
                  shadowColor: 'none',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0,
                  shadowRadius: 0,
                  elevation: 0,
                },
              ]}>
              {/* <View style={[globalStyles.profileImageContainer]}> */}
              {/* {loadingImage ? (
                <View style={globalStyles.loaderCircle}>
                  <ActivityIndicator size="large" color="#3C4764" />
                </View>
              ) : image ? (
                <Image
                  source={{uri: image + `?timestamp=${new Date().getTime()}`}}
                  resizeMode="contain"
                  style={globalStyles.profileImage}
                />
              ) : (
                <View style={globalStyles.initialsCircle}>
                  <Text style={globalStyles.initialsText}>
                    {capitalizeFirstLetter(data?.firstName?.charAt(0)) +
                      capitalizeFirstLetter(data?.lastName?.charAt(0))}
                  </Text>
                </View>
              )} */}

              <View
                style={[
                  globalStyles.profileTextContainer,
                  {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingHorizontal: 10,
                    alignItems: 'center',
                  },
                ]}>
                <Text style={styles.helloText}>
                  Hello{' '}
                  <Text style={globalStyles.profileImageText}>
                    {capitalizeFirstLetter(data.firstName) +
                      ' ' +
                      capitalizeFirstLetter(data.lastName)}
                  </Text>
                </Text>
                {/* <Text
                  style={[
                    globalStyles.profileImageText1,
                    {flexShrink: 1, flexWrap: 'wrap', maxWidth: 300},
                  ]}>
                  {data?.email}
                </Text> */}
                <View style={styles.buttonset}>
                  {/* <TouchableOpacity
                    onPress={handleViewProfile}
                    style={{
                      borderColor: 'red',
                      borderWidth: 1,
                      padding: 4,
                      borderRadius: 5,
                      marginRight: 10,
                    }}>
                    <Text style={styles.logout}>View Profile</Text>
                  </TouchableOpacity> */}
                  {image ? (
                    <TouchableOpacity onPress={handleViewProfile}>
                      <Image
                        source={{
                          uri: image + `?timestamp=${new Date().getTime()}`,
                        }}
                        // resizeMode="contain"
                        style={[
                          globalStyles.profileImage,
                          { height: 45, width: 45 },
                        ]}
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={handleViewProfile}
                      style={[
                        globalStyles.initialsCircle,
                        { width: 45, height: 45 },
                      ]}>
                      <Text style={globalStyles.initialsText}>
                        {capitalizeFirstLetter(data?.firstName?.charAt(0)) +
                          capitalizeFirstLetter(data?.lastName?.charAt(0))}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {/* <TouchableOpacity
                    onPress={handleLogout}
                    style={{
                      borderColor: 'red',
                      borderWidth: 1,
                      padding: 4,
                      borderRadius: 5,
                      marginRight: 10,
                    }}>
                    <Text style={styles.logout}>Logout</Text>
                  </TouchableOpacity> */}
                </View>
              </View>
              {/* </View> */}
            </View>

            <View style={[globalStyles.centeredView, { width: '100%', flex: 0 }]}>
              {isLoading ? (
                <View style={globalStyles.loaderCircle}>
                  <ActivityIndicator size="large" color="#3C4764" />
                </View>
              ) : (
                <View style={{ width: '100%' }}>
                  {upcomingShift && Object.keys(upcomingShift).length > 0 ? (
                    <TouchableOpacity
                      style={[
                        styles.card,
                        {
                          backgroundColor:
                            isAttendanceEmpty || (hasStartTime && hasEndTime)
                              ? '#FFF'
                              : '#d4fcd4',
                        },
                      ]}
                      onPress={() => handleUnconfirmShift(upcomingShift?._id)}>
                      <View
                        style={[
                          globalStyles.headerContainer,
                          {
                            marginBottom: 10,
                            flexDirection: 'row',
                            paddingVertical: 4,
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          },
                        ]}>
                        <Text style={globalStyles.headerText}>
                          {upcomingShift?.shiftStatus === 'punchIn'
                            ? 'SHIFT STATUS'
                            : 'UPCOMING SHIFT'}
                        </Text>
                        {isAtLocation && isEnabled && (isAttendanceEmpty || (hasStartTime && hasEndTime)) ? (
                          <TouchableOpacity
                          style={styles.clockButton}
                            onPress={() => {
                              // Manual clock-in while in the area
                              if (!isClockedIn) {
                                handleClockInOut(upcomingShift?._id, true); // Manual clock-in
                                setIsClockedIn(true); // Update state to indicate manual clock-in
                              }
                            }}
                            disabled={loadingUpcoming}
                          >
                            {loadingUpcoming ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <>
                               <Icon
                                  name="clockcircle"
                                  size={18}
                                  color="#fff"
                                />
                                <Text style={{ color: '#fff' }}>Clock In</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        ) : null}

                        {isAtLocation && !isAttendanceEmpty && hasStartTime && !hasEndTime ? (
                          <TouchableOpacity
                          style={styles.clockButton}
                            onPress={() => {
                              // Manual clock-out while in the area
                              handleClockInOut(upcomingShift?._id, false); // Manual clock-out
                              setIsClockedIn(false); // Update state to indicate manual clock-out
                            }}
                            disabled={loadingUpcoming}
                          >
                            {loadingUpcoming ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <>
                               <Icon
                                  name="clockcircle"
                                  size={18}
                                  color="#fff"
                                />
                                <Text style={{ color: '#fff' }}>Clock Out</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        ) : null}
                      </View>

                      <View style={styles.row}>
                        <Text style={styles.text}>Shift Date:</Text>
                        <Text style={styles.subText}>
                          {moment.utc(startDate).format('ddd, MMM Do YYYY')}
                        </Text>
                      </View>
                      <View style={styles.row}>
                        <Text style={styles.text}>Shift Time:</Text>
                        <Text style={styles.subText}>
                          {`${moment.utc(startDate).format('HH:mm')} - ${moment
                            .utc(endDate)
                            .format('HH:mm')}`}
                        </Text>
                      </View>
                      <View style={styles.row}>
                        <Text style={styles.text}>Site Name:</Text>
                        <Text style={styles.subText}>
                          {capitalizeFirstLetter(
                            upcomingShift?.siteId?.siteName,
                          )}
                        </Text>
                      </View>
                      <View style={styles.row}>
                        <Text style={styles.text}>Position:</Text>
                        <Text style={styles.subText}>
                          {capitalizeFirstLetter(
                            upcomingShift?.positionId?.postName,
                          )}
                        </Text>
                      </View>
                      <View style={styles.row}>
                        <Text style={styles.text}>Site Address:</Text>
                        <Text style={styles.subText}>
                          {upcomingShift?.siteId?.address &&
                            `${upcomingShift?.siteId?.address}`}
                          {upcomingShift?.siteId?.city &&
                            `, ${upcomingShift?.siteId?.city}`}
                          {upcomingShift?.siteId?.state &&
                            `, ${upcomingShift?.siteId?.state}`}
                          {/* {upcomingShift?.siteId?.zipCode &&
                `, ${upcomingShift?.siteId?.zipCode}`}
              . */}
                        </Text>
                      </View>

                      {uniformType.length > 0 && (
                        <View style={styles.row}>
                          <Text style={styles.text}>Uniform Type:</Text>
                          <Text style={styles.subText}>
                            {uniformType
                              .map((uniform: any) =>
                                capitalizeFirstLetter(uniform.uniformId.name),
                              )
                              .join(', ')}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.card, { marginVertical: 10, padding: 15 }]}>
                      <Text style={[globalStyles.noDataText, { marginTop: 0 }]}>
                        You don't have any upcoming shifts.
                      </Text>
                      <Text style={[globalStyles.noDataText, { marginTop: 0 }]}>
                        If you're available please contact your manager.
                      </Text>
                    </TouchableOpacity>
                  )}
                  {followingShift && Object.keys(followingShift).length > 0 && (
                    <TouchableOpacity
                      style={[
                        styles.card,
                        {
                          backgroundColor:
                            isFollowingAttendanceEmpty ||
                              (hasFollowingStartTime && hasFollowingEndTime)
                              ? '#FFF'
                              : '#d4fcd4',
                          top: 4,
                        },
                      ]}
                      onPress={() => handleUnconfirmShift(followingShift?._id)}>
                      <View
                        style={[
                          globalStyles.headerContainer,
                          {
                            marginBottom: 6,
                            flexDirection: 'row',
                            paddingVertical: 4,
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          },
                        ]}>
                        <Text style={globalStyles.headerText}>
                          FOLLOWING UPCOMING SHIFT
                        </Text>
                        {isAtLocation && isFollowingEnabled &&
                          (isFollowingAttendanceEmpty ||
                            (hasFollowingStartTime && hasFollowingEndTime)) ? (
                          <TouchableOpacity
                            style={styles.clockButton}
                            onPress={() => handleClockInOut(followingShift?._id, true)} // Pass isUpcoming as false
                            disabled={loadingFollowing}>
                            {loadingFollowing ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <>
                                <Icon
                                  name="clockcircle"
                                  size={18}
                                  color="#fff"
                                />
                                <Text style={styles.clockButtonText}>
                                  Clock In
                                </Text>
                              </>
                            )}
                          </TouchableOpacity>
                        ) : null}

                        {isAtLocation && !isFollowingAttendanceEmpty &&
                          hasFollowingStartTime &&
                          !hasFollowingEndTime ? (
                          <TouchableOpacity
                            style={styles.clockButton}
                            onPress={() => handleClockInOut(followingShift?._id, true)}
                            disabled={loadingFollowing}>
                            {loadingFollowing ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <>
                                <Icon
                                  name="clockcircle"
                                  size={18}
                                  color="#fff"
                                />
                                <Text style={styles.clockButtonText}>
                                  Clock Out
                                </Text>
                              </>
                            )}
                          </TouchableOpacity>
                        ) : null}
                      </View>
                      <View style={styles.row}>
                        <Text style={styles.text}>Shift Date:</Text>
                        <Text style={styles.subText}>
                          {moment
                            .utc(followingStartDate)
                            .format('ddd, MMM Do YYYY')}
                        </Text>
                      </View>
                      <View style={styles.row}>
                        <Text style={styles.text}>Shift Time:</Text>
                        <Text style={styles.subText}>
                          {`${moment
                            .utc(followingStartDate)
                            .format('HH:mm')} - ${moment
                              .utc(followingEndDate)
                              .format('HH:mm')}`}
                        </Text>
                      </View>
                      <View style={styles.row}>
                        <Text style={styles.text}>Position:</Text>
                        <Text style={styles.subText}>
                          {capitalizeFirstLetter(
                            followingShift?.positionId?.postName,
                          )}
                        </Text>
                      </View>
                      <View style={styles.row}>
                        <Text style={styles.text}>Site Name:</Text>
                        <Text style={styles.subText}>
                          {capitalizeFirstLetter(
                            followingShift?.siteId?.siteName,
                          )}
                        </Text>
                      </View>
                      <View style={styles.row}>
                        <Text style={styles.text}>Site Address:</Text>
                        <Text style={styles.subText}>
                          {followingShift?.siteId?.address &&
                            `${followingShift?.siteId?.address}`}
                          {followingShift?.siteId?.city &&
                            `, ${followingShift?.siteId?.city}`}
                          {followingShift?.siteId?.state &&
                            `, ${followingShift?.siteId?.state}`}
                          {/* {followingShift?.siteId?.zipCode &&
                `, ${followingShift?.siteId?.zipCode}`} */}
                          {/* . */}
                        </Text>
                      </View>
                      {nextUniformType.length > 0 && (
                        <View style={styles.row}>
                          <Text style={styles.text}>Uniform Type:</Text>
                          <Text style={styles.subText}>
                            {nextUniformType
                              .map((uniform: any) =>
                                capitalizeFirstLetter(uniform.uniformId.name),
                              )
                              .join(', ')}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            <View style={[styles.iconRow]}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('ScheduleAndAttendance' as never)
                }
                style={[
                  styles.icon,
                  shiftCount?.schedulesAndAttendanceShifts > 0 && {
                    backgroundColor: '#D01E12', // Dark red background
                    shadowColor: '#ffbfbf', // Light red shadow
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.8,
                    shadowRadius: 6,
                    elevation: 8, // Android shadow
                  },
                ]}>
                <FontAwesome5
                  name="calendar-check"
                  size={35}
                  color={
                    shiftCount?.schedulesAndAttendanceShifts > 0
                      ? '#fff'
                      : '#D01E12'
                  }
                  style={styles.iconImage}
                />
                <Text
                  style={[
                    styles.iconText,
                    {
                      color:
                        shiftCount?.schedulesAndAttendanceShifts > 0
                          ? '#fff'
                          : '#000',
                      fontWeight: shiftCount?.schedulesAndAttendanceShifts
                        ? 'bold'
                        : 'normal',
                    },
                  ]}>
                  Schedule & Attendance
                  <Text
                    style={[
                      styles.iconTextCount,
                      {
                        color:
                          shiftCount?.schedulesAndAttendanceShifts > 0
                            ? '#fff'
                            : '#D01E12',
                      },
                    ]}>
                    {' '}
                    {`(${shiftCount?.schedulesAndAttendanceShifts || 0})`}
                  </Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('UnconfirmedShifts' as never)
                }
                style={[
                  styles.icon,
                  shiftCount?.unconfirmedShifts > 0 && {
                    backgroundColor: '#D01E12', // Dark red background
                    shadowColor: '#ffbfbf', // Light red shadow
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.8,
                    shadowRadius: 6,
                    elevation: 8, // Android shadow
                  },
                ]}>
                <FontAwesome5
                  name="user-clock"
                  size={35}
                  color={shiftCount?.unconfirmedShifts > 0 ? '#fff' : '#D01E12'}
                  style={styles.iconImage}
                />
                <Text
                  style={[
                    styles.iconText,
                    {
                      color:
                        shiftCount?.unconfirmedShifts > 0 ? '#fff' : '#000',
                      fontWeight: shiftCount?.unconfirmedShifts
                        ? 'bold'
                        : 'normal',
                    },
                  ]}>
                  Unconfirmed Shifts{' '}
                  <Text
                    style={[
                      styles.iconTextCount,
                      {
                        color:
                          shiftCount?.unconfirmedShifts > 0
                            ? '#fff'
                            : '#D01E12',
                      },
                    ]}>
                    {`(${shiftCount?.unconfirmedShifts || 0})`}
                  </Text>
                </Text>
              </TouchableOpacity>

               <TouchableOpacity
                disabled={!isCardEnabled} // Disable the card based on both upcoming and following shifts
                onPress={() => navigation.navigate('Documents' as never)}
                style={[
                  styles.icon,
                  shiftCount?.documents > 0 && isCardEnabled
                    ? {
                      backgroundColor: '#D01E12', // Dark red background
                      shadowColor: '#ffbfbf', // Light red shadow
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.8,
                      shadowRadius: 6,
                      elevation: 8, // Android shadow
                    }
                    : {},
                ]}
              >
                <FontAwesome5
                  name="folder-open"
                  size={35}
                  color={shiftCount?.documents > 0 && isCardEnabled ? '#fff' : '#C6C6C6'}
                  style={styles.iconImage}
                />
                <Text
                  style={[
                    styles.iconText,
                    {
                      color: shiftCount?.documents > 0 && isCardEnabled ? '#fff' : '#C6C6C6',
                      fontWeight: shiftCount?.documents > 0 && isCardEnabled ? 'bold' : 'normal',
                    },
                  ]}
                >
                  Documents{' '}
                  {isCardEnabled && (
                    <Text
                      style={[
                        styles.iconTextCount,
                        {
                          color: shiftCount?.documents > 0 && isCardEnabled ? '#fff' : '#D01E12',
                        },
                      ]}
                    >
                      {`(${shiftCount?.documents || 0})`}
                    </Text>
                  )}
                </Text>
              </TouchableOpacity>

              {/* <TouchableOpacity
              style={styles.icon}
              onPress={() => navigation.navigate('DeclinedShifts' as never)}>
              <Icon
                name="closecircle"
                size={40} // Adjust the size to your desired value
                color="#D01E12"
                style={styles.iconImage}
              />
              <Text style={styles.iconText}>
                Declined Shifts{' '}
                <Text
                  style={
                    styles.iconTextCount
                  }>{`(${shiftCount?.rejectedShifts})`}</Text>
              </Text>
            </TouchableOpacity> */}
            </View>
            <View style={styles.iconRow1}>
               <TouchableOpacity
                disabled={!isCardEnabled} // Disable if attendance conditions aren't met
                onPress={() => navigation.navigate('Reports' as never)}
                style={styles.icon}
              >
                <FontAwesome5
                  name="file-export"
                  size={35}
                  color={isCardEnabled ? '#D01E12' : '#C6C6C6'}
                  style={styles.iconImage}
                />
                <Text
                  style={[
                    styles.iconText,
                    {
                      color: isCardEnabled ? '#000' : '#C6C6C6',
                    },
                  ]}
                >
                  My Reports
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={!isCardEnabled} // Disable if attendance conditions aren't met
                onPress={() => setModalVisible(true)}
                style={styles.icon}
              >
                <Icon
                  name="areachart"
                  size={35}
                  color={isCardEnabled ? '#D01E12' : '#C6C6C6'}
                  style={styles.iconImage}
                />
                <Text
                  style={[
                    styles.iconText,
                    {
                      color: isCardEnabled ? '#000' : '#C6C6C6',
                    },
                  ]}
                >
                  Submit a Report
                </Text>
              </TouchableOpacity>
            </View>

            <Modal
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
              animationType="fade">
              {Platform.OS === 'ios' ? (
                <Pressable
                  // style={globalStyles.modalBackground}
                  style={globalStyles.modalContainer}
                  onPress={() => setModalVisible(false)} // Close modal when tapping outside
                >
                  {/* <View style={globalStyles.modalContainer}> */}
                  <View style={globalStyles.modalContentReport}>
                    <TouchableOpacity
                      style={globalStyles.closeButtonContact}
                      onPress={() => setModalVisible(false)}>
                      <MaterialIcons name="close" size={15} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={globalStyles.modalTitle}>Reports & Logs</Text>
                    <FlatList
                      data={DATA}
                      renderItem={renderItem}
                      keyExtractor={item => item.id}
                      contentContainerStyle={globalStyles.list}
                    />
                    <TouchableOpacity
                      style={globalStyles.cancelButton}
                      onPress={() => setModalVisible(false)}>
                      <Text style={globalStyles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                  {/* </View> */}
                </Pressable>
              ) : (
                <TouchableOpacity
                  style={globalStyles.modalContainer}
                  activeOpacity={1}
                  onPressOut={() => setModalVisible(false)}>
                  <TouchableOpacity
                    style={globalStyles.modalContentReport}
                    activeOpacity={1}
                    onPress={() => { }}>
                    <TouchableOpacity
                      style={globalStyles.closeButtonContact}
                      onPress={() => setModalVisible(false)}>
                      <MaterialIcons name="close" size={15} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={globalStyles.modalTitle}>Reports & Logs</Text>
                    <FlatList
                      data={DATA}
                      renderItem={renderItem}
                      keyExtractor={item => item.id}
                      contentContainerStyle={globalStyles.list}
                    />
                    <TouchableOpacity
                      style={globalStyles.cancelButton}
                      onPress={() => setModalVisible(false)}>
                      <Text style={globalStyles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            </Modal>
          </View>
        </View>
      </ScrollView>
      <FooterUser
        key={footerRefreshKey}
        activeIcon={activeIcon}
        setActiveIcon={setActiveIcon}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradient: {
    width: (windowWidth - 48) / 3,
    height: 120,
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: windowWidth, // Adjust the sidebar width as needed
    backgroundColor: '#fff', // Set your desired sidebar background color
    zIndex: 1, // Ensure the sidebar appears above other content
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
    // height: 300,
    width: '100%',
    backgroundColor: '#39445F',
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
  clockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D01E12', // Transparent background for the outline button
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#D01E12', // Border color for the outline button
    elevation: 0, // Remove shadow effect for outline buttons
    shadowColor: 'transparent', // No shadow color
    shadowOffset: { width: 0, height: 0 }, // No shadow offset
    shadowOpacity: 0, // No shadow opacity
    shadowRadius: 0, // No shadow radius
    right: 4,
  },
  clockButtonText: {
    marginLeft: 5,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  textContainer: {
    position: 'absolute',
    top: 70,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
    height: 100,
    flexDirection: 'row',
  },
  titleText: {
    fontSize: 26,
    fontWeight: '500',
    textAlign: 'center',
    color: '#FFFFFF',
    flex: 1,
  },
  menuIconContainer: {
    position: 'absolute',
    right: 24,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    top: 15,
  },

  menuIcon: {
    width: 24,
    height: 24,
  },
  helloText: {
    fontSize: 14,
    color: '#262D3F',
    textAlign: 'center',
  },
  logout: {
    color: 'red',
    fontWeight: 'bold',
  },
  buttonset: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    // marginTop: 15,
  },
  checkout: {
    color: 'green',
    fontWeight: 'bold',
  },
  loaderCirclelogin: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 20,
    marginRight: 30,
  },

  cameraIcon: {
    position: 'absolute',
    top: 0,
    right: 6,
    marginTop: 40,
    backgroundColor: 'transparent',
  },
  cameraIcon1: {
    position: 'absolute',
    top: 0,
    right: 6,
    marginTop: 40,
    backgroundColor: 'transparent',
  },
  displayText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    marginTop: 5,
    fontWeight: '400',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: windowWidth,
    paddingHorizontal: 10,
    marginTop: 15,
    // top: 50
  },
  iconRow1: {
    flexDirection: 'row',
    // justifyContent: 'center',
    alignItems: 'center',
    width: windowWidth,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 50,
  },
  iconRow2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: windowWidth,
    paddingHorizontal: 10,
    marginBottom: 160,
  },

  icon: {
    width: (windowWidth - 45) / 3,
    height: 100,
    borderRadius: 8,
    backgroundColor: 'white',
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: Platform.OS === 'ios' ? 0.2 : 0.8,
    shadowRadius: 8,
    elevation: 6,
    padding: 10,
  },
  iconImage: {
    // width: 50,
    // height: 50,
    marginBottom: 8,
    textAlign: 'center',
  },
  iconText: {
    fontSize: 12,
    color: '#262D3F',
    textAlign: 'center',
    flexShrink: 1,
    // fontWeight: '600',
  },
  iconTextCount: {
    fontSize: 13,
    color: '#D01E12',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#FFF',
    // padding: 15,
    marginHorizontal: 15,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
    // width: '100%',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
    color: '#000000',
  },
  shiftTime: {
    fontSize: 14,
    marginBottom: 5,
    color: '#000000',
  },
  siteAddress: {
    fontSize: 14,
    // fontStyle: 'italic',
    marginBottom: 5,
    color: '#000000',
  },
  position: {
    fontSize: 14,
    color: '#000000',
  },
  cardTitle: {
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    paddingLeft: 15,
    paddingBottom: 6,
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
});

export default UserHome;
