import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export const EmailLayout = ({ preview, children }: EmailLayoutProps) => (
  <Html>
    <Head />
    <Preview>{preview}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          {/* Logo Placeholder - User can replace with their official logo URL */}
          <Text style={logoText}>Secure Math Platform</Text>
        </Section>
        
        {children}
        
        <Section style={footer}>
          <Text style={footerText}>
            © 2026 Secure Math EdTech. All rights reserved.
          </Text>
          <Text style={footerText}>
            You received this email because you are registered on our platform.
          </Text>
          <Hr style={hr} />
          <Text style={footerSubtitle}>
            High-Performance Learning • Zero Piracy Tolerance
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  padding: '32px',
};

const logoText = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#2563eb',
  margin: '0',
  textAlign: 'center' as const,
};

const footer = {
  padding: '0 32px',
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  margin: '4px 0',
};

const footerSubtitle = {
  color: '#8898aa',
  fontSize: '10px',
  fontWeight: 'bold',
  letterSpacing: '1px',
  textAlign: 'center' as const,
  textTransform: 'uppercase' as const,
  marginTop: '12px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};
