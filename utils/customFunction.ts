import CryptoJS from "crypto-js";
import saltkey from "./saltkey"; // Ensure this is correctly imported

export const encryptString = (data: any) => {
  if (!data) return null;
  console.log("Original Data:", data);

  try {
    const secretKey = String(saltkey); // Ensure it's a string
    const ciphertext = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      secretKey
    ).toString();

    console.log("Encrypted Data:", ciphertext);
    return ciphertext;
  } catch (error) {
    console.error("Encryption Error:", error);
    return null;
  }
};
