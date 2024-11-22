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