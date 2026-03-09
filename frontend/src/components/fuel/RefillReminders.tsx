import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, BellOff, Settings } from "lucide-react";
import { apiClient } from "@/integrations/api/client";
import { toast } from "sonner";

export const RefillReminders = () => {
  const [enabled, setEnabled] = useState(true);
  const [distanceThreshold, setDistanceThreshold] = useState(500);
  const [fuelThreshold, setFuelThreshold] = useState(25);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reminderId, setReminderId] = useState<string | null>(null);

  useEffect(() => {
    checkNotificationPermission();
    fetchReminderSettings();
  }, []);

  const checkNotificationPermission = () => {
    if ("Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted");
    }
  };

  const fetchReminderSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("refill_reminders")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setReminderId(data.id);
        setEnabled(data.enabled);
        setDistanceThreshold(data.distance_threshold);
        setFuelThreshold(data.fuel_level_threshold);
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Notifications are not supported in this browser");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        await registerServiceWorker();
        toast.success("Notifications enabled!");
      } else {
        toast.error("Notification permission denied");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast.error("Failed to enable notifications");
    }
  };

  const registerServiceWorker = async () => {
    if (!("serviceWorker" in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered:", registration);
      
      // Subscribe to push notifications
      const subscription = await (registration as any).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U"
        ),
      });

      // Save subscription to database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const subscriptionJson = subscription.toJSON();
      await supabase.from("push_subscriptions").insert({
        user_id: user.id,
        endpoint: subscriptionJson.endpoint!,
        p256dh: subscriptionJson.keys!.p256dh,
        auth: subscriptionJson.keys!.auth,
      });
    } catch (error) {
      console.error("Service worker registration error:", error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      const reminderData = {
        user_id: user.id,
        enabled,
        distance_threshold: distanceThreshold,
        fuel_level_threshold: fuelThreshold,
        notification_enabled: notificationsEnabled,
      };

      if (reminderId) {
        const { error } = await supabase
          .from("refill_reminders")
          .update(reminderData)
          .eq("id", reminderId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("refill_reminders")
          .insert(reminderData)
          .select()
          .single();
        if (error) throw error;
        setReminderId(data.id);
      }

      toast.success("Reminder settings saved!");
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast.error(error.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Refill Reminders
        </CardTitle>
        <CardDescription>
          Get smart reminders based on your driving patterns and fuel consumption
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Enable Reminders</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when it's time to refuel
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        {enabled && (
          <>
            <div className="space-y-2">
              <Label htmlFor="distance">Distance Threshold (km)</Label>
              <Input
                id="distance"
                type="number"
                value={distanceThreshold}
                onChange={(e) => setDistanceThreshold(parseInt(e.target.value) || 500)}
                placeholder="500"
              />
              <p className="text-xs text-muted-foreground">
                Remind me every {distanceThreshold} km
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel">Estimated Fuel Level (%)</Label>
              <Input
                id="fuel"
                type="number"
                min="0"
                max="100"
                value={fuelThreshold}
                onChange={(e) => setFuelThreshold(parseInt(e.target.value) || 25)}
                placeholder="25"
              />
              <p className="text-xs text-muted-foreground">
                Remind me when fuel is around {fuelThreshold}%
              </p>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive browser notifications
                  </p>
                </div>
                {notificationsEnabled ? (
                  <Bell className="h-5 w-5 text-green-500" />
                ) : (
                  <BellOff className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              {!notificationsEnabled && (
                <Button
                  onClick={requestNotificationPermission}
                  variant="outline"
                  className="w-full"
                >
                  Enable Notifications
                </Button>
              )}
              {notificationsEnabled && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✓ Notifications are enabled
                </p>
              )}
            </div>

            <div className="bg-accent p-4 rounded-lg text-sm">
              <h4 className="font-semibold mb-2">How it works:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• We track your odometer readings from refill logs</li>
                <li>• You'll get a reminder every {distanceThreshold} km</li>
                <li>• Estimates based on your average fuel consumption</li>
                <li>• Notifications show nearby cheap stations</li>
              </ul>
            </div>
          </>
        )}

        <Button
          onClick={saveSettings}
          disabled={loading}
          className="w-full bg-gradient-primary"
        >
          <Settings className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
};
