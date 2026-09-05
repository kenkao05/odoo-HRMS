import "./globals.css";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display-family",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body-family",
  display: "swap",
});

export const metadata = { title: "PeoplePay360 — HR & Payroll" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${plexSans.variable}`}>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
