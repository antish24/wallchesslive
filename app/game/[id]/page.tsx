"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import GameBoard from "@/components/game-board"
import { Button } from "@/components/ui/button"
import { useSocket } from "@/components/socket-provider"
import { Loader2, Copy, CheckCircle } from "lucide-react"

export default function GamePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const gameId = params.id as string
  const playerName = searchParams.get("name") || "Guest"
  const isHost = searchParams.get("host") === "true"

  const { socket, isConnected } = useSocket()
  const [gameStatus, setGameStatus] = useState<"waiting" | "playing" | "finished">("waiting")
  const [opponent, setOpponent] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!socket || !isConnected) return

    // Join the game room
    socket.emit("joinGame", { gameId, playerName, isHost })

    // Listen for game events
    socket.on("gameJoined", (data) => {
      if (data.error) {
        setError(data.error)
        return
      }

      if (data.status === "waiting") {
        setGameStatus("waiting")
      } else if (data.status === "playing") {
        setGameStatus("playing")
        setOpponent(data.opponent)
      }
    })

    socket.on("playerJoined", (data) => {
      setGameStatus("playing")
      setOpponent(data.playerName)
    })

    socket.on("gameError", (data) => {
      setError(data.message)
    })

    socket.on("playerLeft", () => {
      setGameStatus("waiting")
      setOpponent(null)
      setError("Your opponent has left the game")
    })

    return () => {
      socket.off("gameJoined")
      socket.off("playerJoined")
      socket.off("gameError")
      socket.off("playerLeft")

      // Leave the game room when component unmounts
      socket.emit("leaveGame", { gameId })
    }
  }, [socket, isConnected, gameId, playerName, isHost])

  const copyGameCode = () => {
    navigator.clipboard.writeText(gameId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const leaveGame = () => {
    router.push("/")
  }

  if (!isConnected) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
          <p className="text-slate-700">Connecting to server...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Wall Chess Maze</h1>
          <Button variant="outline" size="sm" onClick={leaveGame}>
            Leave Game
          </Button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">{error}</div>}

        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium text-slate-700">Game Code:</div>
              <div className="flex items-center gap-2">
                <code className="bg-slate-100 px-2 py-1 rounded text-slate-800 font-mono">{gameId}</code>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyGameCode} title="Copy game code">
                  {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium text-slate-700">Your Name:</div>
              <div className="text-slate-800">{playerName}</div>
            </div>
            {opponent && (
              <div className="flex justify-between items-center mt-1">
                <div className="text-sm font-medium text-slate-700">Opponent:</div>
                <div className="text-slate-800">{opponent}</div>
              </div>
            )}
          </div>

          {gameStatus === "waiting" ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
              <p className="text-slate-700">Waiting for another player to join...</p>
              <p className="text-sm text-slate-500">Share the game code with a friend to play together</p>
            </div>
          ) : (
            <GameBoard gameId={gameId} playerName={playerName} isHost={isHost} />
          )}
        </div>
      </div>
    </main>
  )
}
