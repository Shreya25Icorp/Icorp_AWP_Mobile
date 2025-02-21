import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import {
  PinchGestureHandler,
  TapGestureHandler,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

const { width: viewportWidth } = Dimensions.get("window");
const IMAGE_WIDTH = viewportWidth;
const THUMBNAIL_SIZE = 35;
const THUMBNAIL_Height_SIZE = 50;


const ImageViewer = () => {
  const route = useRoute();
  const { images = [], initialIndex = 0 } = route.params || {};
  const flatListRef = useRef(null);
  const thumbnailListRef = useRef(null);
  const scale = useRef(new Animated.Value(1)).current;
  const lastScale = useRef(1);
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  // Handles pinch zoom gesture
  const onPinchEvent = Animated.event([{ nativeEvent: { scale } }], {
    useNativeDriver: false,
  });

  // Handles zoom state changes
  const onPinchStateChange = (event) => {
    if (event.nativeEvent.state === 5) {
      let newScale = event.nativeEvent.scale;
      if (newScale > 1) {
        lastScale.current = newScale;
      } else {
        resetZoom();
      }
    }
  };

  // Resets zoom to default
  const resetZoom = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: false }),
      Animated.spring(translateX, { toValue: 0, useNativeDriver: false }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: false }),
    ]).start(() => {
      lastScale.current = 1;
    });
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Main Image Viewer with Horizontal Sliding */}
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        pagingEnabled
        keyExtractor={(_, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / viewportWidth
          );
          setSelectedIndex(index);
          resetZoom(); // Reset zoom when switching images
          thumbnailListRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.5,
          });
        }}
        renderItem={({ item, index }) => (
          <View style={styles.imageWrapper}>
            {/* Display Image Name */}
            <Text style={styles.imageName}>{images[index].split("/").pop()}</Text>
            <PinchGestureHandler
              onGestureEvent={onPinchEvent}
              onHandlerStateChange={onPinchStateChange}
            >
              <TapGestureHandler
                numberOfTaps={2}
                onActivated={() =>
                  lastScale.current > 1
                    ? resetZoom()
                    : Animated.spring(scale, {
                      toValue: 2,
                      useNativeDriver: false,
                    }).start(() => {
                      lastScale.current = 2;
                    })
                }
              >
                <Animated.View style={styles.imageContainer}>
                  <Animated.Image
                    source={{ uri: item }}
                    style={[
                      styles.image,
                      {
                        transform: [
                          { scale },
                          { translateX },
                          { translateY },
                        ],
                      },
                    ]}
                    resizeMode="contain"
                  />
                </Animated.View>
              </TapGestureHandler>
            </PinchGestureHandler>
          </View>
        )}
      />

      {/* Thumbnail Slider */}
      <FlatList
        ref={thumbnailListRef}
        data={images}
        horizontal
        keyExtractor={(_, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        style={styles.thumbnailContainer}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => {
              setSelectedIndex(index);
              flatListRef.current.scrollToOffset({
                offset: index * viewportWidth,
                animated: false,
              });
              resetZoom();
            }}
          >
            <Image
              source={{ uri: item }}
              style={[
                styles.thumbnail,
                selectedIndex === index
                  ? styles.selectedThumbnail
                  : styles.unselectedThumbnail,
              ]}
            />
          </TouchableOpacity>
        )}
      />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageWrapper: {
    width: viewportWidth,
    alignItems: "center",
  },
  imageName: {
    color: "#000",
    fontSize: 16,
    marginVertical: 10,
  },
  imageContainer: {
    width: viewportWidth,
    height: "84%",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "85%",
    height: "90%",
  },
  thumbnailContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    paddingVertical: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_Height_SIZE,
    marginHorizontal: 2,
    borderRadius: 5,
  },
  selectedThumbnail: {
    borderWidth: 2,
    borderColor: "#fff",
  },
  unselectedThumbnail: {
    opacity: 0.5,
  },
});

export default ImageViewer;
