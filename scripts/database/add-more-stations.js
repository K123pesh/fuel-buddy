// Additional EV stations data
const additionalStations = [
  {
    name: "Jio-BP Pulse - Chennai",
    address: "888 Anna Salai, Chennai, Tamil Nadu 600002",
    phone: "+91-44-2589-7414",
    email: "chennai@jiobppulse.com",
    coordinates: {
      latitude: 13.0827,
      longitude: 80.2707
    },
    chargingPorts: [
      { type: "CCS", count: 6, powerRating: 60, speed: "Fast" },
      { type: "Type 2", count: 4, powerRating: 22, speed: "Fast" },
      { type: "CHAdeMO", count: 2, powerRating: 50, speed: "Fast" }
    ],
    pricingModel: "per_kwh",
    prices: {
      perKwh: 7.8
    },
    currency: "INR",
    accessType: "Public",
    chargingNetwork: "Jio-BP Pulse",
    amenities: ["WiFi", "RESTROOMS", "CAFE", "SECURITY"],
    operatingHours: {
      is24Hours: true
    },
    availability: {
      totalPorts: 12,
      availablePorts: 7,
      lastUpdated: new Date().toISOString()
    },
    rating: 4.4,
    reviews: [
      {
        user: "Karthik R.",
        rating: 4,
        comment: "Good location, reliable service",
        createdAt: new Date().toISOString()
      }
    ],
    isActive: true
  },
  {
    name: "Ather Grid - Kolkata",
    address: "333 Park Street, Kolkata, West Bengal 700016",
    phone: "+91-33-3698-1472",
    email: "kolkata@atherenergy.com",
    coordinates: {
      latitude: 22.5726,
      longitude: 88.3639
    },
    chargingPorts: [
      { type: "Type 2", count: 8, powerRating: 22, speed: "Fast" },
      { type: "CCS", count: 4, powerRating: 50, speed: "Fast" }
    ],
    pricingModel: "per_kwh",
    prices: {
      perKwh: 8.2
    },
    currency: "INR",
    accessType: "Public",
    chargingNetwork: "Ather Energy",
    amenities: ["WiFi", "RESTROOMS", "SHOP"],
    operatingHours: {
      open: "07:00",
      close: "23:00",
      is24Hours: false
    },
    availability: {
      totalPorts: 12,
      availablePorts: 11,
      lastUpdated: new Date().toISOString()
    },
    rating: 4.6,
    reviews: [
      {
        user: "Ananya S.",
        rating: 5,
        comment: "Excellent service, clean facility",
        createdAt: new Date().toISOString()
      }
    ],
    isActive: true
  },
  {
    name: "Magenta ChargeGrid - Ahmedabad",
    address: "777 SG Highway, Ahmedabad, Gujarat 380054",
    phone: "+91-79-4852-9631",
    email: "ahmedabad@magenta-chargegrid.com",
    coordinates: {
      latitude: 23.0225,
      longitude: 72.5714
    },
    chargingPorts: [
      { type: "Type 2", count: 6, powerRating: 22, speed: "Fast" },
      { type: "CCS", count: 6, powerRating: 60, speed: "Fast" },
      { type: "CHAdeMO", count: 2, powerRating: 50, speed: "Fast" }
    ],
    pricingModel: "per_minute",
    prices: {
      perMinute: 2.2
    },
    currency: "INR",
    accessType: "Public",
    chargingNetwork: "Magenta ChargeGrid",
    amenities: ["WiFi", "RESTROOMS", "PARKING", "SECURITY"],
    operatingHours: {
      is24Hours: true
    },
    availability: {
      totalPorts: 14,
      availablePorts: 9,
      lastUpdated: new Date().toISOString()
    },
    rating: 4.3,
    reviews: [
      {
        user: "Rajesh P.",
        rating: 4,
        comment: "Good charging speed, convenient location",
        createdAt: new Date().toISOString()
      }
    ],
    isActive: true
  },
  {
    name: "Statiq Power - Jaipur",
    address: "111 MI Road, Jaipur, Rajasthan 302001",
    phone: "+91-141-2587-4196",
    email: "jaipur@statiqpower.com",
    coordinates: {
      latitude: 26.9124,
      longitude: 75.7873
    },
    chargingPorts: [
      { type: "Type 2", count: 4, powerRating: 22, speed: "Fast" },
      { type: "CCS", count: 4, powerRating: 50, speed: "Fast" }
    ],
    pricingModel: "per_session",
    prices: {
      perSession: 120
    },
    currency: "INR",
    accessType: "Public",
    chargingNetwork: "Statiq Power",
    amenities: ["WiFi", "RESTROOMS"],
    operatingHours: {
      open: "08:00",
      close: "22:00",
      is24Hours: false
    },
    availability: {
      totalPorts: 8,
      availablePorts: 6,
      lastUpdated: new Date().toISOString()
    },
    rating: 4.1,
    reviews: [
      {
        user: "Meera K.",
        rating: 4,
        comment: "Affordable charging, decent location",
        createdAt: new Date().toISOString()
      }
    ],
    isActive: true
  },
  {
    name: "Charge+Zone - Lucknow",
    address: "555 Gomti Nagar, Lucknow, Uttar Pradesh 226010",
    phone: "+91-522-3698-7412",
    email: "lucknow@chargepluszone.com",
    coordinates: {
      latitude: 26.8467,
      longitude: 80.9462
    },
    chargingPorts: [
      { type: "Type 1", count: 2, powerRating: 7.4, speed: "Slow" },
      { type: "Type 2", count: 6, powerRating: 22, speed: "Fast" },
      { type: "CCS", count: 4, powerRating: 50, speed: "Fast" }
    ],
    pricingModel: "per_kwh",
    prices: {
      perKwh: 7.5
    },
    currency: "INR",
    accessType: "Public",
    chargingNetwork: "Charge+Zone",
    amenities: ["WiFi", "PARKING"],
    operatingHours: {
      open: "09:00",
      close: "21:00",
      is24Hours: false
    },
    availability: {
      totalPorts: 12,
      availablePorts: 8,
      lastUpdated: new Date().toISOString()
    },
    rating: 4.0,
    reviews: [
      {
        user: "Vikram S.",
        rating: 4,
        comment: "Good for regular charging, reasonable price",
        createdAt: new Date().toISOString()
      }
    ],
    isActive: true
  },
  {
    name: "PlugNGo Premium - Surat",
    address: "222 Dumas Road, Surat, Gujarat 395007",
    phone: "+91-261-2587-9631",
    email: "surat@plugngo.com",
    coordinates: {
      latitude: 21.1702,
      longitude: 72.8311
    },
    chargingPorts: [
      { type: "Type 2", count: 8, powerRating: 22, speed: "Fast" },
      { type: "CCS", count: 6, powerRating: 60, speed: "Fast" },
      { type: "CHAdeMO", count: 2, powerRating: 50, speed: "Fast" }
    ],
    pricingModel: "per_kwh",
    prices: {
      perKwh: 8.0
    },
    currency: "INR",
    accessType: "Public",
    chargingNetwork: "PlugNGo",
    amenities: ["WiFi", "RESTROOMS", "CAFE", "PARKING"],
    operatingHours: {
      is24Hours: true
    },
    availability: {
      totalPorts: 16,
      availablePorts: 14,
      lastUpdated: new Date().toISOString()
    },
    rating: 4.7,
    reviews: [
      {
        user: "Neha M.",
        rating: 5,
        comment: "Excellent facility, fast charging, great amenities",
        createdAt: new Date().toISOString()
      }
    ],
    isActive: true
  },
  {
    name: "EVRE Fast Charge - Nagpur",
    address: "444 Wardha Road, Nagpur, Maharashtra 440015",
    phone: "+91-712-3698-1472",
    email: "nagpur@evrecharge.com",
    coordinates: {
      latitude: 21.1458,
      longitude: 79.0882
    },
    chargingPorts: [
      { type: "Type 2", count: 4, powerRating: 22, speed: "Fast" },
      { type: "CCS", count: 4, powerRating: 50, speed: "Fast" }
    ],
    pricingModel: "per_kwh",
    prices: {
      perKwh: 7.2
    },
    currency: "INR",
    accessType: "Public",
    chargingNetwork: "EVRE",
    amenities: ["WiFi", "RESTROOMS"],
    operatingHours: {
      open: "08:00",
      close: "22:00",
      is24Hours: false
    },
    availability: {
      totalPorts: 8,
      availablePorts: 7,
      lastUpdated: new Date().toISOString()
    },
    rating: 4.2,
    reviews: [
      {
        user: "Suresh R.",
        rating: 4,
        comment: "Good location, reliable service",
        createdAt: new Date().toISOString()
      }
    ],
    isActive: true
  },
  {
    name: "Tata Power EZ Charge - Kochi",
    address: "999 MG Road, Kochi, Kerala 682016",
    phone: "+91-484-2587-4196",
    email: "kochi@tatapower.com",
    coordinates: {
      latitude: 9.9312,
      longitude: 76.2673
    },
    chargingPorts: [
      { type: "Type 2", count: 6, powerRating: 22, speed: "Fast" },
      { type: "CCS", count: 4, powerRating: 50, speed: "Fast" },
      { type: "CHAdeMO", count: 2, powerRating: 50, speed: "Fast" }
    ],
    pricingModel: "per_kwh",
    prices: {
      perKwh: 8.5
    },
    currency: "INR",
    accessType: "Public",
    chargingNetwork: "Tata Power",
    amenities: ["WiFi", "RESTROOMS", "CAFE", "SECURITY"],
    operatingHours: {
      open: "06:00",
      close: "23:00",
      is24Hours: false
    },
    availability: {
      totalPorts: 12,
      availablePorts: 10,
      lastUpdated: new Date().toISOString()
    },
    rating: 4.5,
    reviews: [
      {
        user: "Anjali N.",
        rating: 5,
        comment: "Great service, clean facility, good location",
        createdAt: new Date().toISOString()
      }
    ],
    isActive: true
  }
];

// Function to create stations via API
async function createAdditionalStations() {
  const apiUrl = 'http://localhost:5003/api/ev-stations';
  
  for (const station of additionalStations) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(station)
      });
      
      if (response.ok) {
        const createdStation = await response.json();
        console.log(`✅ Created station: ${createdStation.name}`);
      } else {
        const error = await response.json();
        console.error(`❌ Failed to create ${station.name}:`, error);
      }
    } catch (error) {
      console.error(`❌ Error creating ${station.name}:`, error);
    }
  }
}

console.log('🚀 Creating additional EV stations...');
createAdditionalStations().then(() => {
  console.log('✅ Additional stations creation completed!');
}).catch(console.error);
