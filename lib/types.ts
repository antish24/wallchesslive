import type { Server as NetServer, Socket } from "net"
import type { NextApiResponse } from "next"
import type { Server as SocketIOServer } from "socket.io"

export interface Player {
  id: string
  position: [number, number]
  color: string
}

export interface Wall {
  x: number
  y: number
  orientation: "horizontal" | "vertical"
  color: string
}

export interface NextApiResponseServerIO extends NextApiResponse {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}
