const map = L.map("map").setView([56.17254, 10.189626], 18);
let parkingSpots = [];
let parkingCircles = {}; // Store circles by SpotID
let walkingCoordsArray = []; //Purple Circles
let googleCoordsArray = [];

//BLACK CIRCLES - GPS
let gpsArray = [];

//ORANGE CIRCLES - GROUND TRUTH
let groundTruthArray = [];

let registeredCarArray = [];

document.addEventListener("DOMContentLoaded", init);

function init() {
  console.log("DOM fully loaded. Running fetchParkingSpots...");
  fetchParkingSpots();
  fetchDetectedCars();
  setupTileLayer();
  drawWalkingCircles();
}

async function fetchDetectedCars() {
  try {
    const response = await fetch("http://localhost:8000/getDetectedCars");
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    detectedCars = data.detectedCars;

    console.log("Number of detected cars", detectedCars.length);
    console.log("detectedCars", detectedCars);

    detectedCars.forEach((detectedCar) => {
      detectedCarCricle(detectedCar.lat, detectedCar.lng, detectedCar.color);
    });
  } catch (error) {
    console.error("Error fetching detected cars:", error);
  }
}

// Fetch parking data from API
async function fetchParkingSpots() {
  try {
    const response = await fetch("http://localhost:8000/getParkingSpots");
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();

    // Extract all parking spots from nested structure
    // parkingSpots = extractParkingSpots(data.parkingSpots);

    registeredCarArray = data.registeredCarsData;
    console.log("RegisteredCars", registeredCarArray.length);

    compass0 = data.compass0;
    compass5 = data.compass5;
    compass7 = data.compass7;

    // allSpots = data.allSpots
    // console.log("all parkingspots", allSpots);

    console.log("compass0 parkingspots", compass0);
    console.log("compass5 parkingspots", compass5);
    console.log("compass7 parkingspots", compass7);

    oldCoords = data.oldCoords;
    console.log("oldCoords", oldCoords.length);
    newCoords = data.newCoords;
    console.log("newCoords", newCoords.length);

    
    // oldCoords.forEach((coordSet) => {
    //   oldCoordsCircles(coordSet.lat, coordSet.lng);
    // });

    // newCoords.forEach((coordSet) => {
    //   newCoordsCircle(coordSet.lat, coordSet.lng);
    // });

    compass0.forEach((spot) => {
      createParkingCircle(
        spot.latitude,
        spot.longitude,
        spot.spotID,
        spot.occupied,
        spot.color
      );
    });

    compass5.forEach((spot) => {
      createParkingCircle(
        spot.latitude,
        spot.longitude,
        spot.spotID,
        spot.occupied,
        spot.color
      );
    });

    compass7.forEach((spot) => {
      createParkingCircle(
        spot.latitude,
        spot.longitude,
        spot.spotID,
        spot.occupied,
        spot.color
      );
    });

    // compass0.forEach((spot) => {
    //   parkingRadius(
    //     spot.latitude,
    //     spot.longitude,
    //     spot.spotID,
    //     spot.occupied,
    //     spot.color
    //   );
    // });

    // compass5.forEach((spot) => {
    //   parkingRadius(
    //     spot.latitude,
    //     spot.longitude,
    //     spot.spotID,
    //     spot.occupied,
    //     spot.color
    //   );
    // });

    // compass7.forEach((spot) => {
    //   parkingRadius(
    //     spot.latitude,
    //     spot.longitude,
    //     spot.spotID,
    //     spot.occupied,
    //     spot.color
    //   );
    // });

    console.log("Total parking spots fetched:", parkingSpots.length);
    updateParkingSpots();
  } catch (error) {
    console.error("Error fetching parking spots:", error);
  }
}

// Extract parking spots from nested JSON structurefunction
function extractParkingSpots(data) {
  let spots = []; // This will store all the parking spots

  Object.values(data).forEach((street) => {
    // Loop through each street

    Object.values(street).forEach((directionArray) => {
      // Loop through each directionArray

      spots.push(...directionArray);
      // Spread and add all parking spots to the final array
    });
  });

  return spots;
}

// Update displayed parking spots
function updateParkingSpots() {
  if (parkingSpots.length === 0) {
    return console.warn("No parking spots found!");
  }

  // Remove existing circles
  Object.values(parkingCircles).forEach((circle) => map.removeLayer(circle));
  parkingCircles = {}; // Clear previous circles

  // Create new circles
  parkingSpots.forEach(({ latitude, longitude, spotID, occupied }) => {
    parkingCircles[spotID] = createParkingCircle(
      latitude,
      longitude,
      spotID,
      occupied
    ); 
  });

  console.log("Updated parking spots on the map.");
}

function drawRegisteredCars(oldLat, oldLng, newLat, newLng) {
  L.circle([oldLat, oldLng], {
    fillColor: "green",
    fillOpacity: 0.5,
    radius: 2,
  }).addTo(map);

  L.circle([newLat, newLng], {
    fillColor: "yellow",
    fillOpacity: 0.5,
    radius: 2,
  }).addTo(map);
}

// Function that creates a circle for a parking spot
function createParkingCircle(lat, lng, spotID, occupied, batchColor) {
  const fillColor = occupied ? "#f03" : "#3388ff";
  const strokeColor =
    batchColor !== "none" ? batchColor : occupied ? "red" : "blue";

  const circle = L.circle([lat, lng], {
    color: strokeColor, // Outer stroke color
    fillColor: fillColor, // Inner fill color
    fillOpacity: 0.5,
    radius: 2,
  }).addTo(map);

  circle.on("click", function () {
    circle
      .bindPopup(` SpotID: ${spotID} <br>Latitude: ${lat}<br>Longitude: ${lng}`)
      .openPopup();
  });
}

function detectedCarCricle(lat, lng, batchColor) {
  var circle = L.circle([lat, lng], {
    color: batchColor,
    fillColor: "yellow",
    fillOpacity: 0.3,
    radius: 1,
  }).addTo(map);

  circle.on("click", function () {
    circle
      .bindPopup(`DetectedCar<br> Latitude: ${lat}<br>Longitude: ${lng}`)
      .openPopup();
  });
}

// Set up tile layer for the map
function setupTileLayer() {
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 30,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
}

// Handle map click event
var popup = L.popup();
function onMapClick(e) {
  popup
    .setLatLng(e.latlng)
    .setContent("You clicked the map at " + e.latlng.toString())
    .openOn(map);
}
map.on("click", onMapClick);

//Walking circles
function walkingCircles(lat, lng) {
  var circle = L.circle([lat, lng], {
    color: "purple",
    fillColor: "purple",
    fillOpacity: 0.5,
    radius: 0.5,
  }).addTo(map);
}

function drawWalkingCircles() {
  walkingCoordsArray.forEach((coord) => {
    walkingCircles(coord.lat, coord.lng);
  });

  googleCoordsArray.forEach((coords) => {
    googleCircles(coords.lat, coords.lng);
  });

  gpsArray.forEach((coords) => {
    gpsCircles(coords.lat, coords.lng);
  });

  groundTruthArray.forEach((coords) => {
    groundTruthCircles(coords.lat, coords.lng);
  });
}

//Walking circles
function gpsCircles(lat, lng) {
  var circle = L.circle([lat, lng], {
    color: "black",
    fillColor: "black",
    fillOpacity: 0.5,
    radius: 1,
  }).addTo(map);
}

function groundTruthCircles(lat, lng) {
  var circle = L.circle([lat, lng], {
    color: "orange",
    fillColor: "orange",
    fillOpacity: 0.5,
    radius: 1,
  }).addTo(map);
}

function oldCoordsCircles(lat, lng) {
  var circle = L.circle([lat, lng], {
    color: "black",
    fillColor: "black",
    fillOpacity: 0.2,
    radius: 5,
  }).addTo(map);

  circle.on("click", function () {
    circle.bindPopup(`Latitude: ${lat}<br>Longitude: ${lng}`).openPopup();
  });
}

function parkingRadius(lat, lng) {
  var circle = L.circle([lat, lng], {
    color: "blue",
    fillColor: "black",
    fillOpacity: 0,
    radius: 10,
  }).addTo(map);
}

function newCoordsCircle(lat, lng) {
  var circle = L.circle([lat, lng], {
    color: "orange",
    fillColor: "orange",
    fillOpacity: 0.2,
    radius: 4,
  }).addTo(map);

  circle.on("click", function () {
    circle.bindPopup(`Latitude: ${lat}<br>Longitude: ${lng}`).openPopup();
  });
}
