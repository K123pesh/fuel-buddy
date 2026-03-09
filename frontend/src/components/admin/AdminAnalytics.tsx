import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface Order {
  id: string;
  created_at: string;
  fuel_type: string;
  quantity: number;
  total_price: number;
  status: string;
}

interface AdminAnalyticsProps {
  orders: Order[];
}

const COLORS = [
  "hsl(25, 95%, 53%)",
  "hsl(217, 91%, 60%)",
  "hsl(142, 71%, 45%)",
  "hsl(0, 84%, 60%)",
  "hsl(280, 70%, 55%)",
];

const AdminAnalytics = ({ orders }: AdminAnalyticsProps) => {
  const revenueByDay = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => {
      const day = new Date(o.created_at).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
      map.set(day, (map.get(day) || 0) + o.total_price);
    });
    return Array.from(map, ([name, revenue]) => ({ name, revenue: Math.round(revenue) }));
  }, [orders]);

  const ordersByDay = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => {
      const day = new Date(o.created_at).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
      map.set(day, (map.get(day) || 0) + 1);
    });
    return Array.from(map, ([name, count]) => ({ name, orders: count }));
  }, [orders]);

  const fuelDistribution = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => {
      const type = o.fuel_type || "Unknown";
      map.set(type, (map.get(type) || 0) + 1);
    });
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [orders]);

  const totalRevenue = orders.reduce((s, o) => s + o.total_price, 0);
  const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{Math.round(totalRevenue).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{orders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{Math.round(avgOrderValue).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 20%, 88%)" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `₹${v}`} />
                <Tooltip formatter={(v: number) => [`₹${v}`, "Revenue"]} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(25, 95%, 53%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ordersByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 20%, 88%)" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="orders" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fuel type distribution */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Fuel Type Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={fuelDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {fuelDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
