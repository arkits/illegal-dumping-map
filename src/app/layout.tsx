import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ReactQueryProvider from "./ReactQueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Illegal Dumping Map",
  description: "Visualize and analyze illegal dumping requests across California cities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">
        <ThemeProvider>
          <ReactQueryProvider>
            {children}
          </ReactQueryProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
