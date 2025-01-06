import SwiftUI

struct GameView: View {
    @StateObject private var gameModel = GameModel()
    @State private var startLocation: CGPoint?
    
    let tileSize: CGFloat = 65
    let spacing: CGFloat = 10
    
    var body: some View {
        VStack(spacing: 20) {
            // Header
            HStack {
                VStack(alignment: .leading) {
                    Text("2048")
                        .font(.largeTitle)
                        .bold()
                    Text("Join the tiles, get to 2048!")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                VStack(spacing: 8) {
                    ScoreView(title: "SCORE", score: gameModel.score)
                    ScoreView(title: "BEST", score: gameModel.bestScore)
                }
            }
            .padding()
            
            // Game Grid
            ZStack {
                // Background grid
                RoundedRectangle(cornerRadius: 6)
                    .fill(Color(.systemGray5))
                
                // Game grid
                VStack(spacing: spacing) {
                    ForEach(0..<4) { row in
                        HStack(spacing: spacing) {
                            ForEach(0..<4) { column in
                                TileView(value: gameModel.grid[row][column])
                            }
                        }
                    }
                }
                .padding(spacing)
                
                // Game Over overlay
                if gameModel.gameOver {
                    GameOverView(score: gameModel.score) {
                        gameModel.newGame()
                    }
                }
                
                // Win overlay
                if gameModel.won {
                    WinView {
                        gameModel.newGame()
                    }
                }
            }
            .gesture(
                DragGesture()
                    .onChanged { gesture in
                        if startLocation == nil {
                            startLocation = gesture.location
                        }
                    }
                    .onEnded { gesture in
                        guard let start = startLocation else { return }
                        let end = gesture.location
                        let dx = end.x - start.x
                        let dy = end.y - start.y
                        
                        startLocation = nil
                        
                        // Determine the direction of the swipe
                        let magnitude = sqrt(dx*dx + dy*dy)
                        guard magnitude >= 10 else { return } // Minimum swipe distance
                        
                        if abs(dx) > abs(dy) {
                            gameModel.move(dx > 0 ? .right : .left)
                        } else {
                            gameModel.move(dy > 0 ? .down : .up)
                        }
                    }
            )
            
            // New Game Button
            Button(action: {
                gameModel.newGame()
            }) {
                Text("New Game")
                    .font(.headline)
                    .foregroundColor(.white)
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color.blue)
                    .cornerRadius(8)
            }
            .padding(.horizontal)
        }
    }
}

struct ScoreView: View {
    let title: String
    let score: Int
    
    var body: some View {
        VStack {
            Text(title)
                .font(.caption)
                .bold()
            Text("\(score)")
                .font(.title2)
                .bold()
        }
        .frame(width: 80, height: 55)
        .background(Color(.systemGray6))
        .cornerRadius(6)
    }
}

struct TileView: View {
    let value: Int
    
    var backgroundColor: Color {
        switch value {
        case 0: return Color(.systemGray6)
        case 2: return Color(.systemGray5)
        case 4: return Color(.systemGray4)
        case 8: return Color.orange
        case 16: return Color.red
        case 32: return Color.pink
        case 64: return Color.purple
        case 128: return Color.blue
        case 256: return Color.green
        case 512: return Color.yellow
        case 1024: return Color.orange
        case 2048: return Color.red
        default: return Color.gray
        }
    }
    
    var foregroundColor: Color {
        switch value {
        case 2, 4: return .black
        default: return .white
        }
    }
    
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 6)
                .fill(backgroundColor)
                .frame(width: 65, height: 65)
            
            if value != 0 {
                Text("\(value)")
                    .font(.title)
                    .bold()
                    .foregroundColor(foregroundColor)
            }
        }
    }
}

struct GameOverView: View {
    let score: Int
    let newGame: () -> Void
    
    var body: some View {
        ZStack {
            Color.black.opacity(0.7)
            
            VStack(spacing: 20) {
                Text("Game Over!")
                    .font(.largeTitle)
                    .bold()
                    .foregroundColor(.white)
                
                Text("Score: \(score)")
                    .font(.title)
                    .foregroundColor(.white)
                
                Button("Try Again", action: newGame)
                    .font(.headline)
                    .foregroundColor(.white)
                    .padding()
                    .background(Color.blue)
                    .cornerRadius(8)
            }
        }
    }
}

struct WinView: View {
    let newGame: () -> Void
    
    var body: some View {
        ZStack {
            Color.black.opacity(0.7)
            
            VStack(spacing: 20) {
                Text("You Won! 🎉")
                    .font(.largeTitle)
                    .bold()
                    .foregroundColor(.white)
                
                Text("You reached 2048!")
                    .font(.title)
                    .foregroundColor(.white)
                
                Button("Play Again", action: newGame)
                    .font(.headline)
                    .foregroundColor(.white)
                    .padding()
                    .background(Color.blue)
                    .cornerRadius(8)
            }
        }
    }
}

struct GameView_Previews: PreviewProvider {
    static var previews: some View {
        GameView()
    }
}
