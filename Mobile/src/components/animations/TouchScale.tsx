import React, { useState } from 'react';
import { Pressable, ViewStyle, StyleProp } from 'react-native';
import { MotiView } from 'moti';

interface TouchScaleProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  disabled?: boolean;
}

export default function TouchScale({
  children,
  onPress,
  style,
  scaleTo = 0.96,
  disabled = false,
}: TouchScaleProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Pressable
      onPressIn={() => !disabled && setIsPressed(true)}
      onPressOut={() => !disabled && setIsPressed(false)}
      onPress={onPress}
      disabled={disabled}
      style={style}
    >
      <MotiView
        animate={{
          scale: isPressed ? scaleTo : 1,
        }}
        transition={{
          type: 'timing',
          duration: 150,
        }}
      >
        {children}
      </MotiView>
    </Pressable>
  );
}
