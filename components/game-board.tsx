"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import WallPlacement from "./wall-placement"
import GameControls from "./game-controls"
import { checkWinCondition, isValidMove } from "@/lib/game-logic"
import { useSocket } from "./socket-provider"
import { Loader2 } from "lucide-react"

interface GameBoardProps {
  gameId: string
  playerName: string
  isHost: boolean
}

export default function GameBoard({ gameId, playerName, isHost }: GameBoardProps) {
  const { socket } = useSocket()
  const [gameState, setGameState] = useState({
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
  })

  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null)
  const [hoveredWall, setHoveredWall] = useState<{
    x: number
    y: number
    orientation: "horizontal" | "vertical"
  } | null>(null)

  // Local player is player1 if host, player2 if not
  const localPlayerId = isHost ? "player1" : "player2"
  const isLocalPlayerTurn = gameState.currentPlayer === localPlayerId

  useEffect(() => {
    if (!socket) return

    // Listen for game state updates
    socket.on("gameStateUpdate", (newGameState) => {
      setGameState(newGameState)
    })

    // Listen for game over
    socket.on("gameOver", ({ winner }) => {
      setGameState((prev) => ({
        ...prev,
        gameState: "finished",
        winner,
      }))
    })

    return () => {
      socket.off("gameStateUpdate")
      socket.off("gameOver")
    }
  }, [socket])

  // Check for win condition after each move
  useEffect(() => {
    if (gameState.gameState === "playing") {
      const winner = checkWinCondition(gameState.players, gameState.gridSize)
      if (winner) {
        socket?.emit("gameWin", { gameId, winner })
      }
    }
  }, [gameState.players, gameState.gridSize, gameState.gameState, socket, gameId])

  // Handle cell click for player movement
  const handleCellClick = (row: number, col: number) => {
    if (gameState.gameState !== "playing" || gameState.selectedAction !== "move" || !isLocalPlayerTurn) return

    const playerPosition = gameState.players[localPlayerId].position
    // Check if the move is valid (adjacent cell and not blocked by a wall)
    if (
      // Check if it's a valid adjacent cell (up, down, left, right)
      ((Math.abs(row - playerPosition[0]) === 1 && col === playerPosition[1]) ||
        (Math.abs(col - playerPosition[1]) === 1 && row === playerPosition[0])) &&
      isValidMove(playerPosition, [row, col], gameState.walls, gameState.gridSize)
    ) {
      // Emit move action to server
      socket?.emit("gameAction", {
        gameId,
        action: "movePlayer",
        data: {
          playerId: localPlayerId,
          position: [row, col],
        },
      })
    }
  }

  // Handle wall placement
  const handleWallClick = (x: number, y: number, orientation: "horizontal" | "vertical") => {
    if (gameState.gameState !== "playing" || gameState.selectedAction !== "wall" || !isLocalPlayerTurn) return

    if (gameState.wallsRemaining[localPlayerId] > 0) {
      // Check if there's already a wall at this position
      const wallExists = gameState.walls.some(
        (wall) => wall.x === x && wall.y === y && wall.orientation === orientation,
      )

      if (!wallExists) {
        // Emit wall placement action to server
        socket?.emit("gameAction", {
          gameId,
          action: "placeWall",
          data: { x, y, orientation },
        })
      }
    }
  }

  // Handle action selection
  const handleActionSelect = (action: "move" | "wall") => {
    if (!isLocalPlayerTurn) return

    socket?.emit("gameAction", {
      gameId,
      action: "setSelectedAction",
      data: { selectedAction: action },
    })
  }

  // Render grid cells with improved visual feedback
  const renderGrid = () => {
    const cells = []
    for (let row = 0; row < gameState.gridSize; row++) {
      for (let col = 0; col < gameState.gridSize; col++) {
        // Check if this cell contains a player
        const player1Here =
          gameState.players.player1.position[0] === row && gameState.players.player1.position[1] === col
        const player2Here =
          gameState.players.player2.position[0] === row && gameState.players.player2.position[1] === col
        const isPlayerCell = player1Here || player2Here

        const isValidMoveCell =
          isLocalPlayerTurn &&
          gameState.selectedAction === "move" &&
          ((Math.abs(row - gameState.players[localPlayerId].position[0]) === 1 &&
            col === gameState.players[localPlayerId].position[1]) ||
            (Math.abs(col - gameState.players[localPlayerId].position[1]) === 1 &&
              row === gameState.players[localPlayerId].position[0])) &&
          isValidMove(gameState.players[localPlayerId].position, [row, col], gameState.walls, gameState.gridSize)

        // Add special styling for starting and ending rows
        const isStartRow = row === gameState.gridSize - 1 // Bottom row (Player 1 start)
        const isEndRow = row === 0 // Top row (Player 1 goal)

        cells.push(
          <div
            key={`cell-${row}-${col}`}
            className={`relative border border-slate-200 ${
              isValidMoveCell && !isPlayerCell
                ? "bg-slate-100 cursor-pointer"
                : isStartRow
                  ? "bg-blue-50"
                  : isEndRow
                    ? "bg-red-50"
                    : ""
            }`}
            style={{ gridRow: row + 1, gridColumn: col + 1 }}
            onMouseEnter={() => setHoveredCell([row, col])}
            onMouseLeave={() => setHoveredCell(null)}
            onClick={() => handleCellClick(row, col)}
          >
            {/* Player tokens shown directly in the grid cells */}
            {player1Here && (
              <motion.div
                className="absolute rounded-full shadow-sm"
                style={{
                  backgroundColor: gameState.players.player1.color,
                  width: "70%",
                  height: "70%",
                  top: "15%",
                  left: "15%",
                }}
                initial={{ scale: 0 }}
                animate={{
                  scale: 1,
                  boxShadow: gameState.currentPlayer === "player1" ? "0 0 8px 2px rgba(0,0,0,0.2)" : "none",
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
                layout
              />
            )}
            {player2Here && (
              <motion.div
                className="absolute rounded-full shadow-sm"
                style={{
                  backgroundColor: gameState.players.player2.color,
                  width: "70%",
                  height: "70%",
                  top: "15%",
                  left: "15%",
                }}
                initial={{ scale: 0 }}
                animate={{
                  scale: 1,
                  boxShadow: gameState.currentPlayer === "player2" ? "0 0 8px 2px rgba(0,0,0,0.2)" : "none",
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
                layout
              />
            )}

            {isValidMoveCell && !isPlayerCell && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }} // Reduced opacity for move indicators
                className="absolute inset-0 rounded-full scale-50"
                style={{ backgroundColor: gameState.players[localPlayerId].color }}
              />
            )}
          </div>,
        )
      }
    }
    return cells
  }

  if (!socket) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      <div className="w-full bg-slate-50 p-3 rounded-md text-center">
        {isLocalPlayerTurn ? (
          <p className="font-medium text-slate-800">Your turn</p>
        ) : (
          <p className="text-slate-600">Waiting for opponent's move...</p>
        )}
      </div>

      <div className="relative w-full aspect-square max-w-md mx-auto">
        <div
          className="grid w-full h-full border border-slate-300 rounded-md overflow-hidden shadow-md"
          style={{
            gridTemplateRows: `repeat(${gameState.gridSize}, 1fr)`,
            gridTemplateColumns: `repeat(${gameState.gridSize}, 1fr)`,
          }}
        >
          {renderGrid()}

          {/* Wall placement overlay */}
          <WallPlacement
            walls={gameState.walls}
            gridSize={gameState.gridSize}
            hoveredWall={hoveredWall}
            setHoveredWall={setHoveredWall}
            handleWallClick={handleWallClick}
            currentPlayer={gameState.currentPlayer}
            players={gameState.players}
            selectedAction={gameState.selectedAction}
            isLocalPlayerTurn={isLocalPlayerTurn}
          />
        </div>
      </div>

      <div className="w-full max-w-md mx-auto">
        <GameControls
          gameState={gameState}
          localPlayerId={localPlayerId}
          isLocalPlayerTurn={isLocalPlayerTurn}
          onActionSelect={handleActionSelect}
          onResetGame={() => socket?.emit("resetGame", { gameId })}
        />
      </div>
    </div>
  )
}
