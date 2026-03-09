import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AdminUsersProps {
  profiles: any[];
  orders: any[];
  loyaltyPoints: any[];
}

const AdminUsers = ({ profiles, orders, loyaltyPoints }: AdminUsersProps) => {
  const getOrderCount = (userId: string) => orders.filter(o => o.user_id === userId).length;
  const getTotalSpent = (userId: string) => orders.filter(o => o.user_id === userId).reduce((sum: number, o: any) => sum + Number(o.total_price), 0);
  const getLoyalty = (userId: string) => loyaltyPoints.find((lp: any) => lp.user_id === userId)?.total_points || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">All Users ({profiles.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Loyalty Pts</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.full_name || "—"}</TableCell>
                  <TableCell>{profile.email}</TableCell>
                  <TableCell>{profile.phone || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{getOrderCount(profile.id)}</Badge>
                  </TableCell>
                  <TableCell>₹{getTotalSpent(profile.id).toLocaleString()}</TableCell>
                  <TableCell>{getLoyalty(profile.id)}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {profiles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminUsers;
