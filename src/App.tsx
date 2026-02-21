import { useState, useEffect, useCallback, useRef } from 'react';
import { getRandomWords, type Word } from './words';
import { getRandomProblems, type MathProblem } from './math';

type GameMode = 'menu' | 'reading' | 'math';
type ReadingState = 'start' | 'showing-word' | 'showing-picture' | 'finished';
type MathState = 'start' | 'showing-problem' | 'showing-answer' | 'finished';
type LetterFilter = 'all' | 'bdp';

function App() {
  const [gameMode, setGameMode] = useState<GameMode>('menu');

  // Reading game state
  const [readingState, setReadingState] = useState<ReadingState>('start');
  const [words, setWords] = useState<Word[]>([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [letterFilter, setLetterFilter] = useState<LetterFilter>('all');
  const [useCapitals, setUseCapitals] = useState(false);

  // Math game state
  const [mathState, setMathState] = useState<MathState>('start');
  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [mathIndex, setMathIndex] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const ITEMS_PER_GAME = 10;

  // --- Reading game logic ---
  const startReading = useCallback(() => {
    const bdpOnly = letterFilter === 'bdp';
    setWords(getRandomWords(ITEMS_PER_GAME, bdpOnly));
    setWordIndex(0);
    setReadingState('showing-word');
  }, [letterFilter]);

  const handleReadingSpace = useCallback(() => {
    if (readingState === 'start') {
      startReading();
    } else if (readingState === 'showing-word') {
      setReadingState('showing-picture');
    } else if (readingState === 'showing-picture') {
      if (wordIndex < ITEMS_PER_GAME - 1) {
        setWordIndex(wordIndex + 1);
        setReadingState('showing-word');
      } else {
        setReadingState('finished');
      }
    } else if (readingState === 'finished') {
      startReading();
    }
  }, [readingState, wordIndex, startReading]);

  // --- Math game logic ---
  const startMath = useCallback(() => {
    setProblems(getRandomProblems(ITEMS_PER_GAME));
    setMathIndex(0);
    setTypedAnswer('');
    setScore(0);
    setWasCorrect(null);
    setMathState('showing-problem');
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const submitMathAnswer = useCallback(() => {
    if (mathState !== 'showing-problem') return;
    const current = problems[mathIndex];
    if (!current) return;

    const parsed = parseInt(typedAnswer, 10);
    const correct = !isNaN(parsed) && parsed === current.answer;
    setWasCorrect(correct);
    if (correct) setScore(s => s + 1);
    setMathState('showing-answer');
  }, [mathState, problems, mathIndex, typedAnswer]);

  const nextMathProblem = useCallback(() => {
    if (mathIndex < ITEMS_PER_GAME - 1) {
      setMathIndex(mathIndex + 1);
      setTypedAnswer('');
      setWasCorrect(null);
      setMathState('showing-problem');
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setMathState('finished');
    }
  }, [mathIndex]);

  // --- Keyboard handler ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Menu: 1 or 2 to pick game
      if (gameMode === 'menu') {
        if (e.key === '1') {
          setGameMode('reading');
          setReadingState('start');
        } else if (e.key === '2') {
          setGameMode('math');
          setMathState('start');
        }
        return;
      }

      // Reading game
      if (gameMode === 'reading') {
        if (e.code === 'Space') {
          e.preventDefault();
          handleReadingSpace();
        }
        if (e.code === 'Escape') {
          setGameMode('menu');
        }
        return;
      }

      // Math game
      if (gameMode === 'math') {
        if (e.code === 'Escape') {
          if (mathState === 'start' || mathState === 'finished') {
            setGameMode('menu');
          }
          return;
        }

        if (mathState === 'start') {
          if (e.code === 'Space') {
            e.preventDefault();
            startMath();
          }
          return;
        }

        if (mathState === 'showing-problem') {
          if (e.code === 'Enter' || e.code === 'Space') {
            e.preventDefault();
            submitMathAnswer();
          }
          return;
        }

        if (mathState === 'showing-answer') {
          if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            nextMathProblem();
          }
          return;
        }

        if (mathState === 'finished') {
          if (e.code === 'Space') {
            e.preventDefault();
            startMath();
          }
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameMode, handleReadingSpace, mathState, startMath, submitMathAnswer, nextMathProblem]);

  // Focus input when showing a math problem
  useEffect(() => {
    if (gameMode === 'math' && mathState === 'showing-problem') {
      inputRef.current?.focus();
    }
  }, [gameMode, mathState, mathIndex]);

  const currentWord = words[wordIndex];
  const displayWord = currentWord?.word
    ? (useCapitals ? currentWord.word.toUpperCase() : currentWord.word)
    : '';
  const currentProblem = problems[mathIndex];

  // ========================
  // MENU SCREEN
  // ========================
  if (gameMode === 'menu') {
    return (
      <div className="game-container menu-screen">
        <div className="banner">Luke's Learning Games</div>
        <div className="content-card">
          <h1 className="game-title">What do you want to play?</h1>
          <div className="menu-buttons">
            <button className="menu-btn reading-btn" onClick={() => { setGameMode('reading'); setReadingState('start'); }}>
              <span className="menu-btn-emoji">📚</span>
              <span className="menu-btn-label">Reading</span>
            </button>
            <button className="menu-btn math-btn" onClick={() => { setGameMode('math'); setMathState('start'); }}>
              <span className="menu-btn-emoji">🔢</span>
              <span className="menu-btn-label">Math</span>
            </button>
          </div>
        </div>
        <div className="decorations">
          <span className="floating-emoji" style={{ left: '10%', animationDelay: '0s' }}>⭐</span>
          <span className="floating-emoji" style={{ left: '30%', animationDelay: '0.5s' }}>📖</span>
          <span className="floating-emoji" style={{ left: '70%', animationDelay: '1s' }}>🔢</span>
          <span className="floating-emoji" style={{ left: '90%', animationDelay: '1.5s' }}>✨</span>
        </div>
      </div>
    );
  }

  // ========================
  // READING GAME
  // ========================
  if (gameMode === 'reading') {
    if (readingState === 'start') {
      return (
        <div className="game-container start-screen">
          <div className="banner">Luke's Reading Game</div>
          <div className="content-card">
            <h1 className="game-title">📚 Let's Read!</h1>
            <p className="subtitle">Practice reading words!</p>

            <div className="options-section">
              <div className="option-group">
                <label className="option-label">Word type:</label>
                <div className="letter-buttons">
                  <button
                    className={`letter-btn ${letterFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setLetterFilter('all')}
                  >
                    All Words
                  </button>
                  <button
                    className={`letter-btn ${letterFilter === 'bdp' ? 'active' : ''}`}
                    onClick={() => setLetterFilter('bdp')}
                  >
                    b, d & p
                  </button>
                </div>
              </div>

              <div className="option-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={useCapitals}
                    onChange={(e) => setUseCapitals(e.target.checked)}
                  />
                  <span className="checkbox-custom"></span>
                  Use CAPITAL letters
                </label>
              </div>
            </div>

            <div className="spacebar-prompt">
              <div className="spacebar-key" onClick={startReading}>SPACE</div>
              <p>Press Space to Start</p>
            </div>
          </div>
          <div className="decorations">
            <span className="floating-emoji" style={{ left: '10%', animationDelay: '0s' }}>⭐</span>
            <span className="floating-emoji" style={{ left: '25%', animationDelay: '0.5s' }}>📖</span>
            <span className="floating-emoji" style={{ left: '75%', animationDelay: '1s' }}>🌟</span>
            <span className="floating-emoji" style={{ left: '90%', animationDelay: '1.5s' }}>✨</span>
          </div>
        </div>
      );
    }

    if (readingState === 'finished') {
      return (
        <div className="game-container finished-screen">
          <div className="content-card">
            <div className="celebration-emoji">🎉</div>
            <h1 className="congrats-title">Great Job!</h1>
            <p className="subtitle">You read {ITEMS_PER_GAME} words!</p>
            <div className="spacebar-prompt">
              <div className="spacebar-key" onClick={startReading}>SPACE</div>
              <p>Press Space to Play Again</p>
            </div>
            <button className="back-btn" onClick={() => setGameMode('menu')}>Back to Menu</button>
          </div>
          <div className="decorations">
            <span className="floating-emoji" style={{ left: '5%', animationDelay: '0s' }}>🌟</span>
            <span className="floating-emoji" style={{ left: '20%', animationDelay: '0.3s' }}>⭐</span>
            <span className="floating-emoji" style={{ left: '40%', animationDelay: '0.6s' }}>🎈</span>
            <span className="floating-emoji" style={{ left: '60%', animationDelay: '0.9s' }}>🎊</span>
            <span className="floating-emoji" style={{ left: '80%', animationDelay: '1.2s' }}>✨</span>
            <span className="floating-emoji" style={{ left: '95%', animationDelay: '1.5s' }}>🌟</span>
          </div>
        </div>
      );
    }

    // Reading game screen
    return (
      <div className="game-container game-screen">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${((wordIndex + 1) / ITEMS_PER_GAME) * 100}%` }} />
        </div>
        <div className="progress-text">{wordIndex + 1} of {ITEMS_PER_GAME}</div>

        <div className="content-card word-card">
          <div className="word-display">{displayWord}</div>

          {readingState === 'showing-picture' && (
            <div className="picture-reveal">
              <div className="emoji-display">{currentWord?.emoji}</div>
            </div>
          )}

          <div className="spacebar-prompt small">
            <div className="spacebar-key small" onClick={handleReadingSpace}>SPACE</div>
            <p>{readingState === 'showing-word' ? 'Press Space to see the picture' : 'Press Space for next word'}</p>
          </div>
        </div>
      </div>
    );
  }

  // ========================
  // MATH GAME
  // ========================
  if (gameMode === 'math') {
    if (mathState === 'start') {
      return (
        <div className="game-container math-start-screen">
          <div className="banner">Luke's Math Game</div>
          <div className="content-card">
            <h1 className="game-title">🔢 Let's Do Math!</h1>
            <p className="subtitle">Addition and subtraction practice!</p>

            <div className="spacebar-prompt">
              <div className="spacebar-key" onClick={startMath}>SPACE</div>
              <p>Press Space to Start</p>
            </div>
          </div>
          <div className="decorations">
            <span className="floating-emoji" style={{ left: '10%', animationDelay: '0s' }}>➕</span>
            <span className="floating-emoji" style={{ left: '30%', animationDelay: '0.5s' }}>🔢</span>
            <span className="floating-emoji" style={{ left: '70%', animationDelay: '1s' }}>➖</span>
            <span className="floating-emoji" style={{ left: '90%', animationDelay: '1.5s' }}>⭐</span>
          </div>
        </div>
      );
    }

    if (mathState === 'finished') {
      const emoji = score === ITEMS_PER_GAME ? '🏆' : score >= 7 ? '🌟' : score >= 5 ? '👍' : '💪';
      return (
        <div className="game-container finished-screen">
          <div className="content-card">
            <div className="celebration-emoji">{emoji}</div>
            <h1 className="congrats-title">Great Job!</h1>
            <p className="subtitle">You got {score} out of {ITEMS_PER_GAME} right!</p>
            <div className="spacebar-prompt">
              <div className="spacebar-key" onClick={startMath}>SPACE</div>
              <p>Press Space to Play Again</p>
            </div>
            <button className="back-btn" onClick={() => setGameMode('menu')}>Back to Menu</button>
          </div>
          <div className="decorations">
            <span className="floating-emoji" style={{ left: '5%', animationDelay: '0s' }}>🌟</span>
            <span className="floating-emoji" style={{ left: '20%', animationDelay: '0.3s' }}>⭐</span>
            <span className="floating-emoji" style={{ left: '40%', animationDelay: '0.6s' }}>🎈</span>
            <span className="floating-emoji" style={{ left: '60%', animationDelay: '0.9s' }}>🎊</span>
            <span className="floating-emoji" style={{ left: '80%', animationDelay: '1.2s' }}>✨</span>
            <span className="floating-emoji" style={{ left: '95%', animationDelay: '1.5s' }}>🌟</span>
          </div>
        </div>
      );
    }

    // Math game screen (showing problem or answer)
    return (
      <div className="game-container math-game-screen">
        <div className="progress-bar">
          <div className="progress-fill math-fill" style={{ width: `${((mathIndex + 1) / ITEMS_PER_GAME) * 100}%` }} />
        </div>
        <div className="progress-text">{mathIndex + 1} of {ITEMS_PER_GAME}</div>

        <div className="content-card word-card">
          <div className="math-problem-display">{currentProblem?.display} = ?</div>

          {mathState === 'showing-problem' && (
            <div className="math-input-area">
              <input
                ref={inputRef}
                type="number"
                className="math-input"
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                placeholder="?"
                autoFocus
              />
              <div className="spacebar-prompt small">
                <div className="spacebar-key small" onClick={submitMathAnswer}>ENTER</div>
                <p>Type your answer, then press Enter</p>
              </div>
            </div>
          )}

          {mathState === 'showing-answer' && (
            <div className="math-result">
              <div className={`result-badge ${wasCorrect ? 'correct' : 'incorrect'}`}>
                <span className="result-emoji">{wasCorrect ? '✅' : '❌'}</span>
                <span className="result-text">{wasCorrect ? 'Correct!' : 'Not quite!'}</span>
              </div>
              {!wasCorrect && (
                <div className="correct-answer">
                  {currentProblem?.display} = <strong>{currentProblem?.answer}</strong>
                </div>
              )}
              <div className="spacebar-prompt small">
                <div className="spacebar-key small" onClick={nextMathProblem}>SPACE</div>
                <p>{mathIndex < ITEMS_PER_GAME - 1 ? 'Press Space for next problem' : 'Press Space to see your score'}</p>
              </div>
            </div>
          )}
        </div>

        <div className="math-score-display">
          Score: {score}
        </div>
      </div>
    );
  }

  return null;
}

export default App;
