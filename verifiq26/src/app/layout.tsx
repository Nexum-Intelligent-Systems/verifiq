import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider, noFlashThemeScript } from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "VerifIQ — Know before you build",
  description:
    "VerifIQ gives Irish project teams a structured, evidence-based answer to one question: are we actually ready to build?",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Set the theme before first paint to avoid a flash of the wrong theme. */}
        <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
