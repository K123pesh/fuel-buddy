import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';

const EmailJSTest: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');

  const initializeEmailJS = () => {
    if (import.meta.env.VITE_EMAILJS_PUBLIC_KEY) {
      emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
      console.log('EmailJS initialized with public key:', import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
    } else {
      console.error('EmailJS public key not found');
    }
  };

  const testEmailJS = async () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setIsLoading(true);
    
    try {
      // Initialize EmailJS if not already done
      initializeEmailJS();
      
      // Generate test OTP
      const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setOtp(testOtp);
      
      console.log('Testing EmailJS with:', {
        serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
        templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
        email: email,
        otp: testOtp
      });

      const response = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          to_email: email,
          otp_code: testOtp,
          to_name: email.split('@')[0],
          message: `Your verification code is: ${testOtp}`,
          subject: 'Email Verification Code Test'
        }
      );

      console.log('EmailJS response:', response);
      toast.success(`Test email sent! Check your inbox. OTP: ${testOtp}`);
      
    } catch (error: any) {
      console.error('EmailJS error details:', error);
      toast.error(`EmailJS failed: ${error.text || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkConfiguration = () => {
    const config = {
      serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
      templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    };
    
    console.log('EmailJS Configuration:', config);
    
    const isConfigured = Object.values(config).every(value => value && value !== 'your_service_id_here');
    
    if (isConfigured) {
      toast.success('EmailJS is properly configured!');
    } else {
      toast.error('EmailJS is not properly configured. Check environment variables.');
    }
    
    return config;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>EmailJS Test</CardTitle>
        <CardDescription>
          Test your EmailJS configuration for OTP sending
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="test-email" className="text-sm font-medium">Test Email</label>
          <Input
            id="test-email"
            type="email"
            placeholder="Enter your email to test"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Button onClick={testEmailJS} disabled={isLoading} className="w-full">
            {isLoading ? 'Sending...' : 'Send Test OTP'}
          </Button>
          
          <Button onClick={checkConfiguration} variant="outline" className="w-full">
            Check Configuration
          </Button>
        </div>
        
        {otp && (
          <div className="p-3 bg-gray-100 rounded text-sm">
            <strong>Generated OTP:</strong> {otp}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          <p>Check the browser console for detailed logs.</p>
          <p>Make sure your EmailJS template includes these variables:</p>
          <ul className="list-disc list-inside mt-1">
            <li>{'{{to_email}}'}</li>
            <li>{'{{otp_code}}'}</li>
            <li>{'{{to_name}}'}</li>
            <li>{'{{message}}'}</li>
            <li>{'{{subject}}'}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailJSTest;
