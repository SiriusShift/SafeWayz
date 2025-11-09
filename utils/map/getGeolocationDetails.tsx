import { extractLocationDetails } from "../customFunction";

// Create a cache object at module level
const geocodeCache = {};

export const fetchGeocodeData = async (data) => {
  // Create a cache key from coordinates
  const cacheKey = `${data.longitude},${data.latitude}`;
  
  // Check if we already have this location cached
  if (geocodeCache[cacheKey]) {
    console.log("Using cached geocode data for:", cacheKey);
    return {
      ...data,
      ...geocodeCache[cacheKey]
    };
  }
  
  // Fetch from API if not cached
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${
        data.latitude
      },${data.longitude}&key=${
        process.env.EXPO_PUBLIC_GOOGLE_API
      }`
    );
    const result = await response.json();
    const location = await extractLocationDetails(result?.results || []);

    console.log(location, "location")

    
    // Store only the geocoded fields in cache
    geocodeCache[cacheKey] = {
      street: location.street,
      barangay: location.barangay,
      city: location.city,
    };
    
    // Return the full geocoded object
    return {
      ...data,
      ...geocodeCache[cacheKey]
    };
  } catch (error) {
    console.error("Error fetching geocode data:", error);
    return data; // Return original data if geocoding fails
  }
};

// Optional: Add a function to clear the cache if needed
export const clearGeocodeCache = () => {
  Object.keys(geocodeCache).forEach(key => {
    delete geocodeCache[key];
  });
};