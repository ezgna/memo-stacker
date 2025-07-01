import { useThemeContext } from "@/src/contexts/ThemeContext";
import { StyleProp, Text, TextProps, TextStyle } from "react-native";
import { useFontContext } from "../contexts/FontContext";
import { themeColors } from "../utils/theme";

interface Props extends TextProps {
  style?: StyleProp<TextStyle>;
}

const CustomText = ({ style, children, ...props }: Props) => {
  const { theme } = useThemeContext();
  const { fontFamilyStyle } = useFontContext();

  return (
    <Text
      style={[
        fontFamilyStyle,
        {
          color: theme === "dark" ? themeColors.dark.primaryText : themeColors.light.primaryText,
          includeFontPadding: false,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

export default CustomText;
