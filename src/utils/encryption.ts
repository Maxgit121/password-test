import CryptoJS from 'crypto-js';

// Generate a random salt
export const generateSalt = (length: number = 16): string => {
  return CryptoJS.lib.WordArray.random(length).toString();
};

// Hash password with salt
export const hashPassword = (password: string, salt: string): string => {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 512 / 32,
    iterations: 10000
  }).toString();
};

// Encrypt data with a key
export const encryptData = (data: string, key: string): string => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

// Decrypt data with a key
export const decryptData = (encryptedData: string, key: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Verify if a password matches a hash
export const verifyPassword = (password: string, salt: string, storedHash: string): boolean => {
  const hash = hashPassword(password, salt);
  return hash === storedHash;
};

// Generate a master encryption key from user password and salt
export const generateMasterKey = (password: string, salt: string): string => {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 1000
  }).toString();
};