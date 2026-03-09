import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Fuel, TrendingUp, Calendar, MapPin } from "lucide-react";

interface Refill {
  id: string;
  fuel_type: string;
  quantity_liters: number;
  cost: number;
  odometer_reading: number;
  distance_since_last: number | null;
  efficiency: number | null;
  refill_date: string;
  location: string | null;
  notes: string | null;
}

interface RefillHistoryProps {
  refills: Refill[];
}

export const RefillHistory = ({ refills }: RefillHistoryProps) => {
  if (refills.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Fuel className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No refills logged yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Start tracking your fuel usage to see efficiency insights
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate statistics
  const totalSpent = refills.reduce((sum, r) => sum + parseFloat(r.cost.toString()), 0);
  const totalLiters = refills.reduce((sum, r) => sum + parseFloat(r.quantity_liters.toString()), 0);
  const avgEfficiency = refills
    .filter(r => r.efficiency)
    .reduce((sum, r, _, arr) => sum + parseFloat(r.efficiency!.toString()) / arr.length, 0);
  const totalDistance = refills
    .filter(r => r.distance_since_last)
    .reduce((sum, r) => sum + (r.distance_since_last || 0), 0);

  // Prepare chart data
  const efficiencyData = refills
    .filter(r => r.efficiency)
    .map(r => ({
      date: new Date(r.refill_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      efficiency: parseFloat(r.efficiency!.toString()).toFixed(2),
      km: r.distance_since_last
    }))
    .reverse()
    .slice(-10);

  const costData = refills
    .map(r => ({
      date: new Date(r.refill_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      cost: parseFloat(r.cost.toString()),
      liters: parseFloat(r.quantity_liters.toString())
    }))
    .reverse()
    .slice(-10);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{refills.length} refills</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Fuel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLiters.toFixed(2)}L</div>
            <p className="text-xs text-muted-foreground">Across all refills</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgEfficiency > 0 ? `${avgEfficiency.toFixed(2)} km/L` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Fuel economy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Distance Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDistance} km</div>
            <p className="text-xs text-muted-foreground">Total traveled</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {efficiencyData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Fuel Efficiency Trend
            </CardTitle>
            <CardDescription>Your km/liter over the last 10 refills</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={efficiencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'km/L', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="efficiency"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Cost per Refill</CardTitle>
          <CardDescription>Spending over the last 10 refills</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: '₹', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="cost" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Refill List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Refills</CardTitle>
          <CardDescription>Your complete refill history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {refills.map((refill) => (
            <div key={refill.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{refill.fuel_type}</Badge>
                  <span className="font-semibold">{refill.quantity_liters}L</span>
                </div>
                <span className="font-bold">₹{parseFloat(refill.cost.toString()).toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(refill.refill_date).toLocaleDateString('en-IN')}
                </div>
                <div>📍 {refill.odometer_reading.toLocaleString()} km</div>
              </div>

              {refill.efficiency && (
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="font-semibold text-green-500">
                    {parseFloat(refill.efficiency.toString()).toFixed(2)} km/L
                  </span>
                  {refill.distance_since_last && (
                    <span className="text-muted-foreground">
                      ({refill.distance_since_last} km traveled)
                    </span>
                  )}
                </div>
              )}

              {refill.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {refill.location}
                </div>
              )}

              {refill.notes && (
                <p className="text-sm text-muted-foreground italic">{refill.notes}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
