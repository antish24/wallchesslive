"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { nanoid } from "nanoid"

export default function Home() {
  const [gameCode, setGameCode] = useState("")
  const [playerName, setPlayerName] = useState("")
  const [joinPlayerName, setJoinPlayerName] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleCreateGame = () => {
    if (!playerName.trim()) {
      setError("Please enter your name")
      return
    }

    const gameId = nanoid(6)
    router.push(`/game/${gameId}?name=${encodeURIComponent(playerName)}&host=true`)
  }

  const handleJoinGame = () => {
    if (!joinPlayerName.trim()) {
      setError("Please enter your name")
      return
    }

    if (!gameCode.trim()) {
      setError("Please enter a game code")
      return
    }

    router.push(`/game/${gameCode}?name=${encodeURIComponent(joinPlayerName)}`)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2 text-center">Wall Chess Maze</h1>
        <p className="text-slate-600 mb-6 md:mb-8 text-center max-w-md mx-auto text-sm md:text-base">
          A strategic maze-building game where players outmaneuver each other to reach the opposite side
        </p>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">{error}</div>
          )}

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">Create a New Game</h2>
            <div className="space-y-2">
              <label htmlFor="playerName" className="text-sm font-medium text-slate-700">
                Your Name
              </label>
              <Input
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <Button onClick={handleCreateGame} className="w-full">
              Create Game
            </Button>
          </div>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-sm text-slate-500">OR</span>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">Join a Game</h2>
            <div className="space-y-2">
              <label htmlFor="joinPlayerName" className="text-sm font-medium text-slate-700">
                Your Name
              </label>
              <Input
                id="joinPlayerName"
                value={joinPlayerName}
                onChange={(e) => setJoinPlayerName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="gameCode" className="text-sm font-medium text-slate-700">
                Game Code
              </label>
              <Input
                id="gameCode"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value)}
                placeholder="Enter game code"
              />
            </div>
            <Button onClick={handleJoinGame} className="w-full">
              Join Game
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
