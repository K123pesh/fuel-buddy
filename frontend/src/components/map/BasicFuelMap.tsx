import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fuelPriceService, StationWithRealTimePrices } from "@/services/fuelPriceService";
import { Loader2 } from "lucide-react";

type FuelType = "Petrol" | "Diesel" | "CNG";

interface FuelPrices {
  Petrol?: number;
  Diesel?: number;
  CNG?: number;
}

interface Station {
  name: string;
  coordinates: [number, number];
  fuelTypes: FuelType[];
  prices: FuelPrices;
}

// Fallback stations for when API is unavailable
const fallbackStations: Station[] = [
  { name: "Andheri Fuel Station", coordinates: [19.1136, 72.8697], fuelTypes: ["Petrol", "Diesel"], prices: { Petrol: 104.21, Diesel: 92.15 } },
  { name: "Bandra Fuel Station", coordinates: [19.0596, 72.8295], fuelTypes: ["Petrol", "Diesel", "CNG"], prices: { Petrol: 103.95, Diesel: 91.87, CNG: 76.50 } },
  { name: "Dadar Fuel Station", coordinates: [19.0176, 72.8479], fuelTypes: ["Petrol", "Diesel"], prices: { Petrol: 104.10, Diesel: 92.05 } },
  { name: "Worli Fuel Station", coordinates: [19.0134, 72.8184], fuelTypes: ["Petrol", "CNG"], prices: { Petrol: 104.35, CNG: 76.20 } },
  { name: "Powai Fuel Station", coordinates: [19.1176, 72.9060], fuelTypes: ["Petrol", "Diesel", "CNG"], prices: { Petrol: 103.80, Diesel: 91.75, CNG: 76.35 } },
];

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const BasicFuelMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [fuelFilter, setFuelFilter] = useState<FuelType | "All">("All");
  const [stations, setStations] = useState<Station[]>(fallbackStations);
  const [loading, setLoading] = useState(true);
  const [locationInfo, setLocationInfo] = useState<{ state: string; district: string } | null>(null);

  useEffect(() => {
    const initializeLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const location = [position.coords.latitude, position.coords.longitude] as [number, number];
            setUserLocation(location);
            toast.success("Location found - fetching real-time fuel prices");
            
            // Get location info for real-time prices
            const locationData = await fuelPriceService.getLocationFromCoordinates(
              position.coords.latitude,
              position.coords.longitude
            );
            
            if (locationData && locationData.state && locationData.district) {
              setLocationInfo(locationData);
              await fetchRealTimeStations(locationData.state, locationData.district, location[0], location[1]);
            } else {
              // Default to Mumbai if geocoding fails
              await fetchRealTimeStations("Maharashtra", "Mumbai", location[0], location[1]);
            }
            setLoading(false);
          },
          async () => {
            toast.info("Using default location (Mumbai)");
            setUserLocation([19.0760, 72.8777]);
            await fetchRealTimeStations("Maharashtra", "Mumbai", 19.0760, 72.8777);
            setLoading(false);
          }
        );
      } else {
        toast.info("Geolocation not supported, using default location");
        setUserLocation([19.0760, 72.8777]);
        await fetchRealTimeStations("Maharashtra", "Mumbai", 19.0760, 72.8777);
        setLoading(false);
      }
    };

    initializeLocation();
  }, []);

  const fetchRealTimeStations = async (
    state: string, 
    district: string, 
    lat: number, 
    lng: number
  ) => {
    try {
      const realTimeStations = await fuelPriceService.getStationsWithRealTimePrices(
        state,
        district,
        lat,
        lng
      );
      
      if (realTimeStations.length > 0) {
        // Transform the data to match our Station interface
        const transformedStations: Station[] = realTimeStations.map(station => ({
          name: station.name,
          coordinates: [station.coordinates.latitude, station.coordinates.longitude],
          fuelTypes: station.fuelTypes as FuelType[],
          prices: {
            Petrol: station.realTimePrices?.regular || station.prices.regular,
            Diesel: station.realTimePrices?.diesel || station.prices.diesel,
            CNG: 76.50 // Default CNG price as it's not in the API
          }
        }));
        
        setStations(transformedStations);
        toast.success(`Loaded real-time fuel prices for ${district}, ${state}`);
      } else {
        setStations(fallbackStations);
      }
    } catch (error) {
      console.error('Error fetching real-time stations:', error);
      setStations(fallbackStations);
      toast.error("Using fallback fuel prices");
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const center: [number, number] = userLocation || [19.0760, 72.8777];
    
    mapInstance.current = L.map(mapRef.current, {
      center,
      zoom: userLocation ? 13 : 11,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapInstance.current);

    if (userLocation) {
      L.circleMarker(userLocation, {
        radius: 12,
        color: "#3b82f6",
        fillColor: "#3b82f6",
        fillOpacity: 0.3,
        weight: 3,
      }).addTo(mapInstance.current).bindPopup("<b>Your Location</b>");
    }

    return () => {
      mapInstance.current?.remove();
    };
  }, [userLocation]);

  useEffect(() => {
    if (!mapInstance.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Filter stations
    const filteredStations = fuelFilter === "All" 
      ? stations 
      : stations.filter(s => s.fuelTypes.includes(fuelFilter));

    // Sort by distance
    const sortedStations = userLocation
      ? [...filteredStations].sort((a, b) => 
          calculateDistance(userLocation[0], userLocation[1], a.coordinates[0], a.coordinates[1]) -
          calculateDistance(userLocation[0], userLocation[1], b.coordinates[0], b.coordinates[1])
        )
      : filteredStations;

    const color = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
    const strokeColor = color ? `hsl(${color})` : "#2b6cb0";

    sortedStations.forEach((s, index) => {
      const distance = userLocation
        ? calculateDistance(userLocation[0], userLocation[1], s.coordinates[0], s.coordinates[1]).toFixed(1)
        : null;

      const priceDisplay = s.fuelTypes.map(ft => 
        `<span style="display:inline-block;margin-right:8px;"><strong>${ft}:</strong> ₹${s.prices[ft]?.toFixed(2)}</span>`
      ).join("");

      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${s.coordinates[0]},${s.coordinates[1]}`;

      const marker = L.circleMarker(s.coordinates, {
        radius: index === 0 && userLocation ? 14 : 10,
        color: index === 0 && userLocation ? "#22c55e" : strokeColor,
        fillColor: index === 0 && userLocation ? "#22c55e" : strokeColor,
        fillOpacity: 0.9,
        weight: 2,
      })
        .addTo(mapInstance.current!)
        .bindPopup(
          `<div style="padding:6px;min-width:180px;">
            <h3 style="margin:0 0 6px;font-weight:600;">${s.name}</h3>
            <div style="margin:0 0 6px;font-size:12px;background:#f3f4f6;padding:6px;border-radius:4px;">${priceDisplay}</div>
            ${distance ? `<p style="margin:0 0 4px;font-size:12px;color:#22c55e;font-weight:500;">📍 ${distance} km away</p>` : ""}
            ${index === 0 && userLocation ? `<p style="margin:0 0 4px;font-size:11px;color:#22c55e;">⭐ Nearest Station</p>` : ""}
            <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-top:8px;padding:6px 12px;background:#3b82f6;color:white;text-decoration:none;border-radius:6px;font-size:12px;font-weight:500;">🧭 Get Directions</a>
          </div>`
        );
      
      markersRef.current.push(marker);
    });
  }, [userLocation, fuelFilter]);

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-strong">
      <div ref={mapRef} className="absolute inset-0" />
      
      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Fetching real-time fuel prices...</p>
          </div>
        </div>
      )}
      
      <div className="absolute top-4 right-4 z-[1000]">
        <Select value={fuelFilter} onValueChange={(v) => setFuelFilter(v as FuelType | "All")}>
          <SelectTrigger className="w-[140px] bg-background/95 backdrop-blur-sm shadow-md">
            <SelectValue placeholder="Fuel Type" />
          </SelectTrigger>
          <SelectContent className="bg-background z-[1001]">
            <SelectItem value="All">All Fuels</SelectItem>
            <SelectItem value="Petrol">Petrol</SelectItem>
            <SelectItem value="Diesel">Diesel</SelectItem>
            <SelectItem value="CNG">CNG</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {userLocation && (
        <div className="absolute top-4 left-4 z-[1000] space-y-2">
          <div className="bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm shadow-md">
            <span className="text-green-500 font-medium">● </span>
            Nearest station highlighted
          </div>
          {locationInfo && (
            <div className="bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs shadow-md">
              <div className="font-medium">Real-time Prices:</div>
              <div>{locationInfo.district}, {locationInfo.state}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BasicFuelMap;
