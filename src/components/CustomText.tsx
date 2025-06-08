import { useThemeContext } from "@/src/contexts/ThemeContext";
import { StyleProp, Text, TextProps, TextStyle } from "react-native";
import { useLanguageContext } from "../contexts/LanguageContext";
import { themeColors } from "../utils/theme";
import { useFontContext } from "../contexts/FontContext";

interface Props extends TextProps {
  style?: StyleProp<TextStyle>;
}

const CustomText = ({ style, children, ...props }: Props) => {
  const { theme } = useThemeContext();
  const { isJapanese } = useLanguageContext();
  const { fontFamilyStyle } = useFontContext();

  return (
    <Text
      style={[
        isJapanese ? fontFamilyStyle : {},
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
