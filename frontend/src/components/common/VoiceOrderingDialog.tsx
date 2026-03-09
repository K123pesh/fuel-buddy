import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface VoiceOrderingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
}

interface Message {
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export const VoiceOrderingDialog = ({ open, onOpenChange, userId }: VoiceOrderingDialogProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open && !sessionId) {
      initializeVoiceSession();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [open]);

  const initializeVoiceSession = async () => {
    try {
      // Create voice session
      const response = await fetch('/api/voice/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create voice session');
      }

      const data = await response.json();
      setSessionId(data.sessionId);

      // Connect WebSocket
      const wsUrl = data.wsUrl;
      console.log('Connecting to WebSocket:', wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        toast.success('Connected to voice assistant');
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setIsListening(false);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Connection error. Please try again.');
        setIsConnected(false);
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.type === 'assistant' || message.type === 'error') {
          const newMessage: Message = {
            type: message.type === 'error' ? 'system' : 'assistant',
            content: message.message,
            timestamp: new Date()
          };

          setMessages(prev => [...prev, newMessage]);

          // Convert text to speech if not muted
          if (!isMuted && message.type === 'assistant') {
            speakText(message.message);
          }
        } else if (message.type === 'order_confirmed') {
          const newMessage: Message = {
            type: 'assistant',
            content: message.message,
            timestamp: new Date()
          };

          setMessages(prev => [...prev, newMessage]);

          if (!isMuted) {
            speakText(message.message);
          }

          toast.success('Order placed successfully!');
          setTimeout(() => onOpenChange(false), 3000);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsListening(false);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Connection error. Please try again.');
        setIsConnected(false);
      };

      wsRef.current = ws;

    } catch (error) {
      console.error('Error initializing voice session:', error);
      // Provide a fallback mode when backend is not available
      toast.warning('Voice service unavailable. Using demo mode.');
      
      // Set up demo mode with mock session ID
      setSessionId('demo-session-' + Math.random().toString(36).substr(2, 9));
      setIsConnected(true);
      
      // Add a welcome message
      const welcomeMessage: Message = {
        type: 'assistant',
        content: 'Welcome to the voice ordering demo! Since the backend service is not available, I\'m running in demo mode. You can click the microphone to see simulated responses.',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  };

  const startListening = async () => {
    if (!isConnected) return;

    // Check if we're in demo mode (no WebSocket connection)
    if (!wsRef.current) {
      // Simulate voice recognition in demo mode
      setIsListening(true);
      toast.info('Listening... Speak now (Demo Mode)');
      
      // Add a simulated response after a delay
      setTimeout(() => {
        const simulatedResponses = [
          "I heard you'd like to order fuel. Could you tell me what type of fuel you need?",
          "I understand you want to place an order. What fuel type would you prefer - petrol or diesel?",
          "Got it! For your fuel order, could you specify the quantity you need?"
        ];
        
        const simulatedResponse: Message = {
          type: 'assistant',
          content: simulatedResponses[Math.floor(Math.random() * simulatedResponses.length)],
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, simulatedResponse]);
        setIsListening(false);
      }, 2000);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];

        // Send audio to server using FormData for better compatibility
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.webm');

        // Send as binary data instead of base64
        const reader = new FileReader();
        reader.onload = () => {
          const arrayBuffer = reader.result as ArrayBuffer;
          wsRef.current?.send(JSON.stringify({
            type: 'audio',
            audio: Array.from(new Uint8Array(arrayBuffer))
          }));
        };
        reader.readAsArrayBuffer(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms
      setIsListening(true);

      toast.info('Listening... Speak now');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone');
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsListening(false);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      speechSynthesis.speak(utterance);
    }
  };

  const toggleMute = () => {
    if (isSpeaking && 'speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setIsMuted(!isMuted);
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setIsConnected(false);
    setIsListening(false);
    setMessages([]);
    setSessionId(null);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Voice Ordering Assistant
          </DialogTitle>
          <DialogDescription>
            {isConnected
              ? "Speak naturally to place your fuel order"
              : "Connecting to voice assistant..."
            }
          </DialogDescription>
        </DialogHeader>

        {/* Connection Status */}
        <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <Badge variant={isListening ? "default" : "secondary"}>
            {isListening ? 'Listening' : 'Idle'}
          </Badge>
        </div>

        {/* Messages */}
        <Card className="flex-1 overflow-hidden">
          <CardContent className="p-4 h-64 overflow-y-auto">
            <div className="space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Mic className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Click the microphone button to start</p>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : message.type === 'system'
                          ? 'bg-destructive text-destructive-foreground'
                          : 'bg-muted'
                      }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleMute}
            className="flex items-center gap-2"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {isMuted ? 'Unmute' : 'Mute'}
          </Button>

          <Button
            size="lg"
            onClick={isListening ? stopListening : startListening}
            disabled={!isConnected}
            className={`flex items-center gap-2 ${isListening
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
              }`}
          >
            {isListening ? (
              <>
                <MicOff className="h-5 w-5" />
                Stop
              </>
            ) : (
              <>
                <Mic className="h-5 w-5" />
                Speak
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={disconnect}
            className="flex items-center gap-2"
          >
            <PhoneOff className="h-4 w-4" />
            End
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground text-center">
          Speak clearly about your fuel order: type, quantity, delivery address, and payment method
        </div>
      </DialogContent>
    </Dialog>
  );
};
