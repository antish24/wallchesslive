"use client"

import { Button } from "@/components/ui/button"

interface GameControlsProps {
  gameState: any
  localPlayerId: string
  isLocalPlayerTurn: boolean
  onActionSelect: (action: "move" | "wall") => void
  onResetGame: () => void
}

export default function GameControls({
  gameState,
  localPlayerId,
  isLocalPlayerTurn,
  onActionSelect,
  onResetGame,
}: GameControlsProps) {
  return (
    <div className="w-full flex flex-col gap-4 p-2">
      <div className="flex justify-center items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: gameState.players.player1.color }} />
          <span className="text-sm font-medium">
            {localPlayerId === "player1" ? "You" : "Opponent"} - Walls: {gameState.wallsRemaining.player1}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: gameState.players.player2.color }} />
          <span className="text-sm font-medium">
            {localPlayerId === "player2" ? "You" : "Opponent"} - Walls: {gameState.wallsRemaining.player2}
          </span>
        </div>
      </div>

      {gameState.gameState === "playing" && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-center items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: gameState.players[gameState.currentPlayer].color }}
            />
            <span className="font-medium">
              {gameState.currentPlayer === localPlayerId ? "Your turn" : "Opponent's turn"}
            </span>
          </div>

          {isLocalPlayerTurn && (
            <div className="flex justify-center gap-2">
              <Button
                variant={gameState.selectedAction === "move" ? "default" : "outline"}
                onClick={() => onActionSelect("move")}
                className="flex-1"
                size="sm"
              >
                Move Token
              </Button>
              <Button
                variant={gameState.selectedAction === "wall" ? "default" : "outline"}
                onClick={() => onActionSelect("wall")}
                className="flex-1"
                size="sm"
                disabled={gameState.wallsRemaining[localPlayerId] <= 0}
              >
                Place Wall ({gameState.wallsRemaining[localPlayerId]})
              </Button>
            </div>
          )}
        </div>
      )}

      {gameState.gameState === "finished" && (
        <Button onClick={onResetGame} className="mt-2">
          Play Again
        </Button>
      )}
    </div>
  )
}
