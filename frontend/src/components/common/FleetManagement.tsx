import { useEffect, useState } from "react";
import { apiClient } from "@/integrations/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Car, Plus, Trash2, Edit2, Fuel, Gauge } from "lucide-react";
import { toast } from "sonner";

interface FleetVehicle {
  id: string;
  vehicle_name: string;
  vehicle_number: string;
  vehicle_type: string;
  fuel_type: string;
  tank_capacity_liters: number;
  average_efficiency: number;
  is_active: boolean;
}

export const FleetManagement = () => {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<FleetVehicle | null>(null);
  const [formData, setFormData] = useState({
    vehicle_name: "",
    vehicle_number: "",
    vehicle_type: "car",
    fuel_type: "Petrol",
    tank_capacity_liters: 50,
    average_efficiency: 15
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("fleet_vehicles")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to manage your fleet");
        return;
      }

      if (editingVehicle) {
        const { error } = await supabase
          .from("fleet_vehicles")
          .update(formData)
          .eq("id", editingVehicle.id);

        if (error) throw error;
        toast.success("Vehicle updated successfully");
      } else {
        const { error } = await supabase
          .from("fleet_vehicles")
          .insert({ ...formData, user_id: user.id });

        if (error) throw error;
        toast.success("Vehicle added successfully");
      }

      setIsDialogOpen(false);
      setEditingVehicle(null);
      resetForm();
      fetchVehicles();
    } catch (error) {
      console.error("Error saving vehicle:", error);
      toast.error("Failed to save vehicle");
    }
  };

  const handleEdit = (vehicle: FleetVehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicle_name: vehicle.vehicle_name,
      vehicle_number: vehicle.vehicle_number,
      vehicle_type: vehicle.vehicle_type,
      fuel_type: vehicle.fuel_type,
      tank_capacity_liters: vehicle.tank_capacity_liters,
      average_efficiency: vehicle.average_efficiency
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("fleet_vehicles")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Vehicle deleted");
      fetchVehicles();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error("Failed to delete vehicle");
    }
  };

  const resetForm = () => {
    setFormData({
      vehicle_name: "",
      vehicle_number: "",
      vehicle_type: "car",
      fuel_type: "Petrol",
      tank_capacity_liters: 50,
      average_efficiency: 15
    });
  };

  const getVehicleIcon = (type: string) => {
    return <Car className="h-5 w-5" />;
  };

  const getTotalStats = () => {
    const totalCapacity = vehicles.reduce((sum, v) => sum + v.tank_capacity_liters, 0);
    const avgEfficiency = vehicles.length > 0 
      ? vehicles.reduce((sum, v) => sum + v.average_efficiency, 0) / vehicles.length 
      : 0;
    return { totalCapacity, avgEfficiency };
  };

  const stats = getTotalStats();

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
              <Car className="h-5 w-5" />
              Fleet Management
            </CardTitle>
            <CardDescription>Manage your vehicles for bulk orders</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingVehicle(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
                <DialogDescription>
                  {editingVehicle ? "Update vehicle details" : "Add a vehicle to your fleet"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vehicle Name</Label>
                    <Input
                      placeholder="e.g., Delivery Van 1"
                      value={formData.vehicle_name}
                      onChange={(e) => setFormData({ ...formData, vehicle_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vehicle Number</Label>
                    <Input
                      placeholder="e.g., MH01AB1234"
                      value={formData.vehicle_number}
                      onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vehicle Type</Label>
                    <Select 
                      value={formData.vehicle_type} 
                      onValueChange={(value) => setFormData({ ...formData, vehicle_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="bike">Bike</SelectItem>
                        <SelectItem value="truck">Truck</SelectItem>
                        <SelectItem value="van">Van</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tank Capacity (L)</Label>
                    <Input
                      type="number"
                      value={formData.tank_capacity_liters}
                      onChange={(e) => setFormData({ ...formData, tank_capacity_liters: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Avg. Efficiency (km/L)</Label>
                    <Input
                      type="number"
                      value={formData.average_efficiency}
                      onChange={(e) => setFormData({ ...formData, average_efficiency: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <Button onClick={handleSubmit} className="w-full bg-gradient-primary">
                  {editingVehicle ? "Update Vehicle" : "Add Vehicle"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fleet Stats */}
        {vehicles.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-accent rounded-lg text-center">
              <div className="text-2xl font-bold">{vehicles.length}</div>
              <p className="text-sm text-muted-foreground">Total Vehicles</p>
            </div>
            <div className="p-4 bg-accent rounded-lg text-center">
              <div className="text-2xl font-bold">{stats.totalCapacity}L</div>
              <p className="text-sm text-muted-foreground">Total Capacity</p>
            </div>
            <div className="p-4 bg-accent rounded-lg text-center">
              <div className="text-2xl font-bold">{stats.avgEfficiency.toFixed(1)}</div>
              <p className="text-sm text-muted-foreground">Avg km/L</p>
            </div>
          </div>
        )}

        {/* Vehicle List */}
        {vehicles.length === 0 ? (
          <div className="text-center py-8">
            <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No vehicles in your fleet yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Add vehicles to manage bulk fuel orders
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getVehicleIcon(vehicle.vehicle_type)}
                  </div>
                  <div>
                    <p className="font-medium">{vehicle.vehicle_name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{vehicle.vehicle_number}</Badge>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Fuel className="h-3 w-3" />
                        {vehicle.fuel_type}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Gauge className="h-3 w-3" />
                        {vehicle.average_efficiency} km/L
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(vehicle)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(vehicle.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
