import  { useState, useEffect, useRef } from 'react';
import { PREDEFINED_LEVELS_1, PREDEFINED_LEVELS_2 } from '../../data/predefined_level';
import { useSearchParams } from 'react-router-dom';

interface Level {
  board: boolean[][];
  bee: { x: number; y: number; dir: number };
  flower: { x: number; y: number };
}

const BOARD_SIZE = 10;
const MAX_COMMANDS = 50;

// Helper untuk penundaan animasi
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const saveToLocalStorage = (shuffledLevel: Level[], level: number, instruction: string[], startTime: number) => {
  try { localStorage.setItem('shuffledLevel', JSON.stringify(shuffledLevel)); 
    localStorage.setItem('currentLevel', level.toString()); 
    localStorage.setItem('currentInstruction', JSON.stringify(instruction));
    localStorage.setItem('currentStartTime', startTime.toString());
  }
  catch (e) { console.error("Failed to save to localStorage", e); }
}

// Fungsi untuk mengacak array
function shuffleArray<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Ikon Perintah (JSX)
const CommandIcon = ({ cmd }: { cmd: string }) => {
  if (cmd === 'FORWARD') return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>;
  if (cmd === 'BACKWARD') return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>;
  if (cmd === 'LEFT') return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>;
  if (cmd === 'RIGHT') return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>;
  return null;
};

// Ikon Lebah (JSX)
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

export default function BeeBotScreen() {
  const [shuffledLevels, setShuffledLevels] = useState<Level[]>([]);
  const [level, setLevel] = useState(1);
  const [board, setBoard] = useState<boolean[][]>([]);
  const [initialBee, setInitialBee] = useState({ x: 0, y: 0, dir: 0 });
  const [bee, setBee] = useState({ x: 0, y: 0, dir: 0 });
  const [flower, setFlower] = useState({ x: 0, y: 0 });
  const [commands, setCommands] = useState<string[]>([]);
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle', 'running', 'success', 'fail'
  const [message, setMessage] = useState({ text: 'Loading level...', type: 'idle' });
  const [activeIndex, setActiveIndex] = useState(-1);
  const [errorIndex, setErrorIndex] = useState(-1);
  
  const startTimeRef = useRef<number | null>(null);
  const commandRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [searchParams] = useSearchParams();
  const module_level  = searchParams.get('module_level') || '1';

   const generateLevel = (currentLevel: number, levels: Level[] = shuffledLevels, isReset: boolean = true) => {
    if (levels.length === 0) return;
    const levelIndex = (currentLevel - 1) % levels.length;
    const levelData = levels[levelIndex];

    setLevel(currentLevel);
    setBoard(levelData.board);
    setInitialBee({ ...levelData.bee });
    setBee({ ...levelData.bee });
    setFlower({ ...levelData.flower });

    if(isReset)
      setCommands([]);
    
    setIsExecuting(false);
    setStatus('idle');
    setActiveIndex(-1);
    setErrorIndex(-1);
    setMessage({ text: `Level ${currentLevel}! Guide the bee through the dirt path.`, type: 'idle' });
  };

  // Inisialisasi Game
  useEffect(() => {
    
    // const PREDEFINED_LEVELS = PREDEFINED_LEVELS_2; // Bisa ditambah dengan level lain di masa depan
    // startTimeRef.current = Date.now();
    // const shuffled = [...PREDEFINED_LEVELS];
    // shuffleArray(shuffled);
    // setShuffledLevels(shuffled);
    // generateLevel(1, shuffled);

    const PREDEFINED_LEVELS = module_level === '1' ? PREDEFINED_LEVELS_1 : PREDEFINED_LEVELS_2; // Bisa ditambah dengan level lain di masa depan
    const savedShuffledLevelStr = localStorage.getItem('shuffledLevel');
    const savedLevelStr = localStorage.getItem('currentLevel');
    const savedInstructionStr = localStorage.getItem('currentInstruction');

    if(savedShuffledLevelStr && savedLevelStr && savedInstructionStr) {
      const savedShuffledLevel = JSON.parse(savedShuffledLevelStr);
      const savedLevel = parseInt(savedLevelStr);
      const savedInstruction = JSON.parse(savedInstructionStr);
      setShuffledLevels(savedShuffledLevel);
      generateLevel(savedLevel, savedShuffledLevel,false);
      setCommands(savedInstruction);
    }
    else{
      const shuffled = [...PREDEFINED_LEVELS];
      shuffleArray(shuffled);
      setShuffledLevels(shuffled);
      generateLevel(1, shuffled);
    }

    startTimeRef.current = Date.now();
   
  }, []);

  // Efek untuk auto-scroll ketika command dieksekusi
  useEffect(() => {
    if (activeIndex !== -1 && commandRefs.current[activeIndex]) {
      commandRefs.current[activeIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeIndex]);

 

  const nextLevel = () => {
    generateLevel(level + 1);
  };

  const addCommand = (cmd: string) => {
    if (isExecuting || commands.length >= MAX_COMMANDS) return;
    setCommands(prev => [...prev, cmd]);
    setMessage({ text: "Keep adding directions, then press GO!", type: 'idle' });
    saveToLocalStorage(shuffledLevels, level, [...commands, cmd], startTimeRef.current || 0);
  };

  const removeCommand = (index: number) => {
    if (isExecuting) return;
    const newCommands = commands.filter((_, i) => i !== index);
    setCommands(newCommands);
    setMessage({ text: "Instruction removed.", type: 'idle' });
    saveToLocalStorage(shuffledLevels, level, newCommands, startTimeRef.current || 0);
  };

  const clearCommands = () => {
    if (isExecuting) return;
    setCommands([]);
    setBee({ ...initialBee });
    setStatus('idle');
    setActiveIndex(-1);
    setErrorIndex(-1);
    saveToLocalStorage(shuffledLevels, level, [], startTimeRef.current || 0);
    setMessage({ text: "Instructions cleared. Let's make a new path!", type: 'idle' });
  };

  const executeCommands = async () => {
    saveToLocalStorage(shuffledLevels, level, commands, startTimeRef.current || 0);
    if (commands.length === 0) {
      setMessage({ text: "Please enter commands first!", type: 'fail' });
      return;
    }

    setIsExecuting(true);
    setStatus('running');
    setErrorIndex(-1);
    setMessage({ text: "The bee is moving...", type: 'idle' });
    
    let currentBee = { ...initialBee };
    setBee(currentBee);
    await sleep(400);

    for (let i = 0; i < commands.length; i++) {
      setActiveIndex(i);
      const cmd = commands[i];
      let { x, y, dir } = currentBee;

      if (cmd === 'FORWARD' || cmd === 'BACKWARD') {
        const step = cmd === 'FORWARD' ? 1 : -1;
        const rad = (dir * Math.PI) / 180;
        const dx = Math.round(Math.sin(rad)) * step;
        const dy = -Math.round(Math.cos(rad)) * step;

        let newX = x + dx;
        let newY = y + dy;

        if (newX >= 0 && newX < BOARD_SIZE && newY >= 0 && newY < BOARD_SIZE) {
          if (board[newY][newX] === true) {
             x = newX;
             y = newY;
          } else {
             setMessage({ text: "Oops, hit an obstacle tree! 🌳", type: 'fail' });
             setStatus('fail');
             setIsExecuting(false);
             setErrorIndex(i);
             return;
          }
        } else {
          setMessage({ text: "Oops, out of bounds! 🚧", type: 'fail' });
          setStatus('fail');
          setIsExecuting(false);
          setErrorIndex(i);
          return;
        }
      } else if (cmd === 'LEFT') {
        dir = (dir - 90 + 360) % 360;
      } else if (cmd === 'RIGHT') {
        dir = (dir + 90) % 360;
      }

      currentBee = { x, y, dir };
      setBee(currentBee);
      await sleep(550);
    }

    setActiveIndex(-1);

    if (currentBee.x === flower.x && currentBee.y === flower.y) {
      if (level >= shuffledLevels.length) {
        const totalSeconds = Math.floor((Date.now() - (startTimeRef.current || 0)) / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        let timeString = minutes > 0 ? `${minutes} minutes ${seconds} seconds` : `${seconds} seconds`;
        
        setMessage({ text: `Amazing! You completed all 20 levels in ${timeString}! 🎉🏆`, type: 'success' });
        setStatus('success');
      } else {
        setMessage({ text: "Hooray! The bee got the honey! 🎉🍯", type: 'success' });
        setStatus('success');
      }
    } else {
      setMessage({ text: "Ah, the bee hasn't reached the flower yet. Try fixing the instructions! 🤔", type: 'fail' });
      setStatus('fail');
    }

    setIsExecuting(false);
  };

  // Dinamis CSS untuk Message Box
  let msgBoxClass = 'mt-4 w-full text-center p-2 sm:p-3 rounded-xl font-bold text-xs sm:text-base transition-colors ';
  if (message.type === 'success') msgBoxClass += 'bg-green-100 text-green-700 border-2 border-green-400';
  else if (message.type === 'fail') msgBoxClass += 'bg-red-100 text-red-700 border-2 border-red-400';
  else msgBoxClass += 'bg-blue-50 text-blue-700 border-2 border-blue-200';

  const isLocked = isExecuting || commands.length >= MAX_COMMANDS;

  return (
    <div className="bg-sky-100 min-h-screen flex items-center justify-center p-2 sm:p-4 font-sans text-gray-800">
      <div className="bg-white rounded-3xl shadow-xl p-3 sm:p-6 w-full max-w-5xl flex flex-col md:flex-row gap-4 sm:gap-6 border-4 border-yellow-400">
        
        {/* KIRI: Area Game */}
        <div className="flex-[1.5] flex flex-col items-center justify-center">
          <div className="bg-yellow-400 text-yellow-900 px-4 sm:px-6 py-2 rounded-full font-bold text-lg sm:text-2xl mb-4 shadow-md flex items-center gap-2">
            <span>🐝</span> Smart Bee - Level <span>{level}</span>
          </div>
          
          {/* Game Board (10x10 Grid) */}
          <div className="bg-emerald-700 p-1 sm:p-2 rounded-xl sm:rounded-2xl shadow-inner border-4 border-emerald-800">
            <div className="grid gap-1 relative" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))` }}>
              {board.length > 0 && board.map((rowArr, row) => (
                rowArr.map((isPath, col) => {
                  const isBeeHere = bee.x === col && bee.y === row;
                  const isFlowerHere = flower.x === col && flower.y === row;
                  const cellClass = `w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 lg:w-12 lg:h-12 flex items-center justify-center relative rounded-md border shadow-sm transition-colors ${isPath ? 'bg-amber-100 border-amber-300' : 'bg-emerald-500 border-emerald-600'}`;

                  return (
                    <div key={`${row}-${col}`} className={cellClass}>
                      {!isPath && <span className="text-base sm:text-xl md:text-2xl opacity-90 drop-shadow-md">🌳</span>}
                      {isFlowerHere && <span className="text-lg sm:text-2xl md:text-3xl animate-bounce drop-shadow-md z-10 absolute">🌻</span>}
                      {isBeeHere && (
                        <div 
                          className="absolute z-20 w-[90%] h-[90%] flex items-center justify-center" 
                          style={{ 
                            transform: `rotate(${bee.dir}deg)`,
                            transition: 'all 0.5s ease-in-out' // Inline transition custom css
                          }}
                        >
                          <BeeSVG />
                        </div>
                      )}
                    </div>
                  );
                })
              ))}
            </div>
          </div>

          <div className={msgBoxClass}>
            {message.text}
          </div>
        </div>

        {/* KANAN: Panel Kontrol */}
        <div className="flex-1 flex flex-col justify-between bg-gray-50 rounded-2xl p-3 sm:p-5 border-2 border-gray-200 shadow-inner">
          
          {/* Antrean Perintah */}
          <div className="mb-2 sm:mb-3">
            <h3 className="font-bold text-gray-600 mb-2 flex items-center justify-between text-sm sm:text-base">
              <span>Instructions:</span>
              <span className={`text-xs sm:text-sm px-2 py-1 rounded-md font-bold ${commands.length === MAX_COMMANDS ? 'bg-red-200 text-red-700' : 'bg-gray-200 text-gray-800'}`}>
                {commands.length}/{MAX_COMMANDS}
              </span>
            </h3>
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-2 sm:p-3 min-h-[80px] max-h-[120px] sm:max-h-[160px] overflow-y-auto flex flex-wrap gap-2 content-start pt-3">
              {commands.length === 0 ? (
                <span className="text-gray-400 text-xs sm:text-sm italic w-full text-center mt-2">No commands yet. Press the buttons below!</span>
              ) : (
                commands.map((cmd, index) => {
                  let color = '';
                  if(cmd === 'FORWARD') color = 'bg-blue-400';
                  if(cmd === 'BACKWARD') color = 'bg-indigo-400';
                  if(cmd === 'LEFT') color = 'bg-orange-400';
                  if(cmd === 'RIGHT') color = 'bg-purple-400';

                  let highlightClass = '';
                  if (index === activeIndex) {
                    highlightClass = index === errorIndex 
                      ? 'ring-4 ring-red-500 scale-125 z-10 shadow-md transform' 
                      : 'ring-4 ring-yellow-400 scale-125 z-10 shadow-md transform';
                  } else if (activeIndex !== -1 && index < activeIndex) {
                    highlightClass = 'opacity-50';
                  } else if (index === errorIndex && status === 'fail') {
                    highlightClass = 'ring-4 ring-red-500 scale-125 z-10 shadow-md transform';
                  }

                  return (
                    <div 
                      key={index} 
                      ref={(el) => { commandRefs.current[index] = el; }}
                      onClick={() => removeCommand(index)} 
                      title="Click to remove" 
                      className={`cursor-pointer hover:scale-110 hover:ring-2 hover:ring-red-400 ${color} text-white p-1 rounded-md shadow-sm flex items-center justify-center transition-all duration-300 ${highlightClass}`}
                    >
                      <CommandIcon cmd={cmd} />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Tombol Pergerakan */}
          <div className="flex flex-col items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <button disabled={isLocked} onClick={() => addCommand('FORWARD')} className="ctrl-btn w-14 h-14 sm:w-20 sm:h-20 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 text-white rounded-2xl shadow-[0_5px_0_#1d4ed8] active:shadow-[0_0px_0_#1d4ed8] active:translate-y-[5px] transition-all flex items-center justify-center flex-col">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="sm:w-8 sm:h-8"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
              <span className="text-[9px] sm:text-xs font-bold mt-1">Forward</span>
            </button>
            
            <div className="flex gap-2 sm:gap-3">
              <button disabled={isLocked} onClick={() => addCommand('LEFT')} className="ctrl-btn w-14 h-14 sm:w-20 sm:h-20 bg-orange-400 hover:bg-orange-500 active:bg-orange-600 disabled:opacity-50 text-white rounded-2xl shadow-[0_5px_0_#c2410c] active:shadow-[0_0px_0_#c2410c] active:translate-y-[5px] transition-all flex items-center justify-center flex-col">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="sm:w-7 sm:h-7"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                <span className="text-[9px] sm:text-xs font-bold mt-1">Left</span>
              </button>
              
              <button disabled={isLocked} onClick={() => addCommand('BACKWARD')} className="ctrl-btn w-14 h-14 sm:w-20 sm:h-20 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl shadow-[0_5px_0_#3730a3] active:shadow-[0_0px_0_#3730a3] active:translate-y-[5px] transition-all flex items-center justify-center flex-col">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="sm:w-8 sm:h-8"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                <span className="text-[9px] sm:text-xs font-bold mt-1">Backward</span>
              </button>
              
              <button disabled={isLocked} onClick={() => addCommand('RIGHT')} className="ctrl-btn w-14 h-14 sm:w-20 sm:h-20 bg-purple-500 hover:bg-purple-600 active:bg-purple-700 disabled:opacity-50 text-white rounded-2xl shadow-[0_5px_0_#6b21a8] active:shadow-[0_0px_0_#6b21a8] active:translate-y-[5px] transition-all flex items-center justify-center flex-col">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="sm:w-7 sm:h-7"><path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                <span className="text-[9px] sm:text-xs font-bold mt-1">Right</span>
              </button>
            </div>
          </div>

          {/* Tombol Aksi (GO, CLEAR, NEXT LEVEL) */}
          {status !== 'success' && status !== 'finished' ? (
            <div className="flex gap-2 sm:gap-3">
              <button disabled={isExecuting} onClick={clearCommands} className="flex-1 bg-red-500 hover:bg-red-600 active:bg-red-700 disabled:opacity-50 text-white font-bold py-2 sm:py-4 rounded-xl shadow-[0_4px_0_#b91c1c] active:shadow-[0_0px_0_#b91c1c] active:translate-y-[4px] transition-all flex justify-center items-center gap-1 sm:gap-2 text-xs sm:text-base">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                <span className="hidden sm:inline">Clear</span> All
              </button>
              
              <button disabled={isExecuting || commands.length === 0} onClick={executeCommands} className="flex-[2] bg-green-500 hover:bg-green-600 active:bg-green-700 disabled:opacity-50 text-white font-bold py-2 sm:py-4 rounded-xl shadow-[0_4px_0_#15803d] active:shadow-[0_0px_0_#15803d] active:translate-y-[4px] transition-all flex justify-center items-center gap-2 text-base sm:text-xl tracking-wider">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                GO
              </button>
            </div>
          ) : level < shuffledLevels.length ? (
            <button onClick={nextLevel} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 sm:py-4 rounded-xl shadow-[0_4px_0_#15803d] active:shadow-[0_0px_0_#15803d] active:translate-y-[4px] transition-all flex justify-center items-center gap-2 text-base sm:text-xl tracking-wider">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
              Next Level!
            </button>
          ) : null}

        </div>
      </div>
    </div>
  );
}