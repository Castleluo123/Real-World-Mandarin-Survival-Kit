import React, { useState, useEffect, useCallback, useRef } from 'react';
import mockData from '../data/mockData.json';

const TASK_TYPES = {
  PHONE_NUMBER: { name: 'Phone Number', digits: 11, icon: '📱', description: 'Delivery driver calling...' },
  DELIVERY_CODE: { name: 'Delivery Code', digits: [4, 5, 6], icon: '📦', description: 'Pickup locker code...' },
  TOTAL_PRICE: { name: 'Total Price', decimal: true, icon: '💰', description: 'Cashier says total is...' }
};

const NumberListeningTrainer = () => {
  const [currentTask, setCurrentTask] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [challengeMode, setChallengeMode] = useState(false);
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState('native');

  const audioContextRef = useRef(null);
  const ambientAudioRef = useRef(null);
  const ambientGainRef = useRef(null);
  const inputRef = useRef(null);

  const numberToChinese = {
    '0': '零', '1': '幺', '2': '二', '3': '三', '4': '四',
    '5': '五', '6': '六', '7': '七', '8': '八', '9': '九',
    '.': '点'
  };

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('numberLabHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // Save high score when streak beats it
  useEffect(() => {
    if (streak > highScore) {
      setHighScore(streak);
      localStorage.setItem('numberLabHighScore', streak.toString());
    }
  }, [streak, highScore]);

  // Initialize Audio Context
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  // Generate ambient noise for Challenge Mode
  const startAmbientNoise = useCallback(() => {
    if (ambientAudioRef.current) return;

    try {
      const ctx = getAudioContext();

      // Create noise buffer (urban ambience simulation)
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.5;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      // Low-pass filter for more realistic ambient sound
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;

      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.3;

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      noiseSource.start();
      ambientAudioRef.current = noiseSource;
      ambientGainRef.current = gainNode;
    } catch (e) {
      console.log('Ambient audio not supported');
    }
  }, []);

  const stopAmbientNoise = useCallback(() => {
    if (ambientAudioRef.current) {
      try {
        ambientAudioRef.current.stop();
      } catch (e) {}
      ambientAudioRef.current = null;
      ambientGainRef.current = null;
    }
  }, []);

  // Toggle Challenge Mode ambient audio
  useEffect(() => {
    if (challengeMode) {
      startAmbientNoise();
    } else {
      stopAmbientNoise();
    }
    return () => stopAmbientNoise();
  }, [challengeMode, startAmbientNoise, stopAmbientNoise]);

  // Generate random task
  const generateTask = useCallback(() => {
    const types = Object.keys(TASK_TYPES);
    const randomType = types[Math.floor(Math.random() * types.length)];
    const taskConfig = TASK_TYPES[randomType];

    let answer = '';
    let expectedLength = 0;

    if (randomType === 'PHONE_NUMBER') {
      // Generate 11-digit phone number (Chinese format: 1XX-XXXX-XXXX)
      const prefixes = ['13', '15', '17', '18', '19'];
      answer = prefixes[Math.floor(Math.random() * prefixes.length)];
      for (let i = 0; i < 9; i++) {
        answer += Math.floor(Math.random() * 10).toString();
      }
      expectedLength = 11;
    } else if (randomType === 'DELIVERY_CODE') {
      // Generate 4-6 digit code
      const lengths = taskConfig.digits;
      expectedLength = lengths[Math.floor(Math.random() * lengths.length)];
      for (let i = 0; i < expectedLength; i++) {
        answer += Math.floor(Math.random() * 10).toString();
      }
    } else if (randomType === 'TOTAL_PRICE') {
      // Generate price with decimal (e.g., 128.50)
      const wholePart = Math.floor(Math.random() * 500) + 10;
      const decimalPart = Math.floor(Math.random() * 100);
      answer = `${wholePart}.${decimalPart.toString().padStart(2, '0')}`;
      expectedLength = answer.length;
    }

    return {
      type: randomType,
      ...taskConfig,
      answer,
      expectedLength
    };
  }, []);

  const startNewChallenge = useCallback(() => {
    const newTask = generateTask();
    setCurrentTask(newTask);
    setUserInput('');
    setShowResult(false);
    setIsCorrect(null);

    // Autofocus input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [generateTask]);

  useEffect(() => {
    startNewChallenge();
  }, [startNewChallenge]);

  // Play audio with Challenge Mode modifications
  const playAudio = (speed = 'native') => {
    if (isPlaying || !currentTask) return;

    setIsPlaying(true);
    setPlaybackSpeed(speed);

    const answerStr = currentTask.answer;
    const chineseText = answerStr.split('').map(char => numberToChinese[char] || char).join('，');

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(chineseText);

      const voices = window.speechSynthesis.getVoices();
      const chineseVoice = voices.find(voice =>
        voice.lang.includes('zh') || voice.lang.includes('cmn')
      );

      if (chineseVoice) {
        utterance.voice = chineseVoice;
      }

      utterance.lang = 'zh-CN';

      // Challenge Mode: random playback rate between 1.2x and 1.7x
      if (challengeMode) {
        const randomRate = 1.2 + Math.random() * 0.5; // 1.2 to 1.7
        utterance.rate = speed === 'native' ? randomRate : randomRate * 0.6;
      } else {
        utterance.rate = speed === 'native' ? 1.2 : 0.6;
      }

      utterance.pitch = 1;

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 100);

      setTimeout(() => setIsPlaying(false), speed === 'native' ? 5000 : 10000);
    } else {
      setTimeout(() => setIsPlaying(false), 3000);
    }
  };

  // Sound effects
  const playSuccessSound = () => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.setValueAtTime(1108.73, ctx.currentTime + 0.1);
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  const playErrorSound = () => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.setValueAtTime(200, ctx.currentTime);
      oscillator.frequency.setValueAtTime(150, ctx.currentTime + 0.1);
      oscillator.type = 'sawtooth';
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  };

  const handleNumpadClick = (char) => {
    if (showResult) return;
    const maxLen = currentTask?.expectedLength || 11;
    if (userInput.length < maxLen) {
      setUserInput(prev => prev + char);
    }
  };

  const handleBackspace = () => {
    if (!showResult) {
      setUserInput(prev => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (!showResult) {
      setUserInput('');
    }
  };

  const checkAnswer = () => {
    const correct = userInput === currentTask.answer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      playSuccessSound();
      setStreak(prev => prev + 1);
      // Auto-generate next task after 1.5s
      setTimeout(() => {
        startNewChallenge();
      }, 1500);
    } else {
      playErrorSound();
      setStreak(0);
    }
  };

  const resetHighScore = () => {
    setHighScore(0);
    setStreak(0);
    localStorage.removeItem('numberLabHighScore');
  };

  const getDigitStatus = (index) => {
    if (!showResult) return 'neutral';
    if (index >= userInput.length) return 'missing';
    return userInput[index] === currentTask.answer[index] ? 'correct' : 'incorrect';
  };

  const DigitDisplay = () => {
    const digits = currentTask?.answer || '';
    return (
      <div className="flex justify-center gap-1 flex-wrap px-2">
        {digits.split('').map((digit, idx) => {
          const status = getDigitStatus(idx);
          const userDigit = userInput[idx] || '_';
          const statusStyles = {
            neutral: 'bg-gray-100 text-gray-800 border-gray-200',
            correct: 'bg-green-100 text-green-800 border-green-300',
            incorrect: 'bg-red-100 text-red-800 border-red-300',
            missing: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          };
          return (
            <div
              key={idx}
              className={`w-7 h-9 sm:w-8 sm:h-10 md:w-10 md:h-12 flex items-center justify-center rounded-lg border-2 font-mono text-base sm:text-lg md:text-xl font-bold ${statusStyles[status]}`}
            >
              {showResult ? (
                <div className="flex flex-col items-center">
                  <span className={status === 'incorrect' ? 'line-through text-xs' : ''}>
                    {userDigit}
                  </span>
                  {status === 'incorrect' && (
                    <span className="text-green-600 text-xs">{digit}</span>
                  )}
                </div>
              ) : (
                userDigit
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const Numpad = () => {
    const showDecimal = currentTask?.type === 'TOTAL_PRICE';
    return (
      <div className="flex justify-center px-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-[280px] sm:max-w-xs">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              onClick={() => handleNumpadClick(num)}
              className="aspect-square w-full min-h-[56px] sm:min-h-[64px] text-xl sm:text-2xl font-bold bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 active:bg-gray-100 active:scale-95 transition-all shadow-sm touch-manipulation"
              disabled={showResult}
            >
              {num}
            </button>
          ))}
          <button
            onClick={showDecimal ? () => handleNumpadClick('.') : handleClear}
            className={`aspect-square w-full min-h-[56px] sm:min-h-[64px] text-base sm:text-lg font-bold bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 active:scale-95 transition-all shadow-sm touch-manipulation ${showDecimal ? '' : 'text-red-500 active:bg-red-50'}`}
          >
            {showDecimal ? '.' : 'CLR'}
          </button>
          <button
            onClick={() => handleNumpadClick('0')}
            className="aspect-square w-full min-h-[56px] sm:min-h-[64px] text-xl sm:text-2xl font-bold bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 active:bg-gray-100 active:scale-95 transition-all shadow-sm touch-manipulation"
            disabled={showResult}
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="aspect-square w-full min-h-[56px] sm:min-h-[64px] text-base sm:text-lg font-bold bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 active:bg-orange-50 active:scale-95 transition-all shadow-sm text-orange-500 touch-manipulation"
          >
            DEL
          </button>
        </div>
      </div>
    );
  };

  if (!currentTask) return <div className="card">Loading...</div>;

  const containerClasses = challengeMode
    ? 'space-y-6 animate-pulse-border'
    : 'space-y-6';

  return (
    <div className={containerClasses}>
      {/* Challenge Mode Styles */}
      <style>{`
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          50% { box-shadow: 0 0 20px 4px rgba(239, 68, 68, 0.4); }
        }
        .animate-pulse-border .card {
          animation: pulse-border 2s ease-in-out infinite;
        }
        .stress-filter {
          filter: url(#noise);
        }
      `}</style>

      {/* SVG Filter for TV Static effect */}
      {challengeMode && (
        <svg className="hidden">
          <defs>
            <filter id="noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" result="noise"/>
              <feColorMatrix type="saturate" values="0"/>
              <feBlend in="SourceGraphic" in2="noise" mode="multiply"/>
            </filter>
          </defs>
        </svg>
      )}

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Number Listening Lab</h2>
            <p className="text-gray-600 text-sm">Train your ear for real-world Chinese numbers</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Stress Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Stress Mode</span>
              <button
                onClick={() => setChallengeMode(!challengeMode)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  challengeMode ? 'bg-red-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    challengeMode ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-red-600">{streak}</p>
              <p className="text-xs text-gray-500">Streak (Best: {highScore})</p>
            </div>
            {highScore > 0 && (
              <button
                onClick={resetHighScore}
                className="text-xs text-gray-400 hover:text-red-500 underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {challengeMode && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium">
              ⚠️ Stress Mode Active: Random speed (1.2x-1.7x) + ambient noise
            </p>
          </div>
        )}

        <div className={`bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-4 sm:p-6 text-white mb-6 ${challengeMode ? 'stress-filter' : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentTask.icon}</span>
              <span className="text-sm text-gray-400">{currentTask.description}</span>
            </div>
            <span className="text-xs bg-gray-700 px-2 py-1 rounded">{currentTask.name}</span>
          </div>
          <div className="flex items-center justify-center gap-4 my-4">
            <button
              onClick={() => playAudio('slow')}
              disabled={isPlaying}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all ${
                isPlaying && playbackSpeed === 'slow' ? 'bg-green-500 animate-pulse' : 'bg-green-600 hover:bg-green-500 active:scale-95'
              } touch-manipulation`}
              title="Slow speed"
            >
              <span className="text-lg sm:text-xl">🐢</span>
            </button>
            <button
              onClick={() => playAudio('native')}
              disabled={isPlaying}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all ${
                isPlaying && playbackSpeed === 'native' ? 'bg-red-500 animate-pulse' : 'bg-red-600 hover:bg-red-500 active:scale-95'
              } touch-manipulation`}
              title="Native speed"
            >
              <span className="text-xl sm:text-2xl">{isPlaying && playbackSpeed === 'native' ? '🔊' : '▶️'}</span>
            </button>
          </div>
          <p className="text-center text-gray-400 text-sm">
            {isPlaying
              ? `Playing${challengeMode ? ' (stress speed)' : ` at ${playbackSpeed === 'native' ? 'native' : 'learner'} speed`}...`
              : 'Tap ▶️ for native speed, 🐢 for slow'}
          </p>
        </div>

        <div className="mb-6">
          <p className="text-center text-sm text-gray-500 mb-3">
            Enter the {currentTask.name.toLowerCase()}:
          </p>
          <DigitDisplay />

          {/* Hidden input for keyboard support */}
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={userInput}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9.]/g, '');
              if (val.length <= currentTask.expectedLength) {
                setUserInput(val);
              }
            }}
            className="sr-only"
            autoFocus
          />
        </div>

        <Numpad />

        <div className="flex gap-3 mt-6 px-4 sm:px-0">
          {!showResult ? (
            <button
              onClick={checkAnswer}
              disabled={userInput.length !== currentTask.expectedLength}
              className={`flex-1 py-3 rounded-lg font-medium transition-all touch-manipulation ${
                userInput.length === currentTask.expectedLength
                  ? 'bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={startNewChallenge}
              className="flex-1 py-3 rounded-lg font-medium bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white transition-all touch-manipulation"
            >
              {isCorrect ? 'Loading Next...' : 'Try Again'}
            </button>
          )}
        </div>
      </div>

      {showResult && (
        <div className={`card ${isCorrect ? 'border-green-300 bg-green-50' : ''}`}>
          <h3 className="font-semibold text-gray-900 mb-4">
            {isCorrect ? '🎉 Perfect! Next challenge loading...' : '📚 Learning Moment'}
          </h3>

          {!isCorrect && (
            <>
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Correct Answer:</p>
                <p className="text-2xl font-mono font-bold text-green-600">{currentTask.answer}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => playAudio('native')}
                  disabled={isPlaying}
                  className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 active:scale-95 transition-all touch-manipulation"
                >
                  <span className="block text-2xl mb-2">🎙️</span>
                  <span className="text-sm text-blue-800">Native Speed</span>
                </button>
                <button
                  onClick={() => playAudio('slow')}
                  disabled={isPlaying}
                  className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 active:scale-95 transition-all touch-manipulation"
                >
                  <span className="block text-2xl mb-2">🐢</span>
                  <span className="text-sm text-green-800">Learner Speed</span>
                </button>
              </div>
            </>
          )}

          <div>
            <p className="text-sm text-gray-500 mb-3">Chinese Number Reference:</p>
            <div className="grid grid-cols-5 gap-1 sm:gap-2">
              {Object.entries(mockData.chineseNumbers).map(([num, data]) => (
                <div key={num} className="text-center p-1 sm:p-2 bg-gray-50 rounded-lg">
                  <p className="text-base sm:text-lg font-bold text-gray-800">{num}</p>
                  <p className="text-xs sm:text-sm text-gray-600">{data.character}</p>
                  <p className="text-[10px] sm:text-xs text-gray-400">{data.pinyin}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NumberListeningTrainer;
