import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  PinchGestureHandler,
  PanGestureHandler,
  State,
  GestureHandlerRootView,
  TapGestureHandler,
} from "react-native-gesture-handler";
const { width: viewportWidth, height: viewportHeight } = Dimensions.get("window");
const SWIPE_THRESHOLD = 50;
const ImageViewer = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { images = [], initialIndex = 0 } = route.params as {
    images?: string[];
    initialIndex?: number;
  };
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const scale = useRef(new Animated.Value(1)).current;
  const lastScale = useRef(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  useLayoutEffect(() => {
    if (route?.params?.checkpointName) {
      navigation.setOptions({ title: route.params.checkpointName });
    }
  }, [navigation, route.params]);
  const onPinchEvent = Animated.event([{ nativeEvent: { scale } }], {
    useNativeDriver: false,
  });
  const onPinchStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      let newScale = event.nativeEvent.scale;
      if (newScale > 1) {
        setIsZoomed(true);
        lastScale.current = newScale;
      } else {
        resetZoom();
      }
    }
  };
  const handleDoubleTap = () => {
    if (isZoomed) {
      resetZoom();
    } else {
      Animated.spring(scale, {
        toValue: 2,
        useNativeDriver: false,
      }).start(() => {
        setIsZoomed(true);
        lastScale.current = 2;
      });
    }
  };
  const resetZoom = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: false }),
      Animated.spring(translateX, { toValue: 0, useNativeDriver: false }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: false }),
    ]).start(() => {
      setIsZoomed(false);
      lastScale.current = 1;
    });
  };
  const handleSwipe = (direction: "next" | "prev") => {
    if (isZoomed) return;
    if (direction === "next" && currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetZoom();
    } else if (direction === "prev" && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetZoom();
    }
  };
  const onSwipeEvent = Animated.event([{ nativeEvent: { translationX: translateX } }], {
    useNativeDriver: false,
  });
  const onSwipeStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const swipeDistance = event.nativeEvent.translationX;
      if (swipeDistance > SWIPE_THRESHOLD) {
        handleSwipe("prev");
      } else if (swipeDistance < -SWIPE_THRESHOLD) {
        handleSwipe("next");
      }
      Animated.spring(translateX, { toValue: 0, useNativeDriver: false }).start();
    }
  };
  const onDragEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: false }
  );
  const onDragStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      Animated.spring(translateX, { toValue: 0, useNativeDriver: false }).start();
      Animated.spring(translateY, { toValue: 0, useNativeDriver: false }).start();
    }
  };
  if (!images.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No images available</Text>
      </View>
    );
  }
  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler
        onGestureEvent={isZoomed ? onDragEvent : onSwipeEvent}
        onHandlerStateChange={isZoomed ? onDragStateChange : onSwipeStateChange}
      >
        <PinchGestureHandler onGestureEvent={onPinchEvent} onHandlerStateChange={onPinchStateChange}>
          <TapGestureHandler numberOfTaps={2} onActivated={handleDoubleTap}>
            <Animated.View style={styles.imageContainer}>
            <View style={styles.fileNameContainer}>
            <Text style={styles.fileNameText}>
              {images[currentIndex].split("/").pop()}
            </Text>
          </View>
              <Animated.Image
                source={{ uri: images[currentIndex] }}
                style={[
                  styles.image,
                  { transform: [{ scale }, { translateX }, { translateY }] },
                ]}
                resizeMode="contain"
              />
            </Animated.View>
          </TapGestureHandler>
        </PinchGestureHandler>
      </PanGestureHandler>
      {/* Navigation Arrows Below the Image */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          onPress={() => handleSwipe("prev")}
          disabled={currentIndex === 0}
          style={[styles.navButton, currentIndex === 0 && styles.disabledButton]}
        >
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleSwipe("next")}
          disabled={currentIndex === images.length - 1}
          style={[styles.navButton, currentIndex === images.length - 1 && styles.disabledButton]}
        >
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: viewportWidth,
    height: '84%', // Reduced height to make space for arrows
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "85%",
    height: "90%",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    // position: "absolute",
    // bottom: 30, // Position below the image
    width: "100%",
    alignItems: "center",
    // gap: 60
  },
  navButton: {
    // backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
    marginHorizontal: 20,
  },
  navButtonText: {
    color: "#000",
    fontSize: 36,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.3,
  },
  errorText: {
    fontSize: 18,
    color: "#D01E12",
    textAlign: "center",
    marginTop: 20,
  },
  fileNameContainer: {
    // position: "absolute",
    // top: 10, // Adjust to move closer to the top
    // left: 0,
    // right: 0,
    // alignItems: "center",
    // backgroundColor: "rgba(0, 0, 0, 0.6)", // Semi-transparent background
    // paddingVertical: 5,
    // zIndex: 10, // Ensure it stays above the image
  },
  fileNameText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    top: -22
  },
});
export default ImageViewer;









