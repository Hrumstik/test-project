import React from "react";
import { Text as RNText, TextProps } from "react-native";

export const DefaultText: React.FC<TextProps> = ({ style, ...props }) => {
  return (
    <RNText style={[{ fontFamily: "Inter_400Regular" }, style]} {...props} />
  );
};
