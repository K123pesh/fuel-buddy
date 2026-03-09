import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, ShoppingCart, Fuel, TrendingUp, Settings, LogOut, Package, MapPin, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import axios from 'axios';
import { formatIndianRupees, getCurrencySymbol } from "@/utils/currency";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminFuelStations from "@/components/admin/AdminFuelStations";
import AdminSupportTickets from "@/components/admin/AdminSupportTickets";

import AdminAnalytics from "@/components/admin/AdminAnalytics";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006/api';

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalStations: number;
  totalLoyaltyMembers: number;
  totalRevenue: number;
  orderStatusBreakdown: Array<{ _id: string; count: number }>;
  lastUpdated: string;
}

interface AdminUser {
  admin_id: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  const refreshOrders = async () => {
    try {
      const token = localStorage.getItem('fuel_buddy_admin_token');
      if (!token) return;
      
      // Use getAdminOrders which directly uses admin token without modifying apiClient
      const response: any = await apiClient.getAdminOrders();
      console.log('Admin orders response:', response);
      // Handle different response formats
      setOrders(Array.isArray(response) ? response : (response?.orders || []));
    } catch (error: any) {
      console.error('Failed to refresh orders:', error);
      toast.error('Failed to refresh orders');
    }
  };

  const refreshStations = async () => {
    try {
      const token = localStorage.getItem('fuel_buddy_admin_token');
      if (!token) return;
      
      // Use getAdminFuelStations which directly uses admin token without modifying apiClient
      const response: any = await apiClient.getAdminFuelStations();
      // Handle different response formats
      setStations(Array.isArray(response) ? response : (response?.stations || []));
    } catch (error: any) {
      console.error('Failed to refresh stations:', error);
      toast.error('Failed to refresh stations');
    }
  };

  useEffect(() => {
    const checkAdminAuth = async () => {
      const token = localStorage.getItem('fuel_buddy_admin_token');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      try {
        // Validate admin token with backend
        const response = await axios.get(`${API_BASE_URL}/admin/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        // If successful, set admin data
        setAdmin({
          admin_id: '1',
          username: 'admin',
          email: 'admin@fuelbuddy.com',
          role: 'super_admin',
          permissions: ['manage_users', 'manage_orders', 'manage_fuel_stations', 'manage_loyalty', 'view_analytics', 'system_settings']
        });
      } catch (error: any) {
        console.error('Admin auth failed:', error);
        localStorage.removeItem('fuel_buddy_admin_token');
        navigate('/admin/login');
      }
    };

    checkAdminAuth();
  }, [navigate]);

  // Live update: Poll for new orders every 30 seconds
  useEffect(() => {
    if (!admin) return;

    // Initial fetch
    fetchDashboardData();

    // Set up polling for live updates (every 30 seconds)
    const pollInterval = setInterval(() => {
      console.log('🔄 Polling for updates...');
      fetchDashboardData();
    }, 30000);

    // Cleanup on unmount
    return () => clearInterval(pollInterval);
  }, [admin]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('fuel_buddy_admin_token');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      // Fetch real data from backend - admin methods use admin token directly
      const [dashboardResponse, usersResponse, ordersResponse, stationsResponse] = await Promise.all([
        apiClient.getAdminDashboard() as Promise<any>,
        apiClient.getAdminUsers() as Promise<any>,
        apiClient.getAdminOrders() as Promise<any>,
        apiClient.getAdminFuelStations() as Promise<any>
      ]);

      // Handle different response formats
      setStats(dashboardResponse?.dashboard || dashboardResponse || null);
      setUsers(Array.isArray(usersResponse) ? usersResponse : (usersResponse?.users || []));
      setOrders(Array.isArray(ordersResponse) ? ordersResponse : (ordersResponse?.orders || []));
      setStations(Array.isArray(stationsResponse) ? stationsResponse : (stationsResponse?.stations || []));

      // Debug: Log all data
      console.log('Raw dashboard response:', dashboardResponse);
      console.log('Raw users response:', usersResponse);
      console.log('Raw orders response:', ordersResponse);
      console.log('Users received:', Array.isArray(usersResponse) ? usersResponse : (usersResponse?.users || []));
      console.log('Users state after set:', Array.isArray(usersResponse) ? usersResponse : (usersResponse?.users || []));
      console.log('Orders received:', Array.isArray(ordersResponse) ? ordersResponse : (ordersResponse?.orders || []));
      console.log('First order details:', (Array.isArray(ordersResponse) ? ordersResponse : (ordersResponse?.orders || []))?.[0]);

      // Set active tab to 'dashboard' to show the dashboard by default
      setActiveTab('dashboard');

    } catch (error: any) {
      console.error('Failed to fetch admin data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('fuel_buddy_admin_token');
        navigate('/admin/login');
      }
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log('🔪 Starting logout process...');

    try {
      // Step 1: Clear local storage
      console.log('Step 1: Clearing localStorage...');
      const token = localStorage.getItem('fuel_buddy_admin_token');
      console.log('Current token found:', !!token);

      localStorage.removeItem('fuel_buddy_admin_token');
      console.log('✅ Token removed from localStorage');

      // Step 2: Clear admin state
      console.log('Step 2: Clearing admin state...');
      setAdmin(null);
      console.log('✅ Admin state cleared');

      // Step 3: Show success message
      console.log('Step 3: Showing success message...');
      toast.success("Logged out successfully");
      console.log('✅ Success toast shown');

      // Step 4: Navigate to login
      console.log('Step 4: Navigating to login...');
      navigate('/admin/login');
      console.log('✅ Navigation to login initiated');

      console.log('🎉 Logout process completed successfully!');

    } catch (error) {
      console.error('❌ Logout error occurred:', error);

      // Emergency fallback - force logout even if something fails
      try {
        localStorage.removeItem('fuel_buddy_admin_token');
        setAdmin(null);
        navigate('/admin/login');
        toast.success("Logged out successfully");
        console.log('🚨 Emergency fallback executed');
      } catch (fallbackError) {
        console.error('❌ Even fallback failed:', fallbackError);
        // Last resort - force navigation
        window.location.href = '/admin/login';
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading admin dashboard...</div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Access denied. Please login.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">Fuel Buddy Admin</h1>
            <Badge variant="secondary">{admin.role}</Badge>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="stations">Fuel Stations</TabsTrigger>
            <TabsTrigger value="support">Support Tickets</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Registered customers</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <Package className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Completed transactions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fuel Stations</CardTitle>
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalStations || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Active locations</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatIndianRupees(stats?.totalRevenue || 0)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Gross earnings</p>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Visualization */}
            <Card>
              <CardHeader>
                <CardTitle>Business Analytics</CardTitle>
                <CardDescription>Performance metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminAnalytics orders={orders} />
              </CardContent>
            </Card>

            {/* Order Status Breakdown */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Order Status Breakdown</CardTitle>
                  <CardDescription>Distribution of order statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.orderStatusBreakdown?.map((status) => (
                      <div key={status._id} className="flex items-center justify-between">
                        <span className="capitalize font-medium">{status._id.replace('_', ' ')}</span>
                        <Badge variant={status._id === 'delivered' ? 'default' : 'secondary'}>
                          {status.count} orders
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Manage your business operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => setActiveTab('users')}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Manage Users
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => setActiveTab('orders')}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      View Orders
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => setActiveTab('stations')}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Manage Stations
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => setActiveTab('support')}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Support Tickets
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Users Management</CardTitle>
                <CardDescription>View and manage all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <AdminOrders orders={orders} onRefresh={refreshOrders} />
          </TabsContent>

          {/* Stations Tab */}
          <TabsContent value="stations" className="space-y-6">
            <AdminFuelStations stations={stations} onRefresh={refreshStations} />
          </TabsContent>

          {/* Support Tickets Tab */}
          <TabsContent value="support" className="space-y-6">
            <AdminSupportTickets />
          </TabsContent>


        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
