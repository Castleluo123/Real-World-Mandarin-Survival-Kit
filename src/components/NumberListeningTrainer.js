import React, { useState, useEffect, useCallback, useRef } from 'react';
import mockData from '../data/mockData.json';

const NumberListeningTrainer = () => {
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const audioContextRef = useRef(null);

  // Load score from localStorage on mount
  useEffect(() => {
    const savedScore = localStorage.getItem('numberLabScore');
    if (savedScore) {
      try {
        setScore(JSON.parse(savedScore));
      } catch (e) {
        console.error('Failed to parse saved score');
      }
    }
  }, []);

  // Save score to localStorage whenever it changes
  useEffect(() => {
    if (score.total > 0) {
      localStorage.setItem('numberLabScore', JSON.stringify(score));
    }
  }, [score]);

  // Initialize Audio Context
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  // Play success sound (pleasant ding)
  const playSuccessSound = () => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5
      oscillator.frequency.setValueAtTime(1108.73, ctx.currentTime + 0.1); // C#6

      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  // Play error sound (subtle buzz)
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
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  const startNewChallenge = useCallback(() => {
    const challenges = mockData.number_trainer;
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    setCurrentChallenge(randomChallenge);
    setUserInput('');
    setShowResult(false);
  }, []);

  useEffect(() => {
    startNewChallenge();
  }, [startNewChallenge]);

  const playAudio = () => {
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 3000);
  };

  const handleNumpadClick = (num) => {
    if (userInput.length < 11 && !showResult) {
      setUserInput(prev => prev + num);
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
    setShowResult(true);
    const isCorrect = userInput === currentChallenge.answer;

    // Play sound effect
    if (isCorrect) {
      playSuccessSound();
    } else {
      playErrorSound();
    }

    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const resetScore = () => {
    setScore({ correct: 0, total: 0 });
    localStorage.removeItem('numberLabScore');
  };

  const getDigitStatus = (index) => {
    if (!showResult) return 'neutral';
    if (index >= userInput.length) return 'missing';
    return userInput[index] === currentChallenge.answer[index] ? 'correct' : 'incorrect';
  };

  const DigitDisplay = () => {
    const digits = currentChallenge?.answer || '';
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

  const Numpad = () => (
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
          onClick={handleClear}
          className="aspect-square w-full min-h-[56px] sm:min-h-[64px] text-base sm:text-lg font-bold bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 active:bg-red-50 active:scale-95 transition-all shadow-sm text-red-500 touch-manipulation"
        >
          CLR
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

  if (!currentChallenge) return <div className="card">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Number Listening Lab</h2>
            <p className="text-gray-600 text-sm">Train your ear for Chinese phone numbers</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-bold text-red-600">{score.correct}/{score.total}</p>
              <p className="text-xs text-gray-500">Score (saved)</p>
            </div>
            {score.total > 0 && (
              <button
                onClick={resetScore}
                className="text-xs text-gray-400 hover:text-red-500 underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-4 sm:p-6 text-white mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">{currentChallenge.scenario}</span>
            <span className="text-xs bg-gray-700 px-2 py-1 rounded">{currentChallenge.difficulty}</span>
          </div>
          <div className="flex items-center justify-center gap-4 my-4">
            <button
              onClick={playAudio}
              disabled={isPlaying}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all ${
                isPlaying ? 'bg-red-500 animate-pulse' : 'bg-red-600 hover:bg-red-500 active:scale-95'
              } touch-manipulation`}
            >
              <span className="text-xl sm:text-2xl">{isPlaying ? '🔊' : '▶️'}</span>
            </button>
          </div>
          <p className="text-center text-gray-400 text-sm">
            {isPlaying ? 'Playing with city background noise...' : 'Tap to play'}
          </p>
        </div>

        <div className="mb-6">
          <p className="text-center text-sm text-gray-500 mb-3">Enter the 11-digit phone number:</p>
          <DigitDisplay />
        </div>

        <Numpad />

        <div className="flex gap-3 mt-6 px-4 sm:px-0">
          {!showResult ? (
            <button
              onClick={checkAnswer}
              disabled={userInput.length !== 11}
              className={`flex-1 py-3 rounded-lg font-medium transition-all touch-manipulation ${
                userInput.length === 11
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
              Next Challenge
            </button>
          )}
        </div>
      </div>

      {showResult && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">
            {userInput === currentChallenge.answer ? '🎉 Perfect!' : '📚 Learning Moment'}
          </h3>

          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Common Traps to Watch:</p>
            <div className="flex flex-wrap gap-2">
              {currentChallenge.common_traps.map((trap, idx) => (
                <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                  {trap}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 active:scale-95 transition-all touch-manipulation">
              <span className="block text-2xl mb-2">🎙️</span>
              <span className="text-sm text-blue-800">Native Speed</span>
            </button>
            <button className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 active:scale-95 transition-all touch-manipulation">
              <span className="block text-2xl mb-2">🐢</span>
              <span className="text-sm text-green-800">Learner Speed</span>
            </button>
          </div>

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