import { apiClient } from '@/lib/api';

class EmailService {
  constructor() {
    // Backend service now handles emails securely
    console.log('Email service initialized - using backend API');
  }

  // Send email using backend API
  async sendEmail(templateParams) {
    try {
      // This method is kept for compatibility but will use the new backend endpoint
      // The actual implementation depends on the specific email type
      console.warn('Direct email sending deprecated. Use specific methods instead.');
      return { success: true };
    } catch (error) {
      console.error('Email error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  // Send fuel delivery confirmation email
  async sendFuelDeliveryConfirmation(userEmail, orderDetails) {
    try {
      const response = await apiClient.post('/contact/send', {
        name: orderDetails.customerName || 'Customer',
        email: userEmail,
        subject: `Fuel Delivery Confirmation - Order ${orderDetails.orderId}`,
        message: `Your fuel delivery order has been processed.\n\nOrder ID: ${orderDetails.orderId}\nFuel Type: ${orderDetails.fuelType}\nQuantity: ${orderDetails.quantity}\nDelivery Address: ${orderDetails.deliveryAddress}\nDelivery Time: ${orderDetails.deliveryTime}\nTotal Amount: ${orderDetails.totalAmount}`
      });
      return response;
    } catch (error) {
      console.error('Email error:', error);
      throw new Error(`Failed to send delivery confirmation: ${error.message}`);
    }
  }

  // Send order status update email
  async sendOrderStatusUpdate(userEmail, orderDetails, status) {
    try {
      const response = await apiClient.post('/contact/send', {
        name: orderDetails.customerName || 'Customer',
        email: userEmail,
        subject: `Order Status Update - ${status}`,
        message: `Your order status has been updated to ${status}.\n\nOrder ID: ${orderDetails.orderId}\nFuel Type: ${orderDetails.fuelType}\nQuantity: ${orderDetails.quantity}\nEstimated Delivery: ${orderDetails.estimatedDelivery || 'Not specified'}\nStatus: ${status}`
      });
      return response;
    } catch (error) {
      console.error('Email error:', error);
      throw new Error(`Failed to send order status update: ${error.message}`);
    }
  }

  // Send welcome email to new users
  async sendWelcomeEmail(userEmail, userName) {
    try {
      const response = await apiClient.post('/contact/send', {
        name: userName,
        email: userEmail,
        subject: 'Welcome to Fuel Buddy!',
        message: `Dear ${userName},\n\nWelcome to Fuel Buddy! We're excited to have you as a member of our community.\n\nWith Fuel Buddy, you can enjoy convenient fuel delivery services right to your doorstep.\n\nIf you have any questions, feel free to reach out to our support team.\n\nBest regards,\nThe Fuel Buddy Team`
      });
      return response;
    } catch (error) {
      console.error('Email error:', error);
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }
  }

  // Send contact form submission
  async sendContactForm(formData) {
    try {
      const response = await apiClient.post('/contact/send', {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      });
      return response;
    } catch (error) {
      console.error('Email error:', error);
      throw new Error(`Failed to send contact form: ${error.message}`);
    }
  }

  // Update configuration (useful for multiple templates/services)
  updateConfig() {
    console.warn('Configuration updates not applicable - using backend API');
  }
}

export default new EmailService();
