// import CryptoES from "crypto-es";
// import { Base64 } from "crypto-es/lib/enc-base64";

// export const generateMasterKey = () => {
//   const masterKey = CryptoES.lib.WordArray.random(32);
//   return masterKey;
// };
// export const generateIv = () => {
//   const iv = CryptoES.lib.WordArray.random(16);
//   return iv.toString(Base64);
// };

// export const generateKeyFromPassword = (password: string) => {
//   const hash = CryptoES.SHA256(password);
//   return hash;
// };

// export const encryptMasterKey = (masterKey: CryptoES.lib.WordArray, password: string) => {
//   const iv = generateIv();
//   const parsedIv: CryptoES.lib.WordArray = Base64.parse(iv);
//   const key = generateKeyFromPassword(password);
//   const result = CryptoES.AES.encrypt(masterKey, key, { iv: parsedIv });
//   if (!result || !result.ciphertext) {
//     console.log("not exist result or result.cipherText");
//     return;
//   }
//   const encryptedMasterKey: string = result.ciphertext.toString(Base64);
//   return { encryptedMasterKey, iv };
// };

// export const decryptMasterKey = (encryptedMasterKey: string, password: string, iv: string) => {
//   const key = generateKeyFromPassword(password);
//   const parsedIv = CryptoES.enc.Base64.parse(iv);
//   const decryptedMasterKey: CryptoES.lib.WordArray = CryptoES.AES.decrypt(encryptedMasterKey, key, { iv: parsedIv });
//   return decryptedMasterKey.toString(Base64);
// };

// export const encryptEntryText = (entryText: string, masterKey: string, iv: string) => {
//   const parsedIv: CryptoES.lib.WordArray = CryptoES.enc.Base64.parse(iv);
//   const result = CryptoES.AES.encrypt(entryText, masterKey, { iv: parsedIv });
//   if (!result || !result.ciphertext) {
//     console.log("not exist result or result.cipherText");
//     return;
//   }
//   const encryptedText: string = result.ciphertext.toString(Base64);
//   return encryptedText;
// };

// export const decryptEntryText = (entryText: string, decryptedMasterKey: string, iv: string) => {
//   const parsedIv = CryptoES.enc.Base64.parse(iv);
//   const decryptedText: CryptoES.lib.WordArray = CryptoES.AES.decrypt(entryText, decryptedMasterKey, { iv: parsedIv });
//   return decryptedText.toString(CryptoES.enc.Utf8);
// };

import CryptoES from "crypto-es";
import { WordArray } from "crypto-es/lib/core";
import { Base64 } from "crypto-es/lib/enc-base64";

type objType = {
  ct: string;
  iv?: string;
  s?: string;
};

type cipherParamsType = Partial<{
  ciphertext: WordArray;
  iv: WordArray;
  salt: WordArray;
}>;

export const jsonFormatter = {
  stringify: (cipherParams: cipherParamsType) => {
    const obj: objType = { ct: cipherParams.ciphertext!.toString(Base64) };
    if (cipherParams.iv) {
      obj.iv = cipherParams.iv.toString(Base64);
    }
    if (cipherParams.salt) {
      obj.s = cipherParams.salt.toString(Base64);
    }
    return JSON.stringify(obj);
  },
  parse: (jsonStr: string) => {
    const obj: objType = JSON.parse(jsonStr);
    const cipherParams = CryptoES.lib.CipherParams.create({ ciphertext: Base64.parse(obj.ct) });
    if (obj.iv) {
      cipherParams.iv = Base64.parse(obj.iv);
    }
    if (obj.s) {
      cipherParams.salt = Base64.parse(obj.s);
    }
    return cipherParams;
  },
};

export const generateMasterKey = () => {
  const masterKey = WordArray.random(32);
  return masterKey.toString(Base64);
};

export const generateKeyFromPassword = (password: string) => {
  const salt = WordArray.random(16);
  const key = CryptoES.PBKDF2(password, salt, {
    keySize: 8,
    iterations: 1000,
  })
  return key.toString(Base64);
};