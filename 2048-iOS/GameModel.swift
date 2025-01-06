import Foundation

class GameModel: ObservableObject {
    @Published var grid: [[Int]]
    @Published var score: Int
    @Published var bestScore: Int
    @Published var gameOver: Bool
    @Published var won: Bool
    private var mergedThisMove: Set<String>
    private let analytics = AnalyticsManager.shared
    
    init() {
        grid = Array(repeating: Array(repeating: 0, count: 4), count: 4)
        score = 0
        bestScore = UserDefaults.standard.integer(forKey: "BestScore")
        gameOver = false
        won = false
        mergedThisMove = Set<String>()
        addNewTile()
        addNewTile()
        analytics.trackEvent(type: "new_game")
    }
    
    func newGame() {
        grid = Array(repeating: Array(repeating: 0, count: 4), count: 4)
        score = 0
        gameOver = false
        won = false
        mergedThisMove = Set<String>()
        addNewTile()
        addNewTile()
        analytics.trackEvent(type: "new_game")
    }
    
    private func addNewTile() {
        var emptyCells = [(Int, Int)]()
        for i in 0..<4 {
            for j in 0..<4 {
                if grid[i][j] == 0 {
                    emptyCells.append((i, j))
                }
            }
        }
        
        guard let (row, col) = emptyCells.randomElement() else { return }
        grid[row][col] = Bool.random() ? 2 : 4
    }
    
    func move(_ direction: MoveDirection) {
        let oldGrid = grid
        mergedThisMove.removeAll()
        
        switch direction {
        case .up:
            moveUp()
        case .down:
            moveDown()
        case .left:
            moveLeft()
        case .right:
            moveRight()
        }
        
        if grid != oldGrid {
            addNewTile()
            analytics.trackEvent(type: "move", data: direction.rawValue)
            checkGameOver()
        }
        
        // Update best score
        if score > bestScore {
            bestScore = score
            UserDefaults.standard.set(bestScore, forKey: "BestScore")
            analytics.trackEvent(type: "new_high_score", data: String(score))
        }
    }
    
    private func moveLeft() {
        for i in 0..<4 {
            var merged = [Int]()
            var nonZero = grid[i].filter { $0 != 0 }
            
            var j = 0
            while j < nonZero.count - 1 {
                if nonZero[j] == nonZero[j + 1] {
                    merged.append(nonZero[j] * 2)
                    score += nonZero[j] * 2
                    checkAchievement(value: nonZero[j] * 2)
                    j += 2
                } else {
                    merged.append(nonZero[j])
                    j += 1
                }
            }
            
            if j == nonZero.count - 1 {
                merged.append(nonZero[j])
            }
            
            merged.append(contentsOf: Array(repeating: 0, count: 4 - merged.count))
            grid[i] = merged
        }
    }
    
    private func moveRight() {
        for i in 0..<4 {
            var merged = [Int]()
            var nonZero = grid[i].filter { $0 != 0 }.reversed()
            
            var j = 0
            while j < nonZero.count - 1 {
                if nonZero[j] == nonZero[j + 1] {
                    merged.append(nonZero[j] * 2)
                    score += nonZero[j] * 2
                    checkAchievement(value: nonZero[j] * 2)
                    j += 2
                } else {
                    merged.append(nonZero[j])
                    j += 1
                }
            }
            
            if j == nonZero.count - 1 {
                merged.append(nonZero[j])
            }
            
            merged.append(contentsOf: Array(repeating: 0, count: 4 - merged.count))
            grid[i] = merged.reversed()
        }
    }
    
    private func moveUp() {
        let transposed = transpose(grid)
        for i in 0..<4 {
            var merged = [Int]()
            var nonZero = transposed[i].filter { $0 != 0 }
            
            var j = 0
            while j < nonZero.count - 1 {
                if nonZero[j] == nonZero[j + 1] {
                    merged.append(nonZero[j] * 2)
                    score += nonZero[j] * 2
                    checkAchievement(value: nonZero[j] * 2)
                    j += 2
                } else {
                    merged.append(nonZero[j])
                    j += 1
                }
            }
            
            if j == nonZero.count - 1 {
                merged.append(nonZero[j])
            }
            
            merged.append(contentsOf: Array(repeating: 0, count: 4 - merged.count))
            transposed[i] = merged
        }
        grid = transpose(transposed)
    }
    
    private func moveDown() {
        let transposed = transpose(grid)
        for i in 0..<4 {
            var merged = [Int]()
            var nonZero = transposed[i].filter { $0 != 0 }.reversed()
            
            var j = 0
            while j < nonZero.count - 1 {
                if nonZero[j] == nonZero[j + 1] {
                    merged.append(nonZero[j] * 2)
                    score += nonZero[j] * 2
                    checkAchievement(value: nonZero[j] * 2)
                    j += 2
                } else {
                    merged.append(nonZero[j])
                    j += 1
                }
            }
            
            if j == nonZero.count - 1 {
                merged.append(nonZero[j])
            }
            
            merged.append(contentsOf: Array(repeating: 0, count: 4 - merged.count))
            transposed[i] = merged.reversed()
        }
        grid = transpose(transposed)
    }
    
    private func transpose(_ matrix: [[Int]]) -> [[Int]] {
        var result = Array(repeating: Array(repeating: 0, count: 4), count: 4)
        for i in 0..<4 {
            for j in 0..<4 {
                result[i][j] = matrix[j][i]
            }
        }
        return result
    }
    
    private func checkGameOver() {
        // Check if the grid is full
        var isFull = true
        for row in grid {
            if row.contains(0) {
                isFull = false
                break
            }
        }
        
        if !isFull { return }
        
        // Check for possible merges
        for i in 0..<4 {
            for j in 0..<4 {
                let current = grid[i][j]
                
                // Check right
                if j < 3 && current == grid[i][j + 1] { return }
                
                // Check down
                if i < 3 && current == grid[i + 1][j] { return }
            }
        }
        
        gameOver = true
        analytics.trackEvent(type: "game_over", data: String(score))
    }
    
    private func checkAchievement(value: Int) {
        if !won && value >= 2048 {
            won = true
            analytics.trackEvent(type: "achievement", data: "2048")
        }
        analytics.trackEvent(type: "tile_merged", data: String(value))
    }
}

enum MoveDirection: String {
    case up = "up"
    case down = "down"
    case left = "left"
    case right = "right"
}
