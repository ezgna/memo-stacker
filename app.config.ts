import { ConfigContext } from "@expo/config";

export default ({ config }: ConfigContext) => {
  const APP_ENV = process.env.APP_ENV || "production";
  const SUFFIX = APP_ENV === "development" ? "_DEV" : "_PROD";

  return {
    ...config,
    extra: {
      KEY_WRAPPER: process.env[`KEY_WRAPPER${SUFFIX}`],
      APP_ENV: process.env.APP_ENV,
      eas: {
        projectId: "883709c0-cd67-4849-aad0-20c519e9a69d",
      },
      router: {
        origin: false,
      },
    },
  };
};
