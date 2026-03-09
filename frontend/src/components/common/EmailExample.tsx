import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useEmailJS } from '@/hooks/useEmailJS';

const EmailExample: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { sendWelcomeEmail, sendFuelDeliveryConfirmation, sendContactForm } = useEmailJS();

  // Example: Send welcome email
  const handleSendWelcomeEmail = async () => {
    try {
      setIsLoading(true);
      await sendWelcomeEmail('user@example.com', 'John Doe');
    } catch (error) {
      console.error('Welcome email failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Example: Send fuel delivery confirmation
  const handleSendDeliveryConfirmation = async () => {
    try {
      setIsLoading(true);
      const orderDetails = {
        orderId: 'ORD-12345',
        fuelType: 'Petrol',
        quantity: '20 liters',
        deliveryAddress: '123 Main St, City',
        deliveryTime: '2024-02-15 10:00 AM',
        totalAmount: '₹4,150.00',
        customerName: 'John Doe'
      };
      
      await sendFuelDeliveryConfirmation('customer@example.com', orderDetails);
    } catch (error) {
      console.error('Delivery confirmation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Example: Send contact form
  const handleSendContactForm = async () => {
    try {
      setIsLoading(true);
      const formData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        subject: 'Fuel Delivery Inquiry',
        message: 'I would like to know more about your fuel delivery services.'
      };
      
      await sendContactForm(formData);
    } catch (error) {
      console.error('Contact form failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>EmailJS Integration Examples</CardTitle>
          <CardDescription>
            Test different email functionalities using EmailJS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Welcome Email</h3>
            <p className="text-sm text-muted-foreground">
              Send a welcome email to new users
            </p>
            <Button 
              onClick={handleSendWelcomeEmail}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? 'Sending...' : 'Send Welcome Email'}
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Delivery Confirmation</h3>
            <p className="text-sm text-muted-foreground">
              Send fuel delivery confirmation to customers
            </p>
            <Button 
              onClick={handleSendDeliveryConfirmation}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? 'Sending...' : 'Send Delivery Confirmation'}
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Contact Form</h3>
            <p className="text-sm text-muted-foreground">
              Submit a contact form inquiry
            </p>
            <Button 
              onClick={handleSendContactForm}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? 'Sending...' : 'Send Contact Form'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Sign up at <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">EmailJS</a></li>
            <li>Create an email service (Gmail, Outlook, etc.)</li>
            <li>Create an email template with variables like <code className="bg-gray-100 px-1 rounded">{'{to_email}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{to_name}'}</code>, etc.</li>
            <li>Update your <code className="bg-gray-100 px-1 rounded">frontend/.env</code> file with:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li><code className="bg-gray-100 px-1 rounded">VITE_EMAILJS_SERVICE_ID</code></li>
                <li><code className="bg-gray-100 px-1 rounded">VITE_EMAILJS_TEMPLATE_ID</code></li>
                <li><code className="bg-gray-100 px-1 rounded">VITE_EMAILJS_PUBLIC_KEY</code></li>
              </ul>
            </li>
            <li>Create email templates with variables like {'{to_email}'}, {'{to_name}'}, etc.</li>
            <li>Restart your development server</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailExample;
