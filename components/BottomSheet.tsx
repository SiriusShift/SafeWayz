import { Dimensions, StyleSheet, View } from "react-native";
import React, { useCallback, useEffect, useImperativeHandle } from "react";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type BottomSheetProps = {
  children?: React.ReactNode;
};

export type BottomSheetRefProps = {
  scrollTo: (destination: number) => void;
  isActive: () => boolean;
  snapToIndex: (index: number) => void;
  close: () => void;
};

const BottomSheet = React.forwardRef<BottomSheetRefProps, BottomSheetProps>(
  ({ children }, ref) => {
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const active = useSharedValue(false);
    const insets = useSafeAreaInsets();
    
    // Define snap points as percentages of screen height
    const SNAP_POINTS = {
      CLOSED: SCREEN_HEIGHT,
      ONE_THIRD: -SCREEN_HEIGHT / 3,
      HALF: -SCREEN_HEIGHT / 2,
      FULL: -SCREEN_HEIGHT + insets.top + 50, // Adjust for safe area
    };

    const scrollTo = useCallback((destination: number) => {
      'worklet';
      active.value = destination !== SCREEN_HEIGHT;
      translateY.value = withSpring(destination, { 
        damping: 50,
        stiffness: 300,
      });
    }, []);

    const snapToIndex = useCallback((index: number) => {
      'worklet';
      switch(index) {
        case 0:
          scrollTo(SNAP_POINTS.ONE_THIRD);
          break;
        case 1:
          scrollTo(SNAP_POINTS.HALF);
          break;
        case 2:
          scrollTo(SNAP_POINTS.FULL);
          break;
        default:
          scrollTo(SNAP_POINTS.ONE_THIRD);
      }
    }, [scrollTo, SNAP_POINTS]);

    const close = useCallback(() => {
      'worklet';
      scrollTo(SNAP_POINTS.CLOSED);
    }, [scrollTo, SNAP_POINTS]);

    const isActive = useCallback(() => {
      return active.value;
    }, [active]);

    useImperativeHandle(
      ref, 
      () => ({ scrollTo, isActive, snapToIndex, close }), 
      [scrollTo, isActive, snapToIndex, close]
    );

    const context = useSharedValue({ y: 0 });

    const gesture = Gesture.Pan()
      .onStart(() => {
        context.value = { y: translateY.value };
      })
      .onUpdate((event) => {
        translateY.value = Math.max(
          context.value.y + event.translationY,
          SNAP_POINTS.FULL
        );
      })
      .onEnd(() => {
        if (translateY.value > -SCREEN_HEIGHT / 4) {
          // Close the sheet
          scrollTo(SNAP_POINTS.CLOSED);
        } else if (translateY.value > -SCREEN_HEIGHT / 2.5) {
          // Snap to one-third
          scrollTo(SNAP_POINTS.ONE_THIRD);
        } else if (translateY.value > -SCREEN_HEIGHT * 0.75) {
          // Snap to half
          scrollTo(SNAP_POINTS.HALF);
        } else {
          // Snap to full
          scrollTo(SNAP_POINTS.FULL);
        }
      });

    useEffect(() => {
      // Initialize in closed position
      scrollTo(SNAP_POINTS.CLOSED);
    }, [scrollTo, SNAP_POINTS.CLOSED]);

    const rBottomSheetStyle = useAnimatedStyle(() => {
      const borderRadius = interpolate(
        translateY.value,
        [SNAP_POINTS.FULL, SNAP_POINTS.CLOSED],
        [25, 5],
        Extrapolate.CLAMP
      );

      return {
        borderRadius,
        transform: [{ translateY: translateY.value }],
      };
    });

    return (
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.bottomSheetContainer, rBottomSheetStyle]}>
          <View style={styles.line} />
          <View style={styles.content}>
            {children}
          </View>
        </Animated.View>
      </GestureDetector>
    );
  }
);

export default BottomSheet;

const styles = StyleSheet.create({
  bottomSheetContainer: {
    height: SCREEN_HEIGHT,
    width: "100%",
    backgroundColor: "#fff",
    position: "absolute",
    top: 0,
    borderRadius: 25,
  },
  line: {
    width: 75,
    height: 4,
    alignSelf: "center",
    backgroundColor: "grey",
    marginVertical: 15,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});