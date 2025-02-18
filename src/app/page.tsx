"use client";

import { useState } from "react";
import "./styles.css"

export default function Home() {
  return (Game());
}

function Game() {
  const [player1Turn, setPlayer1Turn] = useState<boolean>(true);
  const [boardState, setBoardState] = useState<number[][]>(Array(7).fill(0).map(()=>Array(6).fill(0)));
  function playTurn(colNum:number){
    for (let i = 0; i<boardState[colNum].length; i++){
      if (boardState[colNum][i] == 0) {
        setBoardState((prevBoardState)=>{
          const newBoardState = [...prevBoardState];
          newBoardState[colNum][i] = player1Turn ? 1 : 2;
          return newBoardState;
        })
        setPlayer1Turn((player1Turn)=>!player1Turn)
        break;
      }
    }
  }
  return <div className="game-container"><Board boardState={boardState} playTurn={playTurn}></Board></div>
}

function Board({boardState, playTurn}:{boardState:number[][], playTurn:(colNum:number)=>void}) {
  const cols = boardState.map((columnState, colNum)=><Column columnState={columnState} key={colNum} playColumn={()=>playTurn(colNum)}></Column>)
  console.log(cols.toString());
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