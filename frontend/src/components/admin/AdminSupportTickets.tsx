import { useState, useEffect } from "react";
import { apiClient } from "@/integrations/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MessageSquare, User, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006/api';

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  user: {
    _id: string;
    email: string;
    full_name: string;
    phone: string;
  };
  admin_response?: string;
  admin_notes?: string;
  resolved_at?: string;
}

const AdminSupportTickets = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [updatingTicket, setUpdatingTicket] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    adminResponse: '',
    adminNotes: ''
  });

  useEffect(() => {
    fetchTickets();
  }, [filterStatus, filterPriority]);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('fuel_buddy_admin_token');
      if (!token) return;

      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterPriority !== 'all') params.append('priority', filterPriority);

      const response = await axios.get(`${API_BASE_URL}/support/admin/tickets?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setTickets(response.data.tickets || []);
    } catch (error: any) {
      console.error('Failed to fetch support tickets:', error);
      toast.error('Failed to fetch support tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleTicketSelect = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setUpdateForm({
      status: ticket.status,
      adminResponse: ticket.admin_response || '',
      adminNotes: ticket.admin_notes || ''
    });
  };

  const handleTicketUpdate = async () => {
    if (!selectedTicket) return;

    setUpdatingTicket(true);
    try {
      const token = localStorage.getItem('fuel_buddy_admin_token');
      if (!token) return;

      const response = await axios.put(`${API_BASE_URL}/support/admin/tickets/${selectedTicket.id}`, 
        updateForm,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      toast.success('Ticket updated successfully');
      fetchTickets();
      
      // Update the selected ticket with new data
      setSelectedTicket(response.data.ticket);
    } catch (error: any) {
      console.error('Failed to update ticket:', error);
      toast.error('Failed to update ticket');
    } finally {
      setUpdatingTicket(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'closed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-green-500';
      case 'closed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-200 text-gray-800';
      case 'medium':
        return 'bg-blue-200 text-blue-800';
      case 'high':
        return 'bg-orange-200 text-orange-800';
      case 'urgent':
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">Loading support tickets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Support Tickets</h2>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-semibold">Tickets ({tickets.length})</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {tickets.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No support tickets found
              </p>
            ) : (
              tickets.map((ticket) => (
                <Card 
                  key={ticket.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedTicket?.id === ticket.id ? 'border-primary' : ''
                  }`}
                  onClick={() => handleTicketSelect(ticket)}
                >
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm line-clamp-2">
                          {ticket.subject}
                        </h4>
                        <Badge className={getStatusColor(ticket.status)}>
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1 text-xs">
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{ticket.user.full_name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {selectedTicket.subject}
                </CardTitle>
                <CardDescription>
                  Ticket from {selectedTicket.user.full_name} ({selectedTicket.user.email})
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Ticket Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <Badge className={getPriorityColor(selectedTicket.priority)}>
                      {selectedTicket.priority}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge className={getStatusColor(selectedTicket.status)}>
                      {getStatusIcon(selectedTicket.status)}
                      <span className="ml-1">
                        {selectedTicket.status.replace('_', ' ')}
                      </span>
                    </Badge>
                  </div>
                </div>

                {/* Original Message */}
                <div>
                  <Label className="text-sm font-medium">Original Message</Label>
                  <div className="mt-1 p-3 bg-muted rounded-lg">
                    <p className="text-sm">{selectedTicket.message}</p>
                  </div>
                </div>

                {/* Update Form */}
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium">Update Ticket</h4>
                  
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={updateForm.status}
                      onValueChange={(value) => setUpdateForm(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="adminResponse">Admin Response</Label>
                    <Textarea
                      id="adminResponse"
                      placeholder="Enter your response to the customer..."
                      value={updateForm.adminResponse}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, adminResponse: e.target.value }))}
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="adminNotes">Internal Notes</Label>
                    <Textarea
                      id="adminNotes"
                      placeholder="Internal notes (not visible to customer)..."
                      value={updateForm.adminNotes}
                      onChange={(e) => setUpdateForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <Button 
                    onClick={handleTicketUpdate}
                    disabled={updatingTicket}
                    className="w-full"
                  >
                    {updatingTicket ? 'Updating...' : 'Update Ticket'}
                  </Button>
                </div>

                {/* Existing Admin Response */}
                {selectedTicket.admin_response && (
                  <div className="space-y-2 border-t pt-4">
                    <Label className="text-sm font-medium">Previous Admin Response</Label>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm">{selectedTicket.admin_response}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a ticket to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupportTickets;
