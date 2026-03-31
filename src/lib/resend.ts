import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendApprovalEmail(to: string, orderId: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Math Platform <onboarding@resend.dev>',
      to: [to],
      subject: 'Your Lesson is Ready! (Secure Math)',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb;">Payment Approved!</h2>
          <p>Hello,</p>
          <p>Your payment for the math lesson has been verified. You can now access your video.</p>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #92400e;">⚠️ CRITICAL ACCESS RULES:</p>
            <ul style="color: #92400e; margin: 10px 0 0 0;">
              <li>You have <b>24 hours</b> to watch the video from the moment you first click play.</li>
              <li>You can only open the video <b>2 times</b> total.</li>
              <li>Sharing your account will result in permanent suspension (One-Screen Policy).</li>
            </ul>
          </div>

          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/watch/${orderId}" 
             style="display: inline-block; background-color: #2563eb; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Start Learning Now
          </a>

          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            Reference ID: ${orderId}<br>
            If you have any questions, please contact your teacher via the platform chat.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend Error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Send Email Error:', error);
    return { success: false, error: error.message };
  }
}
