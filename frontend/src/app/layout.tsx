import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
// import { AuthDebugPanel } from "@/components/auth";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CIMS - Candidate Information Management System",
  description: "Internal login system for AWC Asia White Collar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <AuthProvider>
          {children}
          {/*process.env.NODE_ENV === 'development' && <AuthDebugPanel />*/}
        </AuthProvider>
      </body>
    </html>
  );
}
