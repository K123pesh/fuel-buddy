import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Fuel, Zap, ArrowRight } from "lucide-react";

const ServiceTypeSelector = () => {
  const navigate = useNavigate();

  return (
    <section id="order" className="py-16 bg-accent/30">
      <div className="container">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold">Choose Your Service</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Premium fuel delivery service
          </p>
        </div>

        <div className="grid md:grid-cols-1 gap-8 max-w-2xl mx-auto">
          {/* Fuel Delivery Card */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-full group-hover:bg-orange-200 transition-colors">
                  <Fuel className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Fuel Delivery</CardTitle>
                  <CardDescription>
                    Premium fuel delivered to your location
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Petrol, Diesel & Premium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Same-day delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Real-time pricing</span>
                </div>
              </div>
              
              <Button 
                className="w-full bg-gradient-orange hover:opacity-90 transition-opacity"
                onClick={() => {
                  const orderSection = document.querySelector('.order-flow-section');
                  orderSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Order Fuel
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>


        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">10K+</div>
            <div className="text-sm text-muted-foreground">Fuel Orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">100%</div>
            <div className="text-sm text-muted-foreground">Reliable Service</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">4.8★</div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">24/7</div>
            <div className="text-sm text-muted-foreground">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceTypeSelector;
