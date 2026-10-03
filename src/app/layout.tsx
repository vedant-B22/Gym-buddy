import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { PwaProvider } from "@/components/pwa/PwaProvider";
import DemoBar from "@/components/auth/DemoBar";

export const metadata: Metadata = {
  title: "Iron Forge Fitness | Gym Management & Workout Tracking PWA",
  description: "Next-generation gym management, personal training, offline workout tracking, personal records, and community leaderboard.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Iron Forge",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#090D16",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased bg-[#090D16] text-slate-100 min-h-screen flex flex-col selection:bg-emerald-500 selection:text-black">
        <AuthProvider>
          <ThemeProvider>
            <PwaProvider>
              <DemoBar />
              <main className="flex-1 flex flex-col">
                {children}
              </main>
            </PwaProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
