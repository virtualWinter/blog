import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MainLayout } from "@/components/layout";
import { Providers } from "@/components/providers";
import "./globals.css";
import { Provider } from "@radix-ui/react-tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "vWinter's smol portfolio",
  description: "Just another basic portfolio with blog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Provider>
            <MainLayout>
              {children}
            </MainLayout>
          </Provider>
        </Providers>
      </body>
    </html>
  );
}
