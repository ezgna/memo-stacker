import * as FileSystem from "expo-file-system";
import { Button, View } from "react-native";

const dbFilePath = `${FileSystem.documentDirectory}SQLite/MemoLogMinute.db`;
const dbDirectoryPath = `${FileSystem.documentDirectory}SQLite`;

const resetDatabaseFile = async () => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(dbFilePath);
    const folderInfo = await FileSystem.getInfoAsync(dbDirectoryPath);
    if (folderInfo.exists) {
      console.log("fileInfo:", fileInfo);
      console.log("folderInfo", folderInfo);
      await FileSystem.deleteAsync(dbFilePath);
      const files = await FileSystem.readDirectoryAsync(dbDirectoryPath);
      console.log(files);
    } else {
      console.log("failed");
    }
  } catch (e) {
    console.error(e);
  }
};

const ResetDatabase = () => {
  return (
    <View>
      <Button title="resetDb" onPress={() => resetDatabaseFile()} />
    </View>
  );
};

export default ResetDatabase;
