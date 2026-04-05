import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pawtal — Bangkok's Pet Service Marketplace",
  description: "Discover off-peak deals on grooming, spa, boarding and more. Book in seconds, pay upfront.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
