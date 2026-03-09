import { useEffect } from "react";
import Header from "@/components/common/Header";
import HeroSection from "@/components/common/HeroSection";
import HowItWorks from "@/components/common/HowItWorks";
import OrderFlow from "@/components/common/OrderFlow";
import ServiceTypeSelector from "@/components/common/ServiceTypeSelector";
import Footer from "@/components/common/Footer";
import { AIChatbot } from "@/components/common/AIChatbot";
import FuelStationMap from "@/components/map/FuelStationMap";

const Index = () => {
  useEffect(() => {
    // Handle hash navigation
    const handleHashChange = () => {
      if (window.location.hash === '#order') {
        const orderSection = document.getElementById('order');
        if (orderSection) {
          orderSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    // Check hash on initial load
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <HowItWorks />
        <FuelStationMap />
        <ServiceTypeSelector />
        <div className="order-flow-section">
          <OrderFlow />
        </div>
      </main>
      <Footer />
      <AIChatbot />
    </div>
  );
};

export default Index;
