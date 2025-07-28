import type {
  WelcomeEmailData,
  ResetPasswordEmailData,
  ContactFormEmailData,
  EmailVerificationData,
  EmailOtpData,
  EmailTemplate
} from './types';

/**
 * Email templates for different types of notifications
 */
export const emailTemplates = {
  /**
   * Welcome email template for new users
   * @param data - Welcome email data containing name and email
   * @returns Email template with subject, HTML, and text content
   */
  welcome: ({ name, email }: WelcomeEmailData): EmailTemplate => ({
    subject: 'Welcome to Our Blog!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome, ${name}!</h1>
        <p>Thank you for joining our blog community. We're excited to have you on board!</p>
        <p>Your account has been successfully created with the email: <strong>${email}</strong></p>
        <p>You can now:</p>
        <ul>
          <li>Read our latest blog posts</li>
          <li>Comment on articles</li>
          <li>Interact with other community members</li>
        </ul>
        <p>Happy reading!</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          If you have any questions, feel free to contact us.
        </p>
      </div>
    `,
    text: `Welcome, ${name}!\n\nThank you for joining our blog community. We're excited to have you on board!\n\nYour account has been successfully created with the email: ${email}\n\nYou can now:\n- Read our latest blog posts\n- Comment on articles\n- Interact with other community members\n\nHappy reading!`,
  }),

  /**
   * Password reset email template
   * @param data - Reset password data containing name and reset link
   * @returns Email template with subject, HTML, and text content
   */
  resetPassword: ({ name, resetLink }: ResetPasswordEmailData): EmailTemplate => ({
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Password Reset Request</h1>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If you didn't request this password reset, you can safely ignore this email.</p>
        <p><strong>This link will expire in 1 hour.</strong></p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          ${resetLink}
        </p>
      </div>
    `,
    text: `Password Reset Request\n\nHi ${name},\n\nWe received a request to reset your password. Click the link below to create a new password:\n\n${resetLink}\n\nIf you didn't request this password reset, you can safely ignore this email.\n\nThis link will expire in 1 hour.`,
  }),

  /**
   * Contact form email template for admin notifications
   * @param data - Contact form data containing name, email, and message
   * @returns Email template with subject, HTML, and text content
   */
  contactForm: ({ name, email, message }: ContactFormEmailData): EmailTemplate => ({
    subject: `New Contact Form Submission from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">New Contact Form Submission</h1>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: white; padding: 15px; border-radius: 4px; margin-top: 10px;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        <p style="color: #666; font-size: 12px;">
          This message was sent from your blog's contact form.
        </p>
      </div>
    `,
    text: `New Contact Form Submission\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
  }),

  /**
   * Email verification template for new accounts
   * @param data - Email verification data containing name and verification link
   * @returns Email template with subject, HTML, and text content
   */
  emailVerification: ({ name, verificationLink }: EmailVerificationData): EmailTemplate => ({
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Verify Your Email Address</h1>
        <p>Hi ${name},</p>
        <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" 
             style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <p><strong>This link will expire in 24 hours.</strong></p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          ${verificationLink}
        </p>
      </div>
    `,
    text: `Verify Your Email Address\n\nHi ${name},\n\nThank you for signing up! Please verify your email address by clicking the link below:\n\n${verificationLink}\n\nIf you didn't create an account, you can safely ignore this email.\n\nThis link will expire in 24 hours.`,
  }),

  /**
   * Email OTP template for two-factor authentication
   * @param data - Email OTP data containing name and verification code
   * @returns Email template with subject, HTML, and text content
   */
  emailOtp: ({ name, code }: EmailOtpData): EmailTemplate => ({
    subject: 'Your Sign-In Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Your Sign-In Code</h1>
        <p>Hi ${name},</p>
        <p>Use this code to complete your sign-in:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; display: inline-block;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #495057;">${code}</span>
          </div>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, you can safely ignore this email.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `,
    text: `Your Sign-In Code\n\nHi ${name},\n\nUse this code to complete your sign-in: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, you can safely ignore this email.`,
  }),
};