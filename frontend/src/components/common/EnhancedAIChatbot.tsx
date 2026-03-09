import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, X, Bot, User, Phone, Mail, MapPin, Clock, Fuel, CreditCard, Star, Zap, Shield, Truck } from "lucide-react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
}

export const EnhancedAIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "🚗 Welcome to Fuel Buddy! I'm here to help you with all your fuel delivery needs.\n\nWhat can I assist you with today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    {
      label: "Order Fuel",
      icon: <Fuel className="h-4 w-4" />,
      action: () => handleQuickAction("I want to order fuel"),
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      label: "Track Order",
      icon: <Truck className="h-4 w-4" />,
      action: () => handleQuickAction("Where is my fuel order?"),
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      label: "Check Prices",
      icon: <CreditCard className="h-4 w-4" />,
      action: () => handleQuickAction("What are your fuel prices?"),
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      label: "Contact Support",
      icon: <Phone className="h-4 w-4" />,
      action: () => handleQuickAction("I need to contact customer support"),
      color: "bg-purple-500 hover:bg-purple-600"
    }
  ];

  const helpfulResponses = [
    {
      keywords: ["order", "book", "delivery", "petrol", "diesel"],
      response: "🚗 Ready to order fuel? Here's how easy it is:\n\n1️⃣ Select your location\n2️⃣ Choose fuel type (Petrol/Diesel)\n3️⃣ Enter quantity needed\n4️⃣ Pick delivery time\n5️⃣ Pay via UPI/Card/Cash\n\n⏰ Delivery time: 30-60 minutes\n💰 Starting from ₹199 delivery fee\n\nWould you like me to guide you to the order form?"
    },
    {
      keywords: ["price", "cost", "rate", "charge"],
      response: "💰 Current Fuel Prices (Mumbai):\n\n⛽ Petrol: ₹106.31/liter\n⛽ Premium Petrol: ₹119.87/liter\n🛢️ Diesel: ₹94.27/liter\n\n📦 Delivery Fee: ₹199\n🎁 Earn 1 loyalty point per ₹10 spent\n\nPrices may vary by location. Real-time prices available in the order form!"
    },
    {
      keywords: ["track", "status", "where", "delivery"],
      response: "📍 Track Your Order:\n\n📱 Check your order history in the app\n🔍 Enter order ID if available\n🚚 Real-time GPS tracking\n⏰ ETA updates via SMS\n\nIf you don't see your order, please share your order ID and I'll help locate it!"
    },
    {
      keywords: ["payment", "pay", "upi", "card", "cash"],
      response: "💳 Payment Options:\n\n📱 UPI: Scan QR or use UPI ID\n💳 Credit/Debit Cards: All major cards accepted\n💵 Cash on Delivery: Pay when fuel arrives\n👛 Fuel Wallet: Use your balance\n\nAll payments are secure and encrypted!"
    },
    {
      keywords: ["contact", "support", "help", "phone", "email"],
      response: "📞 Contact Fuel Buddy Support:\n\n📞 24/7 Helpline: +91 9145470140\n📧 Email: fuelorder94@gmail.com\n💬 Live Chat: Available 24/7\n📍 Address: Check our service areas\n\nWe're here to help you anytime!"
    },
    {
      keywords: ["loyalty", "points", "rewards", "earn"],
      response: "🏆 Fuel Buddy Rewards:\n\n🎯 Earn 1 point per ₹10 spent\n💰 Redeem points for discounts\n🎁 Exclusive member benefits\n📊 Track points in your profile\n\nThe more you order, the more you save!"
    },
    {
      keywords: ["emergency", "urgent", "asap", "fast"],
      response: "🚨 Emergency Fuel Delivery:\n\n⚡ Priority dispatch available\n🏃 Express delivery: 20-30 minutes\n📞 Call urgent line: +91 9145470140\n📍 Real-time tracking\n\nExtra charges may apply for emergency service."
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const getSmartResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const { keywords, response } of helpfulResponses) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return response;
      }
    }
    
    // Default helpful response
    return "🌟 I'm here to help! You can ask me about:\n\n⛽ Ordering fuel delivery\n📍 Tracking your order\n💰 Pricing and payments\n🏆 Loyalty rewards\n📞 Customer support\n\nWhat would you like to know more about?";
  };

  const handleQuickAction = (action: string) => {
    const userMessage: Message = { role: "user", content: action, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    
    setTimeout(() => {
      const response = getSmartResponse(action);
      const assistantMessage: Message = { 
        role: "assistant", 
        content: response,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 500);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Try enhanced backend API first
      const response = await apiClient.post("/ai-enhanced/enhanced-chat", {
        message: input,
      }) as { response: string };

      if (response.response) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: response.response, timestamp: new Date() },
        ]);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      // Fallback to smart responses
      const smartResponse = getSmartResponse(input);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: smartResponse, timestamp: new Date() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-16 h-16 shadow-lg bg-gradient-to-r from-orange-500 to-red-500 hover:scale-110 transition-all duration-300 z-50 border-2 border-white"
        size="icon"
      >
        <MessageSquare className="h-8 w-8 text-white animate-pulse" />
        <Badge className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          AI
        </Badge>
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[420px] h-[700px] shadow-2xl z-50 flex flex-col border-2 border-orange-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-white">
          <Bot className="h-6 w-6" />
          Fuel Buddy Assistant
          <Badge className="bg-green-400 text-white text-xs">AI</Badge>
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                )}
                <div className="max-w-[80%]">
                  <div
                    className={`rounded-lg px-4 py-3 ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                  {message.timestamp && (
                    <p className="text-xs text-gray-500 mt-1 px-2">
                      {formatTime(message.timestamp)}
                    </p>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-3">
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    <span className="ml-2 text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Quick Actions */}
        <div className="p-3 border-t bg-gray-50">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                onClick={action.action}
                className={`text-white text-xs h-8 ${action.color} transition-all duration-200 hover:scale-105`}
                size="sm"
              >
                <span className="flex items-center gap-1">
                  {action.icon}
                  {action.label}
                </span>
              </Button>
            ))}
          </div>
        </div>
        
        <form onSubmit={sendMessage} className="p-4 border-t flex gap-2 bg-white">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about fuel delivery, pricing, orders..."
            disabled={isLoading}
            className="flex-1 border-gray-300 focus:border-orange-500"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="icon"
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
