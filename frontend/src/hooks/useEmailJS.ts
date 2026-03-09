import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import emailjsService from '@/services/emailjsService';

interface UseEmailJSReturn {
  sendEmail: (templateParams: Record<string, string>) => Promise<void>;
  sendFuelDeliveryConfirmation: (userEmail: string, orderDetails: any) => Promise<void>;
  sendOrderStatusUpdate: (userEmail: string, orderDetails: any, status: string) => Promise<void>;
  sendWelcomeEmail: (userEmail: string, userName: string) => Promise<void>;
  sendContactForm: (formData: any) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useEmailJS = (): UseEmailJSReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const sendEmail = async (templateParams: Record<string, string>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await emailjsService.sendEmail(templateParams);
      toast({
        title: "Email Sent Successfully",
        description: "Your message has been delivered.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send email";
      setError(errorMessage);
      toast({
        title: "Email Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const sendFuelDeliveryConfirmation = async (userEmail: string, orderDetails: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await emailjsService.sendFuelDeliveryConfirmation(userEmail, orderDetails);
      toast({
        title: "Confirmation Sent",
        description: "Fuel delivery confirmation email has been sent.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send confirmation";
      setError(errorMessage);
      toast({
        title: "Confirmation Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const sendOrderStatusUpdate = async (userEmail: string, orderDetails: any, status: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await emailjsService.sendOrderStatusUpdate(userEmail, orderDetails, status);
      toast({
        title: "Status Update Sent",
        description: `Order status update (${status}) has been sent.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send status update";
      setError(errorMessage);
      toast({
        title: "Status Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const sendWelcomeEmail = async (userEmail: string, userName: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await emailjsService.sendWelcomeEmail(userEmail, userName);
      toast({
        title: "Welcome Email Sent",
        description: "Welcome email has been sent successfully.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send welcome email";
      setError(errorMessage);
      toast({
        title: "Welcome Email Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const sendContactForm = async (formData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await emailjsService.sendContactForm(formData);
      toast({
        title: "Message Sent",
        description: "Your contact form has been submitted successfully.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send message";
      setError(errorMessage);
      toast({
        title: "Message Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendEmail,
    sendFuelDeliveryConfirmation,
    sendOrderStatusUpdate,
    sendWelcomeEmail,
    sendContactForm,
    isLoading,
    error
  };
};

export default useEmailJS;
