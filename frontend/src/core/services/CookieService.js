import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_REACT_APP_SECRET_KEY_ENCRYPTION;

// Function to encrypt data before storing it in a cookie
const encryptData = (data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

// Function to decrypt data retrieved from a cookie
const decryptData = (encryptedData) => {
    if (!encryptedData) {
        console.error('Encrypted data is empty');
        return null;
    }

    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

        if (!decryptedData) {
            console.error('Decrypted data is empty');
            return null;
        }

        return JSON.parse(decryptedData);
    } catch (error) {
        console.error('Error decrypting data: ', error);
        return null;
    }
};

// Function to set a cookie with encrypted data and an expiration time
export const setCookie = (name, value, days = 7) => {
    const encryptedValue = encryptData(value);
    Cookies.set(name, encryptedValue, { expires: days, secure: true });
};

// Function to get a decrypted cookie value
export const getCookie = (name) => {
    const encryptedValue = Cookies.get(name);

    // console.log("Encrypted Value: ", encryptedValue);

    if (encryptedValue) {
        let data = decryptData(encryptedValue);

        // console.log("Decrypted Value: ", data);

        return data;
    }
    return null;
};

// Function to remove a cookie
export const removeCookie = (name) => {
    Cookies.remove(name);
};
