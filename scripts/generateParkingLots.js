const { faker } = require('@faker-js/faker');

// Helper function to generate random number between min and max
const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper function to generate random fee between min and max with 2 decimal places
const getRandomFee = (min, max) => {
  return Number((Math.random() * (max - min) + min).toFixed(2));
};

const generateParkingLots = () => {
  const locations = [
    { name: "Downtown Central Parking", area: "Downtown" },
    { name: "City Mall Parking", area: "City Center" },
    { name: "Airport Express Parking", area: "Airport Zone" },
    { name: "University Campus Parking", area: "University Area" },
    { name: "Hospital Visitor Parking", area: "Healthcare District" },
    { name: "Beachfront Parking", area: "Beach Area" },
    { name: "Stadium Parking", area: "Stadium District" },
    { name: "Business District Parking", area: "Business Center" },
    { name: "Shopping Center Parking", area: "Retail District" },
    { name: "Office Complex Parking", area: "Business Park" },
    { name: "Train Station Parking", area: "Transport Hub" },
    { name: "Library Parking", area: "Cultural District" },
    { name: "Park & Ride", area: "Suburban Hub" },
    { name: "Market Square Parking", area: "Market District" },
    { name: "Sports Complex Parking", area: "Sports Zone" },
    { name: "Community Center Parking", area: "Residential Area" },
    { name: "Museum Parking", area: "Arts District" },
    { name: "Convention Center Parking", area: "Event Zone" },
    { name: "Restaurant Row Parking", area: "Dining District" },
    { name: "Entertainment District Parking", area: "Nightlife Zone" }
  ];

  return locations.map((loc, index) => {
    const totalSpaces = getRandomNumber(100, 2000);
    const availableSpaces = getRandomNumber(10, 150);
    // Generate fees between 1.50 and 5.00 with small increments
    const feePerHour = getRandomFee(1.50, 5.00);

    return {
      id: (index + 1).toString(),
      name: loc.name,
      location: `${getRandomNumber(100, 999)} ${faker.location.street()} ${loc.area}`,
      totalSpaces,
      vacantSpaces: availableSpaces,
      feePerHour,
      coordinates: {
        latitude: 40.7128 + (Math.random() * 0.01),
        longitude: -74.0060 + (Math.random() * 0.01)
      },
      amenities: faker.helpers.arrayElements([
        "24/7 Security",
        "CCTV",
        "Lighting",
        "Valet Service",
        "Covered Parking",
        "24/7 Shuttle",
        "Student Discount",
        "Beach Access",
        "Event Parking",
        "Business Hours"
      ], getRandomNumber(2, 4)),
      rating: Number((Math.random() * 2 + 3).toFixed(1)),
      isOpen: true
    };
  });
};

// Function to create parking lots in MockAPI
async function createParkingLots() {
  const BASE_URL = 'https://68333d9b464b499636fecb2e.mockapi.io/api/v1';
  const parkingLots = generateParkingLots();
  
  for (const parkingLot of parkingLots) {
    try {
      const response = await fetch(`${BASE_URL}/parking-lots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(parkingLot),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Created parking lot: ${data.name} with fee $${data.feePerHour}/hour`);
    } catch (error) {
      console.error(`Error creating parking lot ${parkingLot.name}:`, error);
    }
  }
}

// Execute the function
createParkingLots(); 