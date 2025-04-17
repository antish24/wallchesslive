"use client"

import { motion } from "framer-motion"

interface GameStatusProps {
  gameState: string
  winner: string
  players: any
  localPlayerId: string
}

export default function GameStatus({ gameState, winner, players, localPlayerId }: GameStatusProps) {
  if (gameState !== "finished") return null

  const winnerName = winner === localPlayerId ? "You" : "Opponent"
  const winnerColor = players[winner].color

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-4 text-center w-full"
    >
      <h2 className="text-xl font-bold mb-2">Game Over!</h2>
      <p className="text-lg">
        <span className="font-bold" style={{ color: winnerColor }}>
          {winnerName}
        </span>{" "}
        {winnerName === "You" ? "win" : "wins"}!
      </p>
    </motion.div>
  )
}
