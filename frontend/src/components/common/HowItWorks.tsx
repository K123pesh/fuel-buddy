import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, MapPin, Clock, Fuel, CreditCard, CheckCircle } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Smartphone,
      title: "Download & Verify",
      description: "Download fuel order app and verify your mobile number with OTP",
      color: "fuel-orange"
    },
    {
      icon: MapPin,
      title: "Select Address",
      description: "Choose your delivery location or use your current GPS location",
      color: "fuel-blue"
    },
    {
      icon: Clock,
      title: "Pick Time Slot",
      description: "Select your preferred date and time for fuel delivery",
      color: "fuel-green"
    },
    {
      icon: Fuel,
      title: "Enter Quantity",
      description: "Specify how much fuel you need for your vehicle or equipment",
      color: "fuel-orange"
    },
    {
      icon: CreditCard,
      title: "Choose Payment",
      description: "Pay through fuel order wallet or your preferred payment method",
      color: "fuel-blue"
    },
    {
      icon: CheckCircle,
      title: "Get Delivered",
      description: "Sit back and relax while we deliver premium fuel to your location",
      color: "fuel-green"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Getting fuel delivered has never been easier. Follow these simple steps to place your order.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="relative overflow-hidden group hover:shadow-medium transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="p-6">
                  {/* Step Number */}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{index + 1}</span>
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-${step.color}/10 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-6 w-6 text-${step.color}`} />
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  
                  {/* Connecting Line (except for last item) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-border to-transparent transform -translate-y-1/2 z-10"></div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <div className="w-2 h-2 bg-fuel-green rounded-full animate-pulse"></div>
            <span>Available 24/7 in your area</span>
          </div>
          <h3 className="text-2xl font-semibold mb-4">Ready to get started?</h3>
          <p className="text-muted-foreground mb-6">Join thousands of customers who trust fuel order for their fuel needs.</p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
