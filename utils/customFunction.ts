import CryptoJS from "crypto-js";
import {saltkey} from "./saltkey"; // Ensure this is correctly imported

export const encryptString = (data: any) => {
  if (!data) return null;
  console.log("Original Data:", data);

  try {
    const secretKey = String(saltkey); // Ensure it's a string
    const ciphertext = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      secretKey
    ).toString();

    return ciphertext;
  } catch (error) {
    return null;
  }
};

export function formatMode(mode) {
  switch (mode) {
    case "day":
      return "hour";
    case "week":
      return "day";
    case "month":
      return "day";
    case "year":
      return "month";
    default:
      return "Select Date";
  }
}
export function extractLocationDetails(results) {
  if (!Array.isArray(results)) {
    console.error("Invalid results:", results);
    return {
      street: "Unknown Street",
      barangay: "Unknown Barangay",
      city: "Unknown City",
    };
  }

  console.log(results);
  let barangay = "Unknown Barangay";
  let city = "Unknown City";
  let street = "Unknown Street";

  for (const result of results) {
    for (const component of result.address_components) {
      if (component.types.includes("sublocality_level_2")) {
        barangay = component.long_name;
      }
      if (component.types.includes("locality")) {
        city = component.long_name;
      }
      if (component.types.includes("route")) {
        if (component.long_name === "Unnamed Road") continue;
        street = component.long_name;
      }
    }

    if (
      barangay !== "Unknown Barangay" &&
      city !== "Unknown City" &&
      street !== "Unknown Street"
    ) {
      break;
    }
  }

  return { street, barangay, city };
}
