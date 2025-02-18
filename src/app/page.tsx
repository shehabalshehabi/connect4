"use client";

import { useState } from "react";
import "./styles.css"

export default function Home() {
  return (Game());
}

enum gameResultEnums{
  InProgress,
  Draw,
  Player1Win,
  Player2Win,
}

function Game() {
  const [gameHistory, setGameHistory] = useState<number[][][]>([Array(7).fill(0).map(()=>Array(6).fill(0))]);
  const [currentPly, setCurrentPly] = useState<number>(0);
  const [gameResult, setGameResult] = useState<gameResultEnums>(gameResultEnums.InProgress);
  function checkWin(boardState: number[][], col:number, row:number){
    const player = boardState[col][row];
    // Vertical
    for (let i=row-3; i<=row; i++){
      if (i < 0){
        break;
      }
      if (i == row){
        return true
      }
      if (boardState[col][row] != player){
        break;
      }
    }

    var run = 0;
    var x, y = 0;
    for (let vertdelta=-1; vertdelta<=1; vertdelta++){
      run = 0;
      for (let delta=-3; delta<=3; delta++){
        x = col + delta;
        y = row + vertdelta * delta;
        if (x < 0 || x >= 7 || y < 0 || y >= 6){
          run = 0;
          continue
        }
        if (boardState[x][y] == player){
          run += 1;
          if (run >= 4){
            return true;
          }
        } else {
          run = 0;
        }
      }
    }
    return false;
  }
  function playTurn(colNum:number){
    if (gameResult != gameResultEnums.InProgress){
      return;
    }
    const boardState = gameHistory[currentPly];
    const player1Turn = !(currentPly%2);
    for (let i = 0; i<boardState[colNum].length; i++){
      if (boardState[colNum][i] == 0) {
        setGameHistory((prevGameHistory)=>{ 
          const newGameHistory = prevGameHistory.slice(0,currentPly+1);
          const newBoardState = [...prevGameHistory[currentPly]];
          newBoardState[colNum][i] = player1Turn ? 1 : 2;
          newGameHistory.push(newBoardState);
          if (checkWin(newBoardState, colNum, i)){
            if (player1Turn){
              setGameResult(gameResultEnums.Player1Win);
            } else {
              setGameResult(gameResultEnums.Player2Win);
            }
          } else {
            if (currentPly == 6 * 7 - 1){
              setGameResult(gameResultEnums.Draw)
            }
          }
          return newGameHistory;
        })
        setCurrentPly((currentPly)=>currentPly+1);
        break;
      }
    }
  }
  return <div className="game-container"><Board boardState={gameHistory.at(-1)!} playTurn={playTurn}></Board></div>
}

function Board({boardState, playTurn}:{boardState:number[][], playTurn:(colNum:number)=>void}) {
  const cols = boardState.map((columnState, colNum)=><Column columnState={columnState} key={colNum} playColumn={()=>playTurn(colNum)}></Column>)
  return <div className="board">{cols}</div>
}

function Column({columnState, playColumn}:{columnState: number[], playColumn: ()=>void}) {
  const slots = columnState.map((slotState, slotNum)=><Slot slotState={slotState} key={slotNum}></Slot>)
  return <div className="column" onClick={playColumn}>{slots}</div>
}

function Slot({slotState}:{slotState: number}) {
  var className = "slot"
  if (slotState == 1){
    className += " player1"
  } else if (slotState == 2){
    className += " player2"
  }
  return <div className={className}>{}</div>
}