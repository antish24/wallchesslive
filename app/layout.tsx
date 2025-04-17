import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { SocketProvider } from "@/components/socket-provider"

export const metadata: Metadata = {
  title: "Wall Chess Maze - Multiplayer",
  description: "A strategic maze-building game where players outmaneuver each other to reach the opposite side",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <SocketProvider>{children}</SocketProvider>
      </body>
    </html>
  )
}


import './globals.css'