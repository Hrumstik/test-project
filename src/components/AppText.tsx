import { useTheme } from "@/contexts/ThemeContext";
import { Text } from "react-native";
import { cn } from "../utils/cn";

type AppTextProps = {
  children: React.ReactNode;
  size?: "small" | "medium" | "large" | "heading";
  bold?: boolean;
  color?: "primary" | "secondary" | "tertiary";
  center?: boolean;
  className?: string;
};

export function AppText({
  children,
  size = "medium",
  bold = false,
  color = "primary",
  center = false,
  className,
}: AppTextProps) {
  const { colors } = useTheme();

  const getColor = () => {
    switch (color) {
      case "primary":
        return colors.text;
      case "secondary":
        return colors.textSecondary;
      case "tertiary":
        return colors.textTertiary;
      default:
        return colors.text;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case "small":
        return 14;
      case "medium":
        return 16;
      case "large":
        return 18;
      case "heading":
        return 20;
      default:
        return 16;
    }
  };

  return (
    <Text
      className={cn(
        size === "small" && "mb-2",
        size === "medium" && "mb-3",
        size === "large" && "mb-4",
        size === "heading" && "mb-5",
        center && "text-center",
        className
      )}
      style={{
        fontSize: getFontSize(),
        fontFamily: bold ? "Poppins_700Bold" : "Inter_400Regular",
        color: getColor(),
      }}
    >
      {children}
    </Text>
  );
}
