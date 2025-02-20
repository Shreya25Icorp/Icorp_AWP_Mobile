/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity} from 'react-native';
import { s as tw } from 'react-native-wind';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import Footer from '../components/Footer/FooterUser';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-simple-toast';
import { SERVER_URL } from '../Constant';
import FeatherIcon from 'react-native-vector-icons/Feather';

const ConfigureNFC = () => {
    const [tagId, setTagId] = useState<any>(null);
    const [activeIcon, setActiveIcon] = useState<number>(0);
    const [locationName, setLocationName] = useState('');
    const [clientName, setClientName] = useState('');
    const route = useRoute();
    const navigation = useNavigation();
    const clientId = route.params?.clientId;
    const locationId = route.params?.locationId;
    const checkpointId = route.params?.checkpointId;
    const checkpointName = route.params?.checkpointName;
    const windowWidth = Dimensions.get('window').width;

    const initNfc = async () => {
        await NfcManager.start();
        handleNfcDiscovery();
    };

    const handleNfcDiscovery = async () => {
        try {
            const techs = [NfcTech.Ndef, NfcTech.NdefFormatable];
            await NfcManager.requestTechnology(techs);

            const tag = await NfcManager.getTag();
            if (tag) {
                const tagId = tag.id;
                setTagId(tagId);
                console.log('NFC Tag ID:', tagId);

                // handleSave(tagId);
            } else {
                console.log('No NFC tag detected.');
            }
        } catch (ex) {
            console.warn(ex);
        } finally {
            NfcManager.cancelTechnologyRequest();
        }
    };

    // const fetchLocationName = async () => {
    //     try {
    //         const token = await AsyncStorage.getItem('accessToken');

    //         const headers = {
    //             token: token as string,
    //         };

    //         const response = await axios.get(`${SERVER_URL}/location/${locationId}`, {
    //             headers,
    //             withCredentials: true,
    //         });

    //         if (response.status === 200) {
    //             const data = response.data;
    //             setLocationName(data.locations.name);
    //         } else {
    //             console.error('API request failed:', response.status, response.statusText);
    //         }
    //     } catch (error) {
    //         console.error('Error fetching admin data:', error);
    //     }
    // };

    // const fetchClientName = async () => {
    //     try {
    //         const token = await AsyncStorage.getItem('accessToken');

    //         const headers = {
    //             token: token as string,
    //         };

    //         const response = await axios.get(`${SERVER_URL}/manager/client`, {
    //             headers,
    //             withCredentials: true,
    //         });

    //         if (response.status === 200) {
    //             const data = response.data;
    //             setClientName(data.user.userName);
    //         } else {
    //             console.error('API request failed:', response.status, response.statusText);
    //         }
    //     } catch (error) {
    //         console.error('Error fetching admin data:', error);
    //     }
    // };


    console.log(clientName, locationName, checkpointName);

    const handleSave = async (tagId: any) => {
        try {
            const token = await AsyncStorage.getItem('accessToken');

            const bodyData = {
                tagId: tagId,
                client: clientId,
                location: locationId,
                checkPoint: checkpointId
            }
            console.log("bodyData==> ", bodyData);

            await axios.post(`${SERVER_URL}/nfc/create`, bodyData,
                {
                    headers: {
                        token,
                    }
                }).then((res) => {
                    Toast.show('NFC Tag Scanned Successfully', Toast.SHORT);
                    navigation.navigate("ManagerHome");
                })
        } catch (error) {
            Toast.show('Tag is already in use!', Toast.SHORT);
            console.log(error);
        }
    };

    useEffect(() => {
        // fetchClientName();
        // fetchLocationName();
        initNfc();
    }, []);

    return (

        <View style={tw`flex-1`}>
        {/* Back Button */}
        
    
        {/* Background Image */}
        <Image
            source={require('../assets/images/NFCTagImage.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
        />
        <View style={styles.overlayContainer}>
       
            <View style={styles.bottomImageContainer}>
                <Image
                    source={require('../assets/images/homebottom.png')}
                    style={[styles.bottomImage, { width: windowWidth * 1 }]}
                    resizeMode="contain"
                />
                <View style={styles.textContainer}>
                    <Text style={styles.titleText}>Place the device over the tag</Text>
                    <Text style={styles.contentText}>
                        Touch the back of the phone to the tag. The NFC antenna location varies depending on the phone model.
                    </Text>
                    <Text style={styles.tagIdText}>Tag Id: {tagId || 'Scanning...'}</Text>
                </View>
            </View>
        </View>
        <Footer activeIcon={activeIcon} setActiveIcon={setActiveIcon} />
    </View>
    
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    titleText: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 10,
        color: '#262D3F',
    },
    tagIdText: {
        fontSize: 18,
        color: '#333',
    },
    backgroundImage: {
        width: 428,
        height: 518,
    },
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
    },
    bottomImageContainer: {
        alignItems: 'center',
    },
    bottomImage: {
        height: 363,
    },
    textContainer: {
        position: 'absolute',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginVertical: 36,
        paddingHorizontal: 24,
        paddingVertical: 16,
        width: '100%',
        height: '100%',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#3C4764',
        width: '80%',
        alignSelf: 'center',
        marginTop: '50%',
        marginBottom: '50%',
        borderRadius: 10,
        padding: 20,
    },

    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 8,
        backgroundColor: 'white',
        borderRadius: 5,
    },
    closeButtonText: {
        color: '#3C4764',
    },

    buttonContainer: {
        marginTop: 40,
    },
    saveButton: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
    },
    nfcButton: {
        backgroundColor: '#3C4764',
        padding: 10,
        borderRadius: 5,
    },
    saveButtonText: {
        color: '#3C4764',
        fontWeight: 'bold',
        textAlign: 'center',
    },

    contentText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 8,
        color: '#3C4764',
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 50,
        marginTop: 72,
    },
    modalText: {
        fontSize: 20,
        color: '#FFFFFF',
        marginBottom: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    buttonImage: {
        width: '100%',
        height: '100%',
    },
    backIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 30,
        paddingRight: 10,
        width: 50,
        height: 50,
      },
      backIcon: {
    width: 25,
    height: 25,
  },
});

export default ConfigureNFC;