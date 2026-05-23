import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bé Gấu",
  description: "begau.dev",
  icons: {
    icon: "/favicon_v2.png",
  },
};

import { GoogleOAuthProvider } from "@react-oauth/google";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const hasGoogleClientId =
  Boolean(googleClientId) &&
  googleClientId.endsWith(".apps.googleusercontent.com") &&
  !googleClientId.includes("mockclientid") &&
  !googleClientId.includes("REPLACE_WITH");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {hasGoogleClientId ? (
          <GoogleOAuthProvider clientId={googleClientId}>
            {children}
            <Toaster position="top-center" />
          </GoogleOAuthProvider>
        ) : (
          <>
            {children}
            <Toaster position="top-center" />
          </>
        )}
      </body>
    </html>
  );
}
