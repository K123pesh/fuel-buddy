import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingDown, MapPin, Fuel, Navigation } from "lucide-react";
import { apiClient } from "@/integrations/api/client";
import { toast } from "sonner";

export const FuelAdvisor = () => {
  const [fuelType, setFuelType] = useState("Petrol");
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const getRecommendation = async () => {
    setLoading(true);
    try {
      // Get user location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;

      const { data, error } = await supabase.functions.invoke("ai-fuel-advisor", {
        body: {
          userLatitude: latitude,
          userLongitude: longitude,
          fuelType,
        },
      });

      if (error) throw error;

      setRecommendation(data);
      toast.success("Recommendation generated!");
    } catch (error: any) {
      console.error("Advisor error:", error);
      if (error.code === 1) {
        toast.error("Please enable location access");
      } else {
        toast.error("Failed to get recommendation");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          AI Fuel Advisor
        </CardTitle>
        <CardDescription>
          Get AI-powered recommendations for the best fuel deals nearby
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Select value={fuelType} onValueChange={setFuelType}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Petrol">Petrol</SelectItem>
              <SelectItem value="Diesel">Diesel</SelectItem>
              <SelectItem value="CNG">CNG</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={getRecommendation}
            disabled={loading}
            className="bg-gradient-primary gap-2"
          >
            <Navigation className="h-4 w-4" />
            {loading ? "Analyzing..." : "Find Best Deal"}
          </Button>
        </div>

        {recommendation && (
          <div className="space-y-4 animate-in fade-in-50 duration-500">
            <div className="p-4 bg-accent rounded-lg border-l-4 border-primary">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                AI Recommendation
              </h4>
              <p className="text-sm text-muted-foreground">{recommendation.recommendation}</p>
            </div>

            {recommendation.cheapest && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="h-4 w-4 text-green-600" />
                    <h4 className="font-semibold text-green-900 dark:text-green-100">
                      Cheapest
                    </h4>
                  </div>
                  <p className="font-bold text-lg text-green-700 dark:text-green-400">
                    {recommendation.cheapest.name}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Fuel className="h-3 w-3" />
                    <span>₹{recommendation.cheapest.price_per_liter}/L</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{recommendation.cheapest.distance.toFixed(2)} km away</span>
                  </div>
                </div>

                {recommendation.nearest && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                    <div className="flex items-center gap-2 mb-2">
                      <Navigation className="h-4 w-4 text-blue-600" />
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">Nearest</h4>
                    </div>
                    <p className="font-bold text-lg text-blue-700 dark:text-blue-400">
                      {recommendation.nearest.name}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Fuel className="h-3 w-3" />
                      <span>₹{recommendation.nearest.price_per_liter}/L</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{recommendation.nearest.distance.toFixed(2)} km away</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {recommendation.stations && recommendation.stations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Top 5 Nearby Stations</h4>
                <div className="space-y-2">
                  {recommendation.stations.map((station: any, index: number) => (
                    <div
                      key={station.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{index + 1}</Badge>
                          <p className="font-medium">{station.name}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{station.address}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">₹{station.price_per_liter}/L</p>
                        <p className="text-xs text-muted-foreground">
                          {station.distance.toFixed(2)} km
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
