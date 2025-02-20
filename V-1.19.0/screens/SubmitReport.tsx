/* eslint-disable prettier/prettier */
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Animated,
  Easing,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FeatherIcon from 'react-native-vector-icons/Feather';
import CustomText from '../components/CustomText';
import FooterUser from '../components/Footer/FooterUser';
import { FlatList } from 'react-native-gesture-handler';
import { globalStyles } from '../styles';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SidebarUser from '../components/Sidebar/SidebarUser';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Cookies from '@react-native-cookies/cookies';
import { SERVER_URL_ROASTERING } from '../Constant';
import { ActivityIndicator } from 'react-native-paper';
import DeviceInfo from 'react-native-device-info';
import EncryptedStorage from 'react-native-encrypted-storage';

const Item = ({ title, onPress, notification }) => (
  <TouchableOpacity onPress={onPress} style={styles.item}>
    <Text style={styles.title}>{title}</Text>
    <View style={styles.iconContainer}>
      <AntDesign name="right" size={20} color="#000" />
    </View>
  </TouchableOpacity>
);

const windowWidth = Dimensions.get('window').width;

const SubmitReport = () => {
  const navigation = useNavigation();
  const [activeIcon, setActiveIcon] = useState<number>(3);
  // const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // const [sidebarTranslateX] = useState(new Animated.Value(-windowWidth * 0.7));
  const [modalVisible, setModalVisible] = useState(false);
  const [helpCenterModal, setHelpCenterModal] = useState(false);
  const [scaleValue] = useState(new Animated.Value(1)); // Scale animation
  const [data, setData] = useState<any>([]);
  const [appVersion, setAppVersion] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getUserData = useCallback(async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        if (userData) {
          console.log('userData', userData);
          setData(userData); // Only set the state if userData is valid
        }
      }
    } catch (error) {
      console.error('Error retrieving user data:', error);
    }
  }, []);

  useEffect(() => {
    getUserData();
  }, [getUserData]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      // For Android, fetch the version from the package.json
      import('../package.json').then(pkg => {
        setAppVersion(pkg.version);
      });
    } else if (Platform.OS === 'ios') {
      // For iOS, use react-native-device-info to get the version
      const version = DeviceInfo.getVersion();
      setAppVersion(version);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    getUserData().then(() => {
      setIsRefreshing(false);
    });
  }, [getUserData]);


  function capitalizeFirstLetter(string: string): string {
    if (!string || typeof string !== 'string') return '';
    return string
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95, // Slightly shrink button
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1, // Return to original size
      useNativeDriver: true,
    }).start();
  };

  const handleHelpCenterPress = () => {
    setHelpCenterModal(true);
  };
  const handleDeleteAccountPress = () => {
    setModalVisible(true);
  };
  const handleContactUsPress = () => {
    Linking.openURL('tel:1300848450');
  };
  const openPrivacyPolicy = () => {
    Linking.openURL('https://activeworkforcepro.com.au/privacy-policy').catch(
      err => console.error("Couldn't load page", err),
    );
  };

  const navigateToChangePasswordScreen = () => {
    navigation.navigate('ChangeMPINScreen' as never);
  }

  const handleNoPress = () => {
    setModalVisible(false);
  };

  const handleYesPress = async () => {
    setModalVisible(false);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await axios.put(
        `${SERVER_URL_ROASTERING}/update/user/status/${userId}`,
        {
          withCredentials: true,
        },
      );
      console.log('response', response);
      if (response.status === 200) {
        Toast.show(`Account ${response?.data?.message}`, Toast.LONG);
        handleLogout();
      }
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  };
  const handleLogout = async () => {
    try {
      const response = await axios.get(
        `${SERVER_URL_ROASTERING}/logout/mobile`,
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        await Cookies.removeSessionCookies();
        await AsyncStorage.removeItem("accessCookie");
        await AsyncStorage.removeItem("fcmTokenStored");
        await AsyncStorage.removeItem('userId')
        // Check if 'mpinLastSession' exists before removing it
        const mpinSession = await EncryptedStorage.getItem("mpinLastSession");
        if (mpinSession) {
          try {
            await EncryptedStorage.removeItem("mpinLastSession");
            console.log("MPIN session cleared successfully.");
          } catch (encryptedError) {
            console.error(
              "Error removing mpinLastSession from EncryptedStorage:",
              encryptedError
            );
          }
        } else {
          console.log("mpinLastSession does not exist, skipping removal.");
        }
        navigation.navigate("LoginPage" as never);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  const DATA = [
    {
      id: '1',
      title: 'Help Center',
      type: 'modal',
      action: handleHelpCenterPress,
    },
    {
      id: '2',
      title: 'Privacy Policy',
      type: 'modal',
      action: openPrivacyPolicy,
    },
    {
      id: '3',
      title: 'Delete Account',
      type: 'modal',
      action: handleDeleteAccountPress,
    },
    {
      id: '4',
      title: 'Change PIN',
      type: 'modal', // Indicating it's a screen
      action: navigateToChangePasswordScreen, // Function to navigate to the Change Password screen
    },
    {
      id: '5',
      title: 'Logout',
      type: 'modal',
      action: handleLogout,
    },
  ];

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

  const renderItem = ({ item }) => {
    if (item.type === 'modal') {
      return (
        <TouchableOpacity style={styles.item} onPress={item.action}>
          {item.id === '1' && (
            <MaterialIcons name="help-outline" size={24} color="#3C4764" />
          )}
          {item.id === '2' && (
            <MaterialIcons name="policy" size={24} color="#3C4764" />
          )}
          {item.id === '3' && (
            <AntDesign name="deleteuser" size={24} color="#FF4D4D" />
          )}
          {item.id === '4' && (
            <MaterialCommunityIcons name="lock-reset" size={24} color="#3C4764" />
          )}
          {item.id === '5' && (
            <FeatherIcon name="log-out" size={24} color="#3C4764" />
          )}
          <Text style={globalStyles.modalOptionText}>{item.title}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <Item
        key={item.id}
        title={item.title}
        onPress={() => navigation.navigate(item.screen)}
        notification={undefined}
      />
    );
  };
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
              <Text style={[globalStyles.profileImageText1, { color: '#fff' }]}>
                v{appVersion}
              </Text>
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
          <View style={[globalStyles.whiteBox, { top: 90 }]}>
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
                <CustomText style={styles.titleText}>
                  Account Setting
                </CustomText>
              </View>
            </View>

            <TouchableOpacity
              style={globalStyles.profileBlock}
              onPress={() =>
                navigation.navigate('ProfileDetailsUser' as never)
              }>
              <View style={[globalStyles.profileImageContainer]}>
                {data?.profilePhoto ? (
                  <Image
                    source={{
                      uri:
                        data?.profilePhoto +
                        `?timestamp=${new Date().getTime()}`,
                    }}
                    // resizeMode="contain"
                    style={globalStyles.profileImage}
                  />
                ) : (
                  <View style={globalStyles.initialsCircle}>
                    <Text style={globalStyles.initialsText}>
                      {capitalizeFirstLetter(data?.firstName?.charAt(0)) +
                        capitalizeFirstLetter(data?.lastName?.charAt(0))}
                    </Text>
                  </View>
                )}

                <View style={globalStyles.profileTextContainer}>
                  <Text style={globalStyles.profileImageText}>
                    {capitalizeFirstLetter(data.firstName) +
                      ' ' +
                      capitalizeFirstLetter(data.lastName)}
                  </Text>
                  <Text
                    style={[
                      globalStyles.profileImageText1,
                      { flexShrink: 1, flexWrap: 'wrap', maxWidth: 300 },
                    ]}>
                    {data?.email}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <FlatList
              data={DATA}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.list}
            />
          </View>
          <Modal
            transparent={true}
            visible={helpCenterModal}
            onRequestClose={() => setHelpCenterModal(false)}
            animationType="fade">
            <TouchableOpacity
              style={globalStyles.modalBackground}
              activeOpacity={1}
              onPress={() => setHelpCenterModal(false)}>
              <TouchableOpacity
                style={[
                  globalStyles.modalContainerContact,
                  { padding: 20, alignItems: 'center' },
                ]}
                activeOpacity={1}
                onPressIn={() => {
                  /* Prevent the touch event from propagating to the background */
                }}>
                <TouchableOpacity
                  style={globalStyles.closeButtonContact}
                  onPress={() => setHelpCenterModal(false)}>
                  <MaterialIcons name="close" size={15} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleContactUsPress}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}>
                  <LinearGradient
                    colors={['#4CAF50', '#3C4764']}
                    style={globalStyles.contactButton}>
                    <MaterialIcons
                      name="phone"
                      size={24}
                      color="#FFFFFF"
                      style={globalStyles.buttonIcon}
                    />
                    <Text style={globalStyles.buttonText}>Contact Us</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}>
            <TouchableOpacity
              style={globalStyles.modalOverlay}
              activeOpacity={1}
              onPress={() => setModalVisible(false)}>
              <View
                style={globalStyles.modalContent}
                onStartShouldSetResponder={() => true}>
                <TouchableOpacity
                  style={globalStyles.closeButtonContact}
                  onPress={() => setModalVisible(false)}>
                  <MaterialIcons name="close" size={15} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={globalStyles.modalText}>
                  Are you sure you want to{' '}
                  <Text style={{ fontWeight: 'bold' }}>Delete</Text> your account?
                  You will lose all your data.
                </Text>
                <View style={globalStyles.modalButtons}>
                  <TouchableOpacity
                    style={globalStyles.modalButton}
                    onPress={() => handleNoPress()}>
                    <Text style={globalStyles.modalButtonText}>No</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={globalStyles.modalButton}
                    onPress={() => handleYesPress()}>
                    <Text style={globalStyles.modalButtonText}>Yes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      </ScrollView>
      <FooterUser activeIcon={activeIcon} setActiveIcon={setActiveIcon} />
    </SafeAreaView>
  );
};

export default SubmitReport;

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
    marginVertical: 10
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
    // justifyContent: 'space-between',
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
});
