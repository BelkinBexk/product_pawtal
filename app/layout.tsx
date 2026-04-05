import type { Metadata } from "next";
import { Lexend_Deca } from "next/font/google";
import "./globals.css";

const lexend = Lexend_Deca({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-lexend",
});

export const metadata: Metadata = {
  title: "Pawtal — Bangkok's Pet Service Marketplace",
  description: "Discover off-peak deals on grooming, spa & pet care. Book in seconds, save up to 40%.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={lexend.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(regs) {
              regs.forEach(function(reg) { reg.unregister(); });
            });
          }
        `}} />
      </head>
      <body style={{ fontFamily: "var(--font-lexend), Arial, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
