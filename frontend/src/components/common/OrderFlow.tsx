import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState, useEffect } from "react";
import { MapPin, Clock, Fuel, CreditCard, Wallet, CheckCircle, Loader2, QrCode, Smartphone, Copy, Printer, IndianRupee, CalendarIcon } from "lucide-react";
import { apiClient } from "@/integrations/api/client";
import { useToast } from "@/hooks/use-toast";
import { fuelPriceService, FuelPrices } from "@/services/fuelPriceService";
import { format, addDays, isToday, isTomorrow, isAfter, startOfDay, setHours, setMinutes } from "date-fns";
import kotakQR from "@/assets/kotak-qr-new.png";
import { cn } from "@/lib/utils";
import { VoiceOrderingButton } from "./VoiceOrderingButton";
import { useAuth } from "@/contexts/AuthContext";

const OrderFlow = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [orderData, setOrderData] = useState({
    address: '',
    date: null as Date | null,
    timeSlot: '',
    quantity: '',
    fuelType: '',
    paymentMethod: '',
    state: '',
    district: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [savedOrderId, setSavedOrderId] = useState<string | null>(null);
  const [fuelPrices, setFuelPrices] = useState<FuelPrices | null>(null);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const { toast } = useToast();

  // Get user from localStorage
  const getUserId = () => {
    const userStr = localStorage.getItem('fuel_buddy_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.user_id || user._id;
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
    return null;
  };

  // Set default fuel prices
  useEffect(() => {
    setFuelPrices({
      regular: 106.31,  // Mumbai petrol price
      premium: 119.87, // Mumbai premium price
      diesel: 94.27    // Mumbai diesel price
    });
  }, []);

  const steps = [
    { id: 1, title: "Delivery Address", icon: "📍" },
    { id: 2, title: "Date & Time", icon: "⏰" },
    { id: 3, title: "Fuel Quantity", icon: "⛽" },
    { id: 4, title: "Payment", icon: "💳" },
    { id: 5, title: "Confirmation", icon: "✅" }
  ];

  // Save order to database
  const saveOrder = async () => {
    try {
      setIsLoading(true);
      
      // Set the user token in apiClient before making the request
      const userToken = localStorage.getItem('fuel_buddy_token');
      if (userToken) {
        apiClient.setToken(userToken);
      }
      
      // Use user from AuthContext instead of API call
      if (!user || !user.user_id) {
        throw new Error('Authentication required: Please login to place an order');
      }
      
      const userId = user.user_id || user.id;
      console.log('Creating order for user:', userId);
      console.log('User data:', user);
      
      // Make sure we have a valid delivery date and time
      let deliveryDate = orderData.date || new Date();
      let deliveryHour = 9; // default hour
      
      if (orderData.timeSlot && typeof orderData.timeSlot === 'string') {
        // Parse timeSlot if available (like "9:00 AM")
        const timeMatch = orderData.timeSlot.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (timeMatch) {
          let hour = parseInt(timeMatch[1]);
          if (timeMatch[3].toUpperCase() === 'PM' && hour !== 12) hour += 12;
          if (timeMatch[3].toUpperCase() === 'AM' && hour === 12) hour = 0;
          deliveryHour = hour;
        }
      }
      
      // Set time to today if deliveryDate is today
      const today = new Date();
      if (deliveryDate.toDateString() === today.toDateString()) {
        // Make sure we don't schedule in the past
        const currentHour = today.getHours();
        if (deliveryHour <= currentHour) {
          // Set to next hour if requested time is in the past
          deliveryHour = currentHour + 1;
          if (deliveryHour >= 24) {
            // Move to next day
            deliveryDate = addDays(deliveryDate, 1);
            deliveryHour = 9; // Start of business day
          }
        }
      }
      
      // Map frontend fuel types to backend expected values
      const fuelTypeMap: { [key: string]: string } = {
        'petrol': 'regular',
        'diesel': 'diesel',
        'premium-petrol': 'premium',
        'cng': 'diesel' // CNG not in enum, map to diesel for now
      };

      // Map payment method
      const paymentMethodMap: { [key: string]: string } = {
        'wallet': 'wallet',
        'qr': 'card',
        'upi': 'card',
        'cod': 'cash_on_delivery'
      };

      // Get fuel station (try to fetch from API or use null)
      let fuelStationId = null;
      try {
        const stations = await apiClient.getFuelStations();
        if (stations && stations.length > 0) {
          fuelStationId = stations[0].id || stations[0]._id;
          console.log('Using fuel station:', fuelStationId);
        }
      } catch (error) {
        console.warn('Could not fetch fuel stations, proceeding without station:', error);
      }

      const orderPayload = {
        user: userId,
        serviceType: 'fuel_delivery',
        fuelStation: fuelStationId,
        fuelType: fuelTypeMap[orderData.fuelType] || 'regular',
        quantity: parseFloat(orderData.quantity),
        totalPrice: getTotalAmount(),
        deliveryAddress: orderData.address,
        deliveryTime: setHours(setMinutes(deliveryDate, 0), deliveryHour).toISOString(),
        specialInstructions: '',
        paymentMethod: paymentMethodMap[orderData.paymentMethod] || 'cash_on_delivery'
      };

      console.log('Saving order to database:', orderPayload);

      const response: any = await apiClient.createOrder(orderPayload);
      console.log('Order saved successfully:', response);

      // Handle different possible response formats
      let orderId = null;
      if (response && typeof response === 'object') {
        orderId = response['_id'] || response['id'] || response['orderId'] || response['order_id'];
      }
      setSavedOrderId(orderId || 'ORD-' + Date.now());

      toast({
        title: "Order Saved",
        description: "Your order has been saved to the database",
      });

      return true;
    } catch (error) {
      console.error('Error saving order:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorName = error instanceof Error ? error.name : 'Unknown error type';
      
      // Provide more detailed error messages
      let userMessage = 'Failed to create order';
      if (errorMessage.includes('Not authorized') || errorMessage.includes('Authentication required') || errorMessage.includes('401')) {
        userMessage = 'Authentication required. Please login to place an order';
      } else if (errorMessage.includes('Not found') || errorMessage.includes('404')) {
        userMessage = 'Service temporarily unavailable. Please try again later';
      } else if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
        userMessage = 'Network error. Please check your connection and try again';
      } else {
        userMessage = errorMessage;
      }
      
      toast({
        title: "Order Creation Failed",
        description: userMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    const success = await saveOrder();
    if (success || savedOrderId) {
      nextStep();
    }
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Try to get address with fallback for CORS issues
          let address = `${latitude}, ${longitude}`;
          
          try {
            // Use reverse geocoding to get address (with error handling for CORS)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
              {
                headers: {
                  'User-Agent': 'FuelBuddy-App' // Some APIs require User-Agent
                }
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              
              // Build a cleaner address from address components
              const addr = data.address || {};
              const parts = [];
              
              // Add road/street name
              if (addr.road) parts.push(addr.road);
              // Add area/residential
              if (addr.residential) parts.push(addr.residential);
              else if (addr.suburb) parts.push(addr.suburb);
              else if (addr.neighbourhood) parts.push(addr.neighbourhood);
              // Add city
              if (addr.city) parts.push(addr.city);
              else if (addr.town) parts.push(addr.town);
              else if (addr.village) parts.push(addr.village);
              // Add state and postcode
              if (addr.state) parts.push(addr.state);
              if (addr.postcode) parts.push(addr.postcode);
              
              address = parts.length > 0 ? parts.join(", ") : data.display_name || `${latitude}, ${longitude}`;
            }
          } catch (geocodeError) {
            console.warn('Geocoding failed, using coordinates:', geocodeError);
            // Fallback to coordinates with a user-friendly message
            address = `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (Enable precise location for address)`;
          }
          
          setOrderData(prev => ({ ...prev, address }));
          toast({
            title: "Location Found",
            description: "Your current location has been added.",
          });
        } catch (error) {
          console.error('Error getting address:', error);
          toast({
            title: "Error",
            description: "Could not fetch address. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        setIsLoading(false);
        toast({
          title: "Location Error",
          description: "Please enable location access in your browser.",
          variant: "destructive",
        });
        console.error('Geolocation error:', error);
      }
    );
  };

  const showSavedAddresses = () => {
    toast({
      title: "Coming Soon",
      description: "Saved addresses feature will be available soon.",
    });
  };

  const generateUpiLink = (amount: number) => {
    const upiId = '9145470140@kotak811';
    const payeeName = 'FuelOrder';
    return `upi://pay?pa=${upiId}&pn=${payeeName}&cu=INR&am=${amount}`;
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText('9145470140@kotak811');
    toast({
      title: "Copied!",
      description: "UPI ID copied to clipboard",
    });
  };

  const getTotalAmount = () => {
    if (!orderData.quantity || !fuelPrices) return 199;

    const quantity = parseFloat(orderData.quantity);
    let pricePerLiter = 100; // default fallback

    // Get price based on fuel type
    switch (orderData.fuelType) {
      case 'petrol':
        pricePerLiter = fuelPrices.regular;
        break;
      case 'premium-petrol':
        pricePerLiter = fuelPrices.premium;
        break;
      case 'diesel':
        pricePerLiter = fuelPrices.diesel;
        break;
      case 'cng':
        // CNG price approximation (usually cheaper per liter equivalent)
        pricePerLiter = fuelPrices.diesel * 0.7;
        break;
      default:
        pricePerLiter = fuelPrices.regular;
    }

    return quantity * pricePerLiter + 199;
  };

  const getFuelCost = () => {
    if (!orderData.quantity) return 0;

    const quantity = parseFloat(orderData.quantity);
    let pricePerLiter = 106.31; // default fallback (Mumbai petrol price)

    // Get price based on fuel type
    if (fuelPrices) {
      switch (orderData.fuelType) {
        case 'petrol':
          pricePerLiter = fuelPrices.regular;
          break;
        case 'premium-petrol':
          pricePerLiter = fuelPrices.premium;
          break;
        case 'diesel':
          pricePerLiter = fuelPrices.diesel;
          break;
        case 'cng':
          pricePerLiter = fuelPrices.diesel * 0.7;
          break;
        default:
          pricePerLiter = fuelPrices.regular;
      }
    } else {
      // Fallback prices when fuelPrices is not available
      switch (orderData.fuelType) {
        case 'petrol':
          pricePerLiter = 106.31;
          break;
        case 'premium-petrol':
          pricePerLiter = 119.87;
          break;
        case 'diesel':
          pricePerLiter = 94.27;
          break;
        case 'cng':
          pricePerLiter = 94.27 * 0.7;
          break;
        default:
          pricePerLiter = 106.31;
      }
    }

    return quantity * pricePerLiter;
  };

  const getPricePerLiter = () => {
    if (fuelPrices) {
      switch (orderData.fuelType) {
        case 'petrol':
          return fuelPrices.regular;
        case 'premium-petrol':
          return fuelPrices.premium;
        case 'diesel':
          return fuelPrices.diesel;
        case 'cng':
          return fuelPrices.diesel * 0.7;
        default:
          return fuelPrices.regular;
      }
    } else {
      // Fallback prices when fuelPrices is not available
      switch (orderData.fuelType) {
        case 'petrol':
          return 106.31;
        case 'premium-petrol':
          return 119.87;
        case 'diesel':
          return 94.27;
        case 'cng':
          return 94.27 * 0.7;
        default:
          return 106.31;
      }
    }
  };

  // Check if a time slot is available for the selected date
  const isTimeSlotAvailable = (slot: string) => {
    if (!orderData.date) return false;
    
    // If selected date is in the future, all slots are available
    if (!isToday(orderData.date)) return true;

    const now = new Date();
    const currentHour = now.getHours();

    // Parse time slot to get start hour
    const timeMatch = slot.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeMatch) return true;

    let slotHour = parseInt(timeMatch[1]);
    if (timeMatch[3].toUpperCase() === 'PM' && slotHour !== 12) slotHour += 12;
    if (timeMatch[3].toUpperCase() === 'AM' && slotHour === 12) slotHour = 0;

    // For today, disable slots that have already passed
    // Allow slots that are at least 1 hour in the future
    return slotHour > currentHour;
  };

  const printBill = () => {
    window.print();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
                <MapPin className="h-5 w-5" />
                Select Delivery Address
              </h3>
              <p className="text-muted-foreground">Where should we deliver your fuel?</p>
            </div>

            {/* Voice Ordering Option */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-blue-700">
                  <span className="text-lg font-semibold">🎤</span>
                  <span className="font-medium">Or Try Voice Ordering!</span>
                </div>
                <p className="text-sm text-blue-600">
                  Place your order using natural voice commands with our AI assistant
                </p>
                <VoiceOrderingButton userId={getUserId()} />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="address">Full Address</Label>
              <Input
                id="address"
                placeholder="123 Main St, City, State 12345"
                value={orderData.address}
                onChange={(e) => setOrderData({ ...orderData, address: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={useCurrentLocation}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Getting...
                    </>
                  ) : (
                    <>
                      <MapPin className="mr-2 h-4 w-4" />
                      Use Current Location
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={showSavedAddresses}
                >
                  Saved Addresses
                </Button>
              </div>
              <Button
                onClick={nextStep}
                className="w-full bg-gradient-primary"
                disabled={!orderData.address}
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
                <Clock className="h-5 w-5" />
                Choose Date & Time
              </h3>
              <p className="text-muted-foreground">When would you like your fuel delivered?</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Preferred Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !orderData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {orderData.date ? (
                        isToday(orderData.date) ? (
                          "Today"
                        ) : isTomorrow(orderData.date) ? (
                          "Tomorrow"
                        ) : (
                          format(orderData.date, "PPP")
                        )
                      ) : (
                        "Pick a date"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={orderData.date || undefined}
                      onSelect={(date) => setOrderData({ ...orderData, date })}
                      disabled={(date) => {
                        const today = startOfDay(new Date());
                        return date < today || isAfter(date, addDays(today, 7));
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Time Slot</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {["9:00 AM - 12:00 PM", "12:00 PM - 3:00 PM", "3:00 PM - 6:00 PM", "6:00 PM - 9:00 PM", "10:00 PM - 11:00 PM"].map((slot) => {
                    const isAvailable = isTimeSlotAvailable(slot);
                    return (
                      <Button
                        key={slot}
                        variant={orderData.timeSlot === slot ? "default" : "outline"}
                        size="sm"
                        onClick={() => setOrderData({ ...orderData, timeSlot: slot })}
                        className={orderData.timeSlot === slot ? "bg-gradient-primary" : ""}
                        disabled={!orderData.date || !isAvailable}
                      >
                        {slot}
                        {!isAvailable && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            (Unavailable)
                          </span>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>
              <Button
                onClick={nextStep}
                className="w-full bg-gradient-primary"
                disabled={!orderData.date || !orderData.timeSlot}
              >
                Continue
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
                <Fuel className="h-5 w-5" />
                Enter Fuel Quantity
              </h3>
              <p className="text-muted-foreground">How much fuel do you need?</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Fuel Type</Label>
                <Select onValueChange={(value) => setOrderData({ ...orderData, fuelType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="petrol">Petrol (Car/Bike)</SelectItem>
                    <SelectItem value="diesel">Diesel (Car/Truck)</SelectItem>
                    <SelectItem value="premium-petrol">Premium Petrol</SelectItem>
                    <SelectItem value="cng">CNG (Compressed Natural Gas)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantity">Quantity (Liters)</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="10"
                  value={orderData.quantity}
                  onChange={(e) => setOrderData({ ...orderData, quantity: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {["5", "10", "20"].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setOrderData({ ...orderData, quantity: amount })}
                  >
                    {amount} L
                  </Button>
                ))}
              </div>
              <div className="p-4 bg-accent rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Fuel Type:</span>
                  <span className="font-medium">{orderData.fuelType ? orderData.fuelType.charAt(0).toUpperCase() + orderData.fuelType.slice(1).replace('-', ' ') : 'Not selected'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Price per Liter:</span>
                  <span>{isLoadingPrices ? (
                    <Loader2 className="h-4 w-4 animate-spin inline" />
                  ) : (
                    `₹${getPricePerLiter().toFixed(2)}`
                  )}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Fuel Cost:</span>
                  <span>{isLoadingPrices ? (
                    <Loader2 className="h-4 w-4 animate-spin inline" />
                  ) : (
                    `₹${getFuelCost().toFixed(2)}`
                  )}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee:</span>
                  <span>₹199</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span>{isLoadingPrices ? (
                    <Loader2 className="h-4 w-4 animate-spin inline" />
                  ) : (
                    `₹${getTotalAmount().toFixed(2)}`
                  )}</span>
                </div>
              </div>
              <Button
                onClick={nextStep}
                className="w-full bg-gradient-primary"
                disabled={!orderData.fuelType || !orderData.quantity}
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </h3>
              <p className="text-muted-foreground">Choose how to pay for your order</p>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                {/* Wallet Payment */}
                <Button
                  variant={orderData.paymentMethod === 'wallet' ? "default" : "outline"}
                  className={`justify-start h-auto p-4 ${orderData.paymentMethod === 'wallet' ? 'bg-gradient-primary' : ''}`}
                  onClick={() => setOrderData({ ...orderData, paymentMethod: 'wallet' })}
                >
                  <div className="flex items-center space-x-3">
                    <Wallet className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Fuel Order Wallet</div>
                      <div className="text-sm text-muted-foreground">Balance: ₹10,500.00</div>
                    </div>
                  </div>
                </Button>

                {/* QR Code Payment */}
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${orderData.paymentMethod === 'qr'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                    }`}
                  onClick={() => setOrderData({ ...orderData, paymentMethod: 'qr' })}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <QrCode className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">QR Code Payment</div>
                      <div className="text-sm text-muted-foreground">Scan with any UPI app</div>
                    </div>
                  </div>
                  {orderData.paymentMethod === 'qr' && (
                    <div className="flex flex-col items-center space-y-3 pt-3 border-t">
                      <div className="relative">
                        <img
                          src={kotakQR}
                          alt="Kotak UPI QR Code"
                          className="w-64 h-auto rounded-lg shadow-elegant"
                        />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-sm font-medium">UPI ID: 9145470140@kotak811</p>
                        <p className="text-xs text-muted-foreground">Amount: ₹{getTotalAmount().toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Scan the QR code above with any UPI app</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyUpiId();
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy UPI ID
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* UPI Payment */}
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${orderData.paymentMethod === 'upi'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                    }`}
                  onClick={() => setOrderData({ ...orderData, paymentMethod: 'upi' })}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Smartphone className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">UPI Payment</div>
                      <div className="text-sm text-muted-foreground">Pay via UPI apps</div>
                    </div>
                  </div>
                  {orderData.paymentMethod === 'upi' && (
                    <div className="space-y-3 pt-3 border-t">
                      <div className="text-center space-y-2">
                        <p className="text-sm font-medium">UPI ID: 9145470140@kotak811</p>
                        <p className="text-xs text-muted-foreground">Amount: ₹{getTotalAmount().toFixed(2)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyUpiId();
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy UPI ID
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = generateUpiLink(getTotalAmount());
                          }}
                        >
                          <Smartphone className="h-4 w-4 mr-2" />
                          Open UPI App
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cash on Delivery */}
                <Button
                  variant={orderData.paymentMethod === 'cod' ? "default" : "outline"}
                  className={`justify-start h-auto p-4 ${orderData.paymentMethod === 'cod' ? 'bg-gradient-primary' : ''}`}
                  onClick={() => setOrderData({ ...orderData, paymentMethod: 'cod' })}
                >
                  <div className="flex items-center space-x-3">
                    <IndianRupee className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Cash on Delivery</div>
                      <div className="text-sm text-muted-foreground">Pay when fuel is delivered</div>
                    </div>
                  </div>
                </Button>
              </div>
              <Button
                onClick={handlePlaceOrder}
                className="w-full bg-gradient-primary"
                disabled={!orderData.paymentMethod || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  'Place Order'
                )}
              </Button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-fuel-green/10 rounded-full flex items-center justify-center mx-auto print:hidden">
                <CheckCircle className="h-8 w-8 text-fuel-green" />
              </div>
              <h3 className="text-xl font-semibold">Order Placed Successfully!</h3>
              <p className="text-muted-foreground">Your fuel will be delivered on {orderData.date ? (isToday(orderData.date) ? "Today" : isTomorrow(orderData.date) ? "Tomorrow" : format(orderData.date, "PPP")) : "Selected date"} between {orderData.timeSlot}</p>
              {savedOrderId && (
                <p className="text-sm text-muted-foreground">Order ID: {savedOrderId}</p>
              )}
            </div>

            {/* Printable Bill Section */}
            <div id="printable-bill" className="p-6 bg-accent rounded-lg text-left space-y-4 print:bg-white print:shadow-none">
              {/* Header - Only visible when printing */}
              <div className="hidden print:block text-center border-b-2 pb-4 mb-4">
                <h1 className="text-2xl font-bold">Fuel Order</h1>
                <p className="text-sm text-muted-foreground">Invoice / Receipt</p>
                <p className="text-xs mt-2">Date: {new Date().toLocaleDateString('en-IN')}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm border-b pb-2">
                  <span className="font-medium">Order ID:</span>
                  <span className="font-mono">{savedOrderId || 'N/A'}</span>
                </div>

                <div className="border-b pb-2">
                  <p className="font-medium text-sm mb-1">Delivery Address:</p>
                  <p className="text-sm text-muted-foreground">{orderData.address || "123 Main St, City, State 12345"}</p>
                </div>

                <div className="flex justify-between text-sm border-b pb-2">
                  <span className="font-medium">Delivery Date:</span>
                  <span>{orderData.date ? (isToday(orderData.date) ? "Today" : isTomorrow(orderData.date) ? "Tomorrow" : format(orderData.date, "PPP")) : "Selected date"}</span>
                </div>

                <div className="flex justify-between text-sm border-b pb-2">
                  <span className="font-medium">Time Slot:</span>
                  <span>{orderData.timeSlot || "9:00 AM - 12:00 PM"}</span>
                </div>

                <div className="flex justify-between text-sm border-b pb-2">
                  <span className="font-medium">Fuel Type:</span>
                  <span>{orderData.fuelType ? orderData.fuelType.charAt(0).toUpperCase() + orderData.fuelType.slice(1).replace('-', ' ') : 'Petrol'}</span>
                </div>

                <div className="flex justify-between text-sm border-b pb-2">
                  <span className="font-medium">Quantity:</span>
                  <span>{orderData.quantity || "10"} liters</span>
                </div>

                <div className="flex justify-between text-sm border-b pb-2">
                  <span className="font-medium">Price per Liter:</span>
                  <span>₹{getPricePerLiter().toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm border-b pb-2">
                  <span className="font-medium">Fuel Cost:</span>
                  <span>₹{getFuelCost().toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm border-b pb-2">
                  <span className="font-medium">Delivery Fee:</span>
                  <span>₹199.00</span>
                </div>

                <div className="flex justify-between text-lg font-bold border-t-2 pt-3 mt-2">
                  <span>Total Paid:</span>
                  <span>₹{getTotalAmount().toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm pt-2">
                  <span className="font-medium">Payment Method:</span>
                  <span className="capitalize">
                    {orderData.paymentMethod === 'cod' ? 'Cash on Delivery' :
                      orderData.paymentMethod === 'wallet' ? 'Fuel Order Wallet' :
                        orderData.paymentMethod === 'qr' ? 'QR Code Payment' :
                          orderData.paymentMethod === 'upi' ? 'UPI Payment' :
                            orderData.paymentMethod || 'Wallet'}
                  </span>
                </div>
              </div>

              {/* Footer - Only visible when printing */}
              <div className="hidden print:block text-center border-t-2 pt-4 mt-6">
                <p className="text-sm font-medium">Thank you for your order!</p>
                <p className="text-xs text-muted-foreground mt-2">For any queries, call +91 9145470140</p>
                <p className="text-xs text-muted-foreground">www.fuelorder.com</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 print:hidden">
              <Button
                variant="outline"
                className="w-full"
                onClick={printBill}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Bill
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setCurrentStep(1);
                  setSavedOrderId(null);
                  setOrderData({
                    address: '',
                    date: null,
                    timeSlot: '',
                    quantity: '',
                    fuelType: '',
                    paymentMethod: '',
                    state: '',
                    district: ''
                  });
                }}
              >
                Place Another Order
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section id="order" className="py-20 bg-muted/30">
      <div className="container max-w-4xl">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Place Your Order
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Simple steps to get fuel delivered right to your location
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center space-y-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep >= step.id
                    ? 'bg-gradient-primary border-primary text-primary-foreground'
                    : 'border-muted-foreground text-muted-foreground'
                  }`}>
                  <span className="text-lg">{step.icon}</span>
                </div>
                <span className="text-xs text-center text-muted-foreground hidden sm:block">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-muted rounded-full h-2">
            <div
              className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Step {currentStep} of 5
              <Badge variant="secondary">{steps[currentStep - 1]?.title}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default OrderFlow;
