import { useTheme } from "@/contexts/ThemeContext";
import React from "react";
import { Pressable, PressableProps, Text } from "react-native";
import { cn } from "../utils/cn";

type ButtonProps = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
  textStyle?: any;
} & PressableProps;

export function Button({
  title,
  onPress,
  disabled = false,
  className,
  textStyle,
  ...rest
}: ButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={cn(
        "w-[280px] h-14 px-3 flex items-center justify-center rounded-md",
        "font-medium text-lg leading-7",
        disabled && "opacity-40",
        className
      )}
      style={({ pressed }) => {
        const backgroundColor = pressed ? colors.primaryDark : colors.primary;

        return {
          backgroundColor,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 4,
        };
      }}
      {...rest}
    >
      <Text
        style={[
          {
            fontFamily: "Inter_500Medium",
            fontSize: 18,
            lineHeight: 28,
            color: colors.buttonText,
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}
