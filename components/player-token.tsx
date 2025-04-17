// This component is no longer used, but I'm keeping it in case we need it later
"use client"

import { motion } from "framer-motion"
import type { Player } from "@/lib/types"

interface PlayerTokenProps {
  player: Player
  gridSize: number
  isCurrentPlayer: boolean
}

export default function PlayerToken({ player, gridSize, isCurrentPlayer }: PlayerTokenProps) {
  const [row, col] = player.position

  return (
    <motion.div
      className="absolute rounded-full flex items-center justify-center z-10 shadow-md"
      style={{
        backgroundColor: player.color,
        width: "60%", // Smaller token size
        height: "60%", // Smaller token size
        top: `calc(${(row * 100) / gridSize}% + 20%)`, // Adjusted for better centering
        left: `calc(${(col * 100) / gridSize}% + 20%)`, // Adjusted for better centering
      }}
      initial={{ scale: 0 }}
      animate={{
        scale: 1,
        boxShadow: isCurrentPlayer ? "0 0 10px 2px rgba(0,0,0,0.2)" : "none",
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
      layout
    />
  )
}
