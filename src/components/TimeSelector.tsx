import { useTheme } from "@/contexts/ThemeContext";
import i18n from "@/utils/i18n";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TimeSelectorProps {
  selectedTime: number;
  onTimeChange: (time: number) => void;
}

const timeOptions = [
  { value: 15, label: "15" },
  { value: 30, label: "30" },
  { value: 45, label: "45" },
  { value: 60, label: "60" },
  { value: 90, label: "90" },
  { value: 120, label: "120" },
];

export const TimeSelector: React.FC<TimeSelectorProps> = ({
  selectedTime,
  onTimeChange,
}) => {
  const { colors } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const renderTimeItem = ({
    item,
  }: {
    item: { value: number; label: string };
  }) => {
    const isSelected = selectedTime === item.value;

    return (
      <TouchableOpacity
        onPress={() => {
          onTimeChange(item.value);
          setIsModalVisible(false);
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 12,
          paddingHorizontal: 16,
          backgroundColor: isSelected ? colors.primary + "20" : "transparent",
          borderRadius: 8,
          marginVertical: 2,
        }}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: isSelected ? colors.primary : colors.border,
            backgroundColor: isSelected ? colors.primary : "transparent",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          {isSelected && (
            <Ionicons name="checkmark" size={12} color={colors.buttonText} />
          )}
        </View>
        <Text
          style={{
            fontFamily: "Inter_500Medium",
            fontSize: 16,
            color: colors.text,
            flex: 1,
          }}
        >
          {item.label} {i18n.t("minutes")}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Pressable
        onPress={() => setIsModalVisible(true)}
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 6,
        }}
      >
        <Text
          style={{
            fontFamily: "Inter_500Medium",
            fontSize: 14,
            color: colors.buttonText,
          }}
        >
          {i18n.t("change")}
        </Text>
      </Pressable>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text
              style={{
                fontFamily: "Poppins_700Bold",
                fontSize: 18,
                color: colors.text,
              }}
            >
              {i18n.t("max_cooking_time")}
            </Text>
            <Pressable
              onPress={() => setIsModalVisible(false)}
              style={{
                padding: 8,
              }}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <FlatList
            data={timeOptions}
            renderItem={renderTimeItem}
            keyExtractor={(item) => item.value.toString()}
            style={{ flex: 1, paddingHorizontal: 16 }}
            contentContainerStyle={{ paddingVertical: 16 }}
          />

          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <Pressable
              onPress={() => setIsModalVisible(false)}
              style={{
                backgroundColor: colors.primary,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 16,
                  color: colors.buttonText,
                }}
              >
                {i18n.t("set")}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
};
