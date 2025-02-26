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
  PanResponder,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  PinchGestureHandler,
  TapGestureHandler,
  GestureHandlerRootView,
  State,
} from "react-native-gesture-handler";

const { width: viewportWidth, height: viewportHeight } = Dimensions.get("window");
const THUMBNAIL_SIZE = 30;
const THUMBNAIL_HEIGHT_SIZE = 40;

const ImageViewer = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { images = [], initialIndex = 0 } = route.params || {};

  const flatListRef = useRef(null);
  const thumbnailListRef = useRef(null);
  const scale = useRef(new Animated.Value(1)).current;
  const lastScale = useRef(1);
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const lastOffsetX = useRef(0);
  const lastOffsetY = useRef(0);
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  const onPinchEvent = Animated.event(
    [{ nativeEvent: { scale } }],
    { useNativeDriver: false }
  );

  const onPinchStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      let newScale = event.nativeEvent.scale;
      if (newScale > 1) {
        lastScale.current = newScale;
      } else {
        resetZoom();
      }
    }
  };

  const resetZoom = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: false }),
      Animated.spring(translateX, { toValue: 0, useNativeDriver: false }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: false }),
    ]).start(() => {
      lastScale.current = 1;
      lastOffsetX.current = 0;
      lastOffsetY.current = 0;
    });
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) =>
      Math.abs(gestureState.dy) > 10 || Math.abs(gestureState.dx) > 10,
    onPanResponderMove: (_, gestureState) => {
      if (lastScale.current > 1) {
        translateX.setValue(lastOffsetX.current + gestureState.dx);
        translateY.setValue(lastOffsetY.current + gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      lastOffsetX.current += gestureState.dx;
      lastOffsetY.current += gestureState.dy;
      if (gestureState.dy > 100 && lastScale.current === 1) {
        navigation.goBack();
      }
    },
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        pagingEnabled
        keyExtractor={(_, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={images.length > 0 ? initialIndex : 0}
        getItemLayout={(data, index) => ({
          length: viewportWidth,
          offset: viewportWidth * index,
          index,
        })}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / viewportWidth);
          setSelectedIndex(index);
          resetZoom();
          thumbnailListRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.5,
          });
        }}
        renderItem={({ item }) => (
          <View style={styles.imageWrapper} {...panResponder.panHandlers}>
            <Text style={styles.imageName}>{item.split("/").pop()}</Text>
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
                        transform: [{ scale }, { translateX }, { translateY }],
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
              flatListRef.current?.scrollToIndex({
                index,
                animated: false,
                viewPosition: 0,
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
    height: THUMBNAIL_HEIGHT_SIZE,
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
