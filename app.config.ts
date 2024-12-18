import { ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext) => {
  const APP_ENV = process.env.APP_ENV || "production";
  const SUFFIX = APP_ENV === "development" ? "_DEV" : "_PROD";

  return {
    ...config,
    extra: {
      KEY_WRAPPER: process.env[`KEY_WRAPPER${SUFFIX}`],
    },
  };
};