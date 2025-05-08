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


export function calculateRemainingMetrics(remainingRouteCoords, currentSpeed) {
  if (!remainingRouteCoords?.length || currentSpeed == null || currentSpeed <= 0) {
    return { distance: 0, eta: 0 };
  }

  // Calculate remaining distance in degrees
  const totalDistance = remainingRouteCoords.reduce((sum, point, index, arr) => {
    if (index === 0) return 0;
    const dx = arr[index].latitude - arr[index - 1].latitude;
    const dy = arr[index].longitude - arr[index - 1].longitude;
    return sum + Math.sqrt(dx * dx + dy * dy);
  }, 0);

  const distanceMeters = totalDistance * 111139;

  // Use speed (in m/s) to calculate ETA
  const eta = distanceMeters / currentSpeed; // seconds

  return {
    distance: distanceMeters,
    eta: eta,
  };
}
