import { useState } from "react";
import { apiClient } from "@/integrations/api/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { formatIndianRupees } from "@/utils/currency";
import { Search, Plus, Edit, Trash2, MapPin, Phone, Mail, Star, Clock } from "lucide-react";

interface AdminFuelStationsProps {
  stations: any[];
  onRefresh: () => void;
}

const AdminFuelStations = ({ stations, onRefresh }: AdminFuelStationsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    coordinates: { latitude: "", longitude: "" },
    fuelTypes: [] as string[],
    prices: { regular: "", premium: "", diesel: "" },
    operatingHours: { open: "", close: "" },
    services: [] as string[],
    rating: 0
  });

  // Filter stations based on search
  const filteredStations = stations.filter((station) => {
    const matchesSearch = 
      station.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      phone: "",
      email: "",
      coordinates: { latitude: "", longitude: "" },
      fuelTypes: [],
      prices: { regular: "", premium: "", diesel: "" },
      operatingHours: { open: "", close: "" },
      services: [],
      rating: 0
    });
  };

  const handleCreateStation = async () => {
    setLoading(true);
    
    try {
      await apiClient.post('/admin/fuel-stations', {
        ...formData,
        coordinates: {
          latitude: parseFloat(formData.coordinates.latitude),
          longitude: parseFloat(formData.coordinates.longitude)
        },
        prices: {
          regular: parseFloat(formData.prices.regular),
          premium: parseFloat(formData.prices.premium),
          diesel: parseFloat(formData.prices.diesel)
        }
      });
      
      toast.success("Fuel station created successfully");
      setIsCreateDialogOpen(false);
      resetForm();
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to create fuel station");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStation = async () => {
    setLoading(true);
    
    try {
      await apiClient.put(`/admin/fuel-stations/${editingStation._id}`, {
        ...formData,
        coordinates: {
          latitude: parseFloat(formData.coordinates.latitude),
          longitude: parseFloat(formData.coordinates.longitude)
        },
        prices: {
          regular: parseFloat(formData.prices.regular),
          premium: parseFloat(formData.prices.premium),
          diesel: parseFloat(formData.prices.diesel)
        }
      });
      
      toast.success("Fuel station updated successfully");
      setIsEditDialogOpen(false);
      setEditingStation(null);
      resetForm();
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update fuel station");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStation = async (stationId: string) => {
    if (!confirm("Are you sure you want to delete this fuel station?")) return;
    
    try {
      await apiClient.delete(`/admin/fuel-stations/${stationId}`);
      toast.success("Fuel station deleted successfully");
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete fuel station");
    }
  };

  const handleToggleActive = async (stationId: string) => {
    try {
      await apiClient.patch(`/admin/fuel-stations/${stationId}/toggle-active`);
      toast.success("Station status updated successfully");
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update station status");
    }
  };

  const openEditDialog = (station: any) => {
    setEditingStation(station);
    setFormData({
      name: station.name || "",
      address: station.address || "",
      phone: station.phone || "",
      email: station.email || "",
      coordinates: { 
        latitude: station.coordinates?.latitude?.toString() || "", 
        longitude: station.coordinates?.longitude?.toString() || "" 
      },
      fuelTypes: station.fuelTypes || [],
      prices: { 
        regular: station.prices?.regular?.toString() || "", 
        premium: station.prices?.premium?.toString() || "", 
        diesel: station.prices?.diesel?.toString() || "" 
      },
      operatingHours: { 
        open: station.operatingHours?.open || "", 
        close: station.operatingHours?.close || "" 
      },
      services: station.services || [],
      rating: station.rating || 0
    });
    setIsEditDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Fuel Stations ({filteredStations.length})</CardTitle>
            <CardDescription>Manage fuel station locations and pricing</CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Station
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Fuel Station</DialogTitle>
                <DialogDescription>
                  Add a new fuel station to the network
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Station Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter station name"
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter full address"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email address"
                  />
                </div>
                
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.coordinates.latitude}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      coordinates: { ...formData.coordinates, latitude: e.target.value }
                    })}
                    placeholder="19.0760"
                  />
                </div>
                
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.coordinates.longitude}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      coordinates: { ...formData.coordinates, longitude: e.target.value }
                    })}
                    placeholder="72.8777"
                  />
                </div>
                
                <div>
                  <Label htmlFor="regular-price">Regular Price (₹)</Label>
                  <Input
                    id="regular-price"
                    type="number"
                    step="0.01"
                    value={formData.prices.regular}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      prices: { ...formData.prices, regular: e.target.value }
                    })}
                    placeholder="95.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="premium-price">Premium Price (₹)</Label>
                  <Input
                    id="premium-price"
                    type="number"
                    step="0.01"
                    value={formData.prices.premium}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      prices: { ...formData.prices, premium: e.target.value }
                    })}
                    placeholder="105.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="diesel-price">Diesel Price (₹)</Label>
                  <Input
                    id="diesel-price"
                    type="number"
                    step="0.01"
                    value={formData.prices.diesel}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      prices: { ...formData.prices, diesel: e.target.value }
                    })}
                    placeholder="85.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                    placeholder="4.5"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateStation} disabled={loading}>
                  {loading ? "Creating..." : "Create Station"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by station name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Station</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Prices</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStations.map((station) => (
                <TableRow key={station._id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{station.name}</span>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {station.address}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      {station.phone && (
                        <div className="flex items-center text-xs">
                          <Phone className="h-3 w-3 mr-1" />
                          {station.phone}
                        </div>
                      )}
                      {station.email && (
                        <div className="flex items-center text-xs">
                          <Mail className="h-3 w-3 mr-1" />
                          {station.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div>Regular: {formatIndianRupees(station.prices?.regular || 0)}</div>
                      <div>Premium: {formatIndianRupees(station.prices?.premium || 0)}</div>
                      <div>Diesel: {formatIndianRupees(station.prices?.diesel || 0)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm">{station.rating || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {station.operatingHours?.open || "N/A"} - {station.operatingHours?.close || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={station.isActive}
                        onCheckedChange={() => handleToggleActive(station._id)}
                      />
                      <Badge variant={station.isActive ? "default" : "secondary"}>
                        {station.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(station)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteStation(station._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredStations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No fuel stations found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Fuel Station</DialogTitle>
            <DialogDescription>
              Update fuel station information
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="edit-name">Station Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter station name"
              />
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="edit-address">Address</Label>
              <Textarea
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter full address"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email address"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-latitude">Latitude</Label>
              <Input
                id="edit-latitude"
                type="number"
                step="any"
                value={formData.coordinates.latitude}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  coordinates: { ...formData.coordinates, latitude: e.target.value }
                })}
                placeholder="19.0760"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-longitude">Longitude</Label>
              <Input
                id="edit-longitude"
                type="number"
                step="any"
                value={formData.coordinates.longitude}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  coordinates: { ...formData.coordinates, longitude: e.target.value }
                })}
                placeholder="72.8777"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-regular-price">Regular Price (₹)</Label>
              <Input
                id="edit-regular-price"
                type="number"
                step="0.01"
                value={formData.prices.regular}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  prices: { ...formData.prices, regular: e.target.value }
                })}
                placeholder="95.00"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-premium-price">Premium Price (₹)</Label>
              <Input
                id="edit-premium-price"
                type="number"
                step="0.01"
                value={formData.prices.premium}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  prices: { ...formData.prices, premium: e.target.value }
                })}
                placeholder="105.00"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-diesel-price">Diesel Price (₹)</Label>
              <Input
                id="edit-diesel-price"
                type="number"
                step="0.01"
                value={formData.prices.diesel}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  prices: { ...formData.prices, diesel: e.target.value }
                })}
                placeholder="85.00"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-rating">Rating</Label>
              <Input
                id="edit-rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                placeholder="4.5"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStation} disabled={loading}>
              {loading ? "Updating..." : "Update Station"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminFuelStations;
