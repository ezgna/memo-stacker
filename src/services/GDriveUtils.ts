import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { GDrive, MimeTypes } from "@robinbobin/react-native-google-drive-api-wrapper";

export const initializeGdrive = async (accessToken: string) => {
  const gdrive = new GDrive();
  gdrive.accessToken = accessToken;
  gdrive.fetchTimeout = 60000;
  return gdrive;
};

export const signinGoogle = async ()=>{
  try {
    await GoogleSignin.configure({
      scopes: ["https://www.googleapis.com/auth/drive.file"],
      iosClientId: "110368176913-u7anooc46iggk9n2ksi81pii7e5uqaas.apps.googleusercontent.com",
    });
    console.log("configure");
    const userInfo = await GoogleSignin.signIn();
    console.log(userInfo);
    if (userInfo.type === 'cancelled') {
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
}

export const uploadFileToGoogleDrive = async (gdrive: GDrive, data: object) => {
  const jsonData = JSON.stringify(data);
  const formattedDate = new Date()
    .toLocaleString("ja-JP")
    .replace(/\//g, "-")
    .replace(/:/g, "-")
    .replace(" ", "_");
  try {
    await gdrive.files
      .newMultipartUploader()
      .setData(jsonData, MimeTypes.JSON)
      .setRequestBody({ name: `ExportedMemoLog_${formattedDate}` })
      .execute();
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
    const data = await downloadFileFromGoogleDrive(gdrive, fileId);
    console.log(data);
  }
};

export const ExportGDrive = async () => {
  try {
    const gdrive = await signinGoogle();
    if (gdrive) {
      console.log("gdrive");
      const data = { entries: [{ date: "2024-09-21", text: "Backup Memo" }] };
      await uploadFileToGoogleDrive(gdrive, data);
    }
  } catch (e) {
    console.error(e);
  }
};

export const InportGDrive = async () => {
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
