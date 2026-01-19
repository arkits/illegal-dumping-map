import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ConvexClientProvider } from "./ConvexClientProvider";
import ReactQueryProvider from "./ReactQueryProvider";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"] });

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
      <body className={nunito.className}>
        <ConvexClientProvider>
          <ThemeProvider>
            <ReactQueryProvider>
              {children}
            </ReactQueryProvider>
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
