import { Entry } from "@/types";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { GDrive, MimeTypes } from "@robinbobin/react-native-google-drive-api-wrapper";
import { SQLiteDatabase } from "expo-sqlite";

export const initializeGdrive = async (accessToken: string) => {
  const gdrive = new GDrive();
  gdrive.accessToken = accessToken;
  gdrive.fetchTimeout = 60000;
  return gdrive;
};

export const signinGoogle = async () => {
  try {
    await GoogleSignin.configure({
      scopes: ["https://www.googleapis.com/auth/drive.file"],
      iosClientId: "110368176913-u7anooc46iggk9n2ksi81pii7e5uqaas.apps.googleusercontent.com",
    });
    const userInfo = await GoogleSignin.signIn();
    if (userInfo.type === "cancelled") {
      return;
    }
    const tokens = await GoogleSignin.getTokens();
    if (tokens.accessToken) {
      const gdrive = await initializeGdrive(tokens.accessToken);
      return gdrive;
    }
  } catch (e) {
    console.error(e);
  }
};

export const uploadFileToGoogleDrive = async (gdrive: GDrive, dataList: object) => {
  const jsonData = JSON.stringify(dataList);
  const formattedDate = new Date()
    .toLocaleString("ja-JP")
    .replace(/\//g, "-")
    .replace(/:/g, "-")
    .replace(" ", "_");
  try {
    const response = await gdrive.files
      .newMultipartUploader()
      .setData(jsonData, MimeTypes.JSON)
      .setRequestBody({ name: `ExportedMemoLog_${formattedDate}` })
      .execute();
      return response.name
  } catch (e) {
    console.error("Upload error", e);
  }
};

export const downloadFileFromGoogleDrive = async (gdrive: GDrive, fileId: string) => {
  try {
    const data = await gdrive.files.getJson(fileId);
    return data;
  } catch (e) {
    console.error(e);
  }
};

export const listFilesInDrive = async (gdrive: GDrive) => {
  try {
    const response = await gdrive.files.list({
      q: "mimeType='application/json' and trashed=false",
      fields: "files(id, name)",
    });
    return response.files;
  } catch (e) {
    console.error(e);
  }
};

export const handleFileSelect = async (fileId: string) => {
  const gdrive = await signinGoogle();
  if (gdrive) {
    const dataList = await downloadFileFromGoogleDrive(gdrive, fileId);
    return dataList;
  }
};

export const ExportGDrive = async (db: SQLiteDatabase) => {
  try {
    const gdrive = await signinGoogle();
    if (gdrive) {
      const dataList: Entry[] = await db.getAllAsync("SELECT * FROM entries ORDER BY created_at DESC");
      const fileName = await uploadFileToGoogleDrive(gdrive, dataList);
      return fileName;
    }
  } catch (e) {
    console.error(e);
  }
};

export const ImportGDrive = async () => {
  try {
    const gdrive = await signinGoogle();
    if (gdrive) {
      const fileList = await listFilesInDrive(gdrive);
      return fileList;
    }
  } catch (e) {
    console.error(e);
  }
};
