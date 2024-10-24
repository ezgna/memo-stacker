// import * as Crypto from "expo-crypto";
// import CryptoES from "crypto-es";
// import { Base64 } from "crypto-es/lib/enc-base64";

// export const generateMasterKey = async () => {
//   // const masterKey = await Crypto.getRandomBytesAsync(32);
//   // return CryptoES.lib.WordArray.create(Array.from(masterKey));
//   const masterKey = CryptoES.lib.WordArray.random(32)
//   return masterKey;
// };

// export const generateIv = async () => {
//   // const iv = await Crypto.getRandomBytesAsync(16);
//   // return CryptoES.lib.WordArray.create(Array.from(iv)).toString(CryptoES.enc.Base64);
//   const iv = CryptoES.lib.WordArray.random(16);
//   return iv.toString(Base64);
// };

// const generateKeyFromPassword = (password: string) => {
//   const hash = CryptoES.SHA256(password);
//   return hash;
// };

// export const encryptMasterKey = async (masterKey: CryptoES.lib.WordArray, password: string) => {
//   const iv = await generateIv();
//   const parsedIv = Base64.parse(iv);
//   const key = generateKeyFromPassword(password);
//   const encryptedMasterKey = CryptoES.AES.encrypt(masterKey, key, { iv: parsedIv });
//   return { encryptedMasterKey: encryptedMasterKey.toString(Base64), iv };
// };

// export const decryptMasterKey = (encryptedMasterKey: string, password: string, iv: string) => {
//   const key = generateKeyFromPassword(password);
//   const parsedIv = CryptoES.enc.Base64.parse(iv);
//   // const parsedEncryptedMasterKey = CryptoES.enc.Base64.parse(encryptedMasterKey)
//   const decryptedMasterKey = CryptoES.AES.decrypt(encryptedMasterKey, key, { iv: parsedIv });
//   return decryptedMasterKey.toString();
// };

// export const encryptEntryText = (entryText: string, masterKey: string, iv: string) => {
//   const parsedIv = Base64.parse(iv);
//   const encryptedText = CryptoES.AES.encrypt(entryText, masterKey, { iv: parsedIv });
//   return encryptedText.toString(Base64);
// };

// export const decryptEntryText = (entryText: string, masterKey: string, iv: string) => {
//   const parsedIv = CryptoES.enc.Base64.parse(iv);
//   const decryptedText = CryptoES.AES.decrypt(entryText, masterKey, { iv: parsedIv });
//   return decryptedText.toString(CryptoES.enc.Utf8);
// };


import CryptoES from "crypto-es";
import { Base64 } from "crypto-es/lib/enc-base64";

export const generateMasterKey = () => {
  const masterKey = CryptoES.lib.WordArray.random(32);
  return masterKey;
};
export const generateIv = () => {
  const iv = CryptoES.lib.WordArray.random(16);
  return iv.toString(Base64);
};

const generateKeyFromPassword = (password: string) => {
  const hash = CryptoES.SHA256(password);
  return hash;
};

export const encryptMasterKey = (masterKey: CryptoES.lib.WordArray, password: string) => {
  const iv = generateIv();
  const parsedIv: CryptoES.lib.WordArray = Base64.parse(iv);
  const key = generateKeyFromPassword(password);
  const result = CryptoES.AES.encrypt(masterKey, key, { iv: parsedIv });
  if (!result || !result.ciphertext) {
    console.log("not exist result or result.cipherText");
    return;
  }
  const encryptedMasterKey: string = result.ciphertext.toString(Base64);
  return { encryptedMasterKey, iv };
};

export const decryptMasterKey = (encryptedMasterKey: string, password: string, iv: string) => {
  const key = generateKeyFromPassword(password);
  const parsedIv = CryptoES.enc.Base64.parse(iv);
  const decryptedMasterKey: CryptoES.lib.WordArray = CryptoES.AES.decrypt(encryptedMasterKey, key, { iv: parsedIv });
  return decryptedMasterKey.toString(Base64);
};

export const encryptEntryText = (entryText: string, masterKey: string, iv: string) => {
  const parsedIv: CryptoES.lib.WordArray = CryptoES.enc.Base64.parse(iv);
  const result = CryptoES.AES.encrypt(entryText, masterKey, { iv: parsedIv });
  if (!result || !result.ciphertext) {
    console.log("not exist result or result.cipherText");
    return;
  }
  const encryptedText: string = result.ciphertext.toString(Base64);
  return encryptedText;
};

export const decryptEntryText = (entryText: string, masterKey: string, iv: string) => {
  const parsedIv = CryptoES.enc.Base64.parse(iv);
  const decryptedText: CryptoES.lib.WordArray = CryptoES.AES.decrypt(entryText, masterKey, { iv: parsedIv });
  return decryptedText.toString(CryptoES.enc.Utf8);
};
