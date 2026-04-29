import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PREDEFINED_MODULE_1, PREDEFINED_MODULE_2, PREDEFINED_MODULE_3, PREDEFINED_MODULE_4 } from './data/dataBeeBot';
import * as gameAPI from '../../../features/game/gameApi'

const BOARD_SIZE = 10;
const MAX_COMMANDS = 40;
const MAX_BOXES = 5;

interface Level {
  board: boolean[][];
  bee: { x: number; y: number; dir: number };
  flower: { x: number; y: number };
  buggyBoxes?: string[][];
}

// Helper for animation delay
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Function to shuffle array
function shuffleArray<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Command Icon (JSX)
const CommandIcon = ({ cmd }: { cmd: string }) => {
  if (cmd === 'FORWARD') return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>;
  if (cmd === 'BACKWARD') return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>;
  if (cmd === 'LEFT') return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>;
  if (cmd === 'RIGHT') return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>;
  return null;
};

// Custom Bee Icon (JSX)
const BeeSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
    <ellipse cx="20" cy="50" rx="18" ry="32" transform="rotate(-45 20 50)" fill="#e0f2fe" stroke="#bae6fd" strokeWidth="2" />
    <ellipse cx="80" cy="50" rx="18" ry="32" transform="rotate(45 80 50)" fill="#e0f2fe" stroke="#bae6fd" strokeWidth="2" />
    <polygon points="45,85 55,85 50,95" fill="#27272a" />
    <g>
      <clipPath id="body-clip">
        <ellipse cx="50" cy="60" rx="26" ry="30" />
      </clipPath>
      <ellipse cx="50" cy="60" rx="26" ry="30" fill="#facc15" />
      <g clipPath="url(#body-clip)">
        <rect x="0" y="44" width="100" height="12" fill="#27272a" />
        <rect x="0" y="60" width="100" height="12" fill="#27272a" />
        <rect x="0" y="76" width="100" height="12" fill="#27272a" />
      </g>
      <ellipse cx="50" cy="60" rx="26" ry="30" fill="none" stroke="#27272a" strokeWidth="4" />
    </g>
    <path d="M 40 18 Q 28 0 18 12" fill="none" stroke="#27272a" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="18" cy="12" r="4" fill="#27272a" />
    <path d="M 60 18 Q 72 0 82 12" fill="none" stroke="#27272a" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="82" cy="12" r="4" fill="#27272a" />
    <circle cx="50" cy="30" r="18" fill="#facc15" stroke="#27272a" strokeWidth="4" />
    <ellipse cx="42" cy="27" rx="5.5" ry="7.5" fill="#ffffff" stroke="#27272a" strokeWidth="2" />
    <circle cx="42" cy="25" r="2.5" fill="#27272a" />
    <ellipse cx="58" cy="27" rx="5.5" ry="7.5" fill="#ffffff" stroke="#27272a" strokeWidth="2" />
    <circle cx="58" cy="25" r="2.5" fill="#27272a" />
  </svg>
);

export default function BeeBotGameScreen() {
  const [shuffledLevels, setShuffledLevels] = useState<Level[]>([]);
  const [level, setLevel] = useState(1);
  const [board, setBoard] = useState<boolean[][]>([]);
  const [initialBee, setInitialBee] = useState({ x: 0, y: 0, dir: 0 });
  const [bee, setBee] = useState({ x: 0, y: 0, dir: 0 });
  const [flower, setFlower] = useState({ x: 0, y: 0 });
  const [studentNameDisplay, setStudentNameDisplay] =  useState("");
  
  // STATE: Manage instruction order and boxes (paths)
  const [commandBoxes, setCommandBoxes] = useState<string[][]>([[]]);
  const [collapsedBoxes, setCollapsedBoxes] = useState([false]); 
  const [activeBox, setActiveBox] = useState(0);
  const [insertIndex, setInsertIndex] = useState(0);
  const [skipAnimation, setSkipAnimation] = useState(false); // State Skip Animation
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState({ text: 'Loading level...', type: 'idle' });
  const [execIndex, setExecIndex] = useState(-1);
  const [errorIndex, setErrorIndex] = useState(-1);
  
  const startTimeRef = useRef<number | null>(null);
  const commandRefs = useRef<(HTMLDivElement | null)[]>([]);

  // get param from url and get sessionID from local storage
  const [searchParams] = useSearchParams();
  const module_level  = searchParams.get('module_level') || '1';
  const keySessionDetailIDLocalStorage = `${searchParams.get('gameSessionID')}-detailID`
  const gameSessionDetailID = localStorage.getItem(keySessionDetailIDLocalStorage)

  //define module level
  let PREDEFINED_LEVELS: Level[] = [];
  if (parseInt(module_level) === 1) {
    PREDEFINED_LEVELS = PREDEFINED_MODULE_1;
  } else if (parseInt(module_level) === 2) {
    PREDEFINED_LEVELS = PREDEFINED_MODULE_2;
  } else if (parseInt(module_level) === 3) {
    PREDEFINED_LEVELS = PREDEFINED_MODULE_3;
  } else {
    PREDEFINED_LEVELS = PREDEFINED_MODULE_4;
  }

  // Calculate total flat index for walk animation
  let totalCmds = 0;
  const boxStartIndices = commandBoxes.map(box => {
    const start = totalCmds;
    totalCmds += box.length;
    return start;
  });

  const getFlatIndex = (bIdx: number, cIdx: number) => boxStartIndices[bIdx] + cIdx;
  const flatCmds = [];
  commandBoxes.forEach((box, bIdx) => box.forEach((cmd, cIdx) => flatCmds.push({ cmd, bIdx, cIdx })));

  useEffect(() => {
    const init = async () => {
      const shuffled = [...PREDEFINED_LEVELS];
      let level_saved:number = 1
      shuffleArray(shuffled)
      setShuffledLevels(shuffled)
      if (gameSessionDetailID) {
        const response = await gameAPI.getGameSessionDetail(gameSessionDetailID);
        setStudentNameDisplay(response.student_name)
        level_saved = Number(response.level);
        startTimeRef.current = response.duration === 0 ? Date.now() : response.duration;
      }
      startTimeRef.current = Date.now() as number;
      generateLevel(level_saved,shuffled);
    }
    init()
  }, []);

  // Auto-scroll when instruction is executed (if animation is not skipped)
  useEffect(() => {
    if (!skipAnimation && execIndex !== -1 && commandRefs.current[execIndex]) {
      setTimeout(() => {
        commandRefs.current[execIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' } as ScrollIntoViewOptions);
      }, 100);
    }
  }, [execIndex, skipAnimation]);

  const generateLevel = (currentLevel: number,levels: Level[] = shuffledLevels) => {
    if (currentLevel > levels.length) return;
    const levelIndex = currentLevel - 1;
    const levelData = levels[levelIndex];

    setLevel(currentLevel);
    setBoard(levelData.board);
    setInitialBee({ ...levelData.bee });
    setBee({ ...levelData.bee });
    setFlower({ ...levelData.flower });
    
    // Cek apakah level masuk mode debugging (level 11-15)
    const buggyBoxes = levelData.buggyBoxes;
    if (buggyBoxes) {
      const loadedBoxes = buggyBoxes.map((box: string[]) => [...box]);
      setCommandBoxes(loadedBoxes);
      
      // Open only the first box
      const initialCollapsed = loadedBoxes.map((_: string[], i: number) => i !== 0);
      setCollapsedBoxes(initialCollapsed);
      setActiveBox(0);
      setInsertIndex(loadedBoxes[0].length); 
      setMessage({ text: `Level ${currentLevel}! This code has bugs ❌. Find and fix them!`, type: 'idle' });
    } else {
      // Level 1-10: Empty instructions from the start
      setCommandBoxes([[]]);
      setCollapsedBoxes([false]);
      setActiveBox(0);
      setInsertIndex(0);
      if (currentLevel <= 5) {
        setMessage({ text: `Level ${currentLevel}! Guide the bee through 2 connected paths.`, type: 'idle' });
      } else {
        setMessage({ text: `Level ${currentLevel}! Guide the bee through 4 connected paths.`, type: 'idle' });
      }
    }
    
    setIsExecuting(false);
    setStatus('idle');
    setExecIndex(-1);
    setErrorIndex(-1);
  };

  const nextLevel = () => generateLevel(level + 1);

  const toggleCollapse = (bIdx: number, e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setCollapsedBoxes(prev => {
      const isCurrentlyCollapsed = prev[bIdx];
      if (isCurrentlyCollapsed) {
        // If opening, close others (Accordion)
        return prev.map((_, i) => i !== bIdx);
      } else {
        const newCol = [...prev];
        newCol[bIdx] = true;
        return newCol;
      }
    });
    
    if (collapsedBoxes[bIdx]) {
      setActiveBox(bIdx);
      setInsertIndex(commandBoxes[bIdx].length);
    }
  };

  const addBox = () => {
    if (isExecuting || commandBoxes.length >= MAX_BOXES) return;
    setCommandBoxes(prev => [...prev, []]);
    // Accordion: Close old boxes, open new one
    setCollapsedBoxes(prev => [...prev.map(() => true), false]);
    setActiveBox(commandBoxes.length);
    setInsertIndex(0);
  };

  const removeBox = (bIdx: number) => {
    if (isExecuting) return;
    const newBoxes = commandBoxes.filter((_, i) => i !== bIdx);
    let newCollapsed = collapsedBoxes.filter((_, i) => i !== bIdx);
    
    let newActive = activeBox;
    if (activeBox === bIdx) {
      newActive = Math.max(0, bIdx - 1);
    } else if (activeBox > bIdx) {
      newActive = activeBox - 1;
    }
    
    // Ensure only the active box is open
    newCollapsed = newCollapsed.map((_, i) => i !== newActive);
    
    setCommandBoxes(newBoxes);
    setCollapsedBoxes(newCollapsed);
    setActiveBox(newActive);
    setInsertIndex(newBoxes[newActive]?.length || 0);
  };

  const addCommand = (cmd: string) => {
    if (isExecuting || totalCmds >= MAX_COMMANDS) return;
    setCommandBoxes(prev => {
      const newBoxes = [...prev];
      const currentBox = [...newBoxes[activeBox]];
      currentBox.splice(insertIndex, 0, cmd);
      newBoxes[activeBox] = currentBox;
      return newBoxes;
    });
    setInsertIndex(prev => prev + 1);
    
    // Automatically open the active box and close others
    setCollapsedBoxes(prev => prev.map((_, i) => i !== activeBox));
    setMessage({ text: level > 10 ? "Keep fixing the instructions, then press RUN!" : "Keep adding instructions, then press RUN!", type: 'idle' });
  };

  const removeCommand = (bIdx: number, cIdx: number) => {
    if (isExecuting) return;
    setCommandBoxes(prev => {
      const newBoxes = [...prev];
      const targetBox = [...newBoxes[bIdx]];
      targetBox.splice(cIdx, 1);
      newBoxes[bIdx] = targetBox;
      return newBoxes;
    });
    if (activeBox === bIdx && insertIndex > cIdx) {
      setInsertIndex(prev => prev - 1);
    }
  };

  // Fungsi dinamis untuk Reset/Hapus
  const handleClearOrReset = () => {
    if (isExecuting) return;
    
    // if (level > 10) {
    //   // Mode Debugging (Reset)
    //   const levelData = PREDEFINED_LEVELS[level - 1];
    //   const buggyBoxes = levelData.buggyBoxes ?? [];
    //   if (buggyBoxes.length === 0) return;
    //   const loadedBoxes = buggyBoxes.map((box: string[]) => [...box]);
      
    //   setCommandBoxes(loadedBoxes);
    //   setCollapsedBoxes(loadedBoxes.map((_, i: number) => i !== 0));
    //   setBee({ ...initialBee });
    //   setStatus('idle');
    //   setExecIndex(-1);
    //   setErrorIndex(-1);
    //   setActiveBox(0);
    //   setInsertIndex(loadedBoxes[0].length);
    //   setMessage({ text: "Code reset to initial state. Find the bugs!", type: 'idle' });
    // } else {
      // Normal Mode (Clear)
      setCommandBoxes([[]]);
      setCollapsedBoxes([false]);
      setBee({ ...initialBee });
      setStatus('idle');
      setExecIndex(-1);
      setErrorIndex(-1);
      setActiveBox(0);
      setInsertIndex(0);
      setMessage({ text: "All instructions deleted. Create a new path!", type: 'idle' });
    // }
  };

  const executeCommands = async () => {
    if (totalCmds === 0) {
      setMessage({ text: "Please enter a command first!", type: 'fail' });
      return;
    }

    setIsExecuting(true);
    setStatus('running');
    setErrorIndex(-1);
    setMessage({ text: level > 10 ? "Running instructions..." : "Bee is moving...", type: 'idle' });
    
    let currentBee = { ...initialBee };
    
    if (!skipAnimation) {
      setBee(currentBee);
      await sleep(400);
    }

    let currentFlatIdx = 0;

    for (let bIdx = 0; bIdx < commandBoxes.length; bIdx++) {
      const box = commandBoxes[bIdx];
      
      // Ensure the running section/box opens automatically during execution!
      if (!skipAnimation) {
        setActiveBox(bIdx);
        setCollapsedBoxes(prev => prev.map((_, i) => i !== bIdx));
      }
      
      for (let cIdx = 0; cIdx < box.length; cIdx++) {
        const cmd = box[cIdx];
        if (!skipAnimation) setExecIndex(currentFlatIdx);

        let { x, y, dir } = currentBee;

        if (cmd === 'FORWARD' || cmd === 'BACKWARD') {
          const step = cmd === 'FORWARD' ? 1 : -1;
          const rad = (dir * Math.PI) / 180;
          const dx = Math.round(Math.sin(rad)) * step;
          const dy = -Math.round(Math.cos(rad)) * step;

          const newX = x + dx;
          const newY = y + dy;

          if (newX >= 0 && newX < BOARD_SIZE && newY >= 0 && newY < BOARD_SIZE) {
            if (board[newY][newX] === true) {
               x = newX;
               y = newY;
            } else {
               setMessage({ text: "Oops, the bee hit a tree! 🌳 Fix the code!", type: 'fail' });
               setStatus('fail');
               setIsExecuting(false);
               setErrorIndex(currentFlatIdx);
               setBee(currentBee); 
               // Open box that caused error even in skip mode
               setActiveBox(bIdx);
               setCollapsedBoxes(prev => prev.map((_, i) => i !== bIdx));
               return;
            }
          } else {
            setMessage({ text: "Oops, out of bounds! 🚧 Fix the code!", type: 'fail' });
            setStatus('fail');
            setIsExecuting(false);
            setErrorIndex(currentFlatIdx);
            setBee(currentBee);
            // Open box that caused error even in skip mode
            setActiveBox(bIdx);
            setCollapsedBoxes(prev => prev.map((_, i) => i !== bIdx));
            return;
          }
        } else if (cmd === 'LEFT') {
          dir = (dir - 90 + 360) % 360;
        } else if (cmd === 'RIGHT') {
          dir = (dir + 90) % 360;
        }

        currentBee = { x, y, dir };
        currentFlatIdx++;
        
        if (!skipAnimation) {
          setBee(currentBee);
          await sleep(500);
        }
      }
    }

    setExecIndex(-1);
    setBee(currentBee); // Always set final position if skip animation is active
    
    // Automatically focus and open the last box when execution completes successfully
    setActiveBox(commandBoxes.length - 1);
    setCollapsedBoxes(prev => prev.map((_, i) => i !== (commandBoxes.length - 1)));

    if (currentBee.x === flower.x && currentBee.y === flower.y) {
      if (level >= PREDEFINED_LEVELS.length) {
        const totalSeconds = Math.floor((Date.now() - (startTimeRef.current ?? 0)) / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const timeString = minutes > 0 ? `${minutes} minutes ${seconds} seconds` : `${seconds} seconds`;
        
        setMessage({ text: `Awesome! You completed all ${PREDEFINED_LEVELS.length} levels in ${timeString}! 🎉🏆`, type: 'success' });
        setStatus('success');
      } else {
        setMessage({ text: level > 10 ? "Great! You fixed the code and got the honey! 🎉🍯" : "Hooray! The bee got its honey! 🎉🍯", type: 'success' });
        setStatus('success');
      }
      // If game has sessionDetailID
      if(gameSessionDetailID)
        await gameAPI.updateGameSessionDetail(gameSessionDetailID,level+1,0)
    } else {
      setMessage({ text: "The code stopped but the bee didn't reach the flower. 🤔", type: 'fail' });
      setStatus('fail');
    }

    setIsExecuting(false);
  };

  const isLocked = isExecuting || totalCmds >= MAX_COMMANDS;

  return (
    <div className="bg-sky-100 min-h-screen flex items-center justify-center p-2 sm:p-4 font-sans text-gray-800">
      <div className="bg-white rounded-3xl shadow-xl p-3 sm:p-5 w-full max-w-7xl flex flex-col md:flex-row gap-4 sm:gap-6 border-4 border-yellow-400 md:max-h-[95vh]">
        
        {/* LEFT: Game Area */}
        <div className="flex-[1.2] flex flex-col items-center justify-center overflow-hidden min-h-0">
          <div className="my-auto flex flex-col items-center w-full py-1">
            
            {/* Game Board */}
            <div className="bg-emerald-700 p-1.5 sm:p-2 rounded-xl shadow-inner border-4 border-emerald-800 shrink-0">
              <div className="grid gap-0.5 sm:gap-1 relative" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))` }}>
                {board.length > 0 && board.map((rowArr: boolean[], row: number) => (
                  rowArr.map((isPath: boolean, col: number) => {
                    const isBeeHere = bee.x === col && bee.y === row;
                    const isFlowerHere = flower.x === col && flower.y === row;
                    
                    const cellClass = `w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-[42px] xl:h-[42px] flex items-center justify-center relative rounded-md border shadow-sm transition-colors ${isPath ? 'bg-amber-100 border-amber-300' : 'bg-emerald-500 border-emerald-600'}`;

                    return (
                      <div key={`${row}-${col}`} className={cellClass}>
                        {!isPath && <span className="text-sm sm:text-base md:text-lg lg:text-xl opacity-90 drop-shadow-md">🌳</span>}
                        {isFlowerHere && <span className="text-base sm:text-lg md:text-xl lg:text-2xl animate-bounce drop-shadow-md z-10 absolute">🌻</span>}
                        {isBeeHere && (
                          <div className="absolute z-20 w-[90%] h-[90%] flex items-center justify-center" style={{ transform: `rotate(${bee.dir}deg)`, transition: 'all 0.5s ease-in-out' }}>
                            <BeeSVG />
                          </div>
                        )}
                      </div>
                    );
                  })
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Control Panel */}
        <div className="flex-1 flex flex-col min-h-0 bg-gray-50 rounded-2xl p-3 sm:p-4 border-2 border-gray-200 shadow-inner">
          
          {/* Level Title & Message (Top Right) */}
          {studentNameDisplay.length > 0 && <div>
            <span>Name : {studentNameDisplay}</span>
          </div>} 
          <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 mb-2 pb-2 border-b-2 border-gray-200 shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700 shrink-0">
              <span className="text-base sm:text-lg">🐝</span>
              <h2 className="font-bold text-xs sm:text-sm whitespace-nowrap">Smart Bee - Level {level}</h2>
            </div>
            
            <span className={`text-[10px] sm:text-xs font-semibold leading-tight text-right flex-1 min-w-[50%] ${
              message.type === 'success' ? 'text-green-600' : 
              message.type === 'fail' ? 'text-red-600' : 
              'text-blue-600'
            }`}>
              {message.text}
            </span>
          </div>

          <div className="flex flex-col flex-1 min-h-0 mb-3">
            <div className="flex items-end justify-between mb-2 shrink-0">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-gray-600 text-xs sm:text-sm flex items-center gap-1">Code Blocks:</h3>
                  {/* Skip Animation Option */}
                  <label className="flex items-center gap-1.5 cursor-pointer text-[10px] sm:text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded border border-gray-300 shadow-sm hover:bg-gray-100 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={skipAnimation} 
                      onChange={(e) => setSkipAnimation(e.target.checked)}
                      disabled={isExecuting}
                      className="rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                    />
                    Skip Animation
                  </label>
                </div>
                <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium mt-1">💡 Click ▲/▼ to open/close.</p>
              </div>
              <span className={`text-[10px] sm:text-xs px-2 py-1 rounded-md font-bold ${totalCmds >= MAX_COMMANDS ? 'bg-red-200 text-red-700' : 'bg-gray-200 text-gray-800'}`}>
                {totalCmds}/{MAX_COMMANDS}
              </span>
            </div>

            {/* Instruction Box Container */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 py-1">
              {commandBoxes.map((box, bIdx) => {
                const isCollapsed = collapsedBoxes[bIdx];
                
                return (
                  <div 
                    key={`box-${bIdx}`} 
                    onClick={() => {
                      if (!isExecuting && !isCollapsed) {
                        setActiveBox(bIdx);
                        setInsertIndex(box.length);
                      } else if (!isExecuting && isCollapsed) {
                        setActiveBox(bIdx);
                        setInsertIndex(box.length);
                        setCollapsedBoxes(prev => prev.map((_, i) => i !== bIdx));
                      }
                    }}
                    className={`border-2 rounded-xl p-2 transition-all cursor-pointer h-auto ${activeBox === bIdx ? 'border-amber-400 bg-white shadow-md' : 'border-gray-200 bg-gray-100 hover:border-amber-200'}`}
                  >
                    <div 
                      onClick={(e) => toggleCollapse(bIdx, e)}
                      className={`flex justify-between items-center cursor-pointer select-none group ${isCollapsed ? '' : 'mb-1 pb-1 border-b border-gray-200/60'}`}
                    >
                      <span className={`font-bold text-[11px] sm:text-xs transition-colors ${activeBox === bIdx ? 'text-amber-600' : 'text-gray-500'}`}>
                        Path {bIdx + 1} {isCollapsed && <span className="font-normal text-[10px] text-gray-400 ml-1">({box.length} instructions)</span>}
                      </span>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          disabled={isExecuting}
                          className="text-gray-400 hover:text-amber-500 font-bold px-1 transition-colors"
                          title={isCollapsed ? "Open path" : "Close path"}
                        >
                          {isCollapsed ? (
                             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                          ) : (
                             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                          )}
                        </button>
                        
                        {/* Delete Button (only appears in level 1-10 if box > 1) */}
                        {level <= 10 && commandBoxes.length > 1 && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeBox(bIdx); }} 
                            disabled={isExecuting}
                            className="text-red-400 hover:text-red-600 font-bold px-1 rounded transition-colors text-xs sm:text-sm"
                            title="Delete Section"
                          >✕</button>
                        )}
                      </div>
                    </div>

                    {!isCollapsed && (
                      <div className="flex flex-wrap items-center w-full gap-y-1.5 min-h-[36px]">
                        {Array.from({ length: box.length + 1 }).map((_, cIdx) => {
                          const isActiveGap = activeBox === bIdx && insertIndex === cIdx;
                          const flatIdx = getFlatIndex(bIdx, cIdx);

                          return (
                            <React.Fragment key={`frag-${bIdx}-${cIdx}`}>
                              {/* Celah Sisipan */}
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isExecuting) {
                                    setActiveBox(bIdx);
                                    setInsertIndex(cIdx);
                                  }
                                }}
                                className={`flex items-center justify-center h-6 z-10 shrink-0 transition-all ${isActiveGap ? 'w-3' : 'w-1.5 hover:w-2.5'}`}
                              >
                                <div className={`rounded-full transition-all ${isActiveGap ? 'bg-amber-500 w-1.5 h-full animate-pulse shadow-sm' : 'bg-gray-300 w-0.5 h-1/2 hover:bg-gray-400'}`}></div>
                              </div>

                              {/* Instruction Icon */}
                              {cIdx < box.length && (
                                <div 
                                  ref={(el) => { if (el) commandRefs.current[flatIdx] = el; }}
                                  onClick={(e) => { e.stopPropagation(); removeCommand(bIdx, cIdx); }} 
                                  title="Klik untuk menghapus"
                                  className={`shrink-0 cursor-pointer hover:scale-110 hover:ring-2 hover:ring-red-400 text-white p-0.5 sm:p-1 rounded-md shadow-sm flex items-center justify-center transition-all duration-300 
                                    ${box[cIdx] === 'FORWARD' ? 'bg-blue-400' : box[cIdx] === 'BACKWARD' ? 'bg-indigo-400' : box[cIdx] === 'LEFT' ? 'bg-orange-400' : 'bg-purple-400'}
                                    ${execIndex === flatIdx ? (errorIndex === flatIdx ? 'ring-2 ring-red-500 scale-110 z-20 shadow-md transform' : 'ring-2 ring-yellow-400 scale-110 z-20 shadow-md transform') : (execIndex !== -1 && flatIdx < execIndex ? 'opacity-50' : '')}
                                    ${errorIndex === flatIdx && status === 'fail' ? 'ring-2 ring-red-500 scale-110 z-20 shadow-md transform' : ''}
                                  `}
                                >
                                  <CommandIcon cmd={box[cIdx]} />
                                </div>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Add Box Button (Only in level 1-10) */}
              {level <= 10 && commandBoxes.length < MAX_BOXES && (
                <button 
                  onClick={addBox} 
                  disabled={isExecuting}
                  className="mt-1 py-2 border-2 border-dashed border-gray-400 text-gray-500 rounded-xl hover:bg-gray-200 hover:border-gray-500 transition-colors font-bold text-[11px] sm:text-xs shrink-0"
                >
                  + Add Path
                </button>
              )}
            </div>
          </div>

          {/* Movement Buttons */}
          <div className="flex flex-col items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 shrink-0">
            <button disabled={isLocked} onClick={() => addCommand('FORWARD')} className="ctrl-btn w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-[0_3px_0_#1d4ed8] active:shadow-[0_0px_0_#1d4ed8] active:translate-y-[3px] transition-all flex items-center justify-center flex-col">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
              <span className="text-[8px] sm:text-[10px] font-bold mt-0.5">Forward</span>
            </button>
            
            <div className="flex gap-1.5 sm:gap-2">
              <button disabled={isLocked} onClick={() => addCommand('LEFT')} className="ctrl-btn w-12 h-12 sm:w-14 sm:h-14 bg-orange-400 hover:bg-orange-500 active:bg-orange-600 disabled:opacity-50 text-white rounded-xl shadow-[0_3px_0_#c2410c] active:shadow-[0_0px_0_#c2410c] active:translate-y-[3px] transition-all flex items-center justify-center flex-col">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                <span className="text-[8px] sm:text-[10px] font-bold mt-0.5">Left</span>
              </button>
              
              <button disabled={isLocked} onClick={() => addCommand('BACKWARD')} className="ctrl-btn w-12 h-12 sm:w-14 sm:h-14 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-[0_3px_0_#3730a3] active:shadow-[0_0px_0_#3730a3] active:translate-y-[3px] transition-all flex items-center justify-center flex-col">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                <span className="text-[8px] sm:text-[10px] font-bold mt-0.5">Backward</span>
              </button>
              
              <button disabled={isLocked} onClick={() => addCommand('RIGHT')} className="ctrl-btn w-12 h-12 sm:w-14 sm:h-14 bg-purple-500 hover:bg-purple-600 active:bg-purple-700 disabled:opacity-50 text-white rounded-xl shadow-[0_3px_0_#6b21a8] active:shadow-[0_0px_0_#6b21a8] active:translate-y-[3px] transition-all flex items-center justify-center flex-col">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5"><path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                <span className="text-[8px] sm:text-[10px] font-bold mt-0.5">Right</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          {status !== 'success' && status !== 'finished' ? (
            <div className="flex gap-2 sm:gap-2 shrink-0">
              <button disabled={isExecuting} onClick={handleClearOrReset} className="flex-1 bg-red-500 hover:bg-red-600 active:bg-red-700 disabled:opacity-50 text-white font-bold py-1.5 sm:py-2.5 rounded-lg shadow-[0_3px_0_#b91c1c] active:shadow-[0_0px_0_#b91c1c] active:translate-y-[3px] transition-all flex justify-center items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs">
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  <span className="hidden sm:inline">Delete</span> All
                </>
                {/* {level > 10 ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4"><path d="M3 12a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    <span className="hidden sm:inline">Reset</span> Code
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    <span className="hidden sm:inline">Delete</span> All
                  </>
                )} */}
              </button>
              
              <button disabled={isExecuting || totalCmds === 0} onClick={executeCommands} className="flex-[2] bg-green-500 hover:bg-green-600 active:bg-green-700 disabled:opacity-50 text-white font-bold py-1.5 sm:py-2.5 rounded-lg shadow-[0_3px_0_#15803d] active:shadow-[0_0px_0_#15803d] active:translate-y-[3px] transition-all flex justify-center items-center gap-1.5 text-xs sm:text-sm tracking-wider">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                RUN
              </button>
            </div>
          ) : level < PREDEFINED_LEVELS.length ? (
            <button onClick={nextLevel} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-1.5 sm:py-2.5 rounded-lg shadow-[0_3px_0_#15803d] active:shadow-[0_0px_0_#15803d] active:translate-y-[3px] transition-all flex justify-center items-center gap-1.5 text-xs sm:text-sm tracking-wider shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
              Next Level!
            </button>
          ) : null}

        </div>
      </div>
    </div>
  );
}