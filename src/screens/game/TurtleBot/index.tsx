import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUp, ArrowDown, RotateCcw, RotateCw, Play, Trash2, RefreshCcw, Keyboard } from 'lucide-react';
import { PREDEFINED_MODULE_1, PREDEFINED_MODULE_2, PREDEFINED_MODULE_3, PREDEFINED_MODULE_4 } from './data/dataTurtleBot';
import * as gameAPI from '../../../features/game/gameApi';

const BOARD_SIZE = 10;
const MAX_COMMANDS = 40;

// Helper for animation delay
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Function to shuffle array
function shuffleArray<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Top-Down Turtle Component
const TopDownTurtle = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.5))' }}>
    {/* Front Flippers */}
    <ellipse cx="20" cy="35" rx="12" ry="28" fill="#15803d" stroke="#14532d" strokeWidth="2" transform="rotate(-40 20 35)" />
    <ellipse cx="80" cy="35" rx="12" ry="28" fill="#15803d" stroke="#14532d" strokeWidth="2" transform="rotate(40 80 35)" />
    
    {/* Back Flippers */}
    <ellipse cx="30" cy="75" rx="9" ry="20" fill="#15803d" stroke="#14532d" strokeWidth="2" transform="rotate(-30 30 75)" />
    <ellipse cx="70" cy="75" rx="9" ry="20" fill="#15803d" stroke="#14532d" strokeWidth="2" transform="rotate(30 70 75)" />
    
    {/* Tail */}
    <polygon points="45,80 55,80 50,95" fill="#15803d" stroke="#14532d" strokeWidth="2" strokeLinejoin="round" />
    
    {/* Head */}
    <circle cx="50" cy="20" r="14" fill="#15803d" stroke="#14532d" strokeWidth="2" />
    
    {/* Eyes */}
    <circle cx="43" cy="15" r="3" fill="white" />
    <circle cx="43" cy="15" r="1.5" fill="black" />
    <circle cx="57" cy="15" r="3" fill="white" />
    <circle cx="57" cy="15" r="1.5" fill="black" />

    {/* Shell */}
    <ellipse cx="50" cy="52" rx="28" ry="36" fill="#22c55e" stroke="#14532d" strokeWidth="3" />
    
    {/* Shell Pattern */}
    <path d="M 50 16 L 50 88 M 22 52 L 78 52 M 30 28 L 70 76 M 70 28 L 30 76" stroke="#16a34a" strokeWidth="2" fill="none" opacity="0.6"/>
    <circle cx="50" cy="52" r="15" fill="none" stroke="#16a34a" strokeWidth="2" opacity="0.6"/>
  </svg>
);

// 10 Predefined Levels 
let PREDEFINED_LEVELS: any[] = [];

export default function TurtleBotGameScreen() {
  const [shuffledLevels, setShuffledLevels] = useState<any[]>([]);
  // Game State
  const [level, setLevel] = useState(1);
  const [board, setBoard] = useState(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(true)));
  const [initialTurtle, setInitialTurtle] = useState({ x: 0, y: 4, dir: 0 }); 
  const [turtle, setTurtle] = useState({ x: 0, y: 4, dir: 0 });
  const [target, setTarget] = useState({ x: 4, y: 0 });
  const [studentNameDisplay, setStudentNameDisplay] = useState("");
  
  // COMMANDS structured as: { type: 'FORWARD', count: 4, label: 'fd' }
  const [commands, setCommands] = useState<Array<{ type: string; count: number; label: string }>>([]);
  const [inputValue, setInputValue] = useState(''); 
  const [insertIndex, setInsertIndex] = useState(0); // For inserting commands in the middle
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [message, setMessage] = useState("Loading level...");
  const [status, setStatus] = useState('idle');
  const [execIndex, setExecIndex] = useState(-1); // To highlight executing block
  const [skipAnimation, setSkipAnimation] = useState(false); // Skip Animation state

  const startTimeRef = useRef<number | null>(null);
  const commandRefs = useRef<(HTMLDivElement | null)[]>([]);

  // get param from url and get sessionID from local storage
  const [searchParams] = useSearchParams();
  const module_level  = searchParams.get('module_level') || '1';
  const keySessionDetailIDLocalStorage = `${searchParams.get('gameSessionID')}-detailID`
  const gameSessionDetailID = localStorage.getItem(keySessionDetailIDLocalStorage)

  //define module level
  if (parseInt(module_level) === 1) {
    PREDEFINED_LEVELS = PREDEFINED_MODULE_1;
  } else if (parseInt(module_level) === 2) {
    PREDEFINED_LEVELS = PREDEFINED_MODULE_2;
  } else if (parseInt(module_level) === 3) {
    PREDEFINED_LEVELS = PREDEFINED_MODULE_3;
  } else {
    PREDEFINED_LEVELS = PREDEFINED_MODULE_4;
  }

  // Load Level Map
  const generateLevel = (currentLevel: number, levels: any[] = shuffledLevels) => {
    if (currentLevel > levels.length) return;
    const levelIndex = currentLevel - 1;
    const levelData = levels[levelIndex];

    setBoard(levelData.board);
    setInitialTurtle(levelData.turtle);
    setTurtle(levelData.turtle);
    setTarget(levelData.target);
    setCommands([]);
    setInputValue('');
    setInsertIndex(0);
    setLevel(currentLevel);
    setStatus('idle');
    setExecIndex(-1);
    setMessage(`Level ${currentLevel}! Type commands for the turtle.`);
  };

  useEffect(() => {
    const init = async () => {
      const shuffled = [...PREDEFINED_LEVELS];
      let level_saved: number = 1
      shuffleArray(shuffled)
      setShuffledLevels(shuffled)
      if (gameSessionDetailID) {
        const response = await gameAPI.getGameSessionDetail(gameSessionDetailID);
        setStudentNameDisplay(response.student_name)
        level_saved = Number(response.level);
        startTimeRef.current = response.duration === 0 ? Date.now() : response.duration;
      }
      startTimeRef.current = Date.now() as number;
      generateLevel(level_saved, shuffled);
    }
    init()
  }, []);

  // Auto-scroll when command is executed
  useEffect(() => {
    if (!skipAnimation && execIndex !== -1 && commandRefs.current[execIndex]) {
      setTimeout(() => {
        commandRefs.current[execIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' } as ScrollIntoViewOptions);
      }, 100);
    }
  }, [execIndex, skipAnimation]);

  // Handle Keyboard Input with Multiplier Support
  const handleCommandSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isExecuting) return;

    const val = inputValue.trim().toLowerCase();
    if (!val) return;

    const tokens = val.split(/\s+/); 
    const newCmds: Array<{ type: string; count: number; label: string }> = [];
    let hasError = false;
    let errorToken = "";

    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i];
      let cmdStr = token;
      let count = 1;

      // Check if number is combined (e.g., fd10)
      let match = token.match(/^([a-z]+)(\d+)$/);
      if (match) {
        cmdStr = match[1];
        count = parseInt(match[2], 10);
      } 
      // Check if next token is a number (e.g., fd 10)
      else if (i + 1 < tokens.length && /^\d+$/.test(tokens[i + 1])) {
        count = parseInt(tokens[i + 1], 10);
        i++; // Skip number token
      }

      let cmdType = '';
      let baseLabel = '';
      if (cmdStr === 'forward' || cmdStr === 'fd') { cmdType = 'FORWARD'; baseLabel = 'fd'; }
      else if (cmdStr === 'backward' || cmdStr === 'bk') { cmdType = 'BACKWARD'; baseLabel = 'bk'; }
      else if (cmdStr === 'left' || cmdStr === 'lt') { cmdType = 'LEFT'; baseLabel = 'lt'; }
      else if (cmdStr === 'right' || cmdStr === 'rt') { cmdType = 'RIGHT'; baseLabel = 'rt'; }
      else {
        hasError = true;
        errorToken = token;
        break;
      }

      // Add to queue as ONE BLOCK OBJECT
      if (count > 0) {
        newCmds.push({ type: cmdType, count: count, label: baseLabel });
      }
    }

    if (hasError) {
      setMessage(`Oops! Command "${errorToken}" is unknown. Check the legend!`);
      setStatus('fail');
      return;
    }

    if (commands.length + newCmds.length > MAX_COMMANDS) {
      setMessage(`Instruction box is full! Maximum ${MAX_COMMANDS} command blocks.`);
      setStatus('fail');
      return;
    }

    // Splice new commands into the current insertion index
    const updatedCmds = [...commands];
    updatedCmds.splice(insertIndex, 0, ...newCmds);

    setCommands(updatedCmds);
    setInsertIndex(insertIndex + newCmds.length);
    setInputValue('');
    setStatus('idle');
    setMessage("Command added! Type more or press RUN.");
  };

 

  // Clear all commands
  const clearCommands = () => {
    if (isExecuting) return;
    setCommands([]);
    setInputValue('');
    setTurtle({ ...initialTurtle });
    setInsertIndex(0);
    setExecIndex(-1);
    setMessage("Instructions cleared. Let's type a new route!");
    setStatus('idle');
  };

  // Remove specific command
  const removeCommand = (index: number) => {
    if (isExecuting) return;
    const newCmds = [...commands];
    newCmds.splice(index, 1);
    setCommands(newCmds);
    
    // Adjust cursor position if deleting something before the cursor
    if (insertIndex > index) {
      setInsertIndex(insertIndex - 1);
    }
  };

  // Execute instructions
  const executeCommands = async () => {
    if (commands.length === 0) {
      setMessage("Please type instructions in the box above first!");
      return;
    }

    setIsExecuting(true);
    setStatus('running');
    setExecIndex(-1);
    setMessage(skipAnimation ? "Running..." : "The turtle is swimming...");
    
    // Reset to start position on every RUN
    let currentTurtle = { ...initialTurtle };
    if (!skipAnimation) {
      setTurtle(currentTurtle);
      await sleep(400);
    }

    for (let i = 0; i < commands.length; i++) {
      if (!skipAnimation) setExecIndex(i); // Highlight active block
      const cmdObj = commands[i];
      
      // Loop based on multiplier inside the command block
      for (let step = 0; step < cmdObj.count; step++) {
        let { x, y, dir } = currentTurtle;

        if (cmdObj.type === 'FORWARD' || cmdObj.type === 'BACKWARD') {
          const moveDir = cmdObj.type === 'FORWARD' ? 1 : -1;
          const rad = (dir * Math.PI) / 180;
          const dx = Math.round(Math.sin(rad)) * moveDir;
          const dy = -Math.round(Math.cos(rad)) * moveDir;

          let newX = x + dx;
          let newY = y + dy;

          // Check collisions
          if (newX >= 0 && newX < BOARD_SIZE && newY >= 0 && newY < BOARD_SIZE) {
            if (board[newY][newX] === true) {
               x = newX;
               y = newY;
            } else {
               setMessage("Oops, hit a coral reef! 🪸");
               setStatus('fail');
               setIsExecuting(false);
               setExecIndex(i);
               setTurtle({ x, y, dir }); // Set position right before crash
               return;
            }
          } else {
            setMessage("Oops, went out of bounds! 🚧");
            setStatus('fail');
            setIsExecuting(false);
            setExecIndex(i);
            setTurtle({ x, y, dir }); // Set position right before crash
            return;
          }
        } else if (cmdObj.type === 'LEFT') {
          dir = (dir - 90 + 360) % 360;
        } else if (cmdObj.type === 'RIGHT') {
          dir = (dir + 90) % 360;
        }

        currentTurtle = { x, y, dir };
        
        if (!skipAnimation) {
          setTurtle(currentTurtle);
          await sleep(450);
        }
      }
    }

    setExecIndex(-1);
    setTurtle(currentTurtle); // Ensure final position is set if skipped

    // Check win/fail condition
    if (currentTurtle.x === target.x && currentTurtle.y === target.y) {
      if (level >= PREDEFINED_LEVELS.length) {
        const totalSeconds = Math.floor((Date.now() - (startTimeRef.current ?? 0)) / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const timeString = minutes > 0 ? `${minutes} minutes ${seconds} seconds` : `${seconds} seconds`;
        
        setMessage(`Awesome! You completed all ${PREDEFINED_LEVELS.length} levels in ${timeString}! 🎉🏆`);
        setStatus('success');
      } else {
        setMessage("Hooray! The turtle got the starfish! 🎉⭐");
        setStatus('success');
      }
      // If game has sessionDetailID
      if(gameSessionDetailID)
        await gameAPI.updateGameSessionDetail(gameSessionDetailID, level+1, 0)
    } else {
      setMessage("Aw, the turtle hasn't reached the starfish yet. Try fixing the instructions! 🤔");
      setStatus('fail');
    }

    setIsExecuting(false);
  };

  const renderGrid = () => {
    let cells = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const isTurtleHere = turtle.x === col && turtle.y === row;
        const isTargetHere = target.x === col && target.y === row;
        const isPath = board[row] && board[row][col];

        cells.push(
          <div
            key={`${row}-${col}`}
            className={`w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 lg:w-12 lg:h-12 flex items-center justify-center relative rounded-md border shadow-sm transition-colors
              ${isPath ? 'bg-[#fef08a] border-[#fde047]' : 'bg-cyan-700 border-cyan-800'}
            `}
          >
            {/* Coral Reef Obstacle */}
            {!isPath && (
              <span className="text-base sm:text-xl md:text-2xl opacity-90 drop-shadow-md">🪸</span>
            )}
            
            {/* Target Starfish */}
            {isTargetHere && (
              <span className="text-lg sm:text-2xl md:text-3xl animate-[bounce_2s_infinite] drop-shadow-md z-10">⭐</span>
            )}

            {/* Turtle Character */}
            {isTurtleHere && (
              <div
                className="absolute z-20 transition-all duration-500 ease-in-out w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10"
                style={{
                  transform: `rotate(${turtle.dir}deg)`,
                  transitionDuration: skipAnimation ? '0s' : '500ms'
                }}
              >
                <TopDownTurtle />
              </div>
            )}
          </div>
        );
      }
    }
    return cells;
  };

  // Render Icon Block with label and active highlight support
  const getCommandBlock = (cmdObj: { type: string; count: number; label: string }, index: number) => {
    let icon, color;
    switch (cmdObj.type) {
      case 'FORWARD': icon = <ArrowUp size={16} />; color = 'bg-blue-500'; break;
      case 'BACKWARD': icon = <ArrowDown size={16} />; color = 'bg-indigo-500'; break;
      case 'LEFT': icon = <RotateCcw size={16} />; color = 'bg-orange-500'; break;
      case 'RIGHT': icon = <RotateCw size={16} />; color = 'bg-purple-500'; break;
      default: return null;
    }

    // Set animation highlight based on execIndex
    let highlightClass = '';
    if (execIndex === index) {
      highlightClass = status === 'fail' 
        ? 'ring-4 ring-rose-500 scale-110 z-10 shadow-lg transform' 
        : 'ring-4 ring-yellow-400 scale-110 z-10 shadow-lg transform';
    } else if (execIndex !== -1 && index < execIndex) {
      highlightClass = 'opacity-50'; // Dim passed instructions
    }

    return (
      <div 
        ref={(el) => { if (el) commandRefs.current[index] = el; }}
        key={index} 
        onClick={() => removeCommand(index)}
        title="Click to remove"
        className={`cursor-pointer shrink-0 hover:scale-110 hover:ring-2 hover:ring-rose-400 ${color} text-white px-2 py-1.5 rounded-md shadow-sm flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold transition-all duration-300 ${highlightClass}`}
      >
        {icon} 
        <span>{cmdObj.label} {cmdObj.count > 1 ? cmdObj.count : ''}</span>
      </div>
    );
  };

  const isLocked = isExecuting || commands.length >= MAX_COMMANDS;

  return (
    <div className="min-h-screen bg-cyan-950 flex items-center justify-center p-2 sm:p-4 font-sans text-cyan-900">
      <div className="bg-cyan-50 rounded-3xl shadow-[0_0_40px_rgba(8,145,178,0.3)] p-3 sm:p-6 w-full max-w-5xl flex flex-col md:flex-row gap-4 sm:gap-6 border-4 border-cyan-400">
        
        {/* LEFT: Game Area */}
        <div className="flex-[1.5] flex flex-col items-center justify-center">
          {studentNameDisplay.length > 0 && <div className="mb-2">
            <span>Name : {studentNameDisplay}</span>
          </div>}
          <div className="bg-cyan-500 text-white px-4 sm:px-6 py-2 rounded-full font-bold text-lg sm:text-2xl mb-4 shadow-md flex items-center gap-2">
            <span>🐢</span> Smart Turtle - Level {level}
          </div>
          
          {/* Game Board (10x10 Grid) */}
          <div className="bg-cyan-900 p-1 sm:p-2 rounded-xl sm:rounded-2xl shadow-inner border-4 border-cyan-950">
            <div 
              className="grid gap-1 relative" 
              style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))` }}
            >
              {renderGrid()}
            </div>
          </div>

          <div className={`mt-4 w-full text-center p-2 sm:p-3 rounded-xl font-bold text-xs sm:text-base transition-colors ${
              status === 'success' ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-400' : 
              status === 'fail' ? 'bg-rose-100 text-rose-800 border-2 border-rose-400' : 
              'bg-cyan-100 text-cyan-800 border-2 border-cyan-300'
            }`}>
            {message}
          </div>

          {status === 'success' && (
             <button 
                onClick={() => generateLevel(level + 1)}
                className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-xl shadow-[0_5px_0_#047857] active:shadow-[0_0px_0_#047857] active:translate-y-[5px] transform transition-all flex items-center gap-2"
              >
                <RefreshCcw size={20} /> Next Level!
             </button>
          )}
        </div>

        {/* RIGHT: Input Control Panel */}
        <div className="flex-1 flex flex-col justify-between bg-white rounded-2xl p-3 sm:p-5 border-2 border-cyan-200 shadow-inner">
          
          <div className="flex flex-col h-full gap-4">
            {/* Command Queue Visualization */}
            <div>
              <div className="flex items-center justify-between border-b-2 border-cyan-100 pb-2 mb-2">
                <h3 className="font-bold text-cyan-800 flex items-center text-sm sm:text-base">
                  <Keyboard size={18} className="inline mr-1 mb-1"/> Your Code:
                </h3>
                
                {/* Skip Animation & Commands Counter Container */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[10px] sm:text-xs font-semibold text-cyan-800 bg-white px-2 py-1 rounded border border-cyan-200 shadow-sm hover:bg-cyan-50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={skipAnimation} 
                      onChange={(e) => setSkipAnimation(e.target.checked)}
                      disabled={isExecuting}
                      className="rounded text-cyan-500 focus:ring-cyan-400 cursor-pointer"
                    />
                    Skip Animation
                  </label>

                  <span className={`text-xs sm:text-sm px-2 py-1 rounded-md font-bold ${commands.length >= MAX_COMMANDS ? 'bg-rose-200 text-rose-800' : 'bg-cyan-100 text-cyan-800'}`}>
                    {commands.length}/{MAX_COMMANDS}
                  </span>
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-cyan-600 font-medium mb-2">💡 Click the gaps to insert commands in the middle!</p>
              
              <div className="bg-slate-50 border-2 border-dashed border-cyan-200 rounded-xl p-2 sm:p-3 min-h-[100px] max-h-[160px] overflow-y-auto flex flex-wrap content-start items-center">
                {commands.length === 0 ? (
                  <span className="text-cyan-600/60 text-xs sm:text-sm italic w-full text-center mt-4">No code yet. Type commands below!</span>
                ) : (
                  Array.from({ length: commands.length + 1 }).map((_, cIdx) => {
                    const isActiveGap = insertIndex === cIdx;
                    return (
                      <React.Fragment key={`frag-${cIdx}`}>
                        {/* Interactive Insertion Gap */}
                        <div
                          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                            e.stopPropagation();
                            if (!isExecuting) setInsertIndex(cIdx);
                          }}
                          className={`flex items-center justify-center h-8 z-10 shrink-0 transition-all cursor-pointer ${isActiveGap ? 'w-3 sm:w-4' : 'w-1.5 sm:w-2 hover:w-2.5 sm:hover:w-3'}`}
                        >
                          <div className={`rounded-full transition-all ${isActiveGap ? 'bg-amber-500 w-1 h-full animate-pulse shadow-sm' : 'bg-slate-300 w-0.5 h-1/2 hover:bg-slate-400'}`}></div>
                        </div>
                        
                        {/* Command Block */}
                        {cIdx < commands.length && getCommandBlock(commands[cIdx], cIdx)}
                      </React.Fragment>
                    );
                  })
                )}
              </div>
            </div>

            {/* Keyboard Input Area */}
            <form onSubmit={handleCommandSubmit} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isExecuting || commands.length >= MAX_COMMANDS}
                placeholder="Type code: fd 3 rt fd"
                className="flex-1 border-2 border-cyan-300 rounded-xl px-3 py-2 text-sm sm:text-base font-mono focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 uppercase disabled:bg-slate-100"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
              <button
                type="submit"
                disabled={isExecuting || commands.length >= MAX_COMMANDS || !inputValue.trim()}
                className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-300 text-white font-bold py-2 px-3 sm:px-4 rounded-xl shadow-[0_4px_0_#0891b2] active:shadow-none active:translate-y-[4px] transition-all"
              >
                Add
              </button>
            </form>

            {/* Legend (Cheat Sheet) */}
            <div className="bg-cyan-50/50 border-2 border-cyan-200 rounded-xl p-3 sm:p-4 mt-1 shadow-sm">
              <h4 className="font-bold text-cyan-800 text-xs sm:text-sm mb-2 text-center">📜 COMMAND LEGEND</h4>
              <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm text-cyan-900">
                <div className="flex items-center justify-between bg-white px-2 py-1.5 rounded-lg border border-cyan-100  transition-colors  text-left ">
                  <span>Forward</span><span className="font-mono font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">fd</span>
                </div>
                <div className="flex items-center justify-between bg-white px-2 py-1.5 rounded-lg border border-cyan-100  transition-colors text-left ">
                  <span>Backward</span><span className="font-mono font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">bk</span>
                </div>
                <div className="flex items-center justify-between bg-white px-2 py-1.5 rounded-lg border border-cyan-100  transition-colors text-left ">
                  <span>Turn Left</span><span className="font-mono font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">lt</span>
                </div>
                <div className="flex items-center justify-between bg-white px-2 py-1.5 rounded-lg border border-cyan-100  transition-colors text-left ">
                  <span>Turn Right</span><span className="font-mono font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">rt</span>
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-center mt-3 text-cyan-700">
                💡 <strong>Tips:</strong> You can add numbers to move faster! Example: type <code className="bg-white px-1 py-0.5 rounded text-blue-600 border border-cyan-200 shadow-sm">fd 5</code>
              </p>
            </div>
          </div>

          {/* Final Action Buttons (Clear & Run) */}
          <div className="flex gap-2 sm:gap-3 mt-4">
            <button 
              onClick={clearCommands}
              disabled={isExecuting}
              className="flex-1 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 disabled:opacity-50 text-white font-bold py-3 sm:py-4 rounded-xl shadow-[0_4px_0_#be123c] active:shadow-[0_0px_0_#be123c] active:translate-y-[4px] transition-all flex justify-center items-center gap-1 sm:gap-2 text-xs sm:text-base"
            >
              <Trash2 size={18} className="sm:w-5 sm:h-5" /> Clear
            </button>
            
            <button 
              onClick={executeCommands}
              disabled={isExecuting || commands.length === 0}
              className="flex-[2] bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 sm:py-4 rounded-xl shadow-[0_4px_0_#047857] active:shadow-[0_0px_0_#047857] active:translate-y-[4px] transition-all flex justify-center items-center gap-2 text-base sm:text-xl tracking-wider"
            >
              <Play size={20} fill="currentColor" className="sm:w-6 sm:h-6" /> RUN
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}