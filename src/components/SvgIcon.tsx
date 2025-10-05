import React from "react";
import { SvgXml } from "react-native-svg";

interface SvgIconProps {
  xml: string;
  width?: number;
  height?: number;
  className?: string;
}

export const SvgIcon: React.FC<SvgIconProps> = ({
  xml,
  width = 24,
  height = 24,
  className,
}) => {
  return <SvgXml xml={xml} width={width} height={height} />;
};
