/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Platform, Text, TouchableOpacity } from 'react-native';
import { View, StyleSheet } from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
// import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AntIcon from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import axios from 'axios';
import Cookies from '@react-native-cookies/cookies';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  SERVER_URL_ROASTERING,
  SERVER_URL_ROASTERING_DOMAIN,
} from '../../Constant';
import io, { Socket } from 'socket.io-client';

interface FooterProps {
  activeIcon: number;
  setActiveIcon: React.Dispatch<React.SetStateAction<number>>;
}

const FooterUser: React.FC<FooterProps> = ({ activeIcon, setActiveIcon }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const [shiftStatus, setShiftStatus] = useState<string>('');
  const [calendarCount, setCalendarCount] = useState(0);
  const [userClockCount, setUserClockCount] = useState(0);

  const [currentWeek, setCurrentWeek] = useState(dayjs());

  const handleIconPress = (index: number) => {
    setActiveIcon(index);
    if (index === 0) {
      navigation.navigate('UserHome' as never);
    } else if (index === 1) {
      navigation.navigate('ScheduleAndAttendance' as never);
    } else if (index === 2) {
      navigation.navigate('UnconfirmedShifts' as never);
    } else if (index === 3) {
      navigation.navigate('Chat' as never);
    } else if (index === 4) {
      navigation.navigate('SubmitReport' as never);
    }
  };

  useEffect(() => {
    const updateShiftStatusAndIcon = async () => {
      let status = await AsyncStorage.getItem('shiftStatus');
      setShiftStatus(status);

      if (route.name === 'UserHome' && activeIcon !== 0) {
        setActiveIcon(0);
      } else if (route.name === 'ScheduleAndAttendance' && activeIcon !== 1) {
        setActiveIcon(1);
      } else if (route.name === 'UnconfirmedShifts' && activeIcon !== 2) {
        setActiveIcon(2);
      } else if (route.name === 'Chat' && activeIcon !== 3) {
        setActiveIcon(3);
      } else if (route.name === 'SubmitReport' && activeIcon !== 4) {
        setActiveIcon(4);
      }
    };

    updateShiftStatusAndIcon();
  }, [route, activeIcon]);

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

  const fetchShiftCount = async (id: string, siteId: string) => {
    try {
      if (id) {
        let url = `${SERVER_URL_ROASTERING}/get/assigned/shifts/count/${id}?shiftsStartDate=${startRef.current.format(
          'YYYY-MM-DD',
        )}&shiftsEndDate=${endRef.current.format('YYYY-MM-DD')}`;

        if (siteId) {
          url += `&siteId=${siteId}`;
        }

        const response = await axios.get(url, {
          withCredentials: true,
        });

        // console.log('Shift count response footer:', response.data); // Log response

        if (response?.data?.success === true) {
          setCalendarCount(response?.data?.schedulesAndAttendanceShifts || 0); // Ensure fallback to 0
          setUserClockCount(response?.data?.unconfirmedShifts || 0); // Ensure fallback to 0
        }
      }
    } catch (error) {
      console.error('Error fetching shift count:', error);
    }
  };

  const fetchData = useCallback(async () => {
    const userId = await AsyncStorage.getItem('userId')
    const siteId = await AsyncStorage.getItem('siteId')
    fetchShiftCount(userId, siteId)
  }, []);
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  // useEffect(() => {
  //   // Initialize the socket.io connection
  //   const socket = io(SERVER_URL_ROASTERING_DOMAIN);
  //   // Handle socket.io events
  //   socket.on('connect', () => {
  //     console.log('Socket.io connection opened');
  //   });

  //   socket.on('publishShift', async data => {
  //     console.log('publishShift', data);

  //     if (data) {
  //       const userId = await AsyncStorage.getItem('userId');
  //       const siteId = await AsyncStorage.getItem('siteId');
  //       fetchShiftCount(userId, siteId);
  //     }
  //   });

  //   socket.on('editShift', async data => {
  //     if (data) {
  //       const userId = await AsyncStorage.getItem('userId');
  //       const siteId = await AsyncStorage.getItem('siteId');
  //       fetchShiftCount(userId, siteId);
  //     }
  //   });

  //   socket.on('punchIn', async data => {
  //     if (data) {
  //       const userId = await AsyncStorage.getItem('userId');
  //       const siteId = await AsyncStorage.getItem('siteId');
  //       fetchShiftCount(userId, siteId);
  //     }
  //   });

  //   socket.on('deleteShift', async data => {
  //     console.log('deleteShift', data);

  //     if (data) {
  //       const userId = await AsyncStorage.getItem('userId');
  //       const siteId = await AsyncStorage.getItem('siteId');
  //       fetchShiftCount(userId, siteId);
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

  return (
    <View style={styles.footer}>
      <View style={styles.iconContainer}>
        <TouchableOpacity
          style={[styles.icon, activeIcon === 0 && styles.activeIcon]}
          onPress={() => handleIconPress(0)}>
          <FeatherIcon
            name="home"
            color={'#fff'}
            size={22}
            style={[styles.menuIcon, activeIcon === 0 && { color: '#d4fcd4' }]}
          />
          <Text style={activeIcon === 0 ? styles.activeIconText : styles.iconText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.icon, activeIcon === 1 && styles.activeIcon]}
          onPress={() => handleIconPress(1)}>
          <View style={styles.iconWrapper}>
            <FontAwesome5
              name="calendar-check"
              color={'#fff'}
              size={22}
              style={[styles.menuIcon, activeIcon === 1 && { color: '#d4fcd4' }]}
            />
            {calendarCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{calendarCount}</Text>
              </View>
            )}
          </View>
          <Text style={activeIcon === 1 ? styles.activeIconText : styles.iconText}>Schedules</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.icon, activeIcon === 2 && styles.activeIcon]}
          onPress={() => handleIconPress(2)}>
          <View style={styles.iconWrapper}>
            <FontAwesome5
              name="user-clock"
              color={'#fff'}
              size={20}
              style={[styles.menuIcon, activeIcon === 2 && { color: '#d4fcd4' }]}
            />
            {userClockCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{userClockCount}</Text>
              </View>
            )}
          </View>
          <Text style={activeIcon === 2 ? styles.activeIconText : styles.iconText}>Unconfirmed</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={[styles.icon, activeIcon === 3 && styles.activeIcon]}
          onPress={() => handleIconPress(3)}>
          <Icon
            name="chat-outline"
            size={22}
            style={[
              styles.menuIcon,
              { color: '#fff' },
              activeIcon === 3 && { color: '#d4fcd4' },
            ]}
          />
          <Text style={activeIcon === 3 ? styles.activeIconText : styles.iconText}>Chat</Text>
        </TouchableOpacity> */}

        {/* <TouchableOpacity
          style={[styles.icon, activeIcon === 0 && styles.activeIcon]}
          onPress={() => handleIconPress(0)}>
          <FeatherIcon
            name="bell"
            color={'#fff'}
            size={22}
            style={[styles.menuIcon, activeIcon === 0 && { color: '#d4fcd4' }]}
          />
          <Text style={activeIcon === 0 ? styles.activeIconText : styles.iconText}>Notification</Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          style={[styles.icon, activeIcon === 4 && styles.activeIcon]}
          onPress={() => handleIconPress(4)}>
          <FeatherIcon
            name="settings"
            size={22}
            style={[
              styles.menuIcon,
              { color: '#fff' },
              activeIcon === 4 && { color: '#d4fcd4' },
            ]}
          />
          <Text style={activeIcon === 4 ? styles.activeIconText : styles.iconText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    width: '100%',
    height: Platform.OS === 'ios' ? 68 : 60,
    backgroundColor: '#3C4764',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    bottom: Platform.OS === 'ios' ? 5 : 0
  },
  icon: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    width: 24,
    height: 24,
    textAlign: 'center',
  },
  activeIcon: {
    // backgroundColor: 'white',
    // borderRadius: 50,
  },
  activeIconColor: {
    tintColor: '#333',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -12,
    backgroundColor: '#D01E12',
    borderRadius: 12, // Keeps it circular for 1-2 digits
    minWidth: 20,     // Ensures enough space for 2+ digits
    paddingHorizontal: 2, // Adds padding for dynamic width
    height: 20,       // Keeps height constant
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 1,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  iconWrapper: {
    // position: 'relative',
  },
  iconText: {
    marginTop: 2,
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold'
  },
  activeIconText: {
    marginTop: 2,
    fontSize: 12,
    color: '#d4fcd4',
    fontWeight: 'bold'
  },
});

export default FooterUser;
