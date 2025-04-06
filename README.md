This is an interface for a Connect 4 Solver that I created. It strongly solves the game from the starting position in under 10 minutes without an opening book. The engine has access to a 12-ply opening book that enables it to return an answer in milliseconds allowing for real time play.

## Usage

This is a simple connect 4 interface that allows you to go back and change previous moves. The control panel at the bottom has 4 options.

- Engine Player 1: Have the engine play automatically for the first player.
- Engine Player 2: Have the engine play automatically for the second player.
- Toggle Move Evals: See how each different move scores for the current player - the higher the evaluation the better.
- Toggle Eval Bar: Enable an evaluation bar at the side to show which player currently has an advantage.

## Evaluations explained.
An evaluation of 0 means that the game should end in a draw with perfect play. A positive score such as +3 denotes a win that many turns before the game ends e.g. +1 means a win on the players last turn; +2 denotes a win the turn before that and so on. A negative evaluation indicates that your opponent can force a win.

In chess, an evaluation bar typically shows a solid colour when a forced win or draw is found. As this engine can solve the game from the first move, I have chosen not to do this in order to better reflect when a suboptimal move is played.

## Building
Use ``` npm run build ``` in order to create a static output page for github pages.

## Acknowledgements

The iterative deepening strategy is due to Pascal Pons. The opening book was created by Markus Thill and I have corrected the mistakes in it pointed out by ddrhoardarmer.