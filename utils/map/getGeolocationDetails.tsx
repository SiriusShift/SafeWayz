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
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${data.longitude},${
        data.latitude
      }.json?access_token=${process.env.EXPO_PUBLIC_MAPBOX_KEY}`
    );
    
    const result = await response.json();
    
    // Store only the geocoded fields in cache
    geocodeCache[cacheKey] = {
      street: result.features[0]?.text || "Unknown Location",
      barangay: result.features[0]?.context[1]?.text || "Unknown Barangay",
      city: result.features[0]?.context[2]?.text || "Unknown City",
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