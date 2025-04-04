const map = L.map("map").setView([56.17254, 10.189626], 18);
let parkingSpots = [];
let parkingCircles = {}; // Store circles by SpotID
let walkingCoordsArray = [
  //START SLUT Helsingforsgade
  // { lat: 56.171378, lng: 10.190248 },
  // { lat: 56.171788, lng: 10.187843 },
  // //BIL 1 Helsingforsgade
  // { lat: 56.171511, lng: 10.189496 },
  // { lat: 56.171627, lng: 10.189445 },
  // //BIL 2 Helsingforsgade
  // { lat: 56.171709, lng: 10.188522 },
  // { lat: 56.171856, lng: 10.188469 },
  // //START SLUT Findlandsgade
  // { lat: 56.17321, lng: 10.191221 },
  // { lat: 56.171499, lng: 10.190689 },
  // //BIL 1 Findlandsgade
  // { lat: 56.172735, lng: 10.19085 },
  // { lat: 56.172635, lng: 10.191075 },
  // //BIL 2 Findlandsgade
  // { lat: 56.172504, lng: 10.190785 },
  // { lat: 56.172472, lng: 10.190895 },
  //DEBUG - START/SLUT FINDLANDSGADE
  // { lat: 56.171588723, lng: 10.190328373 },
  // { lat: 56.171579336, lng: 10.190250421 },
  // //DEBUG Bil 1 FINDLANDSGADE
  // { lat: 56.171588723, lng: 10.190328373 },
  // { lat: 56.171579336, lng: 10.190250421 },
  // //DEBUG Bil 2 FINDLANDSGADE
  // { lat: 56.17158147, lng: 10.19017004 },
  // { lat: 56.171587902, lng: 10.19009455 },
  // //DEBUG Bil 3 FINDLANDSGADE
  // { lat: 56.171587902, lng: 10.19009455 },
  // { lat: 56.171603129, lng: 10.190022461 },
  // //DEBUG Bil 4 FINDLANDSGADE
  // { lat: 56.171676896, lng: 10.189646581 },
  // { lat: 56.171692074, lng: 10.189546889 },
];

let googleCoordsArray = [
  // //START SLUT Helsingforsgade
  // { lat: 56.17138958576229, lng: 10.190254347702766 },
  // { lat: 56.171798258539255, lng: 10.187848628997688 },
  // //BIL 1 Helsingforsgade
  // { lat: 56.171517728447064, lng: 10.189499686305172 },
  // { lat: 56.17153552375556, lng: 10.189394883149424 },
  // //BIL 2 Helsingforsgade
  // { lat: 56.17168590036385, lng: 10.1885093245117 },
  // { lat: 56.171706691353414, lng: 10.188387069898583 },
  // //START SLUT Findlandsgade
  // { lat: 56.17320966989646, lng: 10.191223428358908 },
  // { lat: 56.17152680907173, lng: 10.19048736251823 },
  // //BIL 1 Findlandsgade
  // { lat: 56.17271394314883, lng: 10.191008037104071 },
  // { lat: 56.172647720395545, lng: 10.190979559854659 },
  // //BIL 2 Findlandsgade
  // { lat: 56.17248726614212, lng: 10.190910553809806 },
  // { lat: 56.17247086696555, lng: 10.19090350110208 },
];

let magnusArray1 = [
  //OLD
 {lat:56.171382133, lng: 10.190347083}, 
  
];
let magnusArray2 = [
 {lat:56.17138325, lng: 10.190245717},
];

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

  magnusArray1.forEach((coords) => {
    magnusCircles1(coords.lat, coords.lng);
  });
  magnusArray2.forEach((coords) => {
    magnusCircles2(coords.lat, coords.lng);
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

function magnusCircles1(lat, lng) {
  var circle = L.circle([lat, lng], {
    color: "orange",
    fillColor: "orange",
    fillOpacity: 0.5,
    radius: 1,
  }).addTo(map);
}

function magnusCircles2(lat, lng) {
  var circle = L.circle([lat, lng], {
    color: "purple",
    fillColor: "purple",
    fillOpacity: 0.5,
    radius: 1,
  }).addTo(map);
}
