import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DarkModeProvider } from "./context/DarkModeContext";
import { PresenceProvider } from "./context/PresenceContext";
import { ToastProvider } from "./dashboard/components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Skill-Link | Community Service Connector",
  description: "Connect with talented people who share skills, knowledge, and opportunities. Find help or offer your expertise in your community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PresenceProvider>
          <DarkModeProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </DarkModeProvider>
        </PresenceProvider>
        <script src="https://js.pusher.com/7.0/pusher.min.js"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
      window.Pusher = new Pusher('${process.env.NEXT_PUBLIC_PUSHER_KEY}', { 
        cluster: '${process.env.NEXT_PUBLIC_PUSHER_CLUSTER}' 
      });
    `,
          }}
        />
      </body>
    </html>
  );
}
