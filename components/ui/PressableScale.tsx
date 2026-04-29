/**
 * PressableScale — wraps children in a scale-on-press animation.
 * Drop-in replacement for TouchableOpacity with better feel.
 */
import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  scaleTo?: number;
  disabled?: boolean;
}

export default function PressableScale({ children, onPress, style, scaleTo = 0.96, disabled }: Props) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(scaleTo, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
      onPress={onPress}
      disabled={disabled}
    >
      <Animated.View style={[animStyle, style as any]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
