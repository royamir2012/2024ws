# 2048 iOS App

A SwiftUI implementation of the classic 2048 game, integrated with analytics tracking.

## Features

- Modern SwiftUI implementation
- Gesture-based controls (swipe to move)
- Real-time score tracking
- Game state management
- Analytics integration with web dashboard
- Beautiful UI with animations
- Color-coded tiles
- Game over detection

## Requirements

- iOS 15.0+
- Xcode 13.0+
- Swift 5.5+

## Setup

1. Open the project in Xcode
2. Update the `serverURL` in `AnalyticsManager.swift` to point to your analytics server
3. Build and run the project

## Analytics Integration

The app sends the following events to the analytics server:
- New game starts
- Every move (up/down/left/right)
- Game over events with final score

All events are tagged with `platform: "ios"` to distinguish them from web users in the analytics dashboard.

## Game Controls

- Swipe up/down/left/right to move tiles
- Tap "New Game" to start a new game
- Game automatically detects when no more moves are possible

## Architecture

- `GameModel.swift`: Core game logic and state management
- `GameView.swift`: SwiftUI views and user interface
- `AnalyticsManager.swift`: Analytics tracking integration
- `Game2048App.swift`: App entry point

## Color Scheme

The game uses a carefully selected color palette for tiles:
- 2: Light beige
- 4: Light orange
- 8: Orange
- 16: Dark orange
- 32-2048: Gradually darker shades of orange

## Contributing

Feel free to submit issues and enhancement requests!
