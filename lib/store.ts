"use client"

import { create } from "zustand"
import type { Player, Wall } from "./types"

interface GameState {
  gridSize: number
  currentPlayer: string
  players: Record<string, Player>
  walls: Wall[]
  wallsRemaining: Record<string, number>
  gameState: "playing" | "finished"
  selectedAction: "move" | "wall"

  // Actions
  placeWall: (x: number, y: number, orientation: "horizontal" | "vertical") => void
  movePlayer: (playerId: string, position: [number, number]) => void
  resetGame: () => void
  setGameState: (state: "playing" | "finished") => void
  setSelectedAction: (action: "move" | "wall") => void
}

const GRID_SIZE = 9
const MAX_WALLS = 10

const createInitialState = () => ({
  gridSize: GRID_SIZE,
  currentPlayer: "player1",
  players: {
    player1: {
      id: "player1",
      position: [GRID_SIZE - 1, Math.floor(GRID_SIZE / 2)],
      color: "#3b82f6", // blue
    },
    player2: {
      id: "player2",
      position: [0, Math.floor(GRID_SIZE / 2)],
      color: "#ef4444", // red
    },
  },
  walls: [],
  wallsRemaining: {
    player1: MAX_WALLS,
    player2: MAX_WALLS,
  },
  gameState: "playing" as const,
  selectedAction: "move" as const,
})

export const useGameStore = create<GameState>((set) => ({
  ...createInitialState(),

  placeWall: (x, y, orientation) =>
    set((state) => {
      // Check if there are walls remaining
      if (state.wallsRemaining[state.currentPlayer] <= 0) {
        return state
      }

      // Add the wall
      const newWall: Wall = {
        x,
        y,
        orientation,
        color: state.players[state.currentPlayer].color,
      }

      // Update walls remaining and switch player
      return {
        walls: [...state.walls, newWall],
        wallsRemaining: {
          ...state.wallsRemaining,
          [state.currentPlayer]: state.wallsRemaining[state.currentPlayer] - 1,
        },
        currentPlayer: state.currentPlayer === "player1" ? "player2" : "player1",
        selectedAction: "move", // Reset to move after placing a wall
      }
    }),

  movePlayer: (playerId, position) =>
    set((state) => {
      // Update player position and switch player
      return {
        players: {
          ...state.players,
          [playerId]: {
            ...state.players[playerId],
            position,
          },
        },
        currentPlayer: state.currentPlayer === "player1" ? "player2" : "player1",
      }
    }),

  resetGame: () => set(createInitialState()),

  setGameState: (gameState) => set({ gameState }),

  setSelectedAction: (selectedAction) => set({ selectedAction }),
}))
