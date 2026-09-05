import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata = { title: "PeoplePay360" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F5EFE0]">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
