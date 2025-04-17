"use client"

import type { Wall, Player } from "@/lib/types"

interface WallPlacementProps {
  walls: Wall[]
  gridSize: number
  hoveredWall: { x: number; y: number; orientation: "horizontal" | "vertical" } | null
  setHoveredWall: (wall: { x: number; y: number; orientation: "horizontal" | "vertical" } | null) => void
  handleWallClick: (x: number, y: number, orientation: "horizontal" | "vertical") => void
  currentPlayer: string
  players: Record<string, Player>
  selectedAction: "move" | "wall"
  isLocalPlayerTurn: boolean
}

export default function WallPlacement({
  walls,
  gridSize,
  hoveredWall,
  setHoveredWall,
  handleWallClick,
  currentPlayer,
  players,
  selectedAction,
  isLocalPlayerTurn,
}: WallPlacementProps) {
  // Generate horizontal wall positions
  const horizontalWalls = []
  for (let row = 1; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const isWallPlaced = walls.some((wall) => wall.x === col && wall.y === row && wall.orientation === "horizontal")

      const isHovered =
        hoveredWall && hoveredWall.x === col && hoveredWall.y === row && hoveredWall.orientation === "horizontal"

      horizontalWalls.push(
        <div
          key={`h-wall-${row}-${col}`}
          className={`absolute transition-colors ${selectedAction === "wall" && isLocalPlayerTurn ? "cursor-pointer" : ""} ${
            isWallPlaced
              ? "bg-slate-800"
              : isHovered && selectedAction === "wall" && isLocalPlayerTurn
                ? "bg-current-player"
                : selectedAction === "wall" && isLocalPlayerTurn
                  ? "bg-transparent hover:bg-slate-300"
                  : "bg-transparent"
          }`}
          style={{
            top: `${(row * 100) / gridSize}%`,
            left: `${(col * 100) / gridSize}%`,
            width: `${100 / gridSize}%`,
            height: "6px", // Slightly thinner for better appearance
            marginTop: "-3px", // Adjusted for thickness
            backgroundColor: isWallPlaced
              ? walls.find((w) => w.x === col && w.y === row && w.orientation === "horizontal")?.color
              : isHovered && selectedAction === "wall" && isLocalPlayerTurn
                ? players[currentPlayer].color
                : "",
            zIndex: 5,
          }}
          onMouseEnter={() =>
            selectedAction === "wall" &&
            isLocalPlayerTurn &&
            setHoveredWall({ x: col, y: row, orientation: "horizontal" })
          }
          onMouseLeave={() => setHoveredWall(null)}
          onClick={() => isLocalPlayerTurn && handleWallClick(col, row, "horizontal")}
        />,
      )
    }
  }

  // Generate vertical wall positions
  const verticalWalls = []
  for (let row = 0; row < gridSize; row++) {
    for (let col = 1; col < gridSize; col++) {
      const isWallPlaced = walls.some((wall) => wall.x === col && wall.y === row && wall.orientation === "vertical")

      const isHovered =
        hoveredWall && hoveredWall.x === col && hoveredWall.y === row && hoveredWall.orientation === "vertical"

      verticalWalls.push(
        <div
          key={`v-wall-${row}-${col}`}
          className={`absolute transition-colors ${selectedAction === "wall" && isLocalPlayerTurn ? "cursor-pointer" : ""} ${
            isWallPlaced
              ? "bg-slate-800"
              : isHovered && selectedAction === "wall" && isLocalPlayerTurn
                ? "bg-current-player"
                : selectedAction === "wall" && isLocalPlayerTurn
                  ? "bg-transparent hover:bg-slate-300"
                  : "bg-transparent"
          }`}
          style={{
            top: `${(row * 100) / gridSize}%`,
            left: `${(col * 100) / gridSize}%`,
            width: "6px", // Slightly thinner for better appearance
            height: `${100 / gridSize}%`,
            marginLeft: "-3px", // Adjusted for thickness
            backgroundColor: isWallPlaced
              ? walls.find((w) => w.x === col && w.y === row && w.orientation === "vertical")?.color
              : isHovered && selectedAction === "wall" && isLocalPlayerTurn
                ? players[currentPlayer].color
                : "",
            zIndex: 5,
          }}
          onMouseEnter={() =>
            selectedAction === "wall" &&
            isLocalPlayerTurn &&
            setHoveredWall({ x: col, y: row, orientation: "vertical" })
          }
          onMouseLeave={() => setHoveredWall(null)}
          onClick={() => isLocalPlayerTurn && handleWallClick(col, row, "vertical")}
        />,
      )
    }
  }

  return (
    <>
      {horizontalWalls}
      {verticalWalls}
    </>
  )
}
