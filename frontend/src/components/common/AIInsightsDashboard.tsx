import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClient } from "@/integrations/api/client";
import { toast } from "sonner";
import { TrendingUp, MapPin, BarChart3 } from "lucide-react";

export const AIInsightsDashboard = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [routeOptimization, setRouteOptimization] = useState<any>(null);
  const [demandForecast, setDemandForecast] = useState<any>(null);
  const [pricePrediction, setPricePrediction] = useState<any>(null);

  const optimizeRoutes = async () => {
    setLoading("routes");
    try {
      const { data, error } = await supabase.functions.invoke("ai-route-optimizer", {
        body: {
          deliveries: [
            { address: "Bandra West, Mumbai", quantity: 20, timeWindow: "9-11 AM" },
            { address: "Andheri East, Mumbai", quantity: 15, timeWindow: "10-12 PM" },
            { address: "Powai, Mumbai", quantity: 25, timeWindow: "11 AM-1 PM" },
          ],
        },
      });

      if (error) throw error;
      setRouteOptimization(data.optimizedRoute);
      toast.success("Route optimized successfully!");
    } catch (error: any) {
      toast.error("Failed to optimize routes: " + error.message);
    } finally {
      setLoading(null);
    }
  };

  const forecastDemand = async () => {
    setLoading("demand");
    try {
      const { data, error } = await supabase.functions.invoke("ai-demand-forecast", {
        body: {
          historicalData: {
            lastWeek: { petrol: 150, diesel: 200, cng: 100 },
            lastMonth: { petrol: 600, diesel: 800, cng: 400 },
          },
          timeframe: "next 7 days",
        },
      });

      if (error) throw error;
      setDemandForecast(data.forecast);
      toast.success("Demand forecast generated!");
    } catch (error: any) {
      toast.error("Failed to forecast demand: " + error.message);
    } finally {
      setLoading(null);
    }
  };

  const predictPrices = async () => {
    setLoading("prices");
    try {
      const { data, error } = await supabase.functions.invoke("ai-price-predictor", {
        body: {
          fuelType: "Petrol",
          location: "Mumbai",
          timeframe: "next 30 days",
        },
      });

      if (error) throw error;
      setPricePrediction(data.prediction);
      toast.success("Price prediction generated!");
    } catch (error: any) {
      toast.error("Failed to predict prices: " + error.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          AI Insights Dashboard
        </CardTitle>
        <CardDescription>
          Advanced AI-powered analytics and predictions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="routes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="routes">Routes</TabsTrigger>
            <TabsTrigger value="demand">Demand</TabsTrigger>
            <TabsTrigger value="prices">Prices</TabsTrigger>
          </TabsList>

          <TabsContent value="routes" className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Smart Route Optimization</h3>
            </div>
            <Button
              onClick={optimizeRoutes}
              disabled={loading === "routes"}
              className="w-full"
            >
              {loading === "routes" ? "Optimizing..." : "Optimize Delivery Routes"}
            </Button>
            {routeOptimization && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <pre className="text-sm whitespace-pre-wrap">
                  {routeOptimization}
                </pre>
              </div>
            )}
          </TabsContent>

          <TabsContent value="demand" className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Demand Forecasting</h3>
            </div>
            <Button
              onClick={forecastDemand}
              disabled={loading === "demand"}
              className="w-full"
            >
              {loading === "demand" ? "Forecasting..." : "Generate Demand Forecast"}
            </Button>
            {demandForecast && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <pre className="text-sm whitespace-pre-wrap">
                  {demandForecast}
                </pre>
              </div>
            )}
          </TabsContent>

          <TabsContent value="prices" className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Price Predictions</h3>
            </div>
            <Button
              onClick={predictPrices}
              disabled={loading === "prices"}
              className="w-full"
            >
              {loading === "prices" ? "Predicting..." : "Predict Fuel Prices"}
            </Button>
            {pricePrediction && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <pre className="text-sm whitespace-pre-wrap">
                  {pricePrediction}
                </pre>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
