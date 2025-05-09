export const calculateDistance = (point1, point2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Radius of the earth in km
  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.latitude)) *
      Math.cos(toRad(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // Convert to meters
};

export const findClosestPointOnRoute = (userLocation, routeCoordinates) => {
  let minDistance = Infinity;
  let closestIndex = 0;

  routeCoordinates.forEach((point, index) => {
    const distance = calculateDistance(userLocation, point);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });

  return { closestIndex, minDistance };
};

export const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};
