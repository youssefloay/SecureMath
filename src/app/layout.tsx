import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Background } from '@/components/layout/Background';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Secure Math Platform',
  description: 'High Security EdTech Marketplace',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen transition-all duration-500`}>
        <AuthProvider>
          <Background />
          <Navbar />
          <main className="relative z-0">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
