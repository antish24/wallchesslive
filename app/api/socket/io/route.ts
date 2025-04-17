import type { Server as NetServer } from "http"
import type { NextRequest } from "next/server"
import { Server as ServerIO } from "socket.io"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

const gameRooms = new Map()

export async function GET(req: NextRequest) {
  try {
    const res = new Response(null)
    const server = res.socket?.server as any

    if (!server.io) {
      console.log("New Socket.io server...")
      // adapt Next's net Server to socket.io
      const httpServer: NetServer = server
      const io = new ServerIO(httpServer, {
        path: "/api/socket/io",
        addTrailingSlash: false,
      })

      // Socket.io server
      io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`)

        // Handle joining a game
        socket.on("joinGame", ({ gameId, playerName, isHost }) => {
          // Check if the game exists
          if (!gameRooms.has(gameId) && !isHost) {
            socket.emit("gameError", { message: "Game not found" })
            return
          }

          // Create a new game if it doesn't exist
          if (!gameRooms.has(gameId)) {
            gameRooms.set(gameId, {
              players: [{ id: socket.id, name: playerName, isHost: true }],
              gameState: {
                gridSize: 9,
                currentPlayer: "player1",
                players: {
                  player1: {
                    id: "player1",
                    position: [8, 4],
                    color: "#3b82f6", // blue
                  },
                  player2: {
                    id: "player2",
                    position: [0, 4],
                    color: "#ef4444", // red
                  },
                },
                walls: [],
                wallsRemaining: {
                  player1: 10,
                  player2: 10,
                },
                gameState: "playing",
                selectedAction: "move",
              },
            })

            // Join the room
            socket.join(gameId)
            socket.emit("gameJoined", { status: "waiting" })
            return
          }

          // Get the game room
          const gameRoom = gameRooms.get(gameId)

          // Check if the game is full
          if (gameRoom.players.length >= 2) {
            socket.emit("gameError", { message: "Game is full" })
            return
          }

          // Add the player to the game
          gameRoom.players.push({ id: socket.id, name: playerName, isHost: false })

          // Join the room
          socket.join(gameId)

          // Notify the host that a player has joined
          const host = gameRoom.players.find((p) => p.isHost)
          io.to(host.id).emit("playerJoined", { playerName })

          // Notify the player that they've joined
          socket.emit("gameJoined", {
            status: "playing",
            opponent: host.name,
            gameState: gameRoom.gameState,
          })
        })

        // Handle game actions
        socket.on("gameAction", ({ gameId, action, data }) => {
          if (!gameRooms.has(gameId)) return

          const gameRoom = gameRooms.get(gameId)
          const player = gameRoom.players.find((p) => p.id === socket.id)

          if (!player) return

          // Update game state based on action
          if (action === "movePlayer") {
            const { playerId, position } = data
            gameRoom.gameState.players[playerId].position = position
            gameRoom.gameState.currentPlayer = playerId === "player1" ? "player2" : "player1"
          } else if (action === "placeWall") {
            const { x, y, orientation } = data
            const currentPlayer = gameRoom.gameState.currentPlayer

            // Add the wall
            gameRoom.gameState.walls.push({
              x,
              y,
              orientation,
              color: gameRoom.gameState.players[currentPlayer].color,
            })

            // Update walls remaining
            gameRoom.gameState.wallsRemaining[currentPlayer]--

            // Switch player
            gameRoom.gameState.currentPlayer = currentPlayer === "player1" ? "player2" : "player1"
            gameRoom.gameState.selectedAction = "move"
          } else if (action === "setSelectedAction") {
            gameRoom.gameState.selectedAction = data.selectedAction
          }

          // Broadcast updated game state to all players in the room
          io.to(gameId).emit("gameStateUpdate", gameRoom.gameState)
        })

        // Handle game win
        socket.on("gameWin", ({ gameId, winner }) => {
          if (!gameRooms.has(gameId)) return

          const gameRoom = gameRooms.get(gameId)
          gameRoom.gameState.gameState = "finished"

          // Broadcast game over to all players in the room
          io.to(gameId).emit("gameOver", { winner })
        })

        // Handle reset game
        socket.on("resetGame", ({ gameId }) => {
          if (!gameRooms.has(gameId)) return

          const gameRoom = gameRooms.get(gameId)

          // Reset game state
          gameRoom.gameState = {
            gridSize: 9,
            currentPlayer: "player1",
            players: {
              player1: {
                id: "player1",
                position: [8, 4],
                color: "#3b82f6", // blue
              },
              player2: {
                id: "player2",
                position: [0, 4],
                color: "#ef4444", // red
              },
            },
            walls: [],
            wallsRemaining: {
              player1: 10,
              player2: 10,
            },
            gameState: "playing",
            selectedAction: "move",
          }

          // Broadcast updated game state to all players in the room
          io.to(gameId).emit("gameStateUpdate", gameRoom.gameState)
        })

        // Handle leaving a game
        socket.on("leaveGame", ({ gameId }) => {
          if (!gameRooms.has(gameId)) return

          const gameRoom = gameRooms.get(gameId)
          const playerIndex = gameRoom.players.findIndex((p) => p.id === socket.id)

          if (playerIndex !== -1) {
            // Remove the player from the game
            gameRoom.players.splice(playerIndex, 1)

            // Leave the room
            socket.leave(gameId)

            // If there are no players left, delete the game
            if (gameRoom.players.length === 0) {
              gameRooms.delete(gameId)
            } else {
              // Notify the other player that this player has left
              io.to(gameId).emit("playerLeft")
            }
          }
        })

        // Handle disconnection
        socket.on("disconnect", () => {
          console.log(`Socket disconnected: ${socket.id}`)

          // Find all games the player is in
          for (const [gameId, gameRoom] of gameRooms.entries()) {
            const playerIndex = gameRoom.players.findIndex((p) => p.id === socket.id)

            if (playerIndex !== -1) {
              // Remove the player from the game
              gameRoom.players.splice(playerIndex, 1)

              // If there are no players left, delete the game
              if (gameRoom.players.length === 0) {
                gameRooms.delete(gameId)
              } else {
                // Notify the other player that this player has left
                io.to(gameId).emit("playerLeft")
              }
            }
          }
        })
      })

      // Make the socket available
      server.io = io
    }

    return new Response("Socket.io server running", {
      status: 200,
    })
  } catch (error) {
    console.error("Socket.io server error:", error)
    return new Response("Socket.io server error", {
      status: 500,
    })
  }
}
