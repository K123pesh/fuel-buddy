import { useEffect, useState, useRef } from "react";
import { apiClient } from "@/integrations/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Phone, Clock, CheckCircle2, Navigation } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface DeliveryInfo {
  id: string;
  order_id: string;
  driver_name: string | null;
  driver_phone: string | null;
  vehicle_number: string | null;
  status: string | null;
  current_latitude: number | null;
  current_longitude: number | null;
  estimated_arrival: string | null;
}

interface DeliveryTrackerProps {
  orderId: string;
  deliveryLatitude?: number | null;
  deliveryLongitude?: number | null;
}

export const DeliveryTracker = ({ orderId, deliveryLatitude, deliveryLongitude }: DeliveryTrackerProps) => {
  const [delivery, setDelivery] = useState<DeliveryInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    fetchDelivery();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel(`delivery-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'delivery_tracking',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          if (payload.new) {
            setDelivery(payload.new as DeliveryInfo);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  // Initialize map when delivery data is available
  useEffect(() => {
    if (!mapRef.current || !delivery?.current_latitude || !delivery?.current_longitude) return;

    // Clean up existing map
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const driverLocation: [number, number] = [delivery.current_latitude, delivery.current_longitude];
    
    mapInstance.current = L.map(mapRef.current, {
      center: driverLocation,
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapInstance.current);

    // Create custom driver icon
    const driverIcon = L.divIcon({
      className: 'driver-marker',
      html: `
        <div style="
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
          border: 3px solid white;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <rect x="1" y="3" width="15" height="13" rx="2" ry="2"/>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
            <circle cx="5.5" cy="18.5" r="2.5"/>
            <circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    // Add driver marker
    driverMarkerRef.current = L.marker(driverLocation, { icon: driverIcon })
      .addTo(mapInstance.current)
      .bindPopup(`
        <div style="padding: 8px; min-width: 150px;">
          <h4 style="margin: 0 0 4px; font-weight: 600;">🚚 Driver Location</h4>
          ${delivery.driver_name ? `<p style="margin: 0; font-size: 13px;">${delivery.driver_name}</p>` : ''}
          ${delivery.vehicle_number ? `<p style="margin: 0; font-size: 12px; color: #666;">${delivery.vehicle_number}</p>` : ''}
        </div>
      `);

    // Add delivery destination marker if available
    if (deliveryLatitude && deliveryLongitude) {
      const destIcon = L.divIcon({
        className: 'destination-marker',
        html: `
          <div style="
            background: linear-gradient(135deg, #22c55e, #16a34a);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.5);
            border: 3px solid white;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      L.marker([deliveryLatitude, deliveryLongitude], { icon: destIcon })
        .addTo(mapInstance.current)
        .bindPopup('<div style="padding: 8px;"><h4 style="margin: 0; font-weight: 600;">📍 Delivery Location</h4></div>');

      // Fit bounds to show both markers
      const bounds = L.latLngBounds([driverLocation, [deliveryLatitude, deliveryLongitude]]);
      mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [delivery?.current_latitude, delivery?.current_longitude, deliveryLatitude, deliveryLongitude]);

  // Update driver marker position on real-time updates
  useEffect(() => {
    if (driverMarkerRef.current && delivery?.current_latitude && delivery?.current_longitude && mapInstance.current) {
      const newPos: [number, number] = [delivery.current_latitude, delivery.current_longitude];
      driverMarkerRef.current.setLatLng(newPos);
      
      // Optionally pan to new location
      if (!deliveryLatitude || !deliveryLongitude) {
        mapInstance.current.panTo(newPos);
      }
    }
  }, [delivery?.current_latitude, delivery?.current_longitude]);

  const fetchDelivery = async () => {
    try {
      const { data, error } = await supabase
        .from("delivery_tracking")
        .select("*")
        .eq("order_id", orderId)
        .maybeSingle();

      if (!error && data) {
        setDelivery(data);
      }
    } catch (error) {
      console.error("Error fetching delivery:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string | null) => {
    const steps = ["assigned", "picked_up", "in_transit", "nearby", "delivered"];
    return steps.indexOf(status || "assigned");
  };

  const statusLabels: Record<string, string> = {
    assigned: "Driver Assigned",
    picked_up: "Fuel Picked Up",
    in_transit: "On the Way",
    nearby: "Nearby",
    delivered: "Delivered"
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!delivery) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No tracking information available yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Tracking will appear once your order is confirmed
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentStep = getStatusStep(delivery.status);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Live Tracking
            </CardTitle>
            <CardDescription>Real-time delivery updates</CardDescription>
          </div>
          <Badge className="bg-gradient-primary">
            {statusLabels[delivery.status || "assigned"]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Live Map */}
        {delivery.current_latitude && delivery.current_longitude && (
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Navigation className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Live Driver Location</span>
              <Badge variant="outline" className="ml-auto text-xs">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                Live
              </Badge>
            </div>
            <div 
              ref={mapRef} 
              className="w-full h-[250px] rounded-lg overflow-hidden shadow-md border"
            />
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-blue-500 rounded-full border border-white shadow"></div>
                <span>Driver</span>
              </div>
              {deliveryLatitude && deliveryLongitude && (
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-green-500 rounded-full border border-white shadow"></div>
                  <span>Destination</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted"></div>
          {Object.entries(statusLabels).map(([status, label], index) => (
            <div key={status} className="relative flex items-center gap-4 pb-6 last:pb-0">
              <div
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  index <= currentStep
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted bg-background"
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${index <= currentStep ? "text-foreground" : "text-muted-foreground"}`}>
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Driver Info */}
        {delivery.driver_name && (
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-semibold">Driver Details</h4>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span>{delivery.driver_name}</span>
                {delivery.vehicle_number && (
                  <Badge variant="outline">{delivery.vehicle_number}</Badge>
                )}
              </div>
              {delivery.driver_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${delivery.driver_phone}`} className="text-primary hover:underline">
                    {delivery.driver_phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ETA */}
        {delivery.estimated_arrival && (
          <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Estimated Arrival</p>
              <p className="text-lg font-bold">
                {new Date(delivery.estimated_arrival).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        )}

        {/* Fallback coordinates display if no map */}
        {!delivery.current_latitude && !delivery.current_longitude && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Driver location will appear here once available</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
