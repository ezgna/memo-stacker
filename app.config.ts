import { ConfigContext } from "@expo/config";

export default ({ config }: ConfigContext) => {
  return {
    ...config,
    extra: {
      APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
      eas: {
        projectId: "883709c0-cd67-4849-aad0-20c519e9a69d",
      },
    },
  };
};