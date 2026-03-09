import { useState } from "react";
import { apiClient } from "@/integrations/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Fuel } from "lucide-react";

interface RefillFormProps {
  onRefillAdded: () => void;
}

export const RefillForm = ({ onRefillAdded }: RefillFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fuel_type: "Petrol",
    quantity_liters: "",
    cost: "",
    odometer_reading: "",
    location: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to add a refill");
        return;
      }

      const { error } = await supabase.from("fuel_refills").insert({
        user_id: user.id,
        fuel_type: formData.fuel_type,
        quantity_liters: parseFloat(formData.quantity_liters),
        cost: parseFloat(formData.cost),
        odometer_reading: parseInt(formData.odometer_reading),
        location: formData.location || null,
        notes: formData.notes || null,
      });

      if (error) throw error;

      toast.success("Refill logged successfully!");
      setFormData({
        fuel_type: "Petrol",
        quantity_liters: "",
        cost: "",
        odometer_reading: "",
        location: "",
        notes: "",
      });
      onRefillAdded();
    } catch (error: any) {
      console.error("Error adding refill:", error);
      toast.error(error.message || "Failed to log refill");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fuel className="h-5 w-5" />
          Log New Refill
        </CardTitle>
        <CardDescription>
          Track your fuel refills to monitor efficiency and costs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fuel_type">Fuel Type</Label>
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
                  <SelectItem value="Electric">Electric</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (Liters)</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                placeholder="50.00"
                value={formData.quantity_liters}
                onChange={(e) => setFormData({ ...formData, quantity_liters: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Cost (₹)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                placeholder="5000.00"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="odometer">Odometer Reading (km)</Label>
              <Input
                id="odometer"
                type="number"
                placeholder="12500"
                value={formData.odometer_reading}
                onChange={(e) => setFormData({ ...formData, odometer_reading: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              placeholder="Shell Petrol Pump, MG Road"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional details..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-primary"
            disabled={loading}
          >
            {loading ? "Logging..." : "Log Refill"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
