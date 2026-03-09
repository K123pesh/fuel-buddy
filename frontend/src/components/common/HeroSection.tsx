import { Button } from "@/components/ui/button";
import { Play, Smartphone, MapPin, Clock, Zap } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { VoiceOrderingButton } from "./VoiceOrderingButton";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/30 to-background overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="fuel order fuel delivery service"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-20"></div>
      </div>
      
      {/* Content */}
      <div className="container relative z-10 grid lg:grid-cols-2 gap-12 items-center py-20">
        {/* Left Content */}
        <div className="space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Premium Fuel
              </span>
              <br />
              <span className="text-foreground">Right to You</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-md">
              Skip gas stations. Get premium fuel delivered with our reliable on-demand service.
            </p>
          </div>
          
          {/* Key Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-8 h-8 bg-fuel-orange/10 rounded-full flex items-center justify-center">
                <Smartphone className="h-4 w-4 text-primary" />
              </div>
              <span className="text-muted-foreground">Easy App Ordering</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-8 h-8 bg-fuel-blue/10 rounded-full flex items-center justify-center">
                <MapPin className="h-4 w-4 text-secondary" />
              </div>
              <span className="text-muted-foreground">Any Location</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-8 h-8 bg-fuel-green/10 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-fuel-green" />
              </div>
              <span className="text-muted-foreground">Scheduled Delivery</span>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-medium"
              onClick={() => {
                const orderSection = document.getElementById('order');
                orderSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Start Your Order
            </Button>
            <VoiceOrderingButton />
          </div>
        </div>
        
        {/* Right Content - App Preview */}
        <div className="relative flex justify-center lg:justify-end animate-slide-up">
          <div className="relative">
            {/* Phone Mockup */}
            <div className="w-72 h-[600px] bg-card rounded-[3rem] border-8 border-border shadow-strong p-2">
              <div className="w-full h-full bg-gradient-to-b from-background to-muted rounded-[2.5rem] p-6 flex flex-col">
                {/* Status Bar */}
                <div className="flex justify-between items-center mb-8">
                  <div className="flex space-x-1">
                    <div className="w-4 h-4 bg-fuel-green rounded-full"></div>
                    <div className="w-4 h-4 bg-fuel-orange rounded-full"></div>
                    <div className="w-4 h-4 bg-fuel-red rounded-full"></div>
                  </div>
                  <span className="text-xs text-muted-foreground">9:41 AM</span>
                </div>
                
                {/* App Content */}
                <div className="flex-1 space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">Welcome to fuel order</h3>
                    <p className="text-sm text-muted-foreground">Your fuel, delivered</p>
                  </div>
                  
                  {/* Mock Order Steps */}
                  <div className="space-y-3">
                    <div className="p-3 bg-background rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">1</div>
                        <span className="text-sm">Select Location</span>
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-muted-foreground rounded-full flex items-center justify-center text-background text-sm font-medium">2</div>
                        <span className="text-sm text-muted-foreground">Choose Time Slot</span>
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-muted-foreground rounded-full flex items-center justify-center text-background text-sm font-medium">3</div>
                        <span className="text-sm text-muted-foreground">Enter Quantity</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-medium animate-pulse">
              <span className="text-primary-foreground font-bold text-sm">NEW</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
