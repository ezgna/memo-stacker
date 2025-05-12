import AsyncStorage from "@react-native-async-storage/async-storage";
import { migrateV1 } from "./v1_removeSyncedAndUserId";

const CURRENT_SCHEMA_VERSION = 1;

export const runMigrations = async () => {
  const stored = await AsyncStorage.getItem("dbSchemaVersion");
  const version = stored ? parseInt(stored) : 0;

  if (version < 1) {
    await migrateV1();
  }

  await AsyncStorage.setItem("dbSchemaVersion", CURRENT_SCHEMA_VERSION.toString());
};
