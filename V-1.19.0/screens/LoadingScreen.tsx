import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { s as tw } from 'react-native-wind';

const LoadingScreen = () => {

    return (
        <View style={tw`flex-1`}>
            <Image
                source={require('../assets/images/home.png')}
                style={styles.backgroundImage}
                resizeMode="cover"
            />
            <View style={styles.overlayContainer}>
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
                </View>
                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>POWERED BY ACTIVE WORKFORCE PRO</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
    },
    overlayImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    logoContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoImage: {
        width: 200,
        height: 200,
    },
    footerContainer: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    footerText: {
        fontFamily: 'Roboto',
        marginBottom: 32,
        color: '#F2F2F2',
        fontSize: 14,
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: 20.02,
        letterSpacing: 0.17,
        textTransform: 'uppercase',
    },
});

export default LoadingScreen;
