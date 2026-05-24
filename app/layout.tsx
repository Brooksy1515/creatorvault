import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CreatorVault",
  description: "Creator content vault and affiliate production hub",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
