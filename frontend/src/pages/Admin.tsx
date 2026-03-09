import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to admin login page
    navigate('/admin/login');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-lg">
              <Shield className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Fuel Buddy Admin</CardTitle>
          <CardDescription>
            Administrative access control panel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <Shield className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Admin Portal</h3>
            <p className="text-muted-foreground mb-6">
              Secure access to Fuel Buddy management system
            </p>
            
            <Button 
              className="w-full bg-gradient-primary" 
              onClick={() => navigate('/admin/login')}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Go to Admin Login
            </Button>
            
            <div className="text-sm text-muted-foreground">
              <p>Demo Credentials:</p>
              <p>Username: <code className="bg-muted px-2 py-1 rounded text-xs">admin</code></p>
              <p>Password: <code className="bg-muted px-2 py-1 rounded text-xs">admin123</code></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
