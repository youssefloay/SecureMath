import {
  Button,
  Heading,
  Hr,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';

interface ReceiptReceivedEmailProps {
  studentName?: string;
  orderId: string;
}

export const ReceiptReceivedEmail = ({
  studentName = 'Student',
  orderId,
}: ReceiptReceivedEmailProps) => {
  return (
    <EmailLayout preview="We've received your payment receipt!">
      <Section style={content}>
        <Heading style={h1}>Receipt Received 🧾</Heading>
        <Text style={text}>Hello {studentName},</Text>
        <Text style={text}>
          Thank you for uploading your payment receipt. Our team is currently
          verifying your transaction. This process typically takes **15-60 minutes**
          during business hours.
        </Text>
        <Section style={infoCard}>
          <Text style={infoLabel}>Order Reference:</Text>
          <Text style={infoValue}>{orderId}</Text>
        </Section>
        <Text style={text}>
          You will receive another email as soon as your access is approved and your
          video is ready to watch.
        </Text>
        <Hr style={hr} />
        <Text style={subtext}>
          If you have any questions, please reach out via the platform chat.
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

const infoCard = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
  border: '1px solid #e5e7eb',
};

const infoLabel = {
  fontSize: '12px',
  color: '#6b7280',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0',
};

const infoValue = {
  fontSize: '14px',
  color: '#111827',
  fontWeight: 'bold',
  fontFamily: 'monospace',
  margin: '4px 0 0',
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

export default ReceiptReceivedEmail;
