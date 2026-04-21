import type { Metadata } from "next";
import "./globals.css";
import { RepProvider } from "../context/RepContext";
import { ToastProvider } from "../context/ToastContext";
import ClientLayout from "../components/ClientLayout";

export const metadata: Metadata = {
  title: "Auto Express Ireland",
  description: "Unified Stock & Garage Manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <RepProvider>
          <ToastProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
          </ToastProvider>
        </RepProvider>
      </body>
    </html>
  );
}
