import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { StartupProvider } from "@/context/startup-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "AI Startup Co-Founder | Your Virtual Business Partner",
  description:
    "AI-powered startup platform that acts as your virtual co-founder - from idea validation to scaling your business",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased selection:bg-primary/20`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StartupProvider>
            <Suspense fallback={null}>{children}</Suspense>
          </StartupProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
