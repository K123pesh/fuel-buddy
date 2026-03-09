import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Fuel } from "lucide-react";
import { apiClient } from "@/integrations/api/client";
import { toast } from "sonner";

export const StationFinder = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [stations, setStations] = useState<any[]>([]);
  const [selectedFuelType, setSelectedFuelType] = useState("Petrol");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.longitude, position.coords.latitude]);
        },
        () => {
          // Default to Mumbai if location access denied
          setUserLocation([72.8777, 19.0760]);
          toast.info("Using default location (Mumbai)");
        }
      );
    } else {
      setUserLocation([72.8777, 19.0760]);
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !userLocation) return;

    const initMap = async () => {
      try {
        const { data: tokenData } = await supabase.functions.invoke("get-mapbox-token");
        const mapboxToken = tokenData?.token;

        if (!mapboxToken) {
          toast.error("Map service unavailable");
          setLoading(false);
          return;
        }

        mapboxgl.accessToken = mapboxToken;

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: userLocation,
          zoom: 12,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

        // Add user location marker
        new mapboxgl.Marker({ color: "#3b82f6" })
          .setLngLat(userLocation)
          .setPopup(new mapboxgl.Popup().setHTML("<strong>Your Location</strong>"))
          .addTo(map.current);

        fetchStations();
      } catch (error) {
        console.error("Map initialization error:", error);
        toast.error("Failed to load map");
      } finally {
        setLoading(false);
      }
    };

    initMap();

    return () => {
      map.current?.remove();
    };
  }, [userLocation]);

  useEffect(() => {
    if (map.current && stations.length > 0) {
      updateMarkers();
    }
  }, [stations, selectedFuelType]);

  const fetchStations = async () => {
    try {
      const { data, error } = await supabase
        .from("fuel_stations")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      setStations(data || []);
    } catch (error) {
      console.error("Error fetching stations:", error);
      toast.error("Failed to load fuel stations");
    }
  };

  const updateMarkers = () => {
    if (!map.current) return;

    // Remove existing markers (except user marker)
    const markers = document.querySelectorAll(".mapboxgl-marker:not(:first-child)");
    markers.forEach((marker) => marker.remove());

    // Add station markers
    const filteredStations = stations.filter((station) =>
      station.fuel_types.includes(selectedFuelType)
    );

    filteredStations.forEach((station) => {
      const el = document.createElement("div");
      el.className = "station-marker";
      el.innerHTML = "⛽";
      el.style.fontSize = "24px";
      el.style.cursor = "pointer";

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px;">
          <h3 style="font-weight: bold; margin-bottom: 4px;">${station.name}</h3>
          <p style="font-size: 12px; color: #666; margin-bottom: 4px;">${station.address}</p>
          <p style="font-size: 14px; font-weight: bold; color: #16a34a;">₹${station.price_per_liter}/L</p>
          <p style="font-size: 12px; color: #666;">Types: ${station.fuel_types.join(", ")}</p>
        </div>
      `);

      new mapboxgl.Marker(el)
        .setLngLat([station.longitude, station.latitude])
        .setPopup(popup)
        .addTo(map.current!);
    });
  };

  const goToUserLocation = () => {
    if (map.current && userLocation) {
      map.current.flyTo({ center: userLocation, zoom: 14 });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Station Finder
            </CardTitle>
            <CardDescription>Find nearby fuel stations with live pricing</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedFuelType} onValueChange={setSelectedFuelType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Petrol">Petrol</SelectItem>
                <SelectItem value="Diesel">Diesel</SelectItem>
                <SelectItem value="CNG">CNG</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={goToUserLocation}>
              <Navigation className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div
            ref={mapContainer}
            className="w-full h-[400px] rounded-lg border"
            style={{ display: loading ? "none" : "block" }}
          />
          {loading && (
            <div className="w-full h-[400px] rounded-lg border flex items-center justify-center bg-muted">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="gap-1">
              <Fuel className="h-3 w-3" />
              {stations.filter((s) => s.fuel_types.includes(selectedFuelType)).length} stations
            </Badge>
            <span>•</span>
            <span>Click markers for details</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
