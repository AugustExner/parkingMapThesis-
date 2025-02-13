const map = L.map("map");
let parkingspots = []; // Array to store parking spots
let parkingCircles = {}; // Object to store circles with SpotID as keys

// 1. Wait for the DOM to load before running the script
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded. Running loadParkingSpots...");
  loadParkingSpots();

  // Add event listener to form submission
  const form = document.getElementById("circleForm");
  form.addEventListener("submit", handleFormSubmit);
});

// 2. Fetch parking spots and display them
async function loadParkingSpots() {
  try {
    const response = await fetch("parkingspots.json"); // Fetch JSON file
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json(); // Convert response to JS object
    
    // Iterate through each street and extract parking spots
    if (data.Street && Array.isArray(data.Street) && data.Street.length > 0) {
      data.Street.forEach((street) => {
        if (street.Parkingspots && Array.isArray(street.Parkingspots)) {
          parkingspots.push(...street.Parkingspots); // Add parking spots from all streets
        }
      });
    }
    
    console.log("Fetched parking spots:", parkingspots); // Debugging
    showParkingSpots();
  } catch (error) {
    console.error("Error fetching JSON:", error);
  }
}

// 3. Function to create circles for parking spots and store them in the object
function showParkingSpots() {
  if (parkingspots.length === 0) {
    console.warn("No parking spots found!");
    return;
  }

  parkingspots.forEach((parkingSpot) => {
    console.log(`Creating circle for SpotID: ${parkingSpot.spotID}`); // Debugging
    const circle = createParkingCircle(
      parkingSpot.latitude,
      parkingSpot.longitude,
      parkingSpot.spotID
    );
    parkingCircles[parkingSpot.spotID] = circle; // Store circle with SpotID as key
    console.log(`Created circle for SpotID: ${parkingSpot.spotID}`); // Debugging
  });

  console.log("Parking Circles:", parkingCircles); // Debugging
}

// Handle form submission
function handleFormSubmit(event) {
  event.preventDefault(); // Prevent the form from refreshing the page

  // Get the SpotID from the input field
  const spotID = document.getElementById("spotID").value;
  console.log("Selected SpotID:", spotID);

  // Call the updateCircleColor function with the SpotID
  updateCircleColor(spotID);
}

// 4. Function to update the color of a specific circle by its SpotID
function updateCircleColor(spotID) {
  spotID = parseInt(spotID);

  if (!parkingCircles[spotID]) {
    console.log(`No circle found with SpotID: ${spotID}`); // Debugging
    return;
  }

  const circle = parkingCircles[spotID]; // Get the circle using the SpotID
  const currentColor = circle.options.color; // Get the current color of the circle
  const newColor = currentColor === "red" ? "blue" : "red"; // Toggle color

  // Update the circle's color
  circle.setStyle({
    color: newColor,
    fillColor: newColor,
  });

  console.log(`Changed color of circle with SpotID: ${spotID} to ${newColor}`); // Debugging
}

// 5. Function to create a parking circle and return it
function createParkingCircle(lat, lng, spotID) {
  const circle = L.circle([lat, lng], {
    color: "red", // Initial color is red
    fillColor: "#f03",
    fillOpacity: 0.5,
    radius: 2,
  }).addTo(map);

  parkingCircles[spotID] = circle; // Store circle with SpotID
  console.log(`Circle for SpotID ${spotID} created`); // Debugging
  return circle; // Return the created circle
}

// 6. Initial map setup
map.setView([56.172872, 10.188199], 18);

// 7. Add OpenStreetMap layer to the map
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 30,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);
