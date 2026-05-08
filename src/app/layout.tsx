import type { Metadata } from "next";
import "./globals.css";
import { RepProvider } from "../context/RepContext";
import { ToastProvider } from "../context/ToastContext";
import ClientLayout from "../components/ClientLayout";

export const metadata: Metadata = {
  title: "AutoExpress",
  description: "AutoExpress",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.cdnfonts.com/css/helvetica-neue-55" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
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
