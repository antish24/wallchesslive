import type { Wall, Player } from "./types"

// Check if a player has reached the opposite side
export function checkWinCondition(players: Record<string, Player>, gridSize: number): string | null {
  // Player 1 wins by reaching the top row (row 0)
  if (players.player1.position[0] === 0) {
    return "player1"
  }

  // Player 2 wins by reaching the bottom row (row gridSize-1)
  if (players.player2.position[0] === gridSize - 1) {
    return "player2"
  }

  return null
}

// Fix the isValidMove function to properly check for walls
export function isValidMove(
  currentPosition: [number, number],
  targetPosition: [number, number],
  walls: Wall[],
  gridSize: number,
): boolean {
  const [currentRow, currentCol] = currentPosition
  const [targetRow, targetCol] = targetPosition

  // Check if the target position is out of bounds
  if (targetRow < 0 || targetRow >= gridSize || targetCol < 0 || targetCol >= gridSize) {
    return false
  }

  // Check if the target position is adjacent (no diagonal moves)
  const rowDiff = Math.abs(targetRow - currentRow)
  const colDiff = Math.abs(targetCol - currentCol)

  if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
    // Check if there's a wall blocking the move
    if (rowDiff === 1) {
      // Moving vertically (up or down)
      const minRow = Math.min(currentRow, targetRow)
      // Check for horizontal wall between the cells
      if (walls.some((wall) => wall.orientation === "horizontal" && wall.y === minRow + 1 && wall.x === currentCol)) {
        return false
      }
    } else {
      // Moving horizontally (left or right)
      const minCol = Math.min(currentCol, targetCol)
      // Check for vertical wall between the cells
      if (walls.some((wall) => wall.orientation === "vertical" && wall.x === minCol + 1 && wall.y === currentRow)) {
        return false
      }
    }
    return true
  }

  return false
}

// Fix the isValidWallPlacement function to properly validate wall placement
export function isValidWallPlacement(
  walls: Wall[],
  newWall: { x: number; y: number; orientation: "horizontal" | "vertical" },
  players: Record<string, Player>,
  gridSize: number,
): boolean {
  // Check if the wall is out of bounds
  if (
    newWall.x < 0 ||
    newWall.y < 0 ||
    (newWall.orientation === "horizontal" && (newWall.x >= gridSize || newWall.y > gridSize)) ||
    (newWall.orientation === "vertical" && (newWall.x > gridSize || newWall.y >= gridSize))
  ) {
    return false
  }

  // Check if the wall overlaps with an existing wall
  if (walls.some((wall) => wall.x === newWall.x && wall.y === newWall.y && wall.orientation === newWall.orientation)) {
    return false
  }

  // For a more complete implementation, we would check if the wall blocks all paths
  // This would require a pathfinding algorithm like BFS or A*
  // For simplicity, we'll skip this check for now

  return true
}

// A simple implementation of BFS to check if a path exists
// This is a placeholder and would need to be implemented for a complete game
export function pathExists(
  start: [number, number],
  target: number, // Target row for player1, target row for player2
  walls: Wall[],
  gridSize: number,
): boolean {
  // Implementation of BFS would go here
  return true
}
