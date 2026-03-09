import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Fuel, Phone, LogOut, User, Zap } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  // Removed local user state and useEffect

  const handleLogout = async () => {
    try {
      logout();
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  const handleDownloadApp = () => {
    toast.info("App download coming soon!");
  };

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-primary rounded-lg">
            <Fuel className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            fuel order
          </span>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <a href="/#home" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Home
          </a>
          <a href="/#how-it-works" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            How It Works
          </a>
          <a href="/#stations" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Stations
          </a>

          <a href="/#order" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Order Now
          </a>
          {user && (
            <>
              <a href="/dashboard" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Dashboard
              </a>
              <a href="/support" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Support
              </a>
            </>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>+91 9145470140</span>
          </div>

          {user ? (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/profile")}
                className="hidden sm:flex items-center space-x-1"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-1"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/auth")}
            >
              Login
            </Button>
          )}

          <Button
            variant="default"
            size="sm"
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
            onClick={handleDownloadApp}
          >
            Download App
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
