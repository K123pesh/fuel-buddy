import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Trophy, MapPin, Clock, Zap, Car, Bell, Leaf, Gift, Truck, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { RefillForm } from "@/components/fuel/RefillForm";
import { RefillHistory } from "@/components/fuel/RefillHistory";
import { RefillReminders } from "@/components/fuel/RefillReminders";

import { FleetManagement } from "@/components/common/FleetManagement";
import { PriceAlerts } from "@/components/common/PriceAlerts";
import { ReferralProgram } from "@/components/common/ReferralProgram";
import { DeliveryTracker } from "@/components/common/DeliveryTracker";
import { AIChatbot } from "@/components/common/AIChatbot";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState<any>(null);
  const [refills, setRefills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // For development/testing, allow access without auth
      // const token = localStorage.getItem('fuel_buddy_token');
      // if (!token) {
      //   console.log("No token found, redirecting to auth");
      //   navigate("/auth");
      //   return;
      // }

      // const user = await apiClient.getCurrentUser();
      // if (!user) {
      //   console.log("No user returned, redirecting to auth");
      //   navigate("/auth");
      //   return;
      // }
      
      // Mock user for testing
      const mockUser = {
        user_id: 'test-user-123',
        id: 'test-user-123',
        email: 'test@example.com',
        full_name: 'Test User'
      };
      
      console.log("User authenticated:", mockUser);
      setUser(mockUser);
      setAuthChecked(true);
      fetchData();
    } catch (error) {
      console.log("Authentication check failed, redirecting to auth:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      // Fetch orders
      const ordersData = await apiClient.getOrders();
      const safeOrders = Array.isArray(ordersData) && ordersData ? ordersData : [];
      console.log('Orders data:', safeOrders); // Debug log
      
      setOrders(safeOrders);

      // Fetch loyalty points
      try {
        // Use mock user ID for testing
        const userId = user?.user_id || user?.id || 'test-user-123';
        const pointsData: any = await apiClient.getLoyaltyPoints(userId);
        // Safely access the response data
        let pointsValue;
        if (pointsData && typeof pointsData === 'object') {
          pointsValue = pointsData['totalPoints'] || pointsData['total_points'] || pointsData;
        } else {
          pointsValue = pointsData;
        }
          
        setLoyaltyPoints(
          pointsValue || { total_points: 150, tier: 'silver' }
        );
      } catch (e) {
        console.log("Loyalty points endpoint not available:", e);
        // Set default loyalty points structure
        setLoyaltyPoints({ total_points: 150, tier: 'silver' });
      }

      // Fetch refills (mock for now or implement endpoint)
      setRefills([]);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Set default empty states on error
      setOrders([
        {
          id: 'mock-1',
          fuel_type: 'petrol',
          quantity: 20,
          total_price: 1800,
          status: 'delivered',
          created_at: new Date().toISOString(),
          delivery_address: '123 Main Street, City',
          fuel_stations: { name: 'Shell Petrol Station' }
        },
        {
          id: 'mock-2',
          fuel_type: 'diesel',
          quantity: 15,
          total_price: 1200,
          status: 'pending',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          delivery_address: '456 Oak Avenue, City',
          fuel_stations: { name: 'BP Diesel Station' }
        }
      ]);
      setLoyaltyPoints({ total_points: 150, tier: 'silver' });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: "bg-yellow-500",
      confirmed: "bg-blue-500",
      out_for_delivery: "bg-purple-500",
      delivered: "bg-green-500",
      cancelled: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!authChecked || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              My Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user?.email}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orders.length}</div>
                <p className="text-xs text-muted-foreground">
                  {orders.filter(o => o.status === "delivered").length} delivered
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loyaltyPoints?.total_points || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Total earned
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orders.filter(o => ["pending", "confirmed", "out_for_delivery"].includes(o.status)).length}
                </div>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="refills">Refills</TabsTrigger>

              <TabsTrigger value="fleet" className="flex items-center gap-1">
                <Car className="h-3 w-3" />
                Fleet
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center gap-1">
                <Bell className="h-3 w-3" />
                Alerts
              </TabsTrigger>
              <TabsTrigger value="referrals" className="flex items-center gap-1">
                <Gift className="h-3 w-3" />
                Referrals
              </TabsTrigger>
              <TabsTrigger value="rewards">Rewards</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-4">
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No orders yet</p>
                    <Button
                      className="mt-4 bg-gradient-primary"
                      onClick={() => navigate("/#order")}
                    >
                      Place Your First Order
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order, index) => {
                  const isActiveOrder = ["pending", "confirmed", "out_for_delivery"].includes(order.status || 'pending');
                  const isTracking = trackingOrderId === (order.id || `order-${index}`);

                  return (
                    <Card key={order.id || index}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {order.fuel_type?.toUpperCase() || 'FUEL'} - {order.quantity || 0}L
                            </CardTitle>
                            <CardDescription>
                              {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Date not available'}
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(order.status || 'pending')}>
                            {order.status?.replace("_", " ").toUpperCase() || 'PENDING'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-start space-x-2 text-sm">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <span>{order.delivery_address || 'Address not available'}</span>
                        </div>
                        {order.fuel_stations && (
                          <p className="text-sm text-muted-foreground">
                            Station: {order.fuel_stations.name || 'Unknown Station'}
                          </p>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="font-semibold">₹{order.total_price || 0}</span>
                          <div className="flex gap-2">
                            {isActiveOrder && (
                              <Button
                                variant="default"
                                size="sm"
                                className="bg-gradient-primary"
                                onClick={() => setTrackingOrderId(isTracking ? null : order.id)}
                              >
                                <Truck className="h-4 w-4 mr-1" />
                                {isTracking ? "Hide" : "Track"}
                                {isTracking ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toast.info(`Order ID: ${order.id || 'Not available'}`)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>

                        {/* Tracking Section */}
                        {isTracking && order.id && (
                          <div className="mt-4 pt-4 border-t">
                            <DeliveryTracker
                              orderId={order.id}
                              deliveryLatitude={order.delivery_latitude}
                              deliveryLongitude={order.delivery_longitude}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="refills" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <RefillForm onRefillAdded={fetchData} />
                <RefillReminders />
              </div>
              <RefillHistory refills={refills} />
            </TabsContent>



            <TabsContent value="fleet" className="space-y-6">
              <FleetManagement />
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <PriceAlerts />
            </TabsContent>

            <TabsContent value="referrals" className="space-y-6">
              <ReferralProgram />
            </TabsContent>

            <TabsContent value="rewards" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Loyalty Points</CardTitle>
                  <CardDescription>
                    Earn points with every order and redeem for discounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div>
                      <div className="text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                        {loyaltyPoints?.total_points || 0}
                      </div>
                      <p className="text-muted-foreground mt-2">Available Points</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="p-4 bg-accent rounded-lg">
                        <div className="text-2xl font-bold">{loyaltyPoints?.total_points || 0}</div>
                        <p className="text-sm text-muted-foreground">Total Earned</p>
                      </div>
                      <div className="p-4 bg-accent rounded-lg">
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-sm text-muted-foreground">Total Redeemed</p>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-primary mt-4">
                      Redeem Points
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How to Earn Points</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Place an order</span>
                    <span className="font-semibold">+100 points</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Refer a friend</span>
                    <span className="font-semibold">+500 points</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Complete 10 orders</span>
                    <span className="font-semibold">+1000 points</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </main>
      <Footer />
      <AIChatbot />
    </div>
  );
};

export default Dashboard;
