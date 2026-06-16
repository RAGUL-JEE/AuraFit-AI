import React, { useEffect } from 'react';
import { StyleSheet, TextInput, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { 
  useSharedValue, 
  useAnimatedProps, 
  withTiming, 
  Easing,
  runOnJS
} from 'react-native-reanimated';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  format?: 'plain' | 'locale';
  suffix?: string;
  prefix?: string;
  decimals?: number;
  style?: any;
}

Animated.addWhitelistedNativeProps({ text: true });
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export default function AnimatedCounter({
  value,
  duration = 1800,
  format = 'plain',
  suffix = '',
  prefix = '',
  decimals,
  style
}: AnimatedCounterProps) {
  const animatedValue = useSharedValue(0);

  const [isFinished, setIsFinished] = React.useState(false);

  // Auto-determine decimals if not provided
  const resolvedDecimals = decimals !== undefined 
    ? decimals 
    : (Number.isInteger(value) ? 0 : Math.min(4, value.toString().split('.')[1]?.length || 0));

  useEffect(() => {
    setIsFinished(false);
    // Mimic the web easeOutCubic
    animatedValue.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.cubic),
    }, (finished) => {
      if (finished) {
        runOnJS(setIsFinished)(true);
      }
    });
  }, [value, duration]);

  // Compute final static string
  const factor = Math.pow(10, resolvedDecimals);
  const rounded = Math.round(value * factor) / factor;
  let finalString = rounded.toFixed(resolvedDecimals);
  if (format === 'locale') {
    const parts = finalString.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    finalString = parts.join('.');
  }
  finalString = `${prefix}${finalString}${suffix}`;

  const animatedProps = useAnimatedProps(() => {
    const currentVal = animatedValue.value;
    const factor = Math.pow(10, resolvedDecimals);
    const rounded = Math.round(currentVal * factor) / factor;
    
    // Formatting manually inside worklet is tricky since Intl is not available on UI thread.
    // We will do a basic locale formatting equivalent string manipulation if needed,
    // or just toString.
    let textValue = rounded.toFixed(resolvedDecimals);
    
    if (format === 'locale') {
      // Basic thousand separator logic for worklets
      const parts = textValue.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      textValue = parts.join('.');
    }
    
    return {
      text: `${prefix}${textValue}${suffix}`,
    } as any;
  });

  if (isFinished) {
    // Return static Text after animation completes. 
    // This perfectly bypasses the React Navigation + Reanimated TextInput visibility bug!
    return (
      <TextInput
        underlineColorAndroid="transparent"
        editable={false}
        value={finalString}
        pointerEvents="none"
        style={[styles.defaultText, style]}
      />
    );
  }

  return (
    <AnimatedTextInput
      underlineColorAndroid="transparent"
      editable={false}
      animatedProps={animatedProps}
      pointerEvents="none"
      style={[styles.defaultText, style]}
    />
  );
}

const styles = StyleSheet.create({
  defaultText: {
    padding: 0,
    margin: 0,
    ...Platform.select({
      ios: { paddingVertical: 0 },
      android: { includeFontPadding: false, textAlignVertical: 'center' },
    }),
  }
});
