const map = L.map("map").setView([56.17254, 10.189626], 18);
let parkingSpots = [];
let parkingCircles = {}; // Store circles by SpotID
let walkingCoordsArray = [];
let googleCoordsArray = [];

let testArray1 = [];
let testArray2 = [];

let registeredCarArray = [];

document.addEventListener("DOMContentLoaded", init);

function init() {
  console.log("DOM fully loaded. Running fetchParkingSpots...");
  fetchParkingSpots();
  setupTileLayer();
  drawWalkingCircles();
}

// Fetch parking data from API
async function fetchParkingSpots() {
  try {
    const response = await fetch("http://localhost:8000/getParkingSpots");
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();

    // Extract all parking spots from nested structure
    parkingSpots = extractParkingSpots(data.parkingSpots);

    registeredCarArray = data.registeredCarsData;
    console.log("number of registeredCars", registeredCarArray.length);

    registeredCarArray.forEach((registedCar) => {
      drawRegisteredCars(
        registedCar.oldLat,
        registedCar.oldLng,
        registedCar.newLat,
        registedCar.newLng
      );
    });

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
function createParkingCircle(lat, lng, spotID, occupied) {
  const color = occupied ? "red" : "blue";

  return L.circle([lat, lng], {
    color,
    fillColor: color === "red" ? "#f03" : "#3388ff",
    fillOpacity: 0.5,
    radius: 2,
  }).addTo(map);
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
    color: "black",
    fillColor: "black",
    fillOpacity: 0.5,
    radius: 1,
  }).addTo(map);
}

function drawWalkingCircles() {
  walkingCoordsArray.forEach((coord) => {
    walkingCircles(coord.lat, coord.lng);
  });
  googleCoordsArray.forEach((coords) => {
    googleCircles(coords.lat, coords.lng);
  });

  testArray1.forEach((coords) => {
    testCircles1(coords.lat, coords.lng);
  });
  testArray2.forEach((coords) => {
    testCircles2(coords.lat, coords.lng);
  });
}

//Walking circles
function googleCircles(lat, lng) {
  var circle = L.circle([lat, lng], {
    color: "orange",
    fillColor: "orange",
    fillOpacity: 0.5,
    radius: 1,
  }).addTo(map);
}

function testCircles1(lat, lng) {
  var circle = L.circle([lat, lng], {
    color: "orange",
    fillColor: "orange",
    fillOpacity: 0.5,
    radius: 1,
  }).addTo(map);
}

function testCircles2(lat, lng) {
  var circle = L.circle([lat, lng], {
    color: "purple",
    fillColor: "purple",
    fillOpacity: 0.5,
    radius: 1,
  }).addTo(map);
}
