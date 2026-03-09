import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Package, 
  Wallet, 
  Star, 
  Clock, 
  Bell, 
  CreditCard, 
  Settings, 
  HelpCircle, 
  Heart, 
  LogOut,
  Edit,
  Save,
  X,
  MapPin,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Truck,
  FileText,
  MessageCircle,
  Download,
  Shield,
  Trash2,
  Lock
} from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: string;
  fuel_type: string;
  quantity: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'out_for_delivery' | 'delivered' | 'cancelled';
  created_at: string;
  delivery_address: string;
  fuel_stations?: { name: string };
}

interface Activity {
  id: string;
  type: 'login' | 'purchase' | 'payment' | 'service_request';
  description: string;
  timestamp: string;
  status?: 'success' | 'pending' | 'failed';
}

interface Notification {
  id: string;
  type: 'order' | 'payment' | 'offer' | 'delivery';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface FavoriteItem {
  id: string;
  type: 'address' | 'location' | 'product';
  name: string;
  description?: string;
  data?: any;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser, loading: authLoading, logout } = useAuth();
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [walletBalance, setWalletBalance] = useState(1250.50);
  const [loyaltyPoints, setLoyaltyPoints] = useState(850);
  const [membershipPlan, setMembershipPlan] = useState('Basic');

  useEffect(() => {
    if (!authLoading) {
      if (!authUser) {
        navigate("/auth");
        return;
      }
      fetchProfile();
    }
  }, [authUser, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!authUser) return;

    try {
      // Use the user data from AuthContext directly
      setProfile({
        full_name: authUser.full_name || "",
        phone: authUser.phone || "",
        address: authUser.address || "",
      });

      // Fetch orders
      const ordersData = await apiClient.getOrders() as Order[];
      setOrders(ordersData || []);

      // Mock recent activities
      setActivities([
        {
          id: '1',
          type: 'login',
          description: 'Logged in from Chrome on Windows',
          timestamp: new Date().toISOString(),
          status: 'success'
        },
        {
          id: '2',
          type: 'purchase',
          description: 'Ordered 10L of Petrol',
          timestamp: new Date().toISOString(),
          status: 'success'
        }
      ]);

      // Mock notifications
      setNotifications([
        {
          id: '1',
          type: 'order',
          title: 'Order Confirmed',
          message: 'Your fuel order has been confirmed and will be delivered soon.',
          timestamp: new Date().toISOString(),
          read: false
        },
        {
          id: '2',
          type: 'offer',
          title: 'Special Offer!',
          message: 'Get 20% off on your next fuel order. Use code: FUEL20',
          timestamp: new Date().toISOString(),
          read: true
        }
      ]);

      // Mock favorites
      setFavorites([
        {
          id: '1',
          type: 'address',
          name: 'Home',
          description: '123 Main Street, Bangalore, Karnataka 560001'
        },
        {
          id: '2',
          type: 'location',
          name: 'Office',
          description: '456 Tech Park, Bangalore, Karnataka 560103'
        },
        {
          id: '3',
          type: 'product',
          name: 'Premium Petrol',
          description: 'High-octane fuel for better performance'
        }
      ]);

      // Fetch loyalty points
      try {
        const pointsData: any = await apiClient.getLoyaltyPoints(authUser?.user_id);
        // Safely access the response data
        let pointsValue;
        if (pointsData && typeof pointsData === 'object') {
          // Handle different possible response structures
          if (pointsData.totalPoints !== undefined) {
            pointsValue = pointsData.totalPoints;
          } else if (pointsData.total_points !== undefined) {
            pointsValue = pointsData.total_points;
          } else if (Object.keys(pointsData).length === 2 && pointsData.hasOwnProperty('totalPoints') && pointsData.hasOwnProperty('tier')) {
            // If the response is an object with totalPoints and tier, extract totalPoints
            pointsValue = pointsData.totalPoints;
          } else {
            // If it's an object but doesn't match expected structures, try to find the points value
            pointsValue = Object.values(pointsData)[0]; // Take the first value as fallback
          }
        } else {
          pointsValue = pointsData;
        }
        
        // Ensure pointsValue is a number
        const numericPoints = typeof pointsValue === 'number' ? pointsValue : parseInt(pointsValue) || 0;
        setLoyaltyPoints(numericPoints);
      } catch (e) {
        console.error("Error fetching loyalty points:", e);
        setLoyaltyPoints(850);
      }

    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!authUser) return;

    setSaving(true);
    try {
      // Update user profile via API
      await apiClient.updateProfile({
        full_name: profile.full_name,
        phone: profile.phone,
        address: profile.address,
      });

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const getStatusColor = (status: string | undefined) => {
    const colors: any = {
      pending: "bg-yellow-500",
      confirmed: "bg-blue-500",
      out_for_delivery: "bg-purple-500",
      delivered: "bg-green-500",
      cancelled: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getActivityIcon = (type: string) => {
    const icons: any = {
      login: <User className="h-4 w-4" />,
      purchase: <Package className="h-4 w-4" />,
      payment: <CreditCard className="h-4 w-4" />,
      service_request: <HelpCircle className="h-4 w-4" />
    };
    return icons[type] || <Clock className="h-4 w-4" />;
  };

  const getSafeActivityType = (type: any) => {
    return typeof type === 'string' ? type : '';
  };

  const getNotificationIcon = (type: string) => {
    const icons: any = {
      order: <Package className="h-4 w-4" />,
      payment: <CreditCard className="h-4 w-4" />,
      offer: <Star className="h-4 w-4" />,
      delivery: <Truck className="h-4 w-4" />
    };
    return icons[type] || <Bell className="h-4 w-4" />;
  };

  const getSafeNotificationType = (type: any) => {
    return typeof type === 'string' ? type : '';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your account and preferences
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Profile Information */}
            <TabsContent value="profile" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Card */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Profile Information
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingProfile(!editingProfile)}
                      >
                        {editingProfile ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                      </Button>
                    </div>
                    <CardDescription>
                      Your personal details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="text-lg">
                          {authUser?.full_name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold">{authUser?.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{authUser?.role}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={authUser?.email || ""}
                          disabled
                          className="bg-muted"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          value={profile.full_name}
                          onChange={(e) =>
                            setProfile({ ...profile, full_name: e.target.value })
                          }
                          disabled={!editingProfile}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={profile.phone}
                          onChange={(e) =>
                            setProfile({ ...profile, phone: e.target.value })
                          }
                          disabled={!editingProfile}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          value={profile.address}
                          onChange={(e) =>
                            setProfile({ ...profile, address: e.target.value })
                          }
                          disabled={!editingProfile}
                        />
                      </div>

                      {editingProfile && (
                        <div className="flex gap-2">
                          <Button onClick={handleSave} disabled={saving}>
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? "Saving..." : "Save Changes"}
                          </Button>
                          <Button variant="outline" onClick={() => setEditingProfile(false)}>
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Account Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Account Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{orders.length}</div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">₹{walletBalance.toFixed(2)}</div>
                      <p className="text-sm text-muted-foreground">Wallet Balance</p>
                    </div>
                    <div className="text-center">
                      <Badge variant="secondary">{membershipPlan}</Badge>
                      <p className="text-sm text-muted-foreground mt-1">Membership</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{loyaltyPoints}</div>
                      <p className="text-sm text-muted-foreground">Reward Points</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Your recent actions and account activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-muted">
                            {getActivityIcon(getSafeActivityType(activity.type))}
                          </div>
                          <div>
                            <p className="font-medium">{typeof activity.description === 'string' ? activity.description : ''}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(typeof activity.timestamp === 'string' ? activity.timestamp : '').toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {activity.status && typeof activity.status === 'string' && (
                          <Badge
                            variant={activity.status === 'success' ? 'default' : 
                                   activity.status === 'pending' ? 'secondary' : 'destructive'}
                          >
                            {activity.status}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Favorites */}
            <TabsContent value="favorites" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Favorites & Saved Items
                  </CardTitle>
                  <CardDescription>
                    Your saved addresses and frequently used items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {favorites.map((favorite) => (
                      <div key={favorite.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-muted">
                            {typeof favorite.type === 'string' && favorite.type === 'address' ? <MapPin className="h-4 w-4" /> : 
                             typeof favorite.type === 'string' && favorite.type === 'location' ? <MapPin className="h-4 w-4" /> : 
                             <Heart className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium">{typeof favorite.name === 'string' ? favorite.name : ''}</p>
                            <p className="text-sm text-muted-foreground">{typeof favorite.description === 'string' ? favorite.description : ''}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      <Heart className="h-4 w-4 mr-2" />
                      Add New Favorite
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* My Orders */}
            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    My Orders & Bookings
                  </CardTitle>
                  <CardDescription>
                    Track your fuel orders and deliveries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No orders yet</p>
                      <Button
                        className="mt-4 bg-gradient-primary"
                        onClick={() => navigate("/#order")}
                      >
                        Place Your First Order
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold">
                                {(order.fuel_type?.toString() || 'Unknown Fuel').toUpperCase()} - {(typeof order.quantity === 'number' ? order.quantity : parseFloat(order.quantity)) || 0}L
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at || '').toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className={getStatusColor(typeof order.status === 'string' ? order.status : undefined)}>
                              {(typeof order.status === 'string' ? order.status : 'unknown').replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4" />
                              <span>{order.delivery_address?.toString() || 'Address not specified'}</span>
                            </div>
                            {order.fuel_stations && typeof order.fuel_stations === 'object' && order.fuel_stations.name && (
                              <p className="text-sm text-muted-foreground">
                                Station: {order.fuel_stations.name?.toString()}
                              </p>
                            )}
                            <div className="flex items-center justify-between pt-2 border-t">
                              <span className="font-semibold">₹{(typeof order.total_price === 'number' ? order.total_price : parseFloat(order.total_price)) || 0}</span>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <FileText className="h-4 w-4 mr-1" />
                                  Invoice
                                </Button>
                                {order.status && typeof order.status === 'string' && ['pending', 'confirmed', 'out_for_delivery'].includes(order.status) && (
                                  <Button variant="outline" size="sm">
                                    <Truck className="h-4 w-4 mr-1" />
                                    Track
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wallet & Payments */}
            <TabsContent value="wallet" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Wallet Balance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      Wallet Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">₹{walletBalance.toFixed(2)}</div>
                      <p className="text-sm text-muted-foreground">Available Balance</p>
                    </div>
                    <Button className="w-full">
                      Add Money
                    </Button>
                  </CardContent>
                </Card>

                {/* Payment Methods */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Methods
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-4 w-4" />
                        <div>
                          <p className="font-medium">VISA •••• 4242</p>
                          <Badge variant="secondary" className="text-xs">Default</Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button variant="outline" className="w-full">
                      Add Payment Method
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Payment History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Payment History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">Fuel Order - {order.fuel_type?.toString() || 'Unknown Fuel'}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at || '').toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{(typeof order.total_price === 'number' ? order.total_price : parseFloat(order.total_price)) || 0}</p>
                          <Badge variant={typeof order.status === 'string' && order.status === 'delivered' ? 'default' : 'secondary'}>
                            {typeof order.status === 'string' ? order.status : 'unknown'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </CardTitle>
                  <CardDescription>
                    Stay updated with your orders and account activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`flex items-start gap-3 p-3 rounded-lg border ${
                          !notification.read ? 'bg-muted/50' : ''
                        }`}
                      >
                        <div className="p-2 rounded-full bg-muted">
                          {getNotificationIcon(getSafeNotificationType(notification.type))}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{typeof notification.title === 'string' ? notification.title : ''}</h4>
                            {typeof notification.read === 'boolean' && !notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {typeof notification.message === 'string' ? notification.message : ''}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(typeof notification.timestamp === 'string' ? notification.timestamp : '').toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Account Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Account Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      Change Email
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Phone className="h-4 w-4 mr-2" />
                      Change Phone Number
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </CardContent>
                </Card>

                {/* Support */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5" />
                      Support & Help Center
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-1">
                      <Button variant="outline" className="h-16 flex-col">
                        <MessageCircle className="h-6 w-6 mb-2" />
                        Chat Support
                      </Button>
                      <Button variant="outline" className="h-16 flex-col">
                        <AlertCircle className="h-6 w-6 mb-2" />
                        Raise Complaint
                      </Button>
                      <Button variant="outline" className="h-16 flex-col">
                        <FileText className="h-6 w-6 mb-2" />
                        FAQ
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Privacy & Security */}
              <Card>
                <CardHeader>
                  <CardTitle>Privacy & Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Privacy Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Download My Data
                  </Button>
                  <Button variant="destructive" className="w-full justify-start">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
