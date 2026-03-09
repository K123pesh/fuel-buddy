import { useEffect, useState } from "react";
import { apiClient } from "@/integrations/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Gift, Copy, Share2, Users, Trophy, CheckCircle2, Clock, Mail } from "lucide-react";
import { toast } from "sonner";

interface Referral {
  id: string;
  referred_email: string;
  referral_code: string;
  status: string;
  points_awarded: number;
  created_at: string;
  completed_at: string | null;
}

export const ReferralProgram = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState<any>(null);

  const POINTS_PER_REFERRAL = 500;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // Generate referral code from user ID
      const code = `REF${user.id.substring(0, 8).toUpperCase()}`;
      setReferralCode(code);

      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReferrals(data || []);
    } catch (error) {
      console.error("Error fetching referrals:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied!");
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/auth?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Referral link copied!");
  };

  const shareReferralLink = async () => {
    const link = `${window.location.origin}/auth?ref=${referralCode}`;
    const text = `Join FuelBuddy and get ₹50 off your first order! Use my referral code: ${referralCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: "FuelBuddy Referral", text, url: link });
      } catch (error) {
        // User cancelled or error
        copyReferralLink();
      }
    } else {
      copyReferralLink();
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail || !user) {
      toast.error("Please enter an email address");
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase
        .from("referrals")
        .insert({
          referrer_id: user.id,
          referred_email: inviteEmail,
          referral_code: referralCode,
          status: "pending"
        });

      if (error) throw error;
      
      toast.success(`Invite sent to ${inviteEmail}`);
      setInviteEmail("");
      fetchData();
    } catch (error: any) {
      console.error("Error sending invite:", error);
      if (error.code === "23505") {
        toast.error("This email has already been invited");
      } else {
        toast.error("Failed to send invite");
      }
    } finally {
      setSending(false);
    }
  };

  const getStats = () => {
    const pending = referrals.filter(r => r.status === "pending").length;
    const completed = referrals.filter(r => r.status === "completed").length;
    const totalPoints = referrals.reduce((sum, r) => sum + (r.points_awarded || 0), 0);
    return { pending, completed, totalPoints };
  };

  const stats = getStats();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Mail className="h-4 w-4 text-muted-foreground" />;
    }
  };

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
    <div className="space-y-6">
      {/* Main Referral Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Refer & Earn
          </CardTitle>
          <CardDescription>
            Invite friends and earn {POINTS_PER_REFERRAL} points for each successful referral
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Referral Code */}
          <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
            <Label className="text-sm text-muted-foreground">Your Referral Code</Label>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 p-3 bg-background rounded-lg border-2 border-dashed border-primary/50">
                <span className="text-xl font-mono font-bold tracking-wider">{referralCode}</span>
              </div>
              <Button variant="outline" size="icon" onClick={copyReferralCode}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button onClick={shareReferralLink} className="bg-gradient-primary">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Invite by Email */}
          <div className="space-y-3">
            <Label>Invite by Email</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="friend@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <Button onClick={sendInvite} disabled={sending}>
                {sending ? "Sending..." : "Send Invite"}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-accent rounded-lg">
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{referrals.length}</div>
              <p className="text-xs text-muted-foreground">Total Invites</p>
            </div>
            <div className="text-center p-4 bg-accent rounded-lg">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="text-center p-4 bg-accent rounded-lg">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{stats.totalPoints}</div>
              <p className="text-xs text-muted-foreground">Points Earned</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral History */}
      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No referrals yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Share your code to start earning points
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(referral.status)}
                    <div>
                      <p className="font-medium">{referral.referred_email}</p>
                      <p className="text-xs text-muted-foreground">
                        Invited on {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={referral.status === "completed" ? "default" : "secondary"}>
                      {referral.status}
                    </Badge>
                    {referral.points_awarded > 0 && (
                      <Badge variant="outline" className="text-green-600">
                        +{referral.points_awarded} pts
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Share Your Code</p>
                <p className="text-sm text-muted-foreground">
                  Share your unique referral code with friends
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Friend Signs Up</p>
                <p className="text-sm text-muted-foreground">
                  Your friend creates an account using your code
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Both Earn Rewards</p>
                <p className="text-sm text-muted-foreground">
                  You get {POINTS_PER_REFERRAL} points, they get ₹50 off first order
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
