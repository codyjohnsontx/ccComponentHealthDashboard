import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Strava Gear Health",
  description:
    "Bike-tagged ride history translated into component wear tracking and retailer price comparison."
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
