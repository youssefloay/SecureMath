import {
  Button,
  Heading,
  Hr,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';

interface OrderApprovedEmailProps {
  studentName?: string;
  orderId: string;
  videoTitle: string;
  watchUrl: string;
}

export const OrderApprovedEmail = ({
  studentName = 'Student',
  orderId,
  videoTitle,
  watchUrl,
}: OrderApprovedEmailProps) => {
  return (
    <EmailLayout preview="Your lesson is now ready to watch!">
      <Section style={content}>
        <Heading style={h1}>Lesson Access Granted ✅</Heading>
        <Text style={text}>Hello {studentName},</Text>
        <Text style={text}>
          Great news! Your payment has been verified. You now have full access to
          your math lesson: **{videoTitle}**.
        </Text>
        
        <Section style={ctaSection}>
          <Button style={button} href={watchUrl}>
            Watch Lesson Now
          </Button>
        </Section>

        <Section style={warningCard}>
          <Text style={warningTitle}>⚠️ CRITICAL ACCESS RULES:</Text>
          <Text style={warningText}>
            • **24-Hour Limit**: You have exactly 24 hours to watch the video from the moment you first click play.<br />
            • **2-View Max**: You can only open the video player 2 times total.<br />
            • **Anti-Piracy**: Your email and IP are watermarked on the video. Sharing your account will result in a permanent ban.
          </Text>
        </Section>

        <Text style={subtext}>
          Order Reference: {orderId}
        </Text>
        <Hr style={hr} />
        <Text style={subtext}>
          Happy learning! If you're stuck on a problem, message your teacher directly in the platform.
        </Text>
      </Section>
    </EmailLayout>
  );
};

const content = {
  padding: '0 32px',
};

const h1 = {
  color: '#484848',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const text = {
  color: '#484848',
  fontSize: '14px',
  lineHeight: '24px',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  padding: '12px 24px',
  display: 'inline-block',
};

const warningCard = {
  backgroundColor: '#fffbeb',
  borderRadius: '8px',
  padding: '20px',
  margin: '32px 0',
  border: '1px solid #fef3c7',
};

const warningTitle = {
  fontSize: '14px',
  color: '#92400e',
  fontWeight: 'bold',
  margin: '0 0 10px',
};

const warningText = {
  fontSize: '13px',
  color: '#92400e',
  lineHeight: '20px',
  margin: '0',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const subtext = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
};

export default OrderApprovedEmail;
