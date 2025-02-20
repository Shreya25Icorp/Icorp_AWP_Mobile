/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Platform,
  Modal,
  Linking,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {SERVER_URL, SERVER_URL_ROASTERING} from '../../Constant';
import {useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Cookies from '@react-native-cookies/cookies';
import {globalStyles} from '../../styles';
import {ScrollView} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-simple-toast';

const SidebarUser: React.FC<{isOpen: boolean; onClose: () => void}> = ({
  isOpen,
  onClose,
}) => {
  const navigation = useNavigation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(isOpen);
  const [loadingImage, setLoadingImage] = useState(false);
  const [data, setData] = useState<any>([]);
  const [image, setImage] = useState(null);
  const [appVersion, setAppVersion] = useState('');
  const [selectedButton, setSelectedButton] = useState<string | null>(null);

  const [shiftStatus, setShiftStatus] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAccountSetting, setModalAccountSetting] = useState(false);
  const [helpCenterModal, setHelpCenterModal] = useState(false);

  // const loginData = useSelector((state: any) => state.auth.loginData);
  // const firstName = loginData.data.firstName;
  // const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  // const lastName = loginData.data.lastName;
  // const capitalizedLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
  // const userName = loginData.data.userName;
  // const capitalizedUserName = userName.charAt(0).toUpperCase() + userName.slice(1);
  // const navigation = useNavigation();

  const [scaleValue] = useState(new Animated.Value(1)); // Scale animation

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
    setModalAccountSetting(false); // Close the main modal
    setHelpCenterModal(true); // Open the help center modal
  };

  const handleDeleteAccountPress = () => {
    setModalAccountSetting(false); // Close the main modal
    setModalVisible(true); // Open the help center modal
  };
  const handleContactUsPress = () => {
    Linking.openURL('tel:1300848450');
  };

  const handleLogout = async () => {
    // await AsyncStorage.clear();
    // await AsyncStorage.removeItem('accessToken');
    const response = await axios.get(`${SERVER_URL_ROASTERING}/logout`, {
      // headers,
      headers: {
        Cookie: await AsyncStorage.getItem('accessCookie').then(cookie => {
          const parsedCookie = JSON.parse(cookie);
          return `${parsedCookie.name}=${parsedCookie.value}`;
        }),
      },
      withCredentials: true,
    });
    if (response.status === 200) {
      const accessCookie = await AsyncStorage.getItem('accessCookie');
      await Cookies.removeSessionCookies();
      navigation.navigate('LoginPage' as never);
    }

    // console.log("response logout==>", response);
  };

  const fetchData = async () => {
    let status = await AsyncStorage.getItem('shiftStatus');
    setShiftStatus(status);
    try {
      //   setLoadingImage(true);
      const response = await axios.get(`${SERVER_URL_ROASTERING}/me`, {
         
        withCredentials: true,
      });
      if (response.status === 200) {
        // setIsLoading(false);
        const data = response.data;
        setData(data.user);
        setImage(data.user.profilePhoto);
        // setLoadingImage(false);
      } else {
        console.error(
          'API request failed:',
          response.status,
          response.statusText,
        );
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://activeworkforcepro.com.au/privacy-policy').catch(err =>
      console.error("Couldn't load page", err)
    );
  };

  const handleMenuItemClick = (screenName: string) => {
    navigation.navigate(screenName);
    onClose();
  };

  useEffect(() => {
    fetchData();
    setIsSidebarOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      // For Android, fetch the version from the package.json
      import('../.././package.json').then(pkg => {
        setAppVersion(pkg.version);
      });
    } else {
      console.log('Not for IOS');
    }
  }, []);

  function capitalizeFirstLetter(string: string) {
    if (!string || typeof string !== 'string') return ''; // Handle empty, undefined, or non-string values
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  const handleNoPress = () => {
    setModalVisible(false);
  };

  const handleYesPress = async () => {
    setModalVisible(false);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await axios.delete(
        `${SERVER_URL_ROASTERING}/update/user/${userId}`,
        {
          // headers,
          headers: {
            Cookie: await AsyncStorage.getItem('accessCookie').then(cookie => {
              const parsedCookie = JSON.parse(cookie);
              return `${parsedCookie.name}=${parsedCookie.value}`;
            }),
          },
          withCredentials: true,
        },
      );
      // console.log('response', response);
      if (response.status === 200) {
        Toast.show(`Account ${response?.data?.message}`, Toast.LONG);
        handleLogout();
      }
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  };

  return (
    <View style={styles.sidebarContainer}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.sidebar}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/awp_logo_blue.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.profileImageText1}>v{appVersion}</Text>
          </View>

          <View style={styles.mainContainer}>
            <View style={styles.profileSection}>
              <TouchableOpacity style={styles.profileImageContainer}>
                {loadingImage ? (
                  <View style={styles.loaderCircle}>
                    <ActivityIndicator size="large" color="#3C4764" />
                  </View>
                ) : image ? (
                  <Image
                    source={{uri: image}}
                    resizeMode="contain"
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.initialsCircle}>
                    <Text style={styles.initialsText}>
                      {capitalizeFirstLetter(data?.firstName?.charAt(0)) +
                        capitalizeFirstLetter(data?.lastName?.charAt(0))}
                    </Text>
                  </View>
                )}
                <View style={styles.profileImageContainer}>
                  <View style={styles.profileTextContainer}>
                    <Text style={styles.profileImageText}>
                      {capitalizeFirstLetter(data?.firstName) +
                        ' ' +
                        capitalizeFirstLetter(data?.lastName)}
                    </Text>
                    <Text
                      style={[
                        styles.profileImageText1,
                        {flexShrink: 1, flexWrap: 'wrap', maxWidth: 200},
                      ]}>
                      {data?.email}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              <View style={styles.closeButtonContainer}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  {/* <Image
                                    source={require('../../assets/manager/close.png')}
                                    style={styles.closeButtonIcon}
                                    resizeMode="contain"
                                /> */}
                  <FeatherIcon name="x-circle" size={25} color="#3C4764" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.horizontalLine}></View>
            <View style={[styles.textContainer, {top: 60}]}>
              <TouchableOpacity
                style={styles.detailsContainer}
                onPress={() => handleMenuItemClick('UserHome')}>
                <View style={styles.detailsContent}>
                  <FeatherIcon
                    name="pie-chart"
                    size={25}
                    color="#3C4764"
                    style={styles.icon}
                  />
                  <Text style={styles.menuTextDashboard}>Dashboard</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={[styles.textContainer, {top: 110}]}>
              <TouchableOpacity
                style={
                  isOpen ? styles.detailsContainer : styles.detailsContainer
                }
                onPress={() => handleMenuItemClick('ProfileDetailsUser')}>
                <View style={styles.detailsContent}>
                  <FeatherIcon
                    name="user"
                    size={25}
                    color="#3C4764"
                    style={styles.icon}
                  />
                  <Text style={styles.menuTextProfile}>Profile</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* <View style={[styles.textContainer, {top: 160}]}>
              <TouchableOpacity
                style={
                  isOpen ? styles.detailsContainer : styles.detailsContainer
                }
                onPress={() => handleMenuItemClick('ScheduleAndAttendance')}>
                <View style={styles.detailsContent}>
                  <FeatherIcon
                    name="calendar"
                    size={25}
                    color="#3C4764"
                    style={styles.icon}
                  />
                  <Text style={styles.menuTextProfile}>
                    Schedule and Attendance
                  </Text>
                </View>
              </TouchableOpacity>
            </View> */}

            {/* <View style={[styles.textContainer, {top: 210}]}>
              <TouchableOpacity
                style={
                  isOpen ? styles.detailsContainer : styles.detailsContainer
                }
                onPress={() => handleMenuItemClick('UnconfirmedShifts')}>
                <View style={styles.detailsContent}>
                  <FontAwesome6
                    name="user-clock"
                    size={21}
                    color="#3C4764"
                    style={styles.icon}
                  />
                  <Text style={styles.menuTextProfile}>Unconfirmed Shifts</Text>
                </View>
              </TouchableOpacity>
            </View> */}
            {/* <View style={[styles.textContainer, {top: 260}]}>
              <TouchableOpacity
                style={
                  isOpen ? styles.detailsContainer : styles.detailsContainer
                }
                onPress={() => handleMenuItemClick('DeclinedShifts')}>
                <View style={styles.detailsContent}>
                  <Fontisto
                    name="close"
                    size={25}
                    color="#3C4764"
                    style={styles.icon}
                  />
                  <Text style={styles.menuTextProfile}>Declined Shifts</Text>
                </View>
              </TouchableOpacity>
            </View> */}
            {/* <View style={[styles.textContainer, {top: 310}]}>
              <TouchableOpacity
                disabled={shiftStatus === 'punchIn' ? false : true}
                style={
                  isOpen ? styles.detailsContainer : styles.detailsContainer
                }
                onPress={() =>
                  shiftStatus === 'punchIn'
                    ? handleMenuItemClick('Reports')
                    : null
                }>
                <View style={styles.detailsContent}>
                  <FeatherIcon
                    name="file-text"
                    size={25}
                    color={shiftStatus === 'punchIn' ? '#3C4764' : '#A8A8A8'}
                    style={styles.icon}
                  />
                  <Text
                    style={[
                      styles.menuTextProfile,
                      {
                        color:
                          shiftStatus === 'punchIn' ? '#3C4764' : '#A8A8A8',
                      },
                    ]}>
                    My Reports
                  </Text>
                </View>
              </TouchableOpacity>
            </View> */}
            {/* <View style={[styles.textContainer, {top: 360}]}>
              <TouchableOpacity
                disabled={shiftStatus === 'punchIn' ? false : true}
                style={
                  isOpen ? styles.detailsContainer : styles.detailsContainer
                }
                onPress={() =>
                  shiftStatus === 'punchIn'
                    ? handleMenuItemClick('SubmitReport')
                    : null
                }>
                <View style={styles.detailsContent}>
                  <FeatherIcon
                    name="bar-chart"
                    size={25}
                    color={shiftStatus === 'punchIn' ? '#3C4764' : '#A8A8A8'}
                    style={styles.icon}
                  />
                  <Text
                    style={[
                      styles.menuTextProfile,
                      {
                        color:
                          shiftStatus === 'punchIn' ? '#3C4764' : '#A8A8A8',
                      },
                    ]}>
                    Submit a Report
                  </Text>
                </View>
              </TouchableOpacity>
            </View> */}
            {/* <View style={[styles.textContainer, {top: 410}]}>
              <TouchableOpacity
                disabled={shiftStatus === 'punchIn' ? false : true}
                style={
                  isOpen ? styles.detailsContainer : styles.detailsContainer
                }
                onPress={() =>
                  shiftStatus === 'punchIn'
                    ? handleMenuItemClick('Documents')
                    : null
                }>
                <View style={styles.detailsContent}>
                  <FeatherIcon
                    name="folder"
                    size={25}
                    color={shiftStatus === 'punchIn' ? '#3C4764' : '#A8A8A8'}
                    style={styles.icon}
                  />
                  <Text
                    style={[
                      styles.menuTextProfile,
                      {
                        color:
                          shiftStatus === 'punchIn' ? '#3C4764' : '#A8A8A8',
                      },
                    ]}>
                    Documents
                  </Text>
                </View>
              </TouchableOpacity>
            </View> */}

            <View style={[styles.textContainer, {top: 160}]}>
              <TouchableOpacity
                style={styles.detailsContainer}
                onPress={() => setModalAccountSetting(true)}>
                <View style={styles.detailsContent}>
                  <MaterialIcons
                    name="manage-accounts"
                    size={25}
                    color="#3C4764"
                    style={styles.icon}
                  />
                  <Text style={styles.menuTextProfile}>Account Setting</Text>
                </View>
              </TouchableOpacity>
            </View>

            <Modal
              transparent={true}
              visible={modalAccountSetting}
              onRequestClose={() => setModalAccountSetting(false)}>
              <View style={styles.modalBackground}>
                <View style={[styles.modalContainer]}>
                  <View
                    style={[
                      globalStyles.headerContainer,
                      {
                        flexDirection: 'row',
                        paddingLeft: 20,
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                        justifyContent: 'space-between',
                      },
                    ]}>
                    <View style={{flexDirection: 'row'}}>
                      <MaterialIcons name="settings" size={30} color="#fff" />
                      <Text style={[globalStyles.headerText, {fontSize: 20}]}>
                        Settings
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setModalAccountSetting(false)}
                      style={{right: 10}}>
                      <MaterialIcons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={handleDeleteAccountPress}>
                    <AntDesign name="deleteuser" size={24} color="#FF4D4D" />
                    <Text style={styles.modalOptionText}>Delete Account</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={handleHelpCenterPress}>
                    <MaterialIcons
                      name="help-outline"
                      size={24}
                      color="#3C4764"
                    />
                    <Text style={styles.modalOptionText}>Help Center</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={openPrivacyPolicy}>
                    <MaterialIcons name="policy" size={24} color="#3C4764" />
                    <Text style={styles.modalOptionText}>Privacy Policy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* Help Center Modal */}
            <Modal
              transparent={true}
              visible={helpCenterModal}
              onRequestClose={() => setHelpCenterModal(false)}>
              <View style={styles.modalBackground}>
                <View
                  style={[
                    styles.modalContainer,
                    {padding: 20, alignItems: 'center'},
                  ]}>
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
                      style={styles.contactButton}>
                      <MaterialIcons
                        name="phone"
                        size={24}
                        color="#FFFFFF"
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.buttonText}>Contact Us</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <Modal
              // animationType="fade"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(!modalVisible);
              }}>
              <View style={globalStyles.modalOverlay}>
                <View style={globalStyles.modalContent}>
                  <Text style={globalStyles.modalText}>
                    Are you sure you want to delete your account? You will lose
                    your all data.
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
              </View>
            </Modal>

            <View style={[styles.textContainer, {top: 210}]}>
              <TouchableOpacity
                style={styles.detailsContainer}
                onPress={handleLogout}>
                <View style={styles.detailsContent}>
                  <FeatherIcon
                    name="log-out"
                    size={25}
                    color="#3C4764"
                    style={styles.icon}
                  />
                  <Text style={styles.menuTextProfile}>Logout</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
    justifyContent: 'center',
    marginBottom: 200,

    // alignItems: 'flex-end',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  sidebar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EDEFF4',
  },
  closeButton: {
    top: 22,
    alignSelf: 'flex-end',
    paddingRight: 22,
  },
  closeButtonContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  closeButtonIcon: {
    width: 24,
    height: 24,
  },
  closeButtonText: {
    color: '#333',
    fontSize: 16,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 25,
    marginBottom: 20,
  },
  logoImage: {
    width: 200,
    height: 50,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profileImageContainer: {
    alignItems: 'center',
    // bottom: 10,
    flexDirection: 'row',
    marginLeft: 16,
  },
  profileTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginLeft: 4,
    justifyContent: 'flex-start',
  },
  profileImageText: {
    marginTop: 5,
    fontSize: 18,
    color: '#262D3F',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  profileImageText1: {
    marginTop: 5,
    fontSize: 14,
    color: '#3C4764',
    // textAlign: 'center',
  },
  loaderCircle: {
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
  initialsCircle: {
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: '#262D3F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  initialsText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  mainContainer: {
    position: 'absolute',
    top: 100,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 100,
    flexDirection: 'row',
  },
  horizontalLine: {
    borderBottomWidth: 1,
    borderColor: '#B6BED3',
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  textContainer: {
    position: 'absolute',
    top: 70,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
    height: 100,
    flexDirection: 'row',
    marginTop: 22,
  },
  menuIconContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
  },
  menuIcon: {
    width: 24,
    height: 24,
  },
  menuText: {
    marginLeft: 28,
    fontSize: 16,
    color: '#3C4764',
  },
  menuTextProfile: {
    marginLeft: 28,
    fontSize: 16,
    color: '#3C4764',
  },
  menuTextDashboard: {
    marginLeft: 27,
    fontSize: 16,
    color: '#3C4764',
  },
  menuText1: {
    marginLeft: 36,
    fontSize: 16,
    color: '#FFFFFF',
  },
  detailsContainer: {
    position: 'absolute',
    margin: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personalInfoBlock: {
    marginTop: 22,
  },
  icon: {
    width: 30,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    // padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'flex-start',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    color: '#3C4764',
    marginLeft: 10,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    width: '100%',
    padding: 20,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#3C4764',
    marginLeft: 10,
  },
  modalIcon: {
    marginRight: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#3C4764',
  },
  closeButtonContact: {
    position: 'absolute',
    top: -13,
    right: -10,
    backgroundColor: '#FF4D4D',
    borderRadius: 25,
    padding: 4,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    // marginLeft: 10,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: 10,
  },
});

export default SidebarUser;
