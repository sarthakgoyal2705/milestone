import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Milestone",
  description: "The performance, people, and payroll platform for modern teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            unstyled: true,
            classNames: {
              toast:
                "flex items-center gap-3 rounded-md border border-hairline bg-ink-800 px-4 py-3 text-sm text-powder-100 shadow-[0_8px_30px_rgba(0,0,0,0.35)] font-sans",
              title: "font-medium",
              description: "text-muted",
              actionButton: "bg-rust text-powder-100 rounded-sm px-2 py-1",
              cancelButton: "bg-ink-700 text-powder-100 rounded-sm px-2 py-1",
            },
          }}
        />
      </body>
    </html>
  );
}
