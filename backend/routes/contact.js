import express from 'express';
import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Import email service
import nodemailer from 'nodemailer';

// Check if required environment variables are set
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn('⚠️  Email service not configured. Please set EMAIL_USER and EMAIL_PASS in your .env file for email functionality.');
}

// Contact form endpoint
router.post('/send', asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validate required fields
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ 
      message: 'All fields are required: name, email, subject, message' 
    });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      message: 'Please provide a valid email address' 
    });
  }

  try {
    // Create transporter using environment variables
    const transporter = nodemailer.createTransporter({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.CONTACT_RECIPIENT || process.env.EMAIL_USER,
      subject: `[Fuel Buddy] ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: 'Message sent successfully' 
    });
  } catch (error) {
    console.error('Email sending error:', error);
    if (error.code === 'EAUTH' || error.message.includes('authentication')) {
      res.status(500).json({ 
        message: 'Email service configuration error. Please contact administrator.' 
      });
    } else if (error.message.includes('network')) {
      res.status(500).json({ 
        message: 'Network error connecting to email service. Please try again later.' 
      });
    } else {
      res.status(500).json({ 
        message: 'Failed to send message due to server error. Please try again later.' 
      });
    }
  }
}));

export default router;