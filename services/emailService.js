const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS  // Your app password
    }
  });
};

// Send email verification code
const sendEmailVerificationCode = async (email, name, verificationCode) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Your App'}" <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Email Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Email Verification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
            <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eee;">
              <h1 style="color: #333; margin: 0;">${process.env.FROM_NAME || 'Your App'}</h1>
            </div>
            
            <div style="padding: 30px 20px;">
              <h2 style="color: #333; margin-bottom: 20px;">Hi ${name},</h2>
              
              <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                Thank you for signing up! Please use the verification code below to verify your email address:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; background-color: #f8f9fa; border: 2px dashed #007bff; padding: 20px 30px; border-radius: 8px;">
                  <span style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 4px;">${verificationCode}</span>
                </div>
              </div>
              
              <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                This code will expire in <strong>10 minutes</strong>. If you didn't create an account, please ignore this email.
              </p>
              
              <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #856404; font-size: 14px;">
                  <strong>Security tip:</strong> Never share this code with anyone. We will never ask for your verification code.
                </p>
              </div>
            </div>
            
            <div style="text-align: center; padding: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
              <p style="margin: 0;">This email was sent to ${email}</p>
              <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} ${process.env.FROM_NAME || 'Your App'}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hi ${name},
        
        Thank you for signing up! Please use the verification code below to verify your email address:
        
        Verification Code: ${verificationCode}
        
        This code will expire in 10 minutes. If you didn't create an account, please ignore this email.
        
        Never share this code with anyone. We will never ask for your verification code.
        
        This email was sent to ${email}
        © ${new Date().getFullYear()} ${process.env.FROM_NAME || 'Your App'}. All rights reserved.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email verification code sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email verification code:', error);
    throw new Error('Failed to send verification email');
  }
};

// Send welcome email after successful verification
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Your App'}" <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome! Your email has been verified',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Welcome!</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
            <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eee;">
              <h1 style="color: #333; margin: 0;">${process.env.FROM_NAME || 'Your App'}</h1>
            </div>
            
            <div style="padding: 30px 20px; text-align: center;">
              <h2 style="color: #28a745; margin-bottom: 20px;">🎉 Welcome, ${name}!</h2>
              
              <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                Your email address has been successfully verified. You can now enjoy all the features of our platform.
              </p>
              
              <div style="margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || '#'}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Get Started
                </a>
              </div>
            </div>
            
            <div style="text-align: center; padding: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
              <p style="margin: 0;">© ${new Date().getFullYear()} ${process.env.FROM_NAME || 'Your App'}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome, ${name}!
        
        Your email address has been successfully verified. You can now enjoy all the features of our platform.
        
        © ${new Date().getFullYear()} ${process.env.FROM_NAME || 'Your App'}. All rights reserved.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome email as it's not critical
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmailVerificationCode,
  sendWelcomeEmail
};