const map = L.map("map").setView([56.17254, 10.189626], 18 );
let parkingSpots = [];
let parkingCircles = {}; // Store circles by SpotID

document.addEventListener("DOMContentLoaded", init);

function init() {
  console.log("DOM fully loaded. Running fetchParkingSpots...");
  fetchParkingSpots();
  setupTileLayer();
}

//Fetch parkingdata from API
async function fetchParkingSpots() {
  try {
    const response = await fetch("http://localhost:3000/getParkingspots");
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    parkingSpots = Object.values(data).flat(); // Flatten all street arrays

    console.log("Fetched parking spots:", parkingSpots);
    displayParkingSpots();
  } catch (error) {
    console.error("Error fetching parking spots:", error);
  }
}

//Function that creates a circle for each parkingspot
function displayParkingSpots() {
  if (parkingSpots.length === 0) return console.warn("No parking spots found!");

  parkingSpots.forEach(({ latitude, longitude, spotID, occupied }) => {
    parkingCircles[spotID] = createParkingCircle(
      latitude,
      longitude,
      spotID,
      occupied
    );
  });
  //console.log("Parking Circles:", parkingCircles);
}

//Function that takes a parkingspot as parameter and creates a circle for it.
function createParkingCircle(lat, lng, spotID, occupied) {
  const color = occupied ? "red" : "blue";
  return L.circle([lat, lng], {
    color,
    fillColor: color === "red" ? "#f03" : "#3388ff",
    fillOpacity: 0.5,
    radius: 2,
  }).addTo(map);
}

function setupTileLayer() {
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 30,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
}

var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);
