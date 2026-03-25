import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LaunchTrack",
  description: "SaaS Implementation Intelligence Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}