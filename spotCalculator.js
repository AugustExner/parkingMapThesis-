function generatePoints(coord1, coord2, stepSize) {
    // Beregn den samlede afstand mellem punkterne (i meter)
    const toRad = (degree) => degree * (Math.PI / 180);
    const toDeg = (radian) => radian * (180 / Math.PI);

    const R = 6371000; // Jordens radius i meter
    const lat1 = coord1[0], lon1 = coord1[1];
    const lat2 = coord2[0], lon2 = coord2[1];

    const φ1 = toRad(lat1), λ1 = toRad(lon1);
    const φ2 = toRad(lat2), λ2 = toRad(lon2);

    const Δφ = φ2 - φ1;
    const Δλ = λ2 - λ1;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const totalDistance = R * c; // Afstand i meter

    // Beregn forskellene i bredde- og længdegrader
    const latDiff = lat2 - lat1;
    const lonDiff = lon2 - lon1;

    // Beregn antal skridt
    const numSteps = Math.floor(totalDistance / stepSize);
    let points = [];

    for (let i = 1; i <= numSteps; i++) {
        const factor = (i * stepSize) / totalDistance;
        const newLat = lat1 + factor * latDiff;
        const newLon = lon1 + factor * lonDiff;
        points.push({ latitude: newLat, longitude: newLon });
    }

    return points;
}

// Eksempel på brug
const coord1 = [56.173674059122966, 10.189257742594277];
const coord2 = [56.17370168192626, 10.18905992968156];
const stepSize = 5;  // 5 meter mellem punkter

const points = generatePoints(coord1, coord2, stepSize);

// Brug JSON.stringify for at vise objekterne i et læsbart format
console.log(JSON.stringify( points, null, 2));


