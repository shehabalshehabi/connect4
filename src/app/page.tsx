"use client";

import { useState, useEffect } from "react";
import "./styles.css"
import init, { c4engine } from "@/../pkg/connect4engine";

export default function Home() {
  const [engineReady, setEngineReady] = useState<boolean>(false);
  useEffect(()=>{(async() => {
    await init({
        global: {},
        env: {
          memory: new WebAssembly.Memory({
            initial: 10000,
            maximum: 65536,
          })
        }
      });
      setEngineReady(true);
    })()
  }, []);
  return <Game engineReady={engineReady}></Game>;
}

enum gameResultEnum{
  InProgress,
  Draw,
  Player1Win,
  Player2Win,
}

function Game({engineReady}:{engineReady:boolean}) {
  const [gameHistory, setGameHistory] = useState<number[][][]>([Array(7).fill(0).map(()=>Array(6).fill(0))]);
  const [moveHistory, setMoveHistory] = useState<number[]>([]);
  const [currentPly, setCurrentPly] = useState<number>(0);
  const [gameResult, setGameResult] = useState<gameResultEnum>(gameResultEnum.InProgress);
  const [engineP1, setEngineP1] = useState<boolean>(false);
  const [engineP2, setEngineP2] = useState<boolean>(false);
  const [showEvalBar, setShowEvalBar] = useState<boolean>(false);
  const [showMoveEvals, setShowMoveEvals] = useState<boolean>(false);
  const [moveEvals, setMoveEvals] = useState<number[]>(Array(7).fill(0));
  const [redEval, setRedEval] = useState<number>(50);
  const engineProps = {
    engineP1, setEngineP1, engineP2, setEngineP2, showEvalBar, setShowEvalBar, showMoveEvals, setShowMoveEvals
  }
  
  useEffect(()=>{
    if (engineReady && showMoveEvals){
      const moveEvals = Array(7).fill(0);
      const moveHistoryToCurrentPly = moveHistory.slice(0, currentPly);
      for (let i=0; i<=6; i++){
        const moves = moveHistoryToCurrentPly + i.toString();
        const engine_eval = -c4engine(moves);
        moveEvals[i]=engine_eval;
      }
      setMoveEvals(moveEvals);
    }
  }, [engineReady, moveHistory, showMoveEvals, currentPly])
  useEffect(()=>{
    if (engineReady && showEvalBar){
      const moveHistoryToCurrentPly = moveHistory.slice(0, currentPly);
      const engineEval = c4engine(moveHistoryToCurrentPly.toString());
      const redEngineEval = moveHistoryToCurrentPly.length%2==0 ? engineEval : -engineEval
      setRedEval((redEngineEval + 22)*100/44)
    }
  }, [engineReady, moveHistory, showEvalBar, currentPly])
  useEffect(()=>{
    if (moveHistory.length % 2 == 0){
      if (engineP1){
        playBestMove();
      }
    } else {
      if (engineP2){
        playBestMove();
      }
    }
  }, [engineReady, moveHistory, engineP1, engineP2])
  function checkWin(boardState: number[][], col:number, row:number){
    const player = boardState[col][row];
    // Vertical
    for (let i=row-3; i<=row; i++){
      if (i < 0){
        break;
      }
      if (boardState[col][i] != player){
        break;
      }
      if (i == row){
        return true
      }
    }

    let run = 0;
    let x, y = 0;
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
  function playBestMove(){
    if (!engineReady || (gameResult != gameResultEnum.InProgress)) {
      return;
    }
    let bestMove = -1;
    let bestScore = -127;
    for (let i=0; i<=6; i++){
      const moves = moveHistory + i.toString();
      const engine_eval = c4engine(moves);
      const move_score = engine_eval == -128 ? -128 : -engine_eval 

      console.log("move_number", Math.floor(moveHistory.length/2)+1, "col=", i, "score=", move_score);
      if (move_score > bestScore){
        bestMove = i;
        bestScore = move_score;
      }
    }
    playTurn(bestMove);
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
          {showEvalBar && <EvalBar red={redEval}></EvalBar>}
          <Board boardState={gameHistory[currentPly]} playTurn={playTurn} moveEvals={moveEvals} showMoveEvals={showMoveEvals}></Board>
          <GameHistory gotoMove={gotoMoveGuarded} moveHistory={moveHistory} currentPly={currentPly}></GameHistory>
        </div>
        <EngineControls {...engineProps}></EngineControls>
      </div>
    </div>
    )
}

function Board({boardState, playTurn, moveEvals, showMoveEvals}:{boardState:number[][], playTurn:(colNum:number)=>void, moveEvals:number[], showMoveEvals:boolean}) {
  const cols = boardState.map((columnState, colNum)=><Column columnState={columnState} key={colNum} playColumn={()=>playTurn(colNum)}
                                                      moveEval={moveEvals[colNum]} showMoveEvals={showMoveEvals}></Column>)
  return <div className="board">{cols}</div>
}

function Column({columnState, playColumn, moveEval, showMoveEvals}
  :{columnState: number[], playColumn: ()=>void, moveEval:number, showMoveEvals:boolean}) {
  const slots = columnState.map((slotState, slotNum)=><Slot slotState={slotState} key={slotNum}></Slot>)
  return <div className="column" onClick={playColumn}>{slots}{showMoveEvals && <>{moveEval}</>}</div>
}

function EvalBar({red}:{red:number}){
  const redStyle = {
    height: red.toString()+"%",
  };
  const yellowStyle = {
    height: (100-red).toString()+"%",
  };
  return <div className="eval-bar">
    <div className="yellow-eval" style={yellowStyle}></div>
    <div className="red-eval" style={redStyle}></div>
  </div>
}

type setter = React.Dispatch<React.SetStateAction<boolean>>
function EngineControls({engineP1, setEngineP1, engineP2, setEngineP2, showEvalBar, setShowEvalBar, showMoveEvals, setShowMoveEvals}
  :{engineP1:boolean, setEngineP1:setter, engineP2:boolean, setEngineP2:setter,
    showEvalBar:boolean, setShowEvalBar:setter, showMoveEvals:boolean, setShowMoveEvals:setter}){
  const engineP1Button = <button onClick={()=>setEngineP1((prevState)=>!prevState)}
                          className={engineP1 ? "activated":"deactivated"}>Engine Player 1</button>
  const engineP2Button = <button onClick={()=>setEngineP2((prevState)=>!prevState)}
                          className={engineP2 ? "activated":"deactivated"}>Engine Player 2</button>
  const showMoveEvalsButton = <button onClick={()=>setShowMoveEvals((prevState)=>!prevState)}
                          className={showMoveEvals ? "activated":"deactivated"}>Show Move Evals</button>
  const showEvalBarButton = <button onClick={()=>setShowEvalBar((prevState)=>!prevState)}
                          className={showEvalBar ? "activated":"deactivated"}>Show Eval Bar</button>

  return <div className="engine-controls">{engineP1Button}{engineP2Button}{showMoveEvalsButton}{showEvalBarButton}</div>
}

function Slot({slotState}:{slotState: number}) {
  let className = "slot"
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
          pairedMoves.length>0 ?
          pairedMoves.map((pair, index)=>{
            const td1class = (currentPly == 2*index+1) ? "current-move" : "";
            const td2class = (currentPly == 2*index+2) ? "current-move" : "";
            return <tr key={index}>
              <th onClick={()=>gotoMove(2*index)}>{index+1}</th>
              <td onClick={()=>gotoMove(2*index + 1)} className={td1class}>{pair[0]}</td>
              <td onClick={()=>gotoMove(2*index + 2)} className={td2class}>{pair.length == 2 && pair[1]}</td>
            </tr>
          }) : 
          <tr>
            <th>1</th>
            <td></td>
            <td></td>
          </tr>
        }
      </tbody>
    </table>
  </div>
}