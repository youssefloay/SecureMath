import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import * as React from 'react';
import { OrderApprovedEmail } from '@/emails/OrderApproved';
import { ReceiptReceivedEmail } from '@/emails/ReceiptReceived';
import { OrderRejectedEmail } from '@/emails/OrderRejected';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const FROM_EMAIL = `Math Platform <${process.env.GMAIL_USER}>`;

export async function sendApprovalEmail(to: string, orderId: string, studentName: string, videoTitle: string) {
  try {
    const watchUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/watch/${orderId}`;
    
    const emailHtml = await render(
        React.createElement(OrderApprovedEmail, {
          studentName,
          orderId,
          videoTitle,
          watchUrl,
        })
    );

    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject: `✅ Lesson Ready: ${videoTitle}`,
      html: emailHtml,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error sending approval email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendReceiptEmail(to: string, orderId: string, studentName: string) {
  try {
    const emailHtml = await render(
      React.createElement(ReceiptReceivedEmail, {
        studentName,
        orderId,
      })
    );

    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject: `🧾 Receipt Received: ${orderId}`,
      html: emailHtml,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error sending receipt email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendRejectionEmail(to: string, orderId: string, studentName: string, reason: string) {
  try {
    const reuploadUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard`;
    
    const emailHtml = await render(
      React.createElement(OrderRejectedEmail, {
        studentName,
        orderId,
        reason,
        reuploadUrl,
      })
    );

    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject: `❌ Payment Issue: Order #${orderId}`,
      html: emailHtml,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error sending rejection email:', error);
    return { success: false, error: error.message };
  }
}
