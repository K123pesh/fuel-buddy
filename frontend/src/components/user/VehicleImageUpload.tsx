import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/integrations/api/client";
import { toast } from "sonner";
import { Camera, Upload } from "lucide-react";

export const VehicleImageUpload = () => {
  const [loading, setLoading] = useState(false);
  const [detection, setDetection] = useState<any>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        setPreview(base64Image);

        // Call AI detection
        const { data, error } = await supabase.functions.invoke("ai-vehicle-detector", {
          body: { imageBase64: base64Image },
        });

        if (error) throw error;
        setDetection(data.detection);
        toast.success("Vehicle detected successfully!");
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast.error("Failed to detect vehicle: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          AI Vehicle Detection
        </CardTitle>
        <CardDescription>
          Upload a vehicle photo for automatic type detection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="vehicle-image">Vehicle Photo</Label>
          <div className="flex items-center gap-2">
            <Input
              id="vehicle-image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={loading}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              disabled={loading}
              onClick={() => document.getElementById("vehicle-image")?.click()}
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {preview && (
          <div className="mt-4">
            <img
              src={preview}
              alt="Vehicle preview"
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Analyzing vehicle...</p>
          </div>
        )}

        {detection && !loading && (
          <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-semibold">Detection Results:</h4>
            <pre className="text-sm whitespace-pre-wrap">{detection}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
