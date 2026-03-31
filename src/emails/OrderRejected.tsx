import {
  Button,
  Heading,
  Hr,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';

interface OrderRejectedEmailProps {
  studentName?: string;
  orderId: string;
  reason?: string;
  reuploadUrl: string;
}

export const OrderRejectedEmail = ({
  studentName = 'Student',
  orderId,
  reason = 'The provided receipt was unclear or invalid.',
  reuploadUrl,
}: OrderRejectedEmailProps) => {
  return (
    <EmailLayout preview="Action required: There was an issue with your payment.">
      <Section style={content}>
        <Heading style={h1}>Payment Issue Detected ❌</Heading>
        <Text style={text}>Hello {studentName},</Text>
        <Text style={text}>
          We've reviewed your payment receipt for order **{orderId}**, but we've
          encountered an issue and cannot approve your access yet.
        </Text>
        
        <Section style={rejectCard}>
          <Text style={rejectTitle}>REASON FOR REJECTION:</Text>
          <Text style={rejectText}>"{reason}"</Text>
        </Section>

        <Text style={text}>
          Don't worry! You can easily fix this by re-uploading a clear screenshot
          of your transaction or a valid payment code.
        </Text>

        <Section style={ctaSection}>
          <Button style={button} href={reuploadUrl}>
            Re-upload Receipt
          </Button>
        </Section>

        <Hr style={hr} />
        <Text style={subtext}>
          If you believe this is a mistake, please contact support via the
          platform's internal messaging system.
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
  backgroundColor: '#ef4444',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  padding: '12px 24px',
  display: 'inline-block',
};

const rejectCard = {
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
  border: '1px solid #fee2e2',
};

const rejectTitle = {
  fontSize: '12px',
  color: '#991b1b',
  fontWeight: 'bold',
  margin: '0 0 4px',
};

const rejectText = {
  fontSize: '14px',
  color: '#991b1b',
  lineHeight: '20px',
  margin: '0',
  fontStyle: 'italic',
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

export default OrderRejectedEmail;
