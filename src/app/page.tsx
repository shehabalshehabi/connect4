"use client";

import { useState } from "react";
import "./styles.css"

export default function Home() {
  return (Game());
}

enum gameResultEnum{
  InProgress,
  Draw,
  Player1Win,
  Player2Win,
}

function Game() {
  const [gameHistory, setGameHistory] = useState<number[][][]>([Array(7).fill(0).map(()=>Array(6).fill(0))]);
  const [moveHistory, setMoveHistory] = useState<number[]>([]);
  const [currentPly, setCurrentPly] = useState<number>(0);
  const [gameResult, setGameResult] = useState<gameResultEnum>(gameResultEnum.InProgress);
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
    if (gameResult != gameResultEnum.InProgress && currentPly == moveHistory.length){
      return;
    }
    const boardState = gameHistory[currentPly];
    const player1Turn = !(currentPly%2);
    for (let i = 0; i<boardState[colNum].length; i++){
      if (boardState[colNum][i] == 0) {
        setGameHistory((prevGameHistory)=>{ 
          const newGameHistory = prevGameHistory.slice(0,currentPly+1);
          const newBoardState = structuredClone(prevGameHistory[currentPly]);
          newBoardState[colNum][i] = player1Turn ? 1 : 2;
          newGameHistory.push(newBoardState);
          if (checkWin(newBoardState, colNum, i)){
            if (player1Turn){
              setGameResult(gameResultEnum.Player1Win);
            } else {
              setGameResult(gameResultEnum.Player2Win);
            }
          } else {
            if (currentPly == 6 * 7 - 1){
              setGameResult(gameResultEnum.Draw);
            } else {
              setGameResult(gameResultEnum.InProgress);
            }
          }
          return newGameHistory;
        })
        setMoveHistory((prevMoveHistory)=>{
          const newMoveHistory = prevMoveHistory.slice(0, currentPly);
          newMoveHistory.push(colNum);
          return newMoveHistory;
        })
        setCurrentPly((currentPly)=>currentPly+1);
        break;
      }
    }
  }
  function gotoMoveGuarded(ply:number){
    if (ply < 0 || ply >= gameHistory.length){
      return
    }
    setCurrentPly(ply)
  }
  return (
    <div className="game-container">
      <div className="game-ui">
        <GameStatus gameResult={gameResult} player1Turn={!(currentPly%2)} finalPly={currentPly==moveHistory.length}></GameStatus>
        <div className="game-board-and-history">
          <Board boardState={gameHistory[currentPly]} playTurn={playTurn}></Board>
          <GameHistory gotoMove={gotoMoveGuarded} moveHistory={moveHistory} currentPly={currentPly}></GameHistory>
        </div>
      </div>
    </div>
    )
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

function GameStatus({gameResult, player1Turn, finalPly}:{gameResult:gameResultEnum, player1Turn:boolean, finalPly:boolean}){
  const playerTurn = player1Turn ? "Red's Turn":"Yellow's Turn";

  const text = (!finalPly || gameResult === gameResultEnum.InProgress) ? 
    playerTurn
    : (gameResult == gameResultEnum.Draw) ? "Draw"
    : (gameResult == gameResultEnum.Player1Win) ? "Red Wins"
    : "Yellow Wins";
  
  return <div className="game-status">{text}</div>
}

function GameHistory({gotoMove, moveHistory, currentPly}:{gotoMove:(move:number)=>void, moveHistory:number[], currentPly:number}){
  const pairedMoves = moveHistory.reduce((previousValue:number[][], currentValue, currentIndex)=>{
    if (currentIndex % 2 == 0){
      previousValue.push([currentValue+1])
    } else {
      previousValue[previousValue.length-1].push(currentValue+1)
    }
    return previousValue
  }, [])


  return <div className="game-history">
    <div className="control-panel">
      <button onClick={()=>gotoMove(0)}>&lt;&lt;</button>
      <button onClick={()=>gotoMove(currentPly-1)}>&lt;</button>
      <button onClick={()=>gotoMove(currentPly+1)}>&gt;</button>
      <button onClick={()=>gotoMove(moveHistory.length)}>&gt;&gt;</button>
    </div>
    <table>
      <tbody>
        {
          pairedMoves.map((pair, index)=>{
            return <tr key={index}>
              <th onClick={()=>gotoMove(2*index)}>{index+1}</th>
              <td onClick={()=>gotoMove(2*index + 1)}>{pair[0]}</td>
              <td onClick={()=>gotoMove(2*index + 2)}>{pair.length == 2 && pair[1]}</td>
            </tr>
          })
        }
      </tbody>
    </table>
  </div>
}