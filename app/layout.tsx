import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ride-Based Component Health",
  description: "Demo MVP for ride-based cycling component tracking."
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
