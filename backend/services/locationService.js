/**
 * Calculate distance between two GPS coordinates using the Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(3));
};

const toRad = (value) => (value * Math.PI) / 180;

/**
 * Verify GPS location against registered location
 * @param {number} submittedLat
 * @param {number} submittedLon
 * @param {number} registeredLat
 * @param {number} registeredLon
 * @param {number} allowedRadiusKm
 * @returns {{ verified: boolean, distance: number, allowedRadius: number }}
 */
const verifyLocation = (submittedLat, submittedLon, registeredLat, registeredLon, allowedRadiusKm) => {
    const distance = haversineDistance(submittedLat, submittedLon, registeredLat, registeredLon);
    const verified = distance <= allowedRadiusKm;
    return {
        verified,
        distance,
        allowedRadius: allowedRadiusKm
    };
};

module.exports = { haversineDistance, verifyLocation };
