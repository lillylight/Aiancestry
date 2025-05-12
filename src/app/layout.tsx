import '@coinbase/onchainkit/styles.css';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./premium-upload.css";
import DisclaimerPopups from '../components/DisclaimerPopups';
import FloatingFooter from '../components/FloatingFooter';
import BetaTag from '../components/BetaTag';
import { Providers } from '../providers';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "aiancestry",
  description: "aiancestry - AI-powered ancestry analysis",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f7f8fa] min-h-screen`}>
        <Providers>
          <BetaTag />
          <DisclaimerPopups />
          {children}
          <FloatingFooter />
        </Providers>
      </body>
    </html>
  );
}
