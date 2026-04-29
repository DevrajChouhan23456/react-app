/**
 * Shimmer — animated skeleton loader using Reanimated.
 * Matches the app's warm beige palette.
 */
import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { RADIUS } from '@/constants/theme';

interface ShimmerProps {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

export default function Shimmer({ width = '100%', height = 16, radius = RADIUS.sm, style }: ShimmerProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1200 }),
      -1,
      false
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [-300, 300]) }],
  }));

  return (
    <View
      style={[
        { width: width as any, height, borderRadius: radius, backgroundColor: '#EDE0D0', overflow: 'hidden' },
        style,
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, animStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,248,240,0.6)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}
