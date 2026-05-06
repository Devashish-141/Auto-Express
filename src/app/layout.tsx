import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { RepProvider } from "../context/RepContext";
import { ToastProvider } from "../context/ToastContext";
import ClientLayout from "../components/ClientLayout";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-open-sans",
});

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
    <html lang="en" className={openSans.variable}>
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
