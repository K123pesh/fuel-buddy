import { useState } from "react";
import { apiClient } from "@/integrations/api/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface AdminSupportProps {
  tickets: any[];
  onRefresh: () => void;
}

const TICKET_STATUSES = ["open", "in_progress", "resolved", "closed"];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    open: "bg-blue-500",
    in_progress: "bg-yellow-500",
    resolved: "bg-green-500",
    closed: "bg-gray-500",
  };
  return colors[status] || "bg-gray-500";
};

const AdminSupport = ({ tickets, onRefresh }: AdminSupportProps) => {
  const [updating, setUpdating] = useState<string | null>(null);

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    setUpdating(ticketId);
    const { error } = await supabase
      .from("support_tickets")
      .update({ status: newStatus })
      .eq("id", ticketId);

    if (error) {
      toast.error("Failed to update ticket status");
    } else {
      toast.success(`Ticket status updated to ${newStatus}`);
      onRefresh();
    }
    setUpdating(null);
  };

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <Card key={ticket.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                <CardDescription>
                  {new Date(ticket.created_at).toLocaleString()} · Priority: {ticket.priority?.toUpperCase()}
                </CardDescription>
              </div>
              <Select
                defaultValue={ticket.status}
                onValueChange={(val) => updateTicketStatus(ticket.id, val)}
                disabled={updating === ticket.id}
              >
                <SelectTrigger className="w-[130px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TICKET_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace("_", " ").toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{ticket.message}</p>
          </CardContent>
        </Card>
      ))}
      {tickets.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No support tickets found
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminSupport;
