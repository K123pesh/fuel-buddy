import { useEffect, useState } from "react";
import { apiClient } from "@/integrations/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, Trash2, TrendingDown, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface PriceAlert {
  id: string;
  fuel_type: string;
  target_price: number;
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
}

export const PriceAlerts = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fuel_type: "Petrol",
    target_price: 100
  });

  // Current average prices (in real app, fetch from API)
  const currentPrices: Record<string, number> = {
    Petrol: 106.31,
    Diesel: 94.27,
    CNG: 76.59
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("price_alerts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      toast.error("Failed to load price alerts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to create alerts");
        return;
      }

      const { error } = await supabase
        .from("price_alerts")
        .insert({
          user_id: user.id,
          fuel_type: formData.fuel_type,
          target_price: formData.target_price
        });

      if (error) throw error;
      
      toast.success("Price alert created!");
      setShowForm(false);
      setFormData({ fuel_type: "Petrol", target_price: 100 });
      fetchAlerts();
    } catch (error) {
      console.error("Error creating alert:", error);
      toast.error("Failed to create alert");
    }
  };

  const toggleAlert = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("price_alerts")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (error) throw error;
      
      toast.success(isActive ? "Alert paused" : "Alert activated");
      fetchAlerts();
    } catch (error) {
      console.error("Error toggling alert:", error);
      toast.error("Failed to update alert");
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      const { error } = await supabase
        .from("price_alerts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Alert deleted");
      fetchAlerts();
    } catch (error) {
      console.error("Error deleting alert:", error);
      toast.error("Failed to delete alert");
    }
  };

  const getPriceDiff = (fuelType: string, targetPrice: number) => {
    const current = currentPrices[fuelType] || 100;
    const diff = current - targetPrice;
    return { diff, isBelow: diff <= 0 };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Price Alerts
            </CardTitle>
            <CardDescription>Get notified when fuel prices drop</CardDescription>
          </div>
          {!showForm && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Alert
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Prices */}
        <div className="p-4 bg-accent rounded-lg">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Current Prices (Mumbai)
          </h4>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(currentPrices).map(([fuel, price]) => (
              <div key={fuel} className="text-center">
                <p className="text-sm text-muted-foreground">{fuel}</p>
                <p className="text-lg font-bold">₹{price}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Create Alert Form */}
        {showForm && (
          <div className="p-4 border rounded-lg space-y-4">
            <h4 className="font-medium">Create Price Alert</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fuel Type</Label>
                <Select 
                  value={formData.fuel_type}
                  onValueChange={(value) => setFormData({ ...formData, fuel_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Petrol">Petrol</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="CNG">CNG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Price (₹/L)</Label>
                <Input
                  type="number"
                  value={formData.target_price}
                  onChange={(e) => setFormData({ ...formData, target_price: Number(e.target.value) })}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              You'll be notified when {formData.fuel_type} price drops to ₹{formData.target_price}/L or below
            </p>
            <div className="flex gap-2">
              <Button onClick={handleCreate} className="bg-gradient-primary">
                Create Alert
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Alerts List */}
        {alerts.length === 0 && !showForm ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No price alerts set</p>
            <p className="text-sm text-muted-foreground mt-2">
              Create an alert to get notified when prices drop
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const { diff, isBelow } = getPriceDiff(alert.fuel_type, alert.target_price);
              return (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    isBelow ? "border-green-500 bg-green-50 dark:bg-green-950/20" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${isBelow ? "bg-green-500/20" : "bg-muted"}`}>
                      {isBelow ? (
                        <AlertCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Bell className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{alert.fuel_type}</p>
                        <Badge variant={alert.is_active ? "default" : "secondary"}>
                          {alert.is_active ? "Active" : "Paused"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Target: ₹{alert.target_price}/L
                        {isBelow ? (
                          <span className="text-green-600 ml-2">• Price is below target!</span>
                        ) : (
                          <span className="ml-2">• ₹{diff.toFixed(2)} above target</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={alert.is_active}
                      onCheckedChange={() => toggleAlert(alert.id, alert.is_active)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAlert(alert.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
