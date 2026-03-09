import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';

const EmailJSDebug: React.FC = () => {
  const [testEmail, setTestEmail] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[EmailJS Debug] ${message}`);
  };

  const testBasicEmailJS = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address');
      return;
    }

    addLog('Starting EmailJS test...');
    
    try {
      // Check environment variables
      const envVars = {
        VITE_EMAILJS_SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID,
        VITE_EMAILJS_TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        VITE_EMAILJS_PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      };
      
      addLog(`Environment variables: ${JSON.stringify(envVars, null, 2)}`);
      
      // Initialize EmailJS
      addLog('Initializing EmailJS...');
      emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
      addLog('EmailJS initialized');
      
      // Generate test OTP
      const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
      addLog(`Generated OTP: ${testOtp}`);
      
      // Test with different variable names
      const testParams = {
        to_email: testEmail,
        email: testEmail,
        recipient_email: testEmail,
        otp_code: testOtp,
        code: testOtp,
        verification_code: testOtp,
        otp: testOtp,
        to_name: testEmail.split('@')[0],
        name: testEmail.split('@')[0],
        recipient_name: testEmail.split('@')[0],
        message: `Your verification code is: ${testOtp}`,
        subject: 'Email Verification Test'
      };
      
      addLog(`Sending with parameters: ${JSON.stringify(testParams, null, 2)}`);
      
      const response = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        testParams
      );
      
      addLog(`EmailJS response: ${JSON.stringify(response, null, 2)}`);
      toast.success(`Test email sent! OTP: ${testOtp}`);
      
    } catch (error: any) {
      addLog(`Error: ${error.message}`);
      addLog(`Error details: ${JSON.stringify(error, null, 2)}`);
      toast.error(`EmailJS failed: ${error.text || error.message}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>EmailJS Debug Tool</CardTitle>
        <CardDescription>
          Debug EmailJS configuration and test email sending
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Test Email Address</label>
          <input
            type="email"
            placeholder="Enter email to test"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={testBasicEmailJS} className="flex-1">
            Test EmailJS
          </Button>
          <Button onClick={clearLogs} variant="outline">
            Clear Logs
          </Button>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Debug Logs:</h3>
          <div className="bg-gray-100 p-3 rounded text-xs font-mono max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Run a test to see details.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p><strong>Common EmailJS issues:</strong></p>
          <ul className="list-disc list-inside mt-1">
            <li>Template variables don't match (check your EmailJS template)</li>
            <li>Service not properly configured in EmailJS dashboard</li>
            <li>Public key incorrect or missing</li>
            <li>Email service (Gmail, etc.) not connected</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailJSDebug;
